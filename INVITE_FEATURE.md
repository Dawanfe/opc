# 邀请码功能 - 使用说明

## ✅ 已完成的功能

### 1. 数据库设计
- **users 表新增字段**
  - `inviteCode`: 用户专属邀请码（8位字母数字混合，唯一索引）
  - `invitedBy`: 邀请人ID（外键关联到 users.id）

- **invite_records 表**（邀请记录表）
  - `id`: 主键
  - `inviterId`: 邀请人ID
  - `inviteeId`: 被邀请人ID
  - `inviteCode`: 使用的邀请码
  - `status`: 状态（activated）
  - `createdAt`: 创建时间
  - `activatedAt`: 激活时间
  - 已创建索引优化查询性能

### 2. 后端 API

#### 注册 API（已升级）
- **路径**: `/api/auth/register`
- **方法**: POST
- **参数**:
  ```json
  {
    "phone": "13800138000",
    "password": "password123",
    "nickname": "昵称（可选）",
    "inviteCode": "ABC12345（可选）"
  }
  ```
- **功能**:
  - 自动为新用户生成唯一邀请码
  - 验证邀请码有效性
  - 建立邀请关系并记录到 invite_records 表

#### 用户邀请信息 API
- **路径**: `/api/user/invite-info`
- **方法**: GET
- **认证**: 需要 Bearer Token
- **返回数据**:
  ```json
  {
    "user": {
      "id": 1,
      "nickname": "张三",
      "phone": "138****8000",
      "inviteCode": "ABC12345"
    },
    "inviter": {
      "id": 2,
      "nickname": "李四",
      "phone": "139****9000"
    },
    "stats": {
      "totalInvites": 5,
      "activatedInvites": 5
    },
    "inviteList": [...]
  }
  ```

#### 管理后台邀请统计 API
- **路径**: `/api/admin/invite-stats`
- **方法**: GET
- **查询参数**:
  - `page`: 页码（默认1）
  - `pageSize`: 每页数量（默认20）
  - `sortBy`: 排序方式（inviteCount 或 createdAt）
  - `startDate`: 开始日期（YYYY-MM-DD）
  - `endDate`: 结束日期（YYYY-MM-DD）
- **返回数据**:
  - `overallStats`: 全站统计数据
  - `dailyStats`: 每日统计（最近30天）
  - `topInviters`: 邀请人排行榜 TOP 10
  - `inviterList`: 邀请人列表（分页）

### 3. 前端页面

#### 用户端 - 我的邀请页面
- **路径**: `/invite`
- **功能**:
  - 显示我的邀请码
  - 复制邀请码/邀请链接
  - 查看邀请统计数据
  - 查看邀请记录列表（最近20条）
  - 显示邀请人信息（如果有）
  - 使用说明

#### 管理后台 - 邀请统计页面
- **路径**: `/admin/invite-stats`
- **功能**:
  - 全站统计数据卡片（总邀请人数、总被邀请人数、邀请记录总数、激活率）
  - 邀请人排行榜 TOP 10
  - 每日统计表格（最近30天）
  - 邀请人列表（支持排序、日期筛选、分页）

#### 注册弹窗（已升级）
- **功能**:
  - 新增"邀请码"输入框（可选）
  - 自动转换为大写
  - 限制8位字符
  - 支持回车提交

### 4. 工具函数
- **文件**: `src/lib/utils/invite.ts`
- **函数**:
  - `generateInviteCode()`: 生成8位随机邀请码（排除易混淆字符）
  - `generateUniqueInviteCode()`: 生成唯一邀请码（检查数据库）
  - `validateInviteCodeFormat()`: 校验邀请码格式
  - `checkInviteCodeExists()`: 检查邀请码是否存在
  - `generateInviteCodeForExistingUsers()`: 为现有用户生成邀请码（数据迁移）

---

## 🚀 使用流程

### 用户注册流程
1. 新用户点击"注册账号"
2. 填写手机号、昵称、密码
3. **可选**：填写好友的邀请码（8位）
4. 提交注册
5. 系统验证邀请码有效性
6. 注册成功后：
   - 自动生成该用户的专属邀请码
   - 如果填写了邀请码，建立邀请关系
   - 自动登录

### 用户邀请好友流程
1. 用户登录后访问 `/invite` 页面
2. 查看自己的邀请码
3. 点击"复制邀请码"或"复制邀请链接"
4. 分享给好友
5. 好友注册时填写邀请码
6. 在"我的邀请"页面查看邀请记录

### 管理员查看统计流程
1. 管理员登录后台
2. 访问 `/admin/invite-stats` 页面
3. 查看全站邀请数据统计
4. 查看排行榜和每日趋势
5. 使用筛选条件查询特定数据
6. 导出数据（未实现）

---

## 📝 技术细节

### 邀请码生成规则
- **长度**: 8位
- **字符集**: 大小写字母 + 数字
- **排除字符**: 0, O, o, I, l, 1（易混淆字符）
- **唯一性**: 数据库唯一索引 + 生成时检查

### 数据库索引
```sql
-- invite_records 表索引
CREATE INDEX idx_invite_records_inviterId ON invite_records(inviterId);
CREATE INDEX idx_invite_records_inviteeId ON invite_records(inviteeId);
CREATE INDEX idx_invite_records_status ON invite_records(status);

-- users 表约束
CREATE UNIQUE INDEX idx_users_inviteCode ON users(inviteCode);
```

### 邀请链接格式
```
https://yourdomain.com/register?invite=ABC12345
```
未来可以在注册页面自动识别 URL 参数中的邀请码

---

## 🔧 数据迁移

### 为现有用户生成邀请码
如果数据库中已有用户但没有邀请码，可以运行：

```typescript
import { generateInviteCodeForExistingUsers } from '@/lib/utils/invite';

// 在服务端执行
generateInviteCodeForExistingUsers();
```

---

## 📊 统计维度

### 全站统计
- 总邀请人数（发起邀请的用户数）
- 总被邀请人数（通过邀请码注册的用户数）
- 邀请记录总数
- 激活率

### 用户维度
- 我邀请了多少人
- 谁邀请了我
- 邀请记录列表

### 时间维度
- 每日新增邀请数
- 每日新增邀请人数
- 每日新增被邀请人数

---

## 🎯 未来扩展

### 可选功能（未实现）
1. **奖励机制**
   - 邀请成功奖励积分
   - 邀请奖励等级（普通/高级）
   - 奖励记录表

2. **邀请限制**
   - 每个邀请码最多使用次数
   - 同一IP注册限制
   - 防刷机制

3. **数据导出**
   - 导出邀请明细为 Excel
   - 导出统计报表

4. **邀请海报**
   - 生成专属邀请海报
   - 二维码嵌入邀请码

5. **URL 参数识别**
   - 注册页面自动读取 `?invite=CODE` 参数
   - 预填充邀请码输入框

---

## 🐛 注意事项

1. **邀请码大小写**: 输入时自动转换为大写
2. **邀请码唯一性**: 数据库保证唯一，生成时会重试最多10次
3. **邀请关系不可修改**: 一旦建立邀请关系，无法更改
4. **已登录用户**: 无法更改自己的邀请码
5. **管理后台认证**: 需要添加管理员权限验证（目前未实现）

---

## 📱 页面路由

| 页面 | 路径 | 说明 |
|------|------|------|
| 我的邀请 | `/invite` | 用户端邀请页面 |
| 邀请统计 | `/admin/invite-stats` | 管理后台统计页面 |

---

## 测试建议

1. **注册测试**
   - 不填邀请码注册
   - 填写有效邀请码注册
   - 填写无效邀请码注册

2. **邀请功能测试**
   - 复制邀请码
   - 复制邀请链接
   - 查看邀请记录

3. **统计页面测试**
   - 查看全站统计
   - 排序测试
   - 日期筛选测试
   - 分页测试

4. **边界测试**
   - 自己邀请自己（应该被允许，但可以添加限制）
   - 邀请码格式错误
   - 邀请码不存在
