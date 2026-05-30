'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/persian';
import { getInitials } from '@/lib/utils-helpers';
import { Send, Bot, FileSearch, AlertTriangle, FileText, PenTool, Scale, BookOpen, Sparkles, Loader2 } from 'lucide-react';

interface ChatMessage { id: string; role: 'user' | 'assistant'; content: string; }

const FEATURES = [
  { icon: FileSearch, title: 'تحلیل قرارداد', desc: 'تحلیل هوشمند قراردادها و شناسایی ریسک‌ها', color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' },
  { icon: AlertTriangle, title: 'کشف ریسک', desc: 'شناسایی خطرات حقوقی در اسناد', color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600' },
  { icon: FileText, title: 'خلاصه‌سازی', desc: 'خلاصه‌سازی اسناد حقوقی طولانی', color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600' },
  { icon: PenTool, title: 'تنظیم دادخواست', desc: 'کمک در تنظیم لایحه و دادخواست', color: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600' },
  { icon: Scale, title: 'تحقیق حقوقی', desc: 'جستجوی قوانین و رویه قضایی', color: 'bg-teal-100 dark:bg-teal-900/40 text-teal-600' },
  { icon: BookOpen, title: 'مشاوره حقوقی', desc: 'مشاوره عمومی در زمینه‌های حقوقی', color: 'bg-rose-100 dark:bg-rose-900/40 text-rose-600' },
];

export default function AiAssistantPage() {
  const { currentUser } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', content: 'سلام! من دستیار هوش مصنوعی حقوقی لِگال‌هاب هستم. چطور می‌تونم کمکتون کنم؟ می‌تونید در مورد قراردادها، قوانین، تنظیم دادخواست و سایر مسائل حقوقی سؤال بپرسید.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input };
    setMessages((p) => [...p, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai?XTransformPort=3001', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messages.map((m) => ({ role: m.role, content: m.content })).concat([{ role: 'user', content: input }]) }),
      });
      const data = await res.json();
      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.message || data.error || 'خطا در دریافت پاسخ' };
      setMessages((p) => [...p, aiMsg]);
    } catch {
      const errMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: 'متأسفانه خطایی در ارتباط با سرور رخ داد. لطفاً دوباره تلاش کنید.' };
      setMessages((p) => [...p, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-10rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div>
          <div><h1 className="text-lg font-bold">دستیار هوش مصنوعی حقوقی</h1><p className="text-xs text-muted-foreground">با سؤالات حقوقی خود کمک بگیرید</p></div>
        </div>
        <Badge variant="secondary" className="text-xs">آنلاین</Badge>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        <div className="lg:col-span-3 flex flex-col">
          <Card className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4 max-w-2xl mx-auto">
                {messages.map((m) => (
                  <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className={`text-xs ${m.role === 'assistant' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700' : 'bg-slate-200 dark:bg-slate-700 text-slate-600'}`}>
                        {m.role === 'assistant' ? <Bot className="w-4 h-4" /> : getInitials(currentUser?.firstName || '', currentUser?.lastName || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === 'assistant' ? 'bg-muted rounded-tr-sm' : 'bg-emerald-600 text-white rounded-tl-sm'}`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8"><AvatarFallback className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700"><Bot className="w-4 h-4" /></AvatarFallback></Avatar>
                    <div className="bg-muted rounded-2xl px-4 py-3 rounded-tr-sm"><Loader2 className="w-4 h-4 animate-spin text-emerald-600" /></div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              <div className="flex gap-2 max-w-2xl mx-auto">
                <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="سؤال حقوقی خود را بنویسید..." className="text-sm min-h-[44px] max-h-32 resize-none" onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }} />
                <Button onClick={handleSend} disabled={!input.trim() || loading} className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"><Send className="w-4 h-4" /></Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-3 hidden lg:block">
          <h3 className="text-sm font-semibold flex items-center gap-1"><Sparkles className="w-4 h-4 text-emerald-500" />امکانات</h3>
          {FEATURES.map((f, i) => (
            <motion.div key={i} whileHover={{ scale: 1.02 }}>
              <Card className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => setInput(`لطفاً ${f.title} را انجام دهید`)}>
                <CardContent className="p-3 flex items-start gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${f.color}`}><f.icon className="w-4 h-4" /></div>
                  <div><p className="text-xs font-medium">{f.title}</p><p className="text-[10px] text-muted-foreground">{f.desc}</p></div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
