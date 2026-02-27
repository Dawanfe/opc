# OPC 管理系统 API 文档

## 目录
- [数据表结构](#数据表结构)
  - [Communities 表](#communities-表)
  - [Events 表](#events-表)
  - [News 表](#news-表)
- [API 接口](#api-接口)
  - [Communities API](#communities-api)
  - [Events API](#events-api)
  - [News API](#news-api)

---

## 数据表结构

### Communities 表

OPC 社区信息表，存储全国各地 OPC 社区的详细信息。

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| id | INTEGER | 是 | 自增主键 | 1 |
| province | TEXT | 是 | 省份 | 上海 |
| city | TEXT | 是 | 城市 | 上海 |
| district | TEXT | 否 | 区县 | 徐汇区 |
| name | TEXT | 是 | 社区名称 | 微软加速器 (上海) |
| address | TEXT | 否 | 详细地址 | 上海闵行区/徐汇区 |
| policySummary | TEXT | 否 | 政策概述 | 上海OPC政策支持区域，提供面向早期初创企业... |
| freeWorkspace | TEXT | 否 | 免费工位情况 | 提供免费办公空间 |
| freeAccommodation | TEXT | 否 | 免费住宿情况 | 未明确提及 |
| computingSupport | TEXT | 否 | 算力支持情况 | 价值300万元人民币的微软智能云Azure资源 |
| investmentSupport | TEXT | 否 | 投资支持情况 | 优质投融资渠道 |
| registrationSupport | TEXT | 否 | 工商注册支持 | 未明确提及 |
| otherServices | TEXT | 否 | 其他配套服务 | 面向早期初创企业、含一人公司 |
| benefitCount | INTEGER | 否 | 福利项数量 | 4 |
| contact | TEXT | 否 | 联系方式 | 电话: 021-6188 8888，官网: https://... |
| verificationStatus | TEXT | 否 | 验证状态 | 已验证有效 / 部分有效 / 待验证 |
| confidence | TEXT | 否 | 信息可信度 | 高 / 中 / 低 |
| createdAt | DATETIME | 是 | 创建时间 | 2026-02-27 10:15:35 |
| updatedAt | DATETIME | 是 | 更新时间 | 2026-02-27 10:15:35 |

**字段说明**：
- **province/city/district**: 用于地理位置筛选和分类
- **benefitCount**: 根据提供的福利项目数量统计（工位、住宿、算力、投资、注册等）
- **verificationStatus**: 标记信息的验证状态，确保数据可靠性
- **confidence**: 信息来源的可信度评级

---

### Events 表

AI 和 OPC 相关活动信息表，包括会议、培训、沙龙等各类活动。

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| id | INTEGER | 是 | 自增主键 | 1 |
| location | TEXT | 否 | 活动地点 | 北京北京海淀区 |
| organizer | TEXT | 否 | 主办方 | 极客公园 |
| date | TEXT | 否 | 活动时间 | 2026年2月27日 |
| name | TEXT | 是 | 活动名称 | 极客公园大会主舞台：7款最值得关注的AI产品 |
| registrationLink | TEXT | 否 | 报名链接 | http://mp.weixin.qq.com/s?__biz=... |
| guests | TEXT | 否 | 嘉宾名单 | 张三、李四 |
| guestTitles | TEXT | 否 | 嘉宾职位/头衔 | AI产品负责人、技术专家、创业者 |
| description | TEXT | 否 | 活动介绍 | 本次大会聚焦最新AI产品... |
| createdAt | DATETIME | 是 | 创建时间 | 2026-02-27 10:15:35 |
| updatedAt | DATETIME | 是 | 更新时间 | 2026-02-27 10:15:35 |

**字段说明**：
- **location**: 可以是具体地址或"线上"、"待定"等
- **date**: 灵活的时间格式，支持"2026年2月27日"、"2026-02-27"等
- **registrationLink**: 用户可通过此链接报名参加活动
- **guests/guestTitles**: 分别存储嘉宾姓名和职位，方便展示

---

### News 表

AI 和 OPC 行业新闻资讯表，包括政策、新闻、分析等内容。

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| id | INTEGER | 是 | 自增主键 | 1 |
| title | TEXT | 是 | 新闻标题 | 重磅消息:OPC一人公司最新政策汇总（2026年2月更新） |
| category | TEXT | 否 | 分类 | 政策资讯 / 行业新闻 / 技术分析 |
| date | TEXT | 否 | 发布日期 | 2026-02-27 |
| source | TEXT | 否 | 来源平台 | 微信公众号 / 官网 / 新闻媒体 |
| url | TEXT | 否 | 原文链接 | http://mp.weixin.qq.com/s?__biz=... |
| summary | TEXT | 否 | 内容摘要 | 本文汇总了2026年2月最新的OPC政策... |
| content | TEXT | 否 | 完整内容 | 核心政策基础为2026年1月1日正式实施的... |
| tags | TEXT | 否 | 标签 | 政策,深圳,税收优惠 (逗号分隔) |
| createdAt | DATETIME | 是 | 创建时间 | 2026-02-27 10:15:35 |
| updatedAt | DATETIME | 是 | 更新时间 | 2026-02-27 10:15:35 |

**字段说明**：
- **category**: 用于前端分类筛选（全部/政策/新闻/分析）
- **content**: 存储完整的新闻内容，支持长文本
- **tags**: 使用逗号分隔的标签，便于搜索和关联

---

## API 接口

### 基础信息

- **Base URL**: `/api/admin`
- **数据格式**: JSON
- **字符编码**: UTF-8

---

### Communities API

#### 1. 获取所有社区

**请求**
```http
GET /api/admin/communities
```

**响应示例**
```json
[
  {
    "id": 1,
    "province": "上海",
    "city": "上海",
    "district": "徐汇区",
    "name": "微软加速器 (上海)",
    "address": "上海闵行区/徐汇区",
    "policySummary": "上海OPC政策支持区域...",
    "freeWorkspace": "提供免费办公空间",
    "freeAccommodation": "未明确提及",
    "computingSupport": "价值300万元人民币的微软智能云Azure资源",
    "investmentSupport": "优质投融资渠道",
    "registrationSupport": "未明确提及",
    "otherServices": "面向早期初创企业、含一人公司",
    "benefitCount": 4,
    "contact": "电话: 021-6188 8888，官网: https://...",
    "verificationStatus": "已验证有效",
    "confidence": "高",
    "createdAt": "2026-02-27 10:15:35",
    "updatedAt": "2026-02-27 10:15:35"
  }
]
```

---

#### 2. 获取单个社区

**请求**
```http
GET /api/admin/communities?id=1
```

**响应示例**
```json
{
  "id": 1,
  "province": "上海",
  "city": "上海",
  "name": "微软加速器 (上海)",
  ...
}
```

**错误响应**
```json
{
  "error": "Community not found"
}
```
状态码: 404

---

#### 3. 创建社区（单个）

**请求**
```http
POST /api/admin/communities
Content-Type: application/json
```

**请求体**
```json
{
  "province": "北京",
  "city": "北京",
  "district": "海淀区",
  "name": "测试社区",
  "address": "北京市海淀区xxx",
  "policySummary": "测试政策概述",
  "freeWorkspace": "是",
  "freeAccommodation": "否",
  "computingSupport": "提供算力支持",
  "investmentSupport": "提供投资对接",
  "registrationSupport": "协助工商注册",
  "otherServices": "其他服务说明",
  "benefitCount": 5,
  "contact": "电话: 010-12345678",
  "verificationStatus": "待验证",
  "confidence": "中"
}
```

**必填字段**: `province`, `city`, `name`

**响应示例**
```json
{
  "id": 40,
  "province": "北京",
  "city": "北京",
  "name": "测试社区",
  ...
  "createdAt": "2026-02-27 11:30:00",
  "updatedAt": "2026-02-27 11:30:00"
}
```
状态码: 201

---

#### 4. 批量创建社区

**请求**
```http
POST /api/admin/communities
Content-Type: application/json
```

**请求体**
```json
[
  {
    "province": "北京",
    "city": "北京",
    "name": "社区1"
  },
  {
    "province": "上海",
    "city": "上海",
    "name": "社区2"
  }
]
```

**响应示例**
```json
{
  "message": "Successfully created 2 communities",
  "count": 2
}
```

---

#### 5. 更新社区

**请求**
```http
PUT /api/admin/communities
Content-Type: application/json
```

**请求体**
```json
{
  "id": 1,
  "province": "上海",
  "city": "上海",
  "name": "微软加速器 (上海) - 更新",
  "address": "新地址"
  ...
}
```

**必填字段**: `id`

**响应示例**
```json
{
  "id": 1,
  "province": "上海",
  "city": "上海",
  "name": "微软加速器 (上海) - 更新",
  ...
  "updatedAt": "2026-02-27 11:40:00"
}
```

**错误响应**
```json
{
  "error": "Community not found"
}
```
状态码: 404

---

#### 6. 删除社区（单个）

**请求**
```http
DELETE /api/admin/communities?id=1
```

**响应示例**
```json
{
  "message": "Community deleted successfully"
}
```

**错误响应**
```json
{
  "error": "Community not found"
}
```
状态码: 404

---

#### 7. 批量删除社区

**请求**
```http
DELETE /api/admin/communities?ids=1,2,3
```

**响应示例**
```json
{
  "message": "Successfully deleted 3 communities",
  "count": 3
}
```

---

### Events API

#### 1. 获取所有活动

**请求**
```http
GET /api/admin/events
```

**响应示例**
```json
[
  {
    "id": 1,
    "location": "北京北京海淀区",
    "organizer": "极客公园",
    "date": "2026年2月27日",
    "name": "极客公园大会主舞台：7款最值得关注的AI产品",
    "registrationLink": "http://mp.weixin.qq.com/s?__biz=...",
    "guests": "",
    "guestTitles": "AI产品负责人、技术专家、创业者",
    "description": "",
    "createdAt": "2026-02-27 10:15:35",
    "updatedAt": "2026-02-27 10:15:35"
  }
]
```

---

#### 2. 获取单个活动

**请求**
```http
GET /api/admin/events?id=1
```

**响应示例**
```json
{
  "id": 1,
  "location": "北京北京海淀区",
  "organizer": "极客公园",
  "name": "极客公园大会主舞台：7款最值得关注的AI产品",
  ...
}
```

**错误响应**
```json
{
  "error": "Event not found"
}
```
状态码: 404

---

#### 3. 创建活动（单个）

**请求**
```http
POST /api/admin/events
Content-Type: application/json
```

**请求体**
```json
{
  "location": "上海浦东新区",
  "organizer": "AI科技协会",
  "date": "2026年3月15日",
  "name": "2026 AI开发者大会",
  "registrationLink": "https://example.com/register",
  "guests": "张三,李四,王五",
  "guestTitles": "CTO、技术总监、产品经理",
  "description": "本次大会聚焦AI应用开发最新趋势..."
}
```

**必填字段**: `name`

**响应示例**
```json
{
  "id": 35,
  "location": "上海浦东新区",
  "organizer": "AI科技协会",
  "name": "2026 AI开发者大会",
  ...
  "createdAt": "2026-02-27 11:30:00",
  "updatedAt": "2026-02-27 11:30:00"
}
```
状态码: 201

---

#### 4. 批量创建活动

**请求**
```http
POST /api/admin/events
Content-Type: application/json
```

**请求体**
```json
[
  {
    "name": "活动1",
    "organizer": "主办方1",
    "date": "2026-03-01"
  },
  {
    "name": "活动2",
    "organizer": "主办方2",
    "date": "2026-03-02"
  }
]
```

**响应示例**
```json
{
  "message": "Successfully created 2 events",
  "count": 2
}
```

---

#### 5. 更新活动

**请求**
```http
PUT /api/admin/events
Content-Type: application/json
```

**请求体**
```json
{
  "id": 1,
  "name": "极客公园大会 - 更新版",
  "location": "北京海淀区新地址",
  "date": "2026年2月28日"
  ...
}
```

**必填字段**: `id`

**响应示例**
```json
{
  "id": 1,
  "name": "极客公园大会 - 更新版",
  ...
  "updatedAt": "2026-02-27 11:40:00"
}
```

---

#### 6. 删除活动（单个）

**请求**
```http
DELETE /api/admin/events?id=1
```

**响应示例**
```json
{
  "message": "Event deleted successfully"
}
```

---

#### 7. 批量删除活动

**请求**
```http
DELETE /api/admin/events?ids=1,2,3
```

**响应示例**
```json
{
  "message": "Successfully deleted 3 events",
  "count": 3
}
```

---

### News API

#### 1. 获取所有新闻

**请求**
```http
GET /api/admin/news
```

**响应示例**
```json
[
  {
    "id": 1,
    "title": "重磅消息:OPC一人公司最新政策汇总（2026年2月更新）",
    "category": "政策资讯",
    "date": "",
    "source": "微信公众号",
    "url": "http://mp.weixin.qq.com/s?__biz=...",
    "summary": "",
    "content": "核心政策基础为2026年1月1日正式实施的新修订《公司法》...",
    "tags": "",
    "createdAt": "2026-02-27 10:15:35",
    "updatedAt": "2026-02-27 10:15:35"
  }
]
```

---

#### 2. 获取单个新闻

**请求**
```http
GET /api/admin/news?id=1
```

**响应示例**
```json
{
  "id": 1,
  "title": "重磅消息:OPC一人公司最新政策汇总（2026年2月更新）",
  "content": "核心政策基础为...",
  ...
}
```

**错误响应**
```json
{
  "error": "News not found"
}
```
状态码: 404

---

#### 3. 创建新闻（单个）

**请求**
```http
POST /api/admin/news
Content-Type: application/json
```

**请求体**
```json
{
  "title": "AI行业最新动态报道",
  "category": "行业新闻",
  "date": "2026-02-27",
  "source": "科技媒体",
  "url": "https://example.com/news/123",
  "summary": "本文报道了AI行业最新发展动态...",
  "content": "随着AI技术的快速发展，各大企业纷纷布局...",
  "tags": "AI,科技,创新"
}
```

**必填字段**: `title`

**响应示例**
```json
{
  "id": 13,
  "title": "AI行业最新动态报道",
  "category": "行业新闻",
  ...
  "createdAt": "2026-02-27 11:30:00",
  "updatedAt": "2026-02-27 11:30:00"
}
```
状态码: 201

---

#### 4. 批量创建新闻

**请求**
```http
POST /api/admin/news
Content-Type: application/json
```

**请求体**
```json
[
  {
    "title": "新闻1",
    "category": "政策",
    "content": "内容1"
  },
  {
    "title": "新闻2",
    "category": "分析",
    "content": "内容2"
  }
]
```

**响应示例**
```json
{
  "message": "Successfully created 2 news items",
  "count": 2
}
```

---

#### 5. 更新新闻

**请求**
```http
PUT /api/admin/news
Content-Type: application/json
```

**请求体**
```json
{
  "id": 1,
  "title": "OPC一人公司最新政策汇总 - 更新版",
  "content": "更新后的内容..."
  ...
}
```

**必填字段**: `id`

**响应示例**
```json
{
  "id": 1,
  "title": "OPC一人公司最新政策汇总 - 更新版",
  ...
  "updatedAt": "2026-02-27 11:40:00"
}
```

---

#### 6. 删除新闻（单个）

**请求**
```http
DELETE /api/admin/news?id=1
```

**响应示例**
```json
{
  "message": "News deleted successfully"
}
```

---

#### 7. 批量删除新闻

**请求**
```http
DELETE /api/admin/news?ids=1,2,3
```

**响应示例**
```json
{
  "message": "Successfully deleted 3 news items",
  "count": 3
}
```

---

## 错误码说明

| 状态码 | 说明 | 示例 |
|--------|------|------|
| 200 | 请求成功 | GET、PUT、DELETE 成功 |
| 201 | 创建成功 | POST 创建资源成功 |
| 400 | 请求参数错误 | 缺少必填字段 |
| 404 | 资源不存在 | 查询或操作的记录不存在 |
| 500 | 服务器错误 | 数据库或服务器内部错误 |

**错误响应格式**
```json
{
  "error": "错误描述信息"
}
```

---

## 使用示例

### JavaScript/TypeScript

```typescript
// 获取所有社区
const communities = await fetch('/api/admin/communities')
  .then(res => res.json());

// 创建新社区
const newCommunity = await fetch('/api/admin/communities', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    province: '北京',
    city: '北京',
    name: '新社区'
  })
}).then(res => res.json());

// 更新社区
const updated = await fetch('/api/admin/communities', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 1,
    name: '更新后的名称'
  })
}).then(res => res.json());

// 删除社区
await fetch('/api/admin/communities?id=1', {
  method: 'DELETE'
});

// 批量删除
await fetch('/api/admin/communities?ids=1,2,3', {
  method: 'DELETE'
});
```

### cURL

```bash
# 获取所有活动
curl http://localhost:3000/api/admin/events

# 创建新活动
curl -X POST http://localhost:3000/api/admin/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试活动",
    "organizer": "测试主办方",
    "date": "2026-03-01"
  }'

# 更新活动
curl -X PUT http://localhost:3000/api/admin/events \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "name": "更新后的活动名称"
  }'

# 删除活动
curl -X DELETE http://localhost:3000/api/admin/events?id=1
```

---

## 注意事项

1. **数据验证**: 前端应进行必填字段验证
2. **时间格式**: 支持灵活的时间格式，建议使用 ISO 8601 格式
3. **批量操作**: 批量创建/删除使用事务确保数据一致性
4. **错误处理**: 所有 API 调用都应处理错误响应
5. **权限控制**: 当前未实现身份验证，生产环境需添加认证机制

---

## 版本信息

- **文档版本**: 1.0
- **API 版本**: 1.0
- **最后更新**: 2026-02-27
