import os
import sys
import time
import logging
from concurrent.futures import ThreadPoolExecutor, wait, FIRST_COMPLETED
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, Optional, List, Tuple

from pymongo import MongoClient, ReturnDocument
from pymongo.errors import PyMongoError
from openai import OpenAI
from pathlib import Path

import dotenv

dotenv.load_dotenv()


# Module-level logger (configured in setup_logging())
logger = logging.getLogger("worker")


def setup_logging() -> None:
    """Configure logging from environment.

    LOG_LEVEL: DEBUG|INFO|WARNING|ERROR (default: DEBUG)
    LOG_FORMAT: logging format string
    LOG_DATEFMT: logging datefmt
    """
    level_name = os.getenv("LOG_LEVEL", "DEBUG").upper()
    level = getattr(logging, level_name, logging.DEBUG)
    fmt = os.getenv(
        "LOG_FORMAT",
        "%(asctime)s %(levelname)s [%(threadName)s] %(name)s:%(lineno)d - %(message)s",
    )
    datefmt = os.getenv("LOG_DATEFMT", "%Y-%m-%dT%H:%M:%S%z")
    logging.basicConfig(level=level, format=fmt, datefmt=datefmt)
    # Ensure module logger follows level
    logger.setLevel(level)

def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def get_db() -> tuple[MongoClient, Any, Any]:
    mongo_url = os.getenv("MONGO_URL")
    if not mongo_url:
        logger.error("MONGO_URL is required in environment.")
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
    try:
        logger.info(
            "Connected to MongoDB: db='%s', embeddings_collection='%s'",
            getattr(db, "name", "<unknown>"),
            collection_name,
        )
    except Exception:
        pass
    return client, db, col


def get_documents_collection(db: Any):
    name = os.getenv("MONGO_DOCUMENTS_COLLECTION", "documents")
    logger.debug("Using documents collection: %s", name)
    return db[name]


def get_chunks_collection(db: Any):
    name = os.getenv("MONGO_CHUNKS_COLLECTION", "document_chunks")
    logger.debug("Using chunks collection: %s", name)
    return db[name]


def claim_pending(emb_col) -> Optional[Dict[str, Any]]:
    try:
        now = utc_now()
        doc = emb_col.find_one_and_update(
            {"status": "pending"},
            {"$set": {"status": "processing", "startedAt": now, "updatedAt": now}},
            return_document=ReturnDocument.AFTER,
        )
        if doc:
            logger.info("Claimed pending embedding: _id=%s", _short_id(doc.get("_id")))
        else:
            logger.debug("No pending embedding to claim")
        return doc
    except PyMongoError as e:
        logger.error("Mongo error while claiming: %s", e)
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
            logger.debug(
                "Text extracted from preferred field '%s' (len=%d)",
                preferred_field,
                len(val),
            )
            return val

    for key in ("text", "content", "input"):
        v = emb_doc.get(key)
        if isinstance(v, str) and v.strip():
            logger.debug("Text extracted from key '%s' (len=%d)", key, len(v))
            return v

    # Attempt to extract from the source document if it's a PDF
    doc_id = emb_doc.get("document_id")
    if doc_id is not None:
        logger.debug("Attempting PDF text extraction for document_id=%s", _short_id(doc_id))
        text = try_extract_text_from_pdf(documents_col, doc_id)
        if isinstance(text, str) and text.strip():
            logger.debug("PDF text extracted (len=%d) for document_id=%s", len(text), _short_id(doc_id))
            return text

    raise ValueError("No text available for embedding")


def try_extract_text_from_pdf(documents_col, doc_id: Any) -> Optional[str]:
    enable = os.getenv("PDF_EXTRACT_ENABLE", "true").lower() in ("1", "true", "yes", "y")
    if not enable:
        logger.debug("PDF extraction disabled via env")
        return None

    src = documents_col.find_one({"_id": doc_id}, projection={"object_path": 1, "name": 1})
    if not src:
        logger.warning("PDF extraction: source document not found: _id=%s", _short_id(doc_id))
        return None
    obj_path = src.get("object_path")
    name = str(src.get("name", ""))
    if not isinstance(obj_path, str) or not obj_path:
        logger.debug("PDF extraction: missing object_path for _id=%s", _short_id(doc_id))
        return None

    path = Path(obj_path)
    if not path.exists() or not path.is_file():
        logger.warning("PDF extraction: path not found %s for _id=%s", path, _short_id(doc_id))
        return None

    ext = path.suffix.lower() or ("." + name.rsplit(".", 1)[-1].lower() if "." in name else "")
    if ext != ".pdf":
        logger.debug("PDF extraction: unsupported extension '%s' for _id=%s", ext, _short_id(doc_id))
        return None
    try:
        logger.info("Extracting text from PDF: path=%s", path)
        return extract_text_from_pdf(path)
    except Exception as e:
        logger.error("PDF extraction failed for %s: %s", path, e)
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
    pages = getattr(reader, "pages", [])
    logger.debug(
        "PDF reader initialized: path=%s, total_pages=%d, max_pages=%d, max_chars=%d",
        path,
        len(pages) if hasattr(pages, "__len__") else -1,
        max_pages,
        max_chars,
    )
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
            logger.debug("PDF page %d extracted len=%d (cum=%d)", i, len(txt), cur)
            if cur >= max_chars:
                break
    content = "\n\n".join(out).strip()
    content = "\n".join(line.strip() for line in content.splitlines())
    logger.info("PDF extraction completed: chars=%d", len(content))
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
        if doc is not None:
            logger.info("Requeued failed embedding: _id=%s", _short_id(doc.get("_id")))
            return True
        logger.debug("No eligible failed embedding to requeue")
        return False
    except Exception as e:
        logger.error("Requeue failed error: %s", e)
        return False


def _words_with_spans(text: str) -> List[Tuple[str, int, int]]:
    """Split text into tokens and return (token, start, end) spans.
    Uses a simple regex to approximate tokens and positions.
    """
    import re

    spans: List[Tuple[str, int, int]] = []
    for m in re.finditer(r"\S+", text):
        s, e = m.span()
        spans.append((text[s:e], s, e))
    return spans


def _chunk_text_tokens(
    text: str,
    max_tokens: int = 750,
    overlap_tokens: int = 100,
) -> List[Tuple[str, int, int]]:
    """Chunk text by token count with token-span-derived char offsets.

    Returns list of tuples: (chunk_text, char_start, char_end)
    """
    max_tokens = max(1, max_tokens)
    overlap_tokens = max(0, min(overlap_tokens, max_tokens - 1))

    toks = _words_with_spans(text)
    if not toks:
        return []

    chunks: List[Tuple[str, int, int]] = []
    i = 0
    n = len(toks)
    logger.debug(
        "Chunking text: tokens=%d, max_tokens=%d, overlap_tokens=%d",
        n,
        max_tokens,
        overlap_tokens,
    )
    while i < n:
        j = min(n, i + max_tokens)
        token_slice = toks[i:j]
        start_char = token_slice[0][1]
        end_char = token_slice[-1][2]
        chunk_text = text[start_char:end_char]
        if chunk_text.strip():
            chunks.append((chunk_text, start_char, end_char))
        if j >= n:
            break
        i = j - overlap_tokens
        if i < 0:
            i = 0
    logger.info("Chunked text into %d chunk(s)", len(chunks))
    return chunks


def _embed_batch(client: OpenAI, model: str, texts: List[str]) -> List[List[float]]:
    if not texts:
        return []
    t0 = time.perf_counter()
    logger.info("Embedding batch: model=%s, size=%d", model, len(texts))
    resp = client.embeddings.create(model=model, input=texts)
    dt = time.perf_counter() - t0
    logger.info("Embedding batch completed: size=%d, took=%.3fs", len(texts), dt)
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
        logger.warning("Embedding missing document_id; skipping chunk creation for _id=%s", _short_id(emb_doc.get("_id")))
        return
    # Fetch tenant id
    doc = documents_col.find_one({"_id": doc_id}, projection={"tenant_id": 1})
    if not doc or "tenant_id" not in doc:
        logger.warning("No tenant_id found for document_id=%s; skipping chunks", _short_id(doc_id))
        return
    tenant_id = doc["tenant_id"]

    chunks_col = get_chunks_collection(documents_col.database)
    # Remove existing chunks for idempotency
    delete_res = chunks_col.delete_many({"document_id": doc_id})
    try:
        logger.debug("Deleted existing chunks for document_id=%s: count=%s", _short_id(doc_id), getattr(delete_res, "deleted_count", "?"))
    except Exception:
        pass

    # Prefer token-based chunking to respect embedding context limits
    pieces = _chunk_text_tokens(full_text)
    if not pieces:
        logger.warning("No chunk pieces generated for document_id=%s", _short_id(doc_id))
        return

    # Embed in batches to avoid large requests
    batch_size = int(os.getenv("CHUNK_EMBED_BATCH_SIZE", "16"))
    logger.info("Creating chunks: document_id=%s, total_pieces=%d, batch_size=%d", _short_id(doc_id), len(pieces), batch_size)
    now = utc_now()
    docs: List[Dict[str, Any]] = []
    idx_global = 0
    for bstart in range(0, len(pieces), batch_size):
        bend = min(len(pieces), bstart + batch_size)
        batch = pieces[bstart:bend]
        texts = [t[0] for t in batch]
        vecs = _embed_batch(client, model, texts)
        for (txt, start, end), vec in zip(batch, vecs):
            docs.append(
                {
                    "_id": f"{doc_id}:{idx_global}",
                    "document_id": doc_id,
                    "tenant_id": tenant_id,
                    "index": idx_global,
                    "text": txt,
                    "embedding": vec,
                    "char_start": start,
                    "char_end": end,
                    "createdAt": now,
                    "updatedAt": now,
                }
            )
            idx_global += 1

    if docs:
        insert_res = chunks_col.insert_many(docs)
        try:
            logger.info(
                "Inserted chunks: document_id=%s, count=%d",
                _short_id(doc_id),
                len(getattr(insert_res, "inserted_ids", []) or docs),
            )
        except Exception:
            pass


def process_embedding(
    emb_col, documents_col, emb_doc: Dict[str, Any], client: OpenAI, model: str
) -> None:
    emb_id = emb_doc.get("_id")
    logger.info("Processing embedding: _id=%s", _short_id(emb_id))
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
                logger.debug(
                    "Saved text snapshot to embedding _id=%s (len=%d)",
                    _short_id(emb_id),
                    len(save_text),
                )
            except Exception:
                pass
    except Exception as e:
        logger.error("Embedding %s: invalid payload: %s", _short_id(emb_id), e)
        try:
            emb_col.update_one(
                {"_id": emb_id},
                {"$set": {"status": "failed", "error": str(e), "failedAt": utc_now()}},
            )
        except Exception:
            pass
        return

    try:
        # Only chunk-level embeddings to avoid context limit errors
        if os.getenv("CHUNK_ENABLE", "true").lower() in ("1", "true", "yes", "y"):
            logger.debug("Chunking+embedding enabled for _id=%s", _short_id(emb_id))
            create_chunks_for_document(
                documents_col=documents_col,
                emb_col=emb_col,
                emb_doc=emb_doc,
                full_text=text,
                client=client,
                model=model,
            )

        # Mark task completed (document-level embedding is optional per schema)
        emb_col.update_one(
            {"_id": emb_id},
            {
                "$set": {
                    "status": "completed",
                    "completedAt": utc_now(),
                    "updatedAt": utc_now(),
                },
                "$unset": {"embedding": ""},
            },
        )
        logger.info("Completed embedding %s (chunked)", _short_id(emb_id))
    except Exception as e:
        logger.error("Embedding %s failed: %s", _short_id(emb_id), e)
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
            logger.warning(
                "Scheduled retry for _id=%s attempts=%d nextRetryAt=%s",
                _short_id(emb_id),
                attempts,
                next_retry.isoformat(),
            )
        except Exception:
            pass


def _short_id(val: Any) -> str:
    s = str(val)
    return s if len(s) <= 8 else s[:6] + "…" + s[-2:]


def main() -> None:
    setup_logging()
    logger.info("Worker starting (pid=%s)", os.getpid())
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        logger.error("OPENAI_API_KEY is required in environment.")
        sys.exit(1)
    embedding_model = os.getenv("EMBEDDING_MODEL", "solar-embedding-1-large-passage")
    poll_interval = float(os.getenv("POLL_INTERVAL", "1.0"))
    client, db, emb_col = get_db()
    documents_col = get_documents_collection(db)
    chunks_col = get_chunks_collection(db)
    oa_client = OpenAI(api_key=openai_api_key, base_url="https://api.upstage.ai/v1")

    logger.info(
        "Worker configured: model=%s, poll_interval=%.2fs, api_base=%s",
        embedding_model,
        poll_interval,
        "https://api.upstage.ai/v1",
    )
    concurrency = int(os.getenv("WORKER_CONCURRENCY", "8"))

    def run_polling_loop():
        logger.info(
            "Polling for pending embeddings every %.2fs with concurrency=%d",
            poll_interval,
            concurrency,
        )
        with ThreadPoolExecutor(max_workers=concurrency) as executor:
            inflight = set()
            while True:
                try:
                    # Fill the pool up to the concurrency limit
                    submitted = 0
                    while len(inflight) < concurrency:
                        emb = claim_pending(emb_col)
                        if not emb:
                            break
                        fut = executor.submit(
                            process_embedding,
                            emb_col,
                            documents_col,
                            emb,
                            oa_client,
                            embedding_model,
                        )
                        inflight.add(fut)
                        submitted += 1
                    if submitted:
                        logger.debug("Submitted %d task(s); inflight=%d", submitted, len(inflight))

                    if not inflight and submitted == 0:
                        # Attempt to requeue a failed task if eligible
                        if not requeue_one_failed(emb_col):
                            logger.debug("Idle: sleeping for %.2fs", poll_interval)
                            time.sleep(poll_interval)
                        continue

                    if inflight:
                        done, _ = wait(
                            inflight, timeout=poll_interval, return_when=FIRST_COMPLETED
                        )
                        # Drain completed futures
                        for f in done:
                            inflight.discard(f)
                            exc = f.exception()
                            if exc:
                                logger.error("Worker task error: %s: %s", type(exc).__name__, exc)
                        if done:
                            logger.debug("Completed %d future(s); inflight=%d", len(done), len(inflight))
                    else:
                        # No work in flight; small pause to avoid tight loop
                        logger.debug("No work in flight; sleeping for %.2fs", poll_interval)
                        time.sleep(poll_interval)
                except KeyboardInterrupt:
                    # Graceful shutdown
                    logger.warning("Received interrupt; shutting down workers…")
                    break
                except Exception as e:
                    logger.error("Polling loop error: %s", e)
                    time.sleep(10.0)
    run_polling_loop()


if __name__ == "__main__":
    main()
