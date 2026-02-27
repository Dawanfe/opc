#!/bin/bash

###############################################################################
# 数据库自动备份脚本
# 用途: 定时备份 WeOPC 数据库
# 使用: 添加到 crontab 中每天执行
###############################################################################

set -e

# 配置
SERVER="root@101.200.231.179"
PASSWORD="GAA-lianmeng666"
BACKUP_DIR="/opt/weopc/backups/database"
CONTAINER_NAME="weopc-app"
DB_PATH="/app/data/opc.db"
KEEP_DAYS=30  # 保留最近30天的备份

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} 开始备份数据库..."

# 生成备份文件名
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="opc_db_${TIMESTAMP}.db"

# 在服务器上执行备份
sshpass -p "${PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER} << ENDSSH
# 创建备份目录
mkdir -p ${BACKUP_DIR}

# 备份数据库
if docker ps | grep -q ${CONTAINER_NAME}; then
    echo "备份数据库到 ${BACKUP_DIR}/${BACKUP_FILE}"
    docker exec ${CONTAINER_NAME} cat ${DB_PATH} > ${BACKUP_DIR}/${BACKUP_FILE}

    # 压缩备份
    gzip ${BACKUP_DIR}/${BACKUP_FILE}
    echo "备份已压缩: ${BACKUP_FILE}.gz"

    # 清理旧备份（保留最近30天）
    find ${BACKUP_DIR} -name "opc_db_*.db.gz" -mtime +${KEEP_DAYS} -delete
    echo "已清理 ${KEEP_DAYS} 天前的旧备份"

    # 显示备份列表
    echo "当前备份文件:"
    ls -lh ${BACKUP_DIR}/opc_db_*.db.gz | tail -5
else
    echo "错误: 容器 ${CONTAINER_NAME} 未运行"
    exit 1
fi
ENDSSH

if [ $? -eq 0 ]; then
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} 数据库备份完成！"
else
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} 数据库备份失败！"
    exit 1
fi
