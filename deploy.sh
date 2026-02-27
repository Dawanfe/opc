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

# ===== [1/7] 打包项目文件 =====
echo "=== [1/7] 打包项目文件 ==="
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

# ===== [2/7] 上传到服务器 =====
echo "=== [2/7] 上传到服务器 ==="
sshpass -p "${SERVER_PASS}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${DEPLOY_PATH}"
sshpass -p "${SERVER_PASS}" scp -o StrictHostKeyChecking=no "$TMPFILE" ${SERVER_USER}@${SERVER_HOST}:${DEPLOY_PATH}/deploy.tar.gz

rm -f "$TMPFILE"
echo "上传完成"

# ===== [3/7] 清理服务器磁盘空间 =====
echo "=== [3/7] 清理服务器磁盘空间 ==="
sshpass -p "${SERVER_PASS}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} bash <<'CLEAN_SCRIPT'
set -e
echo "清理前磁盘使用:"
df -h / | tail -1

echo "--- 清理 Docker 资源 ---"
docker image prune -af 2>/dev/null || true
docker builder prune -af 2>/dev/null || true
docker container prune -f 2>/dev/null || true
docker network prune -f 2>/dev/null || true

echo "--- 清理系统缓存 ---"
apt-get clean 2>/dev/null || true
rm -rf /var/cache/apt/archives/* 2>/dev/null || true
journalctl --vacuum-size=50M 2>/dev/null || true
rm -rf /tmp/* 2>/dev/null || true

echo "清理后磁盘使用:"
df -h / | tail -1
CLEAN_SCRIPT

# ===== [4/7] 配置服务器 Docker 国内镜像源 =====
echo "=== [4/7] 配置 Docker 国内镜像源 ==="
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

# ===== [5/7] 构建并启动容器 =====
echo "=== [5/7] 构建并启动容器 ==="
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

# ===== [6/7] 配置宿主机 Nginx 代理 /weopc =====
echo "=== [6/7] 配置 Nginx 代理 ==="
sshpass -p "${SERVER_PASS}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} bash <<'NGINX_SCRIPT'
set -e

NGINX_CONF_DIR="/etc/nginx"
WEOPC_CONF="$NGINX_CONF_DIR/conf.d/weopc.conf"

# 检查 Nginx 配置目录结构
if [ -d "$NGINX_CONF_DIR/sites-enabled" ]; then
  # Debian/Ubuntu 风格: sites-available + sites-enabled
  WEOPC_CONF="$NGINX_CONF_DIR/sites-available/weopc.conf"
  WEOPC_LINK="$NGINX_CONF_DIR/sites-enabled/weopc.conf"
fi

# 写入 weopc 代理配置（作为独立 snippet，由主配置 include）
# 如果主 Nginx 配置已经有 server block 监听 443 for globalaialumni.com
# 则需要把 location 加到那个 server block 里
# 先检查现有配置中是否已经有 /weopc 的 location
MAIN_CONF=$(nginx -T 2>/dev/null || cat /etc/nginx/nginx.conf)

if echo "$MAIN_CONF" | grep -q "location.*\/weopc"; then
  echo "Nginx 已包含 /weopc 配置，跳过"
else
  echo "写入 /weopc 代理配置..."

  # 找到 globalaialumni.com 的主配置文件
  SITE_CONF=""
  for f in /etc/nginx/sites-available/* /etc/nginx/conf.d/* /etc/nginx/nginx.conf; do
    if [ -f "$f" ] && grep -q "globalaialumni.com" "$f" 2>/dev/null; then
      SITE_CONF="$f"
      break
    fi
  done

  if [ -z "$SITE_CONF" ]; then
    echo "错误: 未找到 globalaialumni.com 的 Nginx 配置文件"
    echo "请手动在对应的 server block 中添加以下 location 配置:"
    echo ""
    echo '    # WeOPC 子路径代理'
    echo '    location /weopc {'
    echo '        proxy_pass http://127.0.0.1:3001;'
    echo '        proxy_http_version 1.1;'
    echo '        proxy_set_header Upgrade $http_upgrade;'
    echo '        proxy_set_header Connection "upgrade";'
    echo '        proxy_set_header Host $host;'
    echo '        proxy_set_header X-Real-IP $remote_addr;'
    echo '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;'
    echo '        proxy_set_header X-Forwarded-Proto $scheme;'
    echo '    }'
    exit 0
  fi

  echo "找到配置文件: $SITE_CONF"

  # 备份原配置
  cp "$SITE_CONF" "${SITE_CONF}.bak.$(date +%Y%m%d%H%M%S)"

  # 在 globalaialumni.com 的 HTTPS server block 中，找最后一个 location 块之后插入
  # 使用 sed 在 "禁止访问隐藏文件" 或最后一个 "}" 之前插入
  # 方案：在包含 globalaialumni.com 的 server block 中的 "location / {" 之前插入

  WEOPC_BLOCK='
    # ====== WeOPC 子路径代理 ======
    location /weopc {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /weopc/_next/static/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        expires 30d;
        add_header Cache-Control "public, immutable";
    }'

  # 插入到第一个 "location / {" 之前（在 globalaialumni.com server block 内）
  # 使用 awk 精确插入
  awk -v block="$WEOPC_BLOCK" '
    /location \/ \{/ && !inserted {
      print block
      print ""
      inserted=1
    }
    { print }
  ' "$SITE_CONF" > "${SITE_CONF}.tmp" && mv "${SITE_CONF}.tmp" "$SITE_CONF"

  # 验证配置
  echo "验证 Nginx 配置..."
  if nginx -t 2>&1; then
    echo "Nginx 配置有效，重载..."
    nginx -s reload
    echo "Nginx 已重载，/weopc 代理已生效"
  else
    echo "Nginx 配置有误，恢复备份..."
    LATEST_BAK=$(ls -t ${SITE_CONF}.bak.* 2>/dev/null | head -1)
    if [ -n "$LATEST_BAK" ]; then
      cp "$LATEST_BAK" "$SITE_CONF"
      nginx -s reload 2>/dev/null || true
    fi
    echo "已恢复原配置，请手动检查"
    exit 1
  fi
fi
NGINX_SCRIPT

# ===== [7/7] 验证部署 =====
echo "=== [7/7] 验证部署 ==="
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
    echo "Nginx 代理验证:"
    curl -sI http://127.0.0.1:3001/weopc 2>/dev/null | head -3 || echo "(容器直连检查)"
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
