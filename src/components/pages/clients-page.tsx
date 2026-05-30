'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/persian';
import { getInitials, getRoleName } from '@/lib/utils-helpers';
import { Search, Users, Briefcase, Phone, Building } from 'lucide-react';

export default function ClientsPage() {
  const { users } = useAppStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const clients = useMemo(() => {
    return users.filter((u) => u.role === 'CLIENT' && (!search || `${u.firstName} ${u.lastName}`.includes(search) || u.email.includes(search)));
  }, [users, search]);

  const selectedClient = users.find((u) => u.id === selected);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h1 className="text-xl font-bold">مدیریت موکلین</h1>
      <div className="relative max-w-md"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجوی موکل..." className="pr-9 text-sm" /></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          {clients.map((c) => (
            <motion.div key={c.id} whileHover={{ y: -1 }}>
              <Card className={`cursor-pointer hover:shadow-md transition-shadow ${selected === c.id ? 'ring-2 ring-emerald-500' : ''}`} onClick={() => setSelected(c.id)}>
                <CardContent className="p-4 flex items-center gap-4">
                  <Avatar className="w-11 h-11"><AvatarFallback className="text-sm bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700">{getInitials(c.firstName, c.lastName)}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{c.firstName} {c.lastName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>{c.email}</span>
                      {c.phone && <><span>·</span><Phone className="w-3 h-3" /><span>{c.phone}</span></>}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">{getRoleName(c.role)}</Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {clients.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">{t('common.noData')}</div>}
        </div>
        <div>
          {selectedClient ? (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="text-center">
                  <Avatar className="w-16 h-16 mx-auto mb-2"><AvatarFallback className="text-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700">{getInitials(selectedClient.firstName, selectedClient.lastName)}</AvatarFallback></Avatar>
                  <h3 className="font-bold">{selectedClient.firstName} {selectedClient.lastName}</h3>
                  <Badge variant="secondary" className="text-xs mt-1">{getRoleName(selectedClient.role)}</Badge>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2"><Users className="w-4 h-4 text-muted-foreground" /><span>{selectedClient.email}</span></div>
                  {selectedClient.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /><span>{selectedClient.phone}</span></div>}
                  <div className="flex items-center gap-2"><Building className="w-4 h-4 text-muted-foreground" /><span>مشخصات شرکت</span></div>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-1"><Briefcase className="w-4 h-4" />پرونده‌ها</h4>
                  <p className="text-xs text-muted-foreground">اطلاعات پرونده‌ها از API بارگذاری می‌شود</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">موکلی را انتخاب کنید</CardContent></Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}
