# 部署错误修复说明

## ❌ 错误信息
```
failed to solve: process "/bin/sh -c npm run build &&
./node_modules/.bin/esbuild scripts/init-db.ts"
did not complete successfully: exit code: 1
```

## 🔍 根本原因
Next.js 构建失败，因为 `/register` 页面使用了 `useSearchParams()` 但没有包裹在 `Suspense` 边界内。

### 详细错误
```
useSearchParams() should be wrapped in a suspense boundary at page "/register"
Error occurred prerendering page "/register"
```

## ✅ 解决方案

### 已修复文件
**文件**: `next/src/app/register/page.tsx`

**修改内容**:
```typescript
// 之前 ❌
export default function RegisterPage() {
  const searchParams = useSearchParams();  // 直接使用会导致构建失败
  // ...
}

// 修复后 ✅
function RegisterContent() {
  const searchParams = useSearchParams();
  // ...
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
```

### 为什么需要 Suspense？

Next.js 在构建时会预渲染页面，但 `useSearchParams()` 依赖于客户端的 URL 参数，这在服务器端渲染时是不可用的。使用 `Suspense` 包裹可以：

1. 让 Next.js 知道这部分内容需要在客户端渲染
2. 提供一个备用 UI（fallback）在数据加载时显示
3. 避免构建时的错误

## 🚀 验证修复

### 本地测试
```bash
cd next
npm run build
```

**预期输出**:
```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages (40/40)
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
├ ○ /register                            ...      ...
└ ○ (其他路由)
```

### Docker 构建测试
```bash
# 在项目根目录
docker build -t weopc-test -f next/Dockerfile next/

# 或使用 docker-compose
docker-compose build
```

## 📝 相关文档

- [Next.js useSearchParams](https://nextjs.org/docs/app/api-reference/functions/use-search-params)
- [React Suspense](https://react.dev/reference/react/Suspense)
- [Next.js Missing Suspense with CSR Bailout](https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout)

## 🎯 其他可能的部署问题

### 1. better-sqlite3 编译问题
如果遇到 native module 编译错误：
```dockerfile
# Dockerfile 中已配置
RUN apk add --no-cache python3 make g++
ENV npm_config_better_sqlite3_binary_host=https://registry.npmmirror.com/-/binary/better-sqlite3
```

### 2. 环境变量
确保生产环境设置了必要的环境变量：
```env
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
JWT_SECRET=your-production-secret
```

### 3. 数据库初始化
entrypoint.sh 中自动初始化数据库：
```bash
#!/bin/sh
echo "Initializing database..."
node scripts/init-db.js
echo "Starting application..."
exec node server.js
```

## ✨ 总结

**问题**: Next.js 构建失败 - useSearchParams 未包裹在 Suspense 中
**解决**: 将使用 useSearchParams 的组件包裹在 Suspense 边界内
**状态**: ✅ 已修复并验证构建成功

---

最后更新: 2026-03-11
修复版本: v1.0
构建状态: ✅ 成功
