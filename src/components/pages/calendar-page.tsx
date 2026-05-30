'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/persian';
import { toPersianNumber, formatDate } from '@/lib/utils-helpers';
import { ChevronRight, ChevronLeft, Plus, Calendar, Clock, MapPin, Gavel } from 'lucide-react';

const WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
const MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

function getDaysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year: number, month: number) { const d = new Date(year, month, 1).getDay(); return (d + 1) % 7; }

const typeColors: Record<string, string> = { MEETING: 'bg-blue-500', DEADLINE: 'bg-red-500', HEARING: 'bg-amber-500', TASK: 'bg-emerald-500', REMINDER: 'bg-purple-500' };

export default function CalendarPage() {
  const { calendarEvents, setCalendarEvents } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', startTime: '', endTime: '', type: 'MEETING', description: '' });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const prevMonthDays = getDaysInMonth(year, month - 1);

  const calendarDays = useMemo(() => {
    const days: { day: number; currentMonth: boolean; dateStr: string }[] = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, currentMonth: false, dateStr: '' });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, currentMonth: true, dateStr });
    }
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({ day: d, currentMonth: false, dateStr: '' });
    }
    return days;
  }, [year, month, daysInMonth, firstDay, prevMonthDays]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, typeof calendarEvents> = {};
    calendarEvents.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [calendarEvents]);

  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] || []) : [];

  const handleCreate = async () => {
    if (!form.title || !form.date) return;
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${useAppStore.getState().token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setCalendarEvents([data.data, ...calendarEvents]);
        setDialogOpen(false);
      }
    } catch { /* ignore */ }
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('calendar.title')}</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white"><Plus className="w-4 h-4 ml-1" />{t('calendar.newEvent')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t('calendar.newEvent')}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1"><Label className="text-xs">عنوان</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">نوع</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['MEETING', 'DEADLINE', 'HEARING', 'TASK', 'REMINDER'].map((tp) => <SelectItem key={tp} value={tp}>{t(`calendar.${tp.toLowerCase()}`)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">تاریخ</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                <div className="space-y-1"><Label className="text-xs">ساعت</Label><Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></div>
              </div>
              <div className="space-y-1"><Label className="text-xs">توضیحات</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
              <Button onClick={handleCreate} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">{t('common.save')}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronRight className="w-4 h-4" /></Button>
              <CardTitle className="text-sm font-medium">{MONTHS[month]} {toPersianNumber(year)}</CardTitle>
              <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronLeft className="w-4 h-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
              {WEEKDAYS.map((d) => <div key={d} className="bg-muted p-2 text-center text-xs font-medium text-muted-foreground">{d}</div>)}
              {calendarDays.map((d, i) => {
                const events = d.dateStr ? eventsByDate[d.dateStr] || [] : [];
                const isToday = d.dateStr === todayStr;
                const isSelected = d.dateStr === selectedDate;
                return (
                  <div key={i} onClick={() => d.dateStr && setSelectedDate(d.dateStr)} className={`bg-card p-1.5 min-h-[60px] cursor-pointer hover:bg-muted/50 transition-colors ${!d.currentMonth ? 'opacity-40' : ''} ${isSelected ? 'ring-2 ring-emerald-500' : ''}`}>
                    <span className={`text-xs font-medium ${isToday ? 'w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center' : ''}`}>{toPersianNumber(d.day)}</span>
                    <div className="mt-1 space-y-0.5">
                      {events.slice(0, 2).map((e) => (
                        <div key={e.id} className={`text-[10px] text-white px-1 rounded ${typeColors[e.type] || 'bg-slate-500'}`}>{e.title.slice(0, 8)}</div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">رویدادهای روز</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {selectedDate ? (
              selectedEvents.length > 0 ? selectedEvents.map((e) => (
                <div key={e.id} className="p-3 rounded-lg border space-y-1">
                  <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${typeColors[e.type]?.replace('bg-', 'bg-') || ''}`} /><span className="text-sm font-medium">{e.title}</span></div>
                  {e.startTime && <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{e.startTime}</p>}
                  {e.description && <p className="text-xs text-muted-foreground">{e.description}</p>}
                </div>
              )) : <p className="text-sm text-muted-foreground text-center py-4">رویدادی وجود ندارد</p>
            ) : <p className="text-sm text-muted-foreground text-center py-4">تاریخی را انتخاب کنید</p>}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
