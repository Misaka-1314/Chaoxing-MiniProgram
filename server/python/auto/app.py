from fastapi.responses import RedirectResponse, JSONResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import HTTPException
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
import datetime
import logging
import uvicorn
import asyncio
import time

from router.task import worker
from const import client

from router.base import router as base_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(worker())
    yield
    task.cancel()
    await client.aclose()


app = FastAPI(lifespan=lifespan, redoc_url=None, docs_url=None)
app.add_middleware(
    middleware_class=CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(base_router, prefix="/api", tags=["API"])


@app.get("/")
async def root() -> RedirectResponse:
    with open("assets/home.html", "r", encoding="utf-8") as f:
        return HTMLResponse(
            content=f.read(),
            status_code=200,
            media_type="text/html",
            headers={
                "Cache-Control": "public, max-age=15552000, immutable",
            },
        )


@app.get("/favicon.ico")
async def favicon() -> RedirectResponse:
    return RedirectResponse("https://cdn.micono.eu.org/icon/logo.png", status_code=301)


@app.exception_handler(HTTPException)
async def _(request: Request, exc: HTTPException):
    return JSONResponse(
        {
            "status": -1,
            "msg": exc.detail,
            "data": None,
            "time": int(time.time()),
        },
        status_code=exc.status_code,
    )


if __name__ == "__main__":
    from utils.logger import set_log_formatter

    now = datetime.datetime.now()
    set_log_formatter()
    logging.info(f"服务启动时间: {now.strftime(r'%Y-%m-%d %H:%M:%S')}")

    try:
        uvicorn.run(
            app="app:app",
            host="0.0.0.0",
            port=8000,
            reload=False,
            log_config=None,
            workers=1,
            headers=[
                ("X-Server-Start-Time", now.strftime(r"%Y-%m-%d %H:%M:%S")),
            ],
        )
    except KeyboardInterrupt:
        logging.info("Ctrl+C 终止服务")
