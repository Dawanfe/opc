# OPC管理后台使用说明

## 功能概述

已创建完整的管理后台系统，位于 `/admin` 路径下，包含以下功能模块：

### 1. OPC社区管理 (`/admin/communities`)
- 查看所有社区列表
- 新增社区（单条）
- 编辑社区信息
- 删除社区（单条或批量）
- 支持字段：省份、城市、区县、名称、地址、政策摘要、免费工位、免费住宿、算力支持、投资支持、注册支持、其他服务、福利数量、联系方式、验证状态、可信度

### 2. 活动管理 (`/admin/events`)
- 查看所有活动列表
- 新增活动（单条）
- 编辑活动信息
- 删除活动（单条或批量）
- 支持字段：活动名称、日期、地点、主办方、报名链接、嘉宾、嘉宾头衔、活动描述

### 3. 新闻管理 (`/admin/news`)
- 查看所有新闻列表
- 新增新闻（单条）
- 编辑新闻信息
- 删除新闻（单条或批量）
- 支持字段：标题、分类、日期、来源、链接、摘要、内容、标签

## 技术栈

- **数据库**: SQLite (better-sqlite3)
- **API**: Next.js App Router API Routes
- **前端**: React + TypeScript + Tailwind CSS + shadcn/ui
- **通知**: sonner (toast notifications)

## 数据库结构

数据库文件位置: `next/data/opc.db`

### 表结构

#### communities 表
- id (自增主键)
- province, city, district, name, address
- policySummary, freeWorkspace, freeAccommodation
- computingSupport, investmentSupport, registrationSupport
- otherServices, benefitCount, contact
- verificationStatus, confidence
- createdAt, updatedAt (自动时间戳)

#### events 表
- id (自增主键)
- location, organizer, date, name
- registrationLink, guests, guestTitles, description
- createdAt, updatedAt (自动时间戳)

#### news 表
- id (自增主键)
- title, category, date, source, url
- summary, content, tags
- createdAt, updatedAt (自动时间戳)

## API 端点

### Communities API (`/api/admin/communities`)
- **GET**: 获取所有社区或单个社区 (参数: ?id=1)
- **POST**: 创建新社区（支持单条或批量，传入数组）
- **PUT**: 更新社区信息
- **DELETE**: 删除社区（单条 ?id=1 或批量 ?ids=1,2,3）

### Events API (`/api/admin/events`)
- **GET**: 获取所有活动或单个活动 (参数: ?id=1)
- **POST**: 创建新活动（支持单条或批量，传入数组）
- **PUT**: 更新活动信息
- **DELETE**: 删除活动（单条 ?id=1 或批量 ?ids=1,2,3）

### News API (`/api/admin/news`)
- **GET**: 获取所有新闻或单个新闻 (参数: ?id=1)
- **POST**: 创建新新闻（支持单条或批量，传入数组）
- **PUT**: 更新新闻信息
- **DELETE**: 删除新闻（单条 ?id=1 或批量 ?ids=1,2,3）

## 使用步骤

### 1. 初始化数据库（首次使用）

```bash
cd next
npm run db:init
```

这将：
- 创建 SQLite 数据库
- 创建所有表结构
- 从 JSON 文件迁移现有数据到数据库

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 访问管理后台

打开浏览器访问: `http://localhost:3000/admin`

### 4. 管理数据

#### 单条操作
- 点击"新增"按钮创建新记录
- 点击"编辑"图标编辑现有记录
- 点击"删除"图标删除单条记录

#### 批量操作
- 勾选表格左侧的复选框选择多条记录
- 点击"批量删除"按钮删除选中的所有记录

## API 使用示例

### 创建单个社区
```javascript
fetch('/api/admin/communities', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: '新社区',
    province: '北京',
    city: '北京',
    // ... 其他字段
  })
});
```

### 批量创建社区
```javascript
fetch('/api/admin/communities', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify([
    { name: '社区1', province: '北京', city: '北京' },
    { name: '社区2', province: '上海', city: '上海' },
    // ... 更多记录
  ])
});
```

### 批量删除
```javascript
fetch('/api/admin/communities?ids=1,2,3', {
  method: 'DELETE'
});
```

## 注意事项

1. **数据持久化**: 数据存储在 `next/data/opc.db` 文件中，该文件已加入 `.gitignore`
2. **备份建议**: 定期备份 `data/opc.db` 文件
3. **权限控制**: 当前未实现身份验证，建议在生产环境中添加认证机制
4. **事务处理**: 批量操作使用了 SQLite 事务保证数据一致性

## 文件结构

```
next/
├── data/
│   └── opc.db                          # SQLite 数据库文件
├── scripts/
│   └── init-db.ts                      # 数据库初始化脚本
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── page.tsx               # 管理后台首页
│   │   │   ├── communities/
│   │   │   │   └── page.tsx          # 社区管理页面
│   │   │   ├── events/
│   │   │   │   └── page.tsx          # 活动管理页面
│   │   │   └── news/
│   │   │       └── page.tsx          # 新闻管理页面
│   │   └── api/
│   │       └── admin/
│   │           ├── communities/
│   │           │   └── route.ts       # 社区 API
│   │           ├── events/
│   │           │   └── route.ts       # 活动 API
│   │           └── news/
│   │               └── route.ts       # 新闻 API
│   └── lib/
│       └── db.ts                       # 数据库工具函数
└── package.json
```

## 已完成的功能

✅ SQLite 数据库集成
✅ 数据库表结构设计
✅ 数据迁移脚本（从 JSON 到 SQLite）
✅ RESTful API 实现（增删改查）
✅ 批量操作支持
✅ 管理后台 UI（三个模块）
✅ 表单验证
✅ 提示消息（成功/失败）
✅ 确认对话框（删除操作）

## 数据库状态

运行 `npm run db:init` 后，数据库已成功导入：
- **Communities**: 39 条记录 ✅
- **Events**: 34 条记录 ✅
- **News**: 12 条记录 ✅

## 后续扩展建议

- 添加用户认证和权限控制
- 实现搜索和筛选功能
- 添加分页功能
- 导入/导出 Excel 功能
- 数据备份和恢复功能
- 操作日志记录
