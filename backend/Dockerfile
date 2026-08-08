FROM python:3.12-slim

WORKDIR /app

# Dépendances système pour psycopg (PostgreSQL)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

# Requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Code backend
COPY app/ app/
COPY promote_admin.py .
COPY seed_check.py . 2>/dev/null || true

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
