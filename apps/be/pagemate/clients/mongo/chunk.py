from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient

from pagemate.settings import settings


def get_chunks_collection():
    client = AsyncIOMotorClient(settings.mongo_url)
    db = client.pagemate
    return db.document_chunks


async def count_chunks_by_document_id(document_id: str) -> int:
    col = get_chunks_collection()
    return await col.count_documents({"document_id": document_id})


async def list_document_chunks(
    document_id: Optional[str] = None,
    offset: int = 0,
    limit: int | None = None,
    *,
    tenant_id: str,
) -> list[dict]:
    """Returns a list of chunks for the given document_id with pagination."""
    col = get_chunks_collection()
    condition = {"tenant_id": tenant_id}
    if document_id:
        condition["document_id"] = document_id

    cursor = col.find(condition).skip(offset)

    if limit is not None:
        cursor = cursor.limit(limit)

    return await cursor.to_list()


async def delete_chunks_by_document_id(document_id: str, *, tenant_id: str) -> bool:
    """Deletes all chunks for the given document_id and tenant_id and returns deletion success status."""
    col = get_chunks_collection()
    result = await col.delete_many({
        "document_id": document_id,
        "tenant_id": tenant_id,
    })
    return result.deleted_count > 0
