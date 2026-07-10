"""
QueryWise AI — Schema Utilities

Transforms DuckDB table schemas into:
  - A human-readable description for LLM prompts
  - A JSON-serialisable structure for API responses
"""

from __future__ import annotations

from typing import Any

from database import db


def build_schema_description(table_name: str | None = None) -> str:
    """
    Build a human-readable schema description for use in LLM prompts.

    Example output:
        Table: orders
          - order_id (INTEGER, nullable: false)
          - customer_name (VARCHAR, nullable: true)
          - total_amount (FLOAT, nullable: false)

    If table_name is None, describes ALL tables.
    """
    if table_name:
        tables = [table_name]
    else:
        tables = db.list_tables()

    if not tables:
        return "No tables available. The database is empty."

    lines: list[str] = []
    for tbl in tables:
        lines.append(f"Table: {tbl}")
        columns = db.get_table_schema(tbl)
        for col in columns:
            nullable_str = "nullable: true" if col["nullable"] else "nullable: false"
            lines.append(f"  - {col['name']} ({col['dtype']}, {nullable_str})")
        lines.append("")  # blank line between tables

    return "\n".join(lines)


def build_compact_schema(table_name: str | None = None) -> str:
    """
    Build a compact one-line-per-table schema for LLM prompts where
    token efficiency matters.

    Example:
        orders: order_id INT, customer_name VARCHAR, total_amount FLOAT
    """
    if table_name:
        tables = [table_name]
    else:
        tables = db.list_tables()

    if not tables:
        return "No tables."

    lines: list[str] = []
    for tbl in tables:
        columns = db.get_table_schema(tbl)
        col_strs = [f"{c['name']} {c['dtype']}" for c in columns]
        lines.append(f"{tbl}: {', '.join(col_strs)}")

    return "\n".join(lines)


def build_full_schema_response() -> dict[str, Any]:
    """Return the full schema as a JSON-serialisable dict (for API)."""
    tables = db.list_tables()
    schema_tables = []
    for tbl in tables:
        columns = db.get_table_schema(tbl)
        schema_tables.append({
            "table_name": tbl,
            "columns": columns,
        })

    return {
        "tables": schema_tables,
        "total_tables": len(schema_tables),
    }