from datetime import datetime, timezone
from typing import Any, Optional

from pagemate import clients
from pagemate.schema.document import Document, DocumentStatus, DocumentChunk


async def list_documents(offset: int = 0, limit: int = 20) -> list[Document]:
    """Returns a list of all documents with pagination."""
    documents_data = await clients.mongo.document.list_documents(
        offset=offset, limit=limit
    )
    return [Document(**data) for data in documents_data]


async def list_documents_by_tenant_id(
    tenant_id: str, offset: int = 0, limit: int = 20
) -> list[Document]:
    """Returns a list of documents for the given tenant_id with pagination."""
    documents_data = await clients.mongo.document.list_documents_by_tenant_id(
        tenant_id=tenant_id,
        offset=offset,
        limit=limit,
    )
    return [Document(**data) for data in documents_data]


async def get_document_by_id(document_id: str, *, tenant_id: str) -> Document | None:
    """Returns document information for the given document_id and tenant_id."""
    document_data = await clients.mongo.document.get_document_by_id(
        document_id=document_id, tenant_id=tenant_id
    )
    if document_data is None:
        return None
    return Document(**document_data)


async def get_document_status(
    document_id: str, *, tenant_id: str
) -> DocumentStatus | None:
    """Returns minimal status + chunk count for the given document."""
    document_data = await clients.mongo.document.get_document_by_id(
        document_id=document_id, tenant_id=tenant_id
    )
    if document_data is None:
        return None
    # Count chunks
    try:
        chunks_count = await clients.mongo.chunk.count_chunks_by_document_id(
            document_id
        )
    except Exception:
        chunks_count = 0
    payload = {**document_data, "chunks_count": chunks_count}
    return DocumentStatus(**payload)


async def create_document(
    name: str,
    object_path: str,
    size: int,
    *,
    tenant_id: str,
) -> Document:
    """Creates a new document and returns the Document model."""
    now = datetime.now(timezone.utc)
    document_data = {
        "name": name,
        "object_path": object_path,
        "size": size,
        "created_at": now,
        "updated_at": now,
        "embedding_status": "pending",
    }

    created_data = await clients.mongo.document.create_document(
        document_data=document_data, tenant_id=tenant_id
    )
    return Document(**created_data)


async def update_document(
    document_id: str,
    *,
    tenant_id: str,
    name: str | None = None,
) -> Document | None:
    """Updates document information and returns the updated Document model."""
    update_data: dict[str, Any] = {"updated_at": datetime.now(timezone.utc)}

    if name is not None:
        update_data["name"] = name

    updated_data = await clients.mongo.document.update_document(
        document_id=document_id,
        update_data=update_data,
        tenant_id=tenant_id,
    )
    if updated_data is None:
        return None
    return Document(**updated_data)


async def delete_document(document_id: str, *, tenant_id: str) -> bool:
    """Deletes the document for the given document_id and tenant_id and returns deletion success status."""
    return await clients.mongo.document.delete_document(
        document_id=document_id,
        tenant_id=tenant_id,
    )


async def list_document_chunks(
    document_id: Optional[str] = None,
    offset: int = 0,
    limit: int | None = None,
    *,
    tenant_id: str,
) -> list[DocumentChunk]:
    """Returns a list of chunks for the given document_id with pagination."""
    chunks_data = await clients.mongo.chunk.list_document_chunks(
        document_id=document_id,
        offset=offset,
        limit=limit,
        tenant_id=tenant_id,
    )
    return [DocumentChunk(**data) for data in chunks_data]
