from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional

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
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Creation timestamp",
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Last update timestamp",
    )

class DocumentEmbedding(BaseModel):
    id: str = Field(..., alias="_id", description="Embedding ID")
    document_id: str = Field(..., description="Related Document ID")

    # Text provided directly for embedding (optional; file-based flows may omit)
    text: Optional[str] = Field(None, description="Text to embed, if provided")

    # Dense vector for cosine similarity (present when status=completed)
    embedding: Optional[List[float]] = Field(None, description="Embedding vector")

    status: DocumentEmbeddingStatus = Field(..., description="Embedding status")
    error: Optional[str] = Field(None, description="Error details if status=failed")

    # Processing timestamps (match worker fields via aliases)
    started_at: Optional[datetime] = Field(None, alias="startedAt")
    completed_at: Optional[datetime] = Field(None, alias="completedAt")
    failed_at: Optional[datetime] = Field(None, alias="failedAt")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Creation timestamp")
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Last update timestamp",
    )

class DocumentChunk(BaseModel):
    id: str = Field(..., alias="_id", description="Chunk ID")
    document_id: str = Field(..., description="Parent document ID")
    tenant_id: str = Field(..., description="Tenant ID")
    index: int = Field(..., description="Chunk index in document (0-based)")

    text: str = Field(..., description="Chunk text content")
    embedding: List[float] = Field(..., description="Dense vector embedding")

    # Minimal pointer to help extract relevant portions
    char_start: Optional[int] = Field(None, description="Start char offset in source text")
    char_end: Optional[int] = Field(None, description="End char offset (exclusive)")

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Creation timestamp",
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Last update timestamp",
    )
