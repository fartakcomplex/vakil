'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/persian';
import { formatDate, formatFileSize } from '@/lib/utils-helpers';
import { FileText, Plus, Search, Download, Trash2, File, Image as ImageIcon, FileSpreadsheet, Video, Archive, Upload, FolderOpen, Loader2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const fileIcon = (mimeType: string) => {
  if (!mimeType) return <File className="w-4 h-4" />;
  if (mimeType.includes('image')) return <ImageIcon className="w-4 h-4 text-purple-500" />;
  if (mimeType.includes('pdf')) return <FileText className="w-4 h-4 text-red-500" />;
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return <FileSpreadsheet className="w-4 h-4 text-emerald-500" />;
  if (mimeType.includes('video')) return <Video className="w-4 h-4 text-amber-500" />;
  if (mimeType.includes('zip') || mimeType.includes('archive')) return <Archive className="w-4 h-4 text-orange-500" />;
  return <File className="w-4 h-4 text-slate-500" />;
};

const colorClass = (mimeType: string) => {
  if (!mimeType) return 'bg-slate-100 dark:bg-slate-800';
  if (mimeType.includes('image')) return 'bg-purple-100 dark:bg-purple-900/40';
  if (mimeType.includes('pdf')) return 'bg-red-100 dark:bg-red-900/40';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'bg-emerald-100 dark:bg-emerald-900/40';
  return 'bg-slate-100 dark:bg-slate-800';
};

export default function DocumentsPage() {
  const { documents, setDocuments } = useAppStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [category, setCategory] = useState('legal');
  const [caseId, setCaseId] = useState('');
  const { toast } = useToast();

  const cases = useAppStore((s) => s.cases);

  const filtered = useMemo(() => {
    return documents.filter((d) => {
      const ms = !search || d.name.includes(search);
      const mc = categoryFilter === 'all' || d.category === categoryFilter;
      return ms && mc;
    });
  }, [documents, search, categoryFilter]);

  const handleUpload = () => {
    setDialogOpen(false);
    toast({ title: 'آماده بارگذاری', description: 'قابلیت بارگذاری فایل به‌زودی فعال می‌شود', variant: 'default' });
    setCategory('legal');
    setCaseId('');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold">{t('documents.title')}</h1>
        <Sheet open={dialogOpen} onOpenChange={setDialogOpen}>
          <SheetTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white"><Plus className="w-4 h-4 ml-1" />{t('documents.new')}</Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-[550px] overflow-y-auto">
            <div className="bg-gradient-to-l from-emerald-600 to-emerald-700 -mx-6 -mt-6 px-6 pt-6 pb-4 mb-4 rounded-b-xl">
              <SheetHeader>
                <SheetTitle className="text-white flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  بارگذاری سند جدید
                </SheetTitle>
              </SheetHeader>
              <p className="text-emerald-100 text-xs mt-1">فایل مورد نظر را انتخاب کنید</p>
            </div>

            <div className="space-y-6 px-1">
              {/* Section 1: File Selection */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  <FileText className="w-4 h-4" />
                  انتخاب فایل
                </div>
                <Separator />
                <div className="border-2 border-dashed rounded-xl p-8 text-center hover:border-emerald-500 transition-colors cursor-pointer">
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium">فایل را اینجا رها کنید</p>
                  <p className="text-xs text-muted-foreground mt-1">یا کلیک کنید برای انتخاب فایل</p>
                  <p className="text-[10px] text-muted-foreground mt-3">فرمت‌های مجاز: PDF, Word, Excel, Image (حداکثر ۵۰ مگابایت)</p>
                </div>
              </div>

              {/* Section 2: Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  <FolderOpen className="w-4 h-4" />
                  جزئیات
                </div>
                <Separator />
                <div className="space-y-1">
                  <Label className="text-xs">دسته‌بندی</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{['legal', 'contract', 'financial', 'template', 'report', 'other'].map((c) => <SelectItem key={c} value={c}>{t(`docCategory.${c}`)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">پرونده (اختیاری)</Label>
                  <Select value={caseId} onValueChange={setCaseId}>
                    <SelectTrigger><SelectValue placeholder="انتخاب پرونده" /></SelectTrigger>
                    <SelectContent>{cases.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">سند به پرونده مشخص‌شده متصل خواهد شد</p>
                </div>
              </div>

              <Button onClick={handleUpload} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11">
                <><Upload className="w-4 h-4 ml-2" />بارگذاری سند</>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('documents.search')} className="pr-9 text-sm" /></div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-36 text-sm"><SelectValue placeholder="دسته‌بندی" /></SelectTrigger>
          <SelectContent><SelectItem value="all">همه</SelectItem>{['legal', 'contract', 'financial', 'template', 'report', 'other'].map((c) => <SelectItem key={c} value={c}>{t(`docCategory.${c}`)}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <Card><CardContent className="p-0 divide-y divide-border">
        {filtered.map((doc) => (
          <div key={doc.id} className="flex items-center gap-4 p-3 hover:bg-muted/50 transition-colors">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass(doc.mimeType || '')}`}>
              {fileIcon(doc.mimeType || '')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{doc.name}</p>
              <p className="text-xs text-muted-foreground">{formatDate(doc.createdAt)} · {formatFileSize(doc.fileSize)}</p>
            </div>
            {doc.category && <Badge variant="secondary" className="text-xs">{t(`docCategory.${doc.category}`)}</Badge>}
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-emerald-600"><Download className="w-4 h-4" /></Button>
          </div>
        ))}
        {filtered.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">{t('common.noData')}</div>}
      </CardContent></Card>
    </motion.div>
  );
}
