#!/bin/bash
set -e

# 配置
DEPLOY_HOST="101.200.231.179"
DEPLOY_USER="root"
DEPLOY_PATH="/opt/weopc"
REPO_URL="https://github.com/Dawanfe/opc.git"
BRANCH="main"

SSH_CMD="sshpass -p GAA-lianmeng666 ssh -o StrictHostKeyChecking=no -o PreferredAuthentications=password"
SSH_CMD_LONG="${SSH_CMD} -o ConnectTimeout=60 -o ServerAliveInterval=30"

echo "=== WeOPC 简易部署脚本 ==="
echo "服务器: ${DEPLOY_USER}@${DEPLOY_HOST}"
echo "仓库: ${REPO_URL}"
echo "分支: ${BRANCH}"
echo ""

# 检查 SSH 连接
echo "--- 检查 SSH 连接 ---"
${SSH_CMD_LONG} ${DEPLOY_USER}@${DEPLOY_HOST} "echo 'SSH 连接成功' && exit 0"
if [ $? -ne 0 ]; then
    echo "SSH 连接失败，请检查网络或密码"
    exit 1
fi

# 清理旧代码
echo "--- 清理旧代码 ---"
${SSH_CMD_LONG} ${DEPLOY_USER}@${DEPLOY_HOST} "rm -rf ${DEPLOY_PATH}/next"
echo "清理完成"

# 克隆代码
echo "--- 克隆代码 ---"
${SSH_CMD_LONG} ${DEPLOY_USER}@${DEPLOY_HOST} "mkdir -p ${DEPLOY_PATH} && cd ${DEPLOY_PATH} && git clone --depth=1 ${REPO_URL} ${BRANCH} next"

if [ $? -ne 0 ]; then
    echo "克隆失败"
    exit 1
fi

# 安装依赖并构建
echo "--- 安装依赖并构建 ---"
${SSH_CMD_LONG} ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${DEPLOY_PATH}/next && npm ci --registry=https://registry.npmmirror.com --loglevel=warn"

if [ $? -ne 0 ]; then
    echo "依赖安装失败"
    exit 1
fi

# 构建镜像
echo "--- 构建镜像 ---"
${SSH_CMD_LONG} ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${DEPLOY_PATH}/next && docker compose build"

if [ $? -ne 0 ]; then
    echo "镜像构建失败"
    exit 1
fi

# 启动容器
echo "--- 启动容器 ---"
${SSH_CMD_LONG} ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${DEPLOY_PATH}/next && docker compose up -d --force-recreate"

if [ $? -ne 0 ]; then
    echo "容器启动失败"
    exit 1
fi

# 验证
echo "--- 验证部署 ---"
sleep 10

STATUS=$(${SSH_CMD_LONG} ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${DEPLOY_PATH}/next && docker compose ps 2>/dev/null" || echo "")

if echo "$STATUS" | grep -q "healthy"; then
    echo ""
    echo "========================================="
    echo "  部署成功！"
    echo "  访问地址: https://weopc.com.cn"
    echo "========================================="
    exit 0
fi

echo "等待 10 秒后检查状态..."
sleep 10

STATUS=$(${SSH_CMD_LONG} ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${DEPLOY_PATH}/next && docker compose ps 2>/dev/null" || echo "")

if echo "$STATUS" | grep -q "healthy"; then
    echo ""
    echo "========================================="
    echo "  部署成功！"
    echo "  访问地址: https://weopc.com.cn"
    echo "========================================="
    exit 0
fi

echo "部署可能有问题，查看日志:"
${SSH_CMD_LONG} ${DEPLOY_USER}@${DEPLOY_HOST} "cd ${DEPLOY_PATH}/next && docker compose logs --tail=50"
exit 1
