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
  Scale, Search, Filter, List, Eye, Clock, FileText, Gavel,
  ChevronLeft, ChevronRight, Banknote, Building2, User, AlertTriangle,
  CheckCircle2, XCircle, Loader2, PauseCircle, Landmark,
  ShieldAlert, Home, Package, Lock, TrendingUp,
} from 'lucide-react';

// Types
interface CaseExecution {
  id: string;
  caseNumber: string;
  caseTitle: string;
  caseId: string;
  executionNumber: string;
  executionType: 'JUDGMENT' | 'ATTACHMENT' | 'FORFEITURE' | 'EVICTION' | 'SEIZURE';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SUSPENDED';
  court: string;
  totalAmount: number;
  collectedAmount: number;
  remainingAmount: number;
  description: string | null;
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
  PENDING: { label: 'در انتظار', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', icon: Clock },
  IN_PROGRESS: { label: 'در جریان', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', icon: Loader2 },
  COMPLETED: { label: 'تکمیل شده', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', icon: CheckCircle2 },
  SUSPENDED: { label: 'معلق', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300', icon: PauseCircle },
};

// Execution type config
const executionTypeConfig: Record<string, { label: string; icon: typeof FileText; color: string }> = {
  JUDGMENT: { label: 'اجرای حکم', icon: Gavel, color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800' },
  ATTACHMENT: { label: 'توقیف', icon: Lock, color: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-200 dark:border-rose-800' },
  FORFEITURE: { label: 'مصادره', icon: ShieldAlert, color: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800' },
  EVICTION: { label: 'تخلیه', icon: Home, color: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800' },
  SEIZURE: { label: 'ضبط', icon: Package, color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800' },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fa-IR').format(amount);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
}

function getCollectionPercent(execution: CaseExecution): number {
  if (execution.totalAmount === 0) return 0;
  return Math.min(100, Math.round((execution.collectedAmount / execution.totalAmount) * 100));
}

function getProgressBarColor(execution: CaseExecution): string {
  const pct = getCollectionPercent(execution);
  if (pct >= 100) return 'bg-emerald-500';
  if (pct >= 50) return 'bg-blue-500';
  if (pct >= 25) return 'bg-amber-500';
  return 'bg-red-400';
}

export default function CaseExecutionsPage() {
  const { token } = useAppStore();
  const { toast } = useToast();

  const [executions, setExecutions] = useState<CaseExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [selectedExecution, setSelectedExecution] = useState<CaseExecution | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchExecutions = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (search) params.set('search', search);
      if (selectedType !== 'all') params.set('executionType', selectedType);
      if (selectedStatus !== 'all') params.set('status', selectedStatus);

      const res = await fetch(`/api/case-executions?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const data = await res.json();
        setExecutions(data.executions || []);
        setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
      }
    } catch {
      setExecutions([]);
    } finally {
      setLoading(false);
    }
  }, [search, selectedType, selectedStatus, token]);

  useEffect(() => {
    fetchExecutions(1);
  }, [fetchExecutions]);

  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout | null>(null);
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimer) clearTimeout(searchTimer);
    setSearchTimer(setTimeout(() => fetchExecutions(1), 400));
  };

  const handleTypeClick = (type: string) => {
    setSelectedType(type === selectedType ? 'all' : type);
  };

  const handleStatusClick = (status: string) => {
    setSelectedStatus(status === selectedStatus ? 'all' : status);
  };

  const openExecution = (execution: CaseExecution) => {
    setSelectedExecution(execution);
    setDialogOpen(true);
  };

  const goToPage = (page: number) => {
    fetchExecutions(page);
  };

  const totalPages = pagination.pages;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">مدیریت اجرایی پرونده‌ها</h1>
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
          placeholder="جستجو در پرونده‌های اجرایی..."
          className="pr-9 pl-4 h-11 text-sm bg-card shadow-sm"
        />
      </div>

      {/* Execution Type Filter */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Gavel className="w-4 h-4" />
          نوع اجرا
        </div>
        <div className="flex gap-2 flex-wrap">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleTypeClick('all')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all border ${
              selectedType === 'all' ? 'bg-teal-600 text-white border-teal-600 shadow-sm' : 'bg-card text-foreground border-border hover:border-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20'
            }`}>
            همه
          </motion.button>
          {Object.entries(executionTypeConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <motion.button key={key} whileTap={{ scale: 0.95 }} onClick={() => handleTypeClick(key)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5 ${
                  selectedType === key ? 'bg-teal-600 text-white border-teal-600 shadow-sm' : 'bg-card text-foreground border-border hover:border-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20'
                }`}>
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
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleStatusClick('all')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all border ${
              selectedStatus === 'all' ? 'bg-teal-600 text-white border-teal-600 shadow-sm' : 'bg-card text-foreground border-border hover:border-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20'
            }`}>
            همه
          </motion.button>
          {Object.entries(statusConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <motion.button key={key} whileTap={{ scale: 0.95 }} onClick={() => handleStatusClick(key)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5 ${
                  selectedStatus === key ? 'bg-teal-600 text-white border-teal-600 shadow-sm' : 'bg-card text-foreground border-border hover:border-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20'
                }`}>
                <Icon className="w-3.5 h-3.5" />
                {config.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Executions List */}
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
                <Skeleton className="h-2 w-full rounded-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : executions.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Scale className="w-8 h-8 text-muted-foreground" />
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
            {executions.map((execution, index) => {
              const pct = getCollectionPercent(execution);
              const barColor = getProgressBarColor(execution);
              return (
                <motion.div key={execution.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}>
                  <Card className="group cursor-pointer hover:shadow-md hover:border-teal-200 dark:hover:border-teal-800 transition-all"
                    onClick={() => openExecution(execution)}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center shrink-0">
                          {(() => { const Icon = executionTypeConfig[execution.executionType]?.icon || Scale; return <Icon className="w-5 h-5 text-teal-600 dark:text-teal-400" />; })()}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-sm group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                              {execution.caseTitle}
                            </h3>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${executionTypeConfig[execution.executionType]?.color || ''}`}>
                              {executionTypeConfig[execution.executionType]?.label || execution.executionType}
                            </Badge>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${statusConfig[execution.status]?.color || ''}`}>
                              {statusConfig[execution.status]?.label || execution.status}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              پرونده: {execution.caseNumber}
                            </span>
                            <span className="flex items-center gap-1">
                              <Scale className="w-3 h-3" />
                              شماره اجرا: {execution.executionNumber}
                            </span>
                            <span className="flex items-center gap-1">
                              <Landmark className="w-3 h-3" />
                              {execution.court}
                            </span>
                          </div>

                          {/* Collection Progress */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-muted-foreground">وصول شده</span>
                              <div className="flex items-center gap-3">
                                <span className="text-teal-600 dark:text-teal-400 font-medium">{formatCurrency(execution.collectedAmount)} ریال</span>
                                <span className="text-muted-foreground">از</span>
                                <span className="font-medium">{formatCurrency(execution.totalAmount)} ریال</span>
                                <span className="text-muted-foreground">({pct}%)</span>
                              </div>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                                className={`h-full rounded-full ${barColor}`} transition={{ duration: 0.6 }} />
                            </div>
                          </div>
                        </div>

                        {/* Action */}
                        <div className="flex flex-col items-end gap-2 shrink-0 text-[11px] text-muted-foreground">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); openExecution(execution); }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(execution.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {!loading && executions.length > 0 && totalPages > 1 && (
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
                  className={`h-9 w-9 text-xs ${pagination.page === pageNum ? 'bg-teal-600 hover:bg-teal-700 text-white' : ''}`}
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

      {/* Execution Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[95dvh] sm:max-h-[90dvh] overflow-y-auto sm:overflow-y-hidden flex flex-col p-0">
          {selectedExecution && (
            <>
              <DialogHeader className="bg-gradient-to-l from-teal-600 to-cyan-600 p-6 rounded-none">
                <DialogTitle className="text-white flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                    {(() => { const Icon = executionTypeConfig[selectedExecution.executionType]?.icon || Scale; return <Icon className="w-5 h-5 text-white" />; })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold leading-relaxed">{selectedExecution.caseTitle}</h2>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge className="bg-white/20 text-white text-[11px] px-2 py-0.5 border border-white/30 hover:bg-white/30">
                        پرونده: {selectedExecution.caseNumber}
                      </Badge>
                      <Badge className="bg-white/20 text-white text-[11px] px-2 py-0.5 border border-white/30 hover:bg-white/30">
                        اجرا: {selectedExecution.executionNumber}
                      </Badge>
                      <Badge className="bg-white/20 text-white text-[11px] px-2 py-0.5 border border-white/30 hover:bg-white/30">
                        {executionTypeConfig[selectedExecution.executionType]?.label}
                      </Badge>
                      <Badge className="bg-white/20 text-white text-[11px] px-2 py-0.5 border border-white/30 hover:bg-white/30">
                        {statusConfig[selectedExecution.status]?.label}
                      </Badge>
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto sm:overflow-hidden flex flex-col">
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-6">
                    {/* Description */}
                    {selectedExecution.description && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-teal-700 dark:text-teal-400 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          توضیحات
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 rounded-lg p-3">{selectedExecution.description}</p>
                      </div>
                    )}

                    <Separator />

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">شماره پرونده</span>
                        <p className="text-sm font-medium">{selectedExecution.caseNumber}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">عنوان پرونده</span>
                        <p className="text-sm font-medium">{selectedExecution.caseTitle}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">شماره اجرا</span>
                        <p className="text-sm font-medium">{selectedExecution.executionNumber}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">دادگاه</span>
                        <p className="text-sm font-medium flex items-center gap-1.5">
                          <Landmark className="w-4 h-4 text-muted-foreground" />
                          {selectedExecution.court}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Financial Progress */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-teal-700 dark:text-teal-400 flex items-center gap-2">
                        <Banknote className="w-4 h-4" />
                        وضعیت مالی
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-card border rounded-xl p-4 text-center space-y-1">
                          <span className="text-xs text-muted-foreground">مبلغ کل</span>
                          <p className="text-sm font-bold">{formatCurrency(selectedExecution.totalAmount)}</p>
                          <span className="text-[10px] text-muted-foreground">ریال</span>
                        </div>
                        <div className="bg-card border rounded-xl p-4 text-center space-y-1">
                          <span className="text-xs text-muted-foreground">وصول شده</span>
                          <p className="text-sm font-bold text-teal-600 dark:text-teal-400">{formatCurrency(selectedExecution.collectedAmount)}</p>
                          <span className="text-[10px] text-muted-foreground">ریال</span>
                        </div>
                        <div className="bg-card border rounded-xl p-4 text-center space-y-1">
                          <span className="text-xs text-muted-foreground">باقی‌مانده</span>
                          <p className="text-sm font-bold text-red-600 dark:text-red-400">{formatCurrency(selectedExecution.remainingAmount)}</p>
                          <span className="text-[10px] text-muted-foreground">ریال</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">درصد وصول</span>
                          <span className="font-bold text-teal-600">{getCollectionPercent(selectedExecution)}%</span>
                        </div>
                        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${getCollectionPercent(selectedExecution)}%` }}
                            className={`h-full rounded-full ${getProgressBarColor(selectedExecution)}`} transition={{ duration: 0.8 }} />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Status & Type */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">وضعیت:</span>
                        <Badge variant="outline" className={`text-xs px-3 py-1 ${statusConfig[selectedExecution.status]?.color}`}>
                          {statusConfig[selectedExecution.status]?.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">نوع:</span>
                        <Badge variant="outline" className={`text-xs px-3 py-1 ${executionTypeConfig[selectedExecution.executionType]?.color}`}>
                          {executionTypeConfig[selectedExecution.executionType]?.label}
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
                      ایجاد: {formatDate(selectedExecution.createdAt)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      بروزرسانی: {formatDate(selectedExecution.updatedAt)}
                    </span>
                  </div>
                  <Button onClick={() => setDialogOpen(false)} variant="outline" className="text-xs h-8">بستن</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
