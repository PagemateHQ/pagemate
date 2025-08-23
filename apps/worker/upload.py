import argparse
import os
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional


def utc_now():
    return datetime.now(timezone.utc)


def resolve_mongo_from_env(
    url: Optional[str],
    db_name: Optional[str],
    docs_col: Optional[str],
    embs_col: Optional[str],
):
    resolved_url = url or os.getenv("MONGO_URL")
    if not resolved_url:
        print("ERROR: MONGO_URL is required (pass --mongo-url or set env).", file=sys.stderr)
        sys.exit(1)

    resolved_db = db_name or os.getenv("MONGO_DB") or "pagemate"
    resolved_docs = docs_col or os.getenv("MONGO_DOCUMENTS_COLLECTION") or "documents"
    resolved_embs = (
        embs_col
        or os.getenv("MONGO_COLLECTION")
        or os.getenv("MONGO_EMBEDDINGS_COLLECTION")
        or "document_embeddings"
    )
    return resolved_url, resolved_db, resolved_docs, resolved_embs


def try_read_text_preview(file_path: Path, max_bytes: int = 20000) -> Optional[str]:
    try:
        size = file_path.stat().st_size
        if size == 0:
            return None
        with file_path.open("rb") as f:
            buf = f.read(max_bytes)
        text = buf.decode("utf-8", errors="ignore").strip()
        return text or None
    except Exception:
        return None


def main(argv: Optional[list[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Upload a file and create DB records")
    parser.add_argument("tenant_id", help="Tenant ID owning this upload")
    parser.add_argument("file", help="Path to the local file to upload")
    parser.add_argument(
        "--name",
        dest="name",
        help="Display name for the document (defaults to source filename)",
    )
    parser.add_argument(
        "--storage-root",
        dest="storage_root",
        default=os.getenv("STORAGE_ROOT", "storage"),
        help="Root directory for object storage (default: 'storage')",
    )
    parser.add_argument("--mongo-url", dest="mongo_url", help="Mongo connection URI")
    parser.add_argument("--mongo-db", dest="mongo_db", help="Mongo database name")
    parser.add_argument(
        "--documents-collection",
        dest="docs_col",
        help="Mongo documents collection name (default: documents)",
    )
    parser.add_argument(
        "--embeddings-collection",
        dest="embs_col",
        help="Mongo embeddings collection name (default: document_embeddings)",
    )

    args = parser.parse_args(argv)

    src_path = Path(args.file).expanduser().resolve()
    if not src_path.exists() or not src_path.is_file():
        print(f"ERROR: File not found: {src_path}", file=sys.stderr)
        return 2

    # Resolve Mongo and connect
    mongo_url, db_name, docs_collection, embs_collection = resolve_mongo_from_env(
        args.mongo_url, args.mongo_db, args.docs_col, args.embs_col
    )
    try:
        from pymongo import MongoClient
    except Exception as e:
        print("ERROR: pymongo is required to use this script.", file=sys.stderr)
        raise

    client = MongoClient(mongo_url, tz_aware=True)
    db = client[db_name]
    documents_col = db[docs_collection]
    embeddings_col = db[embs_collection]

    # IDs and naming
    document_id = uuid.uuid4().hex
    embedding_id = uuid.uuid4().hex
    base_name = args.name or src_path.name

    # Destination path in local object storage
    dest_path = Path(args.storage_root) / args.tenant_id / document_id / base_name
    dest_path.parent.mkdir(parents=True, exist_ok=True)

    data = src_path.read_bytes()
    with dest_path.open("wb") as f:
        f.write(data)

    # Insert document record
    doc_payload = {
        "_id": document_id,
        "tenant_id": args.tenant_id,
        "name": base_name,
        "object_path": str(dest_path),
        "size": len(data),
        "createdAt": utc_now(),
        "updatedAt": utc_now(),
    }
    documents_col.insert_one(doc_payload)

    # Insert embedding task (pending)
    emb_payload = {
        "_id": embedding_id,
        "document_id": document_id,
        "status": "pending",
        "createdAt": utc_now(),
        "updatedAt": utc_now(),
    }
    text_preview = try_read_text_preview(src_path)
    if text_preview:
        emb_payload["text"] = text_preview
    embeddings_col.insert_one(emb_payload)

    print("Upload completed:")
    print(f"- document_id: {document_id}")
    print(f"- embedding_id: {embedding_id}")
    print(f"- object_path: {dest_path}")
    print(f"- size: {len(data)} bytes")
    print(f"- tenant_id: {args.tenant_id}")
    print("- embedding_text: present" if text_preview else "- embedding_text: none")

    try:
        client.close()
    except Exception:
        pass
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
