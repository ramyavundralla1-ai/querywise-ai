"""
QueryWise AI — DuckDB Database Module

Handles all database operations:
  - Table creation from uploaded files
  - Schema introspection
  - SQL execution
  - Connection lifecycle (singleton)

Uses DuckDB for lightweight, in-process analytical SQL.
"""

from __future__ import annotations

import os
import logging
from pathlib import Path
from typing import Any

import duckdb
import pandas as pd

from config import settings

logger = logging.getLogger(__name__)


class DatabaseManager:
    """Singleton-style wrapper around a DuckDB connection."""

    def __init__(self) -> None:
        self._conn: duckdb.DuckDBPyConnection | None = None

    # ── Connection lifecycle ─────────────────────────────────

    def connect(self) -> None:
        """Open (or re-open) the DuckDB connection."""
        db_path = Path(settings.DUCKDB_PATH)
        # Ensure parent directory exists
        db_path.parent.mkdir(parents=True, exist_ok=True)
        self._conn = duckdb.connect(str(db_path))
        logger.info("Connected to DuckDB at %s", db_path)
        # Install and load optional extensions for performance
        self._conn.execute("INSTALL 'json'")
        self._conn.execute("LOAD 'json'")
        self._conn.execute("INSTALL 'parquet'")
        self._conn.execute("LOAD 'parquet'")

    def close(self) -> None:
        """Close the connection gracefully."""
        if self._conn:
            self._conn.close()
            self._conn = None
            logger.info("DuckDB connection closed.")

    @property
    def conn(self) -> duckdb.DuckDBPyConnection:
        if self._conn is None:
            raise RuntimeError("Database not connected. Call .connect() first.")
        return self._conn

    # ── Table operations ─────────────────────────────────────

    def import_csv(self, file_path: str, table_name: str) -> dict[str, Any]:
        """
        Import a CSV/TSV/Parquet file into a DuckDB table.

        Parameters
        ----------
        file_path : str
            Absolute or relative path to the file.
        table_name : str
            Target table name (auto-sanitised).

        Returns
        -------
        dict with keys: rows_imported, columns, detected_schema
        """
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        ext = path.suffix.lower()

        # ── Parquet: read directly with DuckDB ────────────────
        if ext == ".parquet":
            self.conn.execute(
                f"CREATE OR REPLACE TABLE {self._safe_name(table_name)} AS "
                f"SELECT * FROM read_parquet('{file_path}')"
            )
        else:
            # ── CSV / TSV: read via Pandas for type inference ─
            sep = "\t" if ext == ".tsv" else ","
            df = pd.read_csv(file_path, sep=sep, encoding="utf-8", nrows=None)
            # Sanitise column names: replace spaces/special chars with underscores
            df.columns = [str(c).strip().replace(" ", "_").replace("-", "_") for c in df.columns]
            self.conn.register("_tmp_df", df)
            self.conn.execute(
                f"CREATE OR REPLACE TABLE {self._safe_name(table_name)} AS SELECT * FROM _tmp_df"
            )
            self.conn.unregister("_tmp_df")

        # Build schema info
        schema_info = self._detect_columns(table_name)
        rows_imported = self.conn.execute(
            f"SELECT COUNT(*) FROM {self._safe_name(table_name)}"
        ).fetchone()[0]

        logger.info(
            "Imported %d rows into '%s' — columns: %s",
            rows_imported,
            table_name,
            list(schema_info.keys()),
        )

        return {
            "rows_imported": rows_imported,
            "columns": list(schema_info.keys()),
            "detected_schema": schema_info,
        }

    def list_tables(self) -> list[str]:
        """Return all user-created table names."""
        result = self.conn.execute(
            "SELECT table_name FROM information_schema.tables "
            "WHERE table_schema = 'main' AND table_type = 'BASE TABLE' "
            "ORDER BY table_name"
        ).fetchall()
        return [row[0] for row in result]

    def get_table_schema(self, table_name: str) -> list[dict[str, Any]]:
        """
        Return column-level metadata for a given table.
        Each item: {name, dtype, nullable, sample_values}.
        """
        columns = self._detect_columns(table_name)
        schema = []
        for col_name, dtype in columns.items():
            # Check nullability
            null_count = self.conn.execute(
                f"SELECT COUNT(*) FROM {self._safe_name(table_name)} WHERE "
                f'"{col_name}" IS NULL'
            ).fetchone()[0]
            total_rows = self.conn.execute(
                f"SELECT COUNT(*) FROM {self._safe_name(table_name)}"
            ).fetchone()[0]
            nullable = null_count > 0 and total_rows > 0

            # Sample up to 5 non-null values
            samples = self.conn.execute(
                f'SELECT DISTINCT "{col_name}" FROM {self._safe_name(table_name)} '
                f'WHERE "{col_name}" IS NOT NULL LIMIT 5'
            ).fetchall()
            sample_values = [row[0] for row in samples]

            schema.append({
                "name": col_name,
                "dtype": dtype,
                "nullable": nullable,
                "sample_values": sample_values,
            })

        return schema

    def execute_sql(self, sql: str) -> list[dict[str, Any]]:
        """
        Execute arbitrary SQL and return results as a list of dicts.
        Raises RuntimeError on failure.
        """
        try:
            result = self.conn.execute(sql)
            if result is None:
                return []
            columns = [desc[0] for desc in result.description]
            rows = result.fetchall()
            return [dict(zip(columns, row)) for row in rows]
        except Exception as exc:
            logger.error("SQL execution failed: %s", exc)
            raise RuntimeError(f"SQL execution error: {exc}") from exc

    # ── Helpers ──────────────────────────────────────────────

    def _safe_name(self, name: str) -> str:
        """Quote an identifier for safe SQL usage."""
        safe = name.replace('"', '""')
        return f'"{safe}"'

    def _detect_columns(self, table_name: str) -> dict[str, str]:
        """Return {column_name: duckdb_type} for a table."""
        safe = self._safe_name(table_name)
        result = self.conn.execute(
            f"SELECT column_name, data_type FROM information_schema.columns "
            f"WHERE table_schema = 'main' AND table_name = '{table_name.replace(chr(39), chr(39)*2)}'"
            f"ORDER BY ordinal_position"
        ).fetchall()
        return {row[0]: row[1] for row in result}


# Module-level singleton
db = DatabaseManager()