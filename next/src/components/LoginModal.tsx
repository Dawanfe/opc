"use client";

import { useState } from 'react';
import { X, Smartphone, Lock, Check, Loader2, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();

  if (!isOpen) return null;

  const resetForm = () => {
    setPhone('');
    setPassword('');
    setConfirmPassword('');
    setNickname('');
    setError('');
  };

  const handleTabSwitch = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    resetForm();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
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
          {activeTab === 'login' ? (
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
