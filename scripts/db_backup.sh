#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f .env ]]; then
  echo "[ERROR] .env not found"
  exit 1
fi

set -a
source .env
set +a

mkdir -p backups/mysql
TS="$(date +%Y%m%d_%H%M%S)"
OUT="backups/mysql/tapg_${TS}.sql"

MYSQL_CID="$(docker compose ps -q mysql)"
if [[ -z "$MYSQL_CID" ]]; then
  echo "[ERROR] mysql service is not running"
  exit 1
fi

docker exec "$MYSQL_CID" sh -lc "mysqldump -u root -p\"$DB_ROOT_PASSWORD\" --single-transaction --routines --triggers \"$DB_DATABASE\"" > "$OUT"

echo "[OK] backup created: $OUT"
