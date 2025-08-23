import pathlib

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongo_url: str = "mongodb://localhost:27017"
    file_storage_base_path_str: str = "/file-storage"

    upstage_completion_api_key: str = "your-upstage-api-key"
    upstage_completion_base_url: str = "https://api.upstage.ai/v1"

    upstage_embedding_api_key: str = "your-upstage-api-key"
    upstage_embedding_base_url: str = "https://api.upstage.ai/v1"

    query_embedding_model: str = "embedding-query"
    document_embedding_model: str = "embedding-passage"

    @property
    def file_storage_base_path(self) -> pathlib.Path:
        return pathlib.Path(self.file_storage_base_path_str)


settings = Settings()
