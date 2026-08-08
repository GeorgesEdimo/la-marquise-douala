#!/usr/bin/env bash
# Backup automatique PostgreSQL — à lancer quotidiennement (cron).
# Crée un dump horodaté dans /var/backups/la_marquise/.
set -euo pipefail

BACKUP_DIR="/var/backups/la_marquise"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DUMP_FILE="$BACKUP_DIR/la_marquise_${TIMESTAMP}.sql.gz"

docker compose exec -T db pg_dump -U lamarquise la_marquise | gzip > "$DUMP_FILE"

# Garde les 30 derniers dumps
ls -t "$BACKUP_DIR"/la_marquise_*.sql.gz | tail -n +31 | xargs rm -f 2>/dev/null

echo "[$(date)] Backup créé : $DUMP_FILE ($(du -h "$DUMP_FILE" | cut -f1))"
