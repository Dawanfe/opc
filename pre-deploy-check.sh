#!/bin/bash

###############################################################################
# 部署前检查脚本
###############################################################################

echo "🔍 开始部署前检查..."
echo ""

# 检查函数
check_ok() {
    echo "✅ $1"
}

check_fail() {
    echo "❌ $1"
    exit 1
}

check_warn() {
    echo "⚠️  $1"
}

# 1. 检查必需的命令
echo "1️⃣  检查本地环境..."
command -v docker >/dev/null 2>&1 && check_ok "Docker 已安装" || check_fail "Docker 未安装"
command -v git >/dev/null 2>&1 && check_ok "Git 已安装" || check_warn "Git 未安装（可选）"
command -v sshpass >/dev/null 2>&1 && check_ok "sshpass 已安装" || check_fail "sshpass 未安装，请运行: brew install hudochenkov/sshpass/sshpass"

echo ""

# 2. 检查必需的文件
echo "2️⃣  检查项目文件..."
[ -f "docker-compose.yml" ] && check_ok "docker-compose.yml 存在" || check_fail "docker-compose.yml 不存在"
[ -f "next/Dockerfile" ] && check_ok "Dockerfile 存在" || check_fail "Dockerfile 不存在"
[ -f "nginx/nginx.conf" ] && check_ok "nginx.conf 存在" || check_fail "nginx.conf 不存在"
[ -f ".env.production" ] && check_ok ".env.production 存在" || check_warn ".env.production 不存在"

echo ""

# 3. 检查服务器连接
echo "3️⃣  检查服务器连接..."
if sshpass -p "GAA-lianmeng666" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 root@101.200.231.179 "echo ok" >/dev/null 2>&1; then
    check_ok "服务器连接正常"
else
    check_fail "无法连接到服务器"
fi

echo ""

# 4. 检查服务器 Docker
echo "4️⃣  检查服务器 Docker..."
if sshpass -p "GAA-lianmeng666" ssh -o StrictHostKeyChecking=no root@101.200.231.179 "docker --version" >/dev/null 2>&1; then
    check_ok "服务器 Docker 已安装"
else
    check_warn "服务器 Docker 未安装（将在部署时自动安装）"
fi

echo ""

# 5. 检查代码状态
echo "5️⃣  检查代码状态..."
if [ -d ".git" ]; then
    if git diff --quiet; then
        check_ok "工作区干净，无未提交的改动"
    else
        check_warn "工作区有未提交的改动"
    fi
else
    check_warn "不是 Git 仓库"
fi

echo ""

# 6. 检查数据库文件
echo "6️⃣  检查数据库..."
if [ -f "next/data/opc.db" ]; then
    SIZE=$(du -h next/data/opc.db | cut -f1)
    check_ok "数据库文件存在 (大小: $SIZE)"
else
    check_warn "数据库文件不存在（将在部署时初始化）"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ 检查完成！您可以开始部署了。"
echo ""
echo "部署命令："
echo "  完整部署: ./deploy.sh"
echo "  快速部署: ./quick-deploy.sh"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
