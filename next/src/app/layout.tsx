import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import AppShell from "@/components/AppShell";
import { Toaster } from "sonner";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const metadata: Metadata = {
  title: {
    default: "WeOPC - 全国一站式OPC服务平台",
    template: "%s | WeOPC",
  },
  description: "连接全国OPC社区资源，为AI时代的超级个体提供政策、工位、算力、投资一站式解决方案。覆盖全国39个OPC社区，提供免费工位、算力补贴、项目投资、AI活动、需求对接等服务。",
  keywords: ["OPC", "超级个体", "AI创业", "免费工位", "算力补贴", "项目投资", "AI活动", "创业政策", "需求广场", "AI新闻"],
  authors: [{ name: "WeOPC Team" }],
  creator: "WeOPC",
  publisher: "WeOPC",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: `${basePath}/ico.png`,
    apple: `${basePath}/ico.png`,
  },
  manifest: `${basePath}/manifest.json`,
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://weopc.com.cn',
    siteName: 'WeOPC',
    title: 'WeOPC - 全国一站式OPC服务平台',
    description: '连接全国OPC社区资源，为AI时代的超级个体提供政策、工位、算力、投资一站式解决方案',
    images: [
      {
        url: 'https://weopc.com.cn/logo.png',
        width: 430,
        height: 105,
        alt: 'WeOPC Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WeOPC - 全国一站式OPC服务平台',
    description: '连接全国OPC社区资源，为AI时代的超级个体提供政策、工位、算力、投资一站式解决方案',
    images: ['https://weopc.com.cn/logo.png'],
  },
  alternates: {
    canonical: 'https://weopc.com.cn',
  },
  verification: {
    // 添加你的验证码（需要在 Google Search Console 获取）
    google: 'your-google-verification-code',
    // baidu: 'your-baidu-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <AdminAuthProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
            <Toaster position="top-center" richColors />
          </AuthProvider>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
