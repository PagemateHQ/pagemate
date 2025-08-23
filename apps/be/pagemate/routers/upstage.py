from typing import List, Literal

import openai
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from starlette.responses import PlainTextResponse

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


@router.post("/v1/chat/completions", response_class=PlainTextResponse)
async def upstage_chat_completions(request: ChatCompletionRequest):
    """Proxy for Upstage chat completions endpoint."""
    try:
        messages = []

        if settings.secret_recipe:
            messages.append({"role": "system", "content": settings.secret_recipe})

        messages.extend(
            [{"role": msg.role, "content": msg.content} for msg in request.messages]
        )

        params = {
            "model": settings.upstage_completion_model,
            "messages": messages,
        }

        response = openai_client.chat.completions.create(**params)
        content = response.choices[0].message.content

        return content

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
