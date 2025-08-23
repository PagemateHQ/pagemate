from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    MOGNO_URL: str = "mongodb://localhost:27017"


settings = Settings()
