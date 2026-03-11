#!/bin/bash

# Docker 镜像拉取脚本
set -e

echo "🔍 尝试不同的方式拉取 node:20-alpine 镜像..."

# 方式1: 阿里云镜像
echo "1️⃣ 尝试阿里云镜像..."
if docker pull registry.cn-hangzhou.aliyuncs.com/library/node:20-alpine 2>/dev/null; then
    docker tag registry.cn-hangzhou.aliyuncs.com/library/node:20-alpine node:20-alpine
    echo "✅ 阿里云镜像拉取成功"
    exit 0
fi

# 方式2: 腾讯云镜像
echo "2️⃣ 尝试腾讯云镜像..."
if docker pull ccr.ccs.tencentyun.com/library/node:20-alpine 2>/dev/null; then
    docker tag ccr.ccs.tencentyun.com/library/node:20-alpine node:20-alpine
    echo "✅ 腾讯云镜像拉取成功"
    exit 0
fi

# 方式3: Docker Hub（需要网络能访问）
echo "3️⃣ 尝试 Docker Hub..."
if docker pull node:20-alpine 2>/dev/null; then
    echo "✅ Docker Hub 拉取成功"
    exit 0
fi

# 方式4: 手动指定代理
echo "4️⃣ 所有方式都失败了"
echo ""
echo "请手动配置 Docker 代理或使用已有镜像"
echo ""
echo "方法1: 配置系统代理后重试"
echo "export HTTP_PROXY=http://proxy-server:port"
echo "export HTTPS_PROXY=http://proxy-server:port"
echo "docker pull node:20-alpine"
echo ""
echo "方法2: 配置 Docker daemon.json"
echo 'sudo tee /etc/docker/daemon.json <<EOF'
echo '{'
echo '  "proxies": {'
echo '    "default": {'
echo '      "httpProxy": "http://proxy-server:port",'
echo '      "httpsProxy": "http://proxy-server:port"'
echo '    }'
echo '  }'
echo '}'
echo 'EOF'
echo "sudo systemctl restart docker"

exit 1
