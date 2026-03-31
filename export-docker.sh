#!/bin/bash
set -e

echo "=== Docker 镜像导出脚本 ==="
echo "此脚本将导出完整的 Docker 镜像为 tar 文件"
echo ""

# 检查 Dockerfile
if [ ! -f "Dockerfile" ]; then
    echo "错误：Dockerfile 不存在"
    exit 1
fi

# 构建镜像
echo "开始构建镜像..."
docker build -t weopc-app .

if [ $? -ne 0 ]; then
    echo "镜像构建失败"
    exit 1
fi

# 导出镜像为 tar
echo "导出镜像为 tar..."
docker save weopc-app -o /tmp/weopc-docker-image.tar

echo ""
echo "========================================="
echo "镜像导出完成！"
echo "========================================="
echo ""
echo "镜像文件: /tmp/weopc-docker-image.tar"
echo "大小: $(du -h /tmp/weopc-docker-image.tar | cut -f1)"
echo ""
echo "下一步："
echo "1. 上传镜像到服务器"
echo "   scp /tmp/weopc-docker-image.tar root@101.200.231.179:/tmp/"
echo ""
echo "2. 在服务器上加载镜像"
echo "   ssh root@101.200.231.179 docker load -i /tmp/weopc-docker-image.tar | docker compose up -d --force-recreate"
echo ""
echo "========================================="
echo ""
