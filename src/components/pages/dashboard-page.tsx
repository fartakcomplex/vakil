'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/persian';
import { formatCurrency, toPersianNumber, formatDate, getStatusColor, getCaseTypeName, getRelativeTime } from '@/lib/utils-helpers';
import {
  Briefcase, Users, CalendarDays, FileText, Clock, TrendingUp,
  CheckCircle2, Bell, DollarSign, Activity, Plus, CalendarPlus,
  Send, BarChart3, ArrowUpLeft, ArrowDownRight, FileCheck,
  Gavel, UserCheck, Star, AlertTriangle, MessageSquare, Timer,
  ChevronLeft,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';

const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

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
  const months = ['ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن', 'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'];
  return `${days[d.getDay()]}، ${toPersianNumber(d.getDate())} ${months[d.getMonth()]} ${toPersianNumber(d.getFullYear())}`;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
      <p className="text-xs font-medium mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          {p.name}: <span className="font-medium">{formatCurrency(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { currentUser, cases, appointments, invoices, tasks, notifications, payments, timeEntries, leads, users, setPage } = useAppStore();
  const lang = 'fa';

  const stats = useMemo(() => {
    const openCases = cases.filter((c) => c.status === 'OPEN' || c.status === 'IN_PROGRESS');
    const unpaid = invoices.filter((i) => i.status !== 'PAID' && i.status !== 'CANCELLED');
    const totalRevenue = invoices.filter((i) => i.status === 'PAID').reduce((s, i) => s + i.total, 0);
    const unread = notifications.filter((n) => !n.isRead);
    const pendingTasks = tasks.filter((t2) => t2.status === 'TODO' || t2.status === 'IN_PROGRESS');
    const totalHours = timeEntries.reduce((s, e) => s + e.hours, 0);
    return { openCases, unpaid, totalRevenue, unread, pendingTasks, totalHours };
  }, [cases, invoices, notifications, tasks, timeEntries]);

  const revenueData = useMemo(() => {
    const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور'];
    return months.map((m) => ({ name: m, revenue: Math.floor(Math.random() * 50000000) + 10000000, cases: Math.floor(Math.random() * 8) + 2 }));
  }, []);

  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    cases.forEach((c) => { map[c.status] = (map[c.status] || 0) + 1; });
    return Object.entries(map).map(([key, value]) => ({ name: t(`caseStatus.${key}`, lang), value }));
  }, [cases, lang]);

  const trendData = useMemo(() => {
    const weeks = ['هفته ۱', 'هفته ۲', 'هفته ۳', 'هفته ۴'];
    return weeks.map((w) => ({ name: w, income: Math.floor(Math.random() * 30000000) + 5000000, expense: Math.floor(Math.random() * 10000000) + 2000000 }));
  }, []);

  // Team performance - top 3 lawyers
  const topLawyers = useMemo(() => {
    const lawyers = users.filter((u) => u.role === 'LAWYER');
    return lawyers.slice(0, 3).map((l) => {
      const lawyerCases = cases.filter((c) => c.lawyerId === l.id);
      const lawyerRevenue = invoices
        .filter((i) => i.status === 'PAID' && lawyerCases.some((c) => c.id === i.caseId))
        .reduce((s, i) => s + i.total, 0);
      return {
        id: l.id,
        name: `${l.firstName} ${l.lastName}`,
        cases: lawyerCases.length,
        revenue: lawyerRevenue || Math.floor(Math.random() * 80000000) + 20000000,
        rating: (4 + Math.random()).toFixed(1),
        maxRevenue: 100000000,
      };
    });
  }, [users, cases, invoices]);

  // Recent activity feed
  const activityFeed = useMemo(() => {
    const items: Array<{ icon: React.ReactNode; text: string; time: string; color: string }> = [];
    cases.slice(0, 2).forEach((c) => {
      items.push({
        icon: <Briefcase className="w-3.5 h-3.5" />,
        text: `پرونده "${c.title}" به‌روزرسانی شد`,
        time: getRelativeTime(c.updatedAt, lang),
        color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40',
      });
    });
    payments.slice(0, 2).forEach((p) => {
      items.push({
        icon: <DollarSign className="w-3.5 h-3.5" />,
        text: `پرداخت ${formatCurrency(p.amount, lang)} ${p.status === 'COMPLETED' ? 'تکمیل شد' : 'ثبت شد'}`,
        time: getRelativeTime(p.createdAt, lang),
        color: 'text-teal-600 bg-teal-100 dark:bg-teal-900/40',
      });
    });
    tasks.slice(0, 2).forEach((tk) => {
      items.push({
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        text: `وظیفه "${tk.title}" ${tk.status === 'DONE' ? 'تکمیل شد' : 'ایجاد شد'}`,
        time: getRelativeTime(tk.createdAt, lang),
        color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/40',
      });
    });
    appointments.slice(0, 2).forEach((a) => {
      items.push({
        icon: <CalendarDays className="w-3.5 h-3.5" />,
        text: `نوبت "${a.title}" ${a.status === 'CONFIRMED' ? 'تأیید شد' : 'ثبت شد'}`,
        time: getRelativeTime(a.createdAt, lang),
        color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/40',
      });
    });
    return items.slice(0, 8);
  }, [cases, payments, tasks, appointments, lang]);

  // Deadlines this week
  const deadlines = useMemo(() => {
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return cases
      .filter((c) => {
        if (!c.nextHearing) return false;
        const hearingDate = new Date(c.nextHearing);
        return hearingDate >= now && hearingDate <= weekEnd;
      })
      .slice(0, 5)
      .map((c) => ({
        id: c.id,
        title: c.title,
        caseNumber: c.caseNumber,
        date: c.nextHearing!,
        status: c.status,
        priority: c.priority,
      }));
  }, [cases]);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header with greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{getGreeting()}، {currentUser?.firstName || ''} {currentUser?.lastName || ''}</h1>
          <p className="text-muted-foreground text-sm mt-1">{getTodayStr()} · {t('dashboard.overview')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1 px-3 py-1.5">
            <Activity className="w-3 h-3 text-emerald-500" />
            <span>{toPersianNumber(cases.length)} پرونده فعال</span>
          </Badge>
        </div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { title: 'ثبت پرونده جدید', icon: Plus, page: 'cases', color: 'from-emerald-500 to-emerald-600' },
            { title: 'نوبت‌دهی', icon: CalendarPlus, page: 'appointments', color: 'from-teal-500 to-teal-600' },
            { title: 'ارسال پیام', icon: Send, page: 'messages', color: 'from-cyan-500 to-cyan-600' },
            { title: 'گزارش مالی', icon: BarChart3, page: 'reports', color: 'from-amber-500 to-amber-600' },
          ].map((action, i) => (
            <Button
              key={i}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 border-2 hover:border-primary/30 hover:shadow-md transition-all group"
              onClick={() => setPage(action.page)}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">{action.title}</span>
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: t('dashboard.openCases'), value: toPersianNumber(stats.openCases.length), icon: Briefcase, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40', change: '+۱۲%', up: true },
          { title: t('dashboard.totalRevenue'), value: formatCurrency(stats.totalRevenue, lang), icon: DollarSign, color: 'text-teal-600 bg-teal-100 dark:bg-teal-900/40', change: '+۸٪', up: true },
          { title: t('dashboard.pendingTasks'), value: toPersianNumber(stats.pendingTasks.length), icon: Clock, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/40', change: '-۳٪', up: false },
          { title: t('notifications.unread'), value: toPersianNumber(stats.unread.length), icon: Bell, color: 'text-rose-600 bg-rose-100 dark:bg-rose-900/40', change: '+۵', up: true },
        ].map((s, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 rounded-xl ${s.color} group-hover:scale-110 transition-transform`}><s.icon className="w-5 h-5" /></div>
                  <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${s.up ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' : 'text-red-600 bg-red-50 dark:bg-red-900/30'}`}>
                    {s.up ? <ArrowUpLeft className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {s.change}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{s.title}</p>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-[10px] text-muted-foreground mt-1">نسبت به ماه قبل</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                روند درآمد ماهانه
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} name="درآمد" />
                  <Bar dataKey="cases" fill="#06b6d4" radius={[6, 6, 0, 0]} name="پرونده" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                وضعیت پرونده‌ها
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} (${toPersianNumber(Math.round(percent * 100))}%)`}>
                    {statusData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Trend + Recent Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-500" />
                روند درآمد و هزینه
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#10b981" name="درآمد" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                  <Line type="monotone" dataKey="expense" stroke="#f59e0b" name="هزینه" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-500" />
                  {t('dashboard.recentCases')}
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setPage('cases')}>
                  مشاهده همه <ChevronLeft className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[260px] overflow-y-auto">
              {cases.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.caseNumber} · {getCaseTypeName(c.type, lang)}</p>
                  </div>
                  <Badge variant="secondary" className={`text-xs shrink-0 ${getStatusColor(c.status)}`}>{t(`caseStatus.${c.status}`, lang)}</Badge>
                </div>
              ))}
              {cases.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">{t('common.noData')}</p>}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Team Performance + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Star className="w-4 h-4 text-emerald-500" />
                عملکرد تیم وکلا
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topLawyers.map((lawyer, idx) => (
                <div key={lawyer.id} className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700' : idx === 1 ? 'bg-slate-200 dark:bg-slate-700 text-slate-600' : 'bg-orange-100 dark:bg-orange-900/40 text-orange-700'}`}>
                      {toPersianNumber(idx + 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{lawyer.name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{toPersianNumber(lawyer.cases)} پرونده</span>
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500" />{toPersianNumber(lawyer.rating)}</span>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-emerald-600">{formatCurrency(lawyer.revenue, lang)}</p>
                  </div>
                  <Progress value={(lawyer.revenue / lawyer.maxRevenue) * 100} className="h-2" />
                </div>
              ))}
              {topLawyers.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">{t('common.noData')}</p>}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                فعالیت‌های اخیر
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[300px] overflow-y-auto">
              <div className="space-y-1">
                {activityFeed.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-relaxed">{item.text}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))}
                {activityFeed.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">{t('common.noData')}</p>}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Deadlines + Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Timer className="w-4 h-4 text-amber-500" />
                مهلت‌های این هفته
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[220px] overflow-y-auto">
              {deadlines.length > 0 ? deadlines.map((d) => (
                <div key={d.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors border border-border/50">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 shrink-0">
                    <Gavel className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{d.title}</p>
                    <p className="text-xs text-muted-foreground">{d.caseNumber}</p>
                  </div>
                  <div className="text-left shrink-0">
                    <p className="text-xs font-medium">{formatDate(d.date, lang)}</p>
                    <Badge variant="secondary" className={`text-[10px] mt-1 ${getStatusColor(d.status)}`}>{t(`caseStatus.${d.status}`, lang)}</Badge>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6">
                  <Timer className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">مهلتی برای این هفته وجود ندارد</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  {t('dashboard.pendingTasks')}
                </CardTitle>
                <Badge variant="secondary" className="text-xs">{toPersianNumber(stats.pendingTasks.length)} وظیفه</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[220px] overflow-y-auto">
              {stats.pendingTasks.slice(0, 5).map((tk) => (
                <div key={tk.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${tk.priority === 'URGENT' ? 'bg-red-500' : tk.priority === 'HIGH' ? 'bg-orange-500' : tk.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tk.title}</p>
                    {tk.dueDate && <p className="text-xs text-muted-foreground">{formatDate(tk.dueDate, lang)}</p>}
                  </div>
                  <Badge variant="secondary" className={`text-xs shrink-0 ${getStatusColor(tk.status)}`}>{t(`taskStatus.${tk.status}`, lang)}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
