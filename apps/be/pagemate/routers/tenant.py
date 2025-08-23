from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from pagemate.schema.tenant import Tenant
from pagemate.services import tenant_service

router = APIRouter(prefix="/tenants", tags=["tenants"])


class TenantCreateRequest(BaseModel):
    name: str


class TenantUpdateRequest(BaseModel):
    name: str | None = None


@router.get("/", response_model=list[Tenant])
async def list_tenants(offset: int = 0, limit: int = 20):
    """List all tenants with pagination."""
    return await tenant_service.list_tenants(offset=offset, limit=limit)


@router.post("/", response_model=Tenant, status_code=201)
async def create_tenant(request: TenantCreateRequest):
    """Create a new tenant."""
    return await tenant_service.create_tenant(name=request.name)


@router.get("/{tenant_id}", response_model=Tenant)
async def get_tenant(tenant_id: str):
    """Get a tenant by ID."""
    tenant = await tenant_service.get_tenant_by_id(tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant


@router.put("/{tenant_id}", response_model=Tenant)
async def update_tenant(tenant_id: str, request: TenantUpdateRequest):
    """Update a tenant by ID."""
    tenant = await tenant_service.update_tenant(tenant_id, name=request.name)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant


@router.delete("/{tenant_id}", status_code=204)
async def delete_tenant(tenant_id: str):
    """Delete a tenant by ID."""
    success = await tenant_service.delete_tenant(tenant_id)
    if not success:
        raise HTTPException(status_code=404, detail="Tenant not found")
