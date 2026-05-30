'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/persian';
import { getInitials, getRoleName } from '@/lib/utils-helpers';
import { Plus, Search, Shield, UserCog, Loader2, Check, UserPlus, Lock, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Role } from '@/lib/types';

const roles: Role[] = ['SUPER_ADMIN', 'COMPLEX_MANAGER', 'LAWYER', 'INTERN', 'CLIENT', 'ACCOUNTANT', 'SUPPORT_STAFF'];

export default function UsersPage() {
  const { users, setUsers, currentUser } = useAppStore();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', role: 'CLIENT' as Role, password: '', nationalCode: '' });
  const { toast } = useToast();

  const filtered = useMemo(() => {
    return users.filter((u) => !search || `${u.firstName} ${u.lastName}`.includes(search) || u.email.includes(search));
  }, [users, search]);

  const hasAccess = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'COMPLEX_MANAGER';
  if (!hasAccess) {
    return <div className="text-center py-20 text-muted-foreground">شما دسترسی به این بخش ندارید</div>;
  }

  const handleCreate = async () => {
    const newErrors: Record<string, string> = {};
    if (!form.email.trim()) newErrors.email = 'ایمیل الزامی است';
    if (!form.firstName.trim()) newErrors.firstName = 'نام الزامی است';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    setErrors({});
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${useAppStore.getState().token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setUsers([...users, data.data || data]);
        setDialogOpen(false);
        setForm({ firstName: '', lastName: '', email: '', phone: '', role: 'CLIENT', password: '', nationalCode: '' });
        toast({ title: 'کاربر جدید ثبت شد', description: 'کاربر با موفقیت ایجاد شد', variant: 'default' });
      } else {
        const err = await res.json().catch(() => ({}));
        toast({ title: 'خطا', description: err.error || 'خطا در ثبت کاربر', variant: 'destructive' });
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
        <h1 className="text-xl font-bold flex items-center gap-2"><UserCog className="w-5 h-5" />{t('users.title')}</h1>
        <Sheet open={dialogOpen} onOpenChange={setDialogOpen}>
          <SheetTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white"><Plus className="w-4 h-4 ml-1" />{t('users.new')}</Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-[550px] overflow-y-auto">
            <div className="bg-gradient-to-l from-emerald-600 to-emerald-700 -mx-6 -mt-6 px-6 pt-6 pb-4 mb-4 rounded-b-xl">
              <SheetHeader>
                <SheetTitle className="text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  ثبت کاربر جدید
                </SheetTitle>
              </SheetHeader>
              <p className="text-emerald-100 text-xs mt-1">اطلاعات کاربر را وارد کنید</p>
            </div>

            <div className="space-y-6 px-1">
              {/* Section 1: Personal Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  <Shield className="w-4 h-4" />
                  اطلاعات فردی
                </div>
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">نام <span className="text-red-500">*</span></Label>
                    <Input value={form.firstName} onChange={(e) => { setForm({ ...form, firstName: e.target.value }); if (errors.firstName) setErrors({ ...errors, firstName: '' }); }} placeholder="نام" className={errors.firstName ? 'border-red-500' : ''} />
                    {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">نام خانوادگی</Label>
                    <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="نام خانوادگی" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">ایمیل <span className="text-red-500">*</span></Label>
                    <Input type="email" value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: '' }); }} placeholder="email@example.com" dir="ltr" className={errors.email ? 'border-red-500' : ''} />
                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">تلفن</Label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="۰۹۱۲۳۴۵۶۷۸۹" />
                  </div>
                </div>
              </div>

              {/* Section 2: Security */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  <Lock className="w-4 h-4" />
                  امنیت و نقش
                </div>
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">رمز عبور</Label>
                    <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="حداقل ۸ کاراکتر" dir="ltr" />
                    <p className="text-[11px] text-muted-foreground">رمز عبور برای ورود اولیه کاربر</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">کد ملی</Label>
                    <Input value={form.nationalCode} onChange={(e) => setForm({ ...form, nationalCode: e.target.value })} placeholder="کد ملی ۱۰ رقمی" dir="ltr" />
                  </div>
                </div>
              </div>

              {/* Section 3: Role */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  <UserCog className="w-4 h-4" />
                  نقش
                </div>
                <Separator />
                <div className="space-y-1">
                  <Label className="text-xs">نقش کاربر</Label>
                  <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{roles.map((r) => <SelectItem key={r} value={r}>{getRoleName(r)}</SelectItem>)}</SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">نقش تعیین‌کننده سطح دسترسی کاربر است</p>
                </div>
              </div>

              <Button onClick={handleCreate} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11">
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin ml-2" />در حال ثبت...</>
                ) : (
                  <><Check className="w-4 h-4 ml-2" />ثبت کاربر</>
                )}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="relative max-w-md"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('users.search')} className="pr-9 text-sm" /></div>

      <Card><CardContent className="p-0 divide-y divide-border">
        {filtered.map((u) => (
          <div key={u.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
            <Avatar className="w-10 h-10"><AvatarFallback className="text-sm bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700">{getInitials(u.firstName, u.lastName)}</AvatarFallback></Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{u.firstName} {u.lastName}</p>
              <p className="text-xs text-muted-foreground">{u.email}</p>
            </div>
            <Badge variant="secondary" className="text-xs">{getRoleName(u.role)}</Badge>
            <Badge variant="secondary" className={`text-xs ${u.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
              {u.isActive ? t('users.active') : t('users.inactive')}
            </Badge>
          </div>
        ))}
        {filtered.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">{t('common.noData')}</div>}
      </CardContent></Card>
    </motion.div>
  );
}
