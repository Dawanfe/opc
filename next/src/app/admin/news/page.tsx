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
import { Plus, Pencil, Trash2, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { NEWS_TEMPLATE } from '@/lib/excelTemplate';
import BatchImport from '@/components/BatchImport';

interface News {
  id?: number;
  title: string;
  category: string;
  date: string;
  source: string;
  url: string;
  summary: string;
  content: string;
  tags: string;
}

export default function NewsPage() {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentNews, setCurrentNews] = useState<News | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const emptyForm: News = {
    title: '',
    category: '',
    date: '',
    source: '',
    url: '',
    summary: '',
    content: '',
    tags: '',
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await fetch(apiUrl('/api/admin/news'));
      const data = await res.json();
      setNewsList(data);
    } catch (error) {
      toast.error('获取数据失败');
    }
  };

  const handleAdd = () => {
    setCurrentNews(emptyForm);
    setIsDialogOpen(true);
  };

  const handleEdit = (news: News) => {
    setCurrentNews(news);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!currentNews) return;

    setIsLoading(true);
    try {
      const method = currentNews.id ? 'PUT' : 'POST';
      const res = await fetch(apiUrl('/api/admin/news'), {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentNews),
      });

      if (res.ok) {
        toast.success(currentNews.id ? '更新成功' : '添加成功');
        setIsDialogOpen(false);
        fetchNews();
        setCurrentNews(null);
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
      const res = await fetch(apiUrl(`/api/admin/news?id=${id}`), {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('删除成功');
        fetchNews();
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
      const res = await fetch(apiUrl(`/api/admin/news?ids=${selectedIds.join(',')}`), {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success(`成功删除 ${selectedIds.length} 条记录`);
        setSelectedIds([]);
        setIsDeleteDialogOpen(false);
        fetchNews();
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
    if (selectedIds.length === paginatedNews.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedNews.map((n) => n.id!));
    }
  };

  // 分页计算
  const totalPages = Math.ceil(newsList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNews = newsList.slice(startIndex, endIndex);

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
            <h1 className="text-3xl font-bold">新闻管理</h1>
            <p className="text-muted-foreground">
              共 {newsList.length} 条记录 | 第 {currentPage}/{totalPages} 页
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <BatchImport
            templateType="news"
            existingData={newsList}
            uniqueKey={NEWS_TEMPLATE.uniqueKey}
            onImportSuccess={fetchNews}
            apiEndpoint="/api/admin/news"
            previewColumns={[
              { key: 'title', label: '标题' },
              { key: 'category', label: '分类' },
              { key: 'date', label: '日期' },
              { key: 'source', label: '来源' },
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
            新增新闻
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === paginatedNews.length && paginatedNews.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>标题</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>日期</TableHead>
              <TableHead>来源</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedNews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              paginatedNews.map((news) => (
                <TableRow key={news.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(news.id!)}
                      onCheckedChange={() => toggleSelect(news.id!)}
                    />
                  </TableCell>
                  <TableCell>{news.id}</TableCell>
                  <TableCell className="font-medium max-w-md truncate">{news.title}</TableCell>
                  <TableCell>{news.category}</TableCell>
                  <TableCell>{news.date}</TableCell>
                  <TableCell>{news.source}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(news)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(news.id!)}
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
            显示第 {startIndex + 1} - {Math.min(endIndex, newsList.length)} 条,共 {newsList.length} 条
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
            <DialogTitle>{currentNews?.id ? '编辑新闻' : '新增新闻'}</DialogTitle>
            <DialogDescription>填写新闻信息</DialogDescription>
          </DialogHeader>
          {currentNews && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>标题 *</Label>
                <Input
                  value={currentNews.title}
                  onChange={(e) =>
                    setCurrentNews({ ...currentNews, title: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>分类</Label>
                  <Input
                    value={currentNews.category}
                    onChange={(e) =>
                      setCurrentNews({ ...currentNews, category: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>日期</Label>
                  <Input
                    value={currentNews.date}
                    onChange={(e) =>
                      setCurrentNews({ ...currentNews, date: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>来源</Label>
                  <Input
                    value={currentNews.source}
                    onChange={(e) =>
                      setCurrentNews({ ...currentNews, source: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>标签</Label>
                  <Input
                    value={currentNews.tags}
                    onChange={(e) =>
                      setCurrentNews({ ...currentNews, tags: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>链接</Label>
                <Input
                  value={currentNews.url}
                  onChange={(e) =>
                    setCurrentNews({ ...currentNews, url: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>摘要</Label>
                <Textarea
                  value={currentNews.summary}
                  onChange={(e) =>
                    setCurrentNews({ ...currentNews, summary: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>内容</Label>
                <Textarea
                  value={currentNews.content}
                  onChange={(e) =>
                    setCurrentNews({ ...currentNews, content: e.target.value })
                  }
                  rows={6}
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
