'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/persian';
import { formatCurrency, formatDate, getStatusColor, getStatusName } from '@/lib/utils-helpers';
import { FileText, Plus, Search, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';
import type { InvoiceStatus } from '@/lib/types';

export default function InvoicesPage() {
  const { invoices, setInvoices, users } = useAppStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ clientId: '', caseId: '', amount: '', tax: '', discount: '', dueDate: '', notes: '' });
  const clients = users.filter((u) => u.role === 'CLIENT');

  const filtered = useMemo(() => {
    return invoices.filter((i) => {
      const ms = !search || i.invoiceNumber.includes(search) || i.client?.firstName?.includes(search);
      const mf = statusFilter === 'all' || i.status === statusFilter;
      return ms && mf;
    });
  }, [invoices, search, statusFilter]);

  const totalPaid = invoices.filter((i) => i.status === 'PAID').reduce((s, i) => s + i.total, 0);
  const totalPending = invoices.filter((i) => i.status === 'PENDING' || i.status === 'OVERDUE').reduce((s, i) => s + (i.total - i.paidAmount), 0);

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${useAppStore.getState().token}` },
        body: JSON.stringify({ ...form, amount: Number(form.amount) || 0, tax: Number(form.tax) || 0, discount: Number(form.discount) || 0 }),
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices([data.data, ...invoices]);
        setDialogOpen(false);
      }
    } catch { /* ignore */ }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold">{t('invoices.title')}</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white"><Plus className="w-4 h-4 ml-1" />{t('invoices.new')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t('invoices.new')}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1"><Label className="text-xs">موکل</Label>
                <Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v })}>
                  <SelectTrigger><SelectValue placeholder="انتخاب" /></SelectTrigger>
                  <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1"><Label className="text-xs">مبلغ</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
                <div className="space-y-1"><Label className="text-xs">مالیات</Label><Input type="number" value={form.tax} onChange={(e) => setForm({ ...form, tax: e.target.value })} /></div>
                <div className="space-y-1"><Label className="text-xs">تخفیف</Label><Input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} /></div>
              </div>
              <div className="space-y-1"><Label className="text-xs">تاریخ سررسید</Label><Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div>
              <Button onClick={handleCreate} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">{t('common.save')}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600"><CheckCircle className="w-5 h-5" /></div><div><p className="text-xs text-muted-foreground">پرداخت شده</p><p className="font-bold">{formatCurrency(totalPaid)}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600"><AlertTriangle className="w-5 h-5" /></div><div><p className="text-xs text-muted-foreground">در انتظار پرداخت</p><p className="font-bold">{formatCurrency(totalPending)}</p></div></CardContent></Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجوی فاکتور..." className="pr-9 text-sm" /></div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 text-sm"><SelectValue placeholder="وضعیت" /></SelectTrigger>
          <SelectContent><SelectItem value="all">همه</SelectItem>{(['PENDING', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED'] as InvoiceStatus[]).map((s) => <SelectItem key={s} value={s}>{getStatusName(s)}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <Card><CardContent className="p-0 divide-y divide-border">
        {filtered.map((inv) => (
          <div key={inv.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-600"><FileText className="w-5 h-5" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{inv.invoiceNumber}</p>
              <p className="text-xs text-muted-foreground">{inv.client ? `${inv.client.firstName} ${inv.client.lastName}` : ''} · {formatDate(inv.dueDate)}</p>
            </div>
            <div className="text-left">
              <p className="text-sm font-bold">{formatCurrency(inv.total)}</p>
              {inv.paidAmount > 0 && <p className="text-xs text-muted-foreground">پرداخت: {formatCurrency(inv.paidAmount)}</p>}
            </div>
            <Badge variant="secondary" className={`text-xs ${getStatusColor(inv.status)}`}>{getStatusName(inv.status)}</Badge>
          </div>
        ))}
        {filtered.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">{t('common.noData')}</div>}
      </CardContent></Card>
    </motion.div>
  );
}
