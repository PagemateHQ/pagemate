from fastapi import APIRouter
from starlette.responses import PlainTextResponse, HTMLResponse

router = APIRouter()


@router.get("/", response_class=HTMLResponse)
async def index():
    """Index Page of the API."""
    return """
    <a href="/docs">Go to API Documentation</a>
    """
