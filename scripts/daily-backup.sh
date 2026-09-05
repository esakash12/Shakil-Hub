#!/usr/bin/env bash
# ==============================================================================
# Sakil Hub - Automated Daily Backup Script
# Backs up JSON CMS Data and PostgreSQL (Medusa.js) Database
# Retention: Keeps local backups for 7 days
# Cron recommendation (every day at 3:00 AM):
# 0 3 * * * /var/www/sakilhub/scripts/daily-backup.sh >> /var/log/sakilhub-backup.log 2>&1
# ==============================================================================

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/sakilhub}"
TIMESTAMP="$(date +"%Y%m%d_%H%M%S")"
BACKUP_FILE="${BACKUP_DIR}/sakilhub_backup_${TIMESTAMP}.tar.gz"
TEMP_DIR="$(mktemp -d)"

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting Sakil Hub backup..."

# 1. Backup lib/data JSON files (Courses, interactions, orders, shop, settings)
if [ -d "${APP_DIR}/lib/data" ]; then
    echo "Backing up JSON storage (${APP_DIR}/lib/data)..."
    mkdir -p "${TEMP_DIR}/data"
    cp -r "${APP_DIR}/lib/data/"* "${TEMP_DIR}/data/"
fi

# 2. Backup PostgreSQL database (Medusa.js) if database is accessible
if command -v pg_dump &> /dev/null; then
    if [ -n "${DATABASE_URL:-}" ]; then
        echo "Dumping PostgreSQL database from DATABASE_URL..."
        pg_dump "${DATABASE_URL}" --clean --if-exists > "${TEMP_DIR}/medusa_db.sql" 2>/dev/null || echo "Postgres dump skipped or failed."
    elif [ -n "${PGDATABASE:-}" ]; then
        echo "Dumping PostgreSQL database ${PGDATABASE}..."
        pg_dump "${PGDATABASE}" --clean --if-exists > "${TEMP_DIR}/medusa_db.sql" 2>/dev/null || echo "Postgres dump skipped or failed."
    fi
fi

# 3. Create compressed tarball
echo "Compressing archive to ${BACKUP_FILE}..."
tar -czf "${BACKUP_FILE}" -C "${TEMP_DIR}" .

# 4. Clean up temporary directory
rm -rf "${TEMP_DIR}"

# 5. Remove local backups older than 7 days
echo "Pruning backups older than 7 days..."
find "${BACKUP_DIR}" -type f -name "sakilhub_backup_*.tar.gz" -mtime +7 -delete

BACKUP_SIZE="$(du -h "${BACKUP_FILE}" | cut -f1)"
echo "[$(date)] Backup completed successfully! File: ${BACKUP_FILE} (Size: ${BACKUP_SIZE})"

# 6. Optional: Upload to Cloudflare R2 / AWS S3 if rclone or aws-cli is installed
if command -v aws &> /dev/null && [ -n "${BACKUP_S3_BUCKET:-}" ]; then
    echo "Syncing backup to S3/R2 (${BACKUP_S3_BUCKET})..."
    aws s3 cp "${BACKUP_FILE}" "s3://${BACKUP_S3_BUCKET}/backups/" --only-show-errors || echo "Remote upload failed"
fi
