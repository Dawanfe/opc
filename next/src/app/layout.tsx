import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import AppShell from "@/components/AppShell";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "WeOPC - 全国一站式OPC服务平台",
  description: "连接全国OPC社区资源，为AI时代的超级个体提供政策、工位、算力、投资一站式解决方案",
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
