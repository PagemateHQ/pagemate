import argparse
import os
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Tuple


def utc_now():
    return datetime.now(timezone.utc)


def resolve_mongo_from_env(
    url: Optional[str],
    db_name: Optional[str],
    docs_col: Optional[str],
    embs_col: Optional[str],
    tenants_col: Optional[str],
) -> Tuple[str, str, str, str, str]:
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
    resolved_tenants = tenants_col or os.getenv("MONGO_TENANTS_COLLECTION") or "tenants"
    return resolved_url, resolved_db, resolved_docs, resolved_embs, resolved_tenants


def slugify(name: str) -> str:
    keep = [c.lower() if c.isalnum() else "-" for c in name.strip()]
    s = "".join(keep)
    while "--" in s:
        s = s.replace("--", "-")
    return s.strip("-")


def ensure_tenant(col, name: str) -> str:
    _id = slugify(name)
    col.update_one({"_id": _id}, {"$set": {"name": name}}, upsert=True)
    return _id


def download_bytes(url: str, timeout: int = 60) -> bytes:
    import urllib.request

    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; pagemate-init/0.1)",
            "Accept": "*/*",
        },
        method="GET",
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


def filename_from_url(url: str) -> str:
    from urllib.parse import urlparse
    import posixpath

    p = urlparse(url)
    name = posixpath.basename(p.path) or "downloaded-file"
    return name


def write_to_storage(root: Path, tenant_id: str, document_id: str, filename: str, data: bytes) -> Path:
    dest = root / tenant_id / document_id / filename
    dest.parent.mkdir(parents=True, exist_ok=True)
    with dest.open("wb") as f:
        f.write(data)
    return dest


def seed(db, storage_root: Path) -> None:
    tenants_col = db[os.getenv("MONGO_TENANTS_COLLECTION", "tenants")]
    documents_col = db[os.getenv("MONGO_DOCUMENTS_COLLECTION", "documents")]
    embeddings_col = db[
        os.getenv("MONGO_COLLECTION", os.getenv("MONGO_EMBEDDINGS_COLLECTION", "document_embeddings"))
    ]

    tenants_docs: Dict[str, List[str]] = {
        "Apple": [
            "https://developer.apple.com/bonjour/printing-specification/bonjourprinting-1.2.1.pdf",
            "https://developer.apple.com/streaming/GettingStartedWithHLSInterstitials.pdf",
            "https://developer.apple.com/support/downloads/terms/app-review-guidelines/App-Review-Guidelines-20250609-English-UK.pdf",
            "https://www.apple.com/newsroom/pdfs/2024-US-Apple-Ecosystem-Report.pdf",
        ],
        "Google": [
            "https://static.googleusercontent.com/media/research.google.com/en//pubs/archive/44876.pdf",
            "https://services.google.com/fh/files/misc/gemini-for-google-workspace-prompting-guide-101.pdf",
            "https://services.google.com/fh/files/misc/google_ai_literacy_skills_training_for_education.pdf",
        ],
        "Microsoft": [
            "https://designer.microsoft.com/imageCreatorDesignerTermsOfUse.pdf",
            "https://designer.microsoft.com/FAQ.pdf",
        ],
    }

    for tenant_name, urls in tenants_docs.items():
        tenant_id = ensure_tenant(tenants_col, tenant_name)
        print(f"Ensured tenant '{tenant_name}' (_id='{tenant_id}')")
        for url in urls:
            try:
                print(f"- Downloading {url}")
                data = download_bytes(url)
                filename = filename_from_url(url)
                document_id = uuid.uuid4().hex
                dest = write_to_storage(storage_root, tenant_id, document_id, filename, data)
                # Insert doc + embedding (use the dest we just wrote)
                # Keeping document_id used in path consistent with record id makes it easier to reason.
                # So we pass size and the actual object path.
                now = utc_now()
                doc_payload = {
                    "_id": document_id,
                    "tenant_id": tenant_id,
                    "name": filename,
                    "object_path": str(dest),
                    "size": len(data),
                    "createdAt": now,
                    "updatedAt": now,
                }
                documents_col.insert_one(doc_payload)
                emb_id = uuid.uuid4().hex
                embeddings_col.insert_one(
                    {
                        "_id": emb_id,
                        "document_id": document_id,
                        "status": "pending",
                        "createdAt": now,
                        "updatedAt": now,
                    }
                )
                print(
                    f"  Added document _id={document_id} ({len(data)} bytes), embedding _id={emb_id}"
                )
            except Exception as e:
                print(f"  Failed to add from {url}: {e}", file=sys.stderr)


def main(argv: Optional[list[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Seed tenants and sample documents")
    parser.add_argument(
        "--mongo-url",
        dest="mongo_url",
        help="Mongo connection URI (or set MONGO_URL)",
    )
    parser.add_argument("--mongo-db", dest="mongo_db", help="Mongo database name")
    parser.add_argument(
        "--documents-collection",
        dest="docs_col",
        help="Documents collection name (default: documents)",
    )
    parser.add_argument(
        "--embeddings-collection",
        dest="embs_col",
        help="Embeddings collection name (default: document_embeddings)",
    )
    parser.add_argument(
        "--tenants-collection",
        dest="tenants_col",
        help="Tenants collection name (default: tenants)",
    )
    parser.add_argument(
        "--storage-root",
        dest="storage_root",
        default=os.getenv("STORAGE_ROOT", "storage"),
        help="Root directory for object storage (default: storage)",
    )

    args = parser.parse_args(argv)

    # Resolve Mongo params
    mongo_url, db_name, _, _, _ = resolve_mongo_from_env(
        args.mongo_url, args.mongo_db, args.docs_col, args.embs_col, args.tenants_col
    )

    # Connect to Mongo
    from pymongo import MongoClient

    client = MongoClient(mongo_url, tz_aware=True)
    db = client[db_name]

    storage_root = Path(args.storage_root).expanduser().resolve()
    storage_root.mkdir(parents=True, exist_ok=True)

    seed(db, storage_root)

    try:
        client.close()
    except Exception:
        pass
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
