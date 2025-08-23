import pathlib

import aiofiles
import aiofiles.os


async def is_exists(path: pathlib.Path) -> bool:
    """주어진 경로의 path에 파일이 존재하는지 확인합니다."""
    return await aiofiles.os.path.exists(path)


async def save_file(path: pathlib.Path, data: bytes) -> int:
    """주어질 경로의 path에 데이터를 저장합니다."""
    await aiofiles.os.makedirs(path.parent, exist_ok=True)
    async with aiofiles.open(path, "wb") as f:
        await f.write(data)
    return len(data)


async def read_file(path: str | pathlib.Path) -> bytes:
    """주어진 경로의 path에서 데이터를 읽어옵니다."""
    path = pathlib.Path(path) if isinstance(path, str) else path

    async with aiofiles.open(path, "rb") as f:
        return await f.read()


async def delete_file(path: pathlib.Path) -> None:
    """주어진 경로의 path에 파일을 삭제합니다."""
    if await aiofiles.os.path.exists(path):
        await aiofiles.os.remove(path)
