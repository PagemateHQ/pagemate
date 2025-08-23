from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import Response

from pagemate.schema.document import Document
from pagemate.services import document_service, storage_service

router = APIRouter(prefix="/tenants/{tenant_id}/documents", tags=["documents"])


@router.get("/", response_model=list[Document])
async def list_documents(tenant_id: str, offset: int = 0, limit: int = 20):
    """List documents for a tenant with pagination."""
    return await document_service.list_documents_by_tenant_id(
        tenant_id=tenant_id, offset=offset, limit=limit
    )


@router.post("/", response_model=Document, status_code=201)
async def create_document(tenant_id: str, file: UploadFile = File(...)):
    """Create a new document by uploading a file."""
    # Read file content
    content: bytes = await file.read()

    # Validate file extension
    if not file.filename.endswith((".txt", ".pdf", ".md")):
        raise HTTPException(status_code=400, detail="Only .txt, .md, or .pdf files are supported")

    # Save file to storage and get path and size
    object_path, file_size = await storage_service.save_text_file(content)

    # Create document record (embedding_status is set to pending in service)
    document = await document_service.create_document(
        name=file.filename or "untitled",
        object_path=str(object_path),
        size=file_size,
        tenant_id=tenant_id,
    )

    return document


@router.get("/{document_id}", response_model=Document)
async def get_document(tenant_id: str, document_id: str):
    """Get a document by ID."""
    document = await document_service.get_document_by_id(
        document_id=document_id, tenant_id=tenant_id
    )
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document


@router.get("/{document_id}/attachment")
async def get_document_attachment(tenant_id: str, document_id: str):
    """Get the attachment (file content) of a document by ID."""
    document = await document_service.get_document_by_id(
        document_id=document_id, tenant_id=tenant_id
    )
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    file_content = await storage_service.read_file(document.object_path)
    
    # Determine media type based on file extension
    if document.name.endswith('.pdf'):
        media_type = "application/pdf"
    elif document.name.endswith('.txt'):
        media_type = "text/plain"
    elif document.name.endswith('.md'):
        media_type = "text/markdown"
    else:
        media_type = "application/octet-stream"
    
    return Response(
        content=file_content,
        media_type=media_type,
        headers={"Content-Disposition": f"inline; filename=\"{document.name}\""}
    )


@router.delete("/{document_id}", status_code=204)
async def delete_document(tenant_id: str, document_id: str):
    """Delete a document by ID."""
    document = await document_service.get_document_by_id(
        document_id=document_id, tenant_id=tenant_id
    )

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    success = await document_service.delete_document(
        document_id=document_id, tenant_id=tenant_id
    )
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
