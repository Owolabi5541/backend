#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if ! docker compose exec -T postgres true 2>/dev/null; then
  echo "Postgres container is not running. Start it with: npm run docker:up"
  exit 1
fi

if docker compose exec -T postgres psql -U postgres -Atc "SELECT 1 FROM pg_database WHERE datname = 'backend'" | grep -qx 1; then
  echo "Database 'backend' already exists in Docker Postgres."
  exit 0
fi

echo "Creating database 'backend' in Docker Postgres..."
docker compose exec -T postgres psql -U postgres -c "CREATE DATABASE backend;"
echo "Done."
