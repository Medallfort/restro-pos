#!/usr/bin/env bash
# Kayrje3 la base "restro" men backup. ⚠️ Data l-7aliya katt-beddel b dyal backup.
#
#   ./deploy/restore.sh                                   -> liste dyal les backups
#   ./deploy/restore.sh backups/restro-2026-10-09_030000.archive.gz
#
# 9bel ma yrje3, kaydir backup dyal l-7ala l-7aliya (ila ghlti, t9der trj3 lih).
set -euo pipefail

DB_NAME="${DB_NAME:-restro}"

if [ $# -eq 0 ]; then
  cd "$(dirname "$0")/.."
  echo "Backups (jdid f lowl):"
  ls -1t backups/restro-*.archive.gz 2>/dev/null || echo "  (ma kayn 7ta backup)"
  echo
  echo "Usage: $0 <backup-file>"
  exit 0
fi

# Chemin kamel 9bel cd (ila 3titih chemin relatif)
file="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
cd "$(dirname "$0")/.."

if [ ! -s "$file" ]; then
  echo "Backup not found or empty: $file" >&2
  exit 1
fi

echo "Restore: $file"
echo "Current data in '$DB_NAME' (orders, users, tables, menu) will be REPLACED."
read -r -p "Type yes to continue: " answer
if [ "$answer" != "yes" ]; then
  echo "Cancelled."
  exit 1
fi

echo "Saving the current data first..."
./deploy/backup.sh

docker compose exec -T mongo mongorestore --archive --gzip --drop --quiet \
  --nsInclude "$DB_NAME.*" < "$file"

docker compose restart backend
echo "Restore done."
