'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/persian';
import { toPersianNumber, formatDate } from '@/lib/utils-helpers';
import { ChevronRight, ChevronLeft, Plus, Calendar, Clock, MapPin, Gavel, Loader2, Check, CalendarPlus, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ title: '', date: '', startTime: '', endTime: '', type: 'MEETING', description: '' });
  const { toast } = useToast();

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
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = 'عنوان رویداد الزامی است';
    if (!form.date) newErrors.date = 'تاریخ رویداد الزامی است';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    setErrors({});
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${useAppStore.getState().token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setCalendarEvents([data.data || data, ...calendarEvents]);
        setDialogOpen(false);
        setForm({ title: '', date: '', startTime: '', endTime: '', type: 'MEETING', description: '' });
        toast({ title: 'رویداد جدید ثبت شد', description: 'رویداد با موفقیت ایجاد شد', variant: 'default' });
      } else {
        const err = await res.json().catch(() => ({}));
        toast({ title: 'خطا', description: err.error || 'خطا در ثبت رویداد', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'خطا', description: 'خطا در ارتباط با سرور', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('calendar.title')}</h1>
        <Sheet open={dialogOpen} onOpenChange={setDialogOpen}>
          <SheetTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white"><Plus className="w-4 h-4 ml-1" />{t('calendar.newEvent')}</Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-[550px] overflow-y-auto">
            <div className="bg-gradient-to-l from-emerald-600 to-emerald-700 -mx-6 -mt-6 px-6 pt-6 pb-4 mb-4 rounded-b-xl">
              <SheetHeader>
                <SheetTitle className="text-white flex items-center gap-2">
                  <CalendarPlus className="w-5 h-5" />
                  ثبت رویداد جدید
                </SheetTitle>
              </SheetHeader>
              <p className="text-emerald-100 text-xs mt-1">اطلاعات رویداد را وارد کنید</p>
            </div>

            <div className="space-y-6 px-1">
              {/* Section 1: Basic Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  <FileText className="w-4 h-4" />
                  اطلاعات رویداد
                </div>
                <Separator />
                <div className="space-y-1">
                  <Label className="text-xs">عنوان <span className="text-red-500">*</span></Label>
                  <Input value={form.title} onChange={(e) => { setForm({ ...form, title: e.target.value }); if (errors.title) setErrors({ ...errors, title: '' }); }} placeholder="عنوان رویداد" className={errors.title ? 'border-red-500' : ''} />
                  {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">نوع</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{['MEETING', 'DEADLINE', 'HEARING', 'TASK', 'REMINDER'].map((tp) => <SelectItem key={tp} value={tp}>{t(`calendar.${tp.toLowerCase()}`)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              {/* Section 2: Date & Time */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  <Clock className="w-4 h-4" />
                  زمان
                </div>
                <Separator />
                <div className="space-y-1">
                  <Label className="text-xs">تاریخ <span className="text-red-500">*</span></Label>
                  <Input type="date" value={form.date} onChange={(e) => { setForm({ ...form, date: e.target.value }); if (errors.date) setErrors({ ...errors, date: '' }); }} className={errors.date ? 'border-red-500' : ''} />
                  {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">ساعت شروع</Label>
                    <Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">ساعت پایان</Label>
                    <Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Section 3: Description */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  <FileText className="w-4 h-4" />
                  توضیحات
                </div>
                <Separator />
                <div className="space-y-1">
                  <Label className="text-xs">توضیحات</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="توضیحات رویداد..." />
                </div>
              </div>

              <Button onClick={handleCreate} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11">
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin ml-2" />در حال ثبت...</>
                ) : (
                  <><Check className="w-4 h-4 ml-2" />ثبت رویداد</>
                )}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
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
                  {e.startTime && <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{e.startTime}{e.endTime ? ` - ${e.endTime}` : ''}</p>}
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
