from typing import List, Optional

import openai
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from pagemate.settings import settings

router = APIRouter(prefix="/upstage", tags=["upstage"])
openai_client = openai.Client(
    api_key=settings.upstage_completion_api_key,
    base_url=settings.upstage_completion_base_url,
)


class Message(BaseModel):
    role: str
    content: str


class ChatCompletionRequest(BaseModel):
    messages: List[Message]
    model: str
    pageHtml: Optional[str] = None
    stream: Optional[bool] = False
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    top_p: Optional[float] = None
    frequency_penalty: Optional[float] = None
    presence_penalty: Optional[float] = None


@router.post("/v1/chat/completions")
async def upstage_chat_completions(request: ChatCompletionRequest):
    """Proxy for Upstage chat completions endpoint."""
    try:
        # Build the messages for OpenAI API
        messages = [
            {"role": msg.role, "content": msg.content} for msg in request.messages
        ]

        # If pageHtml is provided, add it as context to the last user message
        if request.pageHtml:
            if messages and messages[-1]["role"] == "user":
                messages[-1][
                    "content"
                ] = f"{messages[-1]['content']}\n\nPage HTML Context:\n{request.pageHtml}"
            else:
                messages.append(
                    {
                        "role": "system",
                        "content": f"Page HTML Context:\n{request.pageHtml}",
                    }
                )

        # Prepare OpenAI API parameters
        openai_params = {
            "model": request.model,
            "messages": messages,
            "stream": request.stream,
        }

        # Add optional parameters if provided
        if request.temperature is not None:
            openai_params["temperature"] = request.temperature
        if request.max_tokens is not None:
            openai_params["max_tokens"] = request.max_tokens
        if request.top_p is not None:
            openai_params["top_p"] = request.top_p
        if request.frequency_penalty is not None:
            openai_params["frequency_penalty"] = request.frequency_penalty
        if request.presence_penalty is not None:
            openai_params["presence_penalty"] = request.presence_penalty

        if request.stream:
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
