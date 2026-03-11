#!/bin/bash

# 邀请码功能自动化测试脚本
# 使用方法: ./test-invite.sh

set -e  # 遇到错误立即退出

echo "🔧 准备测试环境..."

# 1. 检查开发服务器是否运行
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "⚠️  开发服务器未运行，正在启动..."
    cd next
    npm run dev > /tmp/next-dev.log 2>&1 &
    DEV_SERVER_PID=$!

    echo "等待服务器启动..."
    for i in {1..30}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            echo "✅ 开发服务器已启动 (PID: $DEV_SERVER_PID)"
            break
        fi
        sleep 1
    done

    if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "❌ 开发服务器启动失败"
        exit 1
    fi

    NEED_CLEANUP=true
else
    echo "✅ 开发服务器已运行"
    NEED_CLEANUP=false
fi

# 2. 初始化数据库（如果需要）
echo "📦 初始化数据库..."
cd next
npm run db:init || true

# 3. 运行测试
echo ""
echo "🧪 开始运行测试..."
echo "=================================================="
npx tsx tests/invite.test.ts

TEST_RESULT=$?

# 4. 清理
if [ "$NEED_CLEANUP" = true ]; then
    echo ""
    echo "🧹 清理测试环境..."
    if [ -n "$DEV_SERVER_PID" ]; then
        kill $DEV_SERVER_PID 2>/dev/null || true
        echo "✅ 开发服务器已停止"
    fi
fi

# 5. 输出结果
echo ""
if [ $TEST_RESULT -eq 0 ]; then
    echo "🎉 所有测试通过！"
else
    echo "❌ 部分测试失败"
fi

exit $TEST_RESULT
