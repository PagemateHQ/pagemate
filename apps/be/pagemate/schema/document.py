from pydantic import BaseModel, Field


class Document(BaseModel):
    id: str = Field(..., alias="_id", description="Document ID")
    tenant_id: str = Field(..., description="Tenant ID")
    name: str = Field(..., description="Document name")
    object_path: str = Field(..., description="Object storage path")
    size: int = Field(..., description="Document size in bytes")
