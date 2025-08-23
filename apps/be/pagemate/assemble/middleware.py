from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from starlette_context import plugins
from starlette_context.middleware import RawContextMiddleware

cors_middleware = Middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

context_middleware = Middleware(
    RawContextMiddleware,
    plugins=[
        plugins.RequestIdPlugin(),
        plugins.CorrelationIdPlugin(),
    ],
)
