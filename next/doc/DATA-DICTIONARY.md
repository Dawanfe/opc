# 数据字典

本文档详细说明 OPC 管理系统中所有数据表的字段定义。

---

## 📊 Communities（社区表）

全国 OPC 社区信息汇总表。

### 基本信息

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | INTEGER | 是 | 自增 | 主键ID |
| name | TEXT | 是 | - | 社区名称 |
| province | TEXT | 是 | - | 所在省份 |
| city | TEXT | 是 | - | 所在城市 |
| district | TEXT | 否 | - | 所在区县 |
| address | TEXT | 否 | - | 详细地址 |

### 政策与服务

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| policySummary | TEXT | 否 | - | 政策概述 |
| freeWorkspace | TEXT | 否 | - | 免费工位说明（是/否/具体说明） |
| freeAccommodation | TEXT | 否 | - | 免费住宿说明（是/否/具体说明） |
| computingSupport | TEXT | 否 | - | 算力支持说明 |
| investmentSupport | TEXT | 否 | - | 投资支持说明 |
| registrationSupport | TEXT | 否 | - | 工商注册支持说明 |
| otherServices | TEXT | 否 | - | 其他配套服务 |
| benefitCount | INTEGER | 否 | 0 | 福利项数量统计 |

### 联系与验证

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| contact | TEXT | 否 | - | 联系方式（电话、邮箱、网址等） |
| verificationStatus | TEXT | 否 | - | 验证状态（已验证有效/部分有效/待验证） |
| confidence | TEXT | 否 | - | 信息可信度（高/中/低） |

### 系统字段

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| createdAt | DATETIME | 是 | CURRENT_TIMESTAMP | 创建时间 |
| updatedAt | DATETIME | 是 | CURRENT_TIMESTAMP | 更新时间 |

### 数据示例

```json
{
  "id": 1,
  "name": "微软加速器 (上海)",
  "province": "上海",
  "city": "上海",
  "district": "徐汇区",
  "address": "上海闵行区/徐汇区",
  "policySummary": "上海OPC政策支持区域，提供面向早期初创企业、含一人公司...",
  "freeWorkspace": "提供免费办公空间",
  "freeAccommodation": "未明确提及",
  "computingSupport": "价值300万元人民币的微软智能云Azure资源",
  "investmentSupport": "优质投融资渠道",
  "registrationSupport": "未明确提及",
  "otherServices": "面向早期初创企业、含一人公司",
  "benefitCount": 4,
  "contact": "电话: 021-6188 8888，官网: https://startups.microsoft.com/",
  "verificationStatus": "已验证有效",
  "confidence": "高"
}
```

**总记录数**: 39 条

---

## 📅 Events（活动表）

AI 和 OPC 相关活动信息表。

### 基本信息

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | INTEGER | 是 | 自增 | 主键ID |
| name | TEXT | 是 | - | 活动名称 |
| date | TEXT | 否 | - | 活动时间（灵活格式） |
| location | TEXT | 否 | - | 活动地点 |
| organizer | TEXT | 否 | - | 主办方 |

### 报名与嘉宾

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| registrationLink | TEXT | 否 | - | 报名链接 |
| guests | TEXT | 否 | - | 嘉宾名单 |
| guestTitles | TEXT | 否 | - | 嘉宾职位/头衔 |

### 详细描述

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| description | TEXT | 否 | - | 活动介绍 |

### 系统字段

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| createdAt | DATETIME | 是 | CURRENT_TIMESTAMP | 创建时间 |
| updatedAt | DATETIME | 是 | CURRENT_TIMESTAMP | 更新时间 |

### 数据示例

```json
{
  "id": 1,
  "name": "极客公园大会主舞台：7款最值得关注的AI产品",
  "date": "2026年2月27日",
  "location": "北京北京海淀区",
  "organizer": "极客公园",
  "registrationLink": "http://mp.weixin.qq.com/s?__biz=...",
  "guests": "",
  "guestTitles": "AI产品负责人、技术专家、创业者",
  "description": ""
}
```

**总记录数**: 34 条

---

## 📰 News（新闻表）

AI 和 OPC 行业新闻资讯表。

### 基本信息

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | INTEGER | 是 | 自增 | 主键ID |
| title | TEXT | 是 | - | 新闻标题 |
| category | TEXT | 否 | 政策资讯 | 分类（政策/新闻/分析） |
| date | TEXT | 否 | - | 发布日期 |

### 来源信息

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| source | TEXT | 否 | 微信公众号 | 来源平台 |
| url | TEXT | 否 | - | 原文链接 |

### 内容

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| summary | TEXT | 否 | - | 内容摘要 |
| content | TEXT | 否 | - | 完整内容（支持长文本） |
| tags | TEXT | 否 | - | 标签（逗号分隔） |

### 系统字段

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| createdAt | DATETIME | 是 | CURRENT_TIMESTAMP | 创建时间 |
| updatedAt | DATETIME | 是 | CURRENT_TIMESTAMP | 更新时间 |

### 数据示例

```json
{
  "id": 1,
  "title": "重磅消息:OPC一人公司最新政策汇总（2026年2月更新）",
  "category": "政策资讯",
  "date": "",
  "source": "微信公众号",
  "url": "http://mp.weixin.qq.com/s?__biz=...",
  "summary": "",
  "content": "核心政策基础为2026年1月1日正式实施的新修订《公司法》...",
  "tags": ""
}
```

**总记录数**: 12 条

---

## 📋 字段类型说明

### TEXT
- 可变长度文本
- 用于存储字符串、描述、内容等
- 无长度限制
- 支持空值（除非标记为必填）

### INTEGER
- 整数类型
- 用于 ID、计数等
- 主键自动递增

### DATETIME
- 日期时间类型
- 格式: `YYYY-MM-DD HH:MM:SS`
- 默认使用 `CURRENT_TIMESTAMP`

---

## 🔍 索引建议

为提高查询性能，建议在以下字段建立索引：

### Communities 表
- `province, city` (组合索引) - 用于地理位置筛选
- `verificationStatus` - 用于按验证状态筛选

### Events 表
- `date` - 用于按时间排序和筛选
- `organizer` - 用于按主办方筛选

### News 表
- `category` - 用于分类筛选
- `date` - 用于按时间排序

---

## 📝 字段命名规范

- 使用小驼峰命名法 (camelCase)
- 布尔类型字段不使用 `is` 前缀，直接用描述性名词
- 外键字段使用 `表名Id` 格式
- 时间字段统一使用 `xxxAt` 后缀

---

## 🔄 数据迁移说明

### 源数据字段映射

#### opcData.json → Communities
| 源字段 (中文) | 目标字段 (英文) |
|--------------|----------------|
| 省份 | province |
| 城市 | city |
| 区县 | district |
| 社区名称 | name |
| 社区地址 | address |
| 政策概述 | policySummary |

#### opcData.json → Events
| 源字段 (中文) | 目标字段 (英文) |
|--------------|----------------|
| 省市区 | location |
| 组织机构 | organizer |
| 活动时间 | date |
| 活动名称 | name |
| 报名链接 | registrationLink |
| 活动嘉宾 | guests |
| 嘉宾身份介绍 | guestTitles |
| 活动介绍 | description |

#### opcData.json → News
| 源字段 (中文) | 目标字段 (英文) |
|--------------|----------------|
| 标题 | title |
| 分类 | category |
| 日期 | date |
| 媒体平台 | source |
| 链接 | url |
| 摘要 | summary |
| 内容 | content |
| 标签 | tags |

---

## 📊 数据统计

| 表名 | 记录数 | 平均字段填充率 | 最后更新 |
|------|--------|---------------|---------|
| Communities | 39 | ~85% | 2026-02-27 |
| Events | 34 | ~70% | 2026-02-27 |
| News | 12 | ~90% | 2026-02-27 |

**总计**: 85 条记录

---

## 🛠️ 维护建议

1. **定期备份**: 建议每天备份数据库文件
2. **数据清理**: 定期清理过期活动和陈旧新闻
3. **验证更新**: 定期更新社区的 `verificationStatus` 状态
4. **索引优化**: 根据查询日志优化索引
5. **数据质量**: 鼓励填写更多可选字段以提高数据完整性
