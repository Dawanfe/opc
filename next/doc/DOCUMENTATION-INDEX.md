# OPC 管理系统完整文档索引

## 📚 文档列表

### 核心文档

1. **[QUICK-REFERENCE.md](QUICK-REFERENCE.md)** ⭐
   - 快速参考指南
   - 常用操作速查
   - 代码示例
   - **推荐首次阅读**

2. **[API-DOCUMENTATION.md](API-DOCUMENTATION.md)** 📡
   - 完整的 RESTful API 文档
   - 请求/响应示例
   - 错误码说明
   - cURL 和 JavaScript 示例

3. **[DATA-DICTIONARY.md](DATA-DICTIONARY.md)** 📊
   - 数据表结构详解
   - 字段类型和含义
   - 数据示例
   - 索引建议

### 使用指南

4. **[README-ADMIN.md](README-ADMIN.md)** 🎛️
   - 管理后台使用说明
   - 功能介绍
   - 安装步骤
   - 文件结构

5. **[DATA-SOURCE-UNIFIED.md](DATA-SOURCE-UNIFIED.md)** 🔄
   - 数据源统一方案
   - 用户侧与管理侧数据同步
   - 优势说明

### 技术说明

6. **[EVENTS-FIELD-MAPPING-FIX.md](EVENTS-FIELD-MAPPING-FIX.md)** 🔧
   - 活动字段映射修复记录
   - 中英文字段对照
   - 问题排查过程

---

## 🚀 快速开始

### 1. 安装依赖

```bash
cd next
npm install
```

### 2. 初始化数据库

```bash
npm run db:init
```

输出：
```
✅ Migrated 39 communities
✅ Migrated 34 events
✅ Migrated 12 news items
```

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 访问应用

- **用户前台**: http://localhost:3000
- **管理后台**: http://localhost:3000/admin

---

## 📊 系统概览

### 数据统计

| 模块 | 数量 | 管理页面 | API 端点 |
|------|------|----------|----------|
| OPC 社区 | 39 条 | `/admin/communities` | `/api/admin/communities` |
| AI 活动 | 34 条 | `/admin/events` | `/api/admin/events` |
| 行业新闻 | 12 条 | `/admin/news` | `/api/admin/news` |

### 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **数据库**: SQLite (better-sqlite3)
- **UI**: React + Tailwind CSS + shadcn/ui
- **状态**: Client-side State
- **通知**: sonner

---

## 🎯 核心功能

### 管理后台

✅ **社区管理** (`/admin/communities`)
- 查看 39 个 OPC 社区
- 新增/编辑/删除社区
- 批量操作
- 详细字段：省份、城市、政策、工位、算力、投资等

✅ **活动管理** (`/admin/events`)
- 查看 34 个 AI 活动
- 新增/编辑/删除活动
- 批量操作
- 详细字段：名称、时间、地点、主办方、嘉宾等

✅ **新闻管理** (`/admin/news`)
- 查看 12 条行业新闻
- 新增/编辑/删除新闻
- 批量操作
- 详细字段：标题、分类、来源、内容等

### 用户前台

✅ **首页** (`/`)
- 社区概览
- 最新活动
- 政策动态

✅ **活动页面** (`/events`)
- 显示最新 12 个活动
- 卡片式布局
- 按日期排序
- 一键报名

✅ **新闻页面** (`/news`)
- 显示所有新闻
- 分类筛选（全部/政策/新闻/分析）
- 详情对话框
- 原文链接

✅ **政策工作台** (`/policy`)
- 地图展示
- 社区筛选
- 详细信息

---

## 📖 文档阅读指南

### 🆕 新用户

1. 先读 **[QUICK-REFERENCE.md](QUICK-REFERENCE.md)** - 了解基本概念
2. 再读 **[README-ADMIN.md](README-ADMIN.md)** - 学习如何使用管理后台

### 👨‍💻 开发者

1. 阅读 **[DATA-DICTIONARY.md](DATA-DICTIONARY.md)** - 理解数据结构
2. 阅读 **[API-DOCUMENTATION.md](API-DOCUMENTATION.md)** - 学习 API 接口
3. 参考现有代码实现新功能

### 🔧 运维人员

1. 阅读 **[README-ADMIN.md](README-ADMIN.md)** - 了解系统架构
2. 定期备份 `data/opc.db` 文件
3. 关注 `verificationStatus` 字段的更新

---

## 🔑 API 速查

### 基础 URL
```
/api/admin/{resource}
```

### 支持的资源
- `communities` - 社区
- `events` - 活动
- `news` - 新闻

### 通用操作

| 操作 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取列表 | GET | `/api/admin/{resource}` | 获取所有记录 |
| 获取单个 | GET | `/api/admin/{resource}?id=1` | 获取指定记录 |
| 创建单个 | POST | `/api/admin/{resource}` | Body: `{...}` |
| 批量创建 | POST | `/api/admin/{resource}` | Body: `[{...}, {...}]` |
| 更新 | PUT | `/api/admin/{resource}` | Body: `{id, ...}` |
| 删除单个 | DELETE | `/api/admin/{resource}?id=1` | 删除指定记录 |
| 批量删除 | DELETE | `/api/admin/{resource}?ids=1,2,3` | 删除多条记录 |

---

## 📂 项目结构

```
next/
├── data/
│   └── opc.db                          # SQLite 数据库（已忽略）
│
├── scripts/
│   └── init-db.ts                      # 数据库初始化脚本
│
├── src/
│   ├── app/
│   │   ├── admin/                      # 管理后台
│   │   │   ├── page.tsx               # 后台首页
│   │   │   ├── communities/page.tsx   # 社区管理
│   │   │   ├── events/page.tsx        # 活动管理
│   │   │   └── news/page.tsx          # 新闻管理
│   │   │
│   │   ├── api/admin/                  # API 路由
│   │   │   ├── communities/route.ts   # 社区 API
│   │   │   ├── events/route.ts        # 活动 API
│   │   │   └── news/route.ts          # 新闻 API
│   │   │
│   │   ├── events/page.tsx            # 用户侧：活动页面
│   │   ├── news/page.tsx              # 用户侧：新闻页面
│   │   └── policy/page.tsx            # 用户侧：政策页面
│   │
│   ├── lib/
│   │   └── db.ts                      # 数据库工具函数
│   │
│   ├── sections/                       # 页面组件
│   │   ├── Events.tsx                 # 活动列表组件
│   │   └── DailyNews.tsx              # 新闻列表组件
│   │
│   └── data/
│       └── opcData.json               # 原始数据（用于迁移）
│
├── public/
│   ├── communities.json               # 社区静态数据（备份）
│   └── events.json                    # 活动静态数据（备份）
│
├── API-DOCUMENTATION.md               # API 文档
├── DATA-DICTIONARY.md                 # 数据字典
├── QUICK-REFERENCE.md                 # 快速参考
├── README-ADMIN.md                    # 管理后台说明
├── DATA-SOURCE-UNIFIED.md             # 数据源统一说明
├── EVENTS-FIELD-MAPPING-FIX.md        # 字段映射修复说明
└── package.json
```

---

## 🛠️ 可用命令

```bash
# 开发
npm run dev              # 启动开发服务器
npm run build            # 构建生产版本
npm start               # 启动生产服务器
npm run lint            # 代码检查

# 数据库
npm run db:init         # 初始化数据库并迁移数据
```

---

## 🔐 安全注意事项

⚠️ **当前未实现身份验证**

管理后台 API 端点 (`/api/admin/*`) 目前对所有人开放。

**生产环境部署前必须添加**:
1. 用户认证（JWT/Session）
2. 权限控制（RBAC）
3. API 速率限制
4. CSRF 保护

---

## 📈 后续扩展建议

### 优先级 P0
- [ ] 添加用户认证和权限控制
- [ ] 实现分页功能（当数据量增长时）

### 优先级 P1
- [ ] 添加搜索和高级筛选
- [ ] 导入/导出 Excel 功能
- [ ] 操作日志记录

### 优先级 P2
- [ ] 数据可视化（统计图表）
- [ ] 多语言支持
- [ ] 移动端优化

---

## 🤝 贡献指南

1. 遵循现有代码风格
2. 更新相关文档
3. 添加必要的注释
4. 测试所有修改

---

## 📞 技术支持

### 问题排查

1. **数据显示为空**
   - 确认已运行 `npm run db:init`
   - 检查 `data/opc.db` 文件是否存在

2. **API 返回 500 错误**
   - 检查数据库文件权限
   - 查看控制台错误日志

3. **前端页面报错**
   - 清除浏览器缓存
   - 重启开发服务器

### 联系方式

查看项目 README 或提交 Issue。

---

## 📝 更新日志

### v1.0 (2026-02-27)
- ✅ 完整的管理后台系统
- ✅ SQLite 数据库集成
- ✅ RESTful API 实现
- ✅ 用户侧页面数据库集成
- ✅ 批量操作支持
- ✅ 完整文档体系

---

**维护者**: OPC 项目团队
**最后更新**: 2026-02-27
**版本**: 1.0
