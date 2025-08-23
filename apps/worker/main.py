import os
import sys
import time
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from pymongo import MongoClient, ReturnDocument
from pymongo.errors import PyMongoError
from openai import OpenAI
from dotenv import load_dotenv
from pathlib import Path


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def get_db() -> tuple[MongoClient, Any, Any]:
    mongo_url = os.getenv("MONGO_URL")
    if not mongo_url:
        print("ERROR: MONGO_URL is required in environment.", file=sys.stderr)
        sys.exit(1)

    client = MongoClient(mongo_url, tz_aware=True)

    # Resolve database
    db_name = os.getenv("MONGO_DB")
    if db_name:
        db = client[db_name]
    else:
        try:
            db = client.get_default_database()
        except Exception:
            db = client["pagemate"]

    # Resolve embeddings collection
    collection_name = os.getenv(
        "MONGO_COLLECTION",
        os.getenv("MONGO_EMBEDDINGS_COLLECTION", "document_embeddings"),
    )
    col = db[collection_name]
    return client, db, col


def get_documents_collection(db: Any):
    return db[os.getenv("MONGO_DOCUMENTS_COLLECTION", "documents")]


def claim_pending(emb_col) -> Optional[Dict[str, Any]]:
    try:
        doc = emb_col.find_one_and_update(
            {"status": "pending"},
            {"$set": {"status": "processing", "startedAt": utc_now()}},
            return_document=ReturnDocument.AFTER,
        )
        return doc
    except PyMongoError as e:
        print(f"Mongo error while claiming: {e}", file=sys.stderr)
        return None


def read_dotted(obj: Dict[str, Any], dotted: str) -> Optional[Any]:
    cur: Any = obj
    for part in dotted.split("."):
        if isinstance(cur, dict) and part in cur:
            cur = cur[part]
        else:
            return None
    return cur


def extract_text_for_embedding(emb_doc: Dict[str, Any], documents_col) -> str:
    # Preferred: explicit field on embedding doc (configurable)
    preferred_field = os.getenv("EMBEDDING_TEXT_FIELD")
    if preferred_field:
        val = read_dotted(emb_doc, preferred_field)
        if isinstance(val, str) and val.strip():
            return val

    # Common fallbacks on embedding doc
    for key in ("text", "content", "input"):
        v = emb_doc.get(key)
        if isinstance(v, str) and v.strip():
            return v

    # Optional: fallback to the related document name
    if os.getenv("FALLBACK_TO_DOCUMENT_NAME", "false").lower() in (
        "1",
        "true",
        "yes",
        "y",
    ):
        doc_id = emb_doc.get("document_id")
        if doc_id:
            src = documents_col.find_one({"_id": doc_id}, projection={"name": 1})
            if src and isinstance(src.get("name"), str) and src["name"].strip():
                return src["name"]

    raise ValueError("No text available for embedding")


def process_embedding(
    emb_col, documents_col, emb_doc: Dict[str, Any], client: OpenAI, model: str
) -> None:
    emb_id = emb_doc.get("_id")
    try:
        text = extract_text_for_embedding(emb_doc, documents_col)
    except Exception as e:
        print(f"Embedding {emb_id}: invalid payload: {e}", file=sys.stderr)
        try:
            emb_col.update_one(
                {"_id": emb_id},
                {"$set": {"status": "failed", "error": str(e), "failedAt": utc_now()}},
            )
        except Exception:
            pass
        return

    try:
        resp = client.embeddings.create(model=model, input=text)
        embedding = resp.data[0].embedding  # type: ignore[attr-defined]
        emb_col.update_one(
            {"_id": emb_id},
            {
                "$set": {
                    "status": "completed",
                    "embedding": embedding,
                    "completedAt": utc_now(),
                }
            },
        )
        print(f"Completed embedding {_short_id(emb_id)} (dim={len(embedding)})")
    except Exception as e:
        print(f"Embedding {emb_id} failed: {e}", file=sys.stderr)
        try:
            emb_col.update_one(
                {"_id": emb_id},
                {
                    "$set": {
                        "status": "failed",
                        "error": f"{type(e).__name__}: {e}",
                        "failedAt": utc_now(),
                    }
                },
            )
        except Exception:
            pass


def _short_id(val: Any) -> str:
    s = str(val)
    return s if len(s) <= 8 else s[:6] + "…" + s[-2:]


def main() -> None:
    # Load environment variables from the .env file next to this app (does not override existing)
    load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

    # Config
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        print("ERROR: OPENAI_API_KEY is required in environment.", file=sys.stderr)
        sys.exit(1)

    embedding_model = os.getenv("EMBEDDING_MODEL", "solar-embedding-1-large-query")
    drain_backlog = os.getenv("DRAIN_BACKLOG_ON_STARTUP", "true").lower() in (
        "1",
        "true",
        "yes",
        "y",
    )
    max_await_ms = int(os.getenv("WATCH_MAX_AWAIT_MS", "5000"))

    # Clients
    client, db, emb_col = get_db()
    documents_col = get_documents_collection(db)
    oa_client = OpenAI(api_key=openai_api_key)

    print(
        f"Worker started: watching '{emb_col.name}' for pending embeddings; model={embedding_model}"
    )

    # Optional: drain any existing backlog before watching
    if drain_backlog:
        while True:
            emb = claim_pending(emb_col)
            if not emb:
                break
            process_embedding(emb_col, documents_col, emb, oa_client, embedding_model)

    # Change stream watch for new/updated pending tasks
    pipeline = [
        {"$match": {"operationType": {"$in": ["insert", "update", "replace"]}}},
        {
            "$match": {
                "$or": [
                    {"fullDocument.status": "pending"},
                    {"updateDescription.updatedFields.status": "pending"},
                ]
            }
        },
    ]

    while True:
        try:
            with emb_col.watch(
                pipeline=pipeline,
                full_document="updateLookup",
                max_await_time_ms=max_await_ms,
            ) as stream:
                for change in stream:
                    full = change.get("fullDocument") or {}
                    emb_id = full.get("_id") or change.get("documentKey", {}).get("_id")
                    if emb_id is None:
                        continue
                    # Atomic claim: only proceed if still pending
                    claimed = emb_col.find_one_and_update(
                        {"_id": emb_id, "status": "pending"},
                        {"$set": {"status": "processing", "startedAt": utc_now()}},
                        return_document=ReturnDocument.AFTER,
                    )
                    if not claimed:
                        continue
                    process_embedding(
                        emb_col, documents_col, claimed, oa_client, embedding_model
                    )
        except Exception as e:
            print(f"Change stream error: {e}. Reconnecting shortly…", file=sys.stderr)
            time.sleep(1.5)


if __name__ == "__main__":
    main()
