#!/bin/bash

# 部署脚本
set -e

echo "🚀 开始部署..."

# 1. 拉取最新代码
echo "1️⃣ 拉取最新代码..."
git pull origin main

# 2. 预先拉取 Docker 基础镜像（使用阿里云镜像加速）
echo "2️⃣ 拉取 Docker 基础镜像..."
if ! docker images | grep -q "node.*20-alpine"; then
    echo "从阿里云拉取 node:20-alpine 镜像..."
    docker pull registry.cn-hangzhou.aliyuncs.com/library/node:20-alpine || {
        echo "⚠️  阿里云镜像失败，尝试腾讯云..."
        docker pull ccr.ccs.tencentyun.com/library/node:20-alpine || {
            echo "⚠️  腾讯云镜像失败，尝试 Docker Hub..."
            docker pull node:20-alpine
        }
    }
    docker tag registry.cn-hangzhou.aliyuncs.com/library/node:20-alpine node:20-alpine 2>/dev/null || true
    docker tag ccr.ccs.tencentyun.com/library/node:20-alpine node:20-alpine 2>/dev/null || true
fi

# 3. 重新构建镜像
echo "3️⃣ 重新构建镜像..."
docker-compose build --no-cache

# 4. 重启服务
echo "4️⃣ 重启服务..."
docker-compose down
docker-compose up -d

# 5. 等待服务启动
echo "5️⃣ 等待服务启动..."
sleep 5

# 6. 检查服务状态
echo "6️⃣ 检查服务状态..."
docker-compose ps

# 7. 查看日志
echo "7️⃣ 查看最近日志..."
docker-compose logs --tail=50

echo "✅ 部署完成！"
echo ""
echo "验证步骤："
echo "1. 访问 https://weopc.com.cn"
echo "2. 登录后访问 /invite 页面"
echo "3. 点击'立即生成邀请码'按钮"
echo "4. 确认生成成功"
