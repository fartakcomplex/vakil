'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/persian';
import { getInitials, getRelativeTime } from '@/lib/utils-helpers';
import { Send, Search, MessageSquare } from 'lucide-react';

export default function MessagesPage() {
  const { messages, users, currentUser } = useAppStore();
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const contacts = useMemo(() => {
    const contactMap = new Map<string, typeof users[0]>();
    messages.forEach((m) => {
      const otherId = m.senderId === currentUser?.id ? m.receiverId : m.senderId;
      if (!contactMap.has(otherId)) {
        const u = users.find((u2) => u2.id === otherId);
        if (u) contactMap.set(otherId, u);
      }
    });
    return Array.from(contactMap.values());
  }, [messages, users, currentUser]);

  const chatMessages = useMemo(() => {
    if (!selectedContact || !currentUser) return [];
    return messages
      .filter((m) => (m.senderId === currentUser.id && m.receiverId === selectedContact) || (m.senderId === selectedContact && m.receiverId === currentUser.id))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [messages, selectedContact, currentUser]);

  const contactUser = users.find((u) => u.id === selectedContact);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSend = async () => {
    if (!messageText.trim() || !selectedContact || !currentUser) return;
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${useAppStore.getState().token}` },
        body: JSON.stringify({ receiverId: selectedContact, content: messageText }),
      });
      if (res.ok) {
        const data = await res.json();
        const store = useAppStore.getState();
        store.setMessages([...messages, data.data]);
        setMessageText('');
      }
    } catch { /* ignore */ }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-10rem)]">
      <h1 className="text-xl font-bold mb-4">{t('messages.title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100%-3rem)]">
        <Card className="md:col-span-1 flex flex-col">
          <div className="p-3 border-b">
            <div className="relative"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="جستجو..." className="pr-9 text-sm h-9" /></div>
          </div>
          <ScrollArea className="flex-1">
            {contacts.map((c) => (
              <div key={c.id} onClick={() => setSelectedContact(c.id)} className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors ${selectedContact === c.id ? 'bg-muted' : ''}`}>
                <Avatar className="w-9 h-9"><AvatarFallback className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700">{getInitials(c.firstName, c.lastName)}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.firstName} {c.lastName}</p>
                  <p className="text-xs text-muted-foreground truncate">آخرین پیام...</p>
                </div>
              </div>
            ))}
            {contacts.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">{t('messages.noMessages')}</p>}
          </ScrollArea>
        </Card>

        <Card className="md:col-span-2 flex flex-col">
          {selectedContact ? (
            <>
              <div className="p-3 border-b flex items-center gap-3">
                <Avatar className="w-8 h-8"><AvatarFallback className="text-xs">{getInitials(contactUser?.firstName || '', contactUser?.lastName || '')}</AvatarFallback></Avatar>
                <div><p className="text-sm font-medium">{contactUser?.firstName} {contactUser?.lastName}</p><p className="text-xs text-muted-foreground">آنلاین</p></div>
              </div>
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-3">
                  {chatMessages.map((m) => {
                    const isMine = m.senderId === currentUser?.id;
                    return (
                      <div key={m.id} className={`flex ${isMine ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${isMine ? 'bg-emerald-600 text-white rounded-br-sm' : 'bg-muted rounded-bl-sm'}`}>
                          <p>{m.content}</p>
                          <p className={`text-[10px] mt-1 ${isMine ? 'text-emerald-200' : 'text-muted-foreground'}`}>{getRelativeTime(m.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })}
                  {chatMessages.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">{t('messages.noMessages')}</p>}
                </div>
              </ScrollArea>
              <div className="p-3 border-t flex gap-2">
                <Input value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder={t('messages.typeMessage')} className="text-sm" onKeyDown={(e) => e.key === 'Enter' && handleSend()} />
                <Button onClick={handleSend} disabled={!messageText.trim()} className="bg-emerald-600 hover:bg-emerald-700 text-white"><Send className="w-4 h-4" /></Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground"><MessageSquare className="w-12 h-12 opacity-20 mb-2" /><p className="text-sm">مکالمه‌ای را انتخاب کنید</p></div>
          )}
        </Card>
      </div>
    </motion.div>
  );
}
