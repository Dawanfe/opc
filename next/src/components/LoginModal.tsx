"use client";

import { useState, useEffect } from 'react';
import { X, Smartphone, Check, Loader2, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// 微信图标组件
function WechatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89a.506.506 0 0 1-.104-.003l-.003-.005zm-2.419 2.118c.534 0 .967.44.967.982a.976.976 0 0 1-.967.983.976.976 0 0 1-.968-.983c0-.542.433-.982.968-.982zm4.844 0c.535 0 .967.44.967.982a.976.976 0 0 1-.967.983.976.976 0 0 1-.968-.983c0-.542.433-.982.968-.982z"/>
    </svg>
  );
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'wechat'>('wechat');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrcodeLoaded, setQrcodeLoaded] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const { login, register, loginWithWechat, isMobile } = useAuth();

  // 检查是否有待处理的邀请码
  useEffect(() => {
    if (isOpen) {
      const pendingCode = localStorage.getItem('pendingInviteCode');
      if (pendingCode) {
        setInviteCode(pendingCode);
        setActiveTab('register'); // 自动切换到注册标签
        localStorage.removeItem('pendingInviteCode');
      }
    }
  }, [isOpen]);

  // 移动端加载微信 JS-SDK 生成二维码
  useEffect(() => {
    if (!isOpen || activeTab !== 'wechat' || !isMobile()) return;

    // 生成二维码参数
    const redirectUri = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://weopc.com.cn';
    const appId = process.env.NEXT_PUBLIC_WECHAT_APP_ID || 'wxb3330c77aa423d29';
    const state = Math.random().toString(36).substring(7);

    // 检查是否已经加载了微信 JS
    if (typeof window !== 'undefined' && (window as any).WxLogin) {
      renderWechatQRCode(appId, redirectUri, state);
      return;
    }

    // 动态加载微信 JS-SDK
    const script = document.createElement('script');
    script.src = 'https://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js';
    script.async = true;
    script.onload = () => {
      renderWechatQRCode(appId, redirectUri, state);
    };
    script.onerror = () => {
      console.error('[WeChat QRCode] Failed to load WeChat JS-SDK');
      setQrcodeLoaded(false);
    };
    document.body.appendChild(script);

    return () => {
      // 清理
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [isOpen, activeTab, isMobile]);

  // 渲染微信二维码
  const renderWechatQRCode = (appId: string, redirectUri: string, state: string) => {
    try {
      const container = document.getElementById('wechat-qrcode-container');
      if (!container) return;

      // 清空容器
      container.innerHTML = '';

      // 使用微信官方 JS 生成二维码
      new (window as any).WxLogin({
        self_redirect: false,
        id: 'wechat-qrcode-container',
        appid: appId,
        scope: 'snsapi_login',
        redirect_uri: encodeURIComponent(redirectUri + '/api/auth/wechat/callback'),
        state: state,
        style: 'black',
        href: 'data:text/css;base64,LmltcG93ZXJCb3ggLnFyY29kZSB7d2lkdGg6IDIwMHB4O30KLmltcG93ZXJCb3ggLnRpdGxlIHtkaXNwbGF5OiBub25lO30KLmltcG93ZXJCb3ggLmluZm8ge3dpZHRoOiAyMDBweDt9Cg==' // 自定义样式，隐藏标题
      });

      setQrcodeLoaded(true);
      console.log('[WeChat QRCode] QR code rendered successfully');
    } catch (error) {
      console.error('[WeChat QRCode] Failed to render:', error);
      setQrcodeLoaded(false);
    }
  };

  if (!isOpen) return null;

  const resetForm = () => {
    setPhone('');
    setPassword('');
    setConfirmPassword('');
    setNickname('');
    setInviteCode('');
    setError('');
  };

  const handleTabSwitch = (tab: 'login' | 'register' | 'wechat') => {
    setActiveTab(tab);
    resetForm();
  };

  const handleWechatLogin = () => {
    // PC端：在当前窗口直接跳转到微信授权页面
    // 移动端：逻辑已在 useEffect 中处理（显示二维码）
    if (!isMobile()) {
      loginWithWechat();
    }
  };

  // 复制链接功能（移动端备用方案）
  const handleCopyLink = () => {
    const redirectUri = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://weopc.com.cn';
    const appId = process.env.NEXT_PUBLIC_WECHAT_APP_ID || 'wxb3330c77aa423d29';
    const state = Math.random().toString(36).substring(7);
    const wechatAuthUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${appId}&redirect_uri=${encodeURIComponent(redirectUri + '/api/auth/wechat/callback')}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`;

    navigator.clipboard.writeText(wechatAuthUrl).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }).catch(() => {
      // 降级方案：创建临时输入框复制
      const textArea = document.createElement('textarea');
      textArea.value = wechatAuthUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length !== 11) {
      setError('请输入正确的手机号');
      return;
    }
    if (!password || password.length < 6) {
      setError('请输入密码（至少6位）');
      return;
    }
    setError('');
    setIsLoading(true);

    const result = await login(phone, password);
    if (!result.success) {
      setError(result.error || '登录失败');
    } else {
      resetForm();
    }
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length !== 11) {
      setError('请输入正确的手机号');
      return;
    }
    if (!password || password.length < 6) {
      setError('密码长度至少为6位');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    setError('');
    setIsLoading(true);

    const result = await register(phone, password, nickname || undefined, inviteCode || undefined);
    if (!result.success) {
      setError(result.error || '注册失败');
    } else {
      resetForm();
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            欢迎加入WeOPC
          </h2>
          <p className="mt-2 text-sm text-gray-500 text-center">
            登录解锁OPC政策红利
          </p>
        </div>

        {/* Tabs */}
        <div className="px-8">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => handleTabSwitch('wechat')}
              className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${
                activeTab === 'wechat' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <WechatIcon className="w-4 h-4" />
                微信登录
              </span>
              {activeTab === 'wechat' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#07C160]" />
              )}
            </button>
            <button
              onClick={() => handleTabSwitch('login')}
              className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${
                activeTab === 'login' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Smartphone className="w-4 h-4" />
                手机号登录
              </span>
              {activeTab === 'login' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
              )}
            </button>
            <button
              onClick={() => handleTabSwitch('register')}
              className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${
                activeTab === 'register' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <UserPlus className="w-4 h-4" />
                注册账号
              </span>
              {activeTab === 'register' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {activeTab === 'wechat' ? (
            <div className="space-y-6">
              {isMobile() ? (
                /* 移动端：显示内嵌二维码 + 使用说明 */
                <div className="space-y-4">
                  {/* 二维码容器 */}
                  <div className="flex flex-col items-center">
                    <div
                      id="wechat-qrcode-container"
                      className="w-full flex items-center justify-center min-h-[240px] bg-gray-50 rounded-xl overflow-hidden"
                    >
                      {!qrcodeLoaded && (
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-8 h-8 text-[#07C160] animate-spin" />
                          <p className="text-sm text-gray-500">加载二维码中...</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 使用说明 */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-xl space-y-3 border border-blue-200">
                    <div className="flex items-start gap-2">
                      <Smartphone className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 mb-2">📱 移动端扫码步骤：</p>
                        <ol className="text-xs text-gray-700 space-y-1.5 list-decimal list-inside">
                          <li><strong>长按</strong>上方二维码保存到相册</li>
                          <li>打开<strong>微信</strong>，点击右上角 <strong>+</strong></li>
                          <li>选择<strong>扫一扫</strong>，点击右上角相册图标</li>
                          <li>选择刚才保存的二维码图片</li>
                          <li>在微信中确认授权登录</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  {/* 备用方案：复制链接 */}
                  <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-200">
                    <p className="text-xs font-medium text-gray-700">或者使用备用方式：</p>
                    <Button
                      onClick={handleCopyLink}
                      variant="outline"
                      className="w-full h-10 text-sm"
                    >
                      {copySuccess ? (
                        <span className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600" />
                          已复制链接
                        </span>
                      ) : (
                        '复制登录链接'
                      )}
                    </Button>
                    <p className="text-xs text-gray-500">
                      复制后在微信中打开该链接完成登录
                    </p>
                  </div>

                  {/* 提示信息 */}
                  <div className="text-center">
                    <p className="text-xs text-gray-400">
                      💡 建议在电脑端访问 <span className="font-mono text-gray-600">weopc.com.cn</span> 获得更好体验
                    </p>
                  </div>
                </div>
              ) : (
                /* PC端：跳转到微信扫码页面 */
                <div className="space-y-6">
                  {/* 微信扫码登录区域 */}
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="w-48 h-48 bg-gradient-to-br from-[#07C160]/10 to-[#07C160]/5 rounded-xl flex items-center justify-center mb-4">
                      <WechatIcon className="w-24 h-24 text-[#07C160]" />
                    </div>

                    <Button
                      onClick={handleWechatLogin}
                      className="w-full h-12 bg-[#07C160] hover:bg-[#06AD56] text-white font-medium"
                    >
                      <span className="flex items-center gap-2">
                        <WechatIcon className="w-5 h-5" />
                        微信扫码登录
                      </span>
                    </Button>

                    <p className="text-sm text-gray-600 text-center mt-4">
                      点击按钮跳转微信扫码授权登录
                    </p>

                    <p className="text-xs text-gray-400 text-center">
                      安全便捷，无需记忆密码
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Phone input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  手机号码
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  placeholder="请输入11位手机号"
                  className="h-12 text-base focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                  maxLength={11}
                />
              </div>

              {/* Password input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密码
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin(e)}
                  placeholder="请输入密码"
                  className="h-12 text-base focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                />
              </div>

              {/* Error message */}
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  '登录'
                )}
              </Button>

              {/* Hint: 后续将升级为验证码登录 */}
              <p className="text-xs text-gray-400 text-center">
                验证码登录即将上线，敬请期待
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              {/* Phone input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  手机号码 *
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  placeholder="请输入11位手机号"
                  className="h-12 text-base focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                  maxLength={11}
                />
              </div>

              {/* Nickname input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  昵称
                </label>
                <Input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="请输入昵称（可选）"
                  className="h-12 text-base focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                />
              </div>

              {/* Password input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密码 *
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码（至少6位）"
                  className="h-12 text-base focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                />
              </div>

              {/* Confirm Password input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  确认密码 *
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="请再次输入密码"
                  className="h-12 text-base focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                />
              </div>

              {/* Invite Code input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  邀请码（可选）
                </label>
                <Input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase().slice(0, 8))}
                  onKeyDown={(e) => e.key === 'Enter' && handleRegister(e)}
                  placeholder="请输入邀请码（选填）"
                  className="h-12 text-base focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 font-mono"
                  maxLength={8}
                />
                <p className="text-xs text-gray-500 mt-1">
                  如果您有朋友的邀请码，可以在此填写
                </p>
              </div>

              {/* Error message */}
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  '注册'
                )}
              </Button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-8">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <Check className="w-3 h-3" />
            <span>登录即表示同意</span>
            <a href="#" className="text-gray-600 hover:text-gray-900 underline">用户协议</a>
            <span>和</span>
            <a href="#" className="text-gray-600 hover:text-gray-900 underline">隐私政策</a>
          </div>
        </div>
      </div>
    </div>
  );
}
