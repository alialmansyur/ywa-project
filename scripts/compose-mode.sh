#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-default}"
ACTION="${2:-up}"

case "$MODE" in
  default)
    if [[ "$ACTION" == "up" ]]; then
      docker compose up -d
    elif [[ "$ACTION" == "down" ]]; then
      docker compose down
    else
      docker compose "$ACTION"
    fi
    ;;
  tools)
    if [[ "$ACTION" == "up" ]]; then
      docker compose --profile tools up -d
    elif [[ "$ACTION" == "down" ]]; then
      docker compose --profile tools down
    else
      docker compose --profile tools "$ACTION"
    fi
    ;;
  *)
    echo "Usage: $0 {default|tools} [up|down|ps|logs|...]" >&2
    exit 1
    ;;
esac
