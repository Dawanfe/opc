#!/bin/bash

# 邀请码功能完整测试脚本
# 一键运行所有测试，适合每次开发完成后执行

set -e  # 遇到错误立即退出

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║         邀请码功能完整测试套件                            ║"
echo "║         一键执行所有测试                                  ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 记录开始时间
START_TIME=$(date +%s)

# 1. 检查开发服务器
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 步骤 1/4: 检查开发服务器"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  开发服务器未运行，正在启动...${NC}"
    cd next
    npm run dev > /tmp/next-dev.log 2>&1 &
    DEV_SERVER_PID=$!
    cd ..

    echo "等待服务器启动..."
    for i in {1..30}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            echo -e "${GREEN}✅ 开发服务器已启动 (PID: $DEV_SERVER_PID)${NC}"
            break
        fi
        sleep 1
        echo -n "."
    done
    echo ""

    if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${RED}❌ 开发服务器启动失败${NC}"
        exit 1
    fi

    NEED_CLEANUP=true
else
    echo -e "${GREEN}✅ 开发服务器已运行${NC}"
    NEED_CLEANUP=false
fi

# 2. 初始化数据库
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 步骤 2/4: 初始化数据库"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd next
npm run db:init > /dev/null 2>&1 || true
echo -e "${GREEN}✅ 数据库初始化完成${NC}"
cd ..

# 3. 运行完整测试套件
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 步骤 3/4: 运行完整测试套件"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd next
npx tsx tests/invite-complete.test.ts
TEST_RESULT=$?
cd ..

# 4. 清理
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧹 步骤 4/4: 清理测试环境"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$NEED_CLEANUP" = true ]; then
    if [ -n "$DEV_SERVER_PID" ]; then
        kill $DEV_SERVER_PID 2>/dev/null || true
        echo -e "${GREEN}✅ 开发服务器已停止${NC}"
    fi
fi

# 计算总耗时
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# 5. 输出最终结果
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 测试执行完毕"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⏱️  总耗时: ${DURATION}秒"

if [ $TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}🎉 所有测试通过！功能正常！${NC}"
    echo ""
    echo "📝 提示："
    echo "  - 可以继续开发或部署"
    echo "  - 建议每次修改后都运行此测试"
else
    echo -e "${RED}❌ 部分测试失败${NC}"
    echo ""
    echo "📝 建议："
    echo "  - 检查上述错误信息"
    echo "  - 修复问题后重新运行测试"
    echo "  - 查看日志: /tmp/next-dev.log"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit $TEST_RESULT
