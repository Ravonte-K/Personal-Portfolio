import os
from typing import Optional

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncConnection, AsyncEngine, create_async_engine

DATABASE_URL = os.getenv("DATABASE_URL")


def create_engine() -> Optional[AsyncEngine]:
    if not DATABASE_URL:
        return None
    return create_async_engine(DATABASE_URL, pool_pre_ping=True)


async def check_connection(engine: AsyncEngine) -> None:
    async with engine.connect() as connection:  # type: AsyncConnection
        await connection.execute(text("SELECT 1"))
