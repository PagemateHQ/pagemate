import os
import sys
import time
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, Optional, List, Tuple

from pymongo import MongoClient, ReturnDocument
from pymongo.errors import PyMongoError
from openai import OpenAI
from pathlib import Path

import dotenv

dotenv.load_dotenv()

def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def get_db() -> tuple[MongoClient, Any, Any]:
    mongo_url = os.getenv("MONGO_URL")
    if not mongo_url:
        print("ERROR: MONGO_URL is required in environment.", file=sys.stderr)
        sys.exit(1)

    client = MongoClient(mongo_url, tz_aware=True)

    db_name = os.getenv("MONGO_DB")
    if db_name:
        db = client[db_name]
    else:
        try:
            db = client.get_default_database()
        except Exception:
            db = client["pagemate"]

    collection_name = os.getenv(
        "MONGO_COLLECTION",
        os.getenv("MONGO_EMBEDDINGS_COLLECTION", "document_embeddings"),
    )
    col = db[collection_name]
    return client, db, col


def get_documents_collection(db: Any):
    return db[os.getenv("MONGO_DOCUMENTS_COLLECTION", "documents")]


def get_chunks_collection(db: Any):
    return db[os.getenv("MONGO_CHUNKS_COLLECTION", "document_chunks")]


def claim_pending(emb_col) -> Optional[Dict[str, Any]]:
    try:
        now = utc_now()
        doc = emb_col.find_one_and_update(
            {"status": "pending"},
            {"$set": {"status": "processing", "startedAt": now, "updatedAt": now}},
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
    preferred_field = os.getenv("EMBEDDING_TEXT_FIELD")
    if preferred_field:
        val = read_dotted(emb_doc, preferred_field)
        if isinstance(val, str) and val.strip():
            return val

    for key in ("text", "content", "input"):
        v = emb_doc.get(key)
        if isinstance(v, str) and v.strip():
            return v

    # Attempt to extract from the source document if it's a PDF
    doc_id = emb_doc.get("document_id")
    if doc_id is not None:
        text = try_extract_text_from_pdf(documents_col, doc_id)
        if isinstance(text, str) and text.strip():
            return text

    raise ValueError("No text available for embedding")


def try_extract_text_from_pdf(documents_col, doc_id: Any) -> Optional[str]:
    enable = os.getenv("PDF_EXTRACT_ENABLE", "true").lower() in ("1", "true", "yes", "y")
    if not enable:
        return None

    src = documents_col.find_one({"_id": doc_id}, projection={"object_path": 1, "name": 1})
    if not src:
        return None
    obj_path = src.get("object_path")
    name = str(src.get("name", ""))
    if not isinstance(obj_path, str) or not obj_path:
        return None

    path = Path(obj_path)
    if not path.exists() or not path.is_file():
        return None

    ext = path.suffix.lower() or ("." + name.rsplit(".", 1)[-1].lower() if "." in name else "")
    if ext != ".pdf":
        return None
    try:
        return extract_text_from_pdf(path)
    except Exception as e:
        print(f"PDF extraction failed for {path}: {e}", file=sys.stderr)
        return None


def extract_text_from_pdf(path: Path) -> str:
    try:
        from pypdf import PdfReader  # type: ignore
    except Exception as e:
        raise RuntimeError(
            "pypdf is required for PDF extraction. Install in worker env: `uv add pypdf`"
        ) from e

    max_pages = int(os.getenv("PDF_EXTRACT_MAX_PAGES", "30"))
    max_chars = int(os.getenv("PDF_EXTRACT_MAX_CHARS", "50000"))

    reader = PdfReader(str(path))
    out: list[str] = []
    cur = 0
    for i, page in enumerate(getattr(reader, "pages", [])):
        if i >= max_pages:
            break
        try:
            txt = page.extract_text() or ""
        except Exception:
            txt = ""
        if txt:
            out.append(txt)
            cur += len(txt)
            if cur >= max_chars:
                break
    content = "\n\n".join(out).strip()
    content = "\n".join(line.strip() for line in content.splitlines())
    return content


def compute_next_retry(now: datetime, attempts: int) -> datetime:
    """Exponential backoff with caps for retry scheduling.
    attempts is the number of failures so far (1 for first failure).
    """
    base = int(os.getenv("RETRY_FAILED_BASE_DELAY_SECONDS", "30"))
    max_delay = int(os.getenv("RETRY_FAILED_MAX_DELAY_SECONDS", "900"))
    # attempts >= 1 → base * 2^(attempts-1)
    delay = base * (2 ** max(0, attempts - 1))
    delay = min(delay, max_delay)
    return now + timedelta(seconds=delay)


def requeue_one_failed(emb_col) -> bool:
    """Requeue a single failed embedding if eligible (max attempts and time window).

    Returns True if a document was requeued, False otherwise.
    """
    if os.getenv("RETRY_FAILED_ENABLE", "true").lower() not in ("1", "true", "yes", "y"):
        return False

    max_attempts = int(os.getenv("RETRY_FAILED_MAX_ATTEMPTS", "3"))
    now = utc_now()
    filt = {
        "status": "failed",
        "$and": [
            {"$or": [{"attempts": {"$exists": False}}, {"attempts": {"$lt": max_attempts}}]},
            {"$or": [{"nextRetryAt": {"$exists": False}}, {"nextRetryAt": {"$lte": now}}]},
        ],
    }
    try:
        doc = emb_col.find_one_and_update(
            filt,
            {"$set": {"status": "pending", "updatedAt": now}},
            return_document=ReturnDocument.AFTER,
        )
        return doc is not None
    except Exception as e:
        print(f"Requeue failed error: {e}", file=sys.stderr)
        return False


def _chunk_text(
    text: str, max_chars: int = 1200, overlap: int = 200
) -> List[Tuple[str, int, int]]:
    max_chars = max(1, max_chars)
    overlap = max(0, min(overlap, max_chars - 1))

    chunks: List[Tuple[str, int, int]] = []
    n = len(text)
    start = 0
    while start < n:
        end = min(n, start + max_chars)
        piece = text[start:end]
        if piece.strip():
            chunks.append((piece, start, end))
        if end >= n:
            break
        start = end - overlap
        if start < 0:
            start = 0
        if start >= n:
            break
    return chunks


def _embed_batch(client: OpenAI, model: str, texts: List[str]) -> List[List[float]]:
    if not texts:
        return []
    resp = client.embeddings.create(model=model, input=texts)
    # Ensure order preserved
    return [item.embedding for item in resp.data]  # type: ignore[attr-defined]


def create_chunks_for_document(
    documents_col,
    emb_col,
    emb_doc: Dict[str, Any],
    full_text: str,
    client: OpenAI,
    model: str,
) -> None:
    doc_id = emb_doc.get("document_id")
    if not doc_id:
        return
    # Fetch tenant id
    doc = documents_col.find_one({"_id": doc_id}, projection={"tenant_id": 1})
    if not doc or "tenant_id" not in doc:
        return
    tenant_id = doc["tenant_id"]

    chunks_col = get_chunks_collection(documents_col.database)
    # Remove existing chunks for idempotency
    chunks_col.delete_many({"document_id": doc_id})

    pieces = _chunk_text(full_text)
    if not pieces:
        return

    texts = [p[0] for p in pieces]
    vecs = _embed_batch(client, model, texts)
    now = utc_now()
    docs = []
    for idx, ((txt, start, end), vec) in enumerate(zip(pieces, vecs)):
        docs.append(
            {
                "_id": f"{doc_id}:{idx}",
                "document_id": doc_id,
                "tenant_id": tenant_id,
                "index": idx,
                "text": txt,
                "embedding": vec,
                "char_start": start,
                "char_end": end,
                "createdAt": now,
                "updatedAt": now,
            }
        )
    if docs:
        chunks_col.insert_many(docs)


def process_embedding(
    emb_col, documents_col, emb_doc: Dict[str, Any], client: OpenAI, model: str
) -> None:
    emb_id = emb_doc.get("_id")
    try:
        text = extract_text_for_embedding(emb_doc, documents_col)
        # Optionally persist the resolved text onto the embedding document (truncated)
        if os.getenv("EMBEDDING_SAVE_TEXT", "false").lower() in ("1", "true", "yes", "y"):
            try:
                max_save = int(os.getenv("EMBEDDING_MAX_TEXT_SAVE_CHARS", "4000"))
                save_text = text[:max_save]
                emb_col.update_one(
                    {"_id": emb_id},
                    {"$set": {"text": save_text, "updatedAt": utc_now()}},
                )
            except Exception:
                pass
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
        # Compute document-level embedding
        resp = client.embeddings.create(model=model, input=text)
        embedding = resp.data[0].embedding  # type: ignore[attr-defined]

        # Optionally create chunk embeddings for similarity search
        try:
            if os.getenv("CHUNK_ENABLE", "true").lower() in ("1", "true", "yes", "y"):
                create_chunks_for_document(
                    documents_col=documents_col,
                    emb_col=emb_col,
                    emb_doc=emb_doc,
                    full_text=text,
                    client=client,
                    model=model,
                )
        except Exception as ce:
            print(f"Chunking failed for doc {emb_doc.get('document_id')}: {ce}", file=sys.stderr)

        emb_col.update_one(
            {"_id": emb_id},
            {
                "$set": {
                    "status": "completed",
                    "embedding": embedding,
                    "completedAt": utc_now(),
                    "updatedAt": utc_now(),
                }
            },
        )
        print(f"Completed embedding {_short_id(emb_id)} (dim={len(embedding)})")
    except Exception as e:
        print(f"Embedding {emb_id} failed: {e}", file=sys.stderr)
        try:
            attempts_prev = int(emb_doc.get("attempts", 0) or 0)
            attempts = attempts_prev + 1
            next_retry = compute_next_retry(utc_now(), attempts)
            emb_col.update_one(
                {"_id": emb_id},
                {
                    "$set": {
                        "status": "failed",
                        "error": f"{type(e).__name__}: {e}",
                        "failedAt": utc_now(),
                        "updatedAt": utc_now(),
                        "attempts": attempts,
                        "nextRetryAt": next_retry,
                    }
                },
            )
        except Exception:
            pass


def _short_id(val: Any) -> str:
    s = str(val)
    return s if len(s) <= 8 else s[:6] + "…" + s[-2:]


def main() -> None:
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        print("ERROR: OPENAI_API_KEY is required in environment.", file=sys.stderr)
        sys.exit(1)
    embedding_model = os.getenv("EMBEDDING_MODEL", "solar-embedding-1-large-query")
    poll_interval = float(os.getenv("POLL_INTERVAL", "1.0"))
    client, db, emb_col = get_db()
    documents_col = get_documents_collection(db)
    chunks_col = get_chunks_collection(db)
    oa_client = OpenAI(api_key=openai_api_key, base_url="https://api.upstage.ai/v1")

    print(f"Worker started: model={embedding_model}")

    def run_polling_loop():
        print(f"Polling for pending embeddings every {poll_interval}s…")
        while True:
            try:
                did_work = False
                while True:
                    emb = claim_pending(emb_col)
                    if not emb:
                        break
                    did_work = True
                    process_embedding(
                        emb_col, documents_col, emb, oa_client, embedding_model
                    )

                if not did_work:
                    # Attempt to requeue a failed task if eligible
                    if not requeue_one_failed(emb_col):
                        time.sleep(poll_interval)
            except KeyboardInterrupt:
                raise
            except Exception as e:
                print(f"Polling loop error: {e}", file=sys.stderr)
                time.sleep(1.0)
    run_polling_loop()


if __name__ == "__main__":
    main()
