# 快速参考指南

## 📚 文档导航

- **[API-DOCUMENTATION.md](API-DOCUMENTATION.md)** - 完整 API 接口文档
- **[DATA-DICTIONARY.md](DATA-DICTIONARY.md)** - 数据字典与字段说明
- **[README-ADMIN.md](README-ADMIN.md)** - 管理后台使用说明
- **[DATA-SOURCE-UNIFIED.md](DATA-SOURCE-UNIFIED.md)** - 数据源统一说明
- **[EVENTS-FIELD-MAPPING-FIX.md](EVENTS-FIELD-MAPPING-FIX.md)** - 活动字段映射修复说明

---

## 🎯 数据表速查

### Communities（社区表）- 39 条

**核心字段**: `name`, `province`, `city`

```typescript
interface Community {
  id: number;
  name: string;              // 社区名称
  province: string;          // 省份
  city: string;              // 城市
  district?: string;         // 区县
  address?: string;          // 详细地址
  policySummary?: string;    // 政策概述
  freeWorkspace?: string;    // 免费工位
  freeAccommodation?: string;// 免费住宿
  computingSupport?: string; // 算力支持
  investmentSupport?: string;// 投资支持
  registrationSupport?: string; // 注册支持
  otherServices?: string;    // 其他服务
  benefitCount: number;      // 福利项数
  contact?: string;          // 联系方式
  verificationStatus?: string; // 验证状态
  confidence?: string;       // 可信度
}
```

---

### Events（活动表）- 34 条

**核心字段**: `name`

```typescript
interface Event {
  id: number;
  name: string;              // 活动名称
  date?: string;             // 活动时间
  location?: string;         // 活动地点
  organizer?: string;        // 主办方
  registrationLink?: string; // 报名链接
  guests?: string;           // 嘉宾
  guestTitles?: string;      // 嘉宾职位
  description?: string;      // 活动介绍
}
```

---

### News（新闻表）- 12 条

**核心字段**: `title`

```typescript
interface News {
  id: number;
  title: string;             // 标题
  category?: string;         // 分类
  date?: string;             // 日期
  source?: string;           // 来源
  url?: string;              // 链接
  summary?: string;          // 摘要
  content?: string;          // 内容
  tags?: string;             // 标签
}
```

---

## 🚀 API 快速使用

### GET - 查询

```javascript
// 获取所有
fetch('/api/admin/communities')
fetch('/api/admin/events')
fetch('/api/admin/news')

// 获取单个
fetch('/api/admin/communities?id=1')
fetch('/api/admin/events?id=1')
fetch('/api/admin/news?id=1')
```

---

### POST - 创建

```javascript
// 单个创建
fetch('/api/admin/communities', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    province: '北京',
    city: '北京',
    name: '新社区'
  })
})

// 批量创建
fetch('/api/admin/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify([
    { name: '活动1', organizer: '主办方1' },
    { name: '活动2', organizer: '主办方2' }
  ])
})
```

---

### PUT - 更新

```javascript
fetch('/api/admin/communities', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 1,
    name: '更新后的名称'
  })
})
```

---

### DELETE - 删除

```javascript
// 单个删除
fetch('/api/admin/communities?id=1', { method: 'DELETE' })

// 批量删除
fetch('/api/admin/events?ids=1,2,3', { method: 'DELETE' })
```

---

## 💡 常见操作

### 1. 初始化数据库

```bash
npm run db:init
```

---

### 2. 启动开发服务器

```bash
npm run dev
```

---

### 3. 访问管理后台

```
http://localhost:3000/admin
```

---

### 4. 访问用户页面

```
http://localhost:3000           # 首页
http://localhost:3000/policy    # 政策工作台
http://localhost:3000/events    # 活动
http://localhost:3000/news      # 新闻
```

---

## 🔑 必填字段清单

| 表 | 必填字段 |
|----|---------|
| Communities | `province`, `city`, `name` |
| Events | `name` |
| News | `title` |

---

## 📂 文件结构

```
next/
├── data/
│   └── opc.db                    # SQLite 数据库
├── src/
│   ├── app/
│   │   ├── admin/               # 管理后台
│   │   │   ├── page.tsx         # 后台首页
│   │   │   ├── communities/     # 社区管理
│   │   │   ├── events/          # 活动管理
│   │   │   └── news/            # 新闻管理
│   │   └── api/admin/           # API 路由
│   │       ├── communities/
│   │       ├── events/
│   │       └── news/
│   ├── lib/
│   │   └── db.ts                # 数据库工具
│   └── sections/
│       ├── Events.tsx           # 用户侧活动页面
│       └── DailyNews.tsx        # 用户侧新闻页面
└── scripts/
    └── init-db.ts               # 数据库初始化脚本
```

---

## 🎨 UI 组件

### 管理后台功能
- ✅ 数据列表展示（表格）
- ✅ 新增（对话框表单）
- ✅ 编辑（对话框表单）
- ✅ 单个删除
- ✅ 批量删除（带确认）
- ✅ 复选框选择
- ✅ Toast 提示

### 用户侧功能
- ✅ 卡片式列表展示
- ✅ 筛选功能（新闻分类）
- ✅ 排序功能（活动按日期）
- ✅ 详情对话框

---

## 🔧 开发命令

```bash
# 安装依赖
npm install

# 初始化数据库
npm run db:init

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint
```

---

## 📊 数据统计

| 项目 | 数量 |
|------|------|
| Communities | 39 |
| Events | 34 |
| News | 12 |
| **总计** | **85** |

---

## 🛡️ 注意事项

1. **数据备份**: 数据库文件位于 `data/opc.db`，已加入 `.gitignore`
2. **权限控制**: 当前无身份验证，生产环境需添加
3. **数据源**: 用户侧和管理侧统一使用数据库 API
4. **字段映射**: 支持中英文字段名自动映射

---

## 🐛 常见问题

### Q: 页面显示空白？
A: 检查是否已运行 `npm run db:init` 初始化数据库

### Q: 数据更新不生效？
A: 刷新页面，确保前端重新请求 API

### Q: 如何重置数据？
A: 删除 `data/opc.db` 后重新运行 `npm run db:init`

### Q: 如何添加新字段？
A:
1. 修改 `src/lib/db.ts` 中的表结构
2. 更新对应的 API 路由
3. 更新前端页面组件
4. 重新初始化数据库

---

## 📞 技术支持

- **文档**: 查看 `README-ADMIN.md` 和 `API-DOCUMENTATION.md`
- **数据字典**: 查看 `DATA-DICTIONARY.md`
- **示例代码**: 参考现有的组件和 API 实现

---

**最后更新**: 2026-02-27
**版本**: 1.0
