#!/bin/bash

###############################################################################
# WeOPC 快速部署脚本（使用 rsync，更快）
###############################################################################

set -e

SERVER="root@101.200.231.179"
PASSWORD="GAA-lianmeng666"
DEPLOY_PATH="/opt/weopc"

echo "🚀 快速部署 WeOPC..."

# 使用 sshpass 和 rsync 快速同步
sshpass -p "${PASSWORD}" rsync -avz --delete \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='data' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='test-auth.mjs' \
    -e "ssh -o StrictHostKeyChecking=no" \
    ./ ${SERVER}:${DEPLOY_PATH}/

echo "📦 文件同步完成"

# 重启服务
echo "🔄 重启服务..."
sshpass -p "${PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER} << 'ENDSSH'
cd /opt/weopc
docker-compose down
docker-compose up -d --build
echo "✅ 部署完成！"
echo "访问: http://globalaialumni.com/weopc"
ENDSSH

echo "✨ 全部完成！"
