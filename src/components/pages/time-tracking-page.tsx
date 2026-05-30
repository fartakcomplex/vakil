'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/persian';
import { formatCurrency, formatDate, formatHours, toPersianNumber } from '@/lib/utils-helpers';
import { Clock, Plus, DollarSign, Timer, Loader2, Check, Briefcase, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TimeTrackingPage() {
  const { timeEntries, setTimeEntries, cases } = useAppStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ caseId: '', hours: '', description: '', date: '' });
  const { toast } = useToast();

  const totalHours = useMemo(() => timeEntries.reduce((s, e) => s + e.hours, 0), [timeEntries]);
  const billedHours = useMemo(() => timeEntries.filter((e) => e.isBilled).reduce((s, e) => s + e.hours, 0), [timeEntries]);
  const unbilledHours = totalHours - billedHours;

  const handleCreate = async () => {
    const newErrors: Record<string, string> = {};
    if (!form.hours || Number(form.hours) <= 0) newErrors.hours = 'ساعت کار الزامی است';
    if (!form.date) newErrors.date = 'تاریخ الزامی است';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    setErrors({});
    try {
      const res = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${useAppStore.getState().token}` },
        body: JSON.stringify({ ...form, hours: Number(form.hours) }),
      });
      if (res.ok) {
        const data = await res.json();
        setTimeEntries([data.data || data, ...timeEntries]);
        setDialogOpen(false);
        setForm({ caseId: '', hours: '', description: '', date: '' });
        toast({ title: 'ثبت زمان انجام شد', description: 'زمان کار با موفقیت ثبت شد', variant: 'default' });
      } else {
        const err = await res.json().catch(() => ({}));
        toast({ title: 'خطا', description: err.error || 'خطا در ثبت زمان', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'خطا', description: 'خطا در ارتباط با سرور', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('timeTracking.title')}</h1>
        <Sheet open={dialogOpen} onOpenChange={setDialogOpen}>
          <SheetTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white"><Plus className="w-4 h-4 ml-1" />{t('timeTracking.new')}</Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-[550px] overflow-y-auto">
            <div className="bg-gradient-to-l from-emerald-600 to-emerald-700 -mx-6 -mt-6 px-6 pt-6 pb-4 mb-4 rounded-b-xl">
              <SheetHeader>
                <SheetTitle className="text-white flex items-center gap-2">
                  <Timer className="w-5 h-5" />
                  ثبت زمان کار
                </SheetTitle>
              </SheetHeader>
              <p className="text-emerald-100 text-xs mt-1">زمان صرف‌شده روی پرونده را ثبت کنید</p>
            </div>

            <div className="space-y-6 px-1">
              {/* Section 1: Case & Time */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  <Briefcase className="w-4 h-4" />
                  پرونده و زمان
                </div>
                <Separator />
                <div className="space-y-1">
                  <Label className="text-xs">پرونده</Label>
                  <Select value={form.caseId} onValueChange={(v) => setForm({ ...form, caseId: v })}>
                    <SelectTrigger><SelectValue placeholder="انتخاب پرونده" /></SelectTrigger>
                    <SelectContent>{cases.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">پرونده‌ای که زمان کار روی آن ثبت می‌شود</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">ساعت <span className="text-red-500">*</span></Label>
                    <Input type="number" step="0.25" value={form.hours} onChange={(e) => { setForm({ ...form, hours: e.target.value }); if (errors.hours) setErrors({ ...errors, hours: '' }); }} placeholder="مثلاً: ۲.۵" className={errors.hours ? 'border-red-500' : ''} />
                    {errors.hours && <p className="text-xs text-red-500">{errors.hours}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">تاریخ <span className="text-red-500">*</span></Label>
                    <Input type="date" value={form.date} onChange={(e) => { setForm({ ...form, date: e.target.value }); if (errors.date) setErrors({ ...errors, date: '' }); }} className={errors.date ? 'border-red-500' : ''} />
                    {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
                  </div>
                </div>
              </div>

              {/* Section 2: Description */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  <FileText className="w-4 h-4" />
                  توضیحات
                </div>
                <Separator />
                <div className="space-y-1">
                  <Label className="text-xs">توضیحات</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="توضیح فعالیت‌های انجام‌شده..." />
                  <p className="text-[11px] text-muted-foreground">شرح مختصری از فعالیت‌هایی که انجام داده‌اید</p>
                </div>
              </div>

              <Button onClick={handleCreate} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11">
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin ml-2" />در حال ثبت...</>
                ) : (
                  <><Check className="w-4 h-4 ml-2" />ثبت زمان</>
                )}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600"><Timer className="w-5 h-5" /></div><div><p className="text-xs text-muted-foreground">{t('timeTracking.totalHours')}</p><p className="font-bold">{formatHours(totalHours)}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600"><Clock className="w-5 h-5" /></div><div><p className="text-xs text-muted-foreground">{t('timeTracking.billed')}</p><p className="font-bold">{formatHours(billedHours)}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600"><DollarSign className="w-5 h-5" /></div><div><p className="text-xs text-muted-foreground">{t('timeTracking.unbilled')}</p><p className="font-bold">{formatHours(unbilledHours)}</p></div></CardContent></Card>
      </div>

      <Card><CardContent className="p-0 divide-y divide-border">
        {timeEntries.map((entry) => (
          <div key={entry.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-600"><Clock className="w-5 h-5" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{entry.description || 'بدون توضیح'}</p>
              <p className="text-xs text-muted-foreground">{formatDate(entry.date)} {entry.case ? `· ${entry.case.title}` : ''}</p>
            </div>
            <div className="text-left">
              <p className="text-sm font-bold">{toPersianNumber(entry.hours)} ساعت</p>
              <Badge variant="secondary" className={`text-[10px] ${entry.isBilled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                {entry.isBilled ? t('timeTracking.billed') : t('timeTracking.unbilled')}
              </Badge>
            </div>
          </div>
        ))}
        {timeEntries.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">{t('common.noData')}</div>}
      </CardContent></Card>
    </motion.div>
  );
}
