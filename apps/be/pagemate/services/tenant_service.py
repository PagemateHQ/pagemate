from datetime import datetime, timezone
from typing import Any

from pagemate.clients.mongo import tenant as tenant_client
from pagemate.schema.tenant import Tenant


async def list_tenants(offset: int = 0, limit: int = 20) -> list[Tenant]:
    """Returns a list of tenants with pagination."""
    tenants_data = await tenant_client.list_tenants(offset=offset, limit=limit)
    return [Tenant(**data) for data in tenants_data]


async def get_tenant_by_id(tenant_id: str) -> Tenant | None:
    """Returns tenant information for the given tenant_id."""
    tenant_data = await tenant_client.get_tenant_by_id(tenant_id)
    if tenant_data is None:
        return None
    return Tenant(**tenant_data)


async def get_tenant_by_name(tenant_name: str) -> Tenant | None:
    """Returns tenant information for the given tenant_name."""
    tenant_data = await tenant_client.get_tenant_by_name(tenant_name)
    if tenant_data is None:
        return None
    return Tenant(**tenant_data)


async def create_tenant(name: str) -> Tenant:
    """Creates a new tenant and returns the Tenant model."""
    now = datetime.now(timezone.utc)
    tenant_data = {
        "name": name,
        "created_at": now,
        "updated_at": now,
    }

    created_data = await tenant_client.create_tenant(tenant_data)
    return Tenant(**created_data)


async def update_tenant(tenant_id: str, name: str | None = None) -> Tenant | None:
    """Updates tenant information for the given tenant_id and returns the updated Tenant model."""
    update_data: dict[str, Any] = {"updated_at": datetime.now(timezone.utc)}

    if name is not None:
        update_data["name"] = name

    updated_data = await tenant_client.update_tenant(tenant_id, update_data)
    if updated_data is None:
        return None
    return Tenant(**updated_data)


async def delete_tenant(tenant_id: str) -> bool:
    """Deletes the tenant for the given tenant_id and returns deletion success status."""
    return await tenant_client.delete_tenant(tenant_id)
