from fastapi import FastAPI, HTTPException

from app.db import check_connection, create_engine

app = FastAPI()
engine = create_engine()


@app.get("/health")
async def health_check() -> dict:
    if engine is None:
        raise HTTPException(status_code=500, detail="DATABASE_URL is not configured")

    try:
        await check_connection(engine)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    return {"status": "ok"}
