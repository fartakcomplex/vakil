'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import {
  t,
} from '@/lib/persian';
import {
  formatCurrency, toPersianNumber, formatDate, getStatusColor,
  getCaseTypeName, getRelativeTime, getInitials, getFullName,
  formatTime, getAppointmentTypeName, formatHours,
} from '@/lib/utils-helpers';
import {
  Briefcase, Clock, CalendarDays, FileText, DollarSign,
  MessageSquare, Bell, ChevronLeft, Gavel, Phone,
  User, Scale, CreditCard, AlertTriangle, CheckCircle2,
  Shield, Send, Download, Eye, Mail, MapPin,
  Building, ArrowRight, Star, FileDown, UserCircle,
  History, FolderOpen, Briefcase as Lawyer, Stamp, Handshake,
} from 'lucide-react';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'صبح بخیر';
  if (h >= 12 && h < 17) return 'ظهر بخیر';
  if (h >= 17 && h < 21) return 'عصر بخیر';
  return 'شب بخیر';
}

function getTodayStr(): string {
  const d = new Date();
  const days = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
  return `${days[d.getDay()]}، ${toPersianNumber(d.getDate())} ${d.toLocaleDateString('fa-IR', { month: 'long' })} ${toPersianNumber(d.getFullYear())}`;
}

// ============ COMPONENT ============
export default function ClientPortalPage() {
  const {
    currentUser, cases, appointments, invoices, payments,
    notifications, messages, users, documents, timeEntries, setPage,
  } = useAppStore();
  const { toast } = useToast();
  const lang = 'fa';
  const userId = currentUser?.id;

  // Message state
  const [messageText, setMessageText] = useState('');
  const [selectedTab, setSelectedTab] = useState('cases');

  // ===== FILTER DATA FOR THIS CLIENT =====
  const myCases = useMemo(() => cases.filter(c => c.clientId === userId), [cases, userId]);
  const myAppointments = useMemo(() => appointments.filter(a => a.clientId === userId), [appointments, userId]);
  const myInvoices = useMemo(() => invoices.filter(i => i.clientId === userId), [invoices, userId]);
  const myPayments = useMemo(() => payments.filter(p => p.userId === userId), [payments, userId]);
  const myNotifications = useMemo(() => notifications.filter(n => n.userId === userId), [notifications, userId]);
  const myMessages = useMemo(() => messages.filter(m => m.senderId === userId || m.receiverId === userId), [messages, userId]);
  const unreadMessages = useMemo(() => myMessages.filter(m => !m.isRead), [myMessages]);
  const unreadNotifs = useMemo(() => myNotifications.filter(n => !n.isRead), [myNotifications]);
  const myDocuments = useMemo(() => {
    return documents.filter(d => {
      // Show documents related to client's cases
      const relatedCases = myCases.map(c => c.id);
      return relatedCases.includes(d.caseId || '') || d.uploadedBy === userId;
    });
  }, [documents, myCases, userId]);

  // Stats
  const stats = useMemo(() => {
    const openCases = myCases.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS');
    const unpaidInvoices = myInvoices.filter(i => i.status !== 'PAID' && i.status !== 'CANCELLED');
    const overdueInvoices = myInvoices.filter(i => i.status === 'OVERDUE');
    const totalPaid = myInvoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.total, 0);
    const totalUnpaid = unpaidInvoices.reduce((s, i) => s + (i.total - (i.paidAmount || 0)), 0);
    const upcomingAppts = myAppointments.filter(a => {
      const today = new Date().toISOString().split('T')[0];
      return a.date >= today && a.status !== 'CANCELLED';
    });
    return { openCases, unpaidInvoices, overdueInvoices, totalPaid, totalUnpaid, upcomingAppts };
  }, [myCases, myInvoices, myAppointments]);

  // My lawyers
  const myLawyers = useMemo(() => {
    const lawyerMap = new Map<string, { id: string; name: string; cases: number }>();
    myCases.forEach(c => {
      if (c.lawyer) {
        const existing = lawyerMap.get(c.lawyer.id);
        if (existing) existing.cases++;
        else lawyerMap.set(c.lawyer.id, { id: c.lawyer.id, name: `${c.lawyer.firstName} ${c.lawyer.lastName}`, cases: 1 });
      }
    });
    return Array.from(lawyerMap.values());
  }, [myCases]);

  // Upcoming appointments
  const upcomingAppts = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return myAppointments
      .filter(a => a.date >= today && a.status !== 'CANCELLED')
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
      .slice(0, 5);
  }, [myAppointments]);

  // Case timeline events
  const caseTimeline = useMemo(() => {
    const events: Array<{
      id: string;
      caseTitle: string;
      date: string;
      description: string;
      type: 'created' | 'status' | 'hearing' | 'document';
      icon: typeof Briefcase;
      color: string;
    }> = [];

    myCases.forEach(c => {
      events.push({
        id: `created-${c.id}`,
        caseTitle: c.title,
        date: c.createdAt,
        description: `پرونده "${c.title}" ثبت شد`,
        type: 'created',
        icon: FolderOpen,
        color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40',
      });
      if (c.nextHearing) {
        events.push({
          id: `hearing-${c.id}`,
          caseTitle: c.title,
          date: c.nextHearing,
          description: `جلسه دادگاه پرونده "${c.title}"`,
          type: 'hearing',
          icon: Gavel,
          color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/40',
        });
      }
    });

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
  }, [myCases]);

  // Send message
  const handleSendMessage = () => {
    if (!messageText.trim()) {
      toast({ title: 'متن پیام را وارد کنید', variant: 'destructive' });
      return;
    }
    if (myLawyers.length === 0) {
      toast({ title: 'وکیلی به شما اختصاص داده نشده', variant: 'destructive' });
      return;
    }
    setMessageText('');
    toast({ title: 'پیام ارسال شد', description: 'پیام شما به وکیل ارسال خواهد شد' });
  };

  // Get progress percentage for case status
  const getCaseProgress = (status: string) => {
    switch (status) {
      case 'OPEN': return 10;
      case 'IN_PROGRESS': return 35;
      case 'AWAITING_COURT': return 55;
      case 'HEARING_SCHEDULED': return 70;
      case 'UNDER_REVIEW': return 85;
      case 'CLOSED': return 100;
      case 'WON': return 100;
      case 'LOST': return 100;
      case 'SETTLED': return 100;
      default: return 0;
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* ===== WELCOME SECTION ===== */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-l from-emerald-600 via-teal-600 to-emerald-700 p-6 text-white relative">
              {/* Decorative circles */}
              <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-white/5" />
              <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-white/5" />

              <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Avatar className="w-16 h-16 border-2 border-white/30 shadow-lg">
                  <AvatarFallback className="text-xl bg-white/20 text-white font-bold">
                    {getInitials(currentUser?.firstName || '', currentUser?.lastName || '')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold">
                    {getGreeting()}، {currentUser?.firstName} {currentUser?.lastName}
                  </h1>
                  <p className="text-sm text-white/70 mt-1">{getTodayStr()} · پنل موکلین لِگال‌هاب</p>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge className="bg-white/20 text-white text-[11px] px-2.5 py-0.5 border border-white/30 hover:bg-white/30">
                      <User className="w-3 h-3 ml-0.5" />
                      موکل
                    </Badge>
                    <Badge className="bg-white/20 text-white text-[11px] px-2.5 py-0.5 border border-white/30 hover:bg-white/30">
                      <Shield className="w-3 h-3 ml-0.5" />
                      فعال
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {unreadMessages.length > 0 && (
                    <Badge className="bg-rose-500 text-white text-[10px] px-2">
                      <Bell className="w-3 h-3 ml-0.5" />
                      {toPersianNumber(unreadMessages.length)} پیام جدید
                    </Badge>
                  )}
                  {unreadNotifs.length > 0 && (
                    <Badge className="bg-amber-400 text-amber-900 text-[10px] px-2">
                      <Bell className="w-3 h-3 ml-0.5" />
                      {toPersianNumber(unreadNotifs.length)} اعلان
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== STAT CARDS ===== */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { title: 'پرونده‌های فعال', value: toPersianNumber(stats.openCases.length), subtitle: `${toPersianNumber(myCases.length)} کل`, icon: Briefcase, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40' },
            { title: 'فاکتور پرداخت نشده', value: toPersianNumber(stats.unpaidInvoices.length), subtitle: formatCurrency(stats.totalUnpaid, lang), icon: CreditCard, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/40' },
            { title: 'نوبت‌های آینده', value: toPersianNumber(stats.upcomingAppts.length), subtitle: 'نوبت فعال', icon: CalendarDays, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/40' },
            { title: 'مجموع پرداختی', value: formatCurrency(stats.totalPaid, lang), subtitle: 'ریال', icon: DollarSign, color: 'text-teal-600 bg-teal-100 dark:bg-teal-900/40' },
          ].map((s, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card className="hover:shadow-lg transition-all group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <s.icon className="w-4 h-4" />
                    </div>
                    {s.title === 'فاکتور پرداخت نشده' && stats.overdueInvoices.length > 0 && (
                      <Badge className="bg-red-500 text-white text-[10px]">{toPersianNumber(stats.overdueInvoices.length)} سررسید</Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-0.5">{s.title}</p>
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{s.subtitle}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ===== MAIN TABS ===== */}
      <motion.div variants={itemVariants}>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 gap-1 bg-muted/50">
            <TabsTrigger value="cases" className="text-xs gap-1.5 px-3 py-2">
              <Briefcase className="w-3.5 h-3.5" />
              پرونده‌ها
            </TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs gap-1.5 px-3 py-2">
              <History className="w-3.5 h-3.5" />
              رویدادها
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-xs gap-1.5 px-3 py-2">
              <FileText className="w-3.5 h-3.5" />
              اسناد
            </TabsTrigger>
            <TabsTrigger value="appointments" className="text-xs gap-1.5 px-3 py-2">
              <CalendarDays className="w-3.5 h-3.5" />
              نوبت‌ها
            </TabsTrigger>
            <TabsTrigger value="invoices" className="text-xs gap-1.5 px-3 py-2">
              <CreditCard className="w-3.5 h-3.5" />
              صورتحساب
            </TabsTrigger>
            <TabsTrigger value="messaging" className="text-xs gap-1.5 px-3 py-2">
              <MessageSquare className="w-3.5 h-3.5" />
              پیام‌ها
              {unreadMessages.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[8px] flex items-center justify-center">{toPersianNumber(unreadMessages.length)}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="profile" className="text-xs gap-1.5 px-3 py-2">
              <UserCircle className="w-3.5 h-3.5" />
              پروفایل
            </TabsTrigger>
          </TabsList>

          {/* ===== CASES TAB ===== */}
          <TabsContent value="cases" className="mt-4 space-y-4">
            {myCases.length === 0 ? (
              <Card>
                <CardContent className="py-16 flex flex-col items-center text-center text-muted-foreground">
                  <Briefcase className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm font-medium">پرونده‌ای ثبت نشده</p>
                  <p className="text-xs mt-1">پرونده‌های حقوقی شما در اینجا نمایش داده می‌شوند</p>
                </CardContent>
              </Card>
            ) : (
              myCases.map((c, index) => {
                const progress = getCaseProgress(c.status);
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-lg transition-all group">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex-1 min-w-0 space-y-3">
                            {/* Case header */}
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                c.status === 'WON' || c.status === 'SETTLED' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                                c.status === 'LOST' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                                'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                              }`}>
                                <Briefcase className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="text-sm font-bold group-hover:text-emerald-600 transition-colors truncate">{c.title}</h3>
                                  <Badge variant="secondary" className={`text-[10px] shrink-0 ${getStatusColor(c.status)}`}>
                                    {t(`caseStatus.${c.status}`, lang)}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">شماره: {c.caseNumber}</p>
                              </div>
                            </div>

                            {/* Meta info */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Lawyer className="w-3 h-3" />
                                {c.lawyer ? `${c.lawyer.firstName} ${c.lawyer.lastName}` : 'وکیل تعیین نشده'}
                              </span>
                              {c.court && (
                                <span className="flex items-center gap-1">
                                  <Building className="w-3 h-3" />
                                  {c.court}
                                </span>
                              )}
                              <Badge variant="secondary" className="text-[10px]">{getCaseTypeName(c.type, lang)}</Badge>
                            </div>

                            {/* Progress */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="text-muted-foreground">مرحله پیشرفت</span>
                                <span className="font-medium text-foreground">{toPersianNumber(progress)}٪</span>
                              </div>
                              <Progress value={progress} className="h-1.5" />
                            </div>

                            {/* Last update */}
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              آخرین به‌روزرسانی: {getRelativeTime(c.updatedAt, lang)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </TabsContent>

          {/* ===== TIMELINE TAB ===== */}
          <TabsContent value="timeline" className="mt-4">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-500" />
                  رویدادهای پرونده‌ها
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {caseTimeline.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">رویدادی ثبت نشده</p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[500px]">
                    <div className="relative space-y-0">
                      {/* Timeline line */}
                      <div className="absolute top-4 right-[19px] bottom-4 w-0.5 bg-border" />

                      {caseTimeline.map((event, index) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="relative flex gap-4 pb-6 last:pb-0"
                        >
                          {/* Icon */}
                          <div className={`w-10 h-10 rounded-full ${event.color} flex items-center justify-center shrink-0 z-10 border-2 border-card shadow-sm`}>
                            <event.icon className="w-4 h-4" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 pt-1">
                            <p className="text-xs font-medium">{event.description}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {formatDate(event.date, lang)}
                              {event.caseTitle && ` · ${event.caseTitle}`}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== DOCUMENTS TAB ===== */}
          <TabsContent value="documents" className="mt-4">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-500" />
                  اسناد مشترک
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {myDocuments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">سندی به اشتراک گذاشته نشده</p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[500px]">
                    <div className="space-y-2">
                      {myDocuments.map((doc, index) => (
                        <motion.div
                          key={doc.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors border border-border/50"
                        >
                          <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-600 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{doc.name || doc.title}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {getRelativeTime(doc.createdAt, lang)}
                              {doc.caseId && ` · پرونده مرتبط`}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
                            <Download className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== APPOINTMENTS TAB ===== */}
          <TabsContent value="appointments" className="mt-4">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-500" />
                  نوبت‌های آینده
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {upcomingAppts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">نوبتی در پیش ندارید</p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[500px]">
                    <div className="space-y-3">
                      {upcomingAppts.map((a) => (
                        <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors border border-border/50">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            a.type === 'IN_PERSON' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600' :
                            a.type === 'VIDEO' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600' :
                            'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600'
                          }`}>
                            {a.type === 'IN_PERSON' ? <User className="w-4 h-4" /> :
                             a.type === 'VIDEO' ? <Phone className="w-4 h-4" /> :
                             <MessageSquare className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{a.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(a.date, lang)} · {formatTime(a.startTime, lang)} — {formatTime(a.endTime, lang)}
                            </p>
                            <p className="text-[11px] text-muted-foreground">{getAppointmentTypeName(a.type, lang)}</p>
                          </div>
                          <Badge variant="secondary" className={`text-xs shrink-0 ${getStatusColor(a.status)}`}>
                            {t(`appointmentStatus.${a.status}`, lang)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== INVOICES TAB ===== */}
          <TabsContent value="invoices" className="mt-4">
            <Card>
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-500" />
                    فاکتورها و پرداخت‌ها
                  </CardTitle>
                  <div className="flex gap-2">
                    <div className="text-left">
                      <p className="text-[10px] text-muted-foreground">پرداخت شده</p>
                      <p className="text-xs font-bold text-emerald-600">{formatCurrency(stats.totalPaid, lang)}</p>
                    </div>
                    <Separator orientation="vertical" className="h-8" />
                    <div className="text-left">
                      <p className="text-[10px] text-muted-foreground">مانده</p>
                      <p className="text-xs font-bold text-amber-600">{formatCurrency(stats.totalUnpaid, lang)}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {myInvoices.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">فاکتوری وجود ندارد</p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[500px]">
                    <div className="space-y-2">
                      {[...myInvoices].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((inv, index) => (
                        <motion.div
                          key={inv.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors border border-border/50"
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            inv.status === 'PAID' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' :
                            inv.status === 'OVERDUE' ? 'bg-red-100 dark:bg-red-900/40 text-red-600' :
                            'bg-amber-100 dark:bg-amber-900/40 text-amber-600'
                          }`}>
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-medium">{inv.invoiceNumber}</p>
                              <Badge variant="secondary" className={`text-[10px] ${getStatusColor(inv.status)}`}>
                                {t(`invoiceStatus.${inv.status}`, lang)}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              سررسید: {formatDate(inv.dueDate, lang)}
                            </p>
                          </div>
                          <div className="text-left shrink-0">
                            <p className="text-sm font-bold">{formatCurrency(inv.total, lang)}</p>
                            {inv.paidAmount > 0 && inv.status !== 'PAID' && (
                              <p className="text-[10px] text-muted-foreground">پرداخت: {formatCurrency(inv.paidAmount, lang)}</p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== MESSAGING TAB ===== */}
          <TabsContent value="messaging" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Lawyer contacts */}
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-xs font-bold flex items-center gap-2">
                    <Scale className="w-4 h-4 text-emerald-500" />
                    وکلای من
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  {myLawyers.length > 0 ? myLawyers.map(lawyer => (
                    <div key={lawyer.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/50">
                      <Avatar className="w-9 h-9">
                        <AvatarFallback className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 font-medium">
                          {getInitials(lawyer.name.split(' ')[0], lawyer.name.split(' ').pop() || '')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{lawyer.name}</p>
                        <p className="text-[10px] text-muted-foreground">{toPersianNumber(lawyer.cases)} پرونده مشترک</p>
                      </div>
                      <Badge variant="outline" className="text-[9px] text-emerald-600 border-emerald-200 dark:border-emerald-800">
                        آنلاین
                      </Badge>
                    </div>
                  )) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <Scale className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">وکیلی اختصاص داده نشده</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Message compose */}
              <Card className="lg:col-span-2">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-xs font-bold flex items-center gap-2">
                    <Send className="w-4 h-4 text-blue-500" />
                    ارسال پیام سریع
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <Textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="پیام خود را بنویسید..."
                    className="min-h-[120px] text-sm resize-none"
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{messageText.length} کاراکتر</span>
                      {myLawyers.length > 0 && (
                        <span>ارسال به: {myLawyers[0].name}</span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="text-xs gap-1.5 bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || myLawyers.length === 0}
                    >
                      <Send className="w-3.5 h-3.5" />
                      ارسال
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ===== PROFILE TAB ===== */}
          <TabsContent value="profile" className="mt-4">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <UserCircle className="w-4 h-4 text-violet-500" />
                  اطلاعات پروفایل
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Avatar */}
                  <div className="flex flex-col items-center gap-3 shrink-0">
                    <Avatar className="w-24 h-24 border-2 border-muted">
                      <AvatarFallback className="text-2xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 font-bold">
                        {getInitials(currentUser?.firstName || '', currentUser?.lastName || '')}
                      </AvatarFallback>
                    </Avatar>
                    <Badge variant="secondary" className="text-[10px] gap-1">
                      <Shield className="w-3 h-3 text-emerald-500" />
                      موکل تأیید شده
                    </Badge>
                  </div>

                  {/* Info fields */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'نام', value: currentUser?.firstName || '—', icon: User },
                      { label: 'نام خانوادگی', value: currentUser?.lastName || '—', icon: User },
                      { label: 'ایمیل', value: currentUser?.email || '—', icon: Mail },
                      { label: 'شماره تماس', value: currentUser?.phone || '—', icon: Phone },
                      { label: 'آدرس', value: currentUser?.address || '—', icon: MapPin },
                      { label: 'شهر', value: currentUser?.city || '—', icon: Building },
                    ].map((field, i) => (
                      <div key={i} className="space-y-1.5 p-3 rounded-xl bg-muted/30">
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <field.icon className="w-3 h-3" />
                          {field.label}
                        </div>
                        <p className="text-sm font-medium">{field.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* ===== QUICK ACTIONS ===== */}
      <motion.div variants={itemVariants}>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Star className="w-4 h-4 text-emerald-500" />
              دسترسی سریع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { title: 'ارسال پیام به وکیل', icon: MessageSquare, tab: 'messaging', color: 'from-blue-500 to-blue-600', desc: 'ارتباط سریع با وکیل' },
                { title: 'مشاهده فاکتورها', icon: CreditCard, tab: 'invoices', color: 'from-amber-500 to-amber-600', desc: `${toPersianNumber(stats.unpaidInvoices.length)} فاکتور پرداخت نشده` },
                { title: 'مشاهده پرونده‌ها', icon: Briefcase, tab: 'cases', color: 'from-emerald-500 to-emerald-600', desc: `${toPersianNumber(myCases.length)} پرونده حقوقی` },
                { title: 'اعلان‌ها', icon: Bell, tab: 'timeline', color: 'from-rose-500 to-rose-600', desc: `${toPersianNumber(unreadNotifs.length)} اعلان جدید` },
              ].map((action, i) => (
                <Button key={i} variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 border-2 hover:border-primary/30 hover:shadow-md transition-all group" onClick={() => setSelectedTab(action.tab)}>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium">{action.title}</span>
                  <span className="text-[10px] text-muted-foreground">{action.desc}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
