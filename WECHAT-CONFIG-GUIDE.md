# 微信登录双AppID配置指南

## 当前状态
✅ PC端：已配置完成（网站应用）
⏳ 移动端：等待公众号配置

---

## 第一步：申请微信服务号（移动端必须）

### 1. 注册服务号
- 访问：https://mp.weixin.qq.com
- 点击"立即注册"
- 选择：**服务号**（不是订阅号）

### 2. 主体认证（必须）
- 费用：300元/年
- 准备材料：
  - ✅ 营业执照扫描件
  - ✅ 企业对公账户信息（或法人身份证+微信支付）
  - ✅ 运营者身份证
  - ✅ 运营者手机号
- 审核时间：1-3个工作日

### 3. 配置网页授权域名
**路径**：登录微信公众平台 → 设置与开发 → 公众号设置 → 功能设置 → 网页授权域名

**步骤**：
1. 点击"设置"
2. 输入域名：`weopc.com.cn`
3. 下载验证文件：`MP_verify_xxxxxxxxxx.txt`
4. **将验证文件内容发给我，我来部署**
5. 部署后点击"确定"完成验证

### 4. 获取配置信息
**路径**：登录微信公众平台 → 设置与开发 → 开发 → 基本配置

**需要记录**：
```
① 公众号AppID: wxXXXXXXXXXXXXXXXX
② 公众号AppSecret:
   - 点击"重置"按钮
   - 管理员扫码确认
   - ⚠️ 密钥只显示一次，务必保存
③ IP白名单：
   - 点击"修改"
   - 添加：101.200.231.179
```

---

## 第二步：提供配置信息给我

申请完成后，请提供以下信息：

```
【微信公众号配置】
公众号AppID: wxXXXXXXXXXXXXXXXX
公众号AppSecret: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

【验证文件】
文件名: MP_verify_xxxxxxxxxx.txt
文件内容: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

我会帮你：
1. 部署验证文件到服务器
2. 配置环境变量
3. 重新部署应用
4. 测试移动端登录功能

---

## 第三步：环境变量配置（我来操作）

收到你的配置后，我会更新服务器的环境变量：

```bash
# PC端网站应用（已有）
WECHAT_APP_ID=wxb3330c77aa423d29
WECHAT_APP_SECRET=b00822b41733d0dad1d8697774080755

# 移动端公众号（待配置）
WECHAT_MP_APP_ID=wxXXXXXXXXXXXXXXXX
WECHAT_MP_APP_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 前端环境变量
NEXT_PUBLIC_WECHAT_APP_ID=wxb3330c77aa423d29  # PC端
NEXT_PUBLIC_WECHAT_MP_APP_ID=wxXXXXXXXXXXXXXXXX  # 移动端
```

---

## 配置完成后的效果

### PC端（已支持）
1. 访问 https://weopc.com.cn
2. 点击"微信授权登录"
3. 跳转到微信扫码页面
4. 手机微信扫码授权 → 登录成功 ✅

### 移动端（配置后支持）
1. 手机访问 https://weopc.com.cn
2. 点击"微信授权登录"
3. 自动跳转到微信授权页面（或唤起微信App）
4. 确认授权 → 登录成功 ✅

---

## 技术架构

### 双AppID方案
```
用户设备检测
    ↓
  是否移动端？
    ↓
  YES → 使用公众号AppID (WECHAT_MP_APP_ID)
         scope: snsapi_userinfo
         接口: oauth2/authorize
    ↓
  NO → 使用网站应用AppID (WECHAT_APP_ID)
        scope: snsapi_login
        接口: qrconnect
    ↓
  后端回调 /api/auth/wechat/callback
    ↓
  智能判断来源（PC或移动端）
    ↓
  使用对应的AppID和AppSecret获取用户信息
    ↓
  登录成功
```

### 后端兼容逻辑
- 收到回调后，先尝试用PC端AppID换取token
- 如果失败（错误码40163），则使用移动端AppID
- 自动适配两种授权来源
- 用户无感知切换

---

## 费用说明

- ✅ 网站应用（PC端）：300元/年（已支付）
- 🆕 服务号（移动端）：300元/年（需支付）
- **总计**：600元/年

---

## 常见问题

### Q1: 为什么要申请两个AppID？
**A**: 微信的限制决定的：
- 网站应用：只支持PC扫码登录
- 公众号：只支持移动端网页授权
- 两者不互通，必须分别申请

### Q2: 可以只用一个AppID吗？
**A**: 不行。如果只用网站应用AppID：
- PC端正常 ✅
- 移动端显示二维码，但用户无法扫描 ❌

### Q3: 申请需要多久？
**A**:
- 注册公众号：立即完成
- 微信认证：1-3个工作日
- 配置生效：立即生效

### Q4: 个人可以申请吗？
**A**: 不行。服务号只支持：
- 企业（有营业执照）
- 个体工商户（有营业执照）
- 政府/事业单位/其他组织

---

## 申请流程总结

```
1. 访问 mp.weixin.qq.com 注册服务号
   ↓
2. 提交企业认证（300元）
   ↓
3. 等待1-3天审核通过
   ↓
4. 配置网页授权域名
   ↓
5. 获取AppID和AppSecret
   ↓
6. 提供给我进行配置
   ↓
7. 我部署验证文件 + 更新环境变量
   ↓
8. 测试移动端登录功能
   ↓
9. 完成！🎉
```

---

**下一步**：请按照上面的步骤申请微信服务号，完成后把配置信息发给我即可。
