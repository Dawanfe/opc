'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Users, TrendingUp, Award, Calendar, Search } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { apiUrl } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface OverallStats {
  totalInviters: number;
  totalInvitees: number;
  totalInviteRecords: number;
  activatedRecords: number;
  conversionRate: string;
}

interface DailyStat {
  date: string;
  count: number;
  inviterCount: number;
  inviteeCount: number;
}

interface TopInviter {
  id: number;
  nickname: string;
  phone: string;
  inviteCode: string;
  inviteCount: number;
  firstInviteAt: string;
  lastInviteAt: string;
}

interface InviterListItem {
  id: number;
  nickname: string;
  phone: string;
  inviteCode: string;
  registeredAt: string;
  inviteCount: number;
  firstInviteAt: string;
  lastInviteAt: string;
}

export default function InviteStatsPage() {
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [topInviters, setTopInviters] = useState<TopInviter[]>([]);
  const [inviterList, setInviterList] = useState<InviterListItem[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('inviteCount');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchInviteStats();
  }, [pagination.page, sortBy, startDate, endDate]);

  const fetchInviteStats = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
        sortBy,
      });

      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`${apiUrl}/api/admin/invite-stats?${params}`);
      if (!response.ok) throw new Error('获取数据失败');

      const data = await response.json();
      setOverallStats(data.overallStats);
      setDailyStats(data.dailyStats);
      setTopInviters(data.topInviters);
      setInviterList(data.inviterList);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching invite stats:', error);
      toast.error('获取邀请统计失败');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateShort = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
  };

  return (
    <div className="container mx-auto p-6">
      {/* 顶部导航 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">邀请统计</h1>
        </div>
      </div>

      {isLoading && !overallStats ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      ) : (
        <>
          {/* 总体统计卡片 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总邀请人数</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overallStats?.totalInviters || 0}</div>
                <p className="text-xs text-muted-foreground">累计发起邀请的用户数</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总被邀请人数</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overallStats?.totalInvitees || 0}</div>
                <p className="text-xs text-muted-foreground">通过邀请码注册的用户数</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">邀请记录总数</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overallStats?.totalInviteRecords || 0}</div>
                <p className="text-xs text-muted-foreground">所有邀请关系记录</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">激活率</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overallStats?.conversionRate || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  已激活 {overallStats?.activatedRecords || 0} 条
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 邀请人排行榜 TOP 10 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                邀请人排行榜 TOP 10
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">排名</TableHead>
                    <TableHead>昵称</TableHead>
                    <TableHead>手机号</TableHead>
                    <TableHead>邀请码</TableHead>
                    <TableHead className="text-right">邀请人数</TableHead>
                    <TableHead>首次邀请时间</TableHead>
                    <TableHead>最近邀请时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topInviters.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        暂无数据
                      </TableCell>
                    </TableRow>
                  ) : (
                    topInviters.map((inviter, index) => (
                      <TableRow key={inviter.id}>
                        <TableCell className="font-bold">#{index + 1}</TableCell>
                        <TableCell>{inviter.nickname}</TableCell>
                        <TableCell>{inviter.phone}</TableCell>
                        <TableCell className="font-mono">{inviter.inviteCode}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {inviter.inviteCount}
                        </TableCell>
                        <TableCell>{formatDateShort(inviter.firstInviteAt)}</TableCell>
                        <TableCell>{formatDateShort(inviter.lastInviteAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* 每日统计（最近30天） */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                每日邀请统计（最近30天）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>日期</TableHead>
                      <TableHead className="text-right">新增邀请</TableHead>
                      <TableHead className="text-right">新增邀请人</TableHead>
                      <TableHead className="text-right">新增被邀请人</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailyStats.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          暂无数据
                        </TableCell>
                      </TableRow>
                    ) : (
                      dailyStats.map((stat) => (
                        <TableRow key={stat.date}>
                          <TableCell>{stat.date}</TableCell>
                          <TableCell className="text-right">{stat.count}</TableCell>
                          <TableCell className="text-right">{stat.inviterCount}</TableCell>
                          <TableCell className="text-right">{stat.inviteeCount}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* 邀请人列表 */}
          <Card>
            <CardHeader>
              <CardTitle>邀请人列表</CardTitle>
              <div className="flex gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm">排序方式:</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inviteCount">按邀请人数</SelectItem>
                      <SelectItem value="createdAt">按注册时间</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm">开始日期:</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-[160px]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm">结束日期:</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-[160px]"
                  />
                </div>
                <Button onClick={fetchInviteStats} variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  查询
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>昵称</TableHead>
                    <TableHead>手机号</TableHead>
                    <TableHead>邀请码</TableHead>
                    <TableHead className="text-right">邀请人数</TableHead>
                    <TableHead>注册时间</TableHead>
                    <TableHead>首次邀请</TableHead>
                    <TableHead>最近邀请</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inviterList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        暂无数据
                      </TableCell>
                    </TableRow>
                  ) : (
                    inviterList.map((inviter) => (
                      <TableRow key={inviter.id}>
                        <TableCell>{inviter.nickname}</TableCell>
                        <TableCell>{inviter.phone}</TableCell>
                        <TableCell className="font-mono">{inviter.inviteCode}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {inviter.inviteCount}
                        </TableCell>
                        <TableCell>{formatDateShort(inviter.registeredAt)}</TableCell>
                        <TableCell>{formatDateShort(inviter.firstInviteAt)}</TableCell>
                        <TableCell>{formatDateShort(inviter.lastInviteAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* 分页 */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    共 {pagination.total} 条记录，第 {pagination.page} / {pagination.totalPages} 页
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => handlePageChange(pagination.page - 1)}
                    >
                      上一页
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => handlePageChange(pagination.page + 1)}
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
