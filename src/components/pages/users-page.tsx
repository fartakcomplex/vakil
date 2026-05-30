'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/persian';
import { getInitials, getRoleName } from '@/lib/utils-helpers';
import { Plus, Search, Shield, UserCog } from 'lucide-react';
import type { Role } from '@/lib/types';

const roles: Role[] = ['SUPER_ADMIN', 'COMPLEX_MANAGER', 'LAWYER', 'INTERN', 'CLIENT', 'ACCOUNTANT', 'SUPPORT_STAFF'];

export default function UsersPage() {
  const { users, setUsers } = useAppStore();
  const { currentUser } = useAppStore();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', role: 'CLIENT' as Role });

  const filtered = useMemo(() => {
    return users.filter((u) => !search || `${u.firstName} ${u.lastName}`.includes(search) || u.email.includes(search));
  }, [users, search]);

  const hasAccess = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'COMPLEX_MANAGER';
  if (!hasAccess) {
    return <div className="text-center py-20 text-muted-foreground">شما دسترسی به این بخش ندارید</div>;
  }

  const handleCreate = async () => {
    if (!form.email || !form.firstName) return;
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${useAppStore.getState().token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setUsers([...users, data.data]);
        setDialogOpen(false);
      }
    } catch { /* ignore */ }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold flex items-center gap-2"><UserCog className="w-5 h-5" />{t('users.title')}</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white"><Plus className="w-4 h-4 ml-1" />{t('users.new')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t('users.new')}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">{t('auth.firstName')}</Label><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
                <div className="space-y-1"><Label className="text-xs">{t('auth.lastName')}</Label><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">{t('auth.email')}</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div className="space-y-1"><Label className="text-xs">{t('auth.phone')}</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              </div>
              <div className="space-y-1"><Label className="text-xs">{t('auth.role')}</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{roles.map((r) => <SelectItem key={r} value={r}>{getRoleName(r)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreate} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">{t('common.save')}</Button>
            </div>
          </DialogContent>
        </Dialog>
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
