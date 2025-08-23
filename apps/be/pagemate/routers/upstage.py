import openai
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse

from pagemate.settings import settings

router = APIRouter(prefix="/upstage", tags=["upstage"])
openai_client = openai.Client(
    api_key=settings.upstage_api_key,
    base_url=settings.upstage_base_url,
)


@router.post("/v1/chat/completions")
async def upstage_chat_completions(request: Request):
    """Proxy for Upstage chat completions endpoint."""
    try:
        body = await request.json()
        
        stream = body.get("stream", False)
        
        if stream:
            response = openai_client.chat.completions.create(**body, stream=True)
            
            async def generate():
                for chunk in response:
                    yield f"data: {chunk.model_dump_json()}\n\n"
                yield "data: [DONE]\n\n"
            
            return StreamingResponse(
                generate(),
                media_type="text/event-stream",
            )
        else:
            response = openai_client.chat.completions.create(**body)
            return response.model_dump()
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
