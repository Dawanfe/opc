# 🔄 数据库管理 - 快速参考

## ✅ 重要保证

### 数据不会丢失！

- ✅ **重新部署不会覆盖数据库** - 数据存在 Docker Volume 中
- ✅ **首次部署自动初始化** - 只在数据库不存在时初始化
- ✅ **容器重启数据保留** - 数据永久保存
- ✅ **升级应用数据安全** - 代码更新不影响数据

## 📦 数据存储

```
Docker Volume: opc_weopc-data
容器路径: /app/data/opc.db
服务器路径: /var/lib/docker/volumes/opc_weopc-data/_data/
```

## 🚀 快速操作

### 配置自动备份（只需执行一次）

```bash
./setup-auto-backup.sh
```

自动配置:
- ⏰ 每天凌晨 2:00 自动备份
- 📁 保存到 `/opt/weopc/backups/database/`
- 🗄️ 保留最近 30 天备份

### 手动备份

```bash
./backup-db.sh
```

### 恢复备份

```bash
# 1. 查看可用备份
ssh root@101.200.231.179 'ls -lh /opt/weopc/backups/database/'

# 2. 恢复（需要输入 YES 确认）
./restore-db.sh opc_db_20260227_020000.db.gz
```

### 下载数据库到本地

```bash
sshpass -p "GAA-lianmeng666" ssh root@101.200.231.179 \
  'docker exec weopc-app cat /app/data/opc.db' > backup_$(date +%Y%m%d).db
```

## 🔍 查看数据

### 查看数据库大小

```bash
ssh root@101.200.231.179 'docker exec weopc-app du -h /app/data/opc.db'
```

### 查询记录数

```bash
# 社区数量
ssh root@101.200.231.179 \
  'docker exec weopc-app sqlite3 /app/data/opc.db "SELECT COUNT(*) FROM communities;"'

# 活动数量
ssh root@101.200.231.179 \
  'docker exec weopc-app sqlite3 /app/data/opc.db "SELECT COUNT(*) FROM events;"'

# 新闻数量
ssh root@101.200.231.179 \
  'docker exec weopc-app sqlite3 /app/data/opc.db "SELECT COUNT(*) FROM news;"'

# 用户数量
ssh root@101.200.231.179 \
  'docker exec weopc-app sqlite3 /app/data/opc.db "SELECT COUNT(*) FROM users;"'
```

### 查看备份列表

```bash
ssh root@101.200.231.179 'ls -lh /opt/weopc/backups/database/'
```

### 查看备份日志

```bash
ssh root@101.200.231.179 'tail -20 /opt/weopc/backups/backup.log'
```

## ⚠️ 危险操作

以下操作会**删除所有数据**，请谨慎！

### 清空数据库重新开始

```bash
ssh root@101.200.231.179 << 'ENDSSH'
cd /opt/weopc
docker-compose down
docker volume rm opc_weopc-data
docker-compose up -d
ENDSSH
```

### 删除 Volume

```bash
# ⚠️ 这会永久删除所有数据！
ssh root@101.200.231.179 'docker volume rm opc_weopc-data'
```

## 📊 数据库维护

### 优化数据库（减小文件大小）

```bash
ssh root@101.200.231.179 \
  'docker exec weopc-app sqlite3 /app/data/opc.db "VACUUM;"'
```

### 检查数据库完整性

```bash
ssh root@101.200.231.179 \
  'docker exec weopc-app sqlite3 /app/data/opc.db "PRAGMA integrity_check;"'
```

## 💡 常用场景

### 场景1: 定期备份

```bash
# 方式1: 配置自动备份（推荐）
./setup-auto-backup.sh

# 方式2: 手动备份
./backup-db.sh
```

### 场景2: 迁移到新服务器

```bash
# 1. 旧服务器备份
./backup-db.sh

# 2. 下载备份
sshpass -p "GAA-lianmeng666" scp root@101.200.231.179:/opt/weopc/backups/database/opc_db_*.db.gz ./

# 3. 新服务器部署应用
./deploy.sh

# 4. 恢复数据
./restore-db.sh opc_db_YYYYMMDD_HHMMSS.db.gz
```

### 场景3: 数据损坏恢复

```bash
# 1. 停止应用
ssh root@101.200.231.179 'cd /opt/weopc && docker-compose stop weopc-app'

# 2. 检查完整性
ssh root@101.200.231.179 \
  'docker exec weopc-app sqlite3 /app/data/opc.db "PRAGMA integrity_check;"'

# 3. 从备份恢复
./restore-db.sh opc_db_YYYYMMDD_HHMMSS.db.gz
```

### 场景4: 测试环境同步生产数据

```bash
# 1. 生产环境备份
./backup-db.sh

# 2. 下载到本地
sshpass -p "GAA-lianmeng666" scp \
  root@101.200.231.179:/opt/weopc/backups/database/latest.db.gz \
  ./test_data.db.gz

# 3. 上传到测试环境并恢复
# （根据测试环境配置调整）
```

## 📝 检查清单

部署后的数据库检查:

- [ ] 数据库文件存在: `docker exec weopc-app ls -lh /app/data/opc.db`
- [ ] 配置自动备份: `./setup-auto-backup.sh`
- [ ] 测试手动备份: `./backup-db.sh`
- [ ] 测试备份恢复: `./restore-db.sh <backup_file>`
- [ ] 查看备份日志: `tail -f /opt/weopc/backups/backup.log`
- [ ] 监控磁盘空间: `df -h`

## 🆘 故障排查

### 问题: 数据库文件不存在

```bash
# 检查容器是否运行
docker-compose ps

# 检查 Volume
docker volume ls | grep weopc-data

# 重启容器（会自动初始化）
docker-compose restart weopc-app
```

### 问题: 备份失败

```bash
# 检查备份目录权限
ssh root@101.200.231.179 'ls -ld /opt/weopc/backups'

# 检查磁盘空间
ssh root@101.200.231.179 'df -h'

# 查看备份日志
ssh root@101.200.231.179 'tail -50 /opt/weopc/backups/backup.log'
```

### 问题: 恢复后数据不对

```bash
# 检查恢复的备份文件日期
ls -lh /opt/weopc/backups/database/

# 尝试恢复更早的备份
./restore-db.sh opc_db_EARLIER_DATE.db.gz
```

## 📚 更多信息

详细文档: [DATABASE.md](./DATABASE.md)

---

**记住**:
- 🔒 定期备份是数据安全的保障
- ⚠️ 重要操作前先备份
- 📝 定期检查备份日志
- 🧪 定期测试恢复流程
