'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Calendar, Newspaper } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">管理后台</h1>
        <p className="text-muted-foreground">管理OPC社区、活动和新闻数据</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Database className="w-8 h-8 text-primary" />
              <CardTitle>OPC社区管理</CardTitle>
            </div>
            <CardDescription>
              管理全国OPC社区数据，包括地址、政策、联系方式等信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/communities">
              <Button className="w-full">进入管理</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Calendar className="w-8 h-8 text-primary" />
              <CardTitle>活动管理</CardTitle>
            </div>
            <CardDescription>
              管理AI和OPC相关活动，包括会议、培训、沙龙等
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/events">
              <Button className="w-full">进入管理</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Newspaper className="w-8 h-8 text-primary" />
              <CardTitle>新闻管理</CardTitle>
            </div>
            <CardDescription>
              管理行业新闻和动态信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/news">
              <Button className="w-full">进入管理</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10">
        <Card>
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
            <CardDescription>常用管理功能</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Link href="/admin/communities">
                <Button variant="outline">新增社区</Button>
              </Link>
              <Link href="/admin/events">
                <Button variant="outline">新增活动</Button>
              </Link>
              <Link href="/admin/news">
                <Button variant="outline">新增新闻</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
