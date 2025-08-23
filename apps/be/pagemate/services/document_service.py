from datetime import datetime, timezone
from typing import Any

from pagemate import clients
from pagemate.schema.document import Document


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
