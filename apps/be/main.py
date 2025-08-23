from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware import Middleware
import uvicorn

app = FastAPI(
    title="PageMate API", description="Backend API for PageMate", version="0.1.0"
)

# Configure CORS
cors_middleware = Middleware(
    CORSMiddleware, # type: ignore
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.add_middleware(cors_middleware) # type: ignore

@app.get("/")
async def root():
    return {"message": "Welcome to PageMate API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/api/test")
async def test_endpoint():
    return {"message": "Test endpoint working", "data": {"test": True}}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
