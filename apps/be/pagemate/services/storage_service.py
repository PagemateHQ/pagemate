import pathlib
from pagemate.clients.storage import is_exists, save_file, read_file, delete_file


async def file_exists(path: str | pathlib.Path) -> bool:
    """파일이 존재하는지 확인합니다."""
    path_obj = pathlib.Path(path) if isinstance(path, str) else path
    return await is_exists(path_obj)


async def save_text_file(path: str | pathlib.Path, content: str, encoding: str = 'utf-8') -> None:
    """텍스트 파일을 저장합니다."""
    path_obj = pathlib.Path(path) if isinstance(path, str) else path
    data = content.encode(encoding)

    await save_file(path_obj, data)


async def read_text_file(path: str | pathlib.Path, encoding: str = 'utf-8') -> str:
    """텍스트 파일을 읽어옵니다."""
    path_obj = pathlib.Path(path) if isinstance(path, str) else path
    if not await is_exists(path_obj):
        raise FileNotFoundError(f"File not found: {path_obj}")

    data = await read_file(path_obj)

    try:
        return data.decode(encoding)
    except UnicodeDecodeError as e:
        raise ValueError(f"Failed to decode file with encoding {encoding}: {e}")


async def remove_file(path: str | pathlib.Path) -> None:
    """파일을 삭제합니다."""
    path_obj = pathlib.Path(path) if isinstance(path, str) else path
    await delete_file(path_obj)
