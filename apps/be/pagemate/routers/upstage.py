from typing import List, Literal

import openai
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from pagemate.settings import settings

router = APIRouter(prefix="/upstage", tags=["upstage"])
openai_client = openai.Client(
    api_key=settings.upstage_completion_api_key,
    base_url=settings.upstage_completion_base_url,
)


class Message(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str


class ChatCompletionRequest(BaseModel):
    messages: List[Message]


@router.post("/v1/chat/completions")
async def upstage_chat_completions(
    request: ChatCompletionRequest,
    stream: bool = Query(False),
):
    """Proxy for Upstage chat completions endpoint."""
    try:
        messages = []

        if settings.secret_recipe:
            messages.append({"role": "system", "content": settings.secret_recipe})

        messages.extend(
            [{"role": msg.role, "content": msg.content} for msg in request.messages]
        )

        openai_params = {
            "model": settings.upstage_completion_model,
            "messages": messages,
            "stream": stream,
        }

        if stream:
            response = openai_client.chat.completions.create(**openai_params)

            async def generate():
                for chunk in response:
                    yield f"data: {chunk.model_dump_json()}\n\n"
                yield "data: [DONE]\n\n"

            return StreamingResponse(
                generate(),
                media_type="text/event-stream",
            )
        else:
            response = openai_client.chat.completions.create(**openai_params)
            return response.model_dump()

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
