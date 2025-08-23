from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection
from pagemate.settings import settings


def get_document_collection() -> AsyncIOMotorCollection:
    client = AsyncIOMotorClient(settings.MOGNO_URL)
    db = client.pagemate
    return db.documents


async def list_documents(offset: int = 0, limit: int = 20) -> list[dict]:
    """모든 테넌트 정보를 리스트로 반환합니다."""
    collection = get_document_collection()
    cursor = collection.find({}).skip(offset).limit(limit)
    documents = []
    async for doc in cursor:
        documents.append(doc)
    return documents


async def list_documents_by_tenant_id(
    tenant_id: str, offset: int = 0, limit: int = 20
) -> list[dict]:
    """모든 테넌트 정보를 리스트로 반환합니다."""
    collection = get_document_collection()
    cursor = collection.find({"tenant_id": tenant_id}).skip(offset).limit(limit)
    documents = []
    async for doc in cursor:
        documents.append(doc)
    return documents


async def get_document_by_id(document_id: str, *, tenant_id: str) -> dict | None:
    """주어진 document_id에 해당하는 테넌트 정보를 반환합니다."""
    collection = get_document_collection()
    return await collection.find_one(
        {
            "_id": document_id,
            "tenant_id": tenant_id,
        }
    )


async def create_document(document_data: dict, *, tenant_id: str) -> dict:
    """새로운 테넌트를 생성하고 생성된 테넌트 정보를 반환합니다."""
    document_data["tenant_id"] = tenant_id

    collection = get_document_collection()
    result = await collection.insert_one(document_data)

    document_data["_id"] = result.inserted_id
    return document_data


async def update_document(
    document_id: str, update_data: dict, *, tenant_id: str
) -> dict | None:
    """주어진 document_id에 해당하는 테넌트 정보를 업데이트하고, 업데이트된 정보를 반환합니다."""
    collection = get_document_collection()
    result = await collection.find_one_and_update(
        {"_id": document_id, "tenant_id": tenant_id},
        {"$set": update_data},
        return_document=True,
    )
    return result


async def delete_document(document_id: str, *, tenant_id: str) -> bool:
    """주어진 document_id에 해당하는 테넌트를 삭제하고, 삭제 성공 여부를 반환합니다."""
    collection = get_document_collection()
    result = await collection.delete_one(
        {
            "_id": document_id,
            "tenant_id": tenant_id,
        }
    )
    return result.deleted_count > 0
