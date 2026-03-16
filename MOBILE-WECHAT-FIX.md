# 微信登录移动端授权修复

## 问题描述
移动端显示二维码时，微信提示：
> "该二维码仅支持在扫一扫时，通过摄像头来识别，暂不支持通过长按图片、扫一扫时从相册读取图片等方式来识别。"

## 根本原因
之前的实现在移动端使用了微信开放平台的"网站应用"扫码登录（`snsapi_login`），这种方式生成的二维码只能在PC微信或其他设备上扫描，不支持在移动端长按识别。

## 解决方案

### 修改策略
- **PC端**：使用 `qrconnect` 接口，跳转到微信官方扫码页面
- **移动端**：使用 `oauth2/authorize` 接口，直接唤起微信授权

### 技术实现

#### 1. AuthContext.tsx 修改
```typescript
const loginWithWechat = useCallback(async () => {
  const isMobileDevice = isMobile();

  if (isMobileDevice) {
    // 移动端：使用网页授权（oauth2/authorize）
    const wechatMobileAuthUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${encodeURIComponent(redirectUri + '/api/auth/wechat/callback')}&response_type=code&scope=snsapi_userinfo&state=${state}#wechat_redirect`;
    window.location.href = wechatMobileAuthUrl;
  } else {
    // PC端：使用扫码登录（qrconnect）
    const wechatPCAuthUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${appId}&redirect_uri=${encodeURIComponent(redirectUri + '/api/auth/wechat/callback')}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`;
    window.location.href = wechatPCAuthUrl;
  }
}, [isMobile]);
```

#### 2. LoginModal.tsx 简化
- **删除**：移动端显示二维码的所有代码
- **删除**：微信 JS-SDK 动态加载逻辑
- **删除**：复制链接、使用说明等移动端特殊处理
- **统一**：PC和移动端都使用同一个按钮，点击后直接跳转

#### 3. 删除的文件
- `next/global.d.ts` - 微信 SDK 类型定义（不再需要）

## 用户体验

### PC端
1. 点击"微信授权登录"按钮
2. 跳转到微信官方扫码页面
3. 使用手机微信扫码
4. 确认授权后跳转回网站

### 移动端
1. 点击"微信授权登录"按钮
2. 自动跳转到微信授权页面
3. 在微信内确认授权（或唤起微信App）
4. 授权成功后跳转回网站

## 微信授权类型对比

| 授权类型 | 接口 | scope | 适用场景 | 备注 |
|---------|------|-------|---------|------|
| 网站应用扫码登录 | qrconnect | snsapi_login | PC端 | 显示二维码，手机扫码 |
| 网页授权（静默） | oauth2/authorize | snsapi_base | 移动端（微信内） | 无需用户确认，只获取openid |
| 网页授权（用户信息） | oauth2/authorize | snsapi_userinfo | 移动端 | 需要用户确认，获取昵称、头像等 |

**当前实现**：
- PC端使用 `snsapi_login`（扫码登录）
- 移动端使用 `snsapi_userinfo`（网页授权）

## 部署信息
- **部署时间**: 2026-03-16 12:05:41 (UTC+8)
- **部署状态**: ✅ 成功
- **服务地址**: https://weopc.com.cn

## 测试步骤

### 移动端测试
1. 在手机浏览器中访问 https://weopc.com.cn
2. 点击"登录/注册"按钮
3. 选择"微信授权登录"
4. 应该自动跳转到微信授权页面
5. **预期结果**：
   - 在微信内：直接显示授权确认页面
   - 在外部浏览器：提示唤起微信或显示授权二维码

### PC端测试
1. 在电脑浏览器中访问 https://weopc.com.cn
2. 点击"登录/注册"按钮
3. 选择"微信授权登录"
4. 应该跳转到微信官方扫码页面
5. 使用手机微信扫码
6. **预期结果**：扫码成功后自动跳转回网站并完成登录

## 相关修改文件
- ✅ [next/src/contexts/AuthContext.tsx](next/src/contexts/AuthContext.tsx) - 区分PC/移动端授权逻辑
- ✅ [next/src/components/LoginModal.tsx](next/src/components/LoginModal.tsx) - 简化为统一的跳转按钮
- ✅ ~~next/global.d.ts~~ - 已删除（不再需要）

---

**修复完成**：移动端现在使用微信网页授权，PC端使用扫码登录，不再出现"该二维码仅支持摄像头识别"的问题。
