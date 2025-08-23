import asyncio
from typing import Literal

from openai import OpenAI

from pagemate.settings import settings

client = OpenAI(
    api_key=settings.openai_api_key,
    base_url=settings.openai_base_url,
)


async def get_embedding(
    query: str, embedding_type: Literal["query", "document"]
) -> list[float]:
    if embedding_type == "query":
        embedding_model = settings.query_embedding_model
    elif embedding_type == "document":
        embedding_model = settings.document_embedding_model
    else:
        raise ValueError(f"Unsupported embedding_type: {embedding_type}")

    loop = asyncio.get_running_loop()
    resp = await loop.run_in_executor(
        None,
        lambda: client.embeddings.create(
            model=embedding_model,
            input=query,
        ),
    )
    return resp.data[0].embedding
