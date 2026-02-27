# ⚡ 快速开始指南

## 🚀 部署到生产环境

### 前置条件

确保本地已安装 `sshpass`:

```bash
# macOS
brew install hudochenkov/sshpass/sshpass

# Linux
sudo apt-get install sshpass  # Ubuntu/Debian
sudo yum install sshpass       # CentOS/RHEL
```

### 一键部署（3 步完成）

```bash
# 1. 进入项目目录
cd /Users/zhanglei/test/opc

# 2. 检查部署环境
./pre-deploy-check.sh

# 3. 执行部署
./deploy.sh
```

等待 5-10 分钟,部署完成后访问:
- 🌐 http://globalaialumni.com/weopc

### 快速更新部署

代码改动后快速更新:

```bash
./quick-deploy.sh
```

## 📋 管理后台

访问: http://globalaialumni.com/weopc/admin

**默认登录账号**:
- 用户名: `admin`
- 密码: `admin123`

⚠️ **首次登录后请立即修改密码!**

## 🔧 常用运维命令

### 查看服务状态
```bash
ssh root@101.200.231.179 'cd /opt/weopc && docker-compose ps'
```

### 查看实时日志
```bash
ssh root@101.200.231.179 'cd /opt/weopc && docker-compose logs -f'
```

### 重启服务
```bash
ssh root@101.200.231.179 'cd /opt/weopc && docker-compose restart'
```

### 备份数据库
```bash
ssh root@101.200.231.179 'docker cp weopc-app:/app/data/opc.db /root/backup_$(date +%Y%m%d).db'
```

## 📁 管理后台功能

### 社区管理
1. 访问: /admin/communities
2. 功能:
   - ➕ 新增社区
   - ✏️ 编辑社区
   - 🗑️ 删除社区(支持批量)
   - 📥 批量导入(Excel)
   - 📊 分页查询(10条/页)

### 活动管理
1. 访问: /admin/events
2. 同社区管理功能

### 新闻管理
1. 访问: /admin/news
2. 同社区管理功能

## 📥 批量导入数据

### 1. 下载模板
在管理页面点击 "下载模板" 按钮

### 2. 填写数据
按照模板格式填写 Excel 文件

### 3. 上传导入
点击 "批量导入",选择填好的 Excel 文件

### 4. 确认导入
系统会显示预览和重复数据,确认后导入

## 🛠️ 本地开发

如需本地开发调试:

```bash
# 进入项目
cd next

# 安装依赖
npm install

# 初始化数据库
npm run db:init

# 启动开发服务器
npm run dev
```

访问: http://localhost:3000

## 📚 详细文档

- **完整部署文档**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **项目说明**: [README.md](./README.md)
- **部署总结**: [DEPLOY-SUMMARY.md](./DEPLOY-SUMMARY.md)

## ❓ 常见问题

### Q: 如何查看部署是否成功?

```bash
ssh root@101.200.231.179 'cd /opt/weopc && docker-compose ps'
```

看到所有容器状态为 "Up" 即成功

### Q: 页面无法访问怎么办?

1. 检查容器状态
2. 查看日志: `docker-compose logs`
3. 检查端口: `netstat -tulpn | grep 80`

### Q: 如何回滚到上一个版本?

```bash
ssh root@101.200.231.179 << 'ENDSSH'
cd /opt/weopc
ls backups/  # 查看备份
tar -xzf backups/backup_YYYYMMDD_HHMMSS.tar.gz
docker-compose up -d --build
ENDSSH
```

### Q: 数据库如何备份?

自动备份:
- 每次部署前会自动备份
- 备份位置: `/opt/weopc/backups/`

手动备份:
```bash
ssh root@101.200.231.179 'docker cp weopc-app:/app/data/opc.db /root/backup.db'
```

## 🔐 安全检查清单

部署完成后务必完成:

- [ ] 修改管理员密码
- [ ] 修改 JWT_SECRET 环境变量
- [ ] 配置 SSL 证书(HTTPS)
- [ ] 配置防火墙规则
- [ ] 设置定时备份
- [ ] 检查日志权限

## 📞 获取帮助

遇到问题?

1. 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 故障排查章节
2. 检查服务器日志
3. 确认网络连接正常

---

祝使用愉快! 🎉
