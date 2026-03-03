"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { apiUrl } from '@/lib/utils';

interface User {
  id: number;
  phone?: string;
  nickname?: string;
  avatar?: string;
  membershipType: 'free' | 'pro' | 'enterprise';
  wechatOpenId?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (phone: string, password: string, nickname?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithWechat: () => Promise<void>;
  handleWechatCallback: () => boolean;
  logout: () => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  requireAuth: (callback: () => void) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 初始化时检查 localStorage 中的 token
  useEffect(() => {
    const token = localStorage.getItem('user_token');
    const storedUser = localStorage.getItem('user_data');

    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsLoggedIn(true);
      } catch {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_data');
      }
    }
  }, []);

  const login = useCallback(async (phone: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        setUser(data.user);
        setIsLoggedIn(true);
        setShowLoginModal(false);
        return { success: true };
      } else {
        return { success: false, error: data.error || '登录失败' };
      }
    } catch {
      return { success: false, error: '网络错误，请稍后重试' };
    }
  }, []);

  const register = useCallback(async (
    phone: string,
    password: string,
    nickname?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, nickname }),
      });

      const data = await response.json();

      if (response.ok) {
        // 注册成功后自动登录
        const loginResult = await login(phone, password);
        return loginResult;
      } else {
        return { success: false, error: data.error || '注册失败' };
      }
    } catch {
      return { success: false, error: '网络错误，请稍后重试' };
    }
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  const requireAuth = useCallback((callback: () => void) => {
    if (isLoggedIn) {
      callback();
    } else {
      setShowLoginModal(true);
    }
  }, [isLoggedIn]);

  // 微信扫码登录 - 跳转到微信授权页面
  const loginWithWechat = useCallback(async () => {
    try {
      const response = await fetch(apiUrl('/api/auth/wechat/qrcode'));
      const data = await response.json();

      if (data.success && data.data.qrcodeUrl) {
        // 跳转到微信授权页面
        window.location.href = data.data.qrcodeUrl;
      } else {
        console.error('获取微信登录二维码失败:', data.error);
      }
    } catch (error) {
      console.error('微信登录请求失败:', error);
    }
  }, []);

  // 处理微信登录回调（页面加载时检查 URL 参数）
  const handleWechatCallback = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;

    const urlParams = new URLSearchParams(window.location.search);
    const wechatLogin = urlParams.get('wechat_login');

    if (wechatLogin === 'success') {
      const token = urlParams.get('token');
      const userStr = urlParams.get('user');

      if (token && userStr) {
        try {
          const userData = JSON.parse(userStr);
          localStorage.setItem('user_token', token);
          localStorage.setItem('user_data', JSON.stringify(userData));
          setUser(userData);
          setIsLoggedIn(true);
          setShowLoginModal(false);

          // 清理 URL 参数
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
          return true;
        } catch (e) {
          console.error('解析微信登录用户数据失败:', e);
        }
      }
    } else if (wechatLogin === 'error') {
      const message = urlParams.get('message');
      console.error('微信登录失败:', message);
      // 清理 URL 参数
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    } else if (wechatLogin === 'cancelled') {
      // 用户取消了登录
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    }

    return false;
  }, []);

  // 检查微信登录回调
  useEffect(() => {
    handleWechatCallback();
  }, [handleWechatCallback]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        login,
        register,
        loginWithWechat,
        handleWechatCallback,
        logout,
        showLoginModal,
        setShowLoginModal,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
