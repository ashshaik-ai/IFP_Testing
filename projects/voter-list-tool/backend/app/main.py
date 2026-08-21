from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.messaging_routes import router as messaging_router
from app.api.routes import router
from app.core.config import settings
from app.services.outbox import start_worker
from app.services.storage import ensure_data_dir


app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    ensure_data_dir()
    start_worker()


@app.get("/health")
def health() -> dict:
    return {"ok": True, "app": settings.app_name}


@app.get("/")
def root() -> dict:
    return {
        "app": settings.app_name,
        "status": "running",
        "docs": "/docs",
        "frontend": "http://127.0.0.1:3000",
    }


app.include_router(router)
app.include_router(messaging_router)
