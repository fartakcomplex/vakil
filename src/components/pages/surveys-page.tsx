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
  Search, Filter, Eye, Check, ChevronLeft, ChevronRight,
  Star, Clock, Layers, ClipboardList,
  Users, MessageSquare, CircleDot,
  Calendar, HelpCircle, BarChart3,
  AlertCircle, CheckCircle2, FileEdit,
  XCircle,
} from 'lucide-react';

// Types
interface SurveyQuestion {
  id: string;
  text: string;
  type: string;
  options: string[] | null;
  required: boolean;
  order: number;
}

interface Survey {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  questionCount: number;
  responseCount: number;
  questions: SurveyQuestion[];
  targetAudience: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  closesAt: string | null;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Status config
const statusConfig: Record<string, { label: string; color: string; icon: typeof FileText }> = {
  ACTIVE: { label: 'فعال', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', icon: CheckCircle2 },
  CLOSED: { label: 'بسته', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/40 dark:text-slate-400', icon: XCircle },
  DRAFT: { label: 'پیش‌نویس', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', icon: FileEdit },
};

// Question type config
const questionTypeConfig: Record<string, { label: string; color: string }> = {
  TEXT: { label: 'متنی', color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  SINGLE_CHOICE: { label: 'انتخاب یک‌گزینه‌ای', color: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
  MULTIPLE_CHOICE: { label: 'انتخاب چندگزینه‌ای', color: 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
  RATING: { label: 'امتیازدهی', color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
  YES_NO: { label: 'بله / خیر', color: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
};

// Target audience config
const targetAudienceConfig: Record<string, { label: string }> = {
  ALL: { label: 'همه کاربران' },
  LAWYERS: { label: 'وکلای پایه یک' },
  LEGAL_ADVISORS: { label: 'مشاوران حقوقی' },
  CLIENTS: { label: 'مراجعین' },
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('fa-IR').format(date);
}

export default function SurveysPage() {
  const { token } = useAppStore();
  const { toast } = useToast();

  // State
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch surveys
  const fetchSurveys = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (search) params.set('search', search);
      if (selectedStatus !== 'all') params.set('status', selectedStatus);

      const res = await fetch(`/api/surveys?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const data = await res.json();
        setSurveys(data.surveys || []);
        setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
      }
    } catch {
      setSurveys([]);
    } finally {
      setLoading(false);
    }
  }, [search, selectedStatus, token]);

  useEffect(() => {
    fetchSurveys(1);
  }, [fetchSurveys]);

  // Debounced search
  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout | null>(null);
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimer) clearTimeout(searchTimer);
    setSearchTimer(setTimeout(() => {
      fetchSurveys(1);
    }, 400));
  };

  // Status click
  const handleStatusClick = (status: string) => {
    setSelectedStatus(status === selectedStatus ? 'all' : status);
  };

  // Open survey dialog
  const openSurvey = (survey: Survey) => {
    setSelectedSurvey(survey);
    setDialogOpen(true);
  };

  // Page navigation
  const goToPage = (page: number) => {
    fetchSurveys(page);
  };

  const totalPages = pagination.pages;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">نظرسنجی مشتریان</h1>
            <p className="text-xs text-muted-foreground">
              تعداد کل: {pagination.total}
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="جستجو در نظرسنجی‌ها..."
          className="pr-9 pl-4 h-11 text-sm bg-card shadow-sm"
        />
      </div>

      {/* Status Filter */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="w-4 h-4" />
          وضعیت
        </div>
        <ScrollArea className="w-full" direction="horizontal">
          <div className="flex gap-2 pb-2 min-w-0">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleStatusClick('all')}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all border ${
                selectedStatus === 'all'
                  ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                  : 'bg-card text-foreground border-border hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20'
              }`}
            >
              همه
            </motion.button>
            {Object.entries(statusConfig).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleStatusClick(key)}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5 ${
                    selectedStatus === key
                      ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                      : 'bg-card text-foreground border-border hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {config.label}
                </motion.button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      <Separator />

      {/* Surveys List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : surveys.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <ClipboardList className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">نتیجه‌ای یافت نشد</p>
          <p className="text-sm text-muted-foreground mt-1">فیلترهای جستجو را تغییر دهید</p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedStatus}-${search}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {surveys.map((survey, index) => (
              <motion.div
                key={survey.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <Card
                  className="group cursor-pointer hover:shadow-md hover:border-violet-200 dark:hover:border-violet-800 transition-all overflow-hidden"
                  onClick={() => openSurvey(survey)}
                >
                  <CardContent className="p-0">
                    <div className="flex items-start gap-4 p-4">
                      {/* Icon */}
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        survey.status === 'ACTIVE'
                          ? 'bg-emerald-100 dark:bg-emerald-900/30'
                          : survey.status === 'DRAFT'
                          ? 'bg-amber-100 dark:bg-amber-900/30'
                          : 'bg-slate-100 dark:bg-slate-800/50'
                      }`}>
                        {(() => {
                          const Icon = statusConfig[survey.status]?.icon || ClipboardList;
                          return <Icon className={`w-5 h-5 ${
                            survey.status === 'ACTIVE'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : survey.status === 'DRAFT'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-slate-500 dark:text-slate-400'
                          }`} />;
                        })()}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-sm group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                            {survey.title}
                          </h3>
                          <Badge
                            variant="secondary"
                            className={`text-[11px] px-2 py-0.5 ${statusConfig[survey.status]?.color || ''}`}
                          >
                            {statusConfig[survey.status]?.label || survey.status}
                          </Badge>
                          {survey.targetAudience && targetAudienceConfig[survey.targetAudience] && (
                            <Badge variant="outline" className="text-[10px] px-2 py-0 text-violet-600 border-violet-200 dark:border-violet-800 dark:text-violet-400">
                              <Users className="w-2.5 h-2.5 ml-0.5" />
                              {targetAudienceConfig[survey.targetAudience].label}
                            </Badge>
                          )}
                        </div>

                        {survey.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                            {stripHtml(survey.description)}
                          </p>
                        )}

                        {/* Stats Row */}
                        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <HelpCircle className="w-3 h-3" />
                            {survey.questionCount} سؤال
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {survey.responseCount} پاسخ
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(survey.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="shrink-0 flex items-center gap-2">
                        {survey.status === 'ACTIVE' && survey.closesAt && (
                          <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
                            <Clock className="w-3 h-3" />
                            تا {formatDate(survey.closesAt)}
                          </div>
                        )}
                        <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                          <Eye className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                        </div>
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
      {!loading && surveys.length > 0 && totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 pt-4"
        >
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => goToPage(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={pagination.page === pageNum ? 'default' : 'outline'}
                  size="icon"
                  className={`h-9 w-9 text-xs ${pagination.page === pageNum ? 'bg-violet-600 hover:bg-violet-700 text-white' : ''}`}
                  onClick={() => goToPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => goToPage(pagination.page + 1)}
            disabled={pagination.page >= totalPages}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {/* Survey Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[95dvh] sm:max-h-[90dvh] overflow-y-auto sm:overflow-y-hidden flex flex-col p-0">
          {selectedSurvey && (
            <>
              {/* Dialog Header */}
              <DialogHeader className="bg-gradient-to-l from-violet-600 to-purple-600 p-6 rounded-none">
                <DialogTitle className="text-white flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                    {(() => {
                      const Icon = statusConfig[selectedSurvey.status]?.icon || ClipboardList;
                      return <Icon className="w-5 h-5 text-white" />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold leading-relaxed">{selectedSurvey.title}</h2>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge className="bg-white/20 text-white text-[11px] px-2 py-0.5 border border-white/30 hover:bg-white/30">
                        {statusConfig[selectedSurvey.status]?.label || selectedSurvey.status}
                      </Badge>
                      {selectedSurvey.targetAudience && targetAudienceConfig[selectedSurvey.targetAudience] && (
                        <Badge className="bg-white/20 text-white text-[11px] px-2 py-0.5 border border-white/30 hover:bg-white/30">
                          {targetAudienceConfig[selectedSurvey.targetAudience].label}
                        </Badge>
                      )}
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              {/* Dialog Body */}
              <div className="flex-1 overflow-y-auto sm:overflow-hidden flex flex-col">
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-6">
                    {/* Description */}
                    {selectedSurvey.description && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-violet-700 dark:text-violet-400 flex items-center gap-2">
                          <ClipboardList className="w-4 h-4" />
                          توضیحات
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 rounded-lg p-3">
                          {stripHtml(selectedSurvey.description)}
                        </p>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-violet-600 dark:text-violet-400">{selectedSurvey.questionCount}</div>
                        <div className="text-[11px] text-muted-foreground">تعداد سؤالات</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-violet-600 dark:text-violet-400">{selectedSurvey.responseCount}</div>
                        <div className="text-[11px] text-muted-foreground">تعداد پاسخ‌ها</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-violet-600 dark:text-violet-400">
                          {selectedSurvey.questionCount > 0 ? Math.round((selectedSurvey.responseCount / selectedSurvey.questionCount) * 10) / 10 : 0}
                        </div>
                        <div className="text-[11px] text-muted-foreground">میانگین پاسخ/سؤال</div>
                      </div>
                    </div>

                    <Separator />

                    {/* Survey Questions */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-violet-700 dark:text-violet-400 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        سؤالات نظرسنجی
                      </h3>
                      {selectedSurvey.questions && selectedSurvey.questions.length > 0 ? (
                        <div className="space-y-3">
                          {selectedSurvey.questions
                            .sort((a, b) => a.order - b.order)
                            .map((question, qIndex) => (
                            <div key={question.id} className="bg-card border rounded-xl p-4 space-y-2">
                              <div className="flex items-start gap-2">
                                <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0 mt-0.5">
                                  <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400">{qIndex + 1}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium leading-relaxed">{question.text}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className={`text-[10px] px-2 py-0 ${questionTypeConfig[question.type]?.color || ''}`}>
                                      {questionTypeConfig[question.type]?.label || question.type}
                                    </Badge>
                                    {question.required && (
                                      <Badge variant="outline" className="text-[10px] px-2 py-0 text-rose-500 border-rose-200 dark:border-rose-800">
                                        <AlertCircle className="w-2.5 h-2.5 ml-0.5" />
                                        الزامی
                                      </Badge>
                                    )}
                                  </div>
                                  {/* Options */}
                                  {question.options && question.options.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                      {question.options.map((option, oIndex) => (
                                        <div key={oIndex} className="flex items-center gap-2 text-xs text-muted-foreground">
                                          <CircleDot className="w-3 h-3 text-violet-400 shrink-0" />
                                          {option}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          سؤالی برای نمایش وجود ندارد
                        </p>
                      )}
                    </div>
                  </div>
                </ScrollArea>

                {/* Dialog Footer */}
                <div className="border-t p-4 flex items-center justify-between bg-muted/30">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      ایجاد: {formatDate(selectedSurvey.createdAt)}
                    </span>
                    {selectedSurvey.publishedAt && (
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        انتشار: {formatDate(selectedSurvey.publishedAt)}
                      </span>
                    )}
                    {selectedSurvey.closesAt && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        مهلت: {formatDate(selectedSurvey.closesAt)}
                      </span>
                    )}
                  </div>
                  <Button onClick={() => setDialogOpen(false)} variant="outline" className="text-xs h-8">
                    بستن
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
