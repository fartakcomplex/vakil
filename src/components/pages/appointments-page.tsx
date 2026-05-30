'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/persian';
import { formatDate, getStatusColor, getAppointmentTypeName, getStatusName } from '@/lib/utils-helpers';
import { CalendarDays, Plus, Clock, Video, Phone, MapPin, Search, Loader2, Check, FileText, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AppointmentType, AppointmentStatus } from '@/lib/types';

export default function AppointmentsPage() {
  const { appointments, setAppointments, users } = useAppStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ title: '', date: '', startTime: '09:00', endTime: '10:00', type: 'IN_PERSON' as AppointmentType, clientId: '', description: '', location: '', videoLink: '' });

  const lawyers = users.filter((u) => u.role === 'LAWYER');
  const clients = users.filter((u) => u.role === 'CLIENT');
  const { toast } = useToast();

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      const ms = !search || a.title.includes(search);
      const mf = statusFilter === 'all' || a.status === statusFilter;
      return ms && mf;
    });
  }, [appointments, search, statusFilter]);

  const handleCreate = async () => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = 'عنوان جلسه الزامی است';
    if (!form.date) newErrors.date = 'تاریخ جلسه الزامی است';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    setErrors({});
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${useAppStore.getState().token}` },
        body: JSON.stringify({ ...form, lawyerId: lawyers[0]?.id || '' }),
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments([data.data || data, ...appointments]);
        setDialogOpen(false);
        setForm({ title: '', date: '', startTime: '09:00', endTime: '10:00', type: 'IN_PERSON', clientId: '', description: '', location: '', videoLink: '' });
        toast({ title: 'نوبت جدید ثبت شد', description: 'نوبت با موفقیت ایجاد شد', variant: 'default' });
      } else {
        const err = await res.json().catch(() => ({}));
        toast({ title: 'خطا', description: err.error || 'خطا در ثبت نوبت', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'خطا', description: 'خطا در ارتباط با سرور', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const typeIcon = (type: AppointmentType) => {
    switch (type) {
      case 'VIDEO': return <Video className="w-4 h-4" />;
      case 'PHONE': return <Phone className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold">{t('appointments.title')}</h1>
        <Sheet open={dialogOpen} onOpenChange={setDialogOpen}>
          <SheetTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white"><Plus className="w-4 h-4 ml-1" />{t('appointments.new')}</Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-[550px] overflow-y-auto">
            <div className="bg-gradient-to-l from-emerald-600 to-emerald-700 -mx-6 -mt-6 px-6 pt-6 pb-4 mb-4 rounded-b-xl">
              <SheetHeader>
                <SheetTitle className="text-white flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" />
                  ثبت نوبت جدید
                </SheetTitle>
              </SheetHeader>
              <p className="text-emerald-100 text-xs mt-1">اطلاعات جلسه را وارد کنید</p>
            </div>

            <div className="space-y-6 px-1">
              {/* Section 1: Basic Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  <FileText className="w-4 h-4" />
                  اطلاعات اصلی
                </div>
                <Separator />
                <div className="space-y-1">
                  <Label className="text-xs">عنوان <span className="text-red-500">*</span></Label>
                  <Input value={form.title} onChange={(e) => { setForm({ ...form, title: e.target.value }); if (errors.title) setErrors({ ...errors, title: '' }); }} placeholder="مثلاً: مشاوره حقوقی اولیه" className={errors.title ? 'border-red-500' : ''} />
                  {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">تاریخ <span className="text-red-500">*</span></Label>
                    <Input type="date" value={form.date} onChange={(e) => { setForm({ ...form, date: e.target.value }); if (errors.date) setErrors({ ...errors, date: '' }); }} className={errors.date ? 'border-red-500' : ''} />
                    {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">نوع</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as AppointmentType })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{(['IN_PERSON', 'VIDEO', 'PHONE'] as AppointmentType[]).map((tp) => <SelectItem key={tp} value={tp}>{getAppointmentTypeName(tp)}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
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

              {/* Section 2: Location/Link */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  <MapPin className="w-4 h-4" />
                  محل برگزاری
                </div>
                <Separator />
                {form.type === 'IN_PERSON' && (
                  <div className="space-y-1">
                    <Label className="text-xs">آدرس</Label>
                    <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="آدرس محل برگزاری جلسه" />
                    <p className="text-[11px] text-muted-foreground">آدرس دقیق محل برگزاری جلسه حضوری</p>
                  </div>
                )}
                {form.type === 'VIDEO' && (
                  <div className="space-y-1">
                    <Label className="text-xs">لینک ویدیو</Label>
                    <Input value={form.videoLink} onChange={(e) => setForm({ ...form, videoLink: e.target.value })} placeholder="https://zoom.us/j/..." dir="ltr" />
                    <p className="text-[11px] text-muted-foreground">لینک جلسه آنلاین (Zoom، Google Meet و ...)</p>
                  </div>
                )}
              </div>

              {/* Section 3: Parties & Description */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  <Users className="w-4 h-4" />
                  اطراف جلسه
                </div>
                <Separator />
                <div className="space-y-1">
                  <Label className="text-xs">موکل</Label>
                  <Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v })}>
                    <SelectTrigger><SelectValue placeholder="انتخاب موکل" /></SelectTrigger>
                    <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">توضیحات</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="توضیحات مربوط به جلسه..." />
                </div>
              </div>

              <Button onClick={handleCreate} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11">
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin ml-2" />در حال ثبت...</>
                ) : (
                  <><Check className="w-4 h-4 ml-2" />ثبت نوبت</>
                )}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجوی نوبت..." className="pr-9 text-sm" /></div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 text-sm"><SelectValue placeholder="وضعیت" /></SelectTrigger>
          <SelectContent><SelectItem value="all">همه</SelectItem>{(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'] as AppointmentStatus[]).map((s) => <SelectItem key={s} value={s}>{getStatusName(s)}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map((a) => (
          <motion.div key={a.id} whileHover={{ y: -1 }}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-2.5 rounded-lg ${a.type === 'VIDEO' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600' : a.type === 'PHONE' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600' : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600'}`}>
                  {typeIcon(a.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{a.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <CalendarDays className="w-3 h-3" /><span>{formatDate(a.date)}</span>
                    <Clock className="w-3 h-3" /><span>{a.startTime} - {a.endTime}</span>
                    {a.lawyer && <span>· {a.lawyer.firstName} {a.lawyer.lastName}</span>}
                  </div>
                </div>
                <Badge variant="secondary" className={`text-xs ${getStatusColor(a.status)}`}>{getStatusName(a.status)}</Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">{t('common.noData')}</div>}
      </div>
    </motion.div>
  );
}
