'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/persian';
import { formatCurrency, formatDate, formatHours, toPersianNumber } from '@/lib/utils-helpers';
import { Clock, Plus, DollarSign, Timer } from 'lucide-react';

export default function TimeTrackingPage() {
  const { timeEntries, setTimeEntries, cases } = useAppStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ caseId: '', hours: '', description: '', date: '' });

  const totalHours = useMemo(() => timeEntries.reduce((s, e) => s + e.hours, 0), [timeEntries]);
  const billedHours = useMemo(() => timeEntries.filter((e) => e.isBilled).reduce((s, e) => s + e.hours, 0), [timeEntries]);
  const unbilledHours = totalHours - billedHours;

  const handleCreate = async () => {
    if (!form.hours || !form.date) return;
    try {
      const res = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${useAppStore.getState().token}` },
        body: JSON.stringify({ ...form, hours: Number(form.hours) }),
      });
      if (res.ok) {
        const data = await res.json();
        setTimeEntries([data.data, ...timeEntries]);
        setDialogOpen(false);
        setForm({ caseId: '', hours: '', description: '', date: '' });
      }
    } catch { /* ignore */ }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('timeTracking.title')}</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white"><Plus className="w-4 h-4 ml-1" />{t('timeTracking.new')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t('timeTracking.new')}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1"><Label className="text-xs">پرونده</Label>
                <Select value={form.caseId} onValueChange={(v) => setForm({ ...form, caseId: v })}>
                  <SelectTrigger><SelectValue placeholder="انتخاب پرونده" /></SelectTrigger>
                  <SelectContent>{cases.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">ساعت</Label><Input type="number" step="0.25" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} placeholder="مثلاً 2.5" /></div>
                <div className="space-y-1"><Label className="text-xs">تاریخ</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              </div>
              <div className="space-y-1"><Label className="text-xs">توضیحات</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
              <Button onClick={handleCreate} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">{t('common.save')}</Button>
            </div>
          </DialogContent>
        </Dialog>
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
