'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Scale, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/persian';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@legalhub.ir');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAppStore();

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t('auth.invalidCredentials'));
        return;
      }
      login(data.user, data.token);
    } catch {
      setError(t('auth.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-emerald-100 dark:border-emerald-900/50">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Scale className="w-9 h-9 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">
              لِگال‌هاب
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              پلتفرم جامع مدیریت حقوقی
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@legalhub.ir"
                className="text-right"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-left pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(v) => setRemember(v === true)}
              />
              <Label htmlFor="remember" className="text-sm cursor-pointer">
                {t('auth.rememberMe')}
              </Label>
            </div>
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white h-11 font-semibold"
            >
              {loading && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              {t('auth.loginButton')}
            </Button>
            <div className="text-center text-sm">
              <button
                onClick={() => useAppStore.getState().setPage('register')}
                className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium"
              >
                {t('auth.noAccount')} {t('auth.register')}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
