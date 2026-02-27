# 📊 数据库管理指南

## 数据持久化方案

### ✅ 数据不会丢失

WeOPC 使用 **Docker Volume** 持久化数据库，确保：

1. **重新部署不会覆盖数据** - 数据库存储在 Docker Volume 中，与容器分离
2. **容器重启数据保留** - 数据永久保存
3. **升级应用数据安全** - 更新代码不影响数据库

### 数据存储位置

```yaml
# docker-compose.yml 配置
volumes:
  - weopc-data:/app/data    # Docker Volume 挂载

volumes:
  weopc-data:
    driver: local           # 本地持久化存储
```

**实际存储路径**（服务器上）:
- Docker Volume: `/var/lib/docker/volumes/opc_weopc-data/_data/`
- 数据库文件: `/var/lib/docker/volumes/opc_weopc-data/_data/opc.db`

## 🔄 首次初始化

### 自动初始化

容器首次启动时会自动检查并初始化数据库：

```bash
# Dockerfile CMD 命令
if [ ! -f /app/data/opc.db ]; then
    echo 'Initializing database...'
    node -r tsx/register scripts/init-db.ts
fi
```

### 手动初始化

如需手动重新初始化（⚠️ 会清空数据）：

```bash
# 1. 停止容器
ssh root@101.200.231.179 'cd /opt/weopc && docker-compose down'

# 2. 删除 Volume（会删除所有数据！）
ssh root@101.200.231.179 'docker volume rm opc_weopc-data'

# 3. 重新启动（会自动初始化）
ssh root@101.200.231.179 'cd /opt/weopc && docker-compose up -d'
```

## 💾 自动备份

### 配置自动备份

运行一次即可配置定时备份：

```bash
./setup-auto-backup.sh
```

**备份配置**:
- ⏰ 备份时间: 每天凌晨 2:00
- 📁 备份目录: `/opt/weopc/backups/database/`
- 🗄️ 保留时间: 30 天
- 📝 日志文件: `/opt/weopc/backups/backup.log`

### 手动备份

```bash
# 方式1: 使用备份脚本（本地执行）
./backup-db.sh

# 方式2: 直接在服务器执行
ssh root@101.200.231.179 << 'ENDSSH'
mkdir -p /opt/weopc/backups/database
docker exec weopc-app cat /app/data/opc.db > /opt/weopc/backups/database/backup_$(date +%Y%m%d_%H%M%S).db
gzip /opt/weopc/backups/database/backup_*.db
ENDSSH
```

### 查看备份

```bash
# 列出所有备份
ssh root@101.200.231.179 'ls -lh /opt/weopc/backups/database/'

# 查看备份日志
ssh root@101.200.231.179 'tail -f /opt/weopc/backups/backup.log'
```

## 🔙 恢复数据库

### 从备份恢复

```bash
# 1. 查看可用备份
ssh root@101.200.231.179 'ls -lh /opt/weopc/backups/database/'

# 2. 执行恢复（会提示确认）
./restore-db.sh opc_db_20260227_020000.db.gz
```

### 手动恢复

```bash
ssh root@101.200.231.179 << 'ENDSSH'
# 停止应用
cd /opt/weopc && docker-compose stop weopc-app

# 恢复数据库
gunzip -c /opt/weopc/backups/database/opc_db_YYYYMMDD_HHMMSS.db.gz > /tmp/restore.db
docker cp /tmp/restore.db weopc-app:/app/data/opc.db
rm /tmp/restore.db

# 启动应用
cd /opt/weopc && docker-compose start weopc-app
ENDSSH
```

## 📥 导入导出数据

### 导出数据库到本地

```bash
# 下载当前数据库
sshpass -p "GAA-lianmeng666" ssh root@101.200.231.179 \
  'docker exec weopc-app cat /app/data/opc.db' > local_backup.db
```

### 从本地上传数据库

```bash
# 上传数据库文件
sshpass -p "GAA-lianmeng666" scp local_backup.db root@101.200.231.179:/tmp/

# 恢复到容器
ssh root@101.200.231.179 << 'ENDSSH'
cd /opt/weopc
docker-compose stop weopc-app
docker cp /tmp/local_backup.db weopc-app:/app/data/opc.db
docker-compose start weopc-app
rm /tmp/local_backup.db
ENDSSH
```

## 🔍 数据库查询

### 进入容器查看数据库

```bash
# 1. 进入容器
ssh root@101.200.231.179 'docker exec -it weopc-app sh'

# 2. 安装 sqlite3（如需要）
apk add --no-cache sqlite

# 3. 查询数据库
sqlite3 /app/data/opc.db

# SQLite 常用命令
.tables                    # 查看所有表
.schema communities        # 查看表结构
SELECT COUNT(*) FROM communities;  # 统计记录数
SELECT * FROM users LIMIT 10;      # 查询前10条
.exit                      # 退出
```

### 直接执行查询

```bash
# 查询社区数量
ssh root@101.200.231.179 \
  'docker exec weopc-app sqlite3 /app/data/opc.db "SELECT COUNT(*) FROM communities;"'

# 查询用户列表
ssh root@101.200.231.179 \
  'docker exec weopc-app sqlite3 /app/data/opc.db "SELECT username, email FROM users;"'
```

## 📊 数据库维护

### 查看数据库大小

```bash
ssh root@101.200.231.179 \
  'docker exec weopc-app du -h /app/data/opc.db'
```

### 数据库优化（VACUUM）

定期优化可以减小数据库文件大小：

```bash
ssh root@101.200.231.179 \
  'docker exec weopc-app sqlite3 /app/data/opc.db "VACUUM;"'
```

### 检查数据库完整性

```bash
ssh root@101.200.231.179 \
  'docker exec weopc-app sqlite3 /app/data/opc.db "PRAGMA integrity_check;"'
```

## ⚠️ 重要提醒

### 部署不会覆盖数据

✅ **安全操作** - 以下操作不会影响数据库：
- 执行 `./deploy.sh` 重新部署
- 执行 `./quick-deploy.sh` 快速更新
- 执行 `docker-compose up -d --build` 重新构建
- 执行 `docker-compose restart` 重启服务

❌ **危险操作** - 以下操作会删除数据：
- `docker volume rm opc_weopc-data` - 删除 Volume
- `docker-compose down -v` - 删除容器和 Volume
- 手动删除 Volume 目录

### 备份最佳实践

1. **定时备份**: 使用 `./setup-auto-backup.sh` 配置自动备份
2. **重要操作前备份**: 执行数据迁移、大规模修改前手动备份
3. **异地备份**: 定期下载备份到本地或云存储
4. **测试恢复**: 定期测试备份恢复流程

### 数据安全检查清单

- [ ] 已配置自动备份 (`./setup-auto-backup.sh`)
- [ ] 备份目录有足够空间
- [ ] 测试过备份恢复流程
- [ ] 定期下载备份到本地
- [ ] 监控备份日志
- [ ] 设置备份失败告警

## 📞 常见问题

### Q: 重新部署会丢失数据吗？

**A:** 不会。数据存储在 Docker Volume 中，与容器分离，重新部署不会影响数据。

### Q: 如何迁移数据到新服务器？

**A:**
1. 在旧服务器备份: `./backup-db.sh`
2. 下载备份到本地
3. 在新服务器部署应用
4. 上传并恢复备份: `./restore-db.sh`

### Q: 数据库损坏如何处理？

**A:**
1. 停止应用: `docker-compose stop weopc-app`
2. 检查完整性: `sqlite3 opc.db "PRAGMA integrity_check;"`
3. 从最近备份恢复: `./restore-db.sh`
4. 如无备份，尝试导出未损坏的数据

### Q: 如何清空数据库重新开始？

**A:**
```bash
# 方法1: 删除 Volume 重新初始化
ssh root@101.200.231.179 << 'ENDSSH'
cd /opt/weopc
docker-compose down
docker volume rm opc_weopc-data
docker-compose up -d
ENDSSH

# 方法2: 删除数据库文件
ssh root@101.200.231.179 \
  'docker exec weopc-app rm /app/data/opc.db && docker-compose restart weopc-app'
```

## 🛠️ 备份脚本说明

### 可用脚本

| 脚本 | 功能 | 使用方式 |
|------|------|----------|
| `backup-db.sh` | 手动备份数据库 | `./backup-db.sh` |
| `restore-db.sh` | 从备份恢复 | `./restore-db.sh backup_file.db.gz` |
| `setup-auto-backup.sh` | 配置自动备份 | `./setup-auto-backup.sh` |

### 备份文件命名规则

```
opc_db_YYYYMMDD_HHMMSS.db.gz
例如: opc_db_20260227_020000.db.gz
```

---

**记住**: 数据库很重要，定期备份，安全第一！ 🔒
