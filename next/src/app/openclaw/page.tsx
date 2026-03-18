"use client";

export default function OpenClawPage() {
  // 生产环境使用同域路径，开发环境使用本地代理
  const isDev = process.env.NODE_ENV === 'development';
  const iframeUrl = isDev ? '/openclaw-embed' : `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://weopc.com.cn'}/openclaw/`;

  return (
    <div className="w-full h-full">
      <iframe
        src={iframeUrl}
        className="w-full h-full border-0"
        title="OpenClaw学习中心"
      />
    </div>
  );
}
