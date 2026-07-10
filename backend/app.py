"""
QueryWise AI — FastAPI Application Entrypoint

Initialises the server, database, and middleware.
Run with: uvicorn app:app --reload
"""

from __future__ import annotations

import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import db
from router import router

# ── Logging configuration ────────────────────────────────────

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    stream=sys.stdout,
)
logger = logging.getLogger(settings.APP_NAME)


# ── Application lifespan ─────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup: connect to DuckDB.
    Shutdown: close the DuckDB connection and HTTP client.
    """
    logger.info("%s v%s starting…", settings.APP_NAME, settings.VERSION)

    # ── Startup ──────────────────────────────────────────────
    db.connect()
    logger.info("DuckDB connected at %s", settings.DUCKDB_PATH)

    yield

    # ── Shutdown ─────────────────────────────────────────────
    db.close()
    logger.info("Shutdown complete.")


# ── FastAPI instance ─────────────────────────────────────────

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Natural Language to SQL Data Copilot — uses predefined SQL patterns with DuckDB.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)


# ── CORS ─────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routes ───────────────────────────────────────────────────

app.include_router(router)


# ── Entrypoint ───────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )