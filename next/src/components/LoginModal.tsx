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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register, loginWithWechat } = useAuth();

  if (!isOpen) return null;

  const resetForm = () => {
    setPhone('');
    setPassword('');
    setConfirmPassword('');
    setNickname('');
    setError('');
  };

  const handleTabSwitch = (tab: 'login' | 'register' | 'wechat') => {
    setActiveTab(tab);
    resetForm();
  };

  const handleWechatLogin = () => {
    // 在当前窗口直接跳转到微信授权页面
    loginWithWechat();
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

    const result = await register(phone, password, nickname || undefined);
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
                  onKeyDown={(e) => e.key === 'Enter' && handleRegister(e)}
                  placeholder="请再次输入密码"
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
