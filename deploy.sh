#!/bin/bash

###############################################################################
# WeOPC 一键部署脚本
# 用途: 自动将 WeOPC 应用部署到服务器
# 服务器: 101.200.231.179
# 域名: globalaialumni.com/weopc
###############################################################################

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 服务器配置
SERVER_IP="101.200.231.179"
SERVER_USER="root"
SERVER_PASSWORD="GAA-lianmeng666"
DEPLOY_PATH="/opt/weopc"
PROJECT_NAME="weopc"

# 函数: 打印信息
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 函数: 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 未安装，请先安装"
        exit 1
    fi
}

# 函数: SSH 执行命令
ssh_exec() {
    sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} "$1"
}

# 函数: SCP 上传文件
scp_upload() {
    sshpass -p "${SERVER_PASSWORD}" scp -o StrictHostKeyChecking=no -r $1 ${SERVER_USER}@${SERVER_IP}:$2
}

log_info "========================================"
log_info "开始部署 WeOPC 到服务器"
log_info "========================================"

# 1. 检查本地环境
log_info "1. 检查本地环境..."
check_command "docker"
check_command "git"
check_command "sshpass"

if [ ! -f "docker-compose.yml" ]; then
    log_error "docker-compose.yml 文件不存在"
    exit 1
fi

# 2. 创建部署包
log_info "2. 创建部署包..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DEPLOY_PACKAGE="weopc_${TIMESTAMP}.tar.gz"

# 排除不需要的文件
tar --exclude='node_modules' \
    --exclude='.next' \
    --exclude='data' \
    --exclude='.git' \
    --exclude='*.log' \
    -czf ${DEPLOY_PACKAGE} \
    docker-compose.yml \
    nginx/ \
    next/ \
    .env.production \
    README.md

log_info "部署包创建完成: ${DEPLOY_PACKAGE}"

# 3. 检查服务器环境
log_info "3. 检查服务器环境..."

# 检查 Docker 是否安装
if ! ssh_exec "command -v docker &> /dev/null"; then
    log_warn "服务器未安装 Docker，开始安装..."
    ssh_exec "curl -fsSL https://get.docker.com | sh && systemctl start docker && systemctl enable docker"
    log_info "Docker 安装完成"
fi

# 检查 Docker Compose 是否安装
if ! ssh_exec "command -v docker-compose &> /dev/null && command -v docker &> /dev/null && docker compose version &> /dev/null"; then
    log_warn "服务器未安装 Docker Compose，开始安装..."
    ssh_exec "curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose && chmod +x /usr/local/bin/docker-compose"
    log_info "Docker Compose 安装完成"
fi

# 4. 创建部署目录
log_info "4. 创建部署目录..."
ssh_exec "mkdir -p ${DEPLOY_PATH} ${DEPLOY_PATH}/backups"

# 5. 备份现有部署（如果存在）
if ssh_exec "[ -f ${DEPLOY_PATH}/docker-compose.yml ]"; then
    log_info "5. 备份现有部署..."
    ssh_exec "cd ${DEPLOY_PATH} && tar -czf backups/backup_${TIMESTAMP}.tar.gz docker-compose.yml nginx/ next/ .env.production 2>/dev/null || true"
    log_info "备份完成: ${DEPLOY_PATH}/backups/backup_${TIMESTAMP}.tar.gz"
else
    log_info "5. 无需备份（首次部署）"
fi

# 6. 上传部署包
log_info "6. 上传部署包到服务器..."
scp_upload ${DEPLOY_PACKAGE} ${DEPLOY_PATH}/

# 7. 解压部署包
log_info "7. 解压部署包..."
ssh_exec "cd ${DEPLOY_PATH} && tar -xzf ${DEPLOY_PACKAGE} && rm ${DEPLOY_PACKAGE}"

# 8. 停止旧容器
log_info "8. 停止旧容器..."
ssh_exec "cd ${DEPLOY_PATH} && docker-compose down || true"

# 9. 构建并启动新容器
log_info "9. 构建并启动新容器..."
ssh_exec "cd ${DEPLOY_PATH} && docker-compose up -d --build"

# 10. 等待服务启动
log_info "10. 等待服务启动..."
sleep 10

# 11. 检查服务状态
log_info "11. 检查服务状态..."
if ssh_exec "cd ${DEPLOY_PATH} && docker-compose ps | grep -q 'Up'"; then
    log_info "✓ 容器运行正常"
else
    log_error "✗ 容器启动失败，请查看日志"
    ssh_exec "cd ${DEPLOY_PATH} && docker-compose logs --tail=50"
    exit 1
fi

# 12. 显示服务日志（最后20行）
log_info "12. 服务日志（最后20行）:"
ssh_exec "cd ${DEPLOY_PATH} && docker-compose logs --tail=20"

# 13. 清理本地部署包
log_info "13. 清理本地部署包..."
rm -f ${DEPLOY_PACKAGE}

# 14. 配置自动备份（首次部署时）
log_info "14. 配置自动备份..."
ssh_exec "cat > ${DEPLOY_PATH}/backup-db-cron.sh << 'EOFBACKUP'
#!/bin/bash
set -e

BACKUP_DIR=\"${DEPLOY_PATH}/backups/database\"
CONTAINER_NAME=\"weopc-app\"
DB_PATH=\"/app/data/opc.db\"
KEEP_DAYS=30

mkdir -p \${BACKUP_DIR}
TIMESTAMP=\$(date +%Y%m%d_%H%M%S)
BACKUP_FILE=\"opc_db_\${TIMESTAMP}.db\"

LOG_FILE=\"${DEPLOY_PATH}/backups/backup.log\"
echo \"[\$(date '+%Y-%m-%d %H:%M:%S')] Starting database backup...\" >> \${LOG_FILE}

if docker ps | grep -q \${CONTAINER_NAME}; then
    docker exec \${CONTAINER_NAME} cat \${DB_PATH} > \${BACKUP_DIR}/\${BACKUP_FILE}
    gzip \${BACKUP_DIR}/\${BACKUP_FILE}
    SIZE=\$(du -h \${BACKUP_DIR}/\${BACKUP_FILE}.gz | cut -f1)
    echo \"[\$(date '+%Y-%m-%d %H:%M:%S')] Backup completed: \${BACKUP_FILE}.gz (\${SIZE})\" >> \${LOG_FILE}
    DELETED=\$(find \${BACKUP_DIR} -name \"opc_db_*.db.gz\" -mtime +\${KEEP_DAYS} -delete -print | wc -l)
    if [ \$DELETED -gt 0 ]; then
        echo \"[\$(date '+%Y-%m-%d %H:%M:%S')] Cleaned up \${DELETED} old backups\" >> \${LOG_FILE}
    fi
else
    echo \"[\$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Container \${CONTAINER_NAME} is not running\" >> \${LOG_FILE}
    exit 1
fi
EOFBACKUP
"

ssh_exec "chmod +x ${DEPLOY_PATH}/backup-db-cron.sh"

# 检查并添加 cron 任务
CRON_ADDED=\$(ssh_exec "if ! crontab -l 2>/dev/null | grep -q 'backup-db-cron.sh'; then (crontab -l 2>/dev/null; echo '0 2 * * * ${DEPLOY_PATH}/backup-db-cron.sh') | crontab - && echo 'yes' || echo 'no'; else echo 'exists'; fi")

if [ "\$CRON_ADDED" = "yes" ]; then
    log_info "✓ 自动备份已配置（每天凌晨2:00）"
elif [ "\$CRON_ADDED" = "exists" ]; then
    log_info "✓ 自动备份已存在"
else
    log_warn "⚠ 自动备份配置可能失败，请手动执行: ./setup-auto-backup.sh"
fi

# 15. 完成
log_info "========================================"
log_info "部署完成！"
log_info "========================================"
log_info "访问地址: http://globalaialumni.com/weopc"
log_info "管理后台: http://globalaialumni.com/weopc/admin"
log_info ""
log_info "✅ 已自动配置:"
log_info "  - Docker 容器运行中"
log_info "  - 数据库持久化（Docker Volume）"
log_info "  - 自动备份（每天凌晨2:00）"
log_info "  - 备份保留30天"
log_info ""
log_info "常用命令:"
log_info "  查看日志: ssh root@${SERVER_IP} 'cd ${DEPLOY_PATH} && docker-compose logs -f'"
log_info "  重启服务: ssh root@${SERVER_IP} 'cd ${DEPLOY_PATH} && docker-compose restart'"
log_info "  查看备份: ssh root@${SERVER_IP} 'ls -lh ${DEPLOY_PATH}/backups/database/'"
log_info "  手动备份: ./backup-db.sh"
log_info ""
log_info "⚠️  安全提醒:"
log_info "  1. 登录后台修改管理员密码（默认: admin/admin123）"
log_info "  2. 修改 JWT_SECRET（可选）"
log_info "  3. 配置 SSL 证书启用 HTTPS（建议）"
