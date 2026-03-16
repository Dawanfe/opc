#!/bin/bash
# 微信公众号一键配置脚本

set -e

echo "🚀 微信公众号配置向导"
echo "================================"
echo ""

# 询问配置信息
read -p "请输入公众号AppID: " MP_APPID
read -p "请输入公众号AppSecret: " MP_SECRET
read -p "请输入验证文件名 (如 MP_verify_xxx.txt): " VERIFY_FILE
read -p "请输入验证文件内容: " VERIFY_CONTENT

echo ""
echo "📝 配置信息确认："
echo "  AppID: $MP_APPID"
echo "  AppSecret: ${MP_SECRET:0:10}..."
echo "  验证文件: $VERIFY_FILE"
echo ""

read -p "确认无误？(y/n): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "❌ 已取消"
    exit 1
fi

echo ""
echo "⚙️  开始配置..."

# 1. 创建验证文件
echo "$VERIFY_CONTENT" > "next/public/$VERIFY_FILE"
echo "✅ 验证文件已创建: next/public/$VERIFY_FILE"

# 2. 更新 deploy.sh 中的环境变量
if grep -q "WECHAT_MP_APP_ID=" deploy.sh; then
    echo "⚠️  环境变量已存在，跳过修改 deploy.sh"
else
    # 在 .env 部分添加移动端配置
    sed -i '' "/NEXT_PUBLIC_WECHAT_APP_ID=/a\\
WECHAT_MP_APP_ID=$MP_APPID\\
WECHAT_MP_APP_SECRET=$MP_SECRET\\
NEXT_PUBLIC_WECHAT_MP_APP_ID=$MP_APPID
" deploy.sh
    echo "✅ 已更新 deploy.sh 环境变量"
fi

echo ""
echo "🚀 准备部署到生产环境..."
read -p "立即部署？(y/n): " DEPLOY

if [ "$DEPLOY" = "y" ] || [ "$DEPLOY" = "Y" ]; then
    echo ""
    ./deploy.sh

    echo ""
    echo "════════════════════════════════════════"
    echo "✅ 配置完成！"
    echo ""
    echo "📱 现在请在微信公众平台完成最后一步："
    echo "  1. 访问验证文件: https://weopc.com.cn/$VERIFY_FILE"
    echo "  2. 确认内容正确"
    echo "  3. 在微信公众平台点击【确定】"
    echo ""
    echo "🎉 然后就可以测试移动端登录了！"
    echo "════════════════════════════════════════"
else
    echo ""
    echo "📦 配置已保存，稍后运行 ./deploy.sh 部署"
fi
