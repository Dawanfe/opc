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
  token: string | null;
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (phone: string, password: string, nickname?: string, inviteCode?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithWechat: () => Promise<void>;
  handleWechatCallback: () => boolean;
  logout: () => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  requireAuth: (callback: () => void) => void;
  isMobile: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 初始化时检查 localStorage 中的 token
  useEffect(() => {
    const storedToken = localStorage.getItem('user_token');
    const storedUser = localStorage.getItem('user_data');

    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setToken(storedToken);
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
        setToken(data.token);
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
    nickname?: string,
    inviteCode?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, nickname, inviteCode }),
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
    setToken(null);
    setIsLoggedIn(false);
  }, []);

  const requireAuth = useCallback((callback: () => void) => {
    if (isLoggedIn) {
      callback();
    } else {
      setShowLoginModal(true);
    }
  }, [isLoggedIn]);

  // 检测是否为移动设备
  const isMobile = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }, []);

  // 微信扫码登录 - PC 和移动端兼容处理
  const loginWithWechat = useCallback(async () => {
    const redirectUri = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://weopc.com.cn';
    const appId = process.env.NEXT_PUBLIC_WECHAT_APP_ID || 'wxb3330c77aa423d29';
    const state = Math.random().toString(36).substring(7);
    const isMobileDevice = isMobile();

    console.log('[WeChat Login] Device:', isMobileDevice ? 'Mobile' : 'PC');
    console.log('[WeChat Login] redirectUri:', redirectUri);
    console.log('[WeChat Login] appId:', appId);

    // PC端和移动端都使用相同的授权URL
    // 区别在于：PC端直接跳转，移动端在LoginModal中内嵌显示二维码
    const wechatAuthUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${appId}&redirect_uri=${encodeURIComponent(redirectUri + '/api/auth/wechat/callback')}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`;

    if (isMobileDevice) {
      // 移动端：不跳转，LoginModal 会检测设备并显示二维码
      console.log('[WeChat Login] Mobile: QR code will be displayed in modal');
      // 注意：实际的二维码显示逻辑在 LoginModal 组件中
      // 这里只是记录日志，真正的跳转由 LoginModal 处理
    } else {
      // PC端：直接跳转到微信扫码页面
      console.log('[WeChat Login] PC: Redirecting to WeChat QR page');
      window.location.href = wechatAuthUrl;
    }
  }, [isMobile]);

  // 处理微信登录回调（页面加载时检查 URL 参数）
  const handleWechatCallback = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;

    const urlParams = new URLSearchParams(window.location.search);
    const wechatLogin = urlParams.get('wechat_login');

    console.log('[WeChat Callback] URL search params:', window.location.search);
    console.log('[WeChat Callback] wechatLogin:', wechatLogin);

    if (wechatLogin === 'success') {
      const token = urlParams.get('token');
      const userStr = urlParams.get('user');

      console.log('[WeChat Callback] token:', token?.substring(0, 20) + '...');
      console.log('[WeChat Callback] userStr:', userStr?.substring(0, 50) + '...');

      if (token && userStr) {
        try {
          const userData = JSON.parse(userStr);
          console.log('[WeChat Callback] userData parsed:', userData);

          localStorage.setItem('user_token', token);
          localStorage.setItem('user_data', JSON.stringify(userData));
          console.log('[WeChat Callback] localStorage updated:', { token, userData });

          setUser(userData);
          setIsLoggedIn(true);
          setShowLoginModal(false);
          console.log('[WeChat Callback] Login successful! isLoggedIn=true');

          // 清理 URL 参数
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
          return true;
        } catch (e) {
          console.error('[WeChat Callback] 解析微信登录用户数据失败:', e);
        }
      } else {
        console.error('[WeChat Callback] Missing token or userStr:', { token: !!token, userStr: !!userStr });
      }
    } else if (wechatLogin === 'error') {
      const message = urlParams.get('message');
      console.error('[WeChat Callback] 微信登录失败:', message);
      // 清理 URL 参数
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    } else if (wechatLogin === 'cancelled') {
      console.log('[WeChat Callback] 用户取消了登录');
      // 用户取消了登录
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    } else {
      console.log('[WeChat Callback] No WeChat login params found');
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
        token,
        login,
        register,
        loginWithWechat,
        handleWechatCallback,
        logout,
        showLoginModal,
        setShowLoginModal,
        requireAuth,
        isMobile,
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
