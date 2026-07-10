<div align="center">
  <img src="./public/nativelyai.svg" alt="QueryWise AI Logo" width="120" height="120" style="margin-bottom: 12px" />
  <h1 align="center">QueryWise AI</h1>
  <p align="center">
    <strong>Natural Language → SQL. Instant answers from your data.</strong>
  </p>

  <!-- Badges -->
  <p>
    <a href="#"><img src="https://img.shields.io/badge/version-1.0.0-blue?style=flat-square" alt="Version 1.0.0" /></a>
    <a href="#"><img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="MIT License" /></a>
    <a href="#"><img src="https://img.shields.io/badge/python-3.12+-blue?style=flat-square&logo=python&logoColor=white" alt="Python 3.12+" /></a>
    <a href="#"><img src="https://img.shields.io/badge/react-18.3-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React 18.3" /></a>
    <a href="#"><img src="https://img.shields.io/badge/fastapi-0.110+-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" /></a>
    <a href="#"><img src="https://img.shields.io/badge/duckdb-1.0-FFF000?style=flat-square&logo=duckdb&logoColor=black" alt="DuckDB" /></a>
    <a href="#"><img src="https://img.shields.io/badge/typescript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="#"><img src="https://img.shields.io/badge/tailwind_css-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" /></a>
    <a href="#"><img src="https://img.shields.io/badge/docker-ready-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker Ready" /></a>
    <a href="#"><img src="https://img.shields.io/badge/code_style-black-000000?style=flat-square" alt="Code Style: Black" /></a>
  </p>
</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Development](#local-development)
  - [Docker](#docker)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Demo Script](#-demo-script)
- [Future Roadmap](#-future-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🧠 Overview

**QueryWise AI** is a modern, open-source data copilot that lets you ask questions about your data in plain English and get instant SQL-powered answers. Upload a CSV, TSV, or Parquet file, type a question, and get back structured results with cost transparency and SQL explanations.

Built for the **2025 International AI Hackathon**, QueryWise demonstrates how large language models combined with an embedded analytical database can democratise data access for non-technical users.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **🗣️ Natural Language Queries** | Ask questions like *"What were total sales by region?"* — no SQL knowledge required |
| **📂 Instant Data Upload** | Drag-and-drop CSV, TSV, or Parquet files; auto-schema detection and DuckDB ingestion |
| **🔍 Intelligent SQL Generation** | Dual engine: Gemma-2 via Fireworks AI (online) or rule-based fallback (offline) with 50+ patterns |
| **📊 Smart Complexity Routing** | Automatically detects query complexity — routes simple queries to lightweight models, complex ones to full models |
| **💰 Cost Transparency** | Every query shows estimated tokens, cost ($), and savings vs. traditional data analyst approach |
| **💬 ChatGPT-Style Chat** | Conversational interface with message history, SQL block view, and contextual suggestions |
| **📈 Dashboard Analytics** | Real-time stats: queries run, tables loaded, rows processed, costs saved |
| **⚡ DuckDB Engine** | Sub-millisecond analytical queries on uploaded data — no separate database server needed |
| **🔌 Offline Mode** | Built-in fallback SQL pattern matcher works without any API keys — fully self-contained |
| **🐳 Dockerized** | One-command deployment with Docker Compose |
| **🌐 FastAPI + React** | Modern, type-safe full-stack architecture |

---

## 🏗 Architecture

### Components

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript + Vite | Dashboard & Chat UI |
| **Backend** | FastAPI + Python 3.12 | REST API & SQL Generation |
| **Database** | DuckDB | Embedded Analytics Engine |
| **LLM Integration** | Fireworks AI (Gemma-2) | Natural Language to SQL |
| **Fallback Engine** | Pattern Matcher | Offline SQL Generation |

### Request Flow

1. **User uploads data** via the Upload Modal → CSV/TSV/Parquet file is ingested into DuckDB
2. **User asks a question** in the Chat Interface → question is sent to `/api/query`
3. **Backend classifies complexity** (simple/medium/complex) using keyword analysis
4. **SQL is generated** — via Fireworks AI Gemma model (online) or pattern matcher (offline)
5. **SQL is executed** against DuckDB → results returned with metadata
6. **Frontend renders** the answer with SQL block, complexity badge, cost savings, and explanation

### Architecture Diagram

```
┌─────────────────────────────────────┐
│   Frontend (React + TypeScript)     │
│  - Dashboard UI                     │
│  - Chat Interface                   │
│  - Upload Modal                     │
│  - API Service Layer                │
└──────────────┬──────────────────────┘
               │ HTTP / JSON
               ▼
┌─────────────────────────────────────┐
│   Backend (FastAPI / Python)        │
│  - Router (REST Endpoints)          │
│  - NL→SQL Engine (Fireworks AI)     │
│  - Fallback Engine (50+ Patterns)   │
│  - Schema Resolver                  │
└──────────────┬──────────────────────┘
               │ SQL
               ▼
┌─────────────────────────────────────┐
│   Database Layer                    │
│  - DuckDB (Embedded Analytics)      │
│  - Uploaded Files (CSV/TSV/Parquet) │
└─────────────────────────────────────┘
```

---

## 🛠 Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18.3** | UI framework |
| **TypeScript 5.9** | Type safety |
| **Vite 7.2** | Build tool & dev server |
| **Tailwind CSS v4** | Utility-first styling |
| **Lucide React** | Icon library |
| **React Icons** | Brand icons (Simple Icons) |

### Backend
| Technology | Purpose |
|------------|---------|
| **Python 3.12+** | Runtime |
| **FastAPI 0.110+** | REST API framework |
| **Uvicorn** | ASGI server |
| **DuckDB 1.0** | Embedded analytical SQL engine |
| **Pandas 2.2** | Data import & transformation |
| **Fireworks AI** | LLM inference (Gemma-2-2b/9b) |
| **Pydantic v2** | Data validation |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-service orchestration |
| **N/A** | Single-binary deployment possible |

---

## 📸 Screenshots

> _Screenshots coming soon — the app is fully functional and ready for deployment._

| Section | View |
|---------|------|
| **Dashboard** | Upload data, view stats, quick actions |
| **Chat Interface** | Ask questions, see SQL + results |
| **Upload Flow** | Drag-and-drop → schema preview → ingest |
| **SQL Results** | Syntax-highlighted SQL with cost badges |
| **Dark Mode UI** | Full dark theme with glass morphism |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ and **npm**
- **Python** 3.12+
- **Docker** & **Docker Compose** (for containerized setup)
- **Fireworks AI API key** (optional — fallback mode works without it)

### Local Development

#### 1. Clone the repository

```bash
git clone https://github.com/your-org/querywise-ai.git
cd querywise-ai
```

#### 2. Start the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Optional: set your Fireworks AI key for LLM-powered SQL
cp .env.example .env
# Edit .env and add your FIREWORKS_API_KEY

uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The API is now running at **http://localhost:8000** with interactive docs at **http://localhost:8000/docs**.

#### 3. Start the frontend (in a new terminal)

```bash
# From the project root
npm install
npm run dev
```

The app is now running at **http://localhost:5173** — the frontend auto-connects to the backend.

### Docker

#### Production (single command)

```bash
docker compose up --build
```

This starts:
- **Backend** at http://localhost:8000
- **Frontend** at http://localhost:5173

#### Development (with hot reload)

```bash
docker compose up --build frontend
```

---

## 📖 API Documentation

### Base URL

```
http://localhost:8000
```

Interactive docs: http://localhost:8000/docs (Swagger) or http://localhost:8000/redoc (ReDoc).

### Endpoints

#### `GET /` — Health Check

```json
{
  "status": "running",
  "application": "QueryWise AI",
  "version": "1.0.0"
}
```

#### `POST /upload` — Upload a Data File

Upload CSV, TSV, or Parquet (max 50 MB).

| Parameter | Type | Location |
|-----------|------|----------|
| `file` | File | Form Data |

**Response:**
```json
{
  "filename": "orders.csv",
  "table_name": "orders",
  "rows_imported": 2500,
  "columns": ["order_id", "customer", "product", "total"],
  "detected_schema": {
    "order_id": "INTEGER",
    "customer": "VARCHAR",
    "product": "VARCHAR",
    "total": "DOUBLE"
  }
}
```

#### `GET /schema` — Get Database Schema

Returns all tables with column types, nullability, and sample values.

#### `POST /query` — Natural Language Query

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `question` | string | Yes | Your question in plain English |
| `table_name` | string | No | Scope to a specific uploaded table |

**Response:**
```json
{
  "question": "What were total sales by region?",
  "complexity": "simple",
  "selected_model": "accounts/fireworks/models/gemma-2-2b-it",
  "generated_sql": "SELECT region, SUM(total) AS total_sales FROM \"orders\" GROUP BY region ORDER BY total_sales DESC;",
  "execution_time": "0.34s",
  "rows_returned": 5,
  "estimated_tokens": 185,
  "estimated_cost": 0.002,
  "cost_saved": 82.0,
  "explanation": "This query answers...",
  "result": [
    { "region": "West", "total_sales": 394.85 },
    { "region": "Northeast", "total_sales": 284.75 }
  ]
}
```

### Error Codes

| Code | Meaning |
|------|---------|
| `NO_FILENAME` | Upload request missing filename |
| `INVALID_EXTENSION` | File type not supported (.csv, .tsv, .parquet only) |
| `FILE_TOO_LARGE` | Exceeds 50 MB limit |
| `SAVE_FAILED` | Could not save uploaded file |
| `IMPORT_FAILED` | DuckDB import error |
| `EMPTY_QUESTION` | Query question is empty |
| `NO_DATA` | No datasets uploaded yet |
| `SQL_GEN_ERROR` | SQL generation failed |
| `SQL_EXEC_ERROR` | SQL execution error |

---

## 📁 Project Structure

```
querywise-ai/
├── frontend/                    # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/          # UI components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── DashboardHome.tsx
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── UploadModal.tsx
│   │   │   ├── AboutPage.tsx
│   │   │   ├── HistoryPage.tsx
│   │   │   └── Icons.tsx
│   │   ├── services/
│   │   │   └── api.ts           # Type-safe API client
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css            # Tailwind v4 + design tokens
│   ├── public/
│   │   └── nativelyai.svg
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/                     # Python + FastAPI + DuckDB
│   ├── app.py                   # Entry point, lifespan, CORS
│   ├── config.py                # Settings & environment
│   ├── router.py                # REST endpoints
│   ├── models.py                # Pydantic schemas
│   ├── database.py              # DuckDB connection manager
│   ├── schema.py                # Schema introspection utilities
│   ├── llm.py                   # Fireworks AI integration
│   ├── fallback.py              # Pattern-based SQL generation
│   ├── test-data/
│   │   └── orders_sample.csv    # Sample dataset
│   ├── .env.example
│   └── requirements.txt
│
├── docs/                        # Documentation
│   └── design-system/
│       └── MASTER.md
│
├── Dockerfile                   # Multi-stage production build
├── Dockerfile.dev               # Development frontend
├── docker-compose.yml           # Multi-service orchestration
├── .dockerignore
└── README.md
```

---

## ⚙️ Configuration

### Environment Variables (Backend)

| Variable | Default | Description |
|----------|---------|-------------|
| `FIREWORKS_API_KEY` | — | Fireworks AI key for LLM SQL generation |
| `HOST` | `0.0.0.0` | Server bind address |
| `PORT` | `8000` | Server port |
| `DEBUG` | `false` | Enable debug mode & hot reload |
| `DUCKDB_PATH` | `data/querywise.duckdb` | Database file path |
| `LOG_LEVEL` | `INFO` | Logging level (DEBUG/INFO/WARNING/ERROR) |

### Environment Variables (Frontend)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000` | Backend API base URL |

### No API Key? No Problem.

QueryWise AI ships with a **fully functional fallback engine** that uses intelligent pattern matching to generate SQL from natural language — zero API keys required. The fallback covers 50+ query patterns including:

- Aggregations (SUM, AVG, COUNT, MIN, MAX)
- Grouping (by region, category, product, customer)
- Sorting & top-N analysis
- Date-based queries (monthly, recent, by period)
- Column schema introspection

When a Fireworks AI key is available, QueryWise routes queries to Gemma-2 models for more complex, nuanced SQL generation.

---

## 🎬 Demo Script

A complete 2-minute walkthrough script is available in [docs/demo-script.md](./docs/demo-script.md).

---

## 🗺 Future Roadmap

| Feature | Status | Priority |
|---------|--------|----------|
| Multi-file querying (JOIN across tables) | 🔜 Planned | High |
| Query history persistence (localStorage) | 🔜 Planned | High |
| Data visualization (charts, graphs) | 🔜 Planned | High |
| Export results (CSV, Excel, JSON) | 🔜 Planned | Medium |
| User authentication & multi-tenant | 🔮 Future | Medium |
| Custom knowledge base & schema training | 🔮 Future | Low |
| Voice input for queries | 🔮 Future | Low |
| VS Code extension | 🔮 Future | Low |

---

## 🤝 Contributing

This project was created for the **2025 International AI Hackathon**. Contributions, issues, and feature requests are welcome.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  <p>Built with ❤️ for the 2025 International AI Hackathon</p>
  <p>
    <a href="https://fastapi.tiangolo.com">FastAPI</a> ·
    <a href="https://react.dev">React</a> ·
    <a href="https://duckdb.org">DuckDB</a> ·
    <a href="https://fireworks.ai">Fireworks AI</a> ·
    <a href="https://tailwindcss.com">Tailwind CSS</a>
  </p>
</div>
