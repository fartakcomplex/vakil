'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/persian';
import { getRelativeTime, getStatusColor } from '@/lib/utils-helpers';
import { Bell, Check, Trash2, Info, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import type { NotificationType } from '@/lib/types';

const typeIcon = (type: NotificationType) => {
  switch (type) {
    case 'WARNING': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    case 'ERROR': return <AlertCircle className="w-4 h-4 text-red-500" />;
    case 'SUCCESS': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    default: return <Info className="w-4 h-4 text-blue-500" />;
  }
};

export default function NotificationsPage() {
  const { notifications } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const filtered = useMemo(() => {
    switch (filter) {
      case 'unread': return notifications.filter((n) => !n.isRead);
      case 'read': return notifications.filter((n) => n.isRead);
      default: return notifications;
    }
  }, [notifications, filter]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">{t('notifications.title')}</h1>
          {unreadCount > 0 && <Badge className="bg-emerald-600 text-white text-xs">{unreadCount} جدید</Badge>}
        </div>
        <div className="flex gap-2">
          <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" className="text-xs">همه</Button>
          <Button variant={filter === 'unread' ? 'default' : 'outline'} size="sm" className="text-xs" onClick={() => setFilter('unread')}>خوانده نشده</Button>
          <Button variant={filter === 'read' ? 'default' : 'outline'} size="sm" className="text-xs" onClick={() => setFilter('read')}>خوانده شده</Button>
        </div>
      </div>

      <Card><CardContent className="p-0">
        <ScrollArea className="max-h-[calc(100vh-14rem)]">
          <div className="divide-y divide-border">
            {filtered.map((n) => (
              <div key={n.id} className={`flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors ${!n.isRead ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''}`}>
                <div className="mt-0.5">{typeIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium">{n.title}</p>
                    {!n.isRead && <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{getRelativeTime(n.createdAt)}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {!n.isRead && <Button variant="ghost" size="icon" className="h-8 w-8"><Check className="w-3.5 h-3.5" /></Button>}
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="p-12 text-center text-muted-foreground text-sm">{t('notifications.noNotifications')}</div>}
          </div>
        </ScrollArea>
      </CardContent></Card>
    </motion.div>
  );
}
