'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/persian';
import { formatDate, getStatusColor, getPriorityColor, getCaseTypeName, getStatusName, toPersianNumber, formatCurrency, getRelativeTime, getInitials } from '@/lib/utils-helpers';
import {
  Briefcase, Plus, Search, LayoutGrid, List, ArrowLeft, FileText, MessageSquare, Clock,
  CalendarDays, StickyNote, Gavel, ChevronLeft, MoreHorizontal, Upload, X,
  FileCheck, AlertTriangle, CheckCircle2, Circle, Timer, User, Building, Scale,
  ChevronDown, Filter, Users, Loader2, Check,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { CaseStatus, CasePriority, CaseType } from '@/lib/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// Mock timeline events
const mockTimeline = [
  { id: '1', title: 'ثبت پرونده', desc: 'پرونده در سیستم ثبت شد', type: 'create', date: '2024-01-15', icon: FileCheck, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40' },
  { id: '2', title: 'تکمیل مدارک', desc: 'تمامی مدارک اولیه جمع‌آوری شد', type: 'document', date: '2024-01-20', icon: FileText, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/40' },
  { id: '3', title: 'ارسال به دادگاه', desc: 'لایحه اولیه به دادگاه ارسال شد', type: 'filing', date: '2024-02-01', icon: Gavel, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/40' },
  { id: '4', title: 'جلسه اول دادگاه', desc: 'جلسه رسیدگی اولیه برگزار شد', type: 'hearing', date: '2024-03-10', icon: CalendarDays, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/40' },
  { id: '5', title: 'درخواست Evidence', desc: 'درخواست ارائه مدارک بیشتر ثبت شد', type: 'note', date: '2024-03-25', icon: StickyNote, color: 'text-teal-600 bg-teal-100 dark:bg-teal-900/40' },
];

// Mock notes
const mockNotes = [
  { id: '1', title: 'جلسه با موکل', content: 'موکل در مورد روند پرونده سؤالاتی داشت. نیاز به آماده‌سازی گزارش پیشرفت است.', date: '2024-03-20', pinned: true },
  { id: '2', title: 'یادداشت داخلی', content: 'قاضی درخواست لایحه تکمیلی داده. مهلت ارسال ۱۰ روز است.', date: '2024-03-25', pinned: false },
];

// Mock hearings
const mockHearings = [
  { id: '1', title: 'جلسه رسیدگی اولیه', date: '2024-03-10', time: '10:00', location: 'دادگاه عمومی تهران، شعبه ۱۲', judge: 'قاضی رضایی', status: 'COMPLETED' },
  { id: '2', title: 'جلسه رسیدگی دوم', date: '2024-05-15', time: '09:30', location: 'دادگاه عمومی تهران، شعبه ۱۲', judge: 'قاضی رضایی', status: 'SCHEDULED' },
];

// Mock deadlines
const mockDeadlines = [
  { id: '1', title: 'ارسال لایحه تکمیلی', date: '2024-04-05', isCompleted: false },
  { id: '2', title: 'ارائه مدارک مالکیت', date: '2024-04-20', isCompleted: true },
  { id: '3', title: 'پرداخت هزینه دادرسی', date: '2024-03-30', isCompleted: true },
];

// Mock documents
const mockDocuments = [
  { id: '1', name: 'لایحه دفاعیه اولیه.pdf', type: 'PDF', size: 2450000, date: '2024-02-01' },
  { id: '2', name: 'قرارداد اصلی.jpg', type: 'Image', size: 1890000, date: '2024-01-15' },
  { id: '3', name: 'استشهادیه.pdf', type: 'PDF', size: 780000, date: '2024-03-10' },
  { id: '4', name: 'پاسخ به دادخواست.docx', type: 'Word', size: 560000, date: '2024-03-25' },
];

export default function CasesPage() {
  const { cases, setCases, users, setPage } = useAppStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [newCase, setNewCase] = useState({
    title: '', type: 'civil' as CaseType, priority: 'MEDIUM' as CasePriority,
    description: '', clientId: '', summary: '',
    court: '', courtBranch: '', judgeName: '',
    filingDate: '', nextHearing: '',
    lawyerId: '', internId: '', tags: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const filtered = useMemo(() => {
    return cases.filter((c) => {
      const matchSearch = !search || c.title.includes(search) || c.caseNumber.includes(search);
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchType = typeFilter === 'all' || c.type === typeFilter;
      const matchPriority = priorityFilter === 'all' || c.priority === priorityFilter;
      return matchSearch && matchStatus && matchType && matchPriority;
    });
  }, [cases, search, statusFilter, typeFilter, priorityFilter]);

  const selected = cases.find((c) => c.id === selectedCase);
  const clients = users.filter((u) => u.role === 'CLIENT');
  const lawyers = users.filter((u) => u.role === 'LAWYER');
  const interns = users.filter((u) => u.role === 'INTERN');

  // Case count by status
  const caseCounts = useMemo(() => {
    const counts: Record<string, number> = { OPEN: 0, IN_PROGRESS: 0, PENDING: 0, CLOSED: 0, ARCHIVED: 0 };
    cases.forEach((c) => { if (counts[c.status] !== undefined) counts[c.status]++; });
    return counts;
  }, [cases]);

  // Case progress based on timeline
  const caseProgress = useMemo(() => {
    if (!selected) return 0;
    const statuses = ['OPEN', 'IN_PROGRESS', 'PENDING', 'CLOSED'];
    const idx = statuses.indexOf(selected.status);
    return ((idx + 1) / statuses.length) * 100;
  }, [selected]);

  const handleCreate = async () => {
    const newErrors: Record<string, string> = {};
    if (!newCase.title.trim()) newErrors.title = 'عنوان پرونده الزامی است';
    if (!newCase.clientId) newErrors.clientId = 'انتخاب موکل الزامی است';
    if (!newCase.description.trim()) newErrors.description = 'توضیحات پرونده الزامی است';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    setErrors({});
    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${useAppStore.getState().token}` },
        body: JSON.stringify({
          ...newCase,
          tags: newCase.tags ? newCase.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCases([data.case || data.data || data, ...cases]);
        setDialogOpen(false);
        setNewCase({ title: '', type: 'civil', priority: 'MEDIUM', description: '', clientId: '', summary: '', court: '', courtBranch: '', judgeName: '', filingDate: '', nextHearing: '', lawyerId: '', internId: '', tags: '' });
        setErrors({});
        toast({ title: 'پرونده جدید ثبت شد', description: 'پرونده با موفقیت ایجاد شد', variant: 'default' });
      } else {
        const err = await res.json().catch(() => ({}));
        toast({ title: 'خطا', description: err.error || 'خطا در ثبت پرونده', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'خطا', description: 'خطا در ارتباط با سرور', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (newStatus: CaseStatus) => {
    if (!selected) return;
    // Mock status change
    const updatedCases = cases.map((c) =>
      c.id === selected.id ? { ...c, status: newStatus, updatedAt: new Date().toISOString() } : c
    );
    setCases(updatedCases);
  };

  if (selected) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Case Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedCase(null)}>
            <ArrowLeft className="w-4 h-4 ml-1" /> بازگشت به لیست
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold">{selected.title}</h1>
              <Badge className={getStatusColor(selected.status)}>{getStatusName(selected.status)}</Badge>
              <Badge className={getPriorityColor(selected.priority)}>{t(`priority.${selected.priority}`)}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{selected.caseNumber} · {getCaseTypeName(selected.type)}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <ChevronDown className="w-3.5 h-3.5" />
                تغییر وضعیت
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {(['OPEN', 'IN_PROGRESS', 'PENDING', 'CLOSED', 'ARCHIVED'] as CaseStatus[]).map((s) => (
                <DropdownMenuItem key={s} onClick={() => handleStatusChange(s)} disabled={s === selected.status}>
                  <span className={`w-2 h-2 rounded-full ml-2 ${s === 'OPEN' ? 'bg-emerald-500' : s === 'IN_PROGRESS' ? 'bg-blue-500' : s === 'PENDING' ? 'bg-amber-500' : s === 'CLOSED' ? 'bg-gray-500' : 'bg-slate-400'}`} />
                  {getStatusName(s)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">پیشرفت پرونده</span>
              <span className="text-xs text-muted-foreground">{toPersianNumber(Math.round(caseProgress))}%</span>
            </div>
            <Progress value={caseProgress} className="h-2" />
            <div className="flex justify-between mt-2">
              {['OPEN', 'IN_PROGRESS', 'PENDING', 'CLOSED'].map((s, i) => (
                <div key={s} className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${selected.status === s || ['OPEN', 'IN_PROGRESS', 'PENDING', 'CLOSED'].indexOf(selected.status) > i ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                  <span className="text-[10px] text-muted-foreground">{getStatusName(s)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="overview" className="text-xs gap-1"><Briefcase className="w-3.5 h-3.5" />خلاصه</TabsTrigger>
            <TabsTrigger value="documents" className="text-xs gap-1"><FileText className="w-3.5 h-3.5" />اسناد</TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs gap-1"><Clock className="w-3.5 h-3.5" />تایم‌لاین</TabsTrigger>
            <TabsTrigger value="notes" className="text-xs gap-1"><StickyNote className="w-3.5 h-3.5" />یادداشت‌ها</TabsTrigger>
            <TabsTrigger value="hearings" className="text-xs gap-1"><Gavel className="w-3.5 h-3.5" />جلسات</TabsTrigger>
            <TabsTrigger value="deadlines" className="text-xs gap-1"><Timer className="w-3.5 h-3.5" />مهلت‌ها</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Scale className="w-4 h-4 text-emerald-500" />
                    اطلاعات پرونده
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">نوع پرونده</p>
                      <Badge variant="secondary">{getCaseTypeName(selected.type)}</Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">اولویت</p>
                      <Badge className={getPriorityColor(selected.priority)}>{t(`priority.${selected.priority}`)}</Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">دادگاه</p>
                      <p className="font-medium">{selected.court || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">شعبه</p>
                      <p className="font-medium">{selected.courtBranch || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">قاضی</p>
                      <p className="font-medium">{selected.judgeName || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">تاریخ ثبت</p>
                      <p className="font-medium">{selected.filingDate ? formatDate(selected.filingDate) : '—'}</p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <p className="text-xs text-muted-foreground">جلسه بعدی</p>
                      <p className="font-medium">{selected.nextHearing ? formatDate(selected.nextHearing) : '—'}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">توضیحات</p>
                    <p className="text-sm leading-relaxed">{selected.description || 'توضیحاتی ثبت نشده'}</p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-500" />
                      اطراف پرونده
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-700">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">وکیل</p>
                        <p className="text-sm font-medium">{selected.lawyer ? `${selected.lawyer.firstName} ${selected.lawyer.lastName}` : '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700">
                        <Building className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">موکل</p>
                        <p className="text-sm font-medium">{selected.client ? `${selected.client.firstName} ${selected.client.lastName}` : '—'}</p>
                      </div>
                    </div>
                    {selected.intern && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-700">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">کارآموز</p>
                          <p className="text-sm font-medium">{selected.intern.firstName} {selected.intern.lastName}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* DOCUMENTS TAB */}
          <TabsContent value="documents">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-500" />
                    اسناد پرونده
                  </CardTitle>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
                    <Upload className="w-3.5 h-3.5" /> بارگذاری مدرک
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group">
                      <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-600 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(doc.date)} · {(doc.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Search className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TIMELINE TAB */}
          <TabsContent value="timeline">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  تایم‌لاین پرونده
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-border" />
                  <div className="space-y-6">
                    {mockTimeline.map((event, idx) => (
                      <div key={event.id} className="flex gap-4 relative">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 ${event.color}`}>
                          <event.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium">{event.title}</p>
                            <Badge variant="outline" className="text-[10px]">{formatDate(event.date)}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{event.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NOTES TAB */}
          <TabsContent value="notes">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <StickyNote className="w-4 h-4 text-emerald-500" />
                    یادداشت‌ها
                  </CardTitle>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1" onClick={() => setNoteDialogOpen(true)}>
                    <Plus className="w-3.5 h-3.5" /> یادداشت جدید
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockNotes.map((note) => (
                    <div key={note.id} className={`p-4 rounded-xl border ${note.pinned ? 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10' : 'border-border'} hover:shadow-sm transition-shadow`}>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm font-medium">{note.title}</p>
                        {note.pinned && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                        <span className="text-[10px] text-muted-foreground mr-auto">{formatDate(note.date)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{note.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
              <DialogContent>
                <DialogHeader><DialogTitle>یادداشت جدید</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1"><Label className="text-xs">عنوان</Label><Input value={newNote.title} onChange={(e) => setNewNote({ ...newNote, title: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">محتوا</Label><Textarea value={newNote.content} onChange={(e) => setNewNote({ ...newNote, content: e.target.value })} rows={4} /></div>
                  <Button onClick={() => setNoteDialogOpen(false)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">ذخیره یادداشت</Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* HEARINGS TAB */}
          <TabsContent value="hearings">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Gavel className="w-4 h-4 text-emerald-500" />
                  جلسات دادگاه
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockHearings.map((hearing) => (
                    <div key={hearing.id} className="flex items-start gap-4 p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                      <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${hearing.status === 'COMPLETED' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700'}`}>
                        <CalendarDays className="w-4 h-4" />
                        <span className="text-[8px] font-bold mt-0.5">{formatDate(hearing.date)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium">{hearing.title}</p>
                          <Badge className={getStatusColor(hearing.status)}>{t(`hearingStatus.${hearing.status}`)}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{hearing.time}</span>
                          <span className="flex items-center gap-1"><Building className="w-3 h-3" />{hearing.location}</span>
                          <span className="flex items-center gap-1"><User className="w-3 h-3" />{hearing.judge}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DEADLINES TAB */}
          <TabsContent value="deadlines">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Timer className="w-4 h-4 text-amber-500" />
                  مهلت‌ها
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockDeadlines.map((deadline) => (
                    <div key={deadline.id} className={`flex items-center gap-4 p-4 rounded-xl border ${deadline.isCompleted ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10'} transition-colors`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${deadline.isCompleted ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-600'}`}>
                        {deadline.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${deadline.isCompleted ? 'line-through text-muted-foreground' : ''}`}>{deadline.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatDate(deadline.date)}</p>
                      </div>
                      <Badge variant={deadline.isCompleted ? 'secondary' : 'outline'} className={deadline.isCompleted ? 'text-emerald-600' : 'text-amber-600'}>
                        {deadline.isCompleted ? 'انجام شده' : 'فعال'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-500" />
            {t('cases.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{toPersianNumber(cases.length)} پرونده</p>
        </div>
        <Sheet open={dialogOpen} onOpenChange={setDialogOpen}>
          <SheetTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
              <Plus className="w-4 h-4" />{t('cases.new')}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-[550px] overflow-y-auto">
            <div className="bg-gradient-to-l from-emerald-600 to-emerald-700 -mx-6 -mt-6 px-6 pt-6 pb-4 mb-4 rounded-b-xl">
              <SheetHeader>
                <SheetTitle className="text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  ثبت پرونده جدید
                </SheetTitle>
              </SheetHeader>
              <p className="text-emerald-100 text-xs mt-1">اطلاعات پرونده را با دقت وارد کنید</p>
            </div>

            <div className="space-y-6 px-1">
              {/* Section 1: Basic Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  <FileText className="w-4 h-4" />
                  اطلاعات اصلی
                </div>
                <Separator />
                <div className="space-y-1">
                  <Label className="text-xs">عنوان پرونده <span className="text-red-500">*</span></Label>
                  <Input value={newCase.title} onChange={(e) => { setNewCase({ ...newCase, title: e.target.value }); if (errors.title) setErrors({ ...errors, title: '' }); }} placeholder="مثلاً: دعوای ملکی شماره ۲۳۴۵" className={errors.title ? 'border-red-500' : ''} />
                  {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">نوع پرونده <span className="text-red-500">*</span></Label>
                    <Select value={newCase.type} onValueChange={(v) => setNewCase({ ...newCase, type: v as CaseType })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{(['civil', 'criminal', 'family', 'corporate', 'labor', 'tax'] as CaseType[]).map((ct) => <SelectItem key={ct} value={ct}>{getCaseTypeName(ct)}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">اولویت</Label>
                    <Select value={newCase.priority} onValueChange={(v) => setNewCase({ ...newCase, priority: v as CasePriority })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as CasePriority[]).map((p) => <SelectItem key={p} value={p}>{t(`priority.${p}`)}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">خلاصه پرونده</Label>
                  <p className="text-[11px] text-muted-foreground">خلاصه‌ای کوتاه از موضوع پرونده</p>
                  <Textarea value={newCase.summary} onChange={(e) => setNewCase({ ...newCase, summary: e.target.value })} rows={2} placeholder="خلاصه‌ای از موضوع پرونده..." />
                </div>
              </div>

              {/* Section 2: Court Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  <Gavel className="w-4 h-4" />
                  اطلاعات دادگاه
                </div>
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">دادگاه</Label>
                    <Input value={newCase.court} onChange={(e) => setNewCase({ ...newCase, court: e.target.value })} placeholder="مثلاً: دادگاه عمومی تهران" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">شعبه</Label>
                    <Input value={newCase.courtBranch} onChange={(e) => setNewCase({ ...newCase, courtBranch: e.target.value })} placeholder="مثلاً: شعبه ۱۲" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">نام قاضی</Label>
                  <Input value={newCase.judgeName} onChange={(e) => setNewCase({ ...newCase, judgeName: e.target.value })} placeholder="نام قاضی رسیدگی‌کننده" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">تاریخ ثبت دادخواست</Label>
                    <Input type="date" value={newCase.filingDate} onChange={(e) => setNewCase({ ...newCase, filingDate: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">جلسه بعدی</Label>
                    <Input type="date" value={newCase.nextHearing} onChange={(e) => setNewCase({ ...newCase, nextHearing: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Section 3: Case Parties */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  <Users className="w-4 h-4" />
                  اطراف پرونده
                </div>
                <Separator />
                <div className="space-y-1">
                  <Label className="text-xs">موکل <span className="text-red-500">*</span></Label>
                  <Select value={newCase.clientId} onValueChange={(v) => { setNewCase({ ...newCase, clientId: v }); if (errors.clientId) setErrors({ ...errors, clientId: '' }); }}>
                    <SelectTrigger className={errors.clientId ? 'border-red-500' : ''}><SelectValue placeholder="انتخاب موکل" /></SelectTrigger>
                    <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>)}</SelectContent>
                  </Select>
                  {errors.clientId && <p className="text-xs text-red-500">{errors.clientId}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">وکیل</Label>
                    <Select value={newCase.lawyerId} onValueChange={(v) => setNewCase({ ...newCase, lawyerId: v })}>
                      <SelectTrigger><SelectValue placeholder="انتخاب وکیل" /></SelectTrigger>
                      <SelectContent>{lawyers.map((l) => <SelectItem key={l.id} value={l.id}>{l.firstName} {l.lastName}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">کارآموز</Label>
                    <Select value={newCase.internId} onValueChange={(v) => setNewCase({ ...newCase, internId: v })}>
                      <SelectTrigger><SelectValue placeholder="انتخاب کارآموز" /></SelectTrigger>
                      <SelectContent>{interns.map((i) => <SelectItem key={i.id} value={i.id}>{i.firstName} {i.lastName}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Section 4: Description */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  <StickyNote className="w-4 h-4" />
                  توضیحات
                </div>
                <Separator />
                <div className="space-y-1">
                  <Label className="text-xs">توضیحات پرونده <span className="text-red-500">*</span></Label>
                  <Textarea value={newCase.description} onChange={(e) => { setNewCase({ ...newCase, description: e.target.value }); if (errors.description) setErrors({ ...errors, description: '' }); }} rows={3} placeholder="شرح دقیق پرونده و جزئیات مربوطه" className={errors.description ? 'border-red-500' : ''} />
                  {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">برچسب‌ها</Label>
                  <Input value={newCase.tags} onChange={(e) => setNewCase({ ...newCase, tags: e.target.value })} placeholder="ملکی، قرارداد، الزامی" />
                  <p className="text-[11px] text-muted-foreground">برچسب‌ها را با کاما جدا کنید</p>
                </div>
              </div>

              <Button onClick={handleCreate} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11">
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin ml-2" />در حال ثبت...</>
                ) : (
                  <><Check className="w-4 h-4 ml-2" />ثبت پرونده</>
                )}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Status Summary */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="cursor-pointer px-3 py-1.5 hover:bg-muted/50" onClick={() => setStatusFilter('all')}>
          همه ({toPersianNumber(cases.length)})
        </Badge>
        {(['OPEN', 'IN_PROGRESS', 'PENDING', 'CLOSED', 'ARCHIVED'] as CaseStatus[]).map((s) => (
          <Badge key={s} variant="outline" className={`cursor-pointer px-3 py-1.5 hover:bg-muted/50 ${statusFilter === s ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : ''}`} onClick={() => setStatusFilter(s)}>
            <span className={`w-2 h-2 rounded-full ml-1 ${s === 'OPEN' ? 'bg-emerald-500' : s === 'IN_PROGRESS' ? 'bg-blue-500' : s === 'PENDING' ? 'bg-amber-500' : s === 'CLOSED' ? 'bg-gray-500' : 'bg-slate-400'}`} />
            {getStatusName(s)} ({toPersianNumber(caseCounts[s] || 0)})
          </Badge>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('cases.search')} className="pr-9 text-sm" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36 text-sm"><SelectValue placeholder="نوع پرونده" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه انواع</SelectItem>
            {(['civil', 'criminal', 'family', 'corporate', 'labor', 'tax'] as CaseType[]).map((ct) => <SelectItem key={ct} value={ct}>{getCaseTypeName(ct)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-36 text-sm"><SelectValue placeholder="اولویت" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه اولویت‌ها</SelectItem>
            {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as CasePriority[]).map((p) => <SelectItem key={p} value={p}>{t(`priority.${p}`)}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex gap-1">
          <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}><LayoutGrid className="w-4 h-4" /></Button>
          <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}><List className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* Case Grid / List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <motion.div key={c.id} variants={itemVariants} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 group" onClick={() => setSelectedCase(c.id)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <Badge className={`${getPriorityColor(c.priority)} text-xs`}>{t(`priority.${c.priority}`)}</Badge>
                  </div>
                  <h3 className="font-semibold text-sm mb-1 truncate">{c.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{c.caseNumber} · {getCaseTypeName(c.type)}</p>
                  <Separator className="mb-3" />
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className={`${getStatusColor(c.status)} text-xs`}>{getStatusName(c.status)}</Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="w-3 h-3" />
                      <span>{c.client ? `${c.client.firstName} ${c.client.lastName}` : ''}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {filtered.map((c) => (
              <div key={c.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => setSelectedCase(c.id)}>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.caseNumber} · {getCaseTypeName(c.type)}</p>
                </div>
                <div className="hidden sm:block">
                  {c.client && <span className="text-xs text-muted-foreground">{c.client.firstName} {c.client.lastName}</span>}
                </div>
                <Badge variant="secondary" className={`text-xs shrink-0 ${getStatusColor(c.status)}`}>{getStatusName(c.status)}</Badge>
                <Badge variant="secondary" className={`text-xs shrink-0 ${getPriorityColor(c.priority)}`}>{t(`priority.${c.priority}`)}</Badge>
              </div>
            ))}
            {filtered.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">{t('common.noData')}</div>}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
