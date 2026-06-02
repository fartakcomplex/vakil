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
  Heart, Search, Filter, Grid3X3 as Grid, List, Eye,
  ChevronLeft, ChevronRight, Clock, FileText, Users, User,
  ChevronDown, AlertTriangle, CheckCircle2, XCircle, Loader2,
  Briefcase, Scale, Home, HardHat, Zap, UserCheck, UserPlus,
  Banknote, Phone, MapPin, IdCard,
} from 'lucide-react';

// Types
interface ProBonoCase {
  id: string;
  title: string;
  description: string | null;
  caseType: 'civil' | 'criminal' | 'family' | 'labor';
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  incomeLevel: string | null;
  applicantName: string;
  applicantNationalCode: string | null;
  applicantPhone: string | null;
  applicantAddress: string | null;
  assignedLawyerId: string | null;
  assignedLawyerName: string | null;
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
  ASSIGNED: { label: 'تخصیص داده شده', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300', icon: UserCheck },
  IN_PROGRESS: { label: 'در جریان', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', icon: Loader2 },
  COMPLETED: { label: 'تکمیل شده', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', icon: CheckCircle2 },
  REJECTED: { label: 'رد شده', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', icon: XCircle },
};

// Priority config
const priorityConfig: Record<string, { label: string; color: string; icon: typeof FileText }> = {
  LOW: { label: 'کم', color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/40 dark:text-gray-400', icon: ChevronDown },
  MEDIUM: { label: 'متوسط', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', icon: ChevronDown },
  HIGH: { label: 'زیاد', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300', icon: AlertTriangle },
  URGENT: { label: 'فوری', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', icon: Zap },
};

// Case type config
const caseTypeConfig: Record<string, { label: string; icon: typeof FileText; color: string }> = {
  civil: { label: 'مدنی', icon: Scale, color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800' },
  criminal: { label: 'کیفری', icon: Briefcase, color: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800' },
  family: { label: 'خانواده', icon: Users, color: 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 border border-pink-200 dark:border-pink-800' },
  labor: { label: 'کار', icon: HardHat, color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800' },
};

// Income level labels
const incomeLevelLabels: Record<string, string> = {
  'very_low': 'بسیار کم',
  'low': 'کم',
  'medium': 'متوسط',
  'none': 'بدون درآمد',
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
}

export default function ProBonoPage() {
  const { token } = useAppStore();
  const { toast } = useToast();

  const [cases, setCases] = useState<ProBonoCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCaseType, setSelectedCaseType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [selectedCase, setSelectedCase] = useState<ProBonoCase | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchCases = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (search) params.set('search', search);
      if (selectedCaseType !== 'all') params.set('caseType', selectedCaseType);
      if (selectedStatus !== 'all') params.set('status', selectedStatus);
      if (selectedPriority !== 'all') params.set('priority', selectedPriority);

      const res = await fetch(`/api/pro-bono?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const data = await res.json();
        setCases(data.cases || []);
        setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
      }
    } catch {
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCaseType, selectedStatus, selectedPriority, token]);

  useEffect(() => {
    fetchCases(1);
  }, [fetchCases]);

  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout | null>(null);
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimer) clearTimeout(searchTimer);
    setSearchTimer(setTimeout(() => fetchCases(1), 400));
  };

  const handleCaseTypeClick = (type: string) => {
    setSelectedCaseType(type === selectedCaseType ? 'all' : type);
  };

  const handleStatusClick = (status: string) => {
    setSelectedStatus(status === selectedStatus ? 'all' : status);
  };

  const handlePriorityClick = (priority: string) => {
    setSelectedPriority(priority === selectedPriority ? 'all' : priority);
  };

  const openCase = (proCase: ProBonoCase) => {
    setSelectedCase(proCase);
    setDialogOpen(true);
  };

  const goToPage = (page: number) => {
    fetchCases(page);
  };

  const totalPages = pagination.pages;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">وکالت معاضدتی</h1>
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
          placeholder="جستجو در پرونده‌های معاضدتی..."
          className="pr-9 pl-4 h-11 text-sm bg-card shadow-sm"
        />
      </div>

      {/* Case Type Filter */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Briefcase className="w-4 h-4" />
          نوع پرونده
        </div>
        <div className="flex gap-2 flex-wrap">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleCaseTypeClick('all')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all border ${
              selectedCaseType === 'all' ? 'bg-rose-600 text-white border-rose-600 shadow-sm' : 'bg-card text-foreground border-border hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20'
            }`}>
            همه
          </motion.button>
          {Object.entries(caseTypeConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <motion.button key={key} whileTap={{ scale: 0.95 }} onClick={() => handleCaseTypeClick(key)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5 ${
                  selectedCaseType === key ? 'bg-rose-600 text-white border-rose-600 shadow-sm' : 'bg-card text-foreground border-border hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20'
                }`}>
                <Icon className="w-3.5 h-3.5" />
                {config.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Priority Filter */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <AlertTriangle className="w-4 h-4" />
          اولویت
        </div>
        <div className="flex gap-2 flex-wrap">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => handlePriorityClick('all')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all border ${
              selectedPriority === 'all' ? 'bg-rose-600 text-white border-rose-600 shadow-sm' : 'bg-card text-foreground border-border hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20'
            }`}>
            همه
          </motion.button>
          {Object.entries(priorityConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <motion.button key={key} whileTap={{ scale: 0.95 }} onClick={() => handlePriorityClick(key)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5 ${
                  selectedPriority === key ? 'bg-rose-600 text-white border-rose-600 shadow-sm' : 'bg-card text-foreground border-border hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20'
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
              selectedStatus === 'all' ? 'bg-rose-600 text-white border-rose-600 shadow-sm' : 'bg-card text-foreground border-border hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20'
            }`}>
            همه
          </motion.button>
          {Object.entries(statusConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <motion.button key={key} whileTap={{ scale: 0.95 }} onClick={() => handleStatusClick(key)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5 ${
                  selectedStatus === key ? 'bg-rose-600 text-white border-rose-600 shadow-sm' : 'bg-card text-foreground border-border hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20'
                }`}>
                <Icon className="w-3.5 h-3.5" />
                {config.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Cases List */}
      {loading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : cases.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">نتیجه‌ای یافت نشد</p>
          <p className="text-sm text-muted-foreground mt-1">فیلترهای جستجو را تغییر دهید</p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedCaseType}-${selectedPriority}-${selectedStatus}-${viewMode}`}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}
          >
            {cases.map((proCase, index) => (
              <motion.div key={proCase.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}>
                <Card className="group cursor-pointer hover:shadow-md hover:border-rose-200 dark:hover:border-rose-800 transition-all overflow-hidden relative"
                  onClick={() => openCase(proCase)}>
                  {/* Urgent Badge */}
                  {proCase.priority === 'URGENT' && (
                    <div className="absolute top-2 left-2 z-10">
                      <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0 animate-pulse">
                        <Zap className="w-2.5 h-2.5 ml-0.5" />
                        فوری
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-0">
                    {viewMode === 'grid' ? (
                      /* Grid View */
                      <div className="space-y-3 p-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${caseTypeConfig[proCase.caseType]?.color || ''}`}>
                            {caseTypeConfig[proCase.caseType]?.label || proCase.caseType}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${statusConfig[proCase.status]?.color || ''}`}>
                              {statusConfig[proCase.status]?.label || proCase.status}
                            </Badge>
                            {proCase.priority !== 'URGENT' && (
                              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priorityConfig[proCase.priority]?.color || ''}`}>
                                {priorityConfig[proCase.priority]?.label || proCase.priority}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <h3 className="font-bold text-sm group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-2 leading-relaxed">
                          {proCase.title}
                        </h3>

                        {proCase.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{proCase.description}</p>
                        )}

                        {/* Applicant Info */}
                        <div className="space-y-1 text-[11px] text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>متقاضی: <span className="font-medium text-foreground">{proCase.applicantName}</span></span>
                          </div>
                          {proCase.incomeLevel && (
                            <div className="flex items-center gap-1">
                              <Banknote className="w-3 h-3" />
                              <span>سطح درآمد: {incomeLevelLabels[proCase.incomeLevel] || proCase.incomeLevel}</span>
                            </div>
                          )}
                          {proCase.assignedLawyerName && (
                            <div className="flex items-center gap-1">
                              <UserCheck className="w-3 h-3" />
                              <span>وکیل: <span className="font-medium text-foreground">{proCase.assignedLawyerName}</span></span>
                            </div>
                          )}
                        </div>

                        <Separator className="my-1" />

                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(proCase.createdAt)}
                          </span>
                          {!proCase.assignedLawyerName && proCase.status === 'PENDING' && (
                            <Button size="sm" className="h-7 text-[10px] gap-1 bg-rose-600 hover:bg-rose-700 text-white"
                              onClick={(e) => { e.stopPropagation(); toast({ title: 'تخصیص وکیل', description: 'این قابلیت به زودی فعال خواهد شد.', variant: 'default' }); }}>
                              <UserPlus className="w-3 h-3" />
                              تخصیص وکیل
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* List View */
                      <div className="flex items-start gap-4 p-4">
                        {/* Icon */}
                        <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
                          {(() => { const Icon = caseTypeConfig[proCase.caseType]?.icon || Heart; return <Icon className="w-5 h-5 text-rose-600 dark:text-rose-400" />; })()}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-sm group-hover:text-rose-600 transition-colors">{proCase.title}</h3>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${caseTypeConfig[proCase.caseType]?.color || ''}`}>
                              {caseTypeConfig[proCase.caseType]?.label}
                            </Badge>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${statusConfig[proCase.status]?.color || ''}`}>
                              {statusConfig[proCase.status]?.label}
                            </Badge>
                            {proCase.priority === 'URGENT' ? (
                              <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0 animate-pulse">
                                <Zap className="w-2.5 h-2.5 ml-0.5" />
                                فوری
                              </Badge>
                            ) : (
                              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priorityConfig[proCase.priority]?.color || ''}`}>
                                {priorityConfig[proCase.priority]?.label}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1"><User className="w-3 h-3" />{proCase.applicantName}</span>
                            {proCase.incomeLevel && (
                              <span className="flex items-center gap-1"><Banknote className="w-3 h-3" />{incomeLevelLabels[proCase.incomeLevel] || proCase.incomeLevel}</span>
                            )}
                            {proCase.assignedLawyerName && (
                              <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" />وکیل: {proCase.assignedLawyerName}</span>
                            )}
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(proCase.createdAt)}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); openCase(proCase); }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {!proCase.assignedLawyerName && proCase.status === 'PENDING' && (
                            <Button size="sm" className="h-8 text-[10px] gap-1 bg-rose-600 hover:bg-rose-700 text-white"
                              onClick={(e) => { e.stopPropagation(); toast({ title: 'تخصیص وکیل', description: 'این قابلیت به زودی فعال خواهد شد.', variant: 'default' }); }}>
                              <UserPlus className="w-3 h-3" />
                              تخصیص
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {!loading && cases.length > 0 && totalPages > 1 && (
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
                  className={`h-9 w-9 text-xs ${pagination.page === pageNum ? 'bg-rose-600 hover:bg-rose-700 text-white' : ''}`}
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

      {/* Case Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[95dvh] sm:max-h-[90dvh] overflow-y-auto sm:overflow-y-hidden flex flex-col p-0">
          {selectedCase && (
            <>
              <DialogHeader className="bg-gradient-to-l from-rose-600 to-pink-600 p-6 rounded-none">
                <DialogTitle className="text-white flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                    {(() => { const Icon = caseTypeConfig[selectedCase.caseType]?.icon || Heart; return <Icon className="w-5 h-5 text-white" />; })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold leading-relaxed">{selectedCase.title}</h2>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge className="bg-white/20 text-white text-[11px] px-2 py-0.5 border border-white/30 hover:bg-white/30">
                        {caseTypeConfig[selectedCase.caseType]?.label || selectedCase.caseType}
                      </Badge>
                      <Badge className="bg-white/20 text-white text-[11px] px-2 py-0.5 border border-white/30 hover:bg-white/30">
                        {statusConfig[selectedCase.status]?.label || selectedCase.status}
                      </Badge>
                      <Badge className="bg-white/20 text-white text-[11px] px-2 py-0.5 border border-white/30 hover:bg-white/30">
                        اولویت: {priorityConfig[selectedCase.priority]?.label || selectedCase.priority}
                      </Badge>
                      {selectedCase.priority === 'URGENT' && (
                        <Badge className="bg-amber-400 text-amber-900 text-[11px] px-2 py-0.5">
                          <Zap className="w-3 h-3 ml-0.5" />فوری
                        </Badge>
                      )}
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto sm:overflow-hidden flex flex-col">
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-6">
                    {/* Description */}
                    {selectedCase.description && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          شرح پرونده
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 rounded-lg p-3">{selectedCase.description}</p>
                      </div>
                    )}

                    <Separator />

                    {/* Applicant Info */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        اطلاعات متقاضی
                      </h3>
                      <div className="grid grid-cols-2 gap-4 bg-muted/30 rounded-xl p-4">
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">نام متقاضی</span>
                          <p className="text-sm font-medium">{selectedCase.applicantName}</p>
                        </div>
                        {selectedCase.applicantNationalCode && (
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">کد ملی</span>
                            <p className="text-sm font-medium flex items-center gap-1.5">
                              <IdCard className="w-4 h-4 text-muted-foreground" />
                              {selectedCase.applicantNationalCode}
                            </p>
                          </div>
                        )}
                        {selectedCase.applicantPhone && (
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">شماره تماس</span>
                            <p className="text-sm font-medium flex items-center gap-1.5">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              {selectedCase.applicantPhone}
                            </p>
                          </div>
                        )}
                        {selectedCase.applicantAddress && (
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">آدرس</span>
                            <p className="text-sm font-medium flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              {selectedCase.applicantAddress}
                            </p>
                          </div>
                        )}
                        {selectedCase.incomeLevel && (
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">سطح درآمد</span>
                            <p className="text-sm font-medium flex items-center gap-1.5">
                              <Banknote className="w-4 h-4 text-muted-foreground" />
                              {incomeLevelLabels[selectedCase.incomeLevel] || selectedCase.incomeLevel}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Assigned Lawyer Info */}
                    {selectedCase.assignedLawyerName && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <h3 className="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                            <UserCheck className="w-4 h-4" />
                            وکیل تخصیص داده شده
                          </h3>
                          <div className="bg-muted/30 rounded-xl p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                              <UserCheck className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                            </div>
                            <div>
                              <p className="text-sm font-bold">{selectedCase.assignedLawyerName}</p>
                              <p className="text-[11px] text-muted-foreground">وکیل معاضدتی</p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <Separator />

                    {/* Status & Type Summary */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">وضعیت:</span>
                        <Badge variant="outline" className={`text-xs px-3 py-1 ${statusConfig[selectedCase.status]?.color}`}>
                          {statusConfig[selectedCase.status]?.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">نوع:</span>
                        <Badge variant="outline" className={`text-xs px-3 py-1 ${caseTypeConfig[selectedCase.caseType]?.color}`}>
                          {caseTypeConfig[selectedCase.caseType]?.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">اولویت:</span>
                        <Badge variant="outline" className={`text-xs px-3 py-1 ${priorityConfig[selectedCase.priority]?.color}`}>
                          {priorityConfig[selectedCase.priority]?.label}
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
                      ایجاد: {formatDate(selectedCase.createdAt)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      بروزرسانی: {formatDate(selectedCase.updatedAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!selectedCase.assignedLawyerName && selectedCase.status === 'PENDING' && (
                      <Button className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-8 gap-1.5"
                        onClick={() => toast({ title: 'تخصیص وکیل', description: 'این قابلیت به زودی فعال خواهد شد.', variant: 'default' })}>
                        <UserPlus className="w-3.5 h-3.5" />
                        تخصیص وکیل
                      </Button>
                    )}
                    <Button onClick={() => setDialogOpen(false)} variant="outline" className="text-xs h-8">بستن</Button>
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
