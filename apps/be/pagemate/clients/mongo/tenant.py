from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection
from pagemate.settings import settings


def get_tenant_collection() -> AsyncIOMotorCollection:
    client = AsyncIOMotorClient(settings.MOGNO_URL)
    db = client.pagemate
    return db.tenants


async def get_tenant_by_id(tenant_id: str) -> dict | None:
    """주어진 tenant_id에 해당하는 테넌트 정보를 반환합니다."""
    collection = get_tenant_collection()
    return await collection.find_one({"_id": tenant_id})


async def get_tenant_by_name(tenant_name: str) -> dict | None:
    """주어진 tenant_name에 해당하는 테넌트 정보를 반환합니다."""
    collection = get_tenant_collection()
    return await collection.find_one({"name": tenant_name})


async def create_tenant(tenant_data: dict) -> dict:
    """새로운 테넌트를 생성하고 생성된 테넌트 정보를 반환합니다."""
    collection = get_tenant_collection()
    result = await collection.insert_one(tenant_data)
    tenant_data["_id"] = result.inserted_id
    return tenant_data


async def update_tenant(tenant_id: str, update_data: dict) -> dict | None:
    """주어진 tenant_id에 해당하는 테넌트 정보를 업데이트하고, 업데이트된 정보를 반환합니다."""
    collection = get_tenant_collection()
    result = await collection.find_one_and_update(
        {"_id": tenant_id}, {"$set": update_data}, return_document=True
    )
    return result


async def delete_tenant(tenant_id: str) -> bool:
    """주어진 tenant_id에 해당하는 테넌트를 삭제하고, 삭제 성공 여부를 반환합니다."""
    collection = get_tenant_collection()
    result = await collection.delete_one({"_id": tenant_id})
    return result.deleted_count > 0
