# 生成邀请码 500 错误排查指南

## ❌ 错误信息
```
Request URL: https://weopc.com.cn/api/user/generate-invite-code
Request Method: POST
Status Code: 500 Internal Server Error
```

## ✅ 本地测试结果
```
🧪 测试生成邀请码功能

1️⃣ 登录获取token... ✅
2️⃣ 生成邀请码... ✅
3️⃣ 验证邀请码... ✅
4️⃣ 测试重复生成... ✅

本地测试: 100% 通过
```

## 🔍 根本原因分析

### 之前的问题
**数据库连接冲突** - `generateUniqueInviteCode()` 内部打开新连接，导致嵌套连接冲突

### 已修复
**文件**: `next/src/app/api/user/generate-invite-code/route.ts`

**修复内容**:
```typescript
// 之前 ❌ - 会创建嵌套的数据库连接
const newInviteCode = generateUniqueInviteCode();  // 内部又调用 getDb()

// 修复后 ✅ - 在同一个连接中完成所有操作
const db = getDb();
try {
  // 在同一个 db 连接中生成和检查
  let newInviteCode: string;
  while (retries < maxRetries) {
    newInviteCode = generateInviteCode();
    const existing = db.prepare('SELECT...').get(newInviteCode);
    if (!existing) {
      db.prepare('UPDATE...').run(newInviteCode, userId);
      return;
    }
  }
} finally {
  db.close();
}
```

## 🚀 生产环境排查步骤

### 1. 检查日志
```bash
# Docker 容器日志
docker logs <container-id> --tail 100

# 查找错误信息
docker logs <container-id> 2>&1 | grep -i "generate invite code error"
```

**预期看到的错误**:
- `database is locked` - 数据库锁定
- `Failed to generate unique invite code` - 重试次数用完
- `getDb is not a function` - 模块导入问题
- Stack trace with file paths

### 2. 验证数据库权限
```bash
# 进入容器
docker exec -it <container-id> sh

# 检查数据库文件
ls -la /app/data/opc.db

# 测试数据库连接
sqlite3 /app/data/opc.db "SELECT COUNT(*) FROM users;"
```

**预期输出**:
```
-rw-r--r-- 1 nextjs nodejs ... opc.db
```

### 3. 检查环境变量
```bash
docker exec <container-id> env | grep -E "JWT_SECRET|NODE_ENV"
```

**必需的环境变量**:
- `NODE_ENV=production`
- `JWT_SECRET=<实际secret>`

### 4. 手动测试 API
```bash
# 获取 token (登录)
TOKEN=$(curl -X POST https://weopc.com.cn/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"your-phone","password":"your-password"}' \
  | jq -r '.token')

# 测试生成邀请码
curl -X POST https://weopc.com.cn/api/user/generate-invite-code \
  -H "Authorization: Bearer $TOKEN" \
  -v
```

**预期响应**:
```json
{
  "message": "邀请码生成成功",
  "inviteCode": "ABC12345"
}
```

**如果失败，检查响应体**:
```json
{
  "error": "生成邀请码失败",
  "details": "具体错误信息"
}
```

## 🛠️ 可能的解决方案

### 方案1: 重启服务
```bash
docker-compose restart
# 或
docker restart <container-id>
```

**适用场景**: 数据库锁定、临时性错误

### 方案2: 重新部署
```bash
# 拉取最新代码
git pull origin main

# 重新构建镜像
docker-compose build --no-cache

# 重启服务
docker-compose up -d
```

**适用场景**: 代码未正确部署、构建缓存问题

### 方案3: 数据库权限修复
```bash
# 进入容器
docker exec -it <container-id> sh

# 修复权限
chown nextjs:nodejs /app/data/opc.db
chmod 664 /app/data/opc.db

# 退出并重启
exit
docker restart <container-id>
```

**适用场景**: 数据库权限问题

### 方案4: 清理数据库锁
```bash
# 进入容器
docker exec -it <container-id> sh

# 检查锁文件
ls -la /app/data/opc.db-wal /app/data/opc.db-shm

# 删除锁文件（需要先停止服务）
rm -f /app/data/opc.db-wal /app/data/opc.db-shm
```

**适用场景**: 数据库死锁

## 📊 验证修复

### 测试脚本
创建文件 `test-generate.sh`:
```bash
#!/bin/bash
API_BASE="https://weopc.com.cn"

echo "1. 登录..."
RESPONSE=$(curl -s -X POST $API_BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"test-phone","password":"test-pwd"}')

TOKEN=$(echo $RESPONSE | jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ 登录失败"
  echo $RESPONSE | jq
  exit 1
fi

echo "✅ 登录成功"

echo "2. 生成邀请码..."
GENERATE_RESPONSE=$(curl -s -X POST $API_BASE/api/user/generate-invite-code \
  -H "Authorization: Bearer $TOKEN")

ERROR=$(echo $GENERATE_RESPONSE | jq -r '.error')
INVITE_CODE=$(echo $GENERATE_RESPONSE | jq -r '.inviteCode')

if [ "$ERROR" != "null" ] && [ "$ERROR" != "您已经有邀请码了" ]; then
  echo "❌ 生成失败"
  echo $GENERATE_RESPONSE | jq
  exit 1
fi

echo "✅ 生成成功: $INVITE_CODE"
```

运行测试:
```bash
chmod +x test-generate.sh
./test-generate.sh
```

## 🔄 回滚方案

如果新版本有问题，回滚到之前的版本:

```bash
# 查看镜像历史
docker images

# 运行之前的版本
docker run -d -p 3000:3000 weopc:<previous-tag>

# 或使用 docker-compose
# 修改 docker-compose.yml 中的 image tag
docker-compose up -d
```

## 📝 监控和预防

### 1. 添加错误监控
在 API 中添加更详细的日志:
```typescript
console.error('Generate invite code error:', {
  error: error.message,
  stack: error.stack,
  userId,
  timestamp: new Date().toISOString()
});
```

### 2. 健康检查
添加健康检查端点:
```typescript
// /api/health
export async function GET() {
  try {
    const db = getDb();
    db.prepare('SELECT 1').get();
    db.close();
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}
```

### 3. 数据库连接池
考虑使用连接池避免频繁打开关闭连接

## 📞 联系支持

如果以上方法都无法解决，请提供:
1. 完整的错误日志
2. 数据库状态 (`SELECT COUNT(*) FROM users`)
3. 环境变量配置（隐藏敏感信息）
4. Docker 容器状态 (`docker ps`)

---

## ✅ 快速检查清单

- [ ] 检查 Docker 日志
- [ ] 验证数据库权限
- [ ] 确认环境变量
- [ ] 手动测试 API
- [ ] 重启服务
- [ ] 重新部署
- [ ] 运行测试脚本
- [ ] 验证修复

---

最后更新: 2026-03-11
版本: v1.1
状态: 已修复数据库连接问题
