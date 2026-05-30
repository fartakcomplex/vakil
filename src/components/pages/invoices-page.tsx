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
import { formatCurrency, formatDate, getStatusColor, getStatusName } from '@/lib/utils-helpers';
import { FileText, Plus, Search, DollarSign, AlertTriangle, CheckCircle, Loader2, Check, Receipt, Briefcase, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { InvoiceStatus } from '@/lib/types';

export default function InvoicesPage() {
  const { invoices, setInvoices, users, cases } = useAppStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ clientId: '', caseId: '', amount: '', tax: '', discount: '', dueDate: '', description: '', notes: '' });
  const clients = users.filter((u) => u.role === 'CLIENT');
  const { toast } = useToast();

  const filtered = useMemo(() => {
    return invoices.filter((i) => {
      const ms = !search || i.invoiceNumber.includes(search) || i.client?.firstName?.includes(search);
      const mf = statusFilter === 'all' || i.status === statusFilter;
      return ms && mf;
    });
  }, [invoices, search, statusFilter]);

  const totalPaid = invoices.filter((i) => i.status === 'PAID').reduce((s, i) => s + i.total, 0);
  const totalPending = invoices.filter((i) => i.status === 'PENDING' || i.status === 'OVERDUE').reduce((s, i) => s + (i.total - i.paidAmount), 0);

  const previewTotal = useMemo(() => {
    const amt = Number(form.amount) || 0;
    const tax = Number(form.tax) || 0;
    const discount = Number(form.discount) || 0;
    return amt + tax - discount;
  }, [form.amount, form.tax, form.discount]);

  const handleCreate = async () => {
    const newErrors: Record<string, string> = {};
    if (!form.clientId) newErrors.clientId = 'انتخاب موکل الزامی است';
    if (!form.amount || Number(form.amount) <= 0) newErrors.amount = 'مبلغ فاکتور الزامی است';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    setErrors({});
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${useAppStore.getState().token}` },
        body: JSON.stringify({ ...form, amount: Number(form.amount) || 0, tax: Number(form.tax) || 0, discount: Number(form.discount) || 0 }),
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices([data.data || data, ...invoices]);
        setDialogOpen(false);
        setForm({ clientId: '', caseId: '', amount: '', tax: '', discount: '', dueDate: '', description: '', notes: '' });
        toast({ title: 'فاکتور جدید ثبت شد', description: 'فاکتور با موفقیت ایجاد شد', variant: 'default' });
      } else {
        const err = await res.json().catch(() => ({}));
        toast({ title: 'خطا', description: err.error || 'خطا در ثبت فاکتور', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'خطا', description: 'خطا در ارتباط با سرور', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold">{t('invoices.title')}</h1>
        <Sheet open={dialogOpen} onOpenChange={setDialogOpen}>
          <SheetTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white"><Plus className="w-4 h-4 ml-1" />{t('invoices.new')}</Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-[550px] overflow-y-auto">
            <div className="bg-gradient-to-l from-emerald-600 to-emerald-700 -mx-6 -mt-6 px-6 pt-6 pb-4 mb-4 rounded-b-xl">
              <SheetHeader>
                <SheetTitle className="text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  صدور فاکتور جدید
                </SheetTitle>
              </SheetHeader>
              <p className="text-emerald-100 text-xs mt-1">اطلاعات فاکتور را وارد کنید</p>
            </div>

            <div className="space-y-6 px-1">
              {/* Section 1: Client & Case */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  <Users className="w-4 h-4" />
                  موکل و پرونده
                </div>
                <Separator />
                <div className="space-y-1">
                  <Label className="text-xs">موکل <span className="text-red-500">*</span></Label>
                  <Select value={form.clientId} onValueChange={(v) => { setForm({ ...form, clientId: v }); if (errors.clientId) setErrors({ ...errors, clientId: '' }); }}>
                    <SelectTrigger className={errors.clientId ? 'border-red-500' : ''}><SelectValue placeholder="انتخاب موکل" /></SelectTrigger>
                    <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>)}</SelectContent>
                  </Select>
                  {errors.clientId && <p className="text-xs text-red-500">{errors.clientId}</p>}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">پرونده</Label>
                  <Select value={form.caseId} onValueChange={(v) => setForm({ ...form, caseId: v })}>
                    <SelectTrigger><SelectValue placeholder="انتخاب پرونده (اختیاری)" /></SelectTrigger>
                    <SelectContent>{cases.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              {/* Section 2: Amounts */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                  مبالغ
                </div>
                <Separator />
                <div className="space-y-1">
                  <Label className="text-xs">مبلغ (تومان) <span className="text-red-500">*</span></Label>
                  <Input type="number" value={form.amount} onChange={(e) => { setForm({ ...form, amount: e.target.value }); if (errors.amount) setErrors({ ...errors, amount: '' }); }} placeholder="مثلاً: ۵۰۰۰۰۰۰" className={errors.amount ? 'border-red-500' : ''} />
                  {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">مالیات (تومان)</Label>
                    <Input type="number" value={form.tax} onChange={(e) => setForm({ ...form, tax: e.target.value })} placeholder="۰" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">تخفیف (تومان)</Label>
                    <Input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} placeholder="۰" />
                  </div>
                </div>
                {/* Preview */}
                <div className="p-3 rounded-lg bg-muted/50 border space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>مبلغ:</span><span>{formatCurrency(Number(form.amount) || 0)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>+ مالیات:</span><span>{formatCurrency(Number(form.tax) || 0)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>- تخفیف:</span><span>{formatCurrency(Number(form.discount) || 0)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm font-bold">
                    <span>مبلغ کل:</span><span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(previewTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  <FileText className="w-4 h-4" />
                  جزئیات
                </div>
                <Separator />
                <div className="space-y-1">
                  <Label className="text-xs">تاریخ سررسید</Label>
                  <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">شرح</Label>
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="شرح خدمات ارائه‌شده" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">یادداشت</Label>
                  <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="یادداشت‌های داخلی..." />
                  <p className="text-[11px] text-muted-foreground">این یادداشت‌ها فقط برای تیم داخلی قابل مشاهده است</p>
                </div>
              </div>

              <Button onClick={handleCreate} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11">
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin ml-2" />در حال ثبت...</>
                ) : (
                  <><Check className="w-4 h-4 ml-2" />صدور فاکتور</>
                )}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
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
