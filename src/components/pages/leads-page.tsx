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
import { formatCurrency, getStatusColor, getStatusName, toPersianNumber } from '@/lib/utils-helpers';
import { Plus, UserPlus, Phone, Mail, DollarSign } from 'lucide-react';
import type { LeadStatus } from '@/lib/types';

const COLUMNS: { status: LeadStatus; label: string; color: string }[] = [
  { status: 'NEW', label: 'جدید', color: 'border-sky-400' },
  { status: 'CONTACTED', label: 'تماس گرفته شده', color: 'border-blue-400' },
  { status: 'QUALIFIED', label: 'واجد شرایط', color: 'border-amber-400' },
  { status: 'CONVERTED', label: 'تبدیل شده', color: 'border-emerald-400' },
  { status: 'LOST', label: 'از دست رفته', color: 'border-gray-400' },
];

export default function LeadsPage() {
  const { leads, setLeads, users } = useAppStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', source: '', value: '', notes: '' });

  const grouped = useMemo(() => {
    const map: Record<string, typeof leads> = {};
    COLUMNS.forEach((c) => { map[c.status] = []; });
    leads.forEach((l) => { if (map[l.status]) map[l.status].push(l); });
    return map;
  }, [leads]);

  const handleCreate = async () => {
    if (!form.name) return;
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${useAppStore.getState().token}` },
        body: JSON.stringify({ ...form, assignedToId: users[0]?.id || '' }),
      });
      if (res.ok) {
        const data = await res.json();
        setLeads([data.data, ...leads]);
        setDialogOpen(false);
        setForm({ name: '', email: '', phone: '', source: '', value: '', notes: '' });
      }
    } catch { /* ignore */ }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('leads.title')}</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white"><Plus className="w-4 h-4 ml-1" />{t('leads.new')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t('leads.new')}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1"><Label className="text-xs">{t('leads.name')}</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">ایمیل</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div className="space-y-1"><Label className="text-xs">تلفن</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">{t('leads.source')}</Label><Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} /></div>
                <div className="space-y-1"><Label className="text-xs">{t('leads.value')}</Label><Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></div>
              </div>
              <div className="space-y-1"><Label className="text-xs">{t('leads.notes')}</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
              <Button onClick={handleCreate} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">{t('common.save')}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {COLUMNS.map((col) => (
          <Card key={col.status} className={`border-t-2 ${col.color}`}>
            <CardHeader className="pb-2 pt-3 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium">{col.label}</CardTitle>
                <Badge variant="secondary" className="text-[10px]">{toPersianNumber(grouped[col.status]?.length || 0)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <ScrollArea className="max-h-[350px]">
                <div className="space-y-2">
                  {(grouped[col.status] || []).map((l) => (
                    <div key={l.id} className="p-3 rounded-lg border hover:shadow-sm transition-shadow">
                      <p className="text-sm font-medium">{l.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        {l.email && <span className="flex items-center gap-0.5"><Mail className="w-3 h-3" />{l.email}</span>}
                        {l.phone && <span className="flex items-center gap-0.5"><Phone className="w-3 h-3" />{l.phone}</span>}
                      </div>
                      {l.value && <div className="flex items-center gap-1 text-xs mt-1 text-emerald-600"><DollarSign className="w-3 h-3" />{formatCurrency(l.value)}</div>}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
