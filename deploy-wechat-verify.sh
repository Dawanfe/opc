#!/bin/bash
# 微信公众号验证文件部署脚本

set -e

echo "=== 微信公众号验证文件部署 ==="
echo ""

# 检查参数
if [ $# -ne 2 ]; then
    echo "用法: ./deploy-wechat-verify.sh <文件名> <文件内容>"
    echo ""
    echo "示例:"
    echo "  ./deploy-wechat-verify.sh MP_verify_abc123.txt 'abc123456789'"
    echo ""
    exit 1
fi

FILENAME=$1
CONTENT=$2

echo "验证文件名: $FILENAME"
echo "验证内容: $CONTENT"
echo ""

# 在本地创建验证文件
echo "$CONTENT" > "next/public/$FILENAME"
echo "✓ 本地文件已创建: next/public/$FILENAME"

# 验证文件内容
if [ -f "next/public/$FILENAME" ]; then
    echo "✓ 文件内容确认:"
    cat "next/public/$FILENAME"
    echo ""
else
    echo "✗ 文件创建失败"
    exit 1
fi

# 询问是否立即部署
read -p "是否立即部署到生产环境？(y/n): " DEPLOY

if [ "$DEPLOY" = "y" ] || [ "$DEPLOY" = "Y" ]; then
    echo ""
    echo "=== 开始部署 ==="
    ./deploy.sh

    echo ""
    echo "=== 部署完成 ==="
    echo ""
    echo "请在微信公众平台验证："
    echo "1. 访问: https://weopc.com.cn/$FILENAME"
    echo "2. 确认内容是: $CONTENT"
    echo "3. 在微信公众平台点击【确定】完成验证"
    echo ""
else
    echo ""
    echo "文件已创建但未部署，稍后可以运行 ./deploy.sh 手动部署"
fi
