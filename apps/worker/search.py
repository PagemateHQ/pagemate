import argparse
import math
import os
import sys
from typing import Any, Dict, Iterable, List, Optional, Tuple

from pymongo import MongoClient
from openai import OpenAI
import dotenv

dotenv.load_dotenv()

def l2_norm(vec: List[float]) -> float:
    return math.sqrt(sum(v * v for v in vec))


def cosine_sim(a: List[float], b: List[float]) -> float:
    if len(a) != len(b):
        return float("nan")
    dot = 0.0
    for x, y in zip(a, b):
        dot += x * y
    na = l2_norm(a)
    nb = l2_norm(b)
    if na == 0 or nb == 0:
        return float("nan")
    return dot / (na * nb)


def get_db(mongo_url: str, db_name: Optional[str]) -> Tuple[MongoClient, Any]:
    client = MongoClient(mongo_url, tz_aware=True)
    db = client[db_name] if db_name else client.get_default_database()
    return client, db


def embed_query(query: str, model: str, base_url: Optional[str]) -> List[float]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("ERROR: OPENAI_API_KEY is required.", file=sys.stderr)
        sys.exit(1)
    if base_url is None:
        # Mirror worker default to Upstage if unset
        base_url = os.getenv("OPENAI_BASE_URL") or "https://api.upstage.ai/v1"
    client = OpenAI(api_key=api_key, base_url=base_url)
    resp = client.embeddings.create(model=model, input=query)
    return resp.data[0].embedding  # type: ignore[attr-defined]


def top_k_cosine(
    cursor: Iterable[Dict[str, Any]],
    qvec: List[float],
    k: int,
) -> List[Tuple[float, Dict[str, Any]]]:
    # Maintain simple list then partial sort for small k
    scored: List[Tuple[float, Dict[str, Any]]] = []
    for doc in cursor:
        vec = doc.get("embedding")
        if not isinstance(vec, list) or not vec:
            continue
        try:
            score = cosine_sim(qvec, [float(x) for x in vec])
        except Exception:
            continue
        if math.isnan(score):
            continue
        scored.append((score, doc))
    scored.sort(key=lambda x: x[0], reverse=True)
    return scored[:k]


def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Semantic search over document_chunks (cosine)")
    parser.add_argument("query", help="Query text to embed and search")
    parser.add_argument("--limit", type=int, default=10, help="Number of results (default: 10)")
    parser.add_argument("--tenant", dest="tenant_id", help="Filter by tenant_id")
    parser.add_argument("--document-id", dest="document_id", help="Filter by document_id")
    parser.add_argument(
        "--mongo-url",
        dest="mongo_url",
        default=os.getenv("MONGO_URL"),
        help="Mongo connection URI (env MONGO_URL)",
    )
    parser.add_argument(
        "--mongo-db",
        dest="mongo_db",
        default=os.getenv("MONGO_DB"),
        help="Mongo database name (env MONGO_DB)",
    )
    parser.add_argument(
        "--chunks-collection",
        dest="chunks_col_name",
        default=os.getenv("MONGO_CHUNKS_COLLECTION", "document_chunks"),
        help="Chunks collection name (default: document_chunks)",
    )
    parser.add_argument(
        "--model",
        dest="model",
        default=os.getenv("EMBEDDING_MODEL", "solar-embedding-1-large-query"),
        help="Embedding model (default: env EMBEDDING_MODEL or solar-embedding-1-large-query)",
    )
    parser.add_argument(
        "--base-url",
        dest="base_url",
        default=os.getenv("OPENAI_BASE_URL"),
        help="Embedding API base URL (default: env OPENAI_BASE_URL or Upstage)",
    )
    parser.add_argument(
        "--format",
        dest="output_format",
        choices=["text", "json"],
        default="text",
        help="Output format (text|json)",
    )

    args = parser.parse_args(argv)

    if not args.mongo_url:
        print("ERROR: MONGO_URL is required (flag --mongo-url or env MONGO_URL).", file=sys.stderr)
        return 2

    # Embed query
    qvec = embed_query(args.query, args.model, args.base_url)

    # DB connect
    client, db = get_db(args.mongo_url, args.mongo_db)
    chunks_col = db[args.chunks_col_name]

    filt: Dict[str, Any] = {}
    if args.tenant_id:
        filt["tenant_id"] = args.tenant_id
    if args.document_id:
        filt["document_id"] = args.document_id

    projection = {
        "_id": 1,
        "document_id": 1,
        "tenant_id": 1,
        "index": 1,
        "text": 1,
        "embedding": 1,
        "char_start": 1,
        "char_end": 1,
    }

    cursor = chunks_col.find(filt, projection=projection)
    results = top_k_cosine(cursor, qvec, args.limit)

    if args.output_format == "json":
        import json

        payload = [
            {
                "score": round(score, 6),
                "_id": doc.get("_id"),
                "tenant_id": doc.get("tenant_id"),
                "document_id": doc.get("document_id"),
                "index": doc.get("index"),
                "char_start": doc.get("char_start"),
                "char_end": doc.get("char_end"),
                "text": doc.get("text"),
            }
            for score, doc in results
        ]
        print(json.dumps(payload, ensure_ascii=False, indent=2))
    else:
        for rank, (score, doc) in enumerate(results, start=1):
            line = (
                f"#{rank} score={score:.4f} doc={doc.get('document_id')} chunk={doc.get('index')}"
            )
            print(line)
            text = str(doc.get("text", ""))
            if text:
                preview = text.replace("\n", " ")
                if len(preview) > 220:
                    preview = preview[:217] + "..."
                print(f"  {preview}")

    try:
        client.close()
    except Exception:
        pass
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

