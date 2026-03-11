#!/bin/bash

# 清理 Next.js 进程和锁文件的脚本

echo "🧹 清理 Next.js 开发环境..."

# 1. 停止所有 Next.js 进程
echo "1️⃣ 停止所有 Next.js 进程"
pkill -f "next dev" && echo "   ✅ 已停止" || echo "   ⚠️  没有运行中的进程"

# 2. 清理端口
echo "2️⃣ 清理 3000 端口"
lsof -ti :3000 | xargs kill -9 2>/dev/null && echo "   ✅ 端口已释放" || echo "   ✅ 端口未被占用"

# 3. 删除锁文件
echo "3️⃣ 删除锁文件"
if [ -f "next/.next/dev/lock" ]; then
    rm -f next/.next/dev/lock
    echo "   ✅ 锁文件已删除"
else
    echo "   ✅ 无锁文件"
fi

# 4. 清理临时文件
echo "4️⃣ 清理临时文件"
rm -f /tmp/next-*.log 2>/dev/null
echo "   ✅ 临时文件已清理"

echo ""
echo "✅ 清理完成！现在可以运行 npm run dev"
