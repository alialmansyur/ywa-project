#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

read -r -p "This will DROP and RESEED database. Continue? (yes/no): " CONFIRM
if [[ "$CONFIRM" != "yes" ]]; then
  echo "[CANCELLED] no changes made"
  exit 0
fi

./scripts/db_backup.sh

docker exec tapg-laravel-api sh -lc "cd /var/www/html && php artisan migrate:fresh --seed --force"

echo "[OK] reset + seed complete"
