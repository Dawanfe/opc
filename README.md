# WeOPC - 开放先锋社区管理系统

一个功能完善的 AI 社区管理平台,用于管理社区信息、活动、新闻等内容。

## 功能特性

### 用户端功能
- 🏘️ **社区展示**: 浏览全国各地 AI 创业社区信息
- 📅 **活动管理**: 查看和报名 AI 行业热门活动
- 📰 **新闻资讯**: 获取每日 AI 行业新闻和政策动态
- 🛍️ **需求广场**: AI 人才和项目需求对接
- 👤 **用户系统**: 注册、登录、个人中心

### 管理后台功能
- 📊 **数据统计**: 社区、活动、新闻数据统计面板
- 🗂️ **内容管理**:
  - 社区管理（CRUD + 批量导入导出）
  - 活动管理（CRUD + 批量导入导出）
  - 新闻管理（CRUD + 批量导入导出）
- 📥 **批量导入**: Excel 模板导入,自动去重
- 📤 **数据导出**: 支持导出为 Excel 格式
- 🔐 **权限管理**: 管理员独立认证系统

## 快速开始

### 本地开发

```bash
cd next
npm install
npm run db:init
npm run dev
```

访问: http://localhost:3000

### 生产部署

#### 一键部署

```bash
# 完整部署（首次部署或大版本更新）
./deploy.sh

# 快速部署（小改动更新）
./quick-deploy.sh
```

#### 访问地址

- 生产环境: http://globalaialumni.com/weopc
- 管理后台: http://globalaialumni.com/weopc/admin

## 管理后台登录

- **用户名**: admin
- **密码**: admin123

## 部署说明

详细部署文档请查看: [DEPLOYMENT.md](./DEPLOYMENT.md)

数据库管理文档: [DATABASE.md](./DATABASE.md) ⭐

### 服务器信息
- IP: 101.200.231.179
- 部署路径: /opt/weopc

### 常用运维命令

```bash
# 查看服务状态
ssh root@101.200.231.179 'cd /opt/weopc && docker-compose ps'

# 查看日志
ssh root@101.200.231.179 'cd /opt/weopc && docker-compose logs -f'

# 重启服务
ssh root@101.200.231.179 'cd /opt/weopc && docker-compose restart'
```

## 技术栈

- **前端**: Next.js 16 + React 19 + Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: SQLite + better-sqlite3
- **认证**: JWT + bcryptjs
- **部署**: Docker + Docker Compose + Nginx

## 项目结构

```
opc/
├── next/              # Next.js 应用
├── nginx/             # Nginx 配置
├── docker-compose.yml # Docker Compose 配置
├── deploy.sh          # 完整部署脚本
├── quick-deploy.sh    # 快速部署脚本
└── DEPLOYMENT.md      # 详细部署文档
```

## License

MIT
