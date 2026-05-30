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

LATEST="$(ls -1t backups/mysql/*.sql 2>/dev/null | head -n1 || true)"
if [[ -z "$LATEST" ]]; then
  echo "[ERROR] no SQL backup found in backups/mysql"
  exit 1
fi

MYSQL_CID="$(docker compose ps -q mysql)"
if [[ -z "$MYSQL_CID" ]]; then
  echo "[ERROR] mysql service is not running"
  exit 1
fi

echo "[WARN] restoring from: $LATEST"
docker exec -i "$MYSQL_CID" sh -lc "mysql -u root -p\"$DB_ROOT_PASSWORD\" \"$DB_DATABASE\"" < "$LATEST"

echo "[OK] restore complete"
