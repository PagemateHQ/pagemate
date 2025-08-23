import pathlib

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongo_url: str = "mongodb://mongo:QdrxnTtkqbiqLzzQVWvyqXjXeBytKSih@shinkansen.proxy.rlwy.net:11626"
    file_storage_base_path_str: str = "/file-storage"

    openai_api_key: str = "up_0qBatoABAEwg1XX9BIGusjF46qRyj"
    openai_base_url: str = "https://api.upstage.ai/v1"

    query_embedding_model: str = "embedding-query"
    document_embedding_model: str = "embedding-passage"

    @property
    def file_storage_base_path(self) -> pathlib.Path:
        return pathlib.Path(self.file_storage_base_path_str)


settings = Settings()
