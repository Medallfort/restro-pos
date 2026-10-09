#!/usr/bin/env bash
# Backup dyal MongoDB (base "restro") f backups/. Kaykhlli ghir akhir KEEP_DAYS youm.
#
#   ./deploy/backup.sh
#
# Automatique kol lila m3a 3:00 (crontab -e):
#   0 3 * * * /home/amine/restro-pos/deploy/backup.sh >> /home/amine/restro-pos/backups/backup.log 2>&1
set -euo pipefail

cd "$(dirname "$0")/.."

BACKUP_DIR="${BACKUP_DIR:-$PWD/backups}"
KEEP_DAYS="${KEEP_DAYS:-14}"
DB_NAME="${DB_NAME:-restro}"

mkdir -p "$BACKUP_DIR"
file="$BACKUP_DIR/restro-$(date +%F_%H%M%S).archive.gz"
tmp="$file.part"
trap 'rm -f "$tmp"' EXIT

# -T: bla terminal (darouri f cron)
docker compose exec -T mongo mongodump --db "$DB_NAME" --archive --gzip --quiet > "$tmp"

# Fichier khawi = mongodump ma khdamch: ma nmss7och les backups l-9dam
if [ ! -s "$tmp" ]; then
  echo "$(date '+%F %T') ERROR: empty backup, nothing saved" >&2
  exit 1
fi
mv "$tmp" "$file"

find "$BACKUP_DIR" -name 'restro-*.archive.gz' -mtime +"$KEEP_DAYS" -delete

echo "$(date '+%F %T') OK $file ($(du -h "$file" | cut -f1))"
