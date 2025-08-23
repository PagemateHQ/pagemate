import logging

import uvicorn

from pagemate import app

logger = logging.getLogger(__name__)

if __name__ == "__main__":
    logger.info(f"Running on app: {app}")

    uvicorn.run(
        app=app,
        host="0.0.0.0",
        port=8000,
        log_level="debug",
        reload=False,
    )
