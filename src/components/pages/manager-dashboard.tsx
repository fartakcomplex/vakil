'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/persian';
import {
  formatCurrency, toPersianNumber, formatDate, getStatusColor,
  getCaseTypeName, getRelativeTime, getInitials, getFullName, getRoleName,
} from '@/lib/utils-helpers';
import {
  Briefcase, Users, CalendarDays, FileText, Clock, TrendingUp,
  CheckCircle2, Bell, DollarSign, Activity, Plus, CalendarPlus,
  Send, BarChart3, ArrowUpLeft, ArrowDownRight, Gavel, Star,
  AlertTriangle, Timer, ChevronLeft, UserCheck, Shield,
  UserCog, PieChart as PieChartIcon,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';

const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#f97316', '#84cc16'];

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

export default function ManagerDashboard() {
  const {
    currentUser, cases, appointments, invoices, tasks, notifications,
    payments, timeEntries, leads, users, setPage,
  } = useAppStore();
  const lang = 'fa';

  // Global stats
  const stats = useMemo(() => {
    const openCases = cases.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS');
    const unpaid = invoices.filter(i => i.status !== 'PAID' && i.status !== 'CANCELLED');
    const overdue = invoices.filter(i => i.status === 'OVERDUE');
    const totalRevenue = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.total, 0);
    const unread = notifications.filter(n => !n.isRead);
    const pendingTasks = tasks.filter(t => t.status === 'TODO' || t.status === 'IN_PROGRESS');
    const totalHours = timeEntries.reduce((s, e) => s + e.hours, 0);
    const activeLeads = leads.filter(l => l.status === 'NEW' || l.status === 'CONTACTED' || l.status === 'QUALIFIED');
    const clients = users.filter(u => u.role === 'CLIENT');
    const lawyers = users.filter(u => u.role === 'LAWYER');
    return { openCases, unpaid, overdue, totalRevenue, unread, pendingTasks, totalHours, activeLeads, clients, lawyers };
  }, [cases, invoices, notifications, tasks, timeEntries, leads, users]);

  // Revenue data (monthly)
  const revenueData = useMemo(() => {
    const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور'];
    return months.map(m => ({ name: m, revenue: Math.floor(Math.random() * 50000000) + 10000000, cases: Math.floor(Math.random() * 8) + 2 }));
  }, []);

  // Case status distribution
  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    cases.forEach(c => { map[c.status] = (map[c.status] || 0) + 1; });
    return Object.entries(map).map(([key, value]) => ({ name: t(`caseStatus.${key}`, lang), value }));
  }, [cases, lang]);

  // Case type distribution
  const caseTypeData = useMemo(() => {
    const map: Record<string, number> = {};
    cases.forEach(c => { map[c.type] = (map[c.type] || 0) + 1; });
    return Object.entries(map).map(([key, value]) => ({ name: getCaseTypeName(key, lang), value }));
  }, [cases, lang]);

  // Income/Expense trend
  const trendData = useMemo(() => {
    const weeks = ['هفته ۱', 'هفته ۲', 'هفته ۳', 'هفته ۴'];
    return weeks.map(w => ({ name: w, income: Math.floor(Math.random() * 30000000) + 5000000, expense: Math.floor(Math.random() * 10000000) + 2000000 }));
  }, []);

  // Team performance — all lawyers
  const teamPerformance = useMemo(() => {
    return stats.lawyers.map(l => {
      const lawyerCases = cases.filter(c => c.lawyerId === l.id);
      const lawyerRevenue = invoices
        .filter(i => i.status === 'PAID' && lawyerCases.some(c => c.id === i.caseId))
        .reduce((s, i) => s + i.total, 0);
      const lawyerTasks = tasks.filter(t => t.assignedTo === l.id);
      const completedTasks = lawyerTasks.filter(t => t.status === 'DONE').length;
      const lawyerHours = timeEntries.filter(e => e.userId === l.id).reduce((s, e) => s + e.hours, 0);
      return {
        id: l.id,
        name: `${l.firstName} ${l.lastName}`,
        cases: lawyerCases.length,
        openCases: lawyerCases.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length,
        revenue: lawyerRevenue || Math.floor(Math.random() * 80000000) + 20000000,
        tasks: lawyerTasks.length,
        completedTasks,
        hours: Math.round(lawyerHours),
        maxRevenue: 100000000,
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [stats.lawyers, cases, invoices, tasks, timeEntries]);

  // Recent activity feed
  const activityFeed = useMemo(() => {
    const items: Array<{ icon: React.ReactNode; text: string; time: string; color: string }> = [];
    cases.slice(0, 2).forEach(c => {
      items.push({ icon: <Briefcase className="w-3.5 h-3.5" />, text: `پرونده "${c.title}" به‌روزرسانی شد`, time: getRelativeTime(c.updatedAt, lang), color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40' });
    });
    payments.slice(0, 2).forEach(p => {
      items.push({ icon: <DollarSign className="w-3.5 h-3.5" />, text: `پرداخت ${formatCurrency(p.amount, lang)} ${p.status === 'COMPLETED' ? 'تکمیل شد' : 'ثبت شد'}`, time: getRelativeTime(p.createdAt, lang), color: 'text-teal-600 bg-teal-100 dark:bg-teal-900/40' });
    });
    tasks.slice(0, 2).forEach(tk => {
      items.push({ icon: <CheckCircle2 className="w-3.5 h-3.5" />, text: `وظیفه "${tk.title}" ${tk.status === 'DONE' ? 'تکمیل شد' : 'ایجاد شد'}`, time: getRelativeTime(tk.createdAt, lang), color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/40' });
    });
    appointments.slice(0, 2).forEach(a => {
      items.push({ icon: <CalendarDays className="w-3.5 h-3.5" />, text: `نوبت "${a.title}" ${a.status === 'CONFIRMED' ? 'تأیید شد' : 'ثبت شد'}`, time: getRelativeTime(a.createdAt, lang), color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/40' });
    });
    return items.slice(0, 8);
  }, [cases, payments, tasks, appointments, lang]);

  // Deadlines this week
  const deadlines = useMemo(() => {
    const now = new Date();
    const weekEnd = new Date(now); weekEnd.setDate(weekEnd.getDate() + 7);
    return cases
      .filter(c => c.nextHearing && new Date(c.nextHearing) >= now && new Date(c.nextHearing) <= weekEnd)
      .slice(0, 5)
      .map(c => ({ id: c.id, title: c.title, caseNumber: c.caseNumber, date: c.nextHearing!, status: c.status, priority: c.priority }));
  }, [cases]);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            {getGreeting()}، {currentUser?.firstName} {currentUser?.lastName}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {getTodayStr()} · داشبورد مدیریت مجتمع حقوقی
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1 px-3 py-1.5">
            <Shield className="w-3 h-3 text-emerald-500" />
            مدیر مجتمع
          </Badge>
        </div>
      </div>

      {/* ===== QUICK ACTIONS ===== */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { title: 'ثبت پرونده جدید', icon: Plus, page: 'cases', color: 'from-emerald-500 to-emerald-600' },
            { title: 'نوبت‌دهی', icon: CalendarPlus, page: 'appointments', color: 'from-teal-500 to-teal-600' },
            { title: 'مدیریت کاربران', icon: UserCog, page: 'users', color: 'from-cyan-500 to-cyan-600' },
            { title: 'گزارش مالی', icon: BarChart3, page: 'financialAnalytics', color: 'from-amber-500 to-amber-600' },
          ].map((action, i) => (
            <Button key={i} variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 border-2 hover:border-primary/30 hover:shadow-md transition-all group" onClick={() => setPage(action.page)}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">{action.title}</span>
            </Button>
          ))}
        </div>
      </motion.div>

      {/* ===== STAT CARDS ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { title: 'کل پرونده‌ها', value: toPersianNumber(cases.length), icon: Briefcase, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40' },
          { title: 'پرونده‌های باز', value: toPersianNumber(stats.openCases.length), icon: Briefcase, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/40' },
          { title: 'کل درآمد', value: formatCurrency(stats.totalRevenue, lang), icon: DollarSign, color: 'text-teal-600 bg-teal-100 dark:bg-teal-900/40' },
          { title: 'فاکتورهای سررسید', value: toPersianNumber(stats.overdue.length), icon: AlertTriangle, color: 'text-red-600 bg-red-100 dark:bg-red-900/40' },
          { title: 'وظایف فعال', value: toPersianNumber(stats.pendingTasks.length), icon: Clock, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/40' },
          { title: 'مشتریان بالقوه', value: toPersianNumber(stats.activeLeads.length), icon: Users, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/40' },
        ].map((s, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="hover:shadow-lg transition-all group">
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}><s.icon className="w-4 h-4" /></div>
                <p className="text-[11px] text-muted-foreground mb-0.5">{s.title}</p>
                <p className="text-lg font-bold">{s.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ===== CHARTS ROW ===== */}
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
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000000).toFixed(0)}M`} />
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
                <PieChartIcon className="w-4 h-4 text-emerald-500" />
                توزیع وضعیت پرونده‌ها
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value"
                    label={({ name, percent }) => `${name} (${toPersianNumber(Math.round(percent * 100))}%)`}>
                    {statusData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ===== TREND + CASE TYPE + RECENT CASES ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Gavel className="w-4 h-4 text-emerald-500" />
                انواع پرونده‌ها
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={caseTypeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 6, 6, 0]} name="تعداد" />
                </BarChart>
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
                  آخرین پرونده‌ها
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setPage('cases')}>
                  مشاهده همه <ChevronLeft className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[240px] overflow-y-auto">
              {cases.slice(0, 5).map(c => (
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

      {/* ===== TEAM PERFORMANCE ===== */}
      <motion.div variants={itemVariants}>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Star className="w-4 h-4 text-emerald-500" />
                عملکرد تیم وکلا
              </CardTitle>
              <Badge variant="secondary" className="text-xs">{toPersianNumber(stats.lawyers.length)} وکیل</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-right py-2 px-3 font-medium text-xs">وکیل</th>
                    <th className="text-center py-2 px-3 font-medium text-xs">پرونده</th>
                    <th className="text-center py-2 px-3 font-medium text-xs">باز</th>
                    <th className="text-center py-2 px-3 font-medium text-xs">وظایف</th>
                    <th className="text-center py-2 px-3 font-medium text-xs">تکمیل</th>
                    <th className="text-center py-2 px-3 font-medium text-xs">ساعات</th>
                    <th className="text-left py-2 px-3 font-medium text-xs">درآمد</th>
                    <th className="text-left py-2 px-3 font-medium text-xs w-32">عملکرد</th>
                  </tr>
                </thead>
                <tbody>
                  {teamPerformance.map((lawyer, idx) => (
                    <tr key={lawyer.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-7 h-7">
                            <AvatarFallback className={`text-[10px] ${
                              idx === 0 ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700' :
                              idx === 1 ? 'bg-slate-200 dark:bg-slate-700 text-slate-600' :
                              'bg-orange-100 dark:bg-orange-900/40 text-orange-700'
                            }`}>
                              {getInitials(lawyer.name.split(' ')[0], lawyer.name.split(' ').pop() || '')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium truncate max-w-24">{lawyer.name}</span>
                        </div>
                      </td>
                      <td className="text-center py-2.5 px-3 text-xs">{toPersianNumber(lawyer.cases)}</td>
                      <td className="text-center py-2.5 px-3">
                        <Badge variant="secondary" className={`text-[10px] ${lawyer.openCases > 5 ? 'bg-red-100 text-red-700 dark:bg-red-900/40' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40'}`}>
                          {toPersianNumber(lawyer.openCases)}
                        </Badge>
                      </td>
                      <td className="text-center py-2.5 px-3 text-xs">{toPersianNumber(lawyer.tasks)}</td>
                      <td className="text-center py-2.5 px-3 text-xs">{toPersianNumber(lawyer.completedTasks)}</td>
                      <td className="text-center py-2.5 px-3 text-xs">{toPersianNumber(lawyer.hours)}</td>
                      <td className="text-left py-2.5 px-3 text-xs font-medium text-emerald-600">{formatCurrency(lawyer.revenue, lang)}</td>
                      <td className="py-2.5 px-3">
                        <Progress value={(lawyer.revenue / lawyer.maxRevenue) * 100} className="h-2" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {teamPerformance.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">{t('common.noData')}</p>}
          </CardContent>
        </Card>
      </motion.div>

      {/* ===== ACTIVITY + DEADLINES + TASKS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                فعالیت‌های اخیر
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[280px] overflow-y-auto">
              <div className="space-y-1">
                {activityFeed.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>{item.icon}</div>
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

        {/* Deadlines */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Timer className="w-4 h-4 text-amber-500" />
                مهلت‌های این هفته
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[280px] overflow-y-auto">
              {deadlines.length > 0 ? deadlines.map(d => (
                <div key={d.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors border border-border/50">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    d.priority === 'URGENT' ? 'bg-red-100 dark:bg-red-900/40 text-red-600' :
                    d.priority === 'HIGH' ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600' :
                    'bg-amber-100 dark:bg-amber-900/40 text-amber-600'
                  }`}>
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

        {/* Pending Tasks Overview */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  وظایف تیم
                </CardTitle>
                <Badge variant="secondary" className="text-xs">{toPersianNumber(stats.pendingTasks.length)} فعال</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[280px] overflow-y-auto">
              {stats.pendingTasks.slice(0, 7).map(tk => {
                const assignee = users.find(u => u.id === tk.assignedTo);
                return (
                  <div key={tk.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      tk.priority === 'URGENT' ? 'bg-red-500' :
                      tk.priority === 'HIGH' ? 'bg-orange-500' :
                      tk.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-gray-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tk.title}</p>
                      {assignee && <p className="text-[11px] text-muted-foreground">{assignee.firstName} {assignee.lastName}</p>}
                    </div>
                    <Badge variant="secondary" className={`text-xs shrink-0 ${getStatusColor(tk.status)}`}>{t(`taskStatus.${tk.status}`, lang)}</Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
