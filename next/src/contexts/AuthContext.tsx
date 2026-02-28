"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { apiUrl } from '@/lib/utils';

interface User {
  id: number;
  phone: string;
  nickname?: string;
  avatar?: string;
  membershipType: 'free' | 'pro' | 'enterprise';
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (phone: string, password: string, nickname?: string) => Promise<{ success: boolean; error?: string }>;
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

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        login,
        register,
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
