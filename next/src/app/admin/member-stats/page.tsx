'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Users, TrendingUp, Eye, Upload, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { apiUrl } from '@/lib/utils';
import { useRef } from 'react';
import { Input } from '@/components/ui/input';

interface DailyStat {
  date: string;
  realNew: number;
  displayIncrement: number;
}

interface RecentUser {
  id: number;
  phone: string;
  nickname: string;
  membershipType: string;
  createdAt: string;
  displayIncrement: number;
}

export default function MemberStatsPage() {
  const [realTotal, setRealTotal] = useState(0);
  const [displayTotal, setDisplayTotal] = useState(0);
  const [baseCount, setBaseCount] = useState(5000);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [groupQrUrl, setGroupQrUrl] = useState('');
  const [wechatQrUrl, setWechatQrUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingGroup, setUploadingGroup] = useState(false);
  const [uploadingWechat, setUploadingWechat] = useState(false);
  const [editingBaseCount, setEditingBaseCount] = useState(false);
  const [baseCountInput, setBaseCountInput] = useState('5000');
  const [savingBaseCount, setSavingBaseCount] = useState(false);
  const groupFileRef = useRef<HTMLInputElement>(null);
  const wechatFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchStats();
    fetchQrSettings();
  }, []);

  // 当 baseCount 更新时，同步到输入框
  useEffect(() => {
    setBaseCountInput(baseCount.toString());
  }, [baseCount]);

  const fetchStats = async () => {
    try {
      const res = await fetch(apiUrl('/api/admin/member-stats'));
      const data = await res.json();
      setRealTotal(data.realTotal);
      setDisplayTotal(data.displayTotal);
      setBaseCount(data.baseCount);
      setDailyStats(data.dailyStats || []);
      setRecentUsers(data.recentUsers || []);
    } catch {
      toast.error('获取统计数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQrSettings = async () => {
    try {
      const res = await fetch(apiUrl('/api/admin/settings?keys=group_qr_url,wechat_qr_url'));
      const data = await res.json();
      data.forEach((item: any) => {
        if (item.key === 'group_qr_url') setGroupQrUrl(item.value || '');
        if (item.key === 'wechat_qr_url') setWechatQrUrl(item.value || '');
      });
    } catch {}
  };

  const handleUploadQr = async (file: File, settingKey: string, setUrl: (url: string) => void, setUploading: (v: boolean) => void) => {
    setUploading(true);
    try {
      // Upload file
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch(apiUrl('/api/upload'), {
        method: 'POST',
        body: formData,
      });
      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        toast.error(err.error || '上传失败');
        return;
      }
      const { url } = await uploadRes.json();

      // Save URL to settings
      const saveRes = await fetch(apiUrl('/api/admin/settings'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: settingKey, value: apiUrl(url) }),
      });
      if (saveRes.ok) {
        setUrl(apiUrl(url));
        toast.success('上传成功');
      } else {
        toast.error('保存失败');
      }
    } catch {
      toast.error('上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveBaseCount = async () => {
    const newBaseCount = parseInt(baseCountInput);
    if (isNaN(newBaseCount) || newBaseCount < 0) {
      toast.error('请输入有效的基数');
      return;
    }

    setSavingBaseCount(true);
    try {
      const res = await fetch(apiUrl('/api/admin/member-stats'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseCount: newBaseCount }),
      });

      if (res.ok) {
        setBaseCount(newBaseCount);
        setEditingBaseCount(false);
        toast.success('基数已更新');
        fetchStats(); // 重新获取统计数据
      } else {
        toast.error('更新失败');
      }
    } catch {
      toast.error('更新失败');
    } finally {
      setSavingBaseCount(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center space-x-4 mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">会员数据统计</h1>
          <p className="text-muted-foreground">查看真实数据和对外展示数据</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <CardTitle className="text-sm font-medium text-muted-foreground">真实注册用户</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{realTotal}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-pink-500" />
                <CardTitle className="text-sm font-medium text-muted-foreground">对外展示数</CardTitle>
              </div>
              {!editingBaseCount ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingBaseCount(true)}
                >
                  修改基数
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={baseCountInput}
                    onChange={(e) => setBaseCountInput(e.target.value)}
                    className="w-32 h-8 text-sm"
                    disabled={savingBaseCount}
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveBaseCount}
                    disabled={savingBaseCount}
                  >
                    {savingBaseCount ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingBaseCount(false);
                      setBaseCountInput(baseCount.toString());
                    }}
                    disabled={savingBaseCount}
                  >
                    取消
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-pink-500">{displayTotal.toLocaleString()}+</div>
            <p className="text-xs text-muted-foreground mt-1">基数 {baseCount.toLocaleString()} + 随机增量</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <CardTitle className="text-sm font-medium text-muted-foreground">平均放大倍数</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {realTotal > 0 ? (displayTotal / realTotal).toFixed(1) : '-'}x
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Code Management */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>二维码管理</CardTitle>
          <p className="text-sm text-muted-foreground">上传群二维码和微信二维码图片（建议每2周更新一次）</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>群二维码</Label>
              <input
                ref={groupFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadQr(file, 'group_qr_url', setGroupQrUrl, setUploadingGroup);
                  e.target.value = '';
                }}
              />
              <div
                onClick={() => groupFileRef.current?.click()}
                className="w-40 h-40 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-400 cursor-pointer flex items-center justify-center overflow-hidden transition-colors"
              >
                {uploadingGroup ? (
                  <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                ) : groupQrUrl ? (
                  <img src={groupQrUrl} alt="群二维码" className="w-full h-full object-contain p-1" />
                ) : (
                  <div className="text-center">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                    <span className="text-xs text-gray-400">点击上传</span>
                  </div>
                )}
              </div>
              {groupQrUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => groupFileRef.current?.click()}
                  disabled={uploadingGroup}
                >
                  {uploadingGroup ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />上传中...</> : '重新上传'}
                </Button>
              )}
            </div>
            <div className="space-y-3">
              <Label>微信二维码</Label>
              <input
                ref={wechatFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadQr(file, 'wechat_qr_url', setWechatQrUrl, setUploadingWechat);
                  e.target.value = '';
                }}
              />
              <div
                onClick={() => wechatFileRef.current?.click()}
                className="w-40 h-40 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-400 cursor-pointer flex items-center justify-center overflow-hidden transition-colors"
              >
                {uploadingWechat ? (
                  <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                ) : wechatQrUrl ? (
                  <img src={wechatQrUrl} alt="微信二维码" className="w-full h-full object-contain p-1" />
                ) : (
                  <div className="text-center">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                    <span className="text-xs text-gray-400">点击上传</span>
                  </div>
                )}
              </div>
              {wechatQrUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => wechatFileRef.current?.click()}
                  disabled={uploadingWechat}
                >
                  {uploadingWechat ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />上传中...</> : '重新上传'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Stats */}
      {dailyStats.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>每日新增统计（近30天）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日期</TableHead>
                    <TableHead>真实新增</TableHead>
                    <TableHead>展示增量</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailyStats.map((stat) => (
                    <TableRow key={stat.date}>
                      <TableCell>{stat.date}</TableCell>
                      <TableCell>{stat.realNew}</TableCell>
                      <TableCell>{Math.floor(stat.displayIncrement)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle>最近注册用户</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>手机号</TableHead>
                  <TableHead>昵称</TableHead>
                  <TableHead>会员类型</TableHead>
                  <TableHead>注册时间</TableHead>
                  <TableHead>展示增量</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  recentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>{user.nickname || '-'}</TableCell>
                      <TableCell>{user.membershipType === 'free' ? '免费版' : user.membershipType}</TableCell>
                      <TableCell>{user.createdAt}</TableCell>
                      <TableCell>{Math.floor(user.displayIncrement)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
