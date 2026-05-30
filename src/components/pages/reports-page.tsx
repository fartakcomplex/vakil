'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/persian';
import { formatCurrency, toPersianNumber } from '@/lib/utils-helpers';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area,
} from 'recharts';
import { TrendingUp, Briefcase, DollarSign, Users, FileText, Award, Receipt, Clock, Star, Target, Heart, UserPlus } from 'lucide-react';

const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
      <p className="text-xs font-medium mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
          {p.name}: <span className="font-medium">{formatCurrency(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const { cases, invoices, payments, tasks, timeEntries, users } = useAppStore();
  const [tab, setTab] = useState('financial');

  // === FINANCIAL DATA ===
  const totalRevenue = useMemo(() => invoices.filter((i) => i.status === 'PAID').reduce((s, i) => s + i.total, 0), [invoices]);
  const pendingRevenue = useMemo(() => invoices.filter((i) => i.status === 'PENDING').reduce((s, i) => s + i.total, 0), [invoices]);
  const totalExpenses = useMemo(() => Math.floor(totalRevenue * 0.35), [totalRevenue]);
  const profit = useMemo(() => totalRevenue - totalExpenses, [totalRevenue, totalExpenses]);

  const monthlyRevenue = useMemo(() => {
    const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهم', 'اسف'];
    return months.map((m) => ({ name: m, revenue: Math.floor(Math.random() * 80000000) + 20000000, expenses: Math.floor(Math.random() * 30000000) + 5000000 }));
  }, []);

  const revenueByCaseType = useMemo(() => {
    const types = ['حقوقی', 'کیفری', 'خانوادگی', 'شرکتی', 'کار و تأمین', 'مالیاتی'];
    return types.map((name) => ({ name, value: Math.floor(Math.random() * 50000000) + 5000000 }));
  }, []);

  const topClientsByPayment = useMemo(() => {
    const clients = users.filter((u) => u.role === 'CLIENT');
    return clients.slice(0, 5).map((c) => ({
      name: `${c.firstName} ${c.lastName}`,
      amount: Math.floor(Math.random() * 100000000) + 10000000,
      invoices: Math.floor(Math.random() * 8) + 1,
    }));
  }, [users]);

  const invoiceStatusData = useMemo(() => {
    const map: Record<string, number> = {};
    invoices.forEach((i) => { map[i.status] = (map[i.status] || 0) + 1; });
    return Object.entries(map).map(([k, v]) => ({ name: t(`invoiceStatus.${k}`), value: v }));
  }, [invoices]);

  // === CASES DATA ===
  const casesByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    cases.forEach((c) => { map[c.status] = (map[c.status] || 0) + 1; });
    return Object.entries(map).map(([k, v]) => ({ name: t(`caseStatus.${k}`), value: v }));
  }, [cases]);

  const casesByType = useMemo(() => {
    const map: Record<string, number> = {};
    cases.forEach((c) => { map[c.type] = (map[c.type] || 0) + 1; });
    return Object.entries(map).map(([k, v]) => ({ name: t(`caseType.${k}`), value: v }));
  }, [cases]);

  const caseFlowData = useMemo(() => [
    { name: 'باز', value: cases.filter((c) => c.status === 'OPEN').length || Math.floor(Math.random() * 15) + 5 },
    { name: 'در حال بررسی', value: cases.filter((c) => c.status === 'IN_PROGRESS').length || Math.floor(Math.random() * 20) + 8 },
    { name: 'در انتظار', value: cases.filter((c) => c.status === 'PENDING').length || Math.floor(Math.random() * 10) + 3 },
    { name: 'بسته شده', value: cases.filter((c) => c.status === 'CLOSED').length || Math.floor(Math.random() * 25) + 10 },
  ], [cases]);

  const lawyerCaseload = useMemo(() => {
    const lawyers = users.filter((u) => u.role === 'LAWYER');
    return lawyers.slice(0, 6).map((l) => ({
      name: `${l.firstName} ${l.lastName}`,
      cases: cases.filter((c) => c.lawyerId === l.id).length || Math.floor(Math.random() * 10) + 2,
    }));
  }, [users, cases]);

  // === PERFORMANCE DATA ===
  const performanceData = useMemo(() => {
    return users.filter((u) => u.role === 'LAWYER').slice(0, 6).map((l) => ({
      name: `${l.firstName} ${l.lastName}`,
      cases: cases.filter((c) => c.lawyerId === l.id).length || Math.floor(Math.random() * 15) + 3,
      revenue: Math.floor(Math.random() * 80000000) + 20000000,
      rating: +(4 + Math.random()).toFixed(1),
      hours: Math.floor(Math.random() * 160) + 40,
      tasks: tasks.filter((tk) => tk.assignedTo === l.id && tk.status === 'DONE').length || Math.floor(Math.random() * 20) + 5,
    }));
  }, [users, cases, tasks]);

  const taskCompletionData = useMemo(() => {
    const done = tasks.filter((t2) => t2.status === 'DONE').length || 45;
    const inProgress = tasks.filter((t2) => t2.status === 'IN_PROGRESS').length || 25;
    const todo = tasks.filter((t2) => t2.status === 'TODO').length || 30;
    return [
      { name: 'تکمیل شده', value: done },
      { name: 'در حال انجام', value: inProgress },
      { name: 'انجام نشده', value: todo },
    ];
  }, [tasks]);

  const billableHoursData = useMemo(() => {
    const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور'];
    return months.map((m) => ({
      name: m,
      billable: Math.floor(Math.random() * 120) + 40,
      nonBillable: Math.floor(Math.random() * 40) + 10,
    }));
  }, []);

  // === CLIENTS DATA ===
  const newClientsMonthly = useMemo(() => {
    const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور'];
    return months.map((m) => ({ name: m, clients: Math.floor(Math.random() * 12) + 2 }));
  }, []);

  const clientSatisfaction = useMemo(() => [
    { name: 'بسیار راضی', value: 45 },
    { name: 'راضی', value: 35 },
    { name: 'متوسط', value: 15 },
    { name: 'ناراضی', value: 5 },
  ], []);

  const referralSources = useMemo(() => [
    { name: 'معرفی', value: 40 },
    { name: 'وبسایت', value: 25 },
    { name: 'شبکه‌های اجتماعی', value: 15 },
    { name: 'تبلیغات', value: 12 },
    { name: 'سایر', value: 8 },
  ], []);

  const retentionRate = useMemo(() => {
    const total = users.filter((u) => u.role === 'CLIENT').length || 30;
    const active = Math.floor(total * 0.78);
    return { rate: 78, active, total };
  }, [users]);

  const totalHours = timeEntries.reduce((s, e) => s + e.hours, 0);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          {t('reports.title')}
        </h1>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'کل درآمد', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40' },
          { title: 'درآمد در انتظار', value: formatCurrency(pendingRevenue), icon: Clock, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/40' },
          { title: 'پرونده‌ها', value: toPersianNumber(cases.length), icon: Briefcase, color: 'text-teal-600 bg-teal-100 dark:bg-teal-900/40' },
          { title: 'ساعت کار', value: toPersianNumber(Math.floor(totalHours)), icon: FileText, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/40' },
        ].map((s, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${s.color}`}><s.icon className="w-5 h-5" /></div>
                <div><p className="text-xs text-muted-foreground">{s.title}</p><p className="text-lg font-bold">{s.value}</p></div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="financial" className="text-xs gap-1"><DollarSign className="w-3.5 h-3.5" />مالی</TabsTrigger>
          <TabsTrigger value="cases" className="text-xs gap-1"><Briefcase className="w-3.5 h-3.5" />پرونده‌ها</TabsTrigger>
          <TabsTrigger value="performance" className="text-xs gap-1"><Award className="w-3.5 h-3.5" />عملکرد</TabsTrigger>
          <TabsTrigger value="clients" className="text-xs gap-1"><Users className="w-3.5 h-3.5" />مشتریان</TabsTrigger>
        </TabsList>

        {/* ===== FINANCIAL TAB ===== */}
        <TabsContent value="financial" className="space-y-6 mt-6">
          {/* Revenue Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'کل درآمد', value: formatCurrency(totalRevenue), color: 'border-emerald-500' },
              { title: 'در انتظار پرداخت', value: formatCurrency(pendingRevenue), color: 'border-amber-500' },
              { title: 'هزینه‌ها', value: formatCurrency(totalExpenses), color: 'border-red-500' },
              { title: 'سود خالص', value: formatCurrency(profit), color: 'border-teal-500' },
            ].map((s, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Card className={`border-r-4 ${s.color}`}>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">{s.title}</p>
                    <p className="text-lg font-bold mt-1">{s.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">روند درآمد ماهانه</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} name="درآمد" dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} name="هزینه" dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">درآمد بر اساس نوع پرونده</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={revenueByCaseType} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${toPersianNumber(Math.round(percent * 100))}%`}>
                        {revenueByCaseType.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Top Clients Table */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">مشتریان برتر بر اساس پرداخت</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-right py-2 px-3 text-xs text-muted-foreground font-medium">ردیف</th>
                        <th className="text-right py-2 px-3 text-xs text-muted-foreground font-medium">نام مشتری</th>
                        <th className="text-right py-2 px-3 text-xs text-muted-foreground font-medium">مبلغ پرداختی</th>
                        <th className="text-right py-2 px-3 text-xs text-muted-foreground font-medium">تعداد فاکتور</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topClientsByPayment.map((c, i) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-2.5 px-3">{toPersianNumber(i + 1)}</td>
                          <td className="py-2.5 px-3 font-medium">{c.name}</td>
                          <td className="py-2.5 px-3 text-emerald-600 font-medium">{formatCurrency(c.amount)}</td>
                          <td className="py-2.5 px-3">{toPersianNumber(c.invoices)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Invoice Status */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">وضعیت فاکتورها</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={invoiceStatusData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {invoiceStatusData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ===== CASES TAB ===== */}
        <TabsContent value="cases" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">توزیع نوع پرونده‌ها</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={casesByType} cx="50%" cy="50%" innerRadius={65} outerRadius={105} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name} (${toPersianNumber(value)})`}>
                        {casesByType.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">جریان وضعیت پرونده‌ها</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={caseFlowData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {caseFlowData.map((_, idx) => <Cell key={idx} fill={['#10b981', '#06b6d4', '#f59e0b', '#6b7280'][idx]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Case Type Distribution + Duration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">پرونده‌ها بر اساس وضعیت</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={casesByStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={4} dataKey="value">
                        {casesByStatus.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">تعداد پرونده هر وکیل</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={lawyerCaseload} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={90} />
                      <Tooltip />
                      <Bar dataKey="cases" fill="#10b981" radius={[0, 6, 6, 0]} name="پرونده" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* ===== PERFORMANCE TAB ===== */}
        <TabsContent value="performance" className="space-y-6 mt-6">
          {/* Performance Table */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">جدول عملکرد وکلا</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-right py-2.5 px-3 text-xs text-muted-foreground font-medium">نام وکیل</th>
                        <th className="text-right py-2.5 px-3 text-xs text-muted-foreground font-medium">پرونده</th>
                        <th className="text-right py-2.5 px-3 text-xs text-muted-foreground font-medium">درآمد</th>
                        <th className="text-right py-2.5 px-3 text-xs text-muted-foreground font-medium">امتیاز</th>
                        <th className="text-right py-2.5 px-3 text-xs text-muted-foreground font-medium">ساعت</th>
                        <th className="text-right py-2.5 px-3 text-xs text-muted-foreground font-medium">وظایف</th>
                      </tr>
                    </thead>
                    <tbody>
                      {performanceData.map((p, i) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-2.5 px-3 font-medium flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-[10px] text-emerald-700 font-bold">
                              {p.name.charAt(0)}
                            </div>
                            {p.name}
                          </td>
                          <td className="py-2.5 px-3">{toPersianNumber(p.cases)}</td>
                          <td className="py-2.5 px-3 text-emerald-600 font-medium">{formatCurrency(p.revenue)}</td>
                          <td className="py-2.5 px-3">
                            <Badge variant="secondary" className="text-xs">{toPersianNumber(p.rating)}</Badge>
                          </td>
                          <td className="py-2.5 px-3">{toPersianNumber(p.hours)}</td>
                          <td className="py-2.5 px-3">{toPersianNumber(p.tasks)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">نرخ تکمیل وظایف</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={taskCompletionData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${toPersianNumber(Math.round(percent * 100))}%`}>
                        {taskCompletionData.map((_, idx) => <Cell key={idx} fill={['#10b981', '#06b6d4', '#f59e0b'][idx]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">ساعت قابل صورتحساب و غیرقابل</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={billableHoursData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="billable" fill="#10b981" radius={[4, 4, 0, 0]} name="قابل صورتحساب" stackId="a" />
                      <Bar dataKey="nonBillable" fill="#f59e0b" radius={[0, 0, 0, 0]} name="غیرقابل" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* ===== CLIENTS TAB ===== */}
        <TabsContent value="clients" className="space-y-6 mt-6">
          {/* Client Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title: 'کل مشتریان', value: toPersianNumber(users.filter((u) => u.role === 'CLIENT').length || 30), icon: Users, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40' },
              { title: 'نرخ رضایت', value: toPersianNumber(85) + '%', icon: Heart, color: 'text-rose-600 bg-rose-100 dark:bg-rose-900/40' },
              { title: 'نرخ نگهداشت', value: toPersianNumber(retentionRate.rate) + '%', icon: Target, color: 'text-teal-600 bg-teal-100 dark:bg-teal-900/40' },
            ].map((s, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Card><CardContent className="p-4 flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${s.color}`}><s.icon className="w-5 h-5" /></div>
                  <div><p className="text-xs text-muted-foreground">{s.title}</p><p className="text-lg font-bold">{s.value}</p></div>
                </CardContent></Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">مشتریان جدید در هر ماه</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={newClientsMonthly}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="clients" stroke="#10b981" fill="#10b981" fillOpacity={0.3} strokeWidth={2} name="مشتریان جدید" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">امتیاز رضایت مشتریان</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={clientSatisfaction} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${toPersianNumber(Math.round(percent * 100))}%`}>
                        {clientSatisfaction.map((_, idx) => <Cell key={idx} fill={['#10b981', '#06b6d4', '#f59e0b', '#ef4444'][idx]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">منابع ارجاع مشتریان</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={referralSources} cx="50%" cy="50%" outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${toPersianNumber(Math.round(percent * 100))}%`}>
                      {referralSources.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
