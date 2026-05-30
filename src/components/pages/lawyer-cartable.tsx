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
  getCaseTypeName, getRelativeTime, getInitials, getFullName,
  formatTime,
} from '@/lib/utils-helpers';
import {
  Briefcase, Clock, CalendarDays, FileText, MessageSquare,
  Bell, Gavel, ChevronLeft, Timer, CheckCircle2, AlertTriangle,
  Users, Scale, ArrowUpLeft, TrendingUp, Star, Phone,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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

export default function LawyerCartable() {
  const {
    currentUser, cases, appointments, invoices, tasks, notifications,
    payments, timeEntries, users, messages, setPage,
  } = useAppStore();
  const lang = 'fa';
  const userId = currentUser?.id;

  // ===== FILTER DATA FOR THIS LAWYER =====
  const myCases = useMemo(() => cases.filter(c => c.lawyerId === userId), [cases, userId]);
  const myTasks = useMemo(() => tasks.filter(t => t.assignedTo === userId), [tasks, userId]);
  const myAppointments = useMemo(() => appointments.filter(a => a.lawyerId === userId), [appointments, userId]);
  const myNotifications = useMemo(() => notifications.filter(n => n.userId === userId), [notifications, userId]);
  const myTimeEntries = useMemo(() => timeEntries.filter(e => e.userId === userId), [timeEntries, userId]);
  const unreadMessages = useMemo(() => messages.filter(m => (m.receiverId === userId && !m.isRead) || (m.senderId === userId)), [messages, userId]);
  const unreadNotifs = useMemo(() => myNotifications.filter(n => !n.isRead), [myNotifications]);

  // Stats
  const stats = useMemo(() => {
    const openCases = myCases.filter(c => c.status === 'OPEN' || c.status === 'IN_PROGRESS');
    const pendingTasks = myTasks.filter(t => t.status === 'TODO' || t.status === 'IN_PROGRESS');
    const todayAppts = myAppointments.filter(a => {
      const today = new Date().toISOString().split('T')[0];
      return a.date === today;
    });
    const totalHours = myTimeEntries.reduce((s, e) => s + e.hours, 0);
    const myRevenue = invoices.filter(i => {
      const relatedCase = myCases.find(c => c.id === i.caseId);
      return relatedCase && i.status === 'PAID';
    }).reduce((s, i) => s + i.total, 0);
    return { openCases, pendingTasks, todayAppts, totalHours, myRevenue };
  }, [myCases, myTasks, myAppointments, myTimeEntries, invoices]);

  // Cases by status (pie)
  const caseStatusData = useMemo(() => {
    const map: Record<string, number> = {};
    myCases.forEach(c => { map[c.status] = (map[c.status] || 0) + 1; });
    return Object.entries(map).map(([key, value]) => ({ name: t(`caseStatus.${key}`, lang), value }));
  }, [myCases, lang]);

  // Cases by type (bar)
  const caseTypeData = useMemo(() => {
    const map: Record<string, number> = {};
    myCases.forEach(c => { map[c.type] = (map[c.type] || 0) + 1; });
    return Object.entries(map).map(([key, value]) => ({ name: getCaseTypeName(key, lang), value }));
  }, [myCases, lang]);

  // Urgent/upcoming deadlines from my cases
  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    const weekEnd = new Date(now); weekEnd.setDate(weekEnd.getDate() + 7);
    return myCases
      .filter(c => c.nextHearing && new Date(c.nextHearing) >= now && new Date(c.nextHearing) <= weekEnd)
      .sort((a, b) => new Date(a.nextHearing!).getTime() - new Date(b.nextHearing!).getTime())
      .slice(0, 6)
      .map(c => ({
        id: c.id, title: c.title, caseNumber: c.caseNumber,
        date: c.nextHearing!, status: c.status, priority: c.priority,
      }));
  }, [myCases]);

  // Today's appointments
  const todayAppts = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return myAppointments
      .filter(a => a.date === today)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .slice(0, 5);
  }, [myAppointments]);

  // Pending tasks (urgent first)
  const pendingTasks = useMemo(() => {
    const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return stats.pendingTasks
      .sort((a, b) => (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4))
      .slice(0, 6);
  }, [stats.pendingTasks]);

  // Recent activity from my cases
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
    myTasks.slice(0, 2).forEach(tk => {
      items.push({
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        text: `وظیفه "${tk.title}" — ${t(`taskStatus.${tk.status}`, lang)}`,
        time: getRelativeTime(tk.updatedAt, lang),
        color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/40',
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
  }, [myCases, myTasks, myAppointments, lang]);

  // My clients (from my cases)
  const myClients = useMemo(() => {
    const clientMap = new Map<string, { id: string; name: string; cases: number; avatar?: string | null }>();
    myCases.forEach(c => {
      if (c.client) {
        const existing = clientMap.get(c.client.id);
        if (existing) {
          existing.cases++;
        } else {
          clientMap.set(c.client.id, { id: c.client.id, name: `${c.client.firstName} ${c.client.lastName}`, cases: 1, avatar: c.client.avatar });
        }
      }
    });
    return Array.from(clientMap.values()).sort((a, b) => b.cases - a.cases).slice(0, 5);
  }, [myCases]);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            {getGreeting()}، {currentUser?.firstName} {currentUser?.lastName}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {getTodayStr()} · کارتابل شخصی شما
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1 px-3 py-1.5">
            <Scale className="w-3 h-3 text-emerald-500" />
            وکیل پایه یک دادگستری
          </Badge>
        </div>
      </div>

      {/* ===== STAT CARDS ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { title: 'پرونده‌های فعال من', value: toPersianNumber(stats.openCases.length), icon: Briefcase, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40' },
          { title: 'وظایف در انتظار', value: toPersianNumber(stats.pendingTasks.length), icon: Clock, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/40' },
          { title: 'نوبت‌های امروز', value: toPersianNumber(stats.todayAppts.length), icon: CalendarDays, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/40' },
          { title: 'ساعات ثبت شده', value: toPersianNumber(Math.round(stats.totalHours)), icon: Timer, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/40' },
          { title: 'درآمد من', value: formatCurrency(stats.myRevenue, lang), icon: TrendingUp, color: 'text-teal-600 bg-teal-100 dark:bg-teal-900/40' },
        ].map((s, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="hover:shadow-lg transition-all group">
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <s.icon className="w-4 h-4" />
                </div>
                <p className="text-[11px] text-muted-foreground mb-0.5">{s.title}</p>
                <p className="text-lg font-bold">{s.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ===== TODAY'S APPOINTMENTS + UPCOMING DEADLINES ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today Appointments */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-500" />
                  نوبت‌های امروز
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setPage('appointments')}>
                  مشاهده همه <ChevronLeft className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[280px] overflow-y-auto">
              {todayAppts.length > 0 ? todayAppts.map(a => (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors border border-border/50">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    a.type === 'IN_PERSON' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600' :
                    a.type === 'VIDEO' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600' :
                    'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600'
                  }`}>
                    {a.type === 'IN_PERSON' ? <Users className="w-4 h-4" /> :
                     a.type === 'VIDEO' ? <Phone className="w-4 h-4" /> :
                     <MessageSquare className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(a.startTime, lang)} — {formatTime(a.endTime, lang)}
                      {a.client && ` · ${a.client.firstName} ${a.client.lastName}`}
                    </p>
                  </div>
                  <Badge variant="secondary" className={`text-xs shrink-0 ${getStatusColor(a.status)}`}>
                    {t(`appointmentStatus.${a.status}`, lang)}
                  </Badge>
                </div>
              )) : (
                <div className="text-center py-8">
                  <CalendarDays className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">نوبتی برای امروز ندارید</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Gavel className="w-4 h-4 text-amber-500" />
                  جلسات و مهلت‌های آینده
                </CardTitle>
                <Badge variant="secondary" className="text-xs">{toPersianNumber(upcomingDeadlines.length)} مورد</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[280px] overflow-y-auto">
              {upcomingDeadlines.length > 0 ? upcomingDeadlines.map(d => (
                <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors border border-border/50">
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
                    <Badge variant="secondary" className={`text-[10px] mt-1 ${getStatusColor(d.status)}`}>
                      {t(`caseStatus.${d.status}`, lang)}
                    </Badge>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <Timer className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">جلسه‌ یا مهلتی در هفته آینده ندارید</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ===== MY CASES + CHARTS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Cases */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
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
            <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
              {myCases.length > 0 ? myCases.map(c => (
                <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setPage('cases')}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    c.priority === 'URGENT' ? 'bg-red-100 dark:bg-red-900/40 text-red-600' :
                    c.priority === 'HIGH' ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600' :
                    'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600'
                  }`}>
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.caseNumber} · {getCaseTypeName(c.type, lang)}
                      {c.client && ` · ${c.client.firstName} ${c.client.lastName}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant="secondary" className={`text-xs ${getStatusColor(c.status)}`}>
                      {t(`caseStatus.${c.status}`, lang)}
                    </Badge>
                    {c.nextHearing && (
                      <span className="text-[10px] text-muted-foreground">{formatDate(c.nextHearing, lang)}</span>
                    )}
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <Briefcase className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">پرونده‌ای به شما اختصاص داده نشده</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Case Status Pie */}
        <motion.div variants={itemVariants}>
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Star className="w-4 h-4 text-emerald-500" />
                وضعیت پرونده‌های من
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              {caseStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={caseStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={4} dataKey="value"
                      label={({ name, percent }) => `${name} (${toPersianNumber(Math.round(percent * 100))}%)`}>
                      {caseStatusData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-12">داده‌ای وجود ندارد</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ===== PENDING TASKS + MY CLIENTS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  وظایف در انتظار من
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setPage('tasks')}>
                  مشاهده همه <ChevronLeft className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[260px] overflow-y-auto">
              {pendingTasks.length > 0 ? pendingTasks.map(tk => (
                <div key={tk.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setPage('tasks')}>
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    tk.priority === 'URGENT' ? 'bg-red-500' :
                    tk.priority === 'HIGH' ? 'bg-orange-500' :
                    tk.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tk.title}</p>
                    {tk.dueDate && <p className="text-xs text-muted-foreground">{formatDate(tk.dueDate, lang)}</p>}
                    {tk.description && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{tk.description}</p>}
                  </div>
                  <Badge variant="secondary" className={`text-xs shrink-0 ${getStatusColor(tk.status)}`}>
                    {t(`taskStatus.${tk.status}`, lang)}
                  </Badge>
                </div>
              )) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">وظیفه‌ای در انتظار ندارید</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* My Clients */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-500" />
                  موکلین من
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setPage('clients')}>
                  مشاهده همه <ChevronLeft className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[260px] overflow-y-auto">
              {myClients.length > 0 ? myClients.map(client => (
                <div key={client.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors">
                  <Avatar className="w-9 h-9">
                    <AvatarFallback className="text-[11px] bg-teal-100 dark:bg-teal-900/40 text-teal-700">
                      {getInitials(client.name.split(' ')[0], client.name.split(' ').pop() || '')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{client.name}</p>
                    <p className="text-xs text-muted-foreground">{toPersianNumber(client.cases)} پرونده مشترک</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">موکلی ندارید</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ===== RECENT ACTIVITY ===== */}
      <motion.div variants={itemVariants}>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-emerald-500" />
              فعالیت‌های اخیر
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[250px] overflow-y-auto">
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
    </motion.div>
  );
}
