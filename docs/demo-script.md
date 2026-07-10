# QueryWise AI — 2-Minute Demo Script

> **Target audience:** Hackathon judges, technical evaluators
> **Tone:** Confident, clear, polished
> **Total time:** ~2 minutes

---

## ⏱ Timing Breakdown

| Section | Time | Elapsed |
|---------|------|---------|
| Hook & Introduction | 20s | 0:20 |
| Upload Data | 25s | 0:45 |
| Natural Language Query | 35s | 1:20 |
| Advanced Query + Cost Savings | 30s | 1:50 |
| Closing | 10s | 2:00 |

---

## 🎬 Script

### [0:00–0:20] Hook & Introduction

> *(Open the app showing the Dashboard with dark UI)*

**You:** "Hi—this is **QueryWise AI**, a natural-language-to-SQL copilot that lets anyone ask questions about their data in plain English and get instant answers. No SQL training required. No waiting for a data team."

> *(Gesture to the clean dashboard)*

**You:** "It's built with **React, TypeScript, FastAPI, and DuckDB** — and it works offline with zero API keys if needed."

---

### [0:20–0:45] Upload Data

> *(Click the upload button / drag a file)*

**You:** "Let me show you how it works. I'm going to upload a CSV of sample orders — drag and drop, that's it. The backend automatically detects the schema and ingests the data into DuckDB."

> *(Wait for the success confirmation — 3 seconds)*

**You:** "Done. The system recognised **6 columns** — customer name, product, quantity, price, date, and region — and imported **25 rows** in milliseconds. I'm now redirected to the chat interface."

---

### [0:45–1:20] Natural Language Query

> *(Type in the chat input)*

**You:** "I'll ask a simple question: *'What were total sales by region?'*"

> *(Click send — wait for response)*

**You:** "QueryWise classifies this as a **simple query**, routes it to the lightweight engine, generates the SQL — `SELECT region, SUM(total)... GROUP BY region` — executes it, and returns the answer. Notice the **SQL block** is syntax-highlighted, there's a **complexity badge**, and the **cost badge** shows this query cost less than a cent. The whole thing took **0.023 seconds**."

---

### [1:20–1:50] Advanced Query + Cost Savings

> *(Type a more complex question)*

**You:** "Let's try something harder: *'What is the monthly revenue trend?'*"

> *(Wait for response)*

**You:** "The system detected this as **moderate complexity** and routed it to the full Gemma model. It generated a SQL with `DATE_TRUNC` and `GROUP BY month`, executed it, and showed that **82% of the cost was saved** compared to a traditional data analyst approach. This cost transparency is built into every query — businesses can track exactly what they're spending on data insights."

---

### [1:50–2:00] Closing

> *(Return to the dashboard showing stats)*

**You:** "QueryWise AI is **production-ready** — fully Dockerized, offline-capable, with a clean API. It democratises data access without sacrificing power.

Thank you. I'm happy to answer any questions."

---

## 🎯 Key Points to Emphasize

1. **Zero SQL required** from the user
2. **Dual engine** — Fireworks AI LLM + offline pattern matcher
3. **Cost transparency** — every query shows token/cost/savings
4. **Fast** — DuckDB executes analytical queries in milliseconds
5. **Docker ready** — one command to deploy
6. **Hackathon built** — demonstrates practical AI + data engineering

## ❓ Anticipated Questions

| Question | Answer |
|----------|--------|
| *What if the LLM API fails?* | The fallback pattern matcher handles 50+ query types with zero external dependencies. |
| *How big can datasets be?* | DuckDB handles up to hundreds of millions of rows locally. The current upload limit is 50 MB per file. |
| *Can it join multiple tables?* | Not yet — that's top of our roadmap. |
| *What data formats?* | CSV, TSV, and Parquet. |
| *Is it production ready?* | Yes — Dockerized, health-checked, CORS-configured, and fully documented. |

---

## 📸 Demo Screenshots to Capture

1. Dashboard with stats
2. Upload modal with drag-and-drop
3. Chat interface with a question + SQL result
4. Cost savings badge detail
5. Schema view in upload confirmation