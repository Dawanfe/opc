'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Pencil, Trash2, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface User {
  id?: number;
  phone: string;
  username: string;
  email: string;
  password?: string;
  nickname: string;
  avatar: string;
  membershipType: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const emptyForm: User = {
    phone: '',
    username: '',
    email: '',
    password: '',
    nickname: '',
    avatar: '',
    membershipType: 'free',
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(apiUrl('/api/admin/users'));
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      toast.error('获取数据失败');
    }
  };

  const handleAdd = () => {
    setCurrentUser(emptyForm);
    setIsDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setCurrentUser({ ...user, password: '' });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!currentUser) return;
    if (!currentUser.phone) {
      toast.error('请填写手机号');
      return;
    }

    setIsLoading(true);
    try {
      const method = currentUser.id ? 'PUT' : 'POST';
      const res = await fetch(apiUrl('/api/admin/users'), {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentUser),
      });

      if (res.ok) {
        toast.success(currentUser.id ? '更新成功' : '添加成功');
        setIsDialogOpen(false);
        fetchUsers();
        setCurrentUser(null);
      } else {
        const error = await res.json();
        toast.error(error.error || '操作失败');
      }
    } catch (error) {
      toast.error('操作失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(apiUrl(`/api/admin/users?id=${id}`), {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('删除成功');
        fetchUsers();
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
      const res = await fetch(apiUrl(`/api/admin/users?ids=${selectedIds.join(',')}`), {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success(`成功删除 ${selectedIds.length} 条记录`);
        setSelectedIds([]);
        setIsDeleteDialogOpen(false);
        fetchUsers();
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
    if (selectedIds.length === paginatedUsers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedUsers.map((u) => u.id!));
    }
  };

  // 分页计算
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = users.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    setSelectedIds([]);
  };

  const getMembershipLabel = (type: string) => {
    const labels: Record<string, string> = {
      free: '免费会员',
      basic: '基础会员',
      pro: 'Pro会员',
      enterprise: '企业会员',
    };
    return labels[type] || type;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('zh-CN');
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
            <h1 className="text-3xl font-bold">用户管理</h1>
            <p className="text-muted-foreground">
              共 {users.length} 条记录 | 第 {currentPage}/{totalPages || 1} 页
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
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
            新增用户
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === paginatedUsers.length && paginatedUsers.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>手机号</TableHead>
              <TableHead>用户名</TableHead>
              <TableHead>昵称</TableHead>
              <TableHead>邮箱</TableHead>
              <TableHead>会员类型</TableHead>
              <TableHead>注册时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(user.id!)}
                      onCheckedChange={() => toggleSelect(user.id!)}
                    />
                  </TableCell>
                  <TableCell>{user.id}</TableCell>
                  <TableCell className="font-medium">{user.phone}</TableCell>
                  <TableCell>{user.username || '-'}</TableCell>
                  <TableCell>{user.nickname || '-'}</TableCell>
                  <TableCell>{user.email || '-'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.membershipType === 'pro' ? 'bg-purple-100 text-purple-700' :
                      user.membershipType === 'enterprise' ? 'bg-blue-100 text-blue-700' :
                      user.membershipType === 'basic' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {getMembershipLabel(user.membershipType)}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(user)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(user.id!)}
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
            显示第 {startIndex + 1} - {Math.min(endIndex, users.length)} 条，共 {users.length} 条
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{currentUser?.id ? '编辑用户' : '新增用户'}</DialogTitle>
            <DialogDescription>填写用户信息</DialogDescription>
          </DialogHeader>
          {currentUser && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>手机号 *</Label>
                <Input
                  value={currentUser.phone}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, phone: e.target.value })
                  }
                  placeholder="请输入手机号"
                />
              </div>
              <div className="space-y-2">
                <Label>用户名</Label>
                <Input
                  value={currentUser.username}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, username: e.target.value })
                  }
                  placeholder="请输入用户名"
                />
              </div>
              <div className="space-y-2">
                <Label>昵称</Label>
                <Input
                  value={currentUser.nickname}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, nickname: e.target.value })
                  }
                  placeholder="请输入昵称"
                />
              </div>
              <div className="space-y-2">
                <Label>邮箱</Label>
                <Input
                  type="email"
                  value={currentUser.email}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, email: e.target.value })
                  }
                  placeholder="请输入邮箱"
                />
              </div>
              <div className="space-y-2">
                <Label>{currentUser.id ? '新密码（留空则不修改）' : '密码'}</Label>
                <Input
                  type="password"
                  value={currentUser.password || ''}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, password: e.target.value })
                  }
                  placeholder={currentUser.id ? '留空则不修改密码' : '默认密码: 123456'}
                />
              </div>
              <div className="space-y-2">
                <Label>会员类型</Label>
                <Select
                  value={currentUser.membershipType}
                  onValueChange={(value) =>
                    setCurrentUser({ ...currentUser, membershipType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择会员类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">免费会员</SelectItem>
                    <SelectItem value="basic">基础会员</SelectItem>
                    <SelectItem value="pro">Pro会员</SelectItem>
                    <SelectItem value="enterprise">企业会员</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>头像URL</Label>
                <Input
                  value={currentUser.avatar}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, avatar: e.target.value })
                  }
                  placeholder="请输入头像图片URL"
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
              确定要删除选中的 {selectedIds.length} 个用户吗？此操作不可撤销。
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
