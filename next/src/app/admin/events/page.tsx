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
import { EVENTS_TEMPLATE } from '@/lib/excelTemplate';
import BatchImport from '@/components/BatchImport';

interface Event {
  id?: number;
  location: string;
  organizer: string;
  date: string;
  name: string;
  registrationLink: string;
  guests: string;
  guestTitles: string;
  description: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const emptyForm: Event = {
    location: '',
    organizer: '',
    date: '',
    name: '',
    registrationLink: '',
    guests: '',
    guestTitles: '',
    description: '',
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/admin/events');
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      toast.error('获取数据失败');
    }
  };

  const handleAdd = () => {
    setCurrentEvent(emptyForm);
    setIsDialogOpen(true);
  };

  const handleEdit = (event: Event) => {
    setCurrentEvent(event);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!currentEvent) return;

    setIsLoading(true);
    try {
      const method = currentEvent.id ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/events', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentEvent),
      });

      if (res.ok) {
        toast.success(currentEvent.id ? '更新成功' : '添加成功');
        setIsDialogOpen(false);
        fetchEvents();
        setCurrentEvent(null);
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
      const res = await fetch(`/api/admin/events?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('删除成功');
        fetchEvents();
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
      const res = await fetch(`/api/admin/events?ids=${selectedIds.join(',')}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success(`成功删除 ${selectedIds.length} 条记录`);
        setSelectedIds([]);
        setIsDeleteDialogOpen(false);
        fetchEvents();
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
    if (selectedIds.length === paginatedEvents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedEvents.map((e) => e.id!));
    }
  };

  // 分页计算
  const totalPages = Math.ceil(events.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEvents = events.slice(startIndex, endIndex);

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
            <h1 className="text-3xl font-bold">活动管理</h1>
            <p className="text-muted-foreground">
              共 {events.length} 条记录 | 第 {currentPage}/{totalPages} 页
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <BatchImport
            templateType="events"
            existingData={events}
            uniqueKey={EVENTS_TEMPLATE.uniqueKey}
            onImportSuccess={fetchEvents}
            apiEndpoint="/api/admin/events"
            previewColumns={[
              { key: 'name', label: '活动名称' },
              { key: 'date', label: '日期' },
              { key: 'location', label: '地点' },
              { key: 'organizer', label: '主办方' },
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
            新增活动
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === paginatedEvents.length && paginatedEvents.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>活动名称</TableHead>
              <TableHead>日期</TableHead>
              <TableHead>地点</TableHead>
              <TableHead>主办方</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              paginatedEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(event.id!)}
                      onCheckedChange={() => toggleSelect(event.id!)}
                    />
                  </TableCell>
                  <TableCell>{event.id}</TableCell>
                  <TableCell className="font-medium max-w-sm truncate">{event.name}</TableCell>
                  <TableCell>{event.date}</TableCell>
                  <TableCell>{event.location}</TableCell>
                  <TableCell>{event.organizer}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(event)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(event.id!)}
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
            显示第 {startIndex + 1} - {Math.min(endIndex, events.length)} 条,共 {events.length} 条
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
            <DialogTitle>{currentEvent?.id ? '编辑活动' : '新增活动'}</DialogTitle>
            <DialogDescription>填写活动信息</DialogDescription>
          </DialogHeader>
          {currentEvent && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>活动名称 *</Label>
                <Input
                  value={currentEvent.name}
                  onChange={(e) =>
                    setCurrentEvent({ ...currentEvent, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>日期</Label>
                <Input
                  value={currentEvent.date}
                  onChange={(e) =>
                    setCurrentEvent({ ...currentEvent, date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>地点</Label>
                <Input
                  value={currentEvent.location}
                  onChange={(e) =>
                    setCurrentEvent({ ...currentEvent, location: e.target.value })
                  }
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>主办方</Label>
                <Input
                  value={currentEvent.organizer}
                  onChange={(e) =>
                    setCurrentEvent({ ...currentEvent, organizer: e.target.value })
                  }
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>报名链接</Label>
                <Input
                  value={currentEvent.registrationLink}
                  onChange={(e) =>
                    setCurrentEvent({ ...currentEvent, registrationLink: e.target.value })
                  }
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>嘉宾</Label>
                <Textarea
                  value={currentEvent.guests}
                  onChange={(e) =>
                    setCurrentEvent({ ...currentEvent, guests: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>嘉宾头衔</Label>
                <Textarea
                  value={currentEvent.guestTitles}
                  onChange={(e) =>
                    setCurrentEvent({ ...currentEvent, guestTitles: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>活动描述</Label>
                <Textarea
                  value={currentEvent.description}
                  onChange={(e) =>
                    setCurrentEvent({ ...currentEvent, description: e.target.value })
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
