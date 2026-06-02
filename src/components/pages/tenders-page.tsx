'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import {
  Gavel, Search, Filter, List, Eye, Clock, Building2, Globe,
  Users, ChevronLeft, ChevronRight, Banknote, Calendar,
  FileText, ArrowLeftRight, Send, CheckCircle2, XCircle, AlertTriangle,
} from 'lucide-react';

// Types
interface Tender {
  id: string;
  title: string;
  description: string | null;
  tenderNumber: string;
  type: 'GOVERNMENT' | 'PRIVATE' | 'INTERNATIONAL';
  status: 'OPEN' | 'CLOSED' | 'AWARDED' | 'CANCELLED';
  organization: string;
  budgetRange: { min: number; max: number } | null;
  deadline: string;
  bidCount: number;
  creatorId: string;
  creatorName: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Status config
const statusConfig: Record<string, { label: string; color: string; icon: typeof FileText }> = {
  OPEN: { label: 'باز', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', icon: CheckCircle2 },
  CLOSED: { label: 'بسته', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300', icon: XCircle },
  AWARDED: { label: 'اعطا شده', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', icon: CheckCircle2 },
  CANCELLED: { label: 'لغو شده', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', icon: AlertTriangle },
};

// Type config
const typeConfig: Record<string, { label: string; icon: typeof FileText; color: string }> = {
  GOVERNMENT: { label: 'دولتی', icon: Building2, color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800' },
  PRIVATE: { label: 'خصوصی', icon: Users, color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800' },
  INTERNATIONAL: { label: 'بین‌المللی', icon: Globe, color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800' },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fa-IR').format(amount);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
}

function isDeadlineSoon(deadline: string): boolean {
  const now = new Date();
  const dl = new Date(deadline);
  const diffDays = (dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 7;
}

export default function TendersPage() {
  const { token } = useAppStore();
  const { toast } = useToast();

  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchTenders = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (search) params.set('search', search);
      if (selectedType !== 'all') params.set('type', selectedType);
      if (selectedStatus !== 'all') params.set('status', selectedStatus);

      const res = await fetch(`/api/tenders?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const data = await res.json();
        setTenders(data.tenders || []);
        setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
      }
    } catch {
      setTenders([]);
    } finally {
      setLoading(false);
    }
  }, [search, selectedType, selectedStatus, token]);

  useEffect(() => {
    fetchTenders(1);
  }, [fetchTenders]);

  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout | null>(null);
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimer) clearTimeout(searchTimer);
    setSearchTimer(setTimeout(() => fetchTenders(1), 400));
  };

  const handleTypeClick = (type: string) => {
    setSelectedType(type === selectedType ? 'all' : type);
  };

  const handleStatusClick = (status: string) => {
    setSelectedStatus(status === selectedStatus ? 'all' : status);
  };

  const openTender = (tender: Tender) => {
    setSelectedTender(tender);
    setDialogOpen(true);
  };

  const handleBidSubmit = (tender: Tender) => {
    toast({
      title: `ثبت پیشنهاد برای مناقصه ${tender.tenderNumber}`,
      description: 'این قابلیت به زودی فعال خواهد شد.',
      variant: 'default',
    });
  };

  const goToPage = (page: number) => {
    fetchTenders(page);
  };

  const totalPages = pagination.pages;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
            <Gavel className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">مناقصات و مزایدات</h1>
            <p className="text-xs text-muted-foreground">تعداد کل: {pagination.total}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Button variant="default" size="icon" className="h-8 w-8">
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="جستجو در مناقصات..."
          className="pr-9 pl-4 h-11 text-sm bg-card shadow-sm"
        />
      </div>

      {/* Type Filter */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <ArrowLeftRight className="w-4 h-4" />
          نوع مناقصه
        </div>
        <div className="flex gap-2 flex-wrap">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleTypeClick('all')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all border ${
              selectedType === 'all'
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-card text-foreground border-border hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20'
            }`}
          >
            همه
          </motion.button>
          {Object.entries(typeConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <motion.button key={key} whileTap={{ scale: 0.95 }} onClick={() => handleTypeClick(key)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5 ${
                  selectedType === key
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-card text-foreground border-border hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {config.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Status Filter */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="w-4 h-4" />
          وضعیت
        </div>
        <div className="flex gap-2 flex-wrap">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleStatusClick('all')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all border ${
              selectedStatus === 'all'
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-card text-foreground border-border hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20'
            }`}
          >
            همه
          </motion.button>
          {Object.entries(statusConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <motion.button key={key} whileTap={{ scale: 0.95 }} onClick={() => handleStatusClick(key)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5 ${
                  selectedStatus === key
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-card text-foreground border-border hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {config.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Tenders List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tenders.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Gavel className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">نتیجه‌ای یافت نشد</p>
          <p className="text-sm text-muted-foreground mt-1">فیلترهای جستجو را تغییر دهید</p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedType}-${selectedStatus}`}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {tenders.map((tender, index) => (
              <motion.div key={tender.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}>
                <Card className="group cursor-pointer hover:shadow-md hover:border-amber-200 dark:hover:border-amber-800 transition-all overflow-hidden"
                  onClick={() => openTender(tender)}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                        {(() => { const Icon = typeConfig[tender.type]?.icon || Gavel; return <Icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />; })()}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-sm group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {tender.title}
                          </h3>
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${typeConfig[tender.type]?.color}`}>
                            {typeConfig[tender.type]?.label || tender.type}
                          </Badge>
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${statusConfig[tender.status]?.color}`}>
                            {statusConfig[tender.status]?.label || tender.status}
                          </Badge>
                          {isDeadlineSoon(tender.deadline) && tender.status === 'OPEN' && (
                            <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0 animate-pulse">
                              <AlertTriangle className="w-2.5 h-2.5 ml-0.5" />
                              مهلت نزدیک
                            </Badge>
                          )}
                        </div>

                        {tender.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{tender.description}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {tender.organization}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {tender.tenderNumber}
                          </span>
                          {tender.budgetRange && (
                            <span className="flex items-center gap-1">
                              <Banknote className="w-3 h-3" />
                              {formatCurrency(tender.budgetRange.min)} - {formatCurrency(tender.budgetRange.max)} ریال
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            مهلت: {formatDate(tender.deadline)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {tender.bidCount} پیشنهاد
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(tender.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); openTender(tender); }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {tender.status === 'OPEN' && (
                          <Button size="sm" className="h-8 text-xs gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
                            onClick={(e) => { e.stopPropagation(); handleBidSubmit(tender); }}>
                            <Send className="w-3.5 h-3.5" />
                            ثبت پیشنهاد
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {!loading && tenders.length > 0 && totalPages > 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2 pt-4">
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => goToPage(pagination.page - 1)} disabled={pagination.page <= 1}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) pageNum = i + 1;
              else if (pagination.page <= 3) pageNum = i + 1;
              else if (pagination.page >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = pagination.page - 2 + i;
              return (
                <Button key={pageNum} variant={pagination.page === pageNum ? 'default' : 'outline'} size="icon"
                  className={`h-9 w-9 text-xs ${pagination.page === pageNum ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''}`}
                  onClick={() => goToPage(pageNum)}>
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => goToPage(pagination.page + 1)} disabled={pagination.page >= totalPages}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {/* Tender Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[95dvh] sm:max-h-[90dvh] overflow-y-auto sm:overflow-y-hidden flex flex-col p-0">
          {selectedTender && (
            <>
              <DialogHeader className="bg-gradient-to-l from-amber-600 to-orange-600 p-6 rounded-none">
                <DialogTitle className="text-white flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                    {(() => { const Icon = typeConfig[selectedTender.type]?.icon || Gavel; return <Icon className="w-5 h-5 text-white" />; })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold leading-relaxed">{selectedTender.title}</h2>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge className="bg-white/20 text-white text-[11px] px-2 py-0.5 border border-white/30 hover:bg-white/30">
                        {selectedTender.tenderNumber}
                      </Badge>
                      <Badge className="bg-white/20 text-white text-[11px] px-2 py-0.5 border border-white/30 hover:bg-white/30">
                        {typeConfig[selectedTender.type]?.label}
                      </Badge>
                      <Badge className="bg-white/20 text-white text-[11px] px-2 py-0.5 border border-white/30 hover:bg-white/30">
                        {statusConfig[selectedTender.status]?.label}
                      </Badge>
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto sm:overflow-hidden flex flex-col">
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-6">
                    {/* Description */}
                    {selectedTender.description && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          توضیحات
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 rounded-lg p-3">
                          {selectedTender.description}
                        </p>
                      </div>
                    )}

                    <Separator />

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">سازمان برگزارکننده</span>
                        <p className="text-sm font-medium flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          {selectedTender.organization}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">مهلت ارسال پیشنهاد</span>
                        <p className="text-sm font-medium flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {formatDate(selectedTender.deadline)}
                          {isDeadlineSoon(selectedTender.deadline) && selectedTender.status === 'OPEN' && (
                            <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0">مهلت نزدیک</Badge>
                          )}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">بودجه تخمینی</span>
                        <p className="text-sm font-medium flex items-center gap-1.5">
                          <Banknote className="w-4 h-4 text-muted-foreground" />
                          {selectedTender.budgetRange
                            ? `${formatCurrency(selectedTender.budgetRange.min)} - ${formatCurrency(selectedTender.budgetRange.max)} ریال`
                            : 'نامشخص'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">تعداد پیشنهادات</span>
                        <p className="text-sm font-medium flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          {selectedTender.bidCount} پیشنهاد
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">ایجادکننده</span>
                        <p className="text-sm font-medium">{selectedTender.creatorName}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">تاریخ ایجاد</span>
                        <p className="text-sm font-medium">{formatDate(selectedTender.createdAt)}</p>
                      </div>
                    </div>

                    <Separator />

                    {/* Status & Type */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">وضعیت:</span>
                        <Badge variant="outline" className={`text-xs px-3 py-1 ${statusConfig[selectedTender.status]?.color}`}>
                          {statusConfig[selectedTender.status]?.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">نوع:</span>
                        <Badge variant="outline" className={`text-xs px-3 py-1 ${typeConfig[selectedTender.type]?.color}`}>
                          {typeConfig[selectedTender.type]?.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                {/* Dialog Footer */}
                <div className="border-t p-4 flex items-center justify-between bg-muted/30">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      بروزرسانی: {formatDate(selectedTender.updatedAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedTender.status === 'OPEN' && (
                      <Button className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8 gap-1.5"
                        onClick={() => handleBidSubmit(selectedTender)}>
                        <Send className="w-3.5 h-3.5" />
                        ثبت پیشنهاد
                      </Button>
                    )}
                    <Button onClick={() => setDialogOpen(false)} variant="outline" className="text-xs h-8">
                      بستن
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
