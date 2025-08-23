from enum import Enum
from pydantic import BaseModel, Field

class DocumentEmbeddingStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class Document(BaseModel):
    id: str = Field(..., alias="_id", description="Document ID")
    tenant_id: str = Field(..., description="Tenant ID")
    name: str = Field(..., description="Document name")
    object_path: str = Field(..., description="Object storage path")
    size: int = Field(..., description="Document size in bytes")

class DocumentEmbedding(BaseModel):
    id: str = Field(..., alias="_id", description="Document ID")
    document_id: str = Field(..., description="Document ID")
    embedding: list[float] = Field(..., description="Document embedding")
    status: DocumentEmbeddingStatus = Field(..., description="Document embedding status")