.PHONY: help test test-integration test-unit test-performance test-all dev clean

# 默认目标
help:
	@echo "邀请码功能测试命令:"
	@echo "  make test              - 运行集成测试"
	@echo "  make test-unit         - 运行单元测试 (Jest)"
	@echo "  make test-performance  - 运行性能测试"
	@echo "  make test-all          - 运行所有测试"
	@echo "  make dev               - 启动开发服务器"
	@echo "  make clean             - 清理测试数据"

# 集成测试
test:
	@echo "🧪 运行集成测试..."
	@cd next && ./test-invite.sh

# 单元测试
test-unit:
	@echo "🧪 运行单元测试..."
	@cd next/tests && npm install && npm test

# 性能测试
test-performance:
	@echo "🧪 运行性能测试..."
	@cd next && npx tsx tests/invite-performance.test.ts

# 运行所有测试
test-all: test test-unit test-performance
	@echo "✅ 所有测试完成!"

# 启动开发服务器
dev:
	@echo "🚀 启动开发服务器..."
	@cd next && npm run dev

# 清理测试数据
clean:
	@echo "🧹 清理测试数据..."
	@cd next && sqlite3 data/opc.db "DELETE FROM invite_records WHERE inviteCode LIKE 'TEST%'; DELETE FROM users WHERE phone LIKE '199%';"
	@echo "✅ 清理完成"
