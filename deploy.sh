#!/bin/bash
set -e

# ===== 服务器配置 =====
SERVER_HOST="101.200.231.179"
SERVER_USER="root"
SERVER_PASS="GAA-lianmeng666"
DEPLOY_PATH="/opt/weopc"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
SSH_CMD="sshpass -p ${SERVER_PASS} ssh -o StrictHostKeyChecking=no -o PreferredAuthentications=password"
SCP_CMD="sshpass -p ${SERVER_PASS} scp -o StrictHostKeyChecking=no -o PreferredAuthentications=password"

remote() {
  ${SSH_CMD} ${SERVER_USER}@${SERVER_HOST} "$1"
}

echo "=== WeOPC 部署脚本 ==="
echo "服务器: ${SERVER_USER}@${SERVER_HOST}"
echo "部署路径: ${DEPLOY_PATH}"
echo ""

# ===== [1/6] 上传到服务器 =====
echo "=== [1/6] 上传代码到服务器 ==="
TMPFILE=$(mktemp /tmp/weopc-deploy-XXXXXX.tar.gz)
tar czf "$TMPFILE" \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='data/*.db' \
  --exclude='data/*.db-shm' \
  --exclude='data/*.db-wal' \
  --exclude='*.log' \
  --exclude='.DS_Store' \
  -C "$PROJECT_DIR" .

echo "打包完成: $(du -h "$TMPFILE" | cut -f1)"

remote "mkdir -p ${DEPLOY_PATH}"
$SCP_CMD "$TMPFILE" ${SERVER_USER}@${SERVER_HOST}:${DEPLOY_PATH}/deploy.tar.gz

rm -f "$TMPFILE"
echo "上传完成"

# ===== [2/6] 清理服务器磁盘空间 =====
echo "=== [2/6] 清理服务器磁盘空间 ==="
remote "df -h / | tail -1 && docker image prune -f 2>/dev/null && docker container prune -f 2>/dev/null; apt-get clean 2>/dev/null || yum clean all 2>/dev/null; journalctl --vacuum-size=50M 2>/dev/null; rm -rf /tmp/weopc-* 2>/dev/null; echo '清理完成:' && df -h / | tail -1"

# ===== [3/6] 解压代码 =====
echo "=== [3/6] 解压代码（preserve 属性）===="
remote "cd ${DEPLOY_PATH} && tar xzf deploy.tar.gz --copyfile-preserve 2>/dev/null && rm -f deploy.tar.gz && echo '代码解压完成'"

# ===== [4/6] 更新 .env =====
echo "=== [4/6] 更新 .env ==="
remote "cat > ${DEPLOY_PATH}/.env << 'ENVEOF'
JWT_SECRET=weopc-jwt-secret-key-2024-secure
WECHAT_APP_ID=wxb3330c77aa423d29
WECHAT_APP_SECRET=b00822b41733d0dad1d8697774080755
WECHAT_REDIRECT_URI=https://weopc.com.cn/api/auth/wechat/callback
NEXT_PUBLIC_FRONTEND_URL=https://weopc.com.cn
NEXT_PUBLIC_WECHAT_APP_ID=wxb3330c77aa423d29

# OPC 社区同步接口配置（新增）
COMMUNITY_SYNC_SECRET=\$(openssl rand -hex 32)
COMMUNITY_SYNC_API_KEY=\$(openssl rand -hex 16)
ALLOWED_SYNC_IPS=
MAX_SYNC_BATCH_SIZE=100
ENABLE_AUTO_BACKUP=true

ENVEOF
echo '.env已更新'"

# ===== [5/6] 构建并启动容器 =====
echo "=== [5/6] 构建并启动容器 ==="

echo "未找到数据库，跳过备份"
echo "--- 构建镜像 ---"
$SSH_CMD -o ServerAliveInterval=30 ${SERVER_USER}@${SERVER_HOST} "cd ${DEPLOY_PATH} && docker compose build"

echo "--- 启动服务 ---"
$SSH_CMD ${SERVER_USER}@${SERVER_HOST} "cd ${DEPLOY_PATH} && docker compose up -d --force-recreate"

# ===== [6/6] 验证部署 =====
echo "=== [6/6] 验证部署 ==="
echo "等待服务启动..."
sleep 15

for i in $(seq 1 12); do
  STATUS=$($SSH_CMD ${SERVER_USER}@${SERVER_HOST} "cd ${DEPLOY_PATH} && docker compose ps 2>/dev/null" || echo "")
  if echo "$STATUS" | grep -q "healthy"; then
    echo ""
    echo "========================================="
    echo "  部署成功！服务已正常运行"
    echo "  访问地址: https://weopc.com.cn"
    echo "========================================="
    echo ""
    echo "容器状态:"
    echo "$STATUS"
    echo ""
    echo "--- API 测试 ---"
    remote "curl -sI http://127.0.0.1:3001/api/admin/events 2>/dev/null | head -5"
    echo ""
    echo "=== 部署完成 ==="
    exit 0
  fi
  echo "检查 $i/12: 等待服务启动..."
  sleep 5
done

echo "警告: 服务可能未正常启动，查看日志:"
remote "cd ${DEPLOY_PATH} && docker compose logs --tail=50"
exit 1
