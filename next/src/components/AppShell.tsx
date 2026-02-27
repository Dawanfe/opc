"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import AppSidebar, { MobileHeader } from './AppSidebar';
import LoginModal from './LoginModal';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  // 如果是管理后台页面,不显示导航
  const isAdminPage = pathname?.startsWith('/admin');

  if (isAdminPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header */}
      <MobileHeader onMenuClick={() => setIsMobileSidebarOpen(true)} />

      {/* Layout */}
      <div className="flex">
        {/* Sidebar */}
        <AppSidebar
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 min-h-screen lg:ml-0">
          {/* Mobile padding for header */}
          <div className="pt-14 lg:pt-0">
            <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Login Modal */}
      <LoginModal />
    </div>
  );
}
