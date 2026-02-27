'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { Plus, Pencil, Trash2, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { COMMUNITIES_TEMPLATE } from '@/lib/excelTemplate';
import BatchImport from '@/components/BatchImport';

interface Community {
  id?: number;
  province: string;
  city: string;
  district: string;
  name: string;
  address: string;
  policySummary: string;
  freeWorkspace: string;
  freeAccommodation: string;
  computingSupport: string;
  investmentSupport: string;
  registrationSupport: string;
  otherServices: string;
  benefitCount: number;
  contact: string;
  verificationStatus: string;
  confidence: string;
}

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCommunity, setCurrentCommunity] = useState<Community | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const emptyForm: Community = {
    province: '',
    city: '',
    district: '',
    name: '',
    address: '',
    policySummary: '',
    freeWorkspace: '',
    freeAccommodation: '',
    computingSupport: '',
    investmentSupport: '',
    registrationSupport: '',
    otherServices: '',
    benefitCount: 0,
    contact: '',
    verificationStatus: '',
    confidence: '',
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const res = await fetch('/api/admin/communities');
      const data = await res.json();
      setCommunities(data);
    } catch (error) {
      toast.error('获取数据失败');
    }
  };

  const handleAdd = () => {
    setCurrentCommunity(emptyForm);
    setIsDialogOpen(true);
  };

  const handleEdit = (community: Community) => {
    setCurrentCommunity(community);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!currentCommunity) return;

    setIsLoading(true);
    try {
      const method = currentCommunity.id ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/communities', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentCommunity),
      });

      if (res.ok) {
        toast.success(currentCommunity.id ? '更新成功' : '添加成功');
        setIsDialogOpen(false);
        fetchCommunities();
        setCurrentCommunity(null);
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
      const res = await fetch(`/api/admin/communities?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('删除成功');
        fetchCommunities();
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
      const res = await fetch(`/api/admin/communities?ids=${selectedIds.join(',')}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success(`成功删除 ${selectedIds.length} 条记录`);
        setSelectedIds([]);
        setIsDeleteDialogOpen(false);
        fetchCommunities();
      } else {
        toast.error('删除失败');
      }
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedCommunities.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedCommunities.map((c) => c.id!));
    }
  };

  // 分页计算
  const totalPages = Math.ceil(communities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCommunities = communities.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    setSelectedIds([]);
  };

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
            <h1 className="text-3xl font-bold">OPC社区管理</h1>
            <p className="text-muted-foreground">
              共 {communities.length} 条记录 | 第 {currentPage}/{totalPages} 页
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <BatchImport
            templateType="communities"
            existingData={communities}
            uniqueKey={COMMUNITIES_TEMPLATE.uniqueKey}
            onImportSuccess={fetchCommunities}
            apiEndpoint="/api/admin/communities"
            previewColumns={[
              { key: 'name', label: '名称' },
              { key: 'province', label: '省份' },
              { key: 'city', label: '城市' },
              { key: 'address', label: '地址' },
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
            新增社区
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === paginatedCommunities.length && paginatedCommunities.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>名称</TableHead>
              <TableHead>省份</TableHead>
              <TableHead>城市</TableHead>
              <TableHead>地址</TableHead>
              <TableHead>验证状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCommunities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              paginatedCommunities.map((community) => (
              <TableRow key={community.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(community.id!)}
                    onCheckedChange={() => toggleSelect(community.id!)}
                  />
                </TableCell>
                <TableCell>{community.id}</TableCell>
                <TableCell className="font-medium">{community.name}</TableCell>
                <TableCell>{community.province}</TableCell>
                <TableCell>{community.city}</TableCell>
                <TableCell className="max-w-xs truncate">{community.address}</TableCell>
                <TableCell>{community.verificationStatus}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(community)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(community.id!)}
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
            显示第 {startIndex + 1} - {Math.min(endIndex, communities.length)} 条，共 {communities.length} 条
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
                // 只显示当前页附近的页码
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentCommunity?.id ? '编辑社区' : '新增社区'}</DialogTitle>
            <DialogDescription>填写社区信息</DialogDescription>
          </DialogHeader>
          {currentCommunity && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>名称 *</Label>
                <Input
                  value={currentCommunity.name}
                  onChange={(e) =>
                    setCurrentCommunity({ ...currentCommunity, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>省份 *</Label>
                <Input
                  value={currentCommunity.province}
                  onChange={(e) =>
                    setCurrentCommunity({ ...currentCommunity, province: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>城市 *</Label>
                <Input
                  value={currentCommunity.city}
                  onChange={(e) =>
                    setCurrentCommunity({ ...currentCommunity, city: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>区县</Label>
                <Input
                  value={currentCommunity.district}
                  onChange={(e) =>
                    setCurrentCommunity({ ...currentCommunity, district: e.target.value })
                  }
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>地址</Label>
                <Input
                  value={currentCommunity.address}
                  onChange={(e) =>
                    setCurrentCommunity({ ...currentCommunity, address: e.target.value })
                  }
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>政策摘要</Label>
                <Textarea
                  value={currentCommunity.policySummary}
                  onChange={(e) =>
                    setCurrentCommunity({ ...currentCommunity, policySummary: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>免费工位</Label>
                <Input
                  value={currentCommunity.freeWorkspace}
                  onChange={(e) =>
                    setCurrentCommunity({ ...currentCommunity, freeWorkspace: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>免费住宿</Label>
                <Input
                  value={currentCommunity.freeAccommodation}
                  onChange={(e) =>
                    setCurrentCommunity({
                      ...currentCommunity,
                      freeAccommodation: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>算力支持</Label>
                <Input
                  value={currentCommunity.computingSupport}
                  onChange={(e) =>
                    setCurrentCommunity({
                      ...currentCommunity,
                      computingSupport: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>投资支持</Label>
                <Input
                  value={currentCommunity.investmentSupport}
                  onChange={(e) =>
                    setCurrentCommunity({
                      ...currentCommunity,
                      investmentSupport: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>注册支持</Label>
                <Input
                  value={currentCommunity.registrationSupport}
                  onChange={(e) =>
                    setCurrentCommunity({
                      ...currentCommunity,
                      registrationSupport: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>福利数量</Label>
                <Input
                  type="number"
                  value={currentCommunity.benefitCount}
                  onChange={(e) =>
                    setCurrentCommunity({
                      ...currentCommunity,
                      benefitCount: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>其他服务</Label>
                <Textarea
                  value={currentCommunity.otherServices}
                  onChange={(e) =>
                    setCurrentCommunity({ ...currentCommunity, otherServices: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>联系方式</Label>
                <Textarea
                  value={currentCommunity.contact}
                  onChange={(e) =>
                    setCurrentCommunity({ ...currentCommunity, contact: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>验证状态</Label>
                <Input
                  value={currentCommunity.verificationStatus}
                  onChange={(e) =>
                    setCurrentCommunity({
                      ...currentCommunity,
                      verificationStatus: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>可信度</Label>
                <Input
                  value={currentCommunity.confidence}
                  onChange={(e) =>
                    setCurrentCommunity({ ...currentCommunity, confidence: e.target.value })
                  }
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
