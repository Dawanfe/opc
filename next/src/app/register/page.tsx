"use client";

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function RegisterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isLoggedIn, setShowLoginModal } = useAuth();
  const inviteCode = searchParams.get('invite');

  useEffect(() => {
    if (isLoggedIn) {
      // 已登录，跳转到首页
      router.push('/');
      return;
    }

    // 打开登录弹窗并切换到注册标签
    setShowLoginModal(true);

    // 如果有邀请码，可以通过全局状态或 localStorage 传递
    if (inviteCode) {
      localStorage.setItem('pendingInviteCode', inviteCode);
    }
  }, [isLoggedIn, inviteCode, router, setShowLoginModal]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-gray-600">正在跳转到注册页面...</p>
        {inviteCode && (
          <p className="text-sm text-gray-500 mt-2">
            邀请码: <span className="font-mono font-bold">{inviteCode}</span>
          </p>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
