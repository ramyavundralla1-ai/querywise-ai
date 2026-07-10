"""
QueryWise AI — End-to-End API Test Script

Tests all four endpoints:
  1. GET  /        — Health check
  2. POST /upload  — CSV file upload
  3. GET  /schema  — Database schema
  4. POST /query   — Natural-language query

Usage:
    # If the server is not running, start it first:
    uvicorn app:app --reload

    # Then run this script:
    python test_api.py

Or, to start the server automatically and then run tests:
    uvicorn app:app & sleep 2 && python test_api.py
"""

import sys
from pathlib import Path
from httpx import Client, Response

BASE_URL = "http://127.0.0.1:8000"
client = Client(base_url=BASE_URL)

# ── Helpers ──────────────────────────────────────────────────

pass_count = 0
fail_count = 0


def ok(name: str) -> None:
    global pass_count
    pass_count += 1
    print(f"  ✅  PASS  {name}")


def fail(name: str, detail: str) -> None:
    global fail_count
    fail_count += 1
    print(f"  ❌  FAIL  {name}")
    for line in detail.strip().split("\n"):
        print(f"         {line}")


def check(
    name: str,
    resp: Response,
    *,
    expected_status: int = 200,
    check_json_keys: list[str] | None = None,
) -> None:
    if resp.status_code != expected_status:
        fail(name, f"Expected {expected_status}, got {resp.status_code}\nBody: {resp.text[:300]}")
        return
    if check_json_keys:
        try:
            data = resp.json()
        except Exception as exc:
            fail(name, f"Response is not valid JSON: {exc}")
            return
        missing = [k for k in check_json_keys if k not in data]
        if missing:
            fail(name, f"Missing JSON keys: {missing}\nKeys present: {list(data.keys())}")
            return
    ok(name)


# ── 1. Health Check ─────────────────────────────────────────

print("\n─── 1. Health Check ──────────────────────────────────\n")

resp = client.get("/")
check("GET /", resp, check_json_keys=["status", "application", "version"])


# ── 2. Upload a CSV file ────────────────────────────────────

print("\n─── 2. Upload CSV ─────────────────────────────────────\n")

csv_path = Path("test-data/orders_sample.csv")
if not csv_path.exists():
    fail("POST /upload", f"Test file not found: {csv_path.resolve()}")
    print("\n⚠  Skipping remaining upload-dependent tests.\n")
    sys.exit(1)

with open(csv_path, "rb") as f:
    resp = client.post("/upload", files={"file": ("orders_sample.csv", f, "text/csv")})

check("POST /upload (CSV)", resp, check_json_keys=["filename", "table_name", "rows_imported", "columns", "detected_schema"])

# ── Small sanity: upload the same file again as a different table ──
if pass_count > 0:
    with open(csv_path, "rb") as f:
        resp = client.post("/upload", files={"file": ("orders_duplicate.csv", f, "text/csv")})
    check("POST /upload (duplicate, different name)", resp, expected_status=200, check_json_keys=["table_name"])


# ── 3. Schema ────────────────────────────────────────────────

print("\n─── 3. Schema ─────────────────────────────────────────\n")

resp = client.get("/schema")
check("GET /schema", resp, check_json_keys=["tables", "total_tables"])
if resp.status_code == 200:
    data = resp.json()
    print(f"         Tables found: {data['total_tables']}")
    for t in data["tables"]:
        cols = ", ".join(f"{c['name']} ({c['dtype']})" for c in t["columns"])
        print(f"           {t['table_name']}: [{cols}]")


# ── 4. Natural-Language Queries ──────────────────────────────

print("\n─── 4. Queries ────────────────────────────────────────\n")

# ── 4a. Row count ──
resp = client.post("/query", json={"question": "How many orders are there?"})
check("POST /query — 'How many orders are there?'", resp, check_json_keys=["generated_sql", "result", "selected_model", "execution_time"])
if resp.status_code == 200:
    data = resp.json()
    print(f"         SQL:    {data['generated_sql']}")
    print(f"         Model:  {data['selected_model']}")
    print(f"         Result: {data['result']}")
    print(f"         Time:   {data['execution_time']}")
    assert data['selected_model'] == 'fallback-pattern-matcher', "Expected fallback model!"

# ── 4b. All customers ──
resp = client.post("/query", json={"question": "Show all customers"})
check("POST /query — 'Show all customers'", resp, check_json_keys=["generated_sql", "result"])
if resp.status_code == 200:
    data = resp.json()
    print(f"         SQL:    {data['generated_sql']}")
    print(f"         Result: {data['result']}")

# ── 4c. Total revenue ──
resp = client.post("/query", json={"question": "Total revenue"})
check("POST /query — 'Total revenue'", resp, check_json_keys=["generated_sql", "result"])
if resp.status_code == 200:
    data = resp.json()
    print(f"         SQL:    {data['generated_sql']}")
    print(f"         Result: {data['result']}")

# ── 4d. Top customer ──
resp = client.post("/query", json={"question": "Top customer"})
check("POST /query — 'Top customer'", resp, check_json_keys=["generated_sql", "result"])
if resp.status_code == 200:
    data = resp.json()
    print(f"         SQL:    {data['generated_sql']}")
    print(f"         Result: {data['result']}")

# ── 4e. Average price ──
resp = client.post("/query", json={"question": "Average price"})
check("POST /query — 'Average price'", resp, check_json_keys=["generated_sql", "result"])
if resp.status_code == 200:
    data = resp.json()
    print(f"         SQL:    {data['generated_sql']}")
    print(f"         Result: {data['result']}")

# ── 4f. Maximum price ──
resp = client.post("/query", json={"question": "What is the maximum price?"})
check("POST /query — 'Maximum price'", resp, check_json_keys=["generated_sql", "result"])
if resp.status_code == 200:
    data = resp.json()
    print(f"         SQL:    {data['generated_sql']}")
    print(f"         Result: {data['result']}")

# ── 4g. Non-matching question (fallback to SELECT *) ──
resp = client.post("/query", json={"question": "What's the weather like?"})
check("POST /query — 'What's the weather like?' (no-match fallback)", resp, check_json_keys=["generated_sql", "result"])
if resp.status_code == 200:
    data = resp.json()
    print(f"         SQL:    {data['generated_sql']}")
    print(f"         Rows:   {data['rows_returned']}")

# ── 4h. Empty question (validation error) ──
resp = client.post("/query", json={"question": ""})
check("POST /query — empty question (expected 400)", resp, expected_status=400)


# ── Summary ──────────────────────────────────────────────────

print("\n" + "─" * 60)
total = pass_count + fail_count
print(f"\n  Results:  {pass_count} passed  |  {fail_count} failed  |  {total} total\n")
if fail_count > 0:
    sys.exit(1)
else:
    print("  🎉  All tests passed!\n")