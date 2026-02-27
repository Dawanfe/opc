# 活动字段映射修复说明

## 问题描述

用户反馈活动页面没有内容展示。经排查发现数据迁移脚本存在字段映射错误。

## 问题根源

`opcData.json` 中的活动数据使用**中文字段名**：

```json
{
  "省市区": "北京北京海淀区",
  "组织机构": "极客公园",
  "活动时间": "2026年2月27日",
  "活动名称": "极客公园大会主舞台：7款最值得关注的AI产品",
  "报名链接": "http://...",
  "活动嘉宾": "待定",
  "嘉宾身份介绍": "AI产品负责人、技术专家、创业者",
  "活动介绍": "待定"
}
```

但迁移脚本尝试访问**英文字段名**（如 `event.location`, `event.organizer` 等），导致所有字段值都为空字符串。

## 字段映射关系

| 中文字段名 | 英文字段名 (数据库) | 说明 |
|-----------|-------------------|------|
| 省市区 | location | 活动地点 |
| 组织机构 | organizer | 主办方 |
| 活动时间 | date | 活动日期 |
| 活动名称 | name | 活动标题 |
| 报名链接 | registrationLink | 报名网址 |
| 活动嘉宾 | guests | 嘉宾列表 |
| 嘉宾身份介绍 | guestTitles | 嘉宾职位 |
| 活动介绍 | description | 活动详情 |

## 修复方案

更新了 [lib/db.ts](../src/lib/db.ts:145-170) 中的迁移逻辑，支持从中文字段名读取数据：

```typescript
insertEvent.run(
  event['省市区'] || event.location || '',
  event['组织机构'] || event.organizer || '',
  event['活动时间'] || event.date || '',
  event['活动名称'] || event.name || '',
  event['报名链接'] || event.registrationLink || '',
  event['活动嘉宾'] || event.guests || '',
  event['嘉宾身份介绍'] || event.guestTitles || '',
  event['活动介绍'] || event.description || ''
);
```

这样既支持 `opcData.json` 的中文字段，也兼容 `public/events.json` 的英文字段。

## 验证结果

重新运行 `npm run db:init` 后：

```
✅ Migrated 34 events
```

数据库中的数据示例：
- **Name**: 极客公园大会主舞台：7款最值得关注的AI产品
- **Organizer**: 极客公园
- **Date**: 2026年2月27日
- **Location**: 北京北京海淀区

## 影响范围

- ✅ 数据库迁移：已修复
- ✅ 管理后台：能正常显示和编辑活动
- ✅ 用户侧活动页面：能正常显示活动列表

所有 34 个活动现在都能正确显示在用户侧和管理后台了！
