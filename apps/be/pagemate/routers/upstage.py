from typing import List, Literal

import openai
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from starlette.responses import PlainTextResponse

from pagemate.services import upstage_service
from pagemate.settings import settings

router = APIRouter(prefix="/upstage", tags=["upstage"])

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

        content = await upstage_service.complete_chat(messages)

        return content

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
