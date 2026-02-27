#!/bin/bash

###############################################################################
# 数据库恢复脚本
# 用途: 从备份恢复数据库
# 使用: ./restore-db.sh [backup_file]
###############################################################################

set -e

SERVER="root@101.200.231.179"
PASSWORD="GAA-lianmeng666"
BACKUP_DIR="/opt/weopc/backups/database"
CONTAINER_NAME="weopc-app"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 检查参数
if [ -z "$1" ]; then
    echo -e "${YELLOW}用法: $0 <backup_file>${NC}"
    echo ""
    echo "查看可用备份:"
    sshpass -p "${PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER} "ls -lh ${BACKUP_DIR}/opc_db_*.db.gz 2>/dev/null || echo '暂无备份'"
    exit 1
fi

BACKUP_FILE="$1"

echo -e "${YELLOW}警告: 此操作将覆盖当前数据库!${NC}"
echo -e "${YELLOW}确认要恢复备份吗? (输入 YES 继续)${NC}"
read -r CONFIRM

if [ "$CONFIRM" != "YES" ]; then
    echo "操作已取消"
    exit 0
fi

echo -e "${GREEN}开始恢复数据库...${NC}"

# 在服务器上执行恢复
sshpass -p "${PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER} << ENDSSH
set -e

# 检查备份文件是否存在
if [ ! -f "${BACKUP_DIR}/${BACKUP_FILE}" ]; then
    echo "错误: 备份文件不存在: ${BACKUP_DIR}/${BACKUP_FILE}"
    exit 1
fi

# 停止应用容器
echo "停止应用容器..."
cd /opt/weopc && docker-compose stop weopc-app

# 创建当前数据库的备份
echo "备份当前数据库..."
TIMESTAMP=\$(date +%Y%m%d_%H%M%S)
docker exec ${CONTAINER_NAME} cat /app/data/opc.db > ${BACKUP_DIR}/opc_db_before_restore_\${TIMESTAMP}.db || true

# 解压备份文件
TEMP_FILE="/tmp/restore_\${TIMESTAMP}.db"
if [[ "${BACKUP_FILE}" == *.gz ]]; then
    gunzip -c "${BACKUP_DIR}/${BACKUP_FILE}" > "\${TEMP_FILE}"
else
    cp "${BACKUP_DIR}/${BACKUP_FILE}" "\${TEMP_FILE}"
fi

# 恢复数据库
echo "恢复数据库..."
docker cp "\${TEMP_FILE}" ${CONTAINER_NAME}:/app/data/opc.db

# 清理临时文件
rm -f "\${TEMP_FILE}"

# 启动应用容器
echo "启动应用容器..."
cd /opt/weopc && docker-compose start weopc-app

echo "等待服务启动..."
sleep 5

# 检查服务状态
if docker-compose ps | grep weopc-app | grep -q Up; then
    echo "✓ 数据库恢复成功，服务已重启"
else
    echo "✗ 警告: 服务可能未正常启动，请检查日志"
    docker-compose logs --tail=20 weopc-app
fi
ENDSSH

if [ $? -eq 0 ]; then
    echo -e "${GREEN}数据库恢复完成！${NC}"
else
    echo -e "${RED}数据库恢复失败！${NC}"
    exit 1
fi
