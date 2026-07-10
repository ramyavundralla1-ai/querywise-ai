"""
QueryWise AI — Configuration Module

Centralized configuration loaded from environment variables.
All API keys, model names, and runtime settings live here.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # ── Application ──────────────────────────────────────────
    APP_NAME: str = "QueryWise AI"
    VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"

    # ── Server ───────────────────────────────────────────────
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # ── Fireworks AI ─────────────────────────────────────────
    FIREWORKS_API_KEY: str = os.getenv("FIREWORKS_API_KEY", "")
    FIREWORKS_BASE_URL: str = "https://api.fireworks.ai/inference/v1"

    # ── Gemma Models ─────────────────────────────────────────
    # Simple queries → lightweight model (faster, cheaper)
    GEMMA_LIGHT_MODEL: str = "accounts/fireworks/models/gemma-2-2b-it"
    # Complex queries → full model (better reasoning)
    GEMMA_FULL_MODEL: str = "accounts/fireworks/models/gemma-2-9b-it"

    # ── Complexity Thresholds ────────────────────────────────
    COMPLEXITY_KEYWORD_THRESHOLD: int = 3  # keywords → complex
    # Token thresholds for cost estimation
    TOKEN_COST_PER_1K_LIGHT: float = 0.0002  # $ per 1K tokens (light model)
    TOKEN_COST_PER_1K_FULL: float = 0.0006  # $ per 1K tokens (full model)
    # Estimated traditional cost (data analyst + engineering hours)
    TRADITIONAL_COST_PER_QUERY: float = 5.00

    # ── DuckDB ───────────────────────────────────────────────
    DUCKDB_PATH: str = os.getenv("DUCKDB_PATH", "data/querywise.duckdb")

    # ── Upload ───────────────────────────────────────────────
    MAX_UPLOAD_SIZE_MB: int = 50
    ALLOWED_EXTENSIONS: set[str] = {".csv", ".tsv", ".parquet"}

    # ── Logging ──────────────────────────────────────────────
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")


settings = Settings()