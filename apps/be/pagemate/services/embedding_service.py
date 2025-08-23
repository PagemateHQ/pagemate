from typing import Literal

import numpy as np

from pagemate import clients, tools
from pagemate.schema import DocumentChunk


async def get_embedding(query: str, embedding_type: Literal["query", "document"]) -> np.ndarray:
    embedding = await clients.opanai.get_embedding(query, embedding_type)
    embedding = np.array(embedding, dtype=np.float32)
    return embedding


async def list_exact_nearest_neighbors(
    query_embedding: np.ndarray,
    candidate_chunks: list[DocumentChunk],
    metric: Literal["cosine", "dot"] = "cosine",
    limit: int = 10,
) -> list[tuple[float, dict]]:
    """
    Exact Nearest Neighbor Search using Cosine Similarity
    """
    candidate_embeddings = [x.embedding for x in candidate_chunks]
    candidate_embeddings = np.array(candidate_embeddings, dtype=np.float32)

    if metric == "cosine":
        metric_func = tools.vector.cosine_similarities
    elif metric == "dot":
        metric_func = tools.vector.inner_products
    else:
        raise ValueError(f"Unsupported metric: {metric}")

    similarities = metric_func(query_embedding, candidate_embeddings)

    results = list(zip(similarities, candidate_chunks))
    results.sort(key=lambda x: x[0], reverse=True)
    results = results[:limit]

    _, chunks = zip(*results)

    return chunks
