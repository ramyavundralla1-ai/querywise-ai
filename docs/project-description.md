# QueryWise AI — Hackathon Submission

> **Event:** 2025 International AI Hackathon
> **Track:** AI-Powered Productivity

---

## Title

**QueryWise AI** — Your Data Copilot: Natural Language to SQL in Milliseconds

---

## Short Description (50 words)

*QueryWise AI is an open-source, Docker-ready data copilot that turns plain English questions into SQL and executes them instantly. Upload any CSV/TSV/Parquet file, type a question, and get structured answers with cost transparency — no data team required. Built with React, FastAPI, DuckDB, and Fireworks AI.*

---

## Long Description (300 words)

### The Problem

In every organization, business decisions depend on data — but the people who need answers most urgently can't write SQL. They wait days for the data team, creating a bottleneck that costs enterprises over $1M annually in lost productivity and delayed decisions.

### Our Solution

QueryWise AI bridges this gap. It's a production-ready, open-source data copilot that accepts natural language questions, converts them to SQL using intelligent AI routing, executes them against DuckDB (an ultra-fast embedded analytical database), and returns structured answers with rich metadata — all in under a second.

### How It Works

1. **Upload any data file** — CSV, TSV, or Parquet. The backend auto-detects schema and ingests into DuckDB.
2. **Ask anything in English** — from *"What were total sales by region?"* to *"Show monthly revenue trends."*
3. **Get instant results** — Syntax-highlighted SQL, execution time, complexity badge, estimated cost, and cost savings vs. traditional data analysis.

### Architecture Highlights

- **Dual SQL generation engine:** Routes simple queries to a lightweight model and complex ones to Gemma-2 via Fireworks AI. A 50+ pattern fallback matcher handles queries completely offline — zero API keys required.
- **Full-stack TypeScript + Python:** React 18 with TypeScript on the frontend; FastAPI with Pydantic v2 on the backend. End-to-end type safety.
- **Embedded analytics with DuckDB:** Sub-millisecond analytical queries without a separate database server.
- **Cost transparency built in:** Every query shows token count, dollar cost ($0.001–$0.025 range), and percentage saved vs. traditional approaches.
- **Dockerized, one-command deployment:** Multi-stage Dockerfile, Docker Compose orchestration, health checks, and persistent volumes.

### Why It Matters

QueryWise AI democratizes data access. A marketing manager can ask about campaign ROI. An operations lead can check inventory trends. A CEO can get revenue breakdowns — all in English, all in real-time, without creating a ticket for the data team.

### Built For

- Business analysts who need fast answers
- Data teams tired of repetitive "can you pull this?" requests
- Startups and enterprises wanting self-serve analytics
- Hackathon judges looking for practical, polished AI applications

---

## Technology Tags

```
react, typescript, python, fastapi, duckdb, fireworks-ai, llm, natural-language-processing, sql-generation, tailwind-css, vite, docker, docker-compose, pydantic, gemma, data-analytics, open-source, hackathon-2025
```

---

## Key Differentiators

| Differentiator | Detail |
|----------------|--------|
| **Offline-first** | Full SQL generation without any LLM API key — pattern matcher handles 50+ query types |
| **Cost transparency** | Every query shows estimated tokens, dollar cost, and savings percentage |
| **Embedded database** | DuckDB runs in-process — no separate DB server to manage |
| **Modern dark UI** | Glass morphism, gradient accents, smooth animations — polished for demos |
| **Production Docker** | Multi-stage build, health checks, persistent volumes, environment config |
| **Full API docs** | Auto-generated Swagger UI at /docs and ReDoc at /redoc |

---

## Pitch One-Liner

> *"QueryWise AI turns 'I have a question about my data' into 'here's the answer' — in plain English, in milliseconds, without a data team."*

---

## Links

- **GitHub Repository:** *[Add your GitHub URL here]*
- **Live Demo:** *[Add your deployed URL here]*
- **Documentation:** README.md in repository root