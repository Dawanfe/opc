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
  $SSH_CMD ${SERVER_USER}@${SERVER_HOST} "$1"
}

echo "=== WeOPC 部署脚本 ==="
echo "服务器: ${SERVER_USER}@${SERVER_HOST}"
echo "部署路径: ${DEPLOY_PATH}"
echo ""

# ===== [1/6] 打包项目文件 =====
echo "=== [1/6] 打包项目文件 ==="
cd "$PROJECT_DIR"

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

# ===== [2/6] 上传到服务器 =====
echo "=== [2/6] 上传到服务器 ==="
remote "mkdir -p ${DEPLOY_PATH}"
$SCP_CMD "$TMPFILE" ${SERVER_USER}@${SERVER_HOST}:${DEPLOY_PATH}/deploy.tar.gz

rm -f "$TMPFILE"
echo "上传完成"

# ===== [3/6] 清理服务器磁盘空间 =====
echo "=== [3/6] 清理服务器磁盘空间 ==="
remote "df -h / | tail -1 && docker image prune -af 2>/dev/null && docker builder prune -af 2>/dev/null && docker container prune -f 2>/dev/null; apt-get clean 2>/dev/null || yum clean all 2>/dev/null; journalctl --vacuum-size=50M 2>/dev/null; rm -rf /tmp/weopc-* 2>/dev/null; echo '清理完成:' && df -h / | tail -1"

# ===== [4/6] 配置 Docker 国内镜像源 =====
echo "=== [4/6] 配置 Docker 国内镜像源 ==="
remote "if [ ! -f /etc/docker/daemon.json ] || ! grep -q registry-mirrors /etc/docker/daemon.json 2>/dev/null; then mkdir -p /etc/docker && echo '{\"registry-mirrors\":[\"https://docker.1ms.run\",\"https://docker.xuanyuan.me\"]}' > /etc/docker/daemon.json && systemctl daemon-reload && systemctl restart docker && echo 'Docker镜像加速已配置'; else echo 'Docker镜像加速已存在'; fi"

# ===== [5/6] 构建并启动容器 =====
echo "=== [5/6] 构建并启动容器 ==="

# 5a: 备份数据库
remote "mkdir -p ${DEPLOY_PATH}/db-backups; VOLUME_PATH=\$(docker volume inspect weopc-data --format '{{.Mountpoint}}' 2>/dev/null || echo ''); if [ -n \"\$VOLUME_PATH\" ] && [ -f \"\$VOLUME_PATH/opc.db\" ]; then cp \"\$VOLUME_PATH/opc.db\" ${DEPLOY_PATH}/db-backups/opc_deploy_\$(date +%Y%m%d_%H%M%S).db && echo '数据库备份完成'; else echo '未找到数据库,跳过备份'; fi"

# 5b: 解压代码
remote "cd ${DEPLOY_PATH} && tar xzf deploy.tar.gz && rm -f deploy.tar.gz && echo '代码解压完成'"

# 5c: 生成 .env
remote "if [ ! -f ${DEPLOY_PATH}/.env ]; then echo \"JWT_SECRET=\$(openssl rand -hex 32)\" > ${DEPLOY_PATH}/.env && echo '.env已生成'; else echo '.env已存在'; fi"

# 5d: 构建镜像（耗时较长）
echo "--- 构建镜像 ---"
$SSH_CMD -o ServerAliveInterval=30 ${SERVER_USER}@${SERVER_HOST} "cd ${DEPLOY_PATH} && docker compose build --no-cache"

# 5e: 启动服务
echo "--- 启动服务 ---"
remote "cd ${DEPLOY_PATH} && docker compose up -d --force-recreate"

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
    echo "  访问地址: https://globalaialumni.com/weopc"
    echo "========================================="
    echo ""
    echo "容器状态:"
    echo "$STATUS"
    echo ""
    echo "--- API 测试 ---"
    remote "curl -sI http://127.0.0.1:3001/weopc/api/admin/events 2>/dev/null | head -5"
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
