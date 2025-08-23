from http.client import HTTPException

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError

from pagemate import routers
from pagemate.assemble import middleware, exception

app = FastAPI(
    title="PageMate API",
    middleware=[
        middleware.cors_middleware,
        middleware.context_middleware,
    ],
    exception_handlers={
        Exception: exception.exception_handler,
        HTTPException: exception.http_exception_handler,
        RequestValidationError: exception.validation_exception_handler,
    },
    docs_url="/docs",
)

app.include_router(routers.index.router)
