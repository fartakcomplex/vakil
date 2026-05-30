'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/persian';
import { formatDate, getPriorityColor, toPersianNumber } from '@/lib/utils-helpers';
import { CheckSquare, Plus, Circle, Loader, Ban, AlertCircle, Loader2, Check, ListTodo, Briefcase, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM' as CasePriority, dueDate: '', assignedTo: '', caseId: '' });
  const { toast } = useToast();

  const grouped = useMemo(() => {
    const map: Record<string, typeof tasks> = {};
    COLUMNS.forEach((c) => { map[c.status] = []; });
    tasks.forEach((tk) => { if (map[tk.status]) map[tk.status].push(tk); });
    return map;
  }, [tasks]);

  const handleCreate = async () => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = 'عنوان تسک الزامی است';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    setErrors({});
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${useAppStore.getState().token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setTasks([data.data || data, ...tasks]);
        setDialogOpen(false);
        setForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assignedTo: '', caseId: '' });
        toast({ title: 'تسک جدید ثبت شد', description: 'تسک با موفقیت ایجاد شد', variant: 'default' });
      } else {
        const err = await res.json().catch(() => ({}));
        toast({ title: 'خطا', description: err.error || 'خطا در ثبت تسک', variant: 'destructive' });
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
        <h1 className="text-xl font-bold">{t('tasks.title')}</h1>
        <Sheet open={dialogOpen} onOpenChange={setDialogOpen}>
          <SheetTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white"><Plus className="w-4 h-4 ml-1" />{t('tasks.new')}</Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-[550px] overflow-y-auto">
            <div className="bg-gradient-to-l from-emerald-600 to-emerald-700 -mx-6 -mt-6 px-6 pt-6 pb-4 mb-4 rounded-b-xl">
              <SheetHeader>
                <SheetTitle className="text-white flex items-center gap-2">
                  <ListTodo className="w-5 h-5" />
                  ثبت تسک جدید
                </SheetTitle>
              </SheetHeader>
              <p className="text-emerald-100 text-xs mt-1">جزئیات تسک را مشخص کنید</p>
            </div>

            <div className="space-y-6 px-1">
              {/* Section 1: Basic Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  <ListTodo className="w-4 h-4" />
                  اطلاعات اصلی
                </div>
                <Separator />
                <div className="space-y-1">
                  <Label className="text-xs">عنوان <span className="text-red-500">*</span></Label>
                  <Input value={form.title} onChange={(e) => { setForm({ ...form, title: e.target.value }); if (errors.title) setErrors({ ...errors, title: '' }); }} placeholder="عنوان تسک را وارد کنید" className={errors.title ? 'border-red-500' : ''} />
                  {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">توضیحات</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="توضیحات تکمیلی تسک..." />
                </div>
              </div>

              {/* Section 2: Settings */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  <Briefcase className="w-4 h-4" />
                  تنظیمات
                </div>
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">اولویت</Label>
                    <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as CasePriority })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as CasePriority[]).map((p) => <SelectItem key={p} value={p}>{t(`priority.${p}`)}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">مهلت</Label>
                    <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Section 3: Assignment */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  <Users className="w-4 h-4" />
                  تخصیص
                </div>
                <Separator />
                <div className="space-y-1">
                  <Label className="text-xs">پرونده</Label>
                  <Select value={form.caseId} onValueChange={(v) => setForm({ ...form, caseId: v })}>
                    <SelectTrigger><SelectValue placeholder="انتخاب پرونده (اختیاری)" /></SelectTrigger>
                    <SelectContent>{cases.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">اختصاص به</Label>
                  <Select value={form.assignedTo} onValueChange={(v) => setForm({ ...form, assignedTo: v })}>
                    <SelectTrigger><SelectValue placeholder="انتخاب فرد" /></SelectTrigger>
                    <SelectContent>{users.map((u) => <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleCreate} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11">
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin ml-2" />در حال ثبت...</>
                ) : (
                  <><Check className="w-4 h-4 ml-2" />ثبت تسک</>
                )}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
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
