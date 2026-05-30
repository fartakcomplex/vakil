'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/persian';
import { formatDate, getPriorityColor, toPersianNumber } from '@/lib/utils-helpers';
import { CheckSquare, Plus, Circle, Loader, Ban, AlertCircle } from 'lucide-react';
import type { TaskStatus, CasePriority } from '@/lib/types';

const COLUMNS: { status: TaskStatus; label: string; icon: typeof Circle; color: string }[] = [
  { status: 'TODO', label: 'انجام نشده', icon: Circle, color: 'border-slate-300 dark:border-slate-600' },
  { status: 'IN_PROGRESS', label: 'در حال انجام', icon: Loader, color: 'border-blue-400 dark:border-blue-600' },
  { status: 'DONE', label: 'تکمیل شده', icon: CheckSquare, color: 'border-emerald-400 dark:border-emerald-600' },
  { status: 'CANCELLED', label: 'لغو شده', icon: Ban, color: 'border-red-300 dark:border-red-600' },
];

export default function TasksPage() {
  const { tasks, setTasks, users, cases } = useAppStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM' as CasePriority, dueDate: '', assignedTo: '', caseId: '' });

  const grouped = useMemo(() => {
    const map: Record<string, typeof tasks> = {};
    COLUMNS.forEach((c) => { map[c.status] = []; });
    tasks.forEach((tk) => { if (map[tk.status]) map[tk.status].push(tk); });
    return map;
  }, [tasks]);

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${useAppStore.getState().token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setTasks([data.data, ...tasks]);
        setDialogOpen(false);
      }
    } catch { /* ignore */ }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('tasks.title')}</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white"><Plus className="w-4 h-4 ml-1" />{t('tasks.new')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t('tasks.new')}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1"><Label className="text-xs">عنوان</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">توضیحات</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">اولویت</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as CasePriority })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as CasePriority[]).map((p) => <SelectItem key={p} value={p}>{t(`priority.${p}`)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label className="text-xs">مهلت</Label><Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div>
              </div>
              <div className="space-y-1"><Label className="text-xs">اختصاص به</Label>
                <Select value={form.assignedTo} onValueChange={(v) => setForm({ ...form, assignedTo: v })}>
                  <SelectTrigger><SelectValue placeholder="انتخاب" /></SelectTrigger>
                  <SelectContent>{users.map((u) => <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreate} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">{t('common.save')}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((col) => (
          <Card key={col.status} className={`border-t-2 ${col.color}`}>
            <CardHeader className="pb-2 pt-3 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <col.icon className="w-4 h-4" />
                  <CardTitle className="text-sm font-medium">{col.label}</CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs">{toPersianNumber(grouped[col.status]?.length || 0)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <ScrollArea className="max-h-[400px]">
                <div className="space-y-2">
                  {(grouped[col.status] || []).map((tk) => (
                    <motion.div key={tk.id} whileHover={{ scale: 1.01 }} className="p-3 rounded-lg border hover:shadow-sm transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-medium">{tk.title}</p>
                        <Badge className={`text-[10px] shrink-0 ${getPriorityColor(tk.priority)}`}>{t(`priority.${tk.priority}`)}</Badge>
                      </div>
                      {tk.dueDate && <p className="text-xs text-muted-foreground">{formatDate(tk.dueDate)}</p>}
                      {tk.assignee && <p className="text-xs text-muted-foreground mt-1">{tk.assignee.firstName} {tk.assignee.lastName}</p>}
                    </motion.div>
                  ))}
                  {(!grouped[col.status] || grouped[col.status].length === 0) && (
                    <p className="text-xs text-muted-foreground text-center py-6">{t('common.noData')}</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
