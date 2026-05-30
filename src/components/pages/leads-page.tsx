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
import { formatCurrency, getStatusColor, getStatusName, toPersianNumber } from '@/lib/utils-helpers';
import { Plus, Phone, Mail, DollarSign, Loader2, Check, UserPlus, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { LeadStatus } from '@/lib/types';

const COLUMNS: { status: LeadStatus; label: string; color: string }[] = [
  { status: 'NEW', label: 'جدید', color: 'border-sky-400' },
  { status: 'CONTACTED', label: 'تماس گرفته شده', color: 'border-blue-400' },
  { status: 'QUALIFIED', label: 'واجد شرایط', color: 'border-amber-400' },
  { status: 'CONVERTED', label: 'تبدیل شده', color: 'border-emerald-400' },
  { status: 'LOST', label: 'از دست رفته', color: 'border-gray-400' },
];

const leadSources = ['وبسایت', 'معرفی', 'تبلیغات', 'شبکه‌های اجتماعی', 'جستجوی گوگل', 'سایر'];

export default function LeadsPage() {
  const { leads, setLeads, users } = useAppStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: '', email: '', phone: '', source: '', value: '', notes: '', description: '' });
  const { toast } = useToast();

  const grouped = useMemo(() => {
    const map: Record<string, typeof leads> = {};
    COLUMNS.forEach((c) => { map[c.status] = []; });
    leads.forEach((l) => { if (map[l.status]) map[l.status].push(l); });
    return map;
  }, [leads]);

  const handleCreate = async () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'نام مشتری الزامی است';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    setErrors({});
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${useAppStore.getState().token}` },
        body: JSON.stringify({ ...form, assignedToId: users[0]?.id || '' }),
      });
      if (res.ok) {
        const data = await res.json();
        setLeads([data.data || data, ...leads]);
        setDialogOpen(false);
        setForm({ name: '', email: '', phone: '', source: '', value: '', notes: '', description: '' });
        toast({ title: 'لید جدید ثبت شد', description: 'لید با موفقیت ایجاد شد', variant: 'default' });
      } else {
        const err = await res.json().catch(() => ({}));
        toast({ title: 'خطا', description: err.error || 'خطا در ثبت لید', variant: 'destructive' });
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
        <h1 className="text-xl font-bold">{t('leads.title')}</h1>
        <Sheet open={dialogOpen} onOpenChange={setDialogOpen}>
          <SheetTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white"><Plus className="w-4 h-4 ml-1" />{t('leads.new')}</Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-[550px] overflow-y-auto">
            <div className="bg-gradient-to-l from-emerald-600 to-emerald-700 -mx-6 -mt-6 px-6 pt-6 pb-4 mb-4 rounded-b-xl">
              <SheetHeader>
                <SheetTitle className="text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  ثبت لید جدید
                </SheetTitle>
              </SheetHeader>
              <p className="text-emerald-100 text-xs mt-1">اطلاعات مشتری بالقوه را وارد کنید</p>
            </div>

            <div className="space-y-6 px-1">
              {/* Section 1: Basic Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  <UserPlus className="w-4 h-4" />
                  اطلاعات فردی
                </div>
                <Separator />
                <div className="space-y-1">
                  <Label className="text-xs">نام <span className="text-red-500">*</span></Label>
                  <Input value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: '' }); }} placeholder="نام و نام خانوادگی" className={errors.name ? 'border-red-500' : ''} />
                  {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">ایمیل</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" dir="ltr" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">تلفن</Label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="۰۹۱۲۳۴۵۶۷۸۹" />
                  </div>
                </div>
              </div>

              {/* Section 2: Source & Value */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  <FileText className="w-4 h-4" />
                  منبع و ارزش
                </div>
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">منبع</Label>
                    <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                      <SelectTrigger><SelectValue placeholder="انتخاب منبع" /></SelectTrigger>
                      <SelectContent>{leadSources.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">ارزش تخمینی (تومان)</Label>
                    <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="مثلاً: ۱۰۰۰۰۰۰۰" />
                  </div>
                </div>
              </div>

              {/* Section 3: Notes & Description */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  <FileText className="w-4 h-4" />
                  توضیحات
                </div>
                <Separator />
                <div className="space-y-1">
                  <Label className="text-xs">توضیحات</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="شرح مختصری از نیاز مشتری..." />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">یادداشت‌ها</Label>
                  <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="یادداشت‌های داخلی..." />
                  <p className="text-[11px] text-muted-foreground">یادداشت‌ها فقط برای تیم داخلی قابل مشاهده است</p>
                </div>
              </div>

              <Button onClick={handleCreate} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11">
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin ml-2" />در حال ثبت...</>
                ) : (
                  <><Check className="w-4 h-4 ml-2" />ثبت لید</>
                )}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
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
