import logging
import traceback

from fastapi import HTTPException
from fastapi.exceptions import RequestValidationError
from starlette.requests import Request
from starlette.responses import JSONResponse

logger = logging.getLogger("default")


async def exception_handler(_: Request, e: Exception):
    logger.exception(f"Exception => {type(e).__name__}: {str(e)}\n{traceback.format_exc()}")
    content = dict(detail=str(e))
    return JSONResponse(status_code=500, content=content)


async def http_exception_handler(_: Request, e: HTTPException):
    logger.exception(f"Exception => {type(e).__name__}: {str(e)}\n{traceback.format_exc()}")
    content = dict(detail=e.detail)
    return JSONResponse(status_code=e.status_code, content=content)


async def validation_exception_handler(_: Request, e: RequestValidationError):
    logger.exception(f"Validation Error: {e}\n{traceback.format_exc()}")

    messages = []
    for error in e.errors():
        field = error.get("loc", [])[-1]  # 마지막 요소는 필드 이름을 의미
        msg = error.get("msg")
        messages.append(f"{field}: {msg}")

    friendly_message = "다음 파라미터를 확인 해주세요: " + ", ".join(messages)
    content = dict(detail=friendly_message)
    return JSONResponse(status_code=422, content=content)
