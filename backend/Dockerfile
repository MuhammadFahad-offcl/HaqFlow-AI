# syntax=docker/dockerfile:1
FROM python:3.12-slim AS base

WORKDIR /srv

# System deps kept minimal; add build-essential here if a future dependency needs to compile.
RUN apt-get update -qq && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

ENV PYTHONUNBUFFERED=1 \
    PORT=8000

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Render/Railway/Fly.io all set $PORT; default to 8000 for local `docker run`.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
