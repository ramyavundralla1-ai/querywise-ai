"""
QueryWise AI — Pydantic Models

Request / response schemas for all API endpoints.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


# ── Upload ───────────────────────────────────────────────────

class UploadResponse(BaseModel):
    """Returned after a successful CSV/TSV upload."""

    filename: str
    table_name: str
    rows_imported: int
    columns: list[str]
    detected_schema: dict[str, str]


# ── Schema ───────────────────────────────────────────────────

class ColumnInfo(BaseModel):
    """Metadata for a single column."""

    name: str
    dtype: str
    nullable: bool
    sample_values: list[Any] = []


class TableSchema(BaseModel):
    """Schema for one table in DuckDB."""

    table_name: str
    columns: list[ColumnInfo]


class SchemaResponse(BaseModel):
    """Full schema listing."""

    tables: list[TableSchema]
    total_tables: int


# ── Query ────────────────────────────────────────────────────

class QueryRequest(BaseModel):
    """Incoming natural-language query."""

    question: str = Field(..., min_length=1, max_length=2000, description="Natural language question")
    table_name: str | None = Field(None, description="Optional: scope to a specific table")


class QueryResultRow(BaseModel):
    """A single result row (key-value pairs)."""

    data: dict[str, Any]


class QueryResponse(BaseModel):
    """Full response to a user's question."""

    question: str
    complexity: str  # "simple" | "medium" | "complex"
    selected_model: str
    generated_sql: str
    execution_time: str  # human-readable, e.g. "0.34s"
    rows_returned: int
    estimated_tokens: int
    estimated_cost: float
    cost_saved: float  # percentage saved vs. traditional approach
    explanation: str = ""  # plain-English explanation of the query
    result: list[dict[str, Any]]


# ── Error ────────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    """Standard error envelope."""

    detail: str
    error_code: str | None = None
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


# ── Health ───────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    application: str
    version: str = ""