'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/persian';
import { formatCurrency, toPersianNumber } from '@/lib/utils-helpers';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area,
} from 'recharts';
import { TrendingUp, Briefcase, DollarSign, Users, FileText, Award } from 'lucide-react';

const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function ReportsPage() {
  const { cases, invoices, payments, tasks, timeEntries, users } = useAppStore();

  const financialData = useMemo(() => {
    const months = ['فرو', 'ارد', 'خرد', 'تیر', 'مرد', 'شهر', 'مهر', 'آبا', 'آذر', 'دی', 'بهم', 'اسف'];
    return months.map((m) => ({ name: m, revenue: Math.floor(Math.random() * 80000000) + 20000000, expenses: Math.floor(Math.random() * 30000000) + 5000000 }));
  }, []);

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

  const performanceData = useMemo(() => {
    return users.filter((u) => u.role === 'LAWYER').map((l) => ({
      name: `${l.firstName} ${l.lastName}`,
      cases: cases.filter((c) => c.lawyerId === l.id).length,
      hours: Math.floor(Math.random() * 160) + 40,
      tasks: tasks.filter((tk) => tk.assignedTo === l.id && tk.status === 'DONE').length,
    }));
  }, [users, cases, tasks]);

  const totalRevenue = invoices.filter((i) => i.status === 'PAID').reduce((s, i) => s + i.total, 0);
  const totalPayments = payments.filter((p) => p.status === 'COMPLETED').reduce((s, p) => s + p.amount, 0);
  const totalHours = timeEntries.reduce((s, e) => s + e.hours, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-xl font-bold">{t('reports.title')}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'کل درآمد', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40' },
          { title: 'کل پرداخت‌ها', value: formatCurrency(totalPayments), icon: TrendingUp, color: 'text-teal-600 bg-teal-100 dark:bg-teal-900/40' },
          { title: 'پرونده‌ها', value: toPersianNumber(cases.length), icon: Briefcase, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/40' },
          { title: 'ساعت کار', value: toPersianNumber(Math.floor(totalHours)), icon: FileText, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/40' },
        ].map((s, i) => (
          <Card key={i}><CardContent className="p-4 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${s.color}`}><s.icon className="w-5 h-5" /></div>
            <div><p className="text-xs text-muted-foreground">{s.title}</p><p className="text-lg font-bold">{s.value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="financial">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="financial" className="text-xs">{t('reports.financial')}</TabsTrigger>
          <TabsTrigger value="cases" className="text-xs">{t('reports.cases')}</TabsTrigger>
          <TabsTrigger value="performance" className="text-xs">{t('reports.performance')}</TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">درآمد و هزینه</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={financialData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="درآمد" />
                    <Area type="monotone" dataKey="expenses" stackId="2" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="هزینه" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">روند پرداخت‌ها</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={financialData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="درآمد" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cases" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">پرونده‌ها بر اساس وضعیت</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={casesByStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                      {casesByStatus.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">پرونده‌ها بر اساس نوع</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={casesByType} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">عملکرد وکلا</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cases" fill="#10b981" radius={[4, 4, 0, 0]} name="پرونده" />
                  <Bar dataKey="tasks" fill="#06b6d4" radius={[4, 4, 0, 0]} name="وظایف" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
