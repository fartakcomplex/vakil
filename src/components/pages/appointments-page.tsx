'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/persian';
import { formatDate, getStatusColor, getAppointmentTypeName, getStatusName } from '@/lib/utils-helpers';
import { CalendarDays, Plus, Clock, Video, Phone, MapPin, Search } from 'lucide-react';
import type { AppointmentType, AppointmentStatus } from '@/lib/types';

export default function AppointmentsPage() {
  const { appointments, setAppointments, users } = useAppStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', startTime: '09:00', endTime: '10:00', type: 'IN_PERSON' as AppointmentType, clientId: '', description: '' });

  const lawyers = users.filter((u) => u.role === 'LAWYER');
  const clients = users.filter((u) => u.role === 'CLIENT');

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      const ms = !search || a.title.includes(search);
      const mf = statusFilter === 'all' || a.status === statusFilter;
      return ms && mf;
    });
  }, [appointments, search, statusFilter]);

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${useAppStore.getState().token}` },
        body: JSON.stringify({ ...form, lawyerId: lawyers[0]?.id || '' }),
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments([data.data, ...appointments]);
        setDialogOpen(false);
      }
    } catch { /* ignore */ }
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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white"><Plus className="w-4 h-4 ml-1" />{t('appointments.new')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t('appointments.new')}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1"><Label className="text-xs">عنوان</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">تاریخ</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                <div className="space-y-1"><Label className="text-xs">نوع</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as AppointmentType })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{(['IN_PERSON', 'VIDEO', 'PHONE'] as AppointmentType[]).map((tp) => <SelectItem key={tp} value={tp}>{getAppointmentTypeName(tp)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">ساعت شروع</Label><Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></div>
                <div className="space-y-1"><Label className="text-xs">ساعت پایان</Label><Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></div>
              </div>
              <div className="space-y-1"><Label className="text-xs">موکل</Label>
                <Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v })}>
                  <SelectTrigger><SelectValue placeholder="انتخاب موکل" /></SelectTrigger>
                  <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label className="text-xs">توضیحات</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
              <Button onClick={handleCreate} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">{t('common.save')}</Button>
            </div>
          </DialogContent>
        </Dialog>
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
