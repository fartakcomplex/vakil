'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Scale, Loader2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/persian';

const roles = ['LAWYER', 'CLIENT', 'INTERN', 'ACCOUNTANT', 'SUPPORT_STAFF'];

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', role: 'CLIENT' as string,
  });
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleRegister = async () => {
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('رمز عبور و تکرار آن مطابقت ندارند');
      return;
    }
    if (!terms) { setError('لطفاً شرایط و قوانین را بپذیرید'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'خطا در ثبت نام'); return; }
      useAppStore.getState().setPage('login');
    } catch {
      setError('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <Card className="shadow-xl border-emerald-100 dark:border-emerald-900/50">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Scale className="w-9 h-9 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">{t('auth.register')}</h1>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center">{error}</div>}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{t('auth.firstName')}</Label>
                <Input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} className="text-right text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t('auth.lastName')}</Label>
                <Input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} className="text-right text-sm" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t('auth.email')}</Label>
              <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="text-right text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t('auth.phone')}</Label>
              <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} className="text-right text-sm" placeholder="09xxxxxxxxx" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t('auth.role')}</Label>
              <Select value={form.role} onValueChange={(v) => set('role', v)}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roles.map((r) => <SelectItem key={r} value={r}>{t(`role.${r}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t('auth.password')}</Label>
              <Input type="password" value={form.password} onChange={(e) => set('password', e.target.value)} className="text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t('auth.confirmPassword')}</Label>
              <Input type="password" value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} className="text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="terms" checked={terms} onCheckedChange={(v) => setTerms(v === true)} />
              <Label htmlFor="terms" className="text-xs cursor-pointer">شرایط و قوانین را می‌پذیرم</Label>
            </div>
            <Button onClick={handleRegister} disabled={loading} className="w-full bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white h-10 font-semibold text-sm">
              {loading && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              {t('auth.registerButton')}
            </Button>
            <div className="text-center text-sm">
              <button onClick={() => useAppStore.getState().setPage('login')} className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium">
                {t('auth.hasAccount')} {t('auth.login')}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
