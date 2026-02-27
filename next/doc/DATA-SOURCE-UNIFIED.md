# 数据源统一说明

## 问题描述

之前用户侧页面和管理后台使用不同的数据源：
- **用户侧**: 使用静态 JSON 文件（`/events.json`, `opcData.json`）
- **管理后台**: 使用 SQLite 数据库

这导致：
1. 活动显示 12 个（实际数据库有 34 个）
2. 新闻显示 12 个（与数据库一致）
3. 数据不同步

## 解决方案

已将用户侧页面更新为从数据库 API 读取数据，实现数据源统一。

### 修改的文件

1. **[src/sections/Events.tsx](next/src/sections/Events.tsx:26-36)**
   - 从 `fetch('/events.json')` 改为 `fetch('/api/admin/events')`
   - 添加按日期排序
   - 仍保持显示最新 12 条的限制

2. **[src/sections/DailyNews.tsx](next/src/sections/DailyNews.tsx:1-52)**
   - 从直接导入 `opcData.json` 改为 `fetch('/api/admin/news')`
   - 更新字段名从中文改为英文（`标题` → `title`, `内容` → `content` 等）
   - 添加 `useEffect` 动态加载数据

## 数据统计

### 数据库中的数据（真实数据）
- **Communities**: 39 条
- **Events**: 34 条
- **News**: 12 条

### 用户侧显示
- **Communities**: 显示所有 39 条
- **Events**: 显示最新 12 条（从 34 条中筛选）
- **News**: 显示所有 12 条

## 优势

✅ **数据统一**: 用户侧和管理侧使用相同的数据源
✅ **实时更新**: 管理后台修改后，用户侧立即看到变化
✅ **易于维护**: 只需维护一个数据源（SQLite 数据库）
✅ **数据完整**: 数据库包含完整的 34 个活动，用户侧可以根据需要显示部分或全部

## API 端点

所有数据都通过以下 API 访问：
- `GET /api/admin/communities` - 获取所有社区
- `GET /api/admin/events` - 获取所有活动
- `GET /api/admin/news` - 获取所有新闻

这些端点同时服务于：
- 用户侧展示页面
- 管理后台 CRUD 操作

## 下一步建议

1. **分页功能**: 如果数据量继续增长，可以添加分页支持
2. **缓存优化**: 添加客户端缓存减少 API 调用
3. **搜索过滤**: 在用户侧添加搜索和筛选功能
4. **公共/管理分离**: 可以考虑创建专门的公共 API 端点（如 `/api/public/events`）与管理 API 分离
