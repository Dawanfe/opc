'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { apiUrl } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Pencil, Trash2, ArrowLeft, ChevronLeft, ChevronRight, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { DEMANDS_TEMPLATE } from '@/lib/excelTemplate';
import BatchImport from '@/components/BatchImport';

interface Demand {
  id?: number;
  title: string;
  category: string;
  budget: string;
  deadline: string;
  description: string;
  requirements: string;
  postedBy: string;
  postedAt: string;
  contact: string;
  status: string;
  auditStatus: string;
  rejectReason: string;
}

type AuditFilter = 'all' | 'pending' | 'approved' | 'rejected';

export default function DemandsPage() {
  const [demands, setDemands] = useState<Demand[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAuditDialogOpen, setIsAuditDialogOpen] = useState(false);
  const [currentDemand, setCurrentDemand] = useState<Demand | null>(null);
  const [auditTarget, setAuditTarget] = useState<Demand | null>(null);
  const [auditAction, setAuditAction] = useState<'approved' | 'rejected'>('approved');
  const [rejectReason, setRejectReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [auditFilter, setAuditFilter] = useState<AuditFilter>('all');
  const itemsPerPage = 10;

  const emptyForm: Demand = {
    title: '',
    category: '',
    budget: '',
    deadline: '',
    description: '',
    requirements: '',
    postedBy: '',
    postedAt: '',
    contact: '',
    status: 'open',
    auditStatus: 'approved',
    rejectReason: '',
  };

  useEffect(() => {
    fetchDemands();
  }, []);

  const fetchDemands = async () => {
    try {
      const res = await fetch(apiUrl('/api/admin/demands'));
      const data = await res.json();
      setDemands(data);
    } catch (error) {
      toast.error('获取数据失败');
    }
  };

  const handleAdd = () => {
    setCurrentDemand(emptyForm);
    setIsDialogOpen(true);
  };

  const handleEdit = (demand: Demand) => {
    setCurrentDemand(demand);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!currentDemand) return;

    setIsLoading(true);
    try {
      const method = currentDemand.id ? 'PUT' : 'POST';
      const res = await fetch(apiUrl('/api/admin/demands'), {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentDemand),
      });

      if (res.ok) {
        toast.success(currentDemand.id ? '更新成功' : '添加成功');
        setIsDialogOpen(false);
        fetchDemands();
        setCurrentDemand(null);
      } else {
        toast.error('操作失败');
      }
    } catch (error) {
      toast.error('操作失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(apiUrl(`/api/admin/demands?id=${id}`), {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('删除成功');
        fetchDemands();
      } else {
        toast.error('删除失败');
      }
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;

    try {
      const res = await fetch(apiUrl(`/api/admin/demands?ids=${selectedIds.join(',')}`), {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success(`成功删除 ${selectedIds.length} 条记录`);
        setSelectedIds([]);
        setIsDeleteDialogOpen(false);
        fetchDemands();
      } else {
        toast.error('删除失败');
      }
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const handleAuditOpen = (demand: Demand) => {
    setAuditTarget(demand);
    setAuditAction('approved');
    setRejectReason('');
    setIsAuditDialogOpen(true);
  };

  const handleAuditSubmit = async () => {
    if (!auditTarget) return;

    if (auditAction === 'rejected' && !rejectReason.trim()) {
      toast.error('请填写驳回原因');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(apiUrl('/api/admin/demands/audit'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: auditTarget.id,
          auditStatus: auditAction,
          rejectReason: auditAction === 'rejected' ? rejectReason : undefined,
        }),
      });

      if (res.ok) {
        toast.success(auditAction === 'approved' ? '审核通过' : '已驳回');
        setIsAuditDialogOpen(false);
        setAuditTarget(null);
        fetchDemands();
      } else {
        toast.error('审核操作失败');
      }
    } catch (error) {
      toast.error('审核操作失败');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedDemands.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedDemands.map((d) => d.id!));
    }
  };

  // 按审核状态筛选
  const filteredDemands = auditFilter === 'all'
    ? demands
    : demands.filter(d => d.auditStatus === auditFilter);

  // 分页计算
  const totalPages = Math.ceil(filteredDemands.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDemands = filteredDemands.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    setSelectedIds([]);
  };

  const handleFilterChange = (filter: AuditFilter) => {
    setAuditFilter(filter);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const getAuditStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">待审核</span>;
      case 'approved':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">已通过</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">已拒绝</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const getCategoryLabel = (category: string) => {
    const map: Record<string, string> = {
      'ai-comic': 'AI漫剧制作',
      'video-edit': '视频剪辑',
      'ai-dev': 'AI技术开发',
      'other': '其他',
    };
    return map[category] || category || '-';
  };

  const auditFilterTabs: { key: AuditFilter; label: string; count: number }[] = [
    { key: 'all', label: '全部', count: demands.length },
    { key: 'pending', label: '待审核', count: demands.filter(d => d.auditStatus === 'pending').length },
    { key: 'approved', label: '已通过', count: demands.filter(d => d.auditStatus === 'approved').length },
    { key: 'rejected', label: '已拒绝', count: demands.filter(d => d.auditStatus === 'rejected').length },
  ];

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">需求广场管理</h1>
            <p className="text-muted-foreground">
              共 {filteredDemands.length} 条记录 | 第 {currentPage}/{totalPages || 1} 页
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <BatchImport
            templateType="demands"
            existingData={demands}
            uniqueKey={DEMANDS_TEMPLATE.uniqueKey}
            onImportSuccess={fetchDemands}
            apiEndpoint="/api/admin/demands"
            previewColumns={[
              { key: 'title', label: '标题' },
              { key: 'category', label: '分类' },
              { key: 'budget', label: '预算' },
              { key: 'postedBy', label: '发布者' },
            ]}
          />
          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              批量删除 ({selectedIds.length})
            </Button>
          )}
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            新增需求
          </Button>
        </div>
      </div>

      {/* 审核状态筛选标签 */}
      <div className="flex items-center space-x-2 mb-4">
        {auditFilterTabs.map((tab) => (
          <Button
            key={tab.key}
            variant={auditFilter === tab.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange(tab.key)}
          >
            {tab.label} ({tab.count})
          </Button>
        ))}
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === paginatedDemands.length && paginatedDemands.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>标题</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>预算</TableHead>
              <TableHead>截止日期</TableHead>
              <TableHead>发布者</TableHead>
              <TableHead>审核状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDemands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              paginatedDemands.map((demand) => (
                <TableRow key={demand.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(demand.id!)}
                      onCheckedChange={() => toggleSelect(demand.id!)}
                    />
                  </TableCell>
                  <TableCell>{demand.id}</TableCell>
                  <TableCell className="font-medium max-w-xs truncate">{demand.title}</TableCell>
                  <TableCell>{getCategoryLabel(demand.category)}</TableCell>
                  <TableCell>{demand.budget || '-'}</TableCell>
                  <TableCell>{demand.deadline || '-'}</TableCell>
                  <TableCell>{demand.postedBy || '-'}</TableCell>
                  <TableCell>{getAuditStatusBadge(demand.auditStatus)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      {demand.auditStatus === 'pending' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleAuditOpen(demand)}
                          title="审核"
                        >
                          <ClipboardCheck className="w-4 h-4 text-blue-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(demand)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(demand.id!)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分页控件 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            显示第 {startIndex + 1} - {Math.min(endIndex, filteredDemands.length)} 条，共 {filteredDemands.length} 条
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              上一页
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => goToPage(page)}
                      className="w-10"
                    >
                      {page}
                    </Button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="px-2">...</span>;
                }
                return null;
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              下一页
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* 编辑/新增对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentDemand?.id ? '编辑需求' : '新增需求'}</DialogTitle>
            <DialogDescription>填写需求信息</DialogDescription>
          </DialogHeader>
          {currentDemand && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>标题 *</Label>
                <Input
                  value={currentDemand.title}
                  onChange={(e) =>
                    setCurrentDemand({ ...currentDemand, title: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>分类</Label>
                  <select
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={currentDemand.category}
                    onChange={(e) =>
                      setCurrentDemand({ ...currentDemand, category: e.target.value })
                    }
                  >
                    <option value="">选择分类</option>
                    <option value="ai-comic">AI漫剧制作</option>
                    <option value="video-edit">视频剪辑</option>
                    <option value="ai-dev">AI技术开发</option>
                    <option value="other">其他</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>预算</Label>
                  <Input
                    value={currentDemand.budget}
                    onChange={(e) =>
                      setCurrentDemand({ ...currentDemand, budget: e.target.value })
                    }
                    placeholder="¥X,XXX - ¥X,XXX"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>截止日期</Label>
                  <Input
                    type="date"
                    value={currentDemand.deadline}
                    onChange={(e) =>
                      setCurrentDemand({ ...currentDemand, deadline: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>发布者</Label>
                  <Input
                    value={currentDemand.postedBy}
                    onChange={(e) =>
                      setCurrentDemand({ ...currentDemand, postedBy: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>联系方式</Label>
                  <Input
                    value={currentDemand.contact}
                    onChange={(e) =>
                      setCurrentDemand({ ...currentDemand, contact: e.target.value })
                    }
                    placeholder="手机号/微信/邮箱"
                  />
                </div>
                <div className="space-y-2">
                  <Label>发布日期</Label>
                  <Input
                    type="date"
                    value={currentDemand.postedAt}
                    onChange={(e) =>
                      setCurrentDemand({ ...currentDemand, postedAt: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>状态</Label>
                  <select
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={currentDemand.status}
                    onChange={(e) =>
                      setCurrentDemand({ ...currentDemand, status: e.target.value })
                    }
                  >
                    <option value="open">开放</option>
                    <option value="in-progress">进行中</option>
                    <option value="completed">已完成</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>技能要求</Label>
                <Input
                  value={currentDemand.requirements}
                  onChange={(e) =>
                    setCurrentDemand({ ...currentDemand, requirements: e.target.value })
                  }
                  placeholder="多个要求用逗号分隔"
                />
              </div>
              <div className="space-y-2">
                <Label>描述</Label>
                <Textarea
                  value={currentDemand.description}
                  onChange={(e) =>
                    setCurrentDemand({ ...currentDemand, description: e.target.value })
                  }
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 审核对话框 */}
      <Dialog open={isAuditDialogOpen} onOpenChange={setIsAuditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>审核需求</DialogTitle>
            <DialogDescription>
              审核需求：{auditTarget?.title}
            </DialogDescription>
          </DialogHeader>
          {auditTarget && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm"><span className="font-medium">标题：</span>{auditTarget.title}</p>
                <p className="text-sm"><span className="font-medium">发布者：</span>{auditTarget.postedBy || '-'}</p>
                <p className="text-sm"><span className="font-medium">联系方式：</span>{auditTarget.contact || '-'}</p>
                <p className="text-sm"><span className="font-medium">预算：</span>{auditTarget.budget || '-'}</p>
                <p className="text-sm"><span className="font-medium">分类：</span>{getCategoryLabel(auditTarget.category)}</p>
                <p className="text-sm"><span className="font-medium">截止日期：</span>{auditTarget.deadline || '-'}</p>
                <p className="text-sm text-muted-foreground line-clamp-3">{auditTarget.description}</p>
              </div>
              <div className="space-y-2">
                <Label>审核操作</Label>
                <div className="flex space-x-3">
                  <Button
                    variant={auditAction === 'approved' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAuditAction('approved')}
                    className={auditAction === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    通过
                  </Button>
                  <Button
                    variant={auditAction === 'rejected' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAuditAction('rejected')}
                    className={auditAction === 'rejected' ? 'bg-red-600 hover:bg-red-700' : ''}
                  >
                    拒绝
                  </Button>
                </div>
              </div>
              {auditAction === 'rejected' && (
                <div className="space-y-2">
                  <Label>驳回原因 *</Label>
                  <Textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                    placeholder="请填写驳回原因..."
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAuditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAuditSubmit} disabled={isLoading}>
              {isLoading ? '提交中...' : '确认'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量删除确认对话框 */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除选中的 {selectedIds.length} 条记录吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleBatchDelete}>确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
