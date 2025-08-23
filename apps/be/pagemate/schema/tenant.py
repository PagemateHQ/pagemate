from pydantic import BaseModel, Field


class Tenant(BaseModel):
    id: str = Field(..., alias="_id", description="Tenant ID")
    name: str = Field(..., description="Tenant name")
