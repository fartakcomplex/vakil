'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { formatCurrency, toPersianNumber } from '@/lib/utils-helpers';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area,
} from 'recharts';
import {
  TrendingUp, DollarSign, Receipt, CreditCard, PiggyBank,
  ArrowUpRight, ArrowDownRight, Wallet, Building, Banknote,
  Calculator, Clock, AlertTriangle, CircleDollarSign, BarChart3,
} from 'lucide-react';

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

export default function FinancialAnalyticsPage() {
  const { invoices, payments, cases } = useAppStore();

  // Revenue waterfall data
  const waterfallData = useMemo(() => [
    { name: 'حقوقی', value: 120000000 },
    { name: 'کیفری', value: 85000000 },
    { name: 'خانوادگی', value: 65000000 },
    { name: 'شرکتی', value: 95000000 },
    { name: 'هزینه‌ها', value: -150000000 },
    { name: 'سود خالص', value: 215000000 },
  ], []);

  // Cash flow data
  const cashFlowData = useMemo(() => {
    const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهم', 'اسف'];
    let cumulative = 0;
    return months.map((m) => {
      const inflow = Math.floor(Math.random() * 100000000) + 30000000;
      const outflow = Math.floor(Math.random() * 40000000) + 10000000;
      cumulative += inflow - outflow;
      return { name: m, ورودی: inflow, خروجی: outflow, 'مانده': cumulative };
    });
  }, []);

  // Budget vs Actual
  const budgetData = useMemo(() => [
    { name: 'حقوق', بودجه: 200000000, واقعی: 185000000 },
    { name: 'اجاره', بودجه: 50000000, واقعی: 52000000 },
    { name: 'تجهیزات', بودجه: 30000000, واقعی: 28000000 },
    { name: 'بازاریابی', بودجه: 25000000, واقعی: 32000000 },
    { name: 'آموزش', بودجه: 15000000, واقعی: 12000000 },
    { name: 'سایر', بودجه: 20000000, واقعی: 18000000 },
  ], []);

  // Expense categories
  const expenseCategories = useMemo(() => [
    { name: 'حقوق و مزایا', value: 45 },
    { name: 'اجاره دفتر', value: 15 },
    { name: 'بازاریابی', value: 12 },
    { name: 'تجهیزات', value: 10 },
    { name: 'آموزش', value: 8 },
    { name: 'سایر', value: 10 },
  ], []);

  // Payment method distribution
  const paymentMethods = useMemo(() => [
    { name: 'کارت بانکی', value: 45 },
    { name: 'انتقال بانکی', value: 25 },
    { name: 'نقدی', value: 15 },
    { name: 'کیف پول', value: 10 },
    { name: 'اقساط', value: 5 },
  ], []);

  // Top 5 highest value cases
  const topCases = useMemo(() => {
    return cases.slice(0, 5).map((c) => ({
      title: c.title,
      caseNumber: c.caseNumber,
      type: c.type,
      status: c.status,
      value: Math.floor(Math.random() * 200000000) + 50000000,
    }));
  }, [cases]);

  // Invoice aging
  const invoiceAging = useMemo(() => {
    const paid = invoices.filter((i) => i.status === 'PAID').length || 20;
    const d0_30 = invoices.filter((i) => i.status === 'PENDING').length || 5;
    const d31_60 = invoices.filter((i) => i.status === 'PARTIAL').length || 3;
    const d61_90 = invoices.filter((i) => i.status === 'OVERDUE').length || 2;
    return [
      { name: 'پرداخت شده', value: paid, amount: paid * 15000000 },
      { name: '۰ تا ۳۰ روز', value: d0_30, amount: d0_30 * 25000000 },
      { name: '۳۱ تا ۶۰ روز', value: d31_60, amount: d31_60 * 35000000 },
      { name: '۶۱ تا ۹۰ روز', value: d61_90, amount: d61_90 * 40000000 },
      { name: 'بیش از ۹۰ روز', value: 1, amount: 50000000 },
    ];
  }, [invoices]);

  // Lawyer commission preview
  const lawyerCommissions = useMemo(() => [
    { name: 'دکتر احمدی', cases: 12, revenue: 480000000, commission: 48000000 },
    { name: 'وکیل رضایی', cases: 8, revenue: 320000000, commission: 32000000 },
    { name: 'وکیل محمدی', cases: 15, revenue: 450000000, commission: 45000000 },
    { name: 'وکیل حسینی', cases: 6, revenue: 180000000, commission: 18000000 },
  ], []);

  // Monthly P&L
  const monthlyPL = useMemo(() => {
    const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور'];
    return months.map((m) => {
      const revenue = Math.floor(Math.random() * 100000000) + 50000000;
      const expenses = Math.floor(Math.random() * 40000000) + 20000000;
      return { name: m, درآمد: revenue, هزینه: expenses, سود: revenue - expenses };
    });
  }, []);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <CircleDollarSign className="w-5 h-5 text-emerald-500" />
          تحلیل مالی
        </h1>
        <Badge variant="outline" className="text-xs gap-1 px-3 py-1.5">
          <TrendingUp className="w-3 h-3 text-emerald-500" />
          گزارش مالی دوره جاری
        </Badge>
      </div>

      {/* Monthly P&L Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'کل درآمد', value: formatCurrency(520000000), icon: TrendingUp, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40', change: '+۱۵٪', up: true },
          { title: 'کل هزینه‌ها', value: formatCurrency(340000000), icon: ArrowDownRight, color: 'text-red-600 bg-red-100 dark:bg-red-900/40', change: '+۸٪', up: true },
          { title: 'سود خالص', value: formatCurrency(180000000), icon: PiggyBank, color: 'text-teal-600 bg-teal-100 dark:bg-teal-900/40', change: '+۲۲٪', up: true },
          { title: 'حاشیه سود', value: toPersianNumber(34) + '٪', icon: Calculator, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/40', change: '+۵٪', up: true },
        ].map((s, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 rounded-xl ${s.color}`}><s.icon className="w-5 h-5" /></div>
                  <Badge variant="secondary" className={`text-xs ${s.up ? 'text-emerald-600' : 'text-red-600'}`}>{s.change}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{s.title}</p>
                <p className="text-lg font-bold mt-1">{s.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue Waterfall */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              نمودار آبشاری درآمد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={waterfallData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {waterfallData.map((_, idx) => (
                    <Cell key={idx} fill={idx === waterfallData.length - 1 ? '#10b981' : idx === waterfallData.length - 2 ? '#ef4444' : COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cash Flow + Budget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-500" />
                جریان نقدینگی
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="ورودی" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                  <Area type="monotone" dataKey="خروجی" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} strokeWidth={2} />
                  <Line type="monotone" dataKey="مانده" stroke="#06b6d4" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                بودجه در مقابل واقعی
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="بودجه" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="واقعی" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Expense Categories + Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-500" />
                دسته‌بندی هزینه‌ها
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={expenseCategories} cx="50%" cy="50%" innerRadius={60} outerRadius={105} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${toPersianNumber(Math.round(percent * 100))}%`}>
                    {expenseCategories.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Banknote className="w-4 h-4 text-emerald-500" />
                روش‌های پرداخت
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={paymentMethods} cx="50%" cy="50%" outerRadius={105} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${toPersianNumber(Math.round(percent * 100))}%`}>
                    {paymentMethods.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top 5 Cases Table */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-500" />
              پنج پرونده با بیشترین ارزش
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-right py-2.5 px-3 text-xs text-muted-foreground font-medium">ردیف</th>
                    <th className="text-right py-2.5 px-3 text-xs text-muted-foreground font-medium">عنوان</th>
                    <th className="text-right py-2.5 px-3 text-xs text-muted-foreground font-medium">شماره</th>
                    <th className="text-right py-2.5 px-3 text-xs text-muted-foreground font-medium">نوع</th>
                    <th className="text-right py-2.5 px-3 text-xs text-muted-foreground font-medium">ارزش</th>
                  </tr>
                </thead>
                <tbody>
                  {topCases.map((c, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2.5 px-3">{toPersianNumber(i + 1)}</td>
                      <td className="py-2.5 px-3 font-medium">{c.title}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{c.caseNumber}</td>
                      <td className="py-2.5 px-3"><Badge variant="secondary" className="text-xs">{c.type}</Badge></td>
                      <td className="py-2.5 px-3 text-emerald-600 font-medium">{formatCurrency(c.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Invoice Aging + Lawyer Commission */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                گزارش سن فاکتور
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={invoiceAging}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} name="تعداد">
                    {invoiceAging.map((_, idx) => (
                      <Cell key={idx} fill={['#10b981', '#06b6d4', '#f59e0b', '#f97316', '#ef4444'][idx]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-5 gap-2 text-center">
                {invoiceAging.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="text-[10px] text-muted-foreground">{item.name}</p>
                    <p className="text-xs font-bold">{formatCurrency(item.amount)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-500" />
                پیش‌نمایش کمیسیون وکلا
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-right py-2 px-3 text-xs text-muted-foreground font-medium">نام</th>
                      <th className="text-right py-2 px-3 text-xs text-muted-foreground font-medium">پرونده</th>
                      <th className="text-right py-2 px-3 text-xs text-muted-foreground font-medium">درآمد</th>
                      <th className="text-right py-2 px-3 text-xs text-muted-foreground font-medium">کمیسیون</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lawyerCommissions.map((l, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-2 px-3 font-medium">{l.name}</td>
                        <td className="py-2 px-3">{toPersianNumber(l.cases)}</td>
                        <td className="py-2 px-3 text-emerald-600">{formatCurrency(l.revenue)}</td>
                        <td className="py-2 px-3 text-amber-600 font-medium">{formatCurrency(l.commission)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border font-bold">
                      <td colSpan={2} className="py-2 px-3">جمع</td>
                      <td className="py-2 px-3 text-emerald-600">{formatCurrency(lawyerCommissions.reduce((s, l) => s + l.revenue, 0))}</td>
                      <td className="py-2 px-3 text-amber-600">{formatCurrency(lawyerCommissions.reduce((s, l) => s + l.commission, 0))}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Monthly P&L Chart */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              سود و زیان ماهانه
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyPL}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="درآمد" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="هزینه" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="سود" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
