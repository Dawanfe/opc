'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Upload } from 'lucide-react';
import { apiUrl } from '@/lib/utils';

interface ExternalLink {
  id: number;
  key: string;
  label: string;
  description?: string;
  icon?: string;
  iconImage?: string;
  url: string;
  position: string;
  sortOrder: number;
  enabled: number;
  hot?: number;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ExternalLinksManagementPage() {
  const [links, setLinks] = useState<ExternalLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<ExternalLink | null>(null);
  const [formData, setFormData] = useState({
    key: '',
    label: '',
    description: '',
    icon: '',
    iconImage: '',
    url: '',
    position: 'sidebar',
    sortOrder: 0,
    enabled: 1,
    hot: 0,
    color: 'purple',
  });
  const [uploadingIcon, setUploadingIcon] = useState(false);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const res = await fetch(apiUrl('/api/admin/external-links'));
      const data = await res.json();
      setLinks(data);
    } catch (error) {
      console.error('Failed to fetch links:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingLink
        ? apiUrl('/api/admin/external-links')
        : apiUrl('/api/admin/external-links');
      const method = editingLink ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingLink ? { ...formData, id: editingLink.id } : formData),
      });

      if (res.ok) {
        fetchLinks();
        handleCloseDialog();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to save link');
      }
    } catch (error) {
      console.error('Failed to save link:', error);
      alert('Failed to save link');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确认删除这个外部链接吗？')) return;

    try {
      const res = await fetch(apiUrl(`/api/admin/external-links?id=${id}`), {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchLinks();
      }
    } catch (error) {
      console.error('Failed to delete link:', error);
    }
  };

  const handleEdit = (link: ExternalLink) => {
    setEditingLink(link);
    setFormData({
      key: link.key,
      label: link.label,
      description: link.description || '',
      icon: link.icon || '',
      iconImage: link.iconImage || '',
      url: link.url,
      position: link.position,
      sortOrder: link.sortOrder,
      enabled: link.enabled,
      hot: link.hot || 0,
      color: link.color || 'purple',
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingLink(null);
    setFormData({
      key: '',
      label: '',
      description: '',
      icon: '',
      iconImage: '',
      url: '',
      position: 'sidebar',
      sortOrder: 0,
      enabled: 1,
      hot: 0,
      color: 'purple',
    });
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIcon(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const res = await fetch(apiUrl('/api/upload'), {
        method: 'POST',
        body: uploadFormData,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData({ ...formData, iconImage: data.path });
      }
    } catch (error) {
      console.error('Failed to upload icon:', error);
    } finally {
      setUploadingIcon(false);
    }
  };

  if (isLoading) {
    return <div className="p-8">加载中...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">外部链接管理</h1>
          <p className="text-muted-foreground mt-2">
            管理侧边栏和首页卡片的外部链接（如微信公众号文章等）
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          新增链接
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>标识</TableHead>
              <TableHead>显示文案</TableHead>
              <TableHead>图标</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>位置</TableHead>
              <TableHead>排序</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.map((link) => (
              <TableRow key={link.id}>
                <TableCell className="font-mono text-sm">{link.key}</TableCell>
                <TableCell>{link.label}</TableCell>
                <TableCell>
                  {link.iconImage ? (
                    <img src={apiUrl(link.iconImage)} alt="" className="w-6 h-6" />
                  ) : (
                    <span className="text-xs text-muted-foreground">{link.icon || '-'}</span>
                  )}
                </TableCell>
                <TableCell className="max-w-xs truncate text-sm">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {link.url}
                  </a>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {link.position === 'sidebar' ? '侧边栏' : '首页卡片'}
                  </span>
                </TableCell>
                <TableCell>{link.sortOrder}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      link.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {link.enabled ? '启用' : '禁用'}
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(link)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(link.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {links.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLink ? '编辑链接' : '新增链接'}</DialogTitle>
            <DialogDescription>
              配置外部链接的文案、图标和跳转地址
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="key">标识 (唯一Key)</Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  placeholder="investment"
                  required
                  disabled={!!editingLink}
                />
              </div>

              <div>
                <Label htmlFor="label">显示文案</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="申请项目投资"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="url">跳转地址</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://mp.weixin.qq.com/s/..."
                required
              />
            </div>

            <div>
              <Label htmlFor="description">描述信息 (首页卡片用)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="单个OPC项目，申请10-200万投资额度，3个工作日内反馈"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="position">显示位置</Label>
                <Select value={formData.position} onValueChange={(value) => setFormData({ ...formData, position: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sidebar">侧边栏</SelectItem>
                    <SelectItem value="dashboard">首页卡片</SelectItem>
                    <SelectItem value="both">两者都显示</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sortOrder">排序</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="iconImage">图标图片</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="iconImage"
                  value={formData.iconImage}
                  onChange={(e) => setFormData({ ...formData, iconImage: e.target.value })}
                  placeholder="/money-rmb.png"
                />
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIconUpload}
                    className="hidden"
                    id="icon-upload"
                    disabled={uploadingIcon}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('icon-upload')?.click()}
                    disabled={uploadingIcon}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingIcon ? '上传中...' : '上传'}
                  </Button>
                </div>
                {formData.iconImage && (
                  <img src={apiUrl(formData.iconImage)} alt="" className="w-8 h-8" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                推荐尺寸：64x64px，PNG格式，透明背景
              </p>
            </div>

            <div>
              <Label htmlFor="icon">Lucide图标名 (可选)</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="DollarSign"
              />
              <p className="text-xs text-muted-foreground mt-1">
                如果未上传图标图片，将使用Lucide图标库中的图标
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="color">卡片颜色主题</Label>
                <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="green">绿色</SelectItem>
                    <SelectItem value="blue">蓝色</SelectItem>
                    <SelectItem value="purple">紫色</SelectItem>
                    <SelectItem value="orange">橙色</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 mt-6">
                <Switch
                  id="hot"
                  checked={formData.hot === 1}
                  onCheckedChange={(checked) => setFormData({ ...formData, hot: checked ? 1 : 0 })}
                />
                <Label htmlFor="hot">HOT标签 (侧边栏)</Label>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="enabled"
                checked={formData.enabled === 1}
                onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked ? 1 : 0 })}
              />
              <Label htmlFor="enabled">启用</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                取消
              </Button>
              <Button type="submit">{editingLink ? '更新' : '创建'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
