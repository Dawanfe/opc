#!/bin/bash

###############################################################################
# 设置自动备份定时任务
# 用途: 在服务器上配置 cron 定时备份
###############################################################################

set -e

SERVER="root@101.200.231.179"
PASSWORD="GAA-lianmeng666"

echo "🔧 配置数据库自动备份..."

# 在服务器上设置 cron 任务
sshpass -p "${PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER} << 'ENDSSH'
# 创建备份脚本
cat > /opt/weopc/backup-db-cron.sh << 'EOF'
#!/bin/bash
set -e

BACKUP_DIR="/opt/weopc/backups/database"
CONTAINER_NAME="weopc-app"
DB_PATH="/app/data/opc.db"
KEEP_DAYS=30

# 创建备份目录
mkdir -p ${BACKUP_DIR}

# 生成备份文件名
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="opc_db_${TIMESTAMP}.db"

# 记录日志
LOG_FILE="/opt/weopc/backups/backup.log"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting database backup..." >> ${LOG_FILE}

# 备份数据库
if docker ps | grep -q ${CONTAINER_NAME}; then
    docker exec ${CONTAINER_NAME} cat ${DB_PATH} > ${BACKUP_DIR}/${BACKUP_FILE}

    # 压缩备份
    gzip ${BACKUP_DIR}/${BACKUP_FILE}

    # 获取备份文件大小
    SIZE=$(du -h ${BACKUP_DIR}/${BACKUP_FILE}.gz | cut -f1)
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup completed: ${BACKUP_FILE}.gz (${SIZE})" >> ${LOG_FILE}

    # 清理旧备份
    DELETED=$(find ${BACKUP_DIR} -name "opc_db_*.db.gz" -mtime +${KEEP_DAYS} -delete -print | wc -l)
    if [ $DELETED -gt 0 ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Cleaned up ${DELETED} old backups" >> ${LOG_FILE}
    fi
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Container ${CONTAINER_NAME} is not running" >> ${LOG_FILE}
    exit 1
fi
EOF

# 设置执行权限
chmod +x /opt/weopc/backup-db-cron.sh

# 添加到 crontab（每天凌晨 2 点执行）
CRON_JOB="0 2 * * * /opt/weopc/backup-db-cron.sh"

# 检查 cron 任务是否已存在
if ! crontab -l 2>/dev/null | grep -q "backup-db-cron.sh"; then
    # 添加新的 cron 任务
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo "✓ Cron 任务已添加: 每天凌晨 2:00 自动备份"
else
    echo "✓ Cron 任务已存在"
fi

# 显示当前 cron 任务
echo ""
echo "当前定时任务:"
crontab -l | grep backup-db-cron.sh || echo "无"

# 创建备份目录
mkdir -p /opt/weopc/backups/database

# 执行一次手动备份测试
echo ""
echo "执行测试备份..."
/opt/weopc/backup-db-cron.sh

# 显示备份结果
echo ""
echo "备份文件列表:"
ls -lh /opt/weopc/backups/database/*.gz 2>/dev/null | tail -5 || echo "暂无备份"

echo ""
echo "备份日志:"
tail -5 /opt/weopc/backups/backup.log 2>/dev/null || echo "暂无日志"
ENDSSH

echo ""
echo "✅ 自动备份配置完成!"
echo ""
echo "备份设置:"
echo "  - 备份时间: 每天凌晨 2:00"
echo "  - 备份目录: /opt/weopc/backups/database"
echo "  - 保留天数: 30 天"
echo "  - 日志文件: /opt/weopc/backups/backup.log"
echo ""
echo "查看备份:"
echo "  ssh root@${SERVER} 'ls -lh /opt/weopc/backups/database/'"
echo ""
echo "查看日志:"
echo "  ssh root@${SERVER} 'tail -f /opt/weopc/backups/backup.log'"
