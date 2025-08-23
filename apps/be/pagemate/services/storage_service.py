import pathlib
import uuid

from pagemate import clients
from pagemate.settings import settings

FILE_STORAGE_BASE_PATH = pathlib.Path("/file-storage")


async def file_exists(path: str | pathlib.Path) -> bool:
    """파일이 존재하는지 확인합니다."""
    path_obj = pathlib.Path(path) if isinstance(path, str) else path
    return await clients.storage.is_exists(path_obj)


async def save_file(content: bytes, extension: str) -> tuple[pathlib.Path, int]:
    """텍스트 파일을 저장합니다."""
    if extension.startswith("."):
        raise ValueError("Extension should not start with a dot.")

    file_uuid = str(uuid.uuid4())
    file_name = f"{file_uuid}.{extension}"
    path = settings.file_storage_base_path.joinpath(file_name)

    path_obj = pathlib.Path(path) if isinstance(path, str) else path

    file_size = await clients.storage.save_file(path_obj, content)
    return path_obj, file_size


async def read_file(path: str | pathlib.Path) -> bytes:
    """텍스트 파일을 읽어옵니다."""
    path_obj = pathlib.Path(path) if isinstance(path, str) else path
    if not await clients.storage.is_exists(path_obj):
        raise FileNotFoundError(f"File not found: {path_obj}")

    data = await clients.storage.read_file(path_obj)

    return data


async def remove_file(path: str | pathlib.Path) -> None:
    """파일을 삭제합니다."""
    path_obj = pathlib.Path(path) if isinstance(path, str) else path
    await clients.storage.delete_file(path_obj)
