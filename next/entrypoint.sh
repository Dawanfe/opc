#!/bin/sh
set -e

DATA_DIR="/app/data"
DB_FILE="$DATA_DIR/opc.db"
BACKUP_DIR="$DATA_DIR/backups"

# Ensure directories exist
mkdir -p "$DATA_DIR"
mkdir -p "$BACKUP_DIR"

# If database exists, create a backup before starting
if [ -f "$DB_FILE" ]; then
  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  BACKUP_FILE="$BACKUP_DIR/opc_${TIMESTAMP}.db"
  echo "[Backup] Backing up database to $BACKUP_FILE"
  cp "$DB_FILE" "$BACKUP_FILE"

  # Keep only the last 10 backups
  cd "$BACKUP_DIR"
  ls -t opc_*.db 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
  cd /app
  echo "[Backup] Backup complete. Kept latest 10 backups."
else
  echo "[Init] No existing database found. Initializing..."
  node scripts/init-db.js
  echo "[Init] Database initialized successfully."
fi

echo "[Start] Starting Next.js server..."
exec node server.js
