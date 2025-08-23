import logging

import uvicorn

from pagemate import app

logger = logging.getLogger(__name__)

if __name__ == "__main__":
    logger.info(f"Running on app: {app}")

    uvicorn.run(
        app=app,
        host="127.0.0.1",
        port=8000,
        log_level="debug",
        reload=False,
    )
