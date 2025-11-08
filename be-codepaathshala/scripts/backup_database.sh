#!/bin/bash
# Database Backup Script for Production PostgreSQL
# Run this via cron: 0 2 * * * /path/to/backup_database.sh

set -e  # Exit on error

# Load environment variables
if [ -f .env.production ]; then
    source .env.production
else
    echo "Error: .env.production file not found"
    exit 1
fi

# Configuration
BACKUP_DIR="/app/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql"
CONTAINER_NAME="postgres"
RETENTION_DAYS=30

# Create backup directory if it doesn't exist
mkdir -p ${BACKUP_DIR}

# Perform database backup
echo "Starting database backup: ${BACKUP_FILE}"
docker exec -t ${CONTAINER_NAME} pg_dump \
    -U ${DB_USER} \
    -d ${DB_NAME} \
    --format=custom \
    --compress=9 \
    > ${BACKUP_FILE}

# Compress backup
gzip ${BACKUP_FILE}
BACKUP_FILE="${BACKUP_FILE}.gz"

echo "Backup completed: ${BACKUP_FILE}"

# Calculate backup size
BACKUP_SIZE=$(du -h ${BACKUP_FILE} | cut -f1)
echo "Backup size: ${BACKUP_SIZE}"

# Delete old backups (older than RETENTION_DAYS)
echo "Cleaning up old backups (older than ${RETENTION_DAYS} days)..."
find ${BACKUP_DIR} -name "db_backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete

# List remaining backups
echo "Current backups:"
ls -lh ${BACKUP_DIR}/db_backup_*.sql.gz 2>/dev/null || echo "No backups found"

# Optional: Upload to S3 (uncomment if using AWS S3)
# if [ ! -z "${AWS_BACKUP_BUCKET}" ]; then
#     echo "Uploading to S3: s3://${AWS_BACKUP_BUCKET}/backups/"
#     aws s3 cp ${BACKUP_FILE} s3://${AWS_BACKUP_BUCKET}/backups/
#     echo "Upload completed"
# fi

echo "Backup process finished successfully"
exit 0
