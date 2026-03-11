# 邀请码功能 - 快速开始

## 🚀 每次开发完成后，运行这个命令

```bash
./test-all.sh
```

或

```bash
cd next && npm test
```

## 📋 期望结果

```
🎉 所有测试通过！功能正常！
```

如果看到这个，说明：
- ✅ 所有 53 项测试通过
- ✅ 功能完全正常
- ✅ 可以提交代码或部署

---

## 🧪 测试包含什么？

- **8个功能模块** - 完整覆盖所有功能点
- **53项测试用例** - 从基础功能到边界条件
- **性能基准测试** - 确保性能达标
- **数据库完整性** - 验证数据一致性

详细清单: [TEST_CHECKLIST.md](TEST_CHECKLIST.md)

---

## 📚 更多文档

- [测试清单](TEST_CHECKLIST.md) - 完整测试项目列表
- [测试文档](TESTING.md) - 详细测试说明
- [功能说明](INVITE_FEATURE.md) - 邀请码功能介绍
- [快速参考](TESTING_QUICK.md) - 常用命令速查

---

## 🔄 Git 提交自动测试

已配置 Git pre-commit 钩子，每次提交时自动运行测试：

```bash
git commit -m "your message"
# 自动运行测试，通过后才允许提交
```

如需跳过测试（不推荐）：
```bash
git commit -m "your message" --no-verify
```

---

## ⚡ 其他有用命令

```bash
# 生成测试数据
npm run test:seed

# 清理测试数据
npm run test:seed clean

# 运行性能测试
npm run test:invite:perf
```

---

最后更新: 2026-03-11
