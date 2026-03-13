"use client";

import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Calendar,
  Newspaper,
  UserCircle,
  Menu,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiUrl } from '@/lib/utils';

interface AppSidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const staticNavItems = [
  { id: 'dashboard', label: '首页概览', icon: LayoutDashboard, href: '/', sortOrder: 0 },
  { id: 'policy', label: '优惠政策与免费工位', icon: Building2, href: '/policy', sortOrder: 1 },
  { id: 'marketplace', label: '需求广场', icon: Briefcase, href: '/marketplace', sortOrder: 3 },
  { id: 'events', label: 'AI热门活动', icon: Calendar, href: '/events', sortOrder: 4 },
  { id: 'news', label: '每日AI新闻', icon: Newspaper, href: '/news', sortOrder: 5 },
  { id: 'profile', label: '会员中心', icon: UserCircle, href: '/profile', sortOrder: 6 },
];

export default function AppSidebar({ isMobileOpen, onMobileClose }: AppSidebarProps) {
  const pathname = usePathname();
  const { isLoggedIn, user, setShowLoginModal, logout } = useAuth();
  const [navItems, setNavItems] = useState<any[]>(staticNavItems);

  useEffect(() => {
    // 获取外部链接
    fetch(apiUrl('/api/external-links'))
      .then(res => res.json())
      .then((data) => {
        const externalItems = data
          .filter((link: any) => link.position === 'sidebar' || link.position === 'both')
          .map((link: any) => ({
            id: link.key,
            label: link.label,
            icon: link.icon,
            iconImage: link.iconImage,
            href: link.url,
            external: true,
            hot: link.hot || false,
            sortOrder: link.sortOrder,
          }));

        // 合并静态和外部链接，并排序
        const allItems = [...staticNavItems, ...externalItems].sort((a, b) => a.sortOrder - b.sortOrder);
        setNavItems(allItems);
      })
      .catch(() => {
        // 出错时使用静态配置
        setNavItems(staticNavItems);
      });
  }, []);

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

            // 外部链接
            if (item.external) {
              return (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onMobileClose}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-[#6B7280] hover:bg-gray-50 hover:text-[#111827] relative"
                >
                  {item.iconImage ? (
                    <img src={apiUrl(item.iconImage)} alt="" className="w-[22px] h-[22px]" />
                  ) : (
                    Icon && <Icon className="w-[18px] h-[18px] text-[#9CA3AF]" />
                  )}
                  <span>{item.label}</span>
                  {item.hot && (
                    <img src={apiUrl('/hot.png')} alt="HOT" className="ml-auto h-6" />
                  )}
                </a>
              );
            }

            // 内部链接
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
                {item.iconImage ? (
                  <img src={apiUrl(item.iconImage)} alt="" className="w-[18px] h-[18px]" />
                ) : (
                  Icon && <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-[#111827]' : 'text-[#9CA3AF]'}`} />
                )}
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
                <Link href="/profile" onClick={onMobileClose} className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#111827] truncate hover:text-[#3B82F6] transition-colors">{user.nickname || `用户${user.phone?.slice(-4)}`}</p>
                  <p className="text-xs text-[#9CA3AF] truncate">
                    {user.membershipType === 'pro' ? '专业版会员' : user.membershipType === 'enterprise' ? '企业版会员' : '免费版'}
                  </p>
                </Link>
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
