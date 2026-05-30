'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/persian';
import {
  formatCurrency, toPersianNumber, formatDate, getStatusColor,
  getCaseTypeName, getRelativeTime, getInitials, getFullName,
  formatTime, getAppointmentTypeName,
} from '@/lib/utils-helpers';
import {
  Briefcase, Clock, CalendarDays, FileText, DollarSign,
  MessageSquare, Bell, ChevronLeft, Gavel, Phone,
  User, Scale, CreditCard, AlertTriangle, CheckCircle2,
  Shield,
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

export default function ClientDashboard() {
  const {
    currentUser, cases, appointments, invoices, payments,
    notifications, messages, users, setPage,
  } = useAppStore();
  const lang = 'fa';
  const userId = currentUser?.id;

  // ===== FILTER DATA FOR THIS CLIENT =====
  const myCases = useMemo(() => cases.filter(c => c.clientId === userId), [cases, userId]);
  const myAppointments = useMemo(() => appointments.filter(a => a.clientId === userId), [appointments, userId]);
  const myInvoices = useMemo(() => invoices.filter(i => i.clientId === userId), [invoices, userId]);
  const myPayments = useMemo(() => payments.filter(p => p.userId === userId), [payments, userId]);
  const myNotifications = useMemo(() => notifications.filter(n => n.userId === userId), [notifications, userId]);
  const myMessages = useMemo(() => messages.filter(m => m.senderId === userId || m.receiverId === userId), [messages, userId]);
  const unreadMessages = useMemo(() => myMessages.filter(m => !m.isRead), [myMessages]);
  const unreadNotifs = useMemo(() => myNotifications.filter(n => !n.isRead), [myNotifications]);

  // Stats
  const stats = useMemo(() => {
    const openCases = myCases.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS');
    const unpaidInvoices = myInvoices.filter(i => i.status !== 'PAID' && i.status !== 'CANCELLED');
    const overdueInvoices = myInvoices.filter(i => i.status === 'OVERDUE');
    const totalPaid = myInvoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.total, 0);
    const totalUnpaid = unpaidInvoices.reduce((s, i) => s + (i.total - i.paidAmount), 0);
    const upcomingAppts = myAppointments.filter(a => {
      const today = new Date().toISOString().split('T')[0];
      return a.date >= today && a.status !== 'CANCELLED';
    });
    return { openCases, unpaidInvoices, overdueInvoices, totalPaid, totalUnpaid, upcomingAppts };
  }, [myCases, myInvoices, myAppointments]);

  // My lawyers (from my cases)
  const myLawyers = useMemo(() => {
    const lawyerMap = new Map<string, { id: string; name: string; cases: number; specialization?: string | null }>();
    myCases.forEach(c => {
      if (c.lawyer) {
        const existing = lawyerMap.get(c.lawyer.id);
        if (existing) {
          existing.cases++;
        } else {
          lawyerMap.set(c.lawyer.id, { id: c.lawyer.id, name: `${c.lawyer.firstName} ${c.lawyer.lastName}`, cases: 1 });
        }
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

  // Upcoming hearings from my cases
  const upcomingHearings = useMemo(() => {
    const now = new Date();
    return myCases
      .filter(c => c.nextHearing && new Date(c.nextHearing) >= now)
      .sort((a, b) => new Date(a.nextHearing!).getTime() - new Date(b.nextHearing!).getTime())
      .slice(0, 4)
      .map(c => ({ id: c.id, title: c.title, caseNumber: c.caseNumber, date: c.nextHearing!, status: c.status, court: c.court }));
  }, [myCases]);

  // Recent invoices
  const recentInvoices = useMemo(() => {
    return [...myInvoices].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  }, [myInvoices]);

  // Recent activity
  const recentActivity = useMemo(() => {
    const items: Array<{ icon: React.ReactNode; text: string; time: string; color: string }> = [];
    myCases.slice(0, 3).forEach(c => {
      items.push({
        icon: <Briefcase className="w-3.5 h-3.5" />,
        text: `پرونده "${c.title}" — ${t(`caseStatus.${c.status}`, lang)}`,
        time: getRelativeTime(c.updatedAt, lang),
        color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40',
      });
    });
    myInvoices.slice(0, 2).forEach(inv => {
      items.push({
        icon: <CreditCard className="w-3.5 h-3.5" />,
        text: `فاکتور ${inv.invoiceNumber} — ${t(`invoiceStatus.${inv.status}`, lang)}`,
        time: getRelativeTime(inv.updatedAt, lang),
        color: inv.status === 'PAID' ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40' :
              inv.status === 'OVERDUE' ? 'text-red-600 bg-red-100 dark:bg-red-900/40' :
              'text-amber-600 bg-amber-100 dark:bg-amber-900/40',
      });
    });
    myAppointments.slice(0, 2).forEach(a => {
      items.push({
        icon: <CalendarDays className="w-3.5 h-3.5" />,
        text: `نوبت "${a.title}" — ${t(`appointmentStatus.${a.status}`, lang)}`,
        time: getRelativeTime(a.updatedAt, lang),
        color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/40',
      });
    });
    return items.slice(0, 8);
  }, [myCases, myInvoices, myAppointments, lang]);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            {getGreeting()}، {currentUser?.firstName} {currentUser?.lastName}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {getTodayStr()} · داشبورد شخصی شما
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1 px-3 py-1.5">
            <User className="w-3 h-3 text-blue-500" />
            موکل
          </Badge>
        </div>
      </div>

      {/* ===== STAT CARDS ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { title: 'پرونده‌های فعال', value: toPersianNumber(stats.openCases.length), subtitle: `${toPersianNumber(myCases.length)} پرونده کل`, icon: Briefcase, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40' },
          { title: 'فاکتورهای پرداخت نشده', value: toPersianNumber(stats.unpaidInvoices.length), subtitle: formatCurrency(stats.totalUnpaid, lang), icon: FileText, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/40' },
          { title: 'نوبت‌های آینده', value: toPersianNumber(stats.upcomingAppts.length), subtitle: 'نوبت فعال', icon: CalendarDays, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/40' },
          { title: 'پرداخت‌های انجام شده', value: formatCurrency(stats.totalPaid, lang), subtitle: 'مجموع پرداختی', icon: DollarSign, color: 'text-teal-600 bg-teal-100 dark:bg-teal-900/40' },
        ].map((s, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="hover:shadow-lg transition-all group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <s.icon className="w-4 h-4" />
                  </div>
                  {s.title === 'فاکتورهای پرداخت نشده' && stats.overdueInvoices.length > 0 && (
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

      {/* ===== MY LAWYER(S) + UPCOMING APPOINTMENTS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Lawyers */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-500" />
                وکلای من
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {myLawyers.length > 0 ? myLawyers.map(lawyer => {
                const fullUser = users.find(u => u.id === lawyer.id);
                return (
                  <div key={lawyer.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors">
                    <Avatar className="w-11 h-11">
                      <AvatarFallback className="text-sm bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 font-medium">
                        {getInitials(lawyer.name.split(' ')[0], lawyer.name.split(' ').pop() || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{lawyer.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>{toPersianNumber(lawyer.cases)} پرونده مشترک</span>
                        {fullUser?.lawyerProfile?.specialization && (
                          <span>· {fullUser.lawyerProfile.specialization}</span>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => setPage('messages')}>
                      <MessageSquare className="w-3 h-3 ml-1" />
                      پیام
                    </Button>
                  </div>
                );
              }) : (
                <div className="text-center py-8">
                  <Scale className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">هنوز وکیلی به شما اختصاص داده نشده</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Appointments */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-500" />
                  نوبت‌های آینده من
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setPage('appointments')}>
                  مشاهده همه <ChevronLeft className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
              {upcomingAppts.length > 0 ? upcomingAppts.map(a => (
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
              )) : (
                <div className="text-center py-8">
                  <CalendarDays className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">نوبتی در پیش ندارید</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ===== MY CASES + UPCOMING HEARINGS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Cases */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-500" />
                  پرونده‌های من
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setPage('cases')}>
                  مشاهده همه <ChevronLeft className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[320px] overflow-y-auto">
              {myCases.length > 0 ? myCases.map(c => (
                <div key={c.id} className="p-3 rounded-xl hover:bg-muted/50 transition-colors border border-border/50 cursor-pointer" onClick={() => setPage('cases')}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{c.caseNumber}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-[10px]">{getCaseTypeName(c.type, lang)}</Badge>
                        {c.court && <span className="text-[11px] text-muted-foreground">{c.court}</span>}
                        {c.lawyer && <span className="text-[11px] text-muted-foreground">وکیل: {c.lawyer.firstName} {c.lawyer.lastName}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge variant="secondary" className={`text-xs ${getStatusColor(c.status)}`}>
                        {t(`caseStatus.${c.status}`, lang)}
                      </Badge>
                      {c.nextHearing && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Gavel className="w-2.5 h-2.5" />
                          {formatDate(c.nextHearing, lang)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <Briefcase className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">پرونده‌ای ثبت نشده</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Hearings */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Gavel className="w-4 h-4 text-amber-500" />
                جلسات دادگاه آینده
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[320px] overflow-y-auto">
              {upcomingHearings.length > 0 ? upcomingHearings.map(h => (
                <div key={h.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors border border-border/50">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 shrink-0">
                    <Gavel className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{h.title}</p>
                    <p className="text-xs text-muted-foreground">{h.caseNumber}</p>
                    {h.court && <p className="text-[11px] text-muted-foreground mt-0.5">{h.court}</p>}
                  </div>
                  <div className="text-left shrink-0">
                    <p className="text-xs font-medium">{formatDate(h.date, lang)}</p>
                    <Badge variant="secondary" className={`text-[10px] mt-1 ${getStatusColor(h.status)}`}>
                      {t(`caseStatus.${h.status}`, lang)}
                    </Badge>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <Gavel className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">جلسه دادگاهی در پیش ندارید</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ===== INVOICES + ACTIVITY ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-500" />
                  فاکتورهای اخیر
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setPage('invoices')}>
                  مشاهده همه <ChevronLeft className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[280px] overflow-y-auto">
              {recentInvoices.length > 0 ? recentInvoices.map(inv => (
                <div key={inv.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setPage('invoices')}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    inv.status === 'PAID' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' :
                    inv.status === 'OVERDUE' ? 'bg-red-100 dark:bg-red-900/40 text-red-600' :
                    'bg-amber-100 dark:bg-amber-900/40 text-amber-600'
                  }`}>
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{inv.invoiceNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      سررسید: {formatDate(inv.dueDate, lang)}
                    </p>
                  </div>
                  <div className="text-left shrink-0">
                    <p className="text-sm font-medium">{formatCurrency(inv.total, lang)}</p>
                    <Badge variant="secondary" className={`text-[10px] mt-1 ${getStatusColor(inv.status)}`}>
                      {t(`invoiceStatus.${inv.status}`, lang)}
                    </Badge>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <CreditCard className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">فاکتوری وجود ندارد</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                فعالیت‌های اخیر
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[280px] overflow-y-auto">
              <div className="space-y-1">
                {recentActivity.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-relaxed">{item.text}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))}
                {recentActivity.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">فعالیتی ثبت نشده</p>}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ===== QUICK ACTIONS ===== */}
      <motion.div variants={itemVariants}>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-emerald-500" />
              دسترسی سریع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { title: 'ارسال پیام به وکیل', icon: MessageSquare, page: 'messages', color: 'from-blue-500 to-blue-600', desc: 'ارتباط با وکیل خود' },
                { title: 'مشاهده فاکتورها', icon: CreditCard, page: 'invoices', color: 'from-amber-500 to-amber-600', desc: 'صورت‌حساب‌های شما' },
                { title: 'مشاهده پرونده‌ها', icon: Briefcase, page: 'cases', color: 'from-emerald-500 to-emerald-600', desc: 'پرونده‌های حقوقی شما' },
                { title: 'اعلان‌ها', icon: Bell, page: 'notifications', color: 'from-red-500 to-red-600', desc: `${toPersianNumber(unreadNotifs.length)} اعلان خوانده نشده` },
              ].map((action, i) => (
                <Button key={i} variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 border-2 hover:border-primary/30 hover:shadow-md transition-all group" onClick={() => setPage(action.page)}>
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
