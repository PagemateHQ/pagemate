from datetime import datetime, timezone

from pydantic import BaseModel, Field


class Tenant(BaseModel):
    id: str | None = Field(None, alias="_id", description="Tenant ID")
    name: str = Field(..., description="Tenant name")
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Creation timestamp",
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Last update timestamp",
    )
