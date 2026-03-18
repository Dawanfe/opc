"use client";

export default function OpenClawPage() {
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://weopc.com.cn';
  const iframeUrl = `${frontendUrl}/openclaw/`;

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
