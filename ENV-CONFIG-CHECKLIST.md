# 环境变量配置清单

## 服务器端环境变量 (/.env)

```bash
# ===== JWT配置 =====
JWT_SECRET=weopc-jwt-secret-key-2024-secure

# ===== 微信PC端（网站应用 - 已配置）=====
WECHAT_APP_ID=wxb3330c77aa423d29
WECHAT_APP_SECRET=b00822b41733d0dad1d8697774080755

# ===== 微信移动端（公众号 - 待配置）=====
WECHAT_MP_APP_ID=                    # ← 需要填入公众号AppID
WECHAT_MP_APP_SECRET=                # ← 需要填入公众号AppSecret

# ===== 回调地址 =====
WECHAT_REDIRECT_URI=https://weopc.com.cn/api/auth/wechat/callback
NEXT_PUBLIC_FRONTEND_URL=https://weopc.com.cn

# ===== 前端环境变量 =====
NEXT_PUBLIC_WECHAT_APP_ID=wxb3330c77aa423d29       # PC端
NEXT_PUBLIC_WECHAT_MP_APP_ID=                       # ← 需要填入公众号AppID
```

---

## 配置步骤

### 当前状态
- [x] PC端网站应用配置完成
- [ ] 移动端公众号待申请
- [ ] 验证文件待部署
- [ ] 移动端环境变量待配置

### 收到公众号配置后的操作

#### 1. 部署验证文件
```bash
# 在本地项目目录执行
./deploy-wechat-verify.sh MP_verify_xxx.txt "验证文件内容"
```

#### 2. 更新服务器环境变量
```bash
# SSH到服务器
ssh root@101.200.231.179

# 编辑环境变量
cd /opt/weopc
vi .env

# 添加以下两行（替换xxx为实际值）
WECHAT_MP_APP_ID=wxXXXXXXXXXXXXXXXX
WECHAT_MP_APP_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_WECHAT_MP_APP_ID=wxXXXXXXXXXXXXXXXX

# 保存退出后重启容器
docker compose restart
```

#### 3. 本地部署（推荐）
```bash
# 在本地项目目录执行
./deploy.sh
```
这会自动同步环境变量到服务器并重启服务。

---

## 验证配置是否生效

### 1. 检查环境变量
```bash
# 在服务器上执行
cd /opt/weopc
docker compose exec weopc-app env | grep WECHAT
```

应该看到：
```
WECHAT_APP_ID=wxb3330c77aa423d29
WECHAT_APP_SECRET=b00822b41733d0dad1d8697774080755
WECHAT_MP_APP_ID=wxXXXXXXXXXXXXXXXX
WECHAT_MP_APP_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_WECHAT_APP_ID=wxb3330c77aa423d29
NEXT_PUBLIC_WECHAT_MP_APP_ID=wxXXXXXXXXXXXXXXXX
```

### 2. 测试验证文件访问
```bash
curl https://weopc.com.cn/MP_verify_xxx.txt
```
应该返回验证文件内容。

### 3. 测试PC端登录
1. 访问 https://weopc.com.cn
2. 点击"微信授权登录"
3. 应该跳转到微信扫码页面 ✅

### 4. 测试移动端登录
1. 手机访问 https://weopc.com.cn
2. 点击"微信授权登录"
3. 应该跳转到微信授权页面（不是扫码页面）✅

---

## 如果移动端未配置

如果 `WECHAT_MP_APP_ID` 为空，移动端会：
- 显示提示："移动端微信登录功能正在配置中，请使用手机号登录或在电脑端访问"
- 不会跳转到错误页面
- PC端功能不受影响

---

## 配置文件位置

### 本地
- 环境变量配置：`/Users/zhanglei/test/opc/deploy.sh` (第68-76行)
- 前端配置：`/Users/zhanglei/test/opc/next/.env.local` (如果有)

### 服务器
- 环境变量：`/opt/weopc/.env`
- 验证文件：`/opt/weopc/next/public/MP_verify_xxx.txt`

---

## 配置模板

当你提供公众号信息后，我会创建这样的配置：

```bash
# 添加到 /opt/weopc/.env
WECHAT_MP_APP_ID=wx1234567890abcdef
WECHAT_MP_APP_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
NEXT_PUBLIC_WECHAT_MP_APP_ID=wx1234567890abcdef
```

然后执行：
```bash
cd /opt/weopc
docker compose restart
```

---

**准备就绪**：代码已经全部完成，只等公众号配置信息！
