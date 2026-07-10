# ─────────────── Stage 1: Build Frontend ───────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Cache npm dependencies layer
COPY package.json package-lock.json* ./
RUN npm ci --omit=optional

# Build the static assets
COPY . .
RUN npm run build

# ─────────────── Stage 2: Backend Runtime ──────────────
FROM python:3.12-slim AS backend

WORKDIR /app

# ── System dependencies ───────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ── Python dependencies ───────────────────────────────
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Application code ──────────────────────────────────
COPY backend/ ./backend/
COPY data.md ./

# ── Built frontend assets ─────────────────────────────
COPY --from=frontend-builder /app/dist ./frontend/

# ── Persistent volume for DuckDB database ─────────────
RUN mkdir -p /app/data
VOLUME /app/data

# ── Environment ───────────────────────────────────────
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV HOST=0.0.0.0
ENV PORT=8000
ENV DUCKDB_PATH=/app/data/querywise.duckdb
ENV DEBUG=false

EXPOSE 8000

# ── Health check ──────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -s http://localhost:8000/ | grep -q '"status":"running"' || exit 1

# ── Start ─────────────────────────────────────────────
CMD ["sh", "-c", "cd /app/backend && uvicorn app:app --host ${HOST} --port ${PORT} --workers ${UVICORN_WORKERS:-2} --log-level ${LOG_LEVEL:-info}"]