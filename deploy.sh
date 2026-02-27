#!/bin/bash
set -e

# ===== 服务器配置 =====
SERVER_HOST="101.200.231.179"
SERVER_USER="root"
SERVER_PASS="GAA-lianmeng666"
DEPLOY_PATH="/opt/weopc"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

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
sshpass -p "${SERVER_PASS}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${DEPLOY_PATH}"
sshpass -p "${SERVER_PASS}" scp -o StrictHostKeyChecking=no "$TMPFILE" ${SERVER_USER}@${SERVER_HOST}:${DEPLOY_PATH}/deploy.tar.gz

rm -f "$TMPFILE"
echo "上传完成"

# ===== [3/6] 清理服务器磁盘空间 =====
echo "=== [3/6] 清理服务器磁盘空间 ==="
sshpass -p "${SERVER_PASS}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} bash <<'CLEAN_SCRIPT'
set -e
echo "清理前磁盘使用:"
df -h / | tail -1

echo "--- 清理 Docker 资源 ---"
docker image prune -af 2>/dev/null || true
docker builder prune -af 2>/dev/null || true
docker container prune -f 2>/dev/null || true

echo "--- 清理系统缓存 ---"
apt-get clean 2>/dev/null || yum clean all 2>/dev/null || true
journalctl --vacuum-size=50M 2>/dev/null || true
rm -rf /tmp/weopc-* 2>/dev/null || true

echo "清理后磁盘使用:"
df -h / | tail -1
CLEAN_SCRIPT

# ===== [4/6] 配置 Docker 国内镜像源 =====
echo "=== [4/6] 配置 Docker 国内镜像源 ==="
sshpass -p "${SERVER_PASS}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} bash <<'MIRROR_SCRIPT'
set -e
DAEMON_JSON="/etc/docker/daemon.json"
if [ ! -f "$DAEMON_JSON" ] || ! grep -q "registry-mirrors" "$DAEMON_JSON" 2>/dev/null; then
  echo "配置 Docker 镜像加速..."
  mkdir -p /etc/docker
  cat > "$DAEMON_JSON" <<'DJEOF'
{
  "registry-mirrors": [
    "https://docker.1ms.run",
    "https://docker.xuanyuan.me"
  ]
}
DJEOF
  systemctl daemon-reload
  systemctl restart docker
  echo "Docker 镜像加速已配置并重启"
else
  echo "Docker 镜像加速已存在，跳过"
fi
MIRROR_SCRIPT

# ===== [5/6] 构建并启动容器 =====
echo "=== [5/6] 构建并启动容器 ==="
sshpass -p "${SERVER_PASS}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} bash <<'REMOTE_SCRIPT'
set -e

DEPLOY_PATH="/opt/weopc"
BACKUP_DIR="${DEPLOY_PATH}/db-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# 备份现有数据库
echo "--- 备份数据库 ---"
mkdir -p "$BACKUP_DIR"
VOLUME_PATH=$(docker volume inspect weopc-data --format '{{.Mountpoint}}' 2>/dev/null || echo "")
if [ -n "$VOLUME_PATH" ] && [ -f "$VOLUME_PATH/opc.db" ]; then
  cp "$VOLUME_PATH/opc.db" "$BACKUP_DIR/opc_deploy_${TIMESTAMP}.db"
  cd "$BACKUP_DIR" && ls -t opc_deploy_*.db 2>/dev/null | tail -n +21 | xargs rm -f 2>/dev/null || true
  echo "备份完成: opc_deploy_${TIMESTAMP}.db"
else
  echo "未找到现有数据库（首次部署），跳过备份"
fi

# 解压新代码
echo "--- 解压代码 ---"
cd "$DEPLOY_PATH"
tar xzf deploy.tar.gz
rm -f deploy.tar.gz

# 生成 .env（如果不存在则创建默认值）
if [ ! -f "$DEPLOY_PATH/.env" ]; then
  echo "--- 生成 .env ---"
  JWT_SECRET=$(openssl rand -hex 32)
  echo "JWT_SECRET=${JWT_SECRET}" > "$DEPLOY_PATH/.env"
  echo ".env 已生成（JWT_SECRET 已自动创建）"
else
  echo ".env 已存在，保持不变"
fi

# 构建并启动
echo "--- 构建镜像 ---"
cd "$DEPLOY_PATH"
docker compose build --no-cache

echo "--- 启动服务 ---"
docker compose up -d --force-recreate
REMOTE_SCRIPT

# ===== [6/6] 验证部署 =====
echo "=== [6/6] 验证部署 ==="
sshpass -p "${SERVER_PASS}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} bash <<'CHECK_SCRIPT'
set -e
cd /opt/weopc

echo "等待服务启动..."
sleep 10
for i in $(seq 1 12); do
  if docker compose ps | grep -q "healthy"; then
    echo ""
    echo "========================================="
    echo "  部署成功！服务已正常运行"
    echo "  访问地址: https://globalaialumni.com/weopc"
    echo "========================================="
    echo ""
    echo "容器状态:"
    docker compose ps
    echo ""
    echo "访问验证:"
    curl -sI https://globalaialumni.com/weopc 2>/dev/null | head -3 || curl -sI http://127.0.0.1:3001/weopc 2>/dev/null | head -3
    exit 0
  fi
  echo "检查 $i/12: 等待服务启动..."
  sleep 5
done

echo "警告: 服务可能未正常启动，查看日志:"
docker compose logs --tail=50
exit 1
CHECK_SCRIPT

echo ""
echo "=== 部署完成 ==="
