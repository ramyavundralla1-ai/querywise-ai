"""
QueryWise AI — API Router

Contains all REST endpoints:
  - GET  /            health check
  - POST /upload      ingest a CSV/TSV file
  - GET  /schema      list all tables & columns
  - POST /query       natural-language → SQL → results
"""

from __future__ import annotations

import logging
import time
import uuid
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse

from config import settings
from database import db
from fallback import fallback_generate_sql
from models import (
    ErrorResponse,
    HealthResponse,
    QueryRequest,
    QueryResponse,
    SchemaResponse,
    TableSchema,
    UploadResponse,
)
from schema import build_full_schema_response

logger = logging.getLogger(__name__)

router = APIRouter()


# ── Helper: build error response ─────────────────────────────

def _error(detail: str, code: str | None = None, http_code: int = 400) -> JSONResponse:
    return JSONResponse(
        status_code=http_code,
        content=ErrorResponse(detail=detail, error_code=code).model_dump(),
    )


# ── GET / — Health Check ─────────────────────────────────────

@router.get("/", response_model=HealthResponse)
async def health():
    """Return a simple health-check response."""
    logger.debug("Health check called")
    return HealthResponse(
        status="running",
        application=settings.APP_NAME,
        version=settings.VERSION,
    )


# ── POST /upload — File Upload ───────────────────────────────

@router.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """
    Accept a CSV or TSV file, store it in DuckDB, and return
    metadata about the imported data.
    """
    # ── Validate ─────────────────────────────────────────────
    if not file.filename:
        return _error("No filename provided.", "NO_FILENAME")

    ext = Path(file.filename).suffix.lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        return _error(
            f"Unsupported file type '{ext}'. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}",
            "INVALID_EXTENSION",
        )

    # ── Save temporarily ─────────────────────────────────────
    upload_dir = Path("data")
    upload_dir.mkdir(exist_ok=True)

    # Use a UUID to avoid filename collisions
    safe_filename = f"{uuid.uuid4().hex}{ext}"
    temp_path = upload_dir / safe_filename

    try:
        content = await file.read()
        if len(content) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
            return _error(
                f"File exceeds {settings.MAX_UPLOAD_SIZE_MB} MB limit.",
                "FILE_TOO_LARGE",
            )
        temp_path.write_bytes(content)
    except Exception as exc:
        logger.error("Failed to save uploaded file: %s", exc)
        return _error("Could not save uploaded file.", "SAVE_FAILED", 500)

    # ── Import into DuckDB ───────────────────────────────────
    table_name = Path(file.filename).stem.replace(" ", "_").replace("-", "_")
    try:
        result = db.import_csv(str(temp_path), table_name)
    except Exception as exc:
        logger.error("DuckDB import failed: %s", exc)
        # Clean up temp file
        temp_path.unlink(missing_ok=True)
        return _error(f"Failed to import file: {exc}", "IMPORT_FAILED", 500)

    # Clean up temp file
    temp_path.unlink(missing_ok=True)

    return UploadResponse(
        filename=file.filename,
        table_name=table_name,
        rows_imported=result["rows_imported"],
        columns=result["columns"],
        detected_schema=result["detected_schema"],
    )


# ── GET /schema — Database Schema ────────────────────────────

@router.get("/schema", response_model=SchemaResponse)
async def get_schema():
    """
    Return the full database schema:
    all tables with their columns, types, and sample values.
    """
    try:
        schema = build_full_schema_response()
        # Convert raw dicts to Pydantic models
        tables = [TableSchema(**t) for t in schema["tables"]]
        return SchemaResponse(tables=tables, total_tables=schema["total_tables"])
    except Exception as exc:
        logger.error("Failed to retrieve schema: %s", exc)
        return _error("Could not retrieve schema.", "SCHEMA_ERROR", 500)


# ── POST /query — NL-to-SQL Query ────────────────────────────

@router.post("/query", response_model=QueryResponse)
async def query(req: QueryRequest):
    """
    Accept a natural-language question, route through the
    NL-to-SQL pipeline, execute the generated SQL, and return
    results alongside metadata (cost, tokens, model used).
    """
    question = req.question.strip()
    if not question:
        return _error("Question cannot be empty.", "EMPTY_QUESTION")

    # ── 1. Validate there's data to query ────────────────────
    tables = db.list_tables()
    if not tables:
        return _error(
            "No datasets uploaded yet. Please upload a CSV/TSV file first.",
            "NO_DATA",
        )

    # ── 2. NL-to-SQL pipeline ────────────────────────────────
    start_time = time.perf_counter()

    try:
        llm_result = await fallback_generate_sql(question, req.table_name)
    except Exception as exc:
        logger.error("Fallback SQL generation failed: %s", exc)
        return _error(
            f"Failed to generate SQL: {exc}",
            "SQL_GEN_ERROR",
            status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    generated_sql = llm_result["generated_sql"]

    # ── 3. Execute the generated SQL ─────────────────────────
    try:
        result_rows = db.execute_sql(generated_sql)
    except RuntimeError as exc:
        # The SQL was valid syntax but execution failed
        logger.warning("SQL execution failed, retrying with fallback: %s", exc)
        # Simple fallback: SELECT * from the first available table
        fallback_table = req.table_name or tables[0]
        fallback_sql = f'SELECT * FROM "{fallback_table}" LIMIT 10'
        try:
            result_rows = db.execute_sql(fallback_sql)
            generated_sql = fallback_sql
            llm_result["generated_sql"] = fallback_sql
        except RuntimeError as fallback_exc:
            return _error(
                f"SQL execution failed: {fallback_exc}",
                "SQL_EXEC_ERROR",
                500,
            )

    elapsed = time.perf_counter() - start_time

    # ── 4. Build response ────────────────────────────────────
    return QueryResponse(
        question=question,
        complexity=llm_result["complexity"],
        selected_model=llm_result["selected_model"],
        generated_sql=generated_sql,
        execution_time=f"{elapsed:.2f}s",
        rows_returned=len(result_rows),
        estimated_tokens=llm_result["estimated_tokens"],
        estimated_cost=llm_result["estimated_cost"],
        cost_saved=llm_result["cost_saved"],
        explanation=llm_result.get("explanation", ""),
        result=result_rows,
    )