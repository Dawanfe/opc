'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AdminAuthContextType {
  isAdminLoggedIn: boolean;
  adminLogin: (username: string, password: string) => boolean;
  adminLogout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// 默认管理员账号 (生产环境应该使用数据库存储)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
};

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 检查是否已登录
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken) {
      setIsAdminLoggedIn(true);
    } else if (pathname?.startsWith('/admin') && pathname !== '/admin/login') {
      // 如果在管理页面但未登录,重定向到登录页
      router.push('/admin/login');
    }
  }, [pathname, router]);

  const adminLogin = (username: string, password: string): boolean => {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      const token = btoa(`${username}:${Date.now()}`);
      localStorage.setItem('admin_token', token);
      setIsAdminLoggedIn(true);
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAdminLoggedIn(false);
    router.push('/admin/login');
  };

  return (
    <AdminAuthContext.Provider value={{ isAdminLoggedIn, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
