'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/persian';
import { formatCurrency, toPersianNumber, formatDate, getStatusColor, getCaseTypeName } from '@/lib/utils-helpers';
import {
  Briefcase, Users, CalendarDays, FileText, Clock, TrendingUp,
  AlertCircle, CheckCircle2, Bell, DollarSign, Activity,
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

export default function DashboardPage() {
  const { currentUser, cases, appointments, invoices, tasks, notifications, payments, timeEntries, leads } = useAppStore();
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
    return months.map((m, i) => ({ name: m, revenue: Math.floor(Math.random() * 50000000) + 10000000, cases: Math.floor(Math.random() * 8) + 2 }));
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

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard.welcome')}، {currentUser?.firstName || ''}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('dashboard.overview')}</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: t('dashboard.openCases'), value: toPersianNumber(stats.openCases.length), icon: Briefcase, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40' },
          { title: t('dashboard.totalRevenue'), value: formatCurrency(stats.totalRevenue, lang), icon: DollarSign, color: 'text-teal-600 bg-teal-100 dark:bg-teal-900/40' },
          { title: t('dashboard.pendingTasks'), value: toPersianNumber(stats.pendingTasks.length), icon: Clock, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/40' },
          { title: t('notifications.unread'), value: toPersianNumber(stats.unread.length), icon: Bell, color: 'text-rose-600 bg-rose-100 dark:bg-rose-900/40' },
        ].map((s, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${s.color}`}><s.icon className="w-5 h-5" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{s.title}</p>
                  <p className="text-lg font-bold truncate">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{t('reports.financial')}</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="درآمد" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">وضعیت پرونده‌ها</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                    {statusData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Trend Chart + Recent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">روند درآمد</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#10b981" name="درآمد" strokeWidth={2} />
                  <Line type="monotone" dataKey="expense" stroke="#f59e0b" name="هزینه" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{t('dashboard.recentCases')}</CardTitle></CardHeader>
            <CardContent className="space-y-3 max-h-[250px] overflow-y-auto">
              {cases.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.caseNumber} · {getCaseTypeName(c.type, lang)}</p>
                  </div>
                  <Badge variant="secondary" className={`text-xs ${getStatusColor(c.status)}`}>{t(`caseStatus.${c.status}`, lang)}</Badge>
                </div>
              ))}
              {cases.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">{t('common.noData')}</p>}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Upcoming Appointments + Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{t('dashboard.upcomingAppointments')}</CardTitle></CardHeader>
            <CardContent className="space-y-3 max-h-[220px] overflow-y-auto">
              {appointments.slice(0, 4).map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-600">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(a.date, lang)}</p>
                  </div>
                  <Badge variant="secondary" className={`text-xs ${getStatusColor(a.status)}`}>{t(`appointmentStatus.${a.status}`, lang)}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{t('dashboard.pendingTasks')}</CardTitle></CardHeader>
            <CardContent className="space-y-3 max-h-[220px] overflow-y-auto">
              {stats.pendingTasks.slice(0, 5).map((tk) => (
                <div key={tk.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <div className={`w-2 h-2 rounded-full ${tk.priority === 'URGENT' ? 'bg-red-500' : tk.priority === 'HIGH' ? 'bg-orange-500' : tk.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tk.title}</p>
                    {tk.dueDate && <p className="text-xs text-muted-foreground">{formatDate(tk.dueDate, lang)}</p>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
