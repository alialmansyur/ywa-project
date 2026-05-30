# TAPG Maintenance System

> Sistem Pemeliharaan Aset TAPG — Monorepo

## Stack

| Layer | Teknologi |
|-------|-----------|
| API | Laravel 13 + PHP 8.3 |
| Dashboard | React + Vite + TypeScript |
| Admin | React + Vite + TypeScript |
| Mobile | React Native + Expo |
| Database | MySQL 8.0 |
| Cache/Queue | Redis 7 |
| Storage | MinIO |
| WebSocket | Laravel Reverb |

## Struktur

```
tapg-maintenance/
├── apps/
│   ├── api/          ← Laravel 13 API
│   ├── web/          ← React Dashboard (Vite)
│   ├── admin/        ← React Admin (Vite)
│   └── mobile/       ← React Native Expo
├── docker/
│   ├── api/          ← Dockerfile + nginx.conf (PHP-FPM)
│   ├── web/          ← Dockerfile (React build)
│   ├── admin/        ← Dockerfile (React build)
│   ├── mysql/        ← my.cnf (custom config)
│   └── nginx/        ← nginx.conf (reverse proxy)
├── backups/
│   └── mysql/        ← mysqldump output
├── docker-compose.yml
├── .env.example
└── README.md
```

## Quick Start (Development)

### 1. Setup environment

```bash
cp .env.example .env
# Edit .env sesuai kebutuhan
```

### Network Binding (localhost / LAN / public IP)

Set variabel ini di `.env`:

```bash
APP_BIND_HOST=0.0.0.0
TOOLS_BIND_HOST=127.0.0.1
NGINX_PORT=8000
WEB_PORT=8001
ADMIN_PORT=8002
```

- `APP_BIND_HOST=0.0.0.0`: app bisa diakses dari localhost, device 1 LAN, dan IP public (tergantung firewall/router).
- `TOOLS_BIND_HOST=127.0.0.1`: service sensitif/tooling tetap local-only (default aman).

### Compose Mode

```bash
# Default mode (service utama)
./scripts/compose-mode.sh default up

# Tools mode (aktifkan phpMyAdmin profile)
./scripts/compose-mode.sh tools up

# Stop
./scripts/compose-mode.sh default down
```

Alternatif langsung:

```bash
docker compose up -d
docker compose --profile tools up -d
```

### 2. Jalankan infrastructure

```bash
docker compose up -d
```

### 3. Cek status

```bash
docker compose ps
```

## Service URLs (Development)

| Service | URL |
|---------|-----|
| phpMyAdmin | http://localhost:8081 |
| MinIO Console | http://localhost:9001 |
| MinIO API | http://localhost:9000 |
| MySQL | localhost:3306 |
| Redis | localhost:6379 |

## Backup Database

```bash
# Backup now (reads DB credentials from .env)
./scripts/db_backup.sh

# Restore latest backup from backups/mysql
./scripts/db_restore_latest.sh

# Safe reset + seed (auto backup first, with confirmation)
./scripts/db_reset_seed_safe.sh
```

### Kenapa data bisa hilang?
- Biasanya terjadi karena `migrate:fresh`/drop tabel dijalankan tanpa restore/import ulang data non-seeder (mis. import Excel karyawan workshop).
- Gunakan `db_reset_seed_safe.sh` agar ada backup otomatis sebelum reset.

## Docker Commands

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f

# View logs for specific service
docker compose logs -f mysql

# Rebuild service
docker compose up -d --build laravel-api
```

## Fase Pengembangan

| Fase | Minggu | Deliverable |
|------|--------|-------------|
| **Setup** | W1 | Monorepo, Docker, DB, Auth |
| **Asset** | W2 | Asset CRUD API + Admin + QR |
| **Mobile** | W3 | Expo setup, Auth, Scan QR |
| **P2H** | W4 | P2H API + Admin + Dashboard |
| **Work Order** | W5 | WO API + Admin + Dashboard |
| **WO Mobile** | W6 | WO mobile + GeoTag + Push Notif |
| **Schedule** | W7 | Auto-schedule, reminder |
| **Dashboard** | W8 | KPI, charts, realtime map |
| **Inventory** | W9–W10 | Spare parts, PDF/Excel |
| **Offline** | W11 | Offline sync, testing |
| **UAT + Deploy** | W12 | Production deploy, training |

---

*TAPG Maintenance System — Mei 2026*
