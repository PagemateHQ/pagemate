from motor.motor_asyncio import AsyncIOMotorClient

from pagemate.settings import settings


def get_chunks_collection():
    client = AsyncIOMotorClient(settings.mongo_url)
    db = client.pagemate
    return db.document_chunks


async def count_chunks_by_document_id(document_id: str) -> int:
    col = get_chunks_collection()
    return await col.count_documents({"document_id": document_id})

