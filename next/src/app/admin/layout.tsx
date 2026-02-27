'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdminLoggedIn, adminLogout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // 如果在登录页,不需要检查
    if (pathname === '/admin/login') {
      setIsChecking(false);
      return;
    }

    // 检查登录状态
    const checkAuth = () => {
      if (!isAdminLoggedIn) {
        router.push('/admin/login');
      } else {
        setIsChecking(false);
      }
    };

    // 延迟检查,避免闪烁
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [isAdminLoggedIn, router, pathname]);

  // 登录页面直接渲染
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // 检查登录状态时显示加载
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  // 已登录,显示页面
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#111827] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">OPC</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">管理后台</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={adminLogout}
            className="text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-4 h-4 mr-2" />
            退出登录
          </Button>
        </div>
      </header>
      {children}
    </div>
  );
}
