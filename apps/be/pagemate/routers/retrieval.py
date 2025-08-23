from fastapi import Query, APIRouter

from pagemate.schema import DocumentChunk
from pagemate.services import embedding_service, document_service

router = APIRouter(prefix="/tenants/{tenant_id}", tags=["retrieval"])


@router.get(
    "/retrieval",
    response_model=list[DocumentChunk],
    response_model_exclude_none=True,
)
async def retrieval(
    tenant_id: str,
    query: str = Query(..., description="Query text to embed and search"),
    limit: int = Query(10, description="Number of results"),
    document_id: str | None = Query(None, description="Filter by document_id"),
):
    """
    Semantic search over document_chunks (cosine_similarity)
    Not ANN, Exact Nearest Neighbor Search...
    """

    query_embedding = await embedding_service.get_embedding(
        query, embedding_type="query"
    )
    candidate_chunks = await document_service.list_document_chunks(
        document_id=document_id,
        offset=0,
        tenant_id=tenant_id,
    )

    retrived_chunks = await embedding_service.list_exact_nearest_neighbors(
        query_embedding=query_embedding,
        candidate_chunks=candidate_chunks,
        metric="cosine",
        limit=limit,
    )

    for chunk in retrived_chunks:
        chunk.embedding = []

    return retrived_chunks
