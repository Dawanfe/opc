# 邀请码功能测试 - 快速参考

## 🚀 快速开始

### 一键运行所有测试
```bash
cd next
./test-invite.sh
```

### 或使用 Make
```bash
make test
```

---

## 📝 常用命令

| 命令 | 说明 |
|------|------|
| `npm run test:invite` | 运行集成测试 |
| `npm run test:invite:perf` | 运行性能测试 |
| `npm run test:invite:all` | 运行完整测试套件 |
| `npm run test:seed` | 生成测试数据 |
| `npm run test:seed clean` | 清理测试数据 |

---

## 🧪 测试场景

### 1. 生成测试数据（50个用户，70%邀请关系）
```bash
npm run test:seed
```

### 2. 生成大量测试数据（100个用户，80%邀请关系）
```bash
npm run test:seed -- --count=100 --rate=0.8
```

### 3. 清理测试数据
```bash
npm run test:seed clean
```

### 4. 运行集成测试
```bash
npm run test:invite
```

### 5. 运行性能测试
```bash
npm run test:invite:perf
```

---

## 🔍 验证功能

### 前端页面
- 用户邀请页面: http://localhost:3000/invite
- 管理统计页面: http://localhost:3000/admin/invite-stats

### API 测试
```bash
# 注册（带邀请码）
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone":"19900000001","password":"test123456","inviteCode":"ABC12345"}'

# 查询邀请信息
curl http://localhost:3000/api/user/invite-info \
  -H "Authorization: Bearer YOUR_TOKEN"

# 管理统计
curl http://localhost:3000/api/admin/invite-stats
```

---

## 🎯 测试账号

生成测试数据后可用：

| 账号 | 密码 | 说明 |
|------|------|------|
| 19910000 | test123456 | 测试用户1 |
| 19910001 | test123456 | 测试用户2 |
| ... | test123456 | 更多测试用户 |

---

## 📊 预期结果

### 集成测试
- ✅ 8个测试全部通过
- ⏱️ 总耗时 < 10秒

### 性能测试
- 邀请码生成: > 10,000 个/秒
- 数据库查询: < 5ms/次
- 并发注册: 50并发，< 10%失败

---

## 🐛 常见问题

### Q: 测试失败 "开发服务器未运行"
**A:** 启动开发服务器
```bash
npm run dev
```

### Q: 测试数据已存在
**A:** 清理后重试
```bash
npm run test:seed clean
npm run test:seed
```

### Q: 数据库锁定
**A:** 重启数据库
```bash
pkill -f next
rm -f data/opc.db-shm data/opc.db-wal
npm run dev
```

---

## 📚 更多信息

- 完整文档: [TESTING.md](./TESTING.md)
- 功能说明: [INVITE_FEATURE.md](./INVITE_FEATURE.md)
