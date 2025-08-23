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
    id: str | None = Field(None, alias="_id", description="Document ID")
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
    embedding_status: DocumentEmbeddingStatus = Field(
        DocumentEmbeddingStatus.PENDING, description="Embedding pipeline status"
    )

    text: Optional[str] = Field(None, description="Text used for embedding (optional)")
    embedding: Optional[List[float]] = Field(
        None, description="Embedding vector (optional)"
    )
    error: Optional[str] = Field(None, description="Embedding error details (if any)")

    started_at: Optional[datetime] = Field(None, alias="startedAt")
    completed_at: Optional[datetime] = Field(None, alias="completedAt")
    failed_at: Optional[datetime] = Field(None, alias="failedAt")


class DocumentStatus(BaseModel):
    id: str = Field(..., alias="_id", description="Document ID")
    tenant_id: str = Field(..., description="Tenant ID")
    embedding_status: Optional[DocumentEmbeddingStatus] = Field(
        None, description="Embedding pipeline status"
    )
    error: Optional[str] = Field(None, description="Embedding error details")
    started_at: Optional[datetime] = Field(None, alias="startedAt")
    completed_at: Optional[datetime] = Field(None, alias="completedAt")
    failed_at: Optional[datetime] = Field(None, alias="failedAt")
    updated_at: Optional[datetime] = Field(None, alias="updatedAt")
    chunks_count: int = Field(0, description="Number of chunks generated")


class DocumentChunk(BaseModel):
    id: str | None = Field(None, alias="_id", description="Chunk ID")
    document_id: str = Field(..., description="Parent document ID")
    tenant_id: str = Field(..., description="Tenant ID")
    index: int = Field(..., description="Chunk index in document (0-based)")

    text: str = Field(..., description="Chunk text content")
    embedding: List[float] = Field(..., description="Dense vector embedding")

    # Minimal pointer to help extract relevant portions
    char_start: Optional[int] = Field(
        None, description="Start char offset in source text"
    )
    char_end: Optional[int] = Field(None, description="End char offset (exclusive)")

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Creation timestamp",
        alias="createdAt",
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Last update timestamp",
        alias="updatedAt",
    )
