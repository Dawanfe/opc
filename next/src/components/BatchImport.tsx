'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { downloadTemplate, parseExcelFile, deduplicateData } from '@/lib/excelTemplate';
import { apiUrl } from '@/lib/utils';

interface BatchImportProps<T> {
  templateType: 'communities' | 'events' | 'news' | 'demands';
  existingData: T[];
  uniqueKey: string;
  onImportSuccess: () => void;
  apiEndpoint: string;
  previewColumns: {
    key: keyof T;
    label: string;
  }[];
}

export default function BatchImport<T extends Record<string, any>>({
  templateType,
  existingData,
  uniqueKey,
  onImportSuccess,
  apiEndpoint,
  previewColumns,
}: BatchImportProps<T>) {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<{ toAdd: T[]; duplicates: T[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDownloadTemplate = () => {
    downloadTemplate(templateType);
    toast.success('模板下载成功');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('请上传 Excel 文件(.xlsx 或 .xls)');
      return;
    }

    setImportFile(file);
    setIsLoading(true);

    try {
      const parsed = await parseExcelFile<T>(file, templateType);
      const { toAdd, duplicates } = deduplicateData(parsed, existingData, uniqueKey);
      setImportPreview({ toAdd, duplicates });
      setIsImportDialogOpen(true);
    } catch (error) {
      toast.error('文件解析失败,请检查文件格式');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!importPreview || importPreview.toAdd.length === 0) {
      toast.error('没有可导入的数据');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(apiUrl(apiEndpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: importPreview.toAdd }),
      });

      if (res.ok) {
        toast.success(`成功导入 ${importPreview.toAdd.length} 条记录`);
        if (importPreview.duplicates.length > 0) {
          toast.warning(`跳过 ${importPreview.duplicates.length} 条重复记录`);
        }
        setIsImportDialogOpen(false);
        setImportFile(null);
        setImportPreview(null);
        onImportSuccess();
      } else {
        toast.error('导入失败');
      }
    } catch (error) {
      toast.error('导入失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={handleDownloadTemplate}>
        <Download className="w-4 h-4 mr-2" />
        下载模板
      </Button>
      <label htmlFor={`import-file-${templateType}`}>
        <Button variant="outline" asChild>
          <span>
            <Upload className="w-4 h-4 mr-2" />
            批量导入
          </span>
        </Button>
      </label>
      <input
        id={`import-file-${templateType}`}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFileSelect}
      />

      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>导入预览</DialogTitle>
            <DialogDescription>
              请确认要导入的数据。系统已自动过滤重复记录。
            </DialogDescription>
          </DialogHeader>
          {importPreview && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-900">将要导入</p>
                  <p className="text-2xl font-bold text-green-600">
                    {importPreview.toAdd.length} 条
                  </p>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm font-medium text-amber-900">重复跳过</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {importPreview.duplicates.length} 条
                  </p>
                </div>
              </div>

              {importPreview.toAdd.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">导入数据预览(前5条):</p>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {previewColumns.map(col => (
                            <TableHead key={String(col.key)}>{col.label}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importPreview.toAdd.slice(0, 5).map((item, index) => (
                          <TableRow key={index}>
                            {previewColumns.map(col => (
                              <TableCell key={String(col.key)} className="max-w-xs truncate">
                                {String(item[col.key] || '')}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {importPreview.toAdd.length > 5 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      还有 {importPreview.toAdd.length - 5} 条数据未显示...
                    </p>
                  )}
                </div>
              )}

              {importPreview.duplicates.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2 text-amber-600">
                    重复数据(将被跳过):
                  </p>
                  <div className="border border-amber-200 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {previewColumns.slice(0, 3).map(col => (
                            <TableHead key={String(col.key)}>{col.label}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importPreview.duplicates.slice(0, 3).map((item, index) => (
                          <TableRow key={index}>
                            {previewColumns.slice(0, 3).map(col => (
                              <TableCell key={String(col.key)} className="max-w-xs truncate">
                                {String(item[col.key] || '')}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {importPreview.duplicates.length > 3 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      还有 {importPreview.duplicates.length - 3} 条重复数据...
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsImportDialogOpen(false);
                setImportFile(null);
                setImportPreview(null);
              }}
            >
              取消
            </Button>
            <Button
              onClick={handleConfirmImport}
              disabled={isLoading || !importPreview || importPreview.toAdd.length === 0}
            >
              {isLoading ? '导入中...' : `确认导入 ${importPreview?.toAdd.length || 0} 条`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
