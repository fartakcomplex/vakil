'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/lib/store';
import { getInitials } from '@/lib/utils-helpers';
import {
  Send, Bot, FileSearch, AlertTriangle, FileText, PenTool, BookOpen,
  Sparkles, Loader2, Copy, Check, Trash2, MessageCircle, Zap, Scale,
  Brain, FileUp, History, Lightbulb, Shield, ChevronDown, ChevronUp,
  Volume2, StopCircle, RotateCcw, Download, ArrowLeft,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  mode?: string;
}

// ============ FEATURES DATA ============
const AI_FEATURES = [
  { icon: FileSearch, title: 'تحلیل قرارداد', desc: 'تحلیل کامل قراردادها با شناسایی نقاط ضعف و ریسک‌ها', mode: 'contract', color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', textColor: 'text-emerald-600' },
  { icon: AlertTriangle, title: 'شناسایی ریسک', desc: 'شناسایی و ارزیابی ریسک‌های حقوقی پرونده‌ها', mode: 'risk', color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50 dark:bg-amber-900/20', textColor: 'text-amber-600' },
  { icon: FileText, title: 'خلاصه‌سازی سند', desc: 'خلاصه‌سازی اسناد طولانی و استخراج نکات کلیدی', mode: 'summary', color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50 dark:bg-blue-900/20', textColor: 'text-blue-600' },
  { icon: PenTool, title: 'تنظیم دادخواست', desc: 'تنظیم حرفه‌ای لایحه، دادخواست و قرارداد', mode: 'draft', color: 'from-purple-500 to-violet-600', bg: 'bg-purple-50 dark:bg-purple-900/20', textColor: 'text-purple-600' },
  { icon: BookOpen, title: 'تحقیق حقوقی', desc: 'جستجوی قوانین، مقررات و رویه قضایی مرتبط', mode: 'research', color: 'from-teal-500 to-cyan-600', bg: 'bg-teal-50 dark:bg-teal-900/20', textColor: 'text-teal-600' },
  { icon: MessageCircle, title: 'مشاوره عمومی', desc: 'مشاوره حقوقی عمومی در تمامی حوزه‌ها', mode: 'general', color: 'from-rose-500 to-pink-600', bg: 'bg-rose-50 dark:bg-rose-900/20', textColor: 'text-rose-600' },
];

const SUGGESTED_PROMPTS = [
  'حقوق مالکیت فکری در ایران چگونه است؟',
  'تفاوت قرارداد کار و پیمانکاری چیست؟',
  'نحوه ثبت شرکت سهامی خاص',
  'مراحل طلاق توافقی در ایران',
  'شرایط و مراحل اخذ ویزای کانادا',
  'حقوق مستأجر در قرارداد اجاره',
];

const QUICK_TEMPLATES = [
  { label: 'بررسی قرارداد اجاره', prompt: 'لطفاً نکات حقوقی مهم در یک قرارداد اجاره ملکی را بررسی کنید و مواردی که باید به آن‌ها توجه کرد را ذکر نمایید.' },
  { label: 'لایحه مطالبه وجه', prompt: 'لطفاً یک لایحه مطالبه وجه بر اساس چک برگشتی تنظیم کنید.' },
  { label: 'مشاوره طلاق', prompt: 'مراحل و شرایط طلاق توافقی در ایران چیست و چه مدارکی لازم است؟' },
  { label: 'ثبت شرکت', prompt: 'مراحل ثبت شرکت مسئولیت محدود در ایران را توضیح دهید و مدارک لازم را ذکر کنید.' },
];

// ============ MAIN COMPONENT ============
export default function AiAssistantPage() {
  const { currentUser } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'سلام! من دستیار هوش مصنوعی حقوقی لِگال‌هاب هستم.\n\nچطور می‌تونم کمکتون کنم؟ می‌تونید:\n• سؤال حقوقی بپرسید\n• قرارداد تحلیل کنید\n• لایحه تنظیم کنید\n• قوانین جستجو کنید\n\nاز ابزارهای هوشمند سمت راست یا پیشنهادهای پایین استفاده کنید!',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<string | null>(null);
  const [showFeatures, setShowFeatures] = useState(true);
  const [conversationCount, setConversationCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef(false);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    abortRef.current = true;
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'چت پاک شد. آماده دریافت سؤال جدید هستم!',
        timestamp: new Date(),
      },
    ]);
    setActiveMode(null);
    setConversationCount(0);
  };

  const handleNewChat = () => {
    handleClear();
  };

  const handleFeatureClick = (feature: typeof AI_FEATURES[0]) => {
    setActiveMode(feature.mode);
    setInput(feature.prompt || `لطفاً در زمینه ${feature.title} کمکم کنید.`);
  };

  const handleTemplateClick = (prompt: string) => {
    setInput(prompt);
  };

  const handleStop = () => {
    abortRef.current = true;
    setLoading(false);
  };

  const handleSend = async (overrideInput?: string) => {
    const msgText = overrideInput || input;
    if (!msgText.trim() || loading) return;

    abortRef.current = false;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: msgText, timestamp: new Date(), mode: activeMode || undefined };
    setMessages((p) => [...p, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.filter(m => m.id !== 'welcome').map((m) => ({ role: m.role, content: m.content })).concat([{ role: 'user', content: msgText }]),
          mode: activeMode,
        }),
      });

      if (abortRef.current) return;

      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || data.error || 'خطا در دریافت پاسخ. لطفاً دوباره تلاش کنید.',
        timestamp: new Date(),
      };
      setMessages((p) => [...p, aiMsg]);
      setConversationCount((c) => c + 1);
    } catch {
      if (abortRef.current) return;
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'متأسفانه خطایی در ارتباط رخ داد. لطفاً دوباره تلاش کنید.',
        timestamp: new Date(),
      };
      setMessages((p) => [...p, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return `${h.replace(/\d/g, (d) => persianDigits[Number(d)])}:${m.replace(/\d/g, (d) => persianDigits[Number(d)])}`;
  };

  const activeFeature = AI_FEATURES.find(f => f.mode === activeMode);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-10rem)] flex flex-col">
      {/* ============ HEADER ============ */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 relative">
            <Bot className="w-5 h-5 text-white" />
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-card" />
          </div>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              دستیار هوشمند حقوقی
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-0.5 bg-gradient-to-l from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 text-emerald-700 dark:text-emerald-300 border-0">
                <Sparkles className="w-2.5 h-2.5" />AI
              </Badge>
            </h1>
            <p className="text-xs text-muted-foreground">تحلیل قرارداد، مشاوره حقوقی و تنظیم لایحه</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeMode && (
            <Badge className="text-xs gap-1 px-2.5 py-1" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
              {activeFeature?.icon && <activeFeature.icon className="w-3 h-3" />}
              {activeFeature?.title}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs gap-1 px-2.5 py-1">
            <Zap className="w-3 h-3 text-emerald-500" />
            <span className="text-emerald-600">فعال</span>
          </Badge>
          <Button variant="ghost" size="sm" onClick={handleNewChat} className="text-xs gap-1" title="چت جدید">
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">چت جدید</span>
          </Button>
        </div>
      </div>

      {/* ============ MAIN LAYOUT ============ */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        {/* Chat Area */}
        <div className="lg:col-span-3 flex flex-col">
          <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4 max-w-3xl mx-auto">
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className={`text-xs ${m.role === 'assistant' ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                        {m.role === 'assistant' ? <Bot className="w-4 h-4" /> : getInitials(currentUser?.firstName || '', currentUser?.lastName || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`max-w-[85%] flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                        m.role === 'assistant'
                          ? 'bg-muted rounded-tr-sm'
                          : 'bg-gradient-to-l from-emerald-600 to-teal-600 text-white rounded-tl-sm shadow-lg shadow-emerald-500/20'
                      }`}>
                        {m.content}
                      </div>
                      <div className={`flex items-center gap-2 mt-1.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <span className="text-[10px] text-muted-foreground">{formatTime(m.timestamp)}</span>
                        {m.role === 'assistant' && (
                          <>
                            <button onClick={() => handleCopy(m.content, m.id)} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5">
                              {copiedId === m.id ? <><Check className="w-2.5 h-2.5 text-emerald-500" />کپی شد</> : <><Copy className="w-2.5 h-2.5" />کپی</>}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Typing Indicator */}
                {loading && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-2xl px-4 py-3 rounded-tr-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <motion.div className="w-2 h-2 rounded-full bg-emerald-500" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                          <motion.div className="w-2 h-2 rounded-full bg-emerald-500" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }} />
                          <motion.div className="w-2 h-2 rounded-full bg-emerald-500" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }} />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {activeMode ? 'در حال تحلیل...' : 'در حال فکر کردن...'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t bg-card/50">
              {/* Quick Templates (shown when few messages) */}
              {messages.length <= 1 && !activeMode && (
                <div className="mb-3">
                  <p className="text-[10px] text-muted-foreground mb-2 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" />
                    الگوهای آماده:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_TEMPLATES.map((tpl, i) => (
                      <button
                        key={i}
                        onClick={() => handleTemplateClick(tpl.prompt)}
                        className="text-[11px] px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted/60 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all text-muted-foreground hover:text-foreground"
                      >
                        {tpl.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Prompts (shown when only welcome message) */}
              {messages.length <= 1 && (
                <div className="mb-3">
                  <p className="text-[10px] text-muted-foreground mb-2">سؤالات پیشنهادی:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_PROMPTS.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(prompt)}
                        className="text-[11px] px-2.5 py-1 rounded-full border border-border hover:bg-muted/50 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all text-muted-foreground hover:text-foreground"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Mode Indicator */}
              {activeMode && (
                <div className={`mb-2 ${activeFeature?.bg} rounded-lg px-3 py-1.5 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    {activeFeature?.icon && <activeFeature.icon className={`w-4 h-4 ${activeFeature?.textColor}`} />}
                    <span className="text-xs font-medium">حالت: {activeFeature?.title}</span>
                  </div>
                  <button onClick={() => setActiveMode(null)} className="text-xs text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-3 h-3 inline" /> لغو
                  </button>
                </div>
              )}

              <div className="flex gap-2 max-w-3xl mx-auto">
                <div className="flex-1 relative">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={activeMode ? `در حال ${activeFeature?.title}... متن خود را وارد کنید` : 'سؤال حقوقی خود را بنویسید...'}
                    className="text-sm min-h-[44px] max-h-32 resize-none pr-3"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                    }}
                  />
                  <div className="absolute left-2 bottom-2 flex items-center gap-1">
                    <span className="text-[9px] text-muted-foreground/50">{input.length}/2000</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  {loading ? (
                    <Button variant="destructive" onClick={handleStop} className="shrink-0 h-full">
                      <StopCircle className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button onClick={() => handleSend()} disabled={!input.trim()} className="bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shrink-0 h-full shadow-lg shadow-emerald-500/20">
                      <Send className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-red-500 h-full" onClick={handleClear} title="پاک کردن چت">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* ============ RIGHT SIDEBAR ============ */}
        <div className="space-y-3 hidden lg:flex flex-col">
          {/* AI Capabilities */}
          <Card className="border-emerald-200/50 dark:border-emerald-800/30 bg-gradient-to-b from-emerald-50/50 to-transparent dark:from-emerald-900/10 dark:to-transparent">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="w-4 h-4 text-emerald-500" />
                قابلیت‌های هوشمند
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
              {AI_FEATURES.map((f, i) => (
                <motion.div key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Card
                    className={`cursor-pointer transition-all duration-200 group overflow-hidden border-0 ${
                      activeMode === f.mode ? `bg-gradient-to-l ${f.color} text-white shadow-lg` : 'bg-card hover:shadow-md'
                    }`}
                    onClick={() => handleFeatureClick(f)}
                  >
                    <CardContent className="p-2.5 flex items-start gap-2.5">
                      <div className={`p-2 rounded-xl shrink-0 group-hover:scale-110 transition-transform ${activeMode === f.mode ? 'bg-white/20' : f.bg}`}>
                        <f.icon className={`w-4 h-4 ${activeMode === f.mode ? 'text-white' : f.textColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold">{f.title}</p>
                        <p className={`text-[10px] mt-0.5 leading-relaxed ${activeMode === f.mode ? 'text-white/80' : 'text-muted-foreground'}`}>{f.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Session Stats */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <History className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-semibold">آمار جلسه</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">تعداد مکالمات</span>
                  <span className="text-xs font-bold text-emerald-600">{conversationCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">وضعیت اتصال</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-emerald-600">متصل</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">مدل AI</span>
                  <span className="text-[10px] font-medium">GLM-5 Turbo</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legal Disclaimer */}
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">تذکر حقوقی</p>
                <p className="text-[9px] text-amber-600/80 dark:text-amber-400/70 leading-relaxed mt-1">
                  پاسخ‌های AI جنبه راهنمایی دارد و جایگزین مشاوره حضوری با وکیل نیست.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
