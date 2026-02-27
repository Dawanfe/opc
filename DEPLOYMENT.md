# WeOPC 部署文档

## 服务器信息

- **服务器IP**: 101.200.231.179
- **用户名**: root
- **访问域名**: http://globalaialumni.com/weopc
- **部署路径**: /opt/weopc

## 部署方式

### 方式一: 一键自动部署（推荐）

使用完整的自动化部署脚本，包含环境检查、备份、部署、验证等完整流程:

```bash
./deploy.sh
```

脚本功能:
- ✅ 自动检查本地和服务器环境
- ✅ 自动安装 Docker 和 Docker Compose（如未安装）
- ✅ 自动备份现有部署
- ✅ 打包并上传代码
- ✅ 构建 Docker 镜像并启动服务
- ✅ 验证服务状态
- ✅ 显示部署日志

### 方式二: 快速部署

使用 rsync 快速同步代码并重启服务:

```bash
./quick-deploy.sh
```

适用场景:
- 小改动快速更新
- 服务器环境已经配置好
- 不需要完整的备份和验证流程

### 方式三: 手动部署

1. **安装 sshpass（如未安装）**:
   ```bash
   # macOS
   brew install hudochenkov/sshpass/sshpass

   # Ubuntu/Debian
   apt-get install sshpass
   ```

2. **上传代码到服务器**:
   ```bash
   sshpass -p "GAA-lianmeng666" rsync -avz \
     --exclude='node_modules' --exclude='.next' --exclude='data' \
     ./ root@101.200.231.179:/opt/weopc/
   ```

3. **SSH 登录服务器**:
   ```bash
   sshpass -p "GAA-lianmeng666" ssh root@101.200.231.179
   ```

4. **构建并启动服务**:
   ```bash
   cd /opt/weopc
   docker-compose down
   docker-compose up -d --build
   ```

## 常用运维命令

### 查看服务状态
```bash
ssh root@101.200.231.179 'cd /opt/weopc && docker-compose ps'
```

### 查看实时日志
```bash
ssh root@101.200.231.179 'cd /opt/weopc && docker-compose logs -f'
```

### 查看应用日志
```bash
ssh root@101.200.231.179 'cd /opt/weopc && docker-compose logs -f weopc-app'
```

### 查看 Nginx 日志
```bash
ssh root@101.200.231.179 'cd /opt/weopc && docker-compose logs -f nginx'
```

### 重启服务
```bash
ssh root@101.200.231.179 'cd /opt/weopc && docker-compose restart'
```

### 停止服务
```bash
ssh root@101.200.231.179 'cd /opt/weopc && docker-compose down'
```

### 启动服务
```bash
ssh root@101.200.231.179 'cd /opt/weopc && docker-compose up -d'
```

### 重新构建并启动
```bash
ssh root@101.200.231.179 'cd /opt/weopc && docker-compose up -d --build'
```

### 清理旧镜像
```bash
ssh root@101.200.231.179 'docker system prune -af'
```

## 目录结构

```
/opt/weopc/
├── docker-compose.yml      # Docker Compose 配置
├── .env.production         # 生产环境变量
├── nginx/
│   ├── nginx.conf         # Nginx 配置
│   ├── ssl/               # SSL 证书（如有）
│   └── logs/              # Nginx 日志
├── next/                  # Next.js 应用代码
│   ├── Dockerfile         # Docker 镜像构建文件
│   ├── src/              # 源代码
│   └── public/           # 静态资源
└── backups/              # 自动备份目录
```

## 访问地址

- **用户端**: http://globalaialumni.com/weopc
- **管理后台**: http://globalaialumni.com/weopc/admin/login
- **测试页面**: http://globalaialumni.com/weopc/test-auth

## 管理后台登录

- **用户名**: admin
- **密码**: admin123

## 数据持久化

数据库文件存储在 Docker Volume 中:
- Volume 名称: `weopc-data`
- 容器内路径: `/app/data`
- 数据库文件: `/app/data/opc.db`

### 备份数据库

```bash
# 导出数据库
ssh root@101.200.231.179 'docker exec weopc-app cat /app/data/opc.db' > backup_$(date +%Y%m%d).db

# 或者直接在服务器上备份
ssh root@101.200.231.179 'docker cp weopc-app:/app/data/opc.db /root/backup_$(date +%Y%m%d).db'
```

### 恢复数据库

```bash
# 上传数据库文件
sshpass -p "GAA-lianmeng666" scp backup.db root@101.200.231.179:/tmp/

# 恢复到容器
ssh root@101.200.231.179 'docker cp /tmp/backup.db weopc-app:/app/data/opc.db'

# 重启应用
ssh root@101.200.231.179 'cd /opt/weopc && docker-compose restart weopc-app'
```

## SSL/HTTPS 配置

如需启用 HTTPS:

1. **获取 SSL 证书** (使用 Let's Encrypt):
   ```bash
   ssh root@101.200.231.179
   apt-get install certbot
   certbot certonly --standalone -d globalaialumni.com
   ```

2. **复制证书到项目**:
   ```bash
   mkdir -p /opt/weopc/nginx/ssl
   cp /etc/letsencrypt/live/globalaialumni.com/fullchain.pem /opt/weopc/nginx/ssl/cert.pem
   cp /etc/letsencrypt/live/globalaialumni.com/privkey.pem /opt/weopc/nginx/ssl/key.pem
   ```

3. **修改 Nginx 配置**:
   - 编辑 `/opt/weopc/nginx/nginx.conf`
   - 取消注释 HTTPS server 块
   - 启用 HTTP 到 HTTPS 重定向

4. **重启 Nginx**:
   ```bash
   cd /opt/weopc && docker-compose restart nginx
   ```

## 故障排查

### 服务无法启动

1. 查看容器状态:
   ```bash
   ssh root@101.200.231.179 'cd /opt/weopc && docker-compose ps'
   ```

2. 查看错误日志:
   ```bash
   ssh root@101.200.231.179 'cd /opt/weopc && docker-compose logs'
   ```

3. 检查端口占用:
   ```bash
   ssh root@101.200.231.179 'netstat -tulpn | grep -E "80|443|3000"'
   ```

### 页面无法访问

1. 检查 Nginx 配置:
   ```bash
   ssh root@101.200.231.179 'docker exec weopc-nginx nginx -t'
   ```

2. 查看 Nginx 日志:
   ```bash
   ssh root@101.200.231.179 'docker exec weopc-nginx tail -f /var/log/nginx/error.log'
   ```

### 数据库问题

1. 进入容器检查数据库:
   ```bash
   ssh root@101.200.231.179 'docker exec -it weopc-app sh'
   cd /app/data
   ls -lah
   ```

2. 重新初始化数据库:
   ```bash
   ssh root@101.200.231.179 'docker exec weopc-app npm run db:init'
   ```

## 性能优化

### 1. 启用 Gzip 压缩
Nginx 配置中已启用 gzip 压缩

### 2. 静态资源缓存
Next.js 静态资源已配置 365 天缓存

### 3. 数据库优化
SQLite 已启用 WAL 模式，提升并发性能

### 4. 容器资源限制
可在 docker-compose.yml 中添加资源限制:
```yaml
services:
  weopc-app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 512M
```

## 监控和告警

### 健康检查

应用已配置健康检查端点:
- 检查间隔: 30秒
- 超时时间: 10秒
- 重试次数: 3次

### 查看健康状态
```bash
ssh root@101.200.231.179 'docker inspect weopc-app | grep -A 10 Health'
```

## 更新应用

### 小版本更新
```bash
./quick-deploy.sh
```

### 大版本更新
```bash
./deploy.sh
```

## 回滚操作

如果部署出现问题，可以快速回滚:

```bash
# 查看备份列表
ssh root@101.200.231.179 'ls -lh /opt/weopc/backups/'

# 回滚到指定备份
ssh root@101.200.231.179 << 'ENDSSH'
cd /opt/weopc
docker-compose down
tar -xzf backups/backup_YYYYMMDD_HHMMSS.tar.gz
docker-compose up -d --build
ENDSSH
```

## 安全建议

1. **修改默认密码**: 部署后立即修改管理后台密码
2. **JWT 密钥**: 修改 `.env.production` 中的 `JWT_SECRET`
3. **防火墙配置**: 配置防火墙只开放必要端口（80, 443）
4. **定期备份**: 建议每天自动备份数据库
5. **SSL 证书**: 生产环境启用 HTTPS
6. **日志监控**: 定期检查错误日志

## 联系支持

如遇到问题，请提供:
- 错误日志: `docker-compose logs`
- 容器状态: `docker-compose ps`
- 系统信息: `uname -a` 和 `docker version`
