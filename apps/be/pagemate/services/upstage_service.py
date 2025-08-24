import asyncio

import openai

from pagemate.settings import settings

openai_client = openai.Client(
    api_key=settings.upstage_completion_api_key,
    base_url=settings.upstage_completion_base_url,
)


async def complete_chat(messages: list[dict]) -> str:
    params = {
        "model": settings.upstage_completion_model,
        "messages": messages,
    }

    current_loop = asyncio.get_event_loop()

    response = await current_loop.run_in_executor(
        None,
        lambda: openai_client.chat.completions.create(**params),
    )
    content = response.choices[0].message.content

    return content
