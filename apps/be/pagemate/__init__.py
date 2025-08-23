from http.client import HTTPException

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from scalar_fastapi import get_scalar_api_reference

from pagemate import routers
from pagemate.assemble import middleware, exception

TITLE = "PageMate API"

app = FastAPI(
    title=TITLE,
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


@app.get("/scalar", include_in_schema=False)
async def scalar_docs():
    """Scalar FastAPI Docs"""
    return get_scalar_api_reference(
        title=TITLE,
        openapi_url="/openapi.json",
    )


app.include_router(routers.index.router)
app.include_router(routers.tenant.router)
app.include_router(routers.document.router)
app.include_router(routers.retrieval.router)
app.include_router(routers.upstage.router)
