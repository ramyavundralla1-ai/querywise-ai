# QueryWise AI — 8-Slide Pitch Presentation

> **For:** 2025 International AI Hackathon
> **Format:** Slide deck (adapt for PowerPoint, Keynote, or PDF)
> **Duration:** ~4 minutes (or read at your pace)

---

## Slide 1: Title Slide

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                  ✦ QueryWise AI ✦                    │
│                                                     │
│           Natural Language → SQL Copilot             │
│                                                     │
│           Ask questions. Get answers.                │
│              No SQL required.                        │
│                                                     │
│                                                     │
│        2025 International AI Hackathon               │
│                                                     │
│                                                     │
│    [ DEMO ]      [ GITHUB ]      [ DOCS ]           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Speaker notes:**
> "Welcome. QueryWise AI turns plain English questions into SQL and executes them instantly — no data team needed."

---

## Slide 2: The Problem

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              ⚠️ The Data Access Gap                  │
│                                                     │
│                                                     │
│    ┌──────────────────┐    ┌──────────────────┐     │
│    │ Business Users   │    │    Data Teams    │     │
│    │                  │    │                  │     │
│    │ • Need answers   │    │ • Overwhelmed    │     │
│    │ • Can't write    │    │ • 2-5 day        │     │
│    │   SQL            │    │   turnaround     │     │
│    │ • Frustrated     │    │ • $80/hr cost    │     │
│    │   waiting        │    │                  │     │
│    └──────────────────┘    └──────────────────┘     │
│                                                     │
│                                                     │
│               ❌ This gap costs                      │
│          enterprises $1M+/year in lost               │
│           productivity and delayed                   │
│               decision-making                        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Speaker notes:**
> "There's a massive gap between the people who have data questions and the people who can answer them. Business users wait days for simple queries, costing enterprises over a million dollars a year in lost productivity."

---

## Slide 3: The Solution

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              ✦ QueryWise AI ─── The Fix              │
│                                                     │
│                                                     │
│   "Total sales by region?"                          │
│                              ┌──────────────────┐   │
│   ┌──────────────────────┐   │   SELECT region, │   │
│   │   🗣️ Natural          │──▶│   SUM(total)     │   │
│   │   Language Input      │   │   FROM orders    │   │
│   │                      │   │   GROUP BY...    │   │
│   └──────────────────────┘   └────────┬─────────┘   │
│                                       │             │
│                                       ▼             │
│                              ┌──────────────────┐   │
│                              │  📊 Result:       │   │
│                              │  West: $394.85    │   │
│                              │  Northeast:       │   │
│                              │  $284.75          │   │
│                              │  → 0.023 seconds  │   │
│                              └──────────────────┘   │
│                                                     │
│       ↓↓↓                                            │
│   Upload a file → Ask a question → Get SQL + answer  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Speaker notes:**
> "QueryWise bridges this gap. Upload any CSV, ask any question, and within milliseconds you get the SQL and the answer — with full cost transparency."

---

## Slide 4: Technology Stack

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              🛠 Built With Modern Tech               │
│                                                     │
│                                                     │
│   ┌──────────────┐   ┌──────────────┐              │
│   │   Frontend   │   │   Backend    │              │
│   │              │   │              │              │
│   │  ⚛️ React 18 │   │  🐍 Python   │              │
│   │  🔷 TypeScript│  │  ⚡ FastAPI   │              │
│   │  ⚡ Vite 7    │   │  🦆 DuckDB   │              │
│   │  🎨 Tailwind  │   │  🔥 Fireworks│              │
│   │     CSS v4    │   │     AI       │              │
│   └──────────────┘   └──────┬───────┘              │
│                              │                      │
│                   ┌──────────▼──────────┐           │
│                   │  Intelligent Router │           │
│                   │                     │           │
│                   │  ┌───────────────┐  │           │
│                   │  │ 🧠 LLM Engine │  │           │
│                   │  │ (Gemma-2 via  │  │           │
│                   │  │ Fireworks AI) │  │           │
│                   │  └───────────────┘  │           │
│                   │  ┌───────────────┐  │           │
│                   │  │ ⚙️ Fallback   │  │           │
│                   │  │ Pattern       │  │           │
│                   │  │ Matcher (50+) │  │           │
│                   │  └───────────────┘  │           │
│                   └────────────────────┘           │
│                                                     │
│         🐳 Dockerized — One-Command Deploy          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Speaker notes:**
> "Under the hood: React and TypeScript on the frontend, FastAPI and DuckDB on the backend. A smart router classifies query complexity and chooses between a lightweight or full LLM model — or falls back to our built-in pattern matcher with 50+ SQL patterns. All Dockerized for one-command deployment."

---

## Slide 5: Key Features

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              ✨ What Makes It Special                │
│                                                     │
│                                                     │
│   🗣️  Natural Language → SQL                       │
│        "Show top customers by revenue"               │
│        → SELECT + GROUP BY + ORDER BY + LIMIT        │
│                                                     │
│   📂  Drag-and-Drop Data Upload                     │
│        CSV • TSV • Parquet • Auto-schema             │
│                                                     │
│   💰  Cost Transparency                             │
│        ~85 tokens • $0.002 • 82% cost saved          │
│                                                     │
│   🔌  Works Fully Offline                           │
│        No API key needed for core functionality      │
│                                                     │
│   🐳  Docker-Ready                                   │
│        docker compose up --build  →  It's running    │
│                                                     │
│   🌐  API-First Design                               │
│        Full Swagger docs at /docs                    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Speaker notes:**
> "Key features: natural language to SQL, instant data upload, cost transparency on every query, fully functional offline mode, one-command Docker deployment, and a first-class REST API with auto-generated documentation."

---

## Slide 6: Live Demo

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              ▶️ Live Demo                            │
│                                                     │
│                                                     │
│   ┌────────────────────────────────────────────┐    │
│   │                                            │    │
│   │  1. Upload orders_sample.csv               │    │
│   │     → 25 rows, 6 columns, auto-ingested    │    │
│   │                                            │    │
│   │  2. "Total sales by region?"               │    │
│   │     → 0.023s • $0.002 • 5 regions          │    │
│   │                                            │    │
│   │  3. "Monthly revenue trend?"               │    │
│   │     → Moderate complexity • DATE_TRUNC     │    │
│   │        • 82% cost saved                    │    │
│   │                                            │    │
│   └────────────────────────────────────────────┘    │
│                                                     │
│                                                     │
│           "Data insights in seconds,                 │
│            not days."                                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Speaker notes:**
> "Let me show you how it works in practice. [Walk through the 3 demo steps] — from raw CSV to business insight in under 2 seconds."

---

## Slide 7: Roadmap

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              🗺 Where We're Going                    │
│                                                     │
│                                                     │
│    Priority  │ Feature                    │ Status  │
│    ─────────────────────────────────────  │─────────│
│    🔴 High   │ Multi-table JOIN queries   │ Planned │
│    🔴 High   │ Query history persistence  │ Planned │
│    🔴 High   │ Charts & visualization     │ Planned │
│    🟡 Medium │ Export to CSV / Excel      │ Planned │
│    🟡 Medium │ User authentication        │ Future  │
│    🟢 Low    │ Voice input                │ Future  │
│    🟢 Low    │ VS Code extension          │ Future  │
│    🟢 Low    │ Custom knowledge base      │ Future  │
│                                                     │
│                                                     │
│         Next release: Multi-table queries            │
│           + interactive charts                       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Speaker notes:**
> "This is just the beginning. Our roadmap includes multi-table JOIN support, interactive data visualizations, query history, and export capabilities. The architecture is designed to scale."

---

## Slide 8: Thank You

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              ✦ QueryWise AI ✦                        │
│                                                     │
│                                                     │
│   Ask questions in English                           │
│   Get answers in milliseconds.                       │
│                                                     │
│                                                     │
│   ┌────────────────────────────────────┐            │
│   │                                    │            │
│   │     💻  GitHub: [repo-url]         │            │
│   │     📖  Docs: README.md            │            │
│   │     🐳  Deploy: docker compose up  │            │
│   │                                    │            │
│   └────────────────────────────────────┘            │
│                                                     │
│                                                     │
│          Built with ❤️ for the                       │
│      2025 International AI Hackathon                 │
│                                                     │
│                                                     │
│                Questions?                            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Speaker notes:**
> "QueryWise AI makes data accessible to everyone. The code is open-source, production-ready, and one Docker command away. Thank you — I'm happy to answer your questions."

---

## 🎨 Visual Design Notes

| Element | Specification |
|---------|---------------|
| **Background** | Dark (#09090B) |
| **Primary Color** | Blue (#3B82F6) |
| **Secondary Accent** | Cyan (#06B6D4) |
| **Typography** | Inter (headings), JetBrains Mono (code) |
| **Cards** | Glass morphism with subtle borders |
| **Transitions** | Smooth 200ms ease-out |
| **Icons** | Lucide React (generic), Simple Icons (brands) |

---

## 📋 Slide Checklist

- [ ] Slide 1: Eye-catching title with demo/GitHub/docs buttons
- [ ] Slide 2: Clear problem statement with data
- [ ] Slide 3: Visual solution flow
- [ ] Slide 4: Architecture/stack diagram
- [ ] Slide 5: Feature highlights with icons
- [ ] Slide 6: Live demo with step-by-step flow
- [ ] Slide 7: Roadmap with priority matrix
- [ ] Slide 8: Call-to-action + QR code to GitHub