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
  PenTool, Search, Filter, Grid3X3 as Grid, List, Eye,
  ChevronLeft, ChevronRight, Clock, FileText, Users, CheckCircle2,
  XCircle, Loader2, ArrowDown, RotateCcw, AlertTriangle,
  Layers, UserCheck, UserX, Circle, Lock,
} from 'lucide-react';

// Types
interface SignatureStep {
  id: string;
  signerName: string;
  signerRole: string | null;
  signerNationalCode: string | null;
  order: number;
  status: 'PENDING' | 'SIGNED' | 'REJECTED';
  signedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
}

interface SigningWorkflow {
  id: string;
  title: string;
  documentType: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  description: string | null;
  signatures: SignatureStep[];
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
const workflowStatusConfig: Record<string, { label: string; color: string; icon: typeof FileText }> = {
  PENDING: { label: 'در انتظار', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', icon: Clock },
  IN_PROGRESS: { label: 'در جریان', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', icon: Loader2 },
  COMPLETED: { label: 'تکمیل شده', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', icon: CheckCircle2 },
  CANCELLED: { label: 'لغو شده', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', icon: XCircle },
};

const signerStatusConfig: Record<string, { label: string; color: string; icon: typeof FileText }> = {
  PENDING: { label: 'در انتظار', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', icon: Circle },
  SIGNED: { label: 'امضا شده', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', icon: CheckCircle2 },
  REJECTED: { label: 'رد شده', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', icon: XCircle },
};

const documentTypeConfig: Record<string, { label: string; color: string }> = {
  contract: { label: 'قرارداد', color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800' },
  letter: { label: 'نامه', color: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border border-teal-200 dark:border-teal-800' },
  declaration: { label: 'اظهارنامه', color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800' },
  power_of_attorney: { label: 'وکالتنامه', color: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-200 dark:border-rose-800' },
  report: { label: 'گزارش', color: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800' },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
}

function getProgressPercent(workflow: SigningWorkflow): number {
  if (workflow.signatures.length === 0) return 0;
  const signed = workflow.signatures.filter(s => s.status === 'SIGNED').length;
  return Math.round((signed / workflow.signatures.length) * 100);
}

function getProgressColor(workflow: SigningWorkflow): string {
  if (workflow.status === 'COMPLETED') return 'bg-emerald-500';
  if (workflow.status === 'CANCELLED') return 'bg-red-500';
  if (workflow.signatures.some(s => s.status === 'REJECTED')) return 'bg-red-400';
  return 'bg-blue-500';
}

export default function SignaturesPage() {
  const { token } = useAppStore();
  const { toast } = useToast();

  const [workflows, setWorkflows] = useState<SigningWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDocType, setSelectedDocType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [selectedWorkflow, setSelectedWorkflow] = useState<SigningWorkflow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchWorkflows = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (search) params.set('search', search);
      if (selectedDocType !== 'all') params.set('documentType', selectedDocType);
      if (selectedStatus !== 'all') params.set('status', selectedStatus);

      const res = await fetch(`/api/signatures?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const data = await res.json();
        setWorkflows(data.workflows || []);
        setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
      }
    } catch {
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  }, [search, selectedDocType, selectedStatus, token]);

  useEffect(() => {
    fetchWorkflows(1);
  }, [fetchWorkflows]);

  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout | null>(null);
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimer) clearTimeout(searchTimer);
    setSearchTimer(setTimeout(() => fetchWorkflows(1), 400));
  };

  const handleDocTypeClick = (type: string) => {
    setSelectedDocType(type === selectedDocType ? 'all' : type);
  };

  const handleStatusClick = (status: string) => {
    setSelectedStatus(status === selectedStatus ? 'all' : status);
  };

  const openWorkflow = (workflow: SigningWorkflow) => {
    setSelectedWorkflow(workflow);
    setDialogOpen(true);
  };

  const goToPage = (page: number) => {
    fetchWorkflows(page);
  };

  const totalPages = pagination.pages;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
            <PenTool className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">امضای الکترونیک</h1>
            <p className="text-xs text-muted-foreground">تعداد کل: {pagination.total}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('grid')}>
            <Grid className="w-4 h-4" />
          </Button>
          <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('list')}>
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
          placeholder="جستجو در فرآیندهای امضا..."
          className="pr-9 pl-4 h-11 text-sm bg-card shadow-sm"
        />
      </div>

      {/* Document Type Filter */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <FileText className="w-4 h-4" />
          نوع سند
        </div>
        <ScrollArea className="w-full" direction="horizontal">
          <div className="flex gap-2 pb-2 min-w-0">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleDocTypeClick('all')}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all border ${
                selectedDocType === 'all' ? 'bg-violet-600 text-white border-violet-600 shadow-sm' : 'bg-card text-foreground border-border hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20'
              }`}>
              همه
            </motion.button>
            {Object.entries(documentTypeConfig).map(([key, config]) => (
              <motion.button key={key} whileTap={{ scale: 0.95 }} onClick={() => handleDocTypeClick(key)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all border ${
                  selectedDocType === key ? 'bg-violet-600 text-white border-violet-600 shadow-sm' : 'bg-card text-foreground border-border hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20'
                }`}>
                {config.label}
              </motion.button>
            ))}
          </div>
        </ScrollArea>
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
              selectedStatus === 'all' ? 'bg-violet-600 text-white border-violet-600 shadow-sm' : 'bg-card text-foreground border-border hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20'
            }`}>
            همه
          </motion.button>
          {Object.entries(workflowStatusConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <motion.button key={key} whileTap={{ scale: 0.95 }} onClick={() => handleStatusClick(key)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5 ${
                  selectedStatus === key ? 'bg-violet-600 text-white border-violet-600 shadow-sm' : 'bg-card text-foreground border-border hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20'
                }`}>
                <Icon className="w-3.5 h-3.5" />
                {config.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Workflows List */}
      {loading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full rounded-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : workflows.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <PenTool className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">نتیجه‌ای یافت نشد</p>
          <p className="text-sm text-muted-foreground mt-1">فیلترهای جستجو را تغییر دهید</p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedDocType}-${selectedStatus}-${viewMode}`}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}
          >
            {workflows.map((workflow, index) => {
              const progress = getProgressPercent(workflow);
              const progressColor = getProgressColor(workflow);
              return (
                <motion.div key={workflow.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}>
                  <Card className="group cursor-pointer hover:shadow-md hover:border-violet-200 dark:hover:border-violet-800 transition-all"
                    onClick={() => openWorkflow(workflow)}>
                    <CardContent className="p-4">
                      {viewMode === 'grid' ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${documentTypeConfig[workflow.documentType]?.color || ''}`}>
                              {documentTypeConfig[workflow.documentType]?.label || workflow.documentType}
                            </Badge>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${workflowStatusConfig[workflow.status]?.color || ''}`}>
                              {workflowStatusConfig[workflow.status]?.label || workflow.status}
                            </Badge>
                          </div>
                          <h3 className="font-bold text-sm group-hover:text-violet-600 transition-colors line-clamp-2">{workflow.title}</h3>
                          {/* Progress */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                              <span>{workflow.signatures.length} امضاکننده</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                                className={`h-full rounded-full ${progressColor}`} transition={{ duration: 0.6 }} />
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(workflow.createdAt)}</span>
                            <span className="flex items-center gap-1">
                              <UserCheck className="w-3 h-3" />
                              {workflow.signatures.filter(s => s.status === 'SIGNED').length}/{workflow.signatures.length}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                            <PenTool className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                          </div>
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-sm group-hover:text-violet-600 transition-colors">{workflow.title}</h3>
                              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${documentTypeConfig[workflow.documentType]?.color || ''}`}>
                                {documentTypeConfig[workflow.documentType]?.label || workflow.documentType}
                              </Badge>
                              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${workflowStatusConfig[workflow.status]?.color || ''}`}>
                                {workflowStatusConfig[workflow.status]?.label || workflow.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                                    className={`h-full rounded-full ${progressColor}`} transition={{ duration: 0.6 }} />
                                </div>
                              </div>
                              <span className="text-[11px] text-muted-foreground shrink-0 flex items-center gap-1">
                                <UserCheck className="w-3 h-3" />{workflow.signatures.filter(s => s.status === 'SIGNED').length}/{workflow.signatures.length}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(workflow.createdAt)}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); openWorkflow(workflow); }}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {!loading && workflows.length > 0 && totalPages > 1 && (
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
                  className={`h-9 w-9 text-xs ${pagination.page === pageNum ? 'bg-violet-600 hover:bg-violet-700 text-white' : ''}`}
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

      {/* Workflow Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[95dvh] sm:max-h-[90dvh] overflow-y-auto sm:overflow-y-hidden flex flex-col p-0">
          {selectedWorkflow && (
            <>
              <DialogHeader className="bg-gradient-to-l from-violet-600 to-purple-600 p-6 rounded-none">
                <DialogTitle className="text-white flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                    <PenTool className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold leading-relaxed">{selectedWorkflow.title}</h2>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge className="bg-white/20 text-white text-[11px] px-2 py-0.5 border border-white/30 hover:bg-white/30">
                        {documentTypeConfig[selectedWorkflow.documentType]?.label || selectedWorkflow.documentType}
                      </Badge>
                      <Badge className="bg-white/20 text-white text-[11px] px-2 py-0.5 border border-white/30 hover:bg-white/30">
                        {workflowStatusConfig[selectedWorkflow.status]?.label}
                      </Badge>
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto sm:overflow-hidden flex flex-col">
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-6">
                    {/* Description */}
                    {selectedWorkflow.description && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-violet-700 dark:text-violet-400 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          توضیحات
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 rounded-lg p-3">{selectedWorkflow.description}</p>
                      </div>
                    )}

                    {/* Progress Overview */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-violet-700 dark:text-violet-400 flex items-center gap-2">
                          <Layers className="w-4 h-4" />
                          وضعیت پیشرفت
                        </h3>
                        <span className="text-sm font-bold text-violet-600">{getProgressPercent(selectedWorkflow)}%</span>
                      </div>
                      <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${getProgressPercent(selectedWorkflow)}%` }}
                          className={`h-full rounded-full ${getProgressColor(selectedWorkflow)}`} transition={{ duration: 0.8 }} />
                      </div>
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>{selectedWorkflow.signatures.filter(s => s.status === 'SIGNED').length} امضا شده</span>
                        <span>{selectedWorkflow.signatures.filter(s => s.status === 'PENDING').length} در انتظار</span>
                        <span>{selectedWorkflow.signatures.filter(s => s.status === 'REJECTED').length} رد شده</span>
                      </div>
                    </div>

                    <Separator />

                    {/* Signatures Timeline */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold text-violet-700 dark:text-violet-400 flex items-center gap-2">
                        <ArrowDown className="w-4 h-4" />
                        زمان‌بندی امضاها
                      </h3>
                      <div className="relative space-y-0">
                        {selectedWorkflow.signatures.sort((a, b) => a.order - b.order).map((sig, idx, arr) => {
                          const StatusIcon = signerStatusConfig[sig.status]?.icon || Circle;
                          return (
                            <div key={sig.id} className="flex gap-3 pb-4 last:pb-0">
                              {/* Timeline line */}
                              <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                  sig.status === 'SIGNED' ? 'bg-emerald-100 dark:bg-emerald-900/40' :
                                  sig.status === 'REJECTED' ? 'bg-red-100 dark:bg-red-900/40' :
                                  'bg-amber-100 dark:bg-amber-900/40'
                                }`}>
                                  <StatusIcon className={`w-4 h-4 ${
                                    sig.status === 'SIGNED' ? 'text-emerald-600 dark:text-emerald-400' :
                                    sig.status === 'REJECTED' ? 'text-red-600 dark:text-red-400' :
                                    'text-amber-600 dark:text-amber-400'
                                  }`} />
                                </div>
                                {idx < arr.length - 1 && (
                                  <div className="w-0.5 flex-1 bg-border mt-1" />
                                )}
                              </div>

                              {/* Signature info */}
                              <div className="flex-1 min-w-0 pt-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-bold">{sig.signerName}</span>
                                  {sig.signerRole && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                                      {sig.signerRole}
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${signerStatusConfig[sig.status]?.color || ''}`}>
                                    {signerStatusConfig[sig.status]?.label}
                                  </Badge>
                                  <span className="text-[10px] text-muted-foreground">مرحله {sig.order}</span>
                                </div>
                                {sig.rejectionReason && (
                                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                    <UserX className="w-3 h-3" />
                                    دلیل رد: {sig.rejectionReason}
                                  </p>
                                )}
                                {sig.signedAt && (
                                  <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    امضا در {formatDate(sig.signedAt)}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                {/* Dialog Footer */}
                <div className="border-t p-4 flex items-center justify-between bg-muted/30">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      ایجاد: {formatDate(selectedWorkflow.createdAt)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5" />
                      بروزرسانی: {formatDate(selectedWorkflow.updatedAt)}
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
