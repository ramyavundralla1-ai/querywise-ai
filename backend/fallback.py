"""
QueryWise AI — Fallback SQL Router (Enhanced)

Predefined SQL patterns for common natural-language questions with
intelligent schema-aware column resolution and complexity detection.

Eliminates Fireworks API dependency entirely.
Logs every use so operators know fallback mode is active.
"""

from __future__ import annotations

import logging
import re
from typing import Any

from config import settings
from database import db

logger = logging.getLogger(__name__)


# ── Complexity detection ────────────────────────────────────

def detect_complexity(sql: str) -> str:
    """Detect SQL complexity: simple, medium, or complex."""
    sql_lower = sql.lower()
    has_group = "group by" in sql_lower
    has_order = "order by" in sql_lower
    has_where = "where" in sql_lower
    has_subquery = sql_lower.count("(") > 1 and "select" in sql_lower
    has_join = "join" in sql_lower
    has_having = "having" in sql_lower

    score = 0
    if has_having or has_join or has_subquery:
        score += 3
    if has_group:
        score += 2
    if has_where:
        score += 1
    if has_order:
        score += 1

    if score >= 3:
        return "complex"
    if score >= 2:
        return "medium"
    return "simple"


# ── Pattern definitions ──────────────────────────────────────
# (compiled_regex,           sql_template,                                         description)

PATTERNS: list[tuple[re.Pattern, str, str]] = [
    # ── Count ──
    (
        re.compile(r"(how many|count|total number of)\s+(orders|records|rows|entries|items|products)"),
        "SELECT COUNT(*) AS total FROM {table}",
        "Row count",
    ),
    # ── Distinct list ──
    (
        re.compile(r"show\s+(all|distinct|unique|the)\s+(customers|users|clients|people|names|records|entries|categories|products|regions|cities)"),
        "SELECT DISTINCT {col_group} FROM {table} ORDER BY {col_group}",
        "Distinct values",
    ),
    (
        re.compile(r"list\s+(all|the|)\s*(customers|users|clients|people|names|categories|products|regions)"),
        "SELECT {col_group} FROM {table} ORDER BY {col_group}",
        "List values",
    ),
    # ── Total / Sum ──
    (
        re.compile(r"total\s+(revenue|sales|amount|sum|earnings|income|spend|profit)"),
        "SELECT SUM({col_numeric}) AS total FROM {table}",
        "Total aggregation",
    ),
    (
        re.compile(r"(revenue|sales|earnings)\s+(by|per|for)\s+(category|region|product|customer|month|year|quarter)"),
        "SELECT {col_group}, SUM({col_numeric}) AS total FROM {table} GROUP BY {col_group} ORDER BY total DESC",
        "Revenue by group",
    ),
    # ── Top N ──
    (
        re.compile(r"top\s+(\d+)\s+(customer|user|client|buyer|seller|product|item|category|region)"),
        "SELECT {col_group}, SUM({col_numeric}) AS total FROM {table} GROUP BY {col_group} ORDER BY total DESC LIMIT {limit}",
        "Top N contributor",
    ),
    (
        re.compile(r"top\s+(customer|user|client|buyer|seller)"),
        "SELECT {col_group}, SUM({col_numeric}) AS total FROM {table} GROUP BY {col_group} ORDER BY total DESC LIMIT 1",
        "Top contributor",
    ),
    (
        re.compile(r"(best|highest|most popular|top)\s+(selling|sold)\s+(product|item)"),
        "SELECT {col_group}, SUM({col_numeric}) AS total FROM {table} GROUP BY {col_group} ORDER BY total DESC LIMIT 1",
        "Best selling product",
    ),
    (
        re.compile(r"(lowest|worst|least|bottom)\s+(selling|sold)\s+(product|item)"),
        "SELECT {col_group}, SUM({col_numeric}) AS total FROM {table} GROUP BY {col_group} ORDER BY total ASC LIMIT 1",
        "Worst selling product",
    ),
    # ── Averages ──
    (
        re.compile(r"(average|mean|avg)\s+(price|value|cost|amount|revenue|sales|order|rating|score)"),
        "SELECT AVG({col_numeric}) AS average FROM {table}",
        "Average value",
    ),
    (
        re.compile(r"(average|mean|avg)\s+(price|value|cost|amount|revenue|sales|order|rating|score)\s+(by|per|for)\s+(category|region|product|customer)"),
        "SELECT {col_group}, AVG({col_numeric}) AS average FROM {table} GROUP BY {col_group} ORDER BY average DESC",
        "Average by group",
    ),
    # ── Min / Max ──
    (
        re.compile(r"(maximum|max|largest|highest|most expensive)"),
        "SELECT MAX({col_numeric}) AS maximum FROM {table}",
        "Maximum value",
    ),
    (
        re.compile(r"(minimum|min|smallest|lowest|least expensive)"),
        "SELECT MIN({col_numeric}) AS minimum FROM {table}",
        "Minimum value",
    ),
    # ── Date filtering ──
    (
        re.compile(r"(recent|latest|newest)\s+(orders?|sales?|records?|entries?)"),
        "SELECT * FROM {table} ORDER BY {col_date} DESC LIMIT 10",
        "Recent records",
    ),
    (
        re.compile(r"(month|monthly)\s+(sales|revenue|orders?|totals?|summary)"),
        "SELECT {col_date_trunc_month}, SUM({col_numeric}) AS total FROM {table} GROUP BY {col_date_trunc_month} ORDER BY {col_date_trunc_month}",
        "Monthly sales",
    ),
    # ── Order / Sort ──
    (
        re.compile(r"(sort|order|arrange)\s+(by|according)\s+(.{3,30})"),
        "SELECT * FROM {table} ORDER BY {col_numeric} DESC LIMIT 50",
        "Sorted data",
    ),
    # ── Show all data ──
    (
        re.compile(r"show\s+(all|the|me)\s+(data|records|rows|everything|table|content|results)"),
        "SELECT * FROM {table} LIMIT 100",
        "All data",
    ),
    # ── Schema ──
    (
        re.compile(r"(schema|columns|structure|fields)"),
        "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{table_name_literal}'",
        "Table schema",
    ),
    # ── Unique counts ──
    (
        re.compile(r"(unique|distinct)\s+(count|values?)\s+of\s+(.+?)$"),
        "SELECT COUNT(DISTINCT {col_group}) AS unique_count FROM {table}",
        "Unique count",
    ),
    (
        re.compile(r"how\s+many\s+(different|unique|distinct)\s+(customers|users|cities|regions|categories|products|types)"),
        "SELECT COUNT(DISTINCT {col_group}) AS unique_count FROM {table}",
        "Unique count",
    ),
    # ── Statistics ──
    (
        re.compile(r"(describe|summary|overview|stats|statistics|analyze)"),
        "SELECT COUNT(*) AS total_rows, AVG({col_numeric}) AS avg_value, MIN({col_numeric}) AS min_value, MAX({col_numeric}) AS max_value FROM {table}",
        "Table statistics",
    ),
    # ── Category / Customer / Product analysis ──
    (
        re.compile(r"(revenue|sales|earnings)\s+(by|per)\s+(category|region)"),
        "SELECT {col_group}, SUM({col_numeric}) AS total FROM {table} GROUP BY {col_group} ORDER BY total DESC",
        "Revenue by category/region",
    ),
    (
        re.compile(r"(customer|user|client)\s+(analysis|analytics|behavior|spending|purchases)"),
        "SELECT {col_group}, COUNT(*) AS purchase_count, SUM({col_numeric}) AS total_spent FROM {table} GROUP BY {col_group} ORDER BY total_spent DESC",
        "Customer analysis",
    ),
    (
        re.compile(r"(product|item)\s+(analysis|analytics|performance|popularity)"),
        "SELECT {col_group}, COUNT(*) AS sales_count, SUM({col_numeric}) AS total_revenue FROM {table} GROUP BY {col_group} ORDER BY total_revenue DESC",
        "Product analysis",
    ),
    (
        re.compile(r"(category|region)\s+(analysis|analytics|performance|breakdown)"),
        "SELECT {col_group}, COUNT(*) AS count, SUM({col_numeric}) AS total FROM {table} GROUP BY {col_group} ORDER BY total DESC",
        "Category/region analysis",
    ),
    (
        re.compile(r"(highest|best)\s+(selling|performing)\s+(product|item|category)"),
        "SELECT {col_group}, SUM({col_numeric}) AS total FROM {table} GROUP BY {col_group} ORDER BY total DESC LIMIT 1",
        "Best performer",
    ),
]


# ── Column resolution helpers ────────────────────────────────

_GROUP_KEYWORDS: list[str] = [
    "customer", "name", "category", "type", "group",
    "class", "segment", "region", "country", "city",
    "state", "department", "status", "gender", "product",
    "brand", "supplier", "vendor", "store", "channel",
]

_NUMERIC_KEYWORDS: list[str] = [
    "price", "amount", "revenue", "sales", "total",
    "cost", "value", "quantity", "count", "sum",
    "income", "spend", "spent", "budget", "profit",
    "salary", "wage", "rate", "fee", "charge",
    "score", "rating", "units", "discount", "tax",
]

_DATE_KEYWORDS: list[str] = [
    "date", "time", "timestamp", "day", "month", "year",
    "created", "updated", "datetime", "period", "quarter",
]


def _find_group_column(columns: list[dict[str, Any]]) -> str | None:
    """Return the most likely categorical/grouping column name."""
    candidates = []
    for col in columns:
        name_lower = col["name"].lower()
        dtype = col["dtype"].upper()
        if "CHAR" in dtype or "TEXT" in dtype or "VARCHAR" in dtype:
            # Skip obvious date strings
            if any(kw in name_lower for kw in ("date", "time", "timestamp")):
                continue
            for kw in _GROUP_KEYWORDS:
                if kw in name_lower:
                    candidates.append((_score_group_match(name_lower), col["name"]))
                    break
    if candidates:
        candidates.sort(key=lambda x: -x[0])
        return candidates[0][1]

    for col in columns:
        dtype = col["dtype"].upper()
        if "CHAR" in dtype or "TEXT" in dtype or "VARCHAR" in dtype:
            return col["name"]

    return None


def _score_group_match(name: str) -> int:
    score = 0
    for kw in _GROUP_KEYWORDS:
        if name == kw:
            score += 10
        elif name.startswith(kw) or name.endswith(kw):
            score += 5
        elif kw in name:
            score += 2
    return score


def _find_numeric_column(columns: list[dict[str, Any]]) -> str | None:
    """Return the most likely numeric/measure column name."""
    candidates = []
    for col in columns:
        name_lower = col["name"].lower()
        dtype = col["dtype"].upper()
        is_numeric = any(t in dtype for t in ("INT", "FLOAT", "DOUBLE", "DECIMAL", "NUMERIC", "REAL"))
        if is_numeric:
            for kw in _NUMERIC_KEYWORDS:
                if kw in name_lower:
                    candidates.append((_score_numeric_match(name_lower), col["name"]))
                    break
    if candidates:
        candidates.sort(key=lambda x: -x[0])
        return candidates[0][1]

    for col in columns:
        dtype = col["dtype"].upper()
        if any(t in dtype for t in ("INT", "FLOAT", "DOUBLE", "DECIMAL", "NUMERIC", "REAL")):
            return col["name"]

    return None


def _score_numeric_match(name: str) -> int:
    score = 0
    for kw in _NUMERIC_KEYWORDS:
        if name == kw:
            score += 10
        elif name.startswith(kw) or name.endswith(kw):
            score += 5
        elif kw in name:
            score += 2
    return score


def _find_date_column(columns: list[dict[str, Any]]) -> str | None:
    """Return the most likely date/timestamp column name."""
    for col in columns:
        name_lower = col["name"].lower()
        dtype = col["dtype"].upper()
        is_date_like = any(t in dtype for t in ("DATE", "TIMESTAMP", "DATETIME"))
        if is_date_like:
            return col["name"]
        # Check by name for string dates
        if any(kw in name_lower for kw in _DATE_KEYWORDS):
            return col["name"]
    return None


# ── Pattern matching ─────────────────────────────────────────

def match_pattern(question: str) -> tuple[str, str] | None:
    """
    Try to match a question against predefined patterns.
    Returns (matched_template, description) on success, or None.
    """
    lower = question.lower().strip()
    for regex, template, description in PATTERNS:
        if regex.search(lower):
            logger.debug("Fallback pattern matched: '%s' — %s", regex.pattern, description)
            return template, description
    return None


def resolve_template(
    template: str,
    table_name: str,
    question: str | None = None,
) -> str:
    """
    Replace placeholders in a matched SQL template with actual
    table and column names.

    Placeholders:
      {table}              — quoted table identifier
      {table_name_literal} — raw table name
      {col_group}          — best grouping column
      {col_numeric}        — best numeric column
      {col_date}           — best date column
      {col_date_trunc_month} — date column truncated to month
      {limit}              — numeric limit from question (default 1)
    """
    columns = db.get_table_schema(table_name)
    group_col = _find_group_column(columns)
    numeric_col = _find_numeric_column(columns)
    date_col = _find_date_column(columns)

    safe_table = f'"{table_name}"'

    # Extract limit from top N questions
    limit = "1"
    if question:
        m = re.search(r"top\s+(\d+)", question.lower())
        if m:
            limit = m.group(1)

    # Date truncation for monthly queries
    date_trunc_expr = safe_table
    if date_col:
        safe_date = f'"{date_col}"'
        date_trunc_expr = f"DATE_TRUNC('month', {safe_date})"

    replacements = {
        "{table}": safe_table,
        "{table_name_literal}": table_name,
        "{col_group}": f'"{group_col}"' if group_col else safe_table,
        "{col_numeric}": f'"{numeric_col}"' if numeric_col else safe_table,
        "{col_date}": f'"{date_col}"' if date_col else safe_table,
        "{col_date_trunc_month}": date_trunc_expr,
        "{limit}": limit,
    }

    result = template
    for placeholder, value in replacements.items():
        if placeholder in result:
            result = result.replace(placeholder, value)

    # Final safety: any remaining un-resolved placeholders use table
    for unresolved in ["{col_group}", "{col_numeric}", "{col_date}", "{col_date_trunc_month}"]:
        result = result.replace(unresolved, safe_table)

    return result


# ── Plain English explanation generator ──────────────────────

def generate_explanation(question: str, sql: str, complexity: str) -> str:
    """Generate a concise plain-English explanation of the SQL."""
    sql_lower = sql.lower()

    agg_descriptions = {
        "count": "counting",
        "sum": "calculating the total",
        "avg": "calculating the average",
        "max": "finding the highest",
        "min": "finding the lowest",
    }

    action = "retrieving"
    for agg_type, desc in agg_descriptions.items():
        if agg_type in sql_lower:
            action = desc
            break

    target = ""
    if "group by" in sql_lower:
        target = " grouped by the relevant category"
    if "order by" in sql_lower and "limit" in sql_lower:
        target += ", ranked and limited to the top results"
    elif "order by" in sql_lower:
        target += ", sorted by value"
    if "where" in sql_lower:
        target += ", filtered to match specific conditions"

    explanation = (
        f"This query answers \"{question}\" by {action} the data{target}. "
        f"Complexity: **{complexity}**. The SQL joins the relevant DuckDB table "
        f"and returns a structured result set."
    )
    return explanation


# ── Public API ───────────────────────────────────────────────

async def fallback_generate_sql(
    question: str,
    table_name: str | None = None,
) -> dict[str, Any]:
    """
    Generate SQL from a natural-language question using predefined
    patterns instead of an LLM.

    This is the fallback mode — logs every invocation.
    Returns dict with keys:
      - complexity, selected_model, generated_sql
      - estimated_tokens, estimated_cost, cost_saved
      - explanation (plain English)
    """
    logger.info("FALLBACK MODE — generating SQL for: %s", question[:80])

    # Determine which table to use
    tables = db.list_tables()
    if not tables:
        raise RuntimeError("No datasets uploaded yet.")

    target_table = table_name if table_name and table_name in tables else tables[0]

    # Try pattern matching
    matched = match_pattern(question)
    if matched:
        template = matched[0]
        sql = resolve_template(template, target_table, question)
        logger.info("Fallback SQL generated: %s", sql[:120])
    else:
        # No pattern matched — return a basic SELECT as fallback
        sql = f'SELECT * FROM "{target_table}" LIMIT 50'
        logger.info("No pattern matched — returning default SELECT for '%s'", target_table)

    # Rough token estimation
    estimated_tokens = len(sql) // 4

    # Complexity detection
    complexity = detect_complexity(sql)

    # Plain English explanation
    explanation = generate_explanation(question, sql, complexity)

    return {
        "complexity": complexity,
        "selected_model": "fallback-pattern-matcher",
        "generated_sql": sql,
        "estimated_tokens": estimated_tokens,
        "estimated_cost": 0.0,
        "cost_saved": 100.0,  # 100% saved vs traditional LLM
        "explanation": explanation,
    }