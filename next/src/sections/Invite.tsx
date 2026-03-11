"use client";

import { useState, useEffect } from 'react';
import { Copy, Users, CheckCircle, Gift, Calendar, UserPlus, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiUrl } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface InviteInfo {
  user: {
    id: number;
    nickname: string;
    phone: string;
    inviteCode: string;
  };
  inviter: {
    id: number;
    nickname: string;
    phone: string;
  } | null;
  stats: {
    totalInvites: number;
    activatedInvites: number;
  };
  inviteList: {
    id: number;
    inviteeId: number;
    inviteCode: string;
    status: string;
    createdAt: string;
    activatedAt: string;
    inviteeName: string;
    inviteePhone: string;
  }[];
}

export default function InvitePage() {
  const { isLoggedIn, user, setShowLoginModal, token } = useAuth();
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isLoggedIn && token) {
      fetchInviteInfo();
    } else {
      setIsLoading(false);
    }
  }, [isLoggedIn, token]);

  const fetchInviteInfo = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(apiUrl('/api/user/invite-info'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('获取邀请信息失败');
      }

      const data = await response.json();
      setInviteInfo(data);
    } catch (error) {
      console.error('Error fetching invite info:', error);
      toast.error('获取邀请信息失败');
    } finally {
      setIsLoading(false);
    }
  };

  const generateInviteCode = async () => {
    if (!token) return;

    try {
      setIsGenerating(true);
      const response = await fetch(apiUrl('/api/user/generate-invite-code'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || '生成邀请码失败');
        return;
      }

      toast.success('邀请码生成成功！');
      // 刷新邀请信息
      fetchInviteInfo();
    } catch (error) {
      console.error('Error generating invite code:', error);
      toast.error('生成邀请码失败');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyInviteCode = () => {
    if (!inviteInfo?.user.inviteCode) return;

    // 尝试使用现代 API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(inviteInfo.user.inviteCode).then(() => {
        toast.success('邀请码已复制到剪贴板');
      }).catch(() => {
        fallbackCopyTextToClipboard(inviteInfo.user.inviteCode);
      });
    } else {
      // 降级方案
      fallbackCopyTextToClipboard(inviteInfo.user.inviteCode);
    }
  };

  const copyInviteLink = () => {
    if (!inviteInfo?.user.inviteCode) return;

    const inviteLink = `${window.location.origin}/register?invite=${inviteInfo.user.inviteCode}`;

    // 尝试使用现代 API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(inviteLink).then(() => {
        toast.success('邀请链接已复制到剪贴板');
      }).catch(() => {
        fallbackCopyTextToClipboard(inviteLink);
      });
    } else {
      // 降级方案
      fallbackCopyTextToClipboard(inviteLink);
    }
  };

  // 降级复制方案
  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        toast.success('已复制到剪贴板');
      } else {
        toast.error('复制失败，请手动复制');
      }
    } catch (err) {
      toast.error('复制失败，请手动复制');
    }

    document.body.removeChild(textArea);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 未登录状态
  if (!isLoggedIn) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-display mb-1">我的邀请</h1>
          <p className="text-body">邀请好友加入WeOPC，共同成长</p>
        </div>

        <div className="opc-card bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
          <div className="max-w-md">
            <h2 className="text-2xl font-bold mb-4">邀请好友，共享权益</h2>
            <p className="text-gray-300 mb-6">
              登录后即可获得专属邀请码，邀请好友注册后可查看邀请记录和统计数据
            </p>
            <Button
              onClick={() => setShowLoginModal(true)}
              className="bg-white text-gray-900 hover:bg-gray-100"
            >
              立即登录
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 加载中状态
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-display mb-1">我的邀请</h1>
          <p className="text-body">加载中...</p>
        </div>
      </div>
    );
  }

  // 已登录状态
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-display mb-1">我的邀请</h1>
        <p className="text-body">邀请好友加入WeOPC，共同成长</p>
      </div>

      {/* 邀请码卡片 */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            我的邀请码
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">您的专属邀请码</p>
                {inviteInfo?.user.inviteCode ? (
                  <p className="text-3xl font-bold font-mono tracking-wider">
                    {inviteInfo.user.inviteCode}
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-gray-500">您还没有邀请码</p>
                    <Button
                      onClick={generateInviteCode}
                      disabled={isGenerating}
                      size="sm"
                      variant="outline"
                      className="w-fit"
                    >
                      {isGenerating ? '生成中...' : '立即生成邀请码'}
                    </Button>
                  </div>
                )}
              </div>
              {inviteInfo?.user.inviteCode && (
                <Button onClick={copyInviteCode} variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  复制邀请码
                </Button>
              )}
            </div>

            {inviteInfo?.user.inviteCode && (
              <div className="flex gap-2">
                <Button onClick={copyInviteLink} className="flex-1">
                  <UserPlus className="h-4 w-4 mr-2" />
                  复制邀请链接
                </Button>
              </div>
            )}

            {inviteInfo?.inviter && (
              <div className="text-sm text-muted-foreground">
                <p>
                  您是由 <span className="font-semibold">{inviteInfo.inviter.nickname}</span> 邀请加入的
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 统计数据 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总邀请人数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inviteInfo?.stats.totalInvites || 0}</div>
            <p className="text-xs text-muted-foreground">累计邀请的好友数量</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已激活</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inviteInfo?.stats.activatedInvites || 0}</div>
            <p className="text-xs text-muted-foreground">已成功注册的好友数量</p>
          </CardContent>
        </Card>
      </div>

      {/* 邀请记录列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            邀请记录（最近20条）
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!inviteInfo?.inviteList || inviteInfo.inviteList.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">还没有邀请记录</p>
              <p className="text-sm text-muted-foreground mt-2">
                分享您的邀请码给好友，邀请他们加入WeOPC
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>好友昵称</TableHead>
                    <TableHead>手机号</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>注册时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inviteInfo.inviteList.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.inviteeName || '-'}</TableCell>
                      <TableCell>{record.inviteePhone || '-'}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            record.status === 'activated'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {record.status === 'activated' ? (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              已激活
                            </>
                          ) : (
                            <>
                              <Calendar className="h-3 w-3" />
                              待激活
                            </>
                          )}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(record.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 邀请说明 */}
      <Card>
        <CardHeader>
          <CardTitle>如何邀请好友</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div>
              <p className="font-medium">复制邀请码或链接</p>
              <p className="text-sm text-muted-foreground">点击上方按钮复制您的专属邀请码或邀请链接</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div>
              <p className="font-medium">分享给好友</p>
              <p className="text-sm text-muted-foreground">
                将邀请码或链接分享给您的好友，邀请他们注册WeOPC
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
              3
            </div>
            <div>
              <p className="font-medium">查看邀请记录</p>
              <p className="text-sm text-muted-foreground">
                好友注册成功后，您可以在邀请记录中查看详情
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
