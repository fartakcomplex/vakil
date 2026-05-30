'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
import { Send, Bot, FileSearch, AlertTriangle, FileText, PenTool, BookOpen, Sparkles, Loader2, Copy, Check, Trash2, MessageCircle, Zap } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const FEATURES = [
  { icon: FileSearch, title: 'تحلیل قرارداد', desc: 'تحلیل و بررسی قراردادها', prompt: 'لطفاً این قرارداد را بررسی و تحلیل کنید. نقاط قوت و ضعف آن را مشخص کنید و ریسک‌های احتمالی را شناسایی نمایید.', color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' },
  { icon: AlertTriangle, title: 'شناسایی ریسک', desc: 'شناسایی ریسک‌های حقوقی', prompt: 'لطفاً ریسک‌های حقوقی این مورد را شناسایی کنید و راهکارهای کاهش ریسک را پیشنهاد دهید.', color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600' },
  { icon: FileText, title: 'خلاصه‌سازی سند', desc: 'خلاصه‌سازی اسناد طولانی', prompt: 'لطفاً این سند طولانی را به صورت خلاصه و ساختاریافته ارائه کنید. نکات کلیدی را استخراج نمایید.', color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600' },
  { icon: PenTool, title: 'تنظیم دادخواست', desc: 'تنظیم دادخواست و لایحه', prompt: 'لطفاً بر اساس اطلاعاتی که ارائه می‌دهم، یک لایحه حقوقی یا دادخواست تهیه کنید.', color: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600' },
  { icon: BookOpen, title: 'تحقیق حقوقی', desc: 'جستجوی قوانین و رویه', prompt: 'لطفاً در مورد قوانین و مقررات مرتبط با این موضوع تحقیق کنید و رویه قضایی را بررسی نمایید.', color: 'bg-teal-100 dark:bg-teal-900/40 text-teal-600' },
  { icon: MessageCircle, title: 'مشاوره عمومی', desc: 'مشاوره حقوقی عمومی', prompt: 'من سؤالی در زمینه حقوقی دارم و نیاز به مشاوره دارم. لطفاً راهنمایی کنید.', color: 'bg-rose-100 dark:bg-rose-900/40 text-rose-600' },
];

const SUGGESTED_PROMPTS = [
  'حقوق مالکیت فکری در ایران چگونه است؟',
  'تفاوت قرارداد کار و پیمانکاری چیست؟',
  'نحوه ثبت شرکت سهامی خاص',
  'حقوق مستأجر در قرارداد اجاره',
];

export default function AiAssistantPage() {
  const { currentUser } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'سلام! من دستیار هوش مصنوعی حقوقی لِگال‌هاب هستم. 🤖\n\nچطور می‌تونم کمکتون کنم؟ می‌تونید در مورد قراردادها، قوانین، تنظیم دادخواست و سایر مسائل حقوقی سؤال بپرسید.\n\nاز امکانات ویژه من در سمت چپ استفاده کنید!',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'چت پاک شد. چطور می‌تونم کمکتون کنم؟',
        timestamp: new Date(),
      },
    ]);
  };

  const handleFeatureClick = (prompt: string) => {
    setInput(prompt);
  };

  const handleSend = async (overrideInput?: string) => {
    const msgText = overrideInput || input;
    if (!msgText.trim() || loading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: msgText, timestamp: new Date() };
    setMessages((p) => [...p, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai?XTransformPort=3001', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messages.map((m) => ({ role: m.role, content: m.content })).concat([{ role: 'user', content: msgText }]) }),
      });
      const data = await res.json();
      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.message || data.error || 'خطا در دریافت پاسخ', timestamp: new Date() };
      setMessages((p) => [...p, aiMsg]);
    } catch {
      const errMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: 'متأسفانه خطایی در ارتباط با سرور رخ داد. لطفاً دوباره تلاش کنید.', timestamp: new Date() };
      setMessages((p) => [...p, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return `${toPersianDigits(date.getHours().toString().padStart(2, '0'))}:${toPersianDigits(date.getMinutes().toString().padStart(2, '0'))}`;
  };

  function toPersianDigits(str: string): string {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return str.replace(/\d/g, (d) => persianDigits[Number(d)] ?? d);
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-10rem)] flex flex-col">
      {/* Professional Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              دستیار هوشمند حقوقی
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-0.5"><Sparkles className="w-2.5 h-2.5" />AI</Badge>
            </h1>
            <p className="text-xs text-muted-foreground">تحلیل قرارداد، مشاوره حقوقی و تنظیم لایحه با هوش مصنوعی</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1 px-2.5 py-1">
            <Zap className="w-3 h-3 text-emerald-500" />
            <span className="text-emerald-600">فعال</span>
          </Badge>
        </div>
      </div>

      {/* Feature Cards + Chat Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        {/* Chat Area */}
        <div className="lg:col-span-3 flex flex-col">
          <Card className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4 max-w-2xl mx-auto">
                {messages.map((m) => (
                  <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className={`text-xs ${m.role === 'assistant' ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                        {m.role === 'assistant' ? <Bot className="w-4 h-4" /> : getInitials(currentUser?.firstName || '', currentUser?.lastName || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`max-w-[80%] flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'assistant' ? 'bg-muted rounded-tr-sm' : 'bg-emerald-600 text-white rounded-tl-sm'}`}>
                        {m.content}
                      </div>
                      <div className={`flex items-center gap-2 mt-1 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <span className="text-[10px] text-muted-foreground">{formatTime(m.timestamp)}</span>
                        {m.role === 'assistant' && (
                          <button
                            onClick={() => handleCopy(m.content, m.id)}
                            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
                          >
                            {copiedId === m.id ? (
                              <><Check className="w-2.5 h-2.5 text-emerald-500" />کپی شد</>
                            ) : (
                              <><Copy className="w-2.5 h-2.5" />کپی</>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {loading && (
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-2xl px-4 py-3 rounded-tr-sm flex items-center gap-2">
                      <div className="flex gap-1">
                        <motion.div className="w-2 h-2 rounded-full bg-emerald-500" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                        <motion.div className="w-2 h-2 rounded-full bg-emerald-500" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }} />
                        <motion.div className="w-2 h-2 rounded-full bg-emerald-500" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }} />
                      </div>
                      <span className="text-xs text-muted-foreground">در حال تحلیل...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Chat Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2 max-w-2xl mx-auto">
                <div className="flex-1 relative">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="سؤال حقوقی خود را بنویسید..."
                    className="text-sm min-h-[44px] max-h-32 resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Button onClick={() => handleSend()} disabled={!input.trim() || loading} className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 h-full">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-red-500" onClick={handleClear} title="پاک کردن چت">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Suggested Prompts */}
              {messages.length <= 1 && (
                <div className="max-w-2xl mx-auto mt-3">
                  <p className="text-[10px] text-muted-foreground mb-2">پیشنهاد سؤالات:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_PROMPTS.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => { setInput(prompt); }}
                        className="text-xs px-2.5 py-1 rounded-full border border-border hover:bg-muted/50 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors text-muted-foreground hover:text-foreground"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Feature Cards Sidebar */}
        <div className="space-y-3 hidden lg:block">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            امکانات هوش مصنوعی
          </h3>
          {FEATURES.map((f, i) => (
            <motion.div key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card
                className="cursor-pointer hover:shadow-md transition-all duration-200 group"
                onClick={() => handleFeatureClick(f.prompt)}
              >
                <CardContent className="p-3 flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl shrink-0 group-hover:scale-110 transition-transform ${f.color}`}>
                    <f.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">{f.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{f.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
