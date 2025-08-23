import pathlib

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongo_url: str = "mongodb://localhost:27017"
    file_storage_base_path_str: str = "/file-storage"

    @property
    def file_storage_base_path(self) -> pathlib.Path:
        return pathlib.Path(self.file_storage_base_path_str)

settings = Settings()
