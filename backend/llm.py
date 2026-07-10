"""
QueryWise AI — LLM Integration (Fireworks AI + Gemma)

Handles:
  - Complexity classification (simple vs. complex)
  - Model routing (light vs. full Gemma model)
  - SQL generation via Fireworks AI Chat Completions API
  - Token and cost estimation
"""

from __future__ import annotations

import logging
import re
from typing import Any

import httpx

from config import settings
from schema import build_compact_schema

logger = logging.getLogger(__name__)


# ── HTTP client (shared, so connections are pooled) ──────────

_client: httpx.AsyncClient | None = None


async def get_client() -> httpx.AsyncClient:
    """Return a shared async HTTP client (lazy-initialised)."""
    global _client
    if _client is None:
        _client = httpx.AsyncClient(
            base_url=settings.FIREWORKS_BASE_URL,
            timeout=30.0,
        )
    return _client


async def close_client() -> None:
    """Gracefully shut down the HTTP client."""
    global _client
    if _client:
        await _client.aclose()
        _client = None


# ── Complexity classification ────────────────────────────────

# Keywords that indicate a more complex analytical question
_COMPLEXITY_KEYWORDS: set[str] = {
    # Aggregations
    "average", "median", "percentile", "variance", "standard deviation",
    "correlation", "distribution", "histogram",
    # Multi-step
    "compare", "percentage", "ratio", "proportion", "rank", "dense rank",
    "running total", "cumulative", "moving average", "window function",
    "partition", "lag", "lead",
    # Joins
    "join", "combined", "together with", "versus",
    # Time-based
    "year-over-year", "month-over-month", "quarter-over-quarter",
    "previous month", "previous year", "same period",
    # Subqueries
    "most", "least", "top", "bottom", "maximum", "minimum",
    "greater than average", "higher than",
    # Multiple conditions
    "filtered by", "grouped by", "with at least", "having",
}


def classify_complexity(question: str) -> str:
    """
    Classify a natural-language question as 'simple' or 'complex'.

    Rules:
      - If the question matches >= COMPLEXITY_KEYWORD_THRESHOLD
        keywords → 'complex'
      - Otherwise → 'simple'

    This is purposely fast (no extra LLM call).
    """
    lower = question.lower()
    match_count = sum(1 for kw in _COMPLEXITY_KEYWORDS if kw in lower)

    if match_count >= settings.COMPLEXITY_KEYWORD_THRESHOLD:
        logger.debug("Complexity: complex (%d keyword matches)", match_count)
        return "complex"

    logger.debug("Complexity: simple (%d keyword matches)", match_count)
    return "simple"


def select_model(complexity: str) -> str:
    """
    Route to the appropriate Gemma model based on complexity.
    """
    if complexity == "complex":
        return settings.GEMMA_FULL_MODEL
    return settings.GEMMA_LIGHT_MODEL


# ── SQL generation ───────────────────────────────────────────

def _build_system_prompt(schema_text: str) -> str:
    """Build the system prompt that instructs the LLM how to generate SQL."""
    return f"""You are an expert SQL generator. Your job is to convert natural-language questions into correct, efficient SQL queries for DuckDB.

## Database Schema
{schema_text}

## Rules
1. Only output valid DuckDB SQL — no MySQL, PostgreSQL, or other dialects.
2. Use double quotes for identifiers (table/column names) only if they contain special characters.
3. Use single quotes for string literals.
4. Always add a LIMIT clause if the question asks for "top", "bottom", "most", "least", or "best".
5. For aggregate queries, always include a GROUP BY and ORDER BY.
6. Use COALESCE to handle NULL values where appropriate.
7. Output ONLY the SQL — no markdown, no explanations, no backticks. Just the SQL statement.
8. End every statement with a semicolon.
"""


def _build_user_prompt(question: str) -> str:
    """Build the user prompt with the natural-language question."""
    return f"Translate this question into SQL: {question}"


async def generate_sql(
    question: str,
    table_name: str | None = None,
) -> dict[str, Any]:
    """
    Full NL-to-SQL pipeline.

    Returns
    -------
    dict with keys:
      - complexity
      - selected_model
      - generated_sql
      - estimated_tokens
      - estimated_cost
      - cost_saved
    """
    # 1. Classify complexity
    complexity = classify_complexity(question)
    model = select_model(complexity)

    # 2. Get schema
    schema_text = build_compact_schema(table_name)

    # 3. Build prompts
    system_prompt = _build_system_prompt(schema_text)
    user_prompt = _build_user_prompt(question)

    # 4. Call Fireworks AI
    logger.info("Calling %s for question: %s", model, question[:60])
    sql = await _call_fireworks(model, system_prompt, user_prompt)

    # 5. Estimate tokens (rough heuristic: ~4 chars per token)
    prompt_chars = len(system_prompt) + len(user_prompt)
    completion_chars = len(sql)
    estimated_prompt_tokens = prompt_chars // 4
    estimated_completion_tokens = completion_chars // 4
    total_tokens = estimated_prompt_tokens + estimated_completion_tokens

    # 6. Estimate cost
    cost_per_1k = (
        settings.TOKEN_COST_PER_1K_LIGHT
        if model == settings.GEMMA_LIGHT_MODEL
        else settings.TOKEN_COST_PER_1K_FULL
    )
    estimated_cost = round((total_tokens / 1000) * cost_per_1k, 6)

    # 7. Calculate savings vs. traditional approach
    traditional = settings.TRADITIONAL_COST_PER_QUERY
    cost_saved = round((1 - (estimated_cost / traditional)) * 100, 1)

    logger.info(
        "Generated SQL (%d tokens, $%.6f): %s",
        total_tokens,
        estimated_cost,
        sql[:80],
    )

    return {
        "complexity": complexity,
        "selected_model": model,
        "generated_sql": sql,
        "estimated_tokens": total_tokens,
        "estimated_cost": estimated_cost,
        "cost_saved": cost_saved,
    }


# ── Fireworks AI API call ────────────────────────────────────

async def _call_fireworks(
    model: str,
    system_prompt: str,
    user_prompt: str,
) -> str:
    """
    Send a chat completion request to Fireworks AI.

    Returns the generated text (SQL), stripped and cleaned.
    """
    client = await get_client()

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.1,  # low temperature for deterministic SQL
        "max_tokens": 1024,
        "top_p": 0.9,
    }

    headers = {
        "Authorization": f"Bearer {settings.FIREWORKS_API_KEY}",
        "Content-Type": "application/json",
    }

    try:
        response = await client.post("/chat/completions", json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()

        raw = data["choices"][0]["message"]["content"]

        # Strip markdown code fences if present
        cleaned = _clean_sql_output(raw)
        return cleaned

    except httpx.HTTPStatusError as exc:
        logger.error("Fireworks API error %s: %s", exc.response.status_code, exc.response.text)
        raise RuntimeError(f"LLM API error: {exc.response.status_code}") from exc
    except httpx.TimeoutException:
        logger.error("Fireworks API timed out")
        raise RuntimeError("LLM API timed out. Please try again.")
    except (KeyError, IndexError) as exc:
        logger.error("Unexpected Fireworks response format: %s", exc)
        raise RuntimeError("Unexpected response from LLM API.") from exc


def _clean_sql_output(raw: str) -> str:
    """
    Strip markdown fences, leading/trailing whitespace, and
    ensure the SQL ends with a semicolon.
    """
    # Remove ```sql ... ``` fences
    cleaned = re.sub(r"```(?:sql)?\s*", "", raw, flags=re.IGNORECASE)
    # Remove backticks around identifiers (we want clean SQL)
    cleaned = cleaned.strip()

    # Ensure trailing semicolon
    if not cleaned.endswith(";"):
        cleaned += ";"

    return cleaned