#!/bin/bash

# ===== 部署配置 =====
DEPLOY_PATH="/opt/weopc"
REPO_URL="https://github.com/Dawanfe/opc.git"
BRANCH="main"

echo "=== WeOPC 一键部署脚本 ==="
echo "部署路径: ${DEPLOY_PATH}"
echo "仓库: ${REPO_URL}"
echo "分支: ${BRANCH}"
echo ""

# 检查 git 是否安装
if ! command -v git &>/dev/null; then
    echo "错误：Git 未安装，请先运行: apk add --no-cache git"
    exit 1
fi

# 清理并克隆代码
echo "=== 清理并克隆代码 ==="
cd ${DEPLOY_PATH} || exit 1
rm -rf next tmp-deploy
mkdir -p tmp-deploy

# 使用浅克隆（--depth 1）加快速度，减少数据传输
git clone --depth 1 ${REPO_URL} -b ${BRANCH} tmp-deploy

if [ $? -ne 0 ]; then
    echo "克隆失败"
    rm -rf tmp-deploy
    exit 1
fi

# 重命名
mv tmp-deploy next

# 构建镜像
echo "=== 构建镜像 ==="
cd next || exit 1
docker compose build

if [ $? -ne 0 ]; then
    echo "镜像构建失败"
    exit 1
fi

# 重启容器
echo "=== 重启容器 ==="
docker compose up -d --force-recreate

# 等待服务启动
echo "=== 等待服务启动 ==="
sleep 15

# 验证服务
STATUS=$(docker compose ps --format "{{.State}}" 2>/dev/null)

if echo "$STATUS" | grep -q "running"; then
    echo ""
    echo "========================================="
    echo "  部署成功！服务已启动"
    echo "  访问地址: https://weopc.com.cn"
    echo "========================================="
    echo ""
    docker compose logs --tail=20
    exit 0
else
    echo ""
    echo "========================================="
    echo "  部署失败！"
    echo "========================================="
    echo "容器状态:"
    docker compose ps
    echo ""
    docker compose logs --tail=30
    exit 1
fi
