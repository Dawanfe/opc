"use client";

import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Calendar,
  Newspaper,
  UserCircle,
  Menu,
  X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiUrl } from '@/lib/utils';

interface AppSidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const navItems = [
  { id: 'dashboard', label: '首页概览', icon: LayoutDashboard, href: '/' },
  { id: 'policy', label: '优惠政策与免费工位', icon: Building2, href: '/policy' },
  { id: 'marketplace', label: '需求广场', icon: Briefcase, href: '/marketplace' },
  { id: 'events', label: 'AI热门活动', icon: Calendar, href: '/events' },
  { id: 'news', label: '每日AI新闻', icon: Newspaper, href: '/news' },
  { id: 'profile', label: '会员中心', icon: UserCircle, href: '/profile' },
];

export default function AppSidebar({ isMobileOpen, onMobileClose }: AppSidebarProps) {
  const pathname = usePathname();
  const { isLoggedIn, user, setShowLoginModal, logout } = useAuth();

  const getActiveId = () => {
    if (pathname === '/') return 'dashboard';
    return pathname.slice(1) || 'dashboard';
  };
  const activeSection = getActiveId();

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50
          w-[260px] h-screen bg-white border-r border-gray-100
          flex flex-col
          transition-transform duration-200 ease-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
          <img src={apiUrl("/logo.png")} alt="WeOPC" className="w-[128px] object-contain" />
          <button
            onClick={onMobileClose}
            className="lg:hidden ml-auto p-1.5 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onMobileClose}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                  ${isActive
                    ? 'bg-gray-100 text-[#111827]'
                    : 'text-[#6B7280] hover:bg-gray-50 hover:text-[#111827]'
                  }
                `}
              >
                <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-[#111827]' : 'text-[#9CA3AF]'}`} />
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-[3px] h-[3px] rounded-full bg-[#3B82F6]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-100">
          {isLoggedIn && user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-3 py-2.5">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.nickname || ''} className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#111827] truncate">{user.nickname || `用户${user.phone?.slice(-4)}`}</p>
                  <p className="text-xs text-[#9CA3AF] truncate">
                    {user.membershipType === 'pro' ? '专业版会员' : user.membershipType === 'enterprise' ? '企业版会员' : '免费版'}
                  </p>
                </div>
                <div className="w-[3px] h-[3px] rounded-full bg-[#22C55E]" />
              </div>
              <button
                onClick={logout}
                className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                退出登录
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => setShowLoginModal(true)}
                className="w-full h-10 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors"
              >
                登录
              </button>
              <button
                onClick={() => setShowLoginModal(true)}
                className="w-full h-10 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                注册会员
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

// Mobile Header
export function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-100 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <img src={apiUrl("/logo.png")} alt="WeOPC" className="w-[128px] object-contain" />
          </div>
        <button
          onClick={onMenuClick}
          className="p-2 text-gray-600 hover:text-gray-900"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
