'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import { getInitials } from '@/lib/utils-helpers';
import {
  Send, Bot, FileSearch, AlertTriangle, FileText, PenTool, BookOpen,
  Sparkles, Loader2, Copy, Check, Trash2, MessageCircle, Zap, Scale,
  Brain, Lightbulb, Shield, ArrowLeft, RotateCcw,
  Upload, Gavel, TrendingUp, Target, BarChart3, Search, ChevronDown, ChevronUp,
  Clock, Star, ThumbsUp, ThumbsDown, Share2, BookmarkPlus, FileDown,
  Mic, Image, Paperclip, Volume2, Type, Hash, Users, FileUp,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  mode?: string;
}

// ============ FEATURES DATA ============
const AI_TOOLS = [
  { id: 'chat', title: 'چت هوشمند', icon: MessageCircle, desc: 'مشاوره حقوقی با هوش مصنوعی', color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', textColor: 'text-emerald-600' },
  { id: 'doc-analysis', title: 'تحلیل سند', icon: FileSearch, desc: 'تحلیل و خلاصه‌سازی اسناد حقوقی', color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50 dark:bg-blue-900/20', textColor: 'text-blue-600' },
  { id: 'contract', title: 'بررسی قرارداد', icon: Shield, desc: 'بررسی نقاط ضعف و ریسک قرارداد', color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50 dark:bg-amber-900/20', textColor: 'text-amber-600' },
  { id: 'draft', title: 'تنظیم متن', icon: PenTool, desc: 'تنظیم لایحه، دادخواست و قرارداد', color: 'from-purple-500 to-violet-600', bg: 'bg-purple-50 dark:bg-purple-900/20', textColor: 'text-purple-600' },
  { id: 'predict', title: 'پیش‌بینی پرونده', icon: TrendingUp, desc: 'تحلیل احتمال نتیجه پرونده', color: 'from-rose-500 to-pink-600', bg: 'bg-rose-50 dark:bg-rose-900/20', textColor: 'text-rose-600' },
  { id: 'research', title: 'تحقیق حقوقی', icon: BookOpen, desc: 'جستجوی قوانین و مقررات', color: 'from-teal-500 to-cyan-600', bg: 'bg-teal-50 dark:bg-teal-900/20', textColor: 'text-teal-600' },
];

const SUGGESTED_PROMPTS = [
  'حقوق مالکیت فکری در ایران چگونه است؟',
  'تفاوت قرارداد کار و پیمانکاری چیست؟',
  'نحوه ثبت شرکت سهامی خاص',
  'مراحل طلاق توافقی در ایران',
  'شرایط و مراحل اخذ ویزای کانادا',
  'حقوق مستأجر در قرارداد اجاره',
  'ماده ۱۰ قانون مدنی چیست؟',
  'تفاوت سرقت و کلاهبرداری',
];

const DRAFT_TEMPLATES = [
  { label: 'لایحه مطالبه وجه', prompt: 'لطفاً یک لایحه مطالبه وجه بر اساس چک برگشتی تنظیم کنید.', type: 'bill' },
  { label: 'دادخواست خلع ید', prompt: 'دادخواست خلع ید ملکی را تنظیم کنید.', type: 'petition' },
  { label: 'قرارداد اجاره', prompt: 'قرارداد اجاره ملکی شامل تمام بندهای ضروری تنظیم کنید.', type: 'contract' },
  { label: 'لایحه دفاعیه طلاق', prompt: 'لایحه دفاعیه در دعوای طلاق از طرف زوجه تنظیم کنید.', type: 'defense' },
  { label: 'اظهارنامه مالیاتی', prompt: 'اظهارنامه مالیاتی عملکرد شرکت تنظیم کنید.', type: 'declaration' },
  { label: 'قرارداد کار', prompt: 'قرارداد کار بین کارفرما و کارگر تنظیم کنید.', type: 'contract' },
];

const CASE_CATEGORIES = [
  'حقوقی و مدنی', 'کیفری', 'خانوادگی', 'تجاری', 'کار و تامین اجتماعی',
  'ملکی', 'مالکیت فکری', 'چک و اسناد', 'بیمه', 'سایر'
];

// ============ CHAT TAB ============
function ChatTab() {
  const { currentUser } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'welcome', role: 'assistant',
    content: 'سلام! من دستیار هوش مصنوعی حقوقی لِگال‌هاب هستم.\n\nچطور می‌تونم کمکتون کنم؟ از تب‌های مختلف ابزار هوشمند استفاده کنید یا مستقیماً سؤال بپرسید.',
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (overrideInput?: string) => {
    const msgText = overrideInput || input;
    if (!msgText.trim() || loading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: msgText, timestamp: new Date() };
    setMessages(p => [...p, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.filter(m => m.id !== 'welcome').map(m => ({ role: m.role, content: m.content })).concat([{ role: 'user', content: msgText }]),
          mode: 'general',
        }),
      });

      const data = await res.json();
      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.message || 'خطا در دریافت پاسخ.', timestamp: new Date() };
      setMessages(p => [...p, aiMsg]);
    } catch {
      setMessages(p => [...p, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'خطا در ارتباط. لطفاً دوباره تلاش کنید.', timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    const p = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    return `${h.replace(/\d/g, d => p[Number(d)])}:${m.replace(/\d/g, d => p[Number(d)])}`;
  };

  return (
    <div className="flex flex-col h-full gap-3">
      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map(m => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className={`text-xs ${m.role === 'assistant' ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                    {m.role === 'assistant' ? <Bot className="w-4 h-4" /> : getInitials(currentUser?.firstName || '', currentUser?.lastName || '')}
                  </AvatarFallback>
                </Avatar>
                <div className={`max-w-[85%] flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'assistant' ? 'bg-muted rounded-tr-sm' : 'bg-gradient-to-l from-emerald-600 to-teal-600 text-white rounded-tl-sm shadow-lg shadow-emerald-500/20'
                  }`}>{m.content}</div>
                  <div className={`flex items-center gap-2 mt-1.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[10px] text-muted-foreground">{formatTime(m.timestamp)}</span>
                    {m.role === 'assistant' && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleCopy(m.content, m.id)} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5">
                          {copiedId === m.id ? <><Check className="w-2.5 h-2.5 text-emerald-500" />کپی شد</> : <><Copy className="w-2.5 h-2.5" />کپی</>}
                        </button>
                        <button className="text-[10px] text-muted-foreground hover:text-foreground"><ThumbsUp className="w-2.5 h-2.5" /></button>
                        <button className="text-[10px] text-muted-foreground hover:text-foreground"><ThumbsDown className="w-2.5 h-2.5" /></button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            {loading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                <Avatar className="w-8 h-8"><AvatarFallback className="text-xs bg-gradient-to-br from-emerald-500 to-teal-600 text-white"><Bot className="w-4 h-4" /></AvatarFallback></Avatar>
                <div className="bg-muted rounded-2xl px-4 py-3 rounded-tr-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <motion.div className="w-2 h-2 rounded-full bg-emerald-500" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                      <motion.div className="w-2 h-2 rounded-full bg-emerald-500" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }} />
                      <motion.div className="w-2 h-2 rounded-full bg-emerald-500" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }} />
                    </div>
                    <span className="text-xs text-muted-foreground">در حال تحلیل...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-card/50">
          {messages.length <= 1 && (
            <div className="mb-3">
              <p className="text-[10px] text-muted-foreground mb-2 flex items-center gap-1"><Lightbulb className="w-3 h-3" />سؤالات پیشنهادی:</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button key={i} onClick={() => handleSend(prompt)} className="text-[11px] px-2.5 py-1 rounded-full border border-border hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all text-muted-foreground hover:text-foreground">{prompt}</button>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2 max-w-3xl mx-auto">
            <div className="flex-1 relative">
              <Textarea value={input} onChange={e => setInput(e.target.value)} placeholder="سؤال حقوقی خود را بنویسید..." className="text-sm min-h-[44px] max-h-32 resize-none pr-3" onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} />
              <span className="absolute left-2 bottom-2 text-[9px] text-muted-foreground/50">{input.length}/۲۰۰۰</span>
            </div>
            <Button onClick={() => handleSend()} disabled={!input.trim() || loading} className="bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shrink-0 h-full shadow-lg shadow-emerald-500/20">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ============ DOCUMENT ANALYSIS TAB ============
function DocAnalysisTab() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [analysisType, setAnalysisType] = useState('summary');

  const analysisTypes = [
    { id: 'summary', label: 'خلاصه‌سازی', icon: FileText },
    { id: 'keypoints', label: 'نکات کلیدی', icon: Hash },
    { id: 'entities', label: 'اشخاص و نهادها', icon: Users },
    { id: 'timeline', label: 'جدول زمانی', icon: Clock },
  ];

  const handleAnalyze = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setResult('');

    const prompts: Record<string, string> = {
      summary: `لطفاً متن حقوقی زیر را به صورت خلاصه و ساختاریافته ارائه کنید. نکات مهم را برجسته کنید:\n\n${text}`,
      keypoints: `لطفاً نکات کلیدی حقوقی متن زیر را استخراج و فهرست کنید:\n\n${text}`,
      entities: `لطفاً اشخاص حقیقی و حقوقی، نهادها، مکان‌ها و تاریخ‌های مهم را از متن زیر استخراج کنید:\n\n${text}`,
      timeline: `لطفاً رویدادهای حقوقی متن زیر را بر اساس ترتیب زمانی مرتب کنید:\n\n${text}`,
    };

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompts[analysisType] }], mode: 'summary' }),
      });
      const data = await res.json();
      setResult(data.message || '');
    } catch {
      setResult('خطا در تحلیل سند.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      <Card className="flex flex-col">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><FileUp className="w-4 h-4 text-blue-500" />متن سند</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-4 pt-2 gap-3">
          <div className="flex flex-wrap gap-1.5 mb-1">
            {analysisTypes.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setAnalysisType(t.id)} className={`text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${analysisType === t.id ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' : 'border border-border text-muted-foreground hover:bg-muted'}`}>
                  <Icon className="w-3 h-3" />{t.label}
                </button>
              );
            })}
          </div>
          <Textarea value={text} onChange={e => setText(e.target.value)} placeholder="متن سند حقوقی را اینجا وارد یا الصاق کنید..." className="flex-1 min-h-[200px] text-sm resize-none" />
          <Button onClick={handleAnalyze} disabled={!text.trim() || loading} className="bg-gradient-to-l from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin ml-2" />در حال تحلیل...</> : <><Sparkles className="w-4 h-4 ml-2" />تحلیل سند</>}
          </Button>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2"><Brain className="w-4 h-4 text-indigo-500" />نتیجه تحلیل</CardTitle>
          {result && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="text-[10px] h-7" onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                {copied ? <><Check className="w-3 h-3" />کپی شد</> : <><Copy className="w-3 h-3" />کپی</>}
              </Button>
              <Button variant="ghost" size="sm" className="text-[10px] h-7"><FileDown className="w-3 h-3 ml-1" />دانلود</Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="flex-1 p-4 pt-2">
          <ScrollArea className="h-full">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-40 gap-3">
                <div className="relative">
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                  <Brain className="w-5 h-5 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-sm text-muted-foreground">هوش مصنوعی در حال تحلیل سند...</p>
                <Progress value={45} className="w-48 h-1.5" />
              </div>
            ) : result ? (
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{result}</div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 gap-3 text-muted-foreground">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <FileSearch className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-sm">متنی برای تحلیل وارد کنید</p>
                <p className="text-xs">نوع تحلیل را انتخاب و سپس دکمه تحلیل را بزنید</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}



// ============ CONTRACT REVIEW TAB ============
function ContractReviewTab() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleReview = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setResult('');

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: `لطفاً قرارداد زیر را به طور کامل بررسی و تحلیل کنید. تحلیل شامل موارد زیر باشد:\n\n۱. خلاصه قرارداد\n۲. نقاط قوت قرارداد\n۳. نقاط ضعف و ریسک‌ها\n۴. بندهای حیاتی که نیاز به توجه دارند\n۵. بندهای گم‌شده یا ناقص\n۶. پیشنهادات بهبود\n۷. امتیاز کلی قرارداد (از ۱۰۰)\n\nمتن قرارداد:\n${text}` }], mode: 'contract' }),
      });
      const data = await res.json();
      setResult(data.message || '');
    } catch {
      setResult('خطا در بررسی قرارداد.');
    } finally {
      setLoading(false);
    }
  };

  const riskItems = [
    { label: 'بند عدم ایفای تعهد', level: 'high' },
    { label: 'شرط حل اختلاف', level: 'medium' },
    { label: 'حریم خصوصی', level: 'low' },
    { label: 'شرایط فسخ', level: 'high' },
    { label: 'تضمین‌ها', level: 'medium' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      <Card className="lg:col-span-2 flex flex-col">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-amber-500" />متن قرارداد</CardTitle>
          <Badge variant="outline" className="text-[10px]">{text.length} کاراکتر</Badge>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-4 pt-2 gap-3">
          <Textarea value={text} onChange={e => setText(e.target.value)} placeholder="متن قرارداد را اینجا وارد کنید..." className="flex-1 min-h-[250px] text-sm resize-none" />
          <Button onClick={handleReview} disabled={!text.trim() || loading} className="bg-gradient-to-l from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin ml-2" />در حال بررسی...</> : <><Shield className="w-4 h-4 ml-2" />بررسی و تحلیل قرارداد</>}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5 text-amber-500" />نقاط بررسی</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-1.5">
            {riskItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <span className="text-[11px]">{item.label}</span>
                <Badge className={`text-[9px] px-1.5 ${item.level === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : item.level === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                  {item.level === 'high' ? 'خطر بالا' : item.level === 'medium' ? 'متوسط' : 'پایین'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs flex items-center gap-2"><Brain className="w-3.5 h-3.5 text-amber-500" />نتیجه تحلیل</CardTitle>
            {result && <Button variant="ghost" size="sm" className="text-[10px] h-6" onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? 'کپی شد' : 'کپی'}</Button>}
          </CardHeader>
          <CardContent className="flex-1 p-3 pt-0">
            <ScrollArea className="max-h-[300px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}><Scale className="w-8 h-8 text-amber-500" /></motion.div>
                  <p className="text-xs text-muted-foreground">در حال تحلیل قرارداد...</p>
                </div>
              ) : result ? (
                <div className="text-xs leading-relaxed whitespace-pre-wrap">{result}</div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                  <Shield className="w-6 h-6" />
                  <p className="text-xs">قراردادی وارد کنید تا تحلیل شود</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============ DRAFT GENERATOR TAB ============
function DraftGeneratorTab() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [draftType, setDraftType] = useState('');

  const handleGenerate = async (overridePrompt?: string) => {
    const msg = overridePrompt || prompt;
    if (!msg.trim() || loading) return;
    setLoading(true);
    setResult('');

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: msg }], mode: 'draft' }),
      });
      const data = await res.json();
      setResult(data.message || '');
    } catch {
      setResult('خطا در تنظیم متن.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      <Card className="lg:col-span-2 flex flex-col">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><PenTool className="w-4 h-4 text-purple-500" />تنظیم متن حقوقی</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-4 pt-2 gap-3">
          <div className="flex flex-wrap gap-1.5 mb-1">
            {DRAFT_TEMPLATES.map((tpl, i) => (
              <button key={i} onClick={() => { setDraftType(tpl.type); handleGenerate(tpl.prompt); }} className={`text-[11px] px-2.5 py-1.5 rounded-lg border transition-all ${draftType === tpl.type ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300' : 'border-border text-muted-foreground hover:bg-muted'}`}>
                {tpl.label}
              </button>
            ))}
          </div>
          <Textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="توضیحات مورد نظر خود را بنویسید... (مثلاً: لایحه مطالبه وجه چک ۵۰۰ میلیونی برگشتی)" className="flex-1 min-h-[180px] text-sm resize-none" />
          <Button onClick={() => handleGenerate()} disabled={(!prompt.trim() && !draftType) || loading} className="bg-gradient-to-l from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin ml-2" />در حال تنظیم...</> : <><Sparkles className="w-4 h-4 ml-2" />تنظیم متن</>}
          </Button>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-xs flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-purple-500" />متن تولیدشده</CardTitle>
          {result && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="text-[10px] h-6" onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? 'کپی شد' : 'کپی'}</Button>
              <Button variant="ghost" size="sm" className="text-[10px] h-6"><FileDown className="w-3 h-3" /></Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="flex-1 p-3 pt-0">
          <ScrollArea className="max-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}><PenTool className="w-8 h-8 text-purple-500" /></motion.div>
                <p className="text-xs text-muted-foreground">در حال تنظیم متن حقوقی...</p>
              </div>
            ) : result ? (
              <div className="text-xs leading-relaxed whitespace-pre-wrap font-mono bg-muted/30 p-3 rounded-lg">{result}</div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                <PenTool className="w-6 h-6" />
                <p className="text-xs">قالب یا توضیحات را انتخاب کنید</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// ============ CASE PREDICTION TAB ============
function CasePredictorTab() {
  const [caseType, setCaseType] = useState('');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePredict = async () => {
    if (!caseType || !description.trim() || loading) return;
    setLoading(true);
    setResult('');

    const prompt = `لطفاً بر اساس اطلاعات پرونده زیر، یک تحلیل حقوقی جامع و پیش‌بینی نتیجه ارائه دهید:\n\nنوع دعوی: ${caseType}\nشرح案情: ${description}\n\n${evidence ? `مستندات موجود:\n${evidence}` : ''}\n\nتحلیل شامل موارد زیر باشد:\n۱. تحلیل حقوقی案情\n۲. نقاط قوت و ضعف\n۳. احتمال موفقیت (درصد)\n۴. مراحل احتمالی دادرسی\n۵. پیشنهادات استراتژیک\n۶. زمان‌بندی تقریبی`;

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], mode: 'predict' }),
      });
      const data = await res.json();
      setResult(data.message || '');
    } catch {
      setResult('خطا در تحلیل پرونده.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      <Card className="lg:col-span-2 flex flex-col">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-rose-500" />اطلاعات پرونده</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-4 pt-2 gap-3">
          <div>
            <label className="text-xs font-medium mb-1.5 block">نوع دعوی</label>
            <div className="flex flex-wrap gap-1.5">
              {CASE_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCaseType(cat)} className={`text-[11px] px-2.5 py-1 rounded-lg transition-all ${caseType === cat ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 font-medium' : 'border border-border text-muted-foreground hover:bg-muted'}`}>{cat}</button>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium mb-1.5 block">شرح案情</label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="شرح案情 را بنویسید..." className="min-h-[120px] text-sm resize-none" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block">مستندات موجود (اختیاری)</label>
            <Textarea value={evidence} onChange={e => setEvidence(e.target.value)} placeholder="مستندات و دلایل خود را ذکر کنید..." className="min-h-[80px] text-sm resize-none" />
          </div>
          <Button onClick={handlePredict} disabled={!caseType || !description.trim() || loading} className="bg-gradient-to-l from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin ml-2" />در حال تحلیل...</> : <><BarChart3 className="w-4 h-4 ml-2" />تحلیل و پیش‌بینی</>}
          </Button>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-xs flex items-center gap-2"><Target className="w-3.5 h-3.5 text-rose-500" />نتیجه تحلیل</CardTitle>
          {result && <Button variant="ghost" size="sm" className="text-[10px] h-6" onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? 'کپی شد' : 'کپی'}</Button>}
        </CardHeader>
        <CardContent className="flex-1 p-3 pt-0">
          <ScrollArea className="max-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}><Gavel className="w-8 h-8 text-rose-500" /></motion.div>
                <p className="text-xs text-muted-foreground">در حال تحلیل و پیش‌بینی نتیجه...</p>
              </div>
            ) : result ? (
              <div className="text-xs leading-relaxed whitespace-pre-wrap">{result}</div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                <Target className="w-6 h-6" />
                <p className="text-xs">اطلاعات پرونده را وارد کنید</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// ============ LEGAL RESEARCH TAB ============
function LegalResearchTab() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<{ query: string; result: string; date: Date }[]>([]);

  const handleResearch = async (overrideQuery?: string) => {
    const q = overrideQuery || query;
    if (!q.trim() || loading) return;
    setLoading(true);
    setResult('');

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: `لطفاً در مورد موضوع حقوقی زیر تحقیق کنید و اطلاعات جامع ارائه دهید:\n\nموضوع: ${q}\n\nتحقیق شامل:\n۱. قوانین و مقررات مرتبط (با ذکر ماده و تبصره)\n۲. رویه قضایی\n۳. آرای نمونه دادگاه‌ها\n۴. نظرات حقوق‌دانان\n۵. پیشنهاد عملی` }], mode: 'research' }),
      });
      const data = await res.json();
      const resText = data.message || '';
      setResult(resText);
      if (resText) {
        setHistory(prev => [{ query: q, result: resText, date: new Date() }, ...prev.slice(0, 9)]);
      }
    } catch {
      setResult('خطا در تحقیق.');
    } finally {
      setLoading(false);
    }
  };

  const popularTopics = [
    'ماده ۱۰ قانون مدنی', 'قانون روابط موجر و مستأجر', 'قانون کار جمهوری اسلامی',
    'قانون تجارت الکترونیک', 'قانون حمایت از خانواده', 'قانون مجازات اسلامی',
    'قانون ثبت شرکت‌ها', 'قانون مالیات‌های مستقیم',
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      <Card className="lg:col-span-2 flex flex-col">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><BookOpen className="w-4 h-4 text-teal-500" />تحقیق حقوقی</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-4 pt-2 gap-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="موضوع حقوقی را جستجو کنید..." className="pr-9 text-sm" onKeyDown={e => { if (e.key === 'Enter') handleResearch(); }} />
            </div>
            <Button onClick={() => handleResearch()} disabled={!query.trim() || loading} className="bg-gradient-to-l from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground mb-1.5">موضوعات پرطرفدار:</p>
            <div className="flex flex-wrap gap-1.5">
              {popularTopics.map((topic, i) => (
                <button key={i} onClick={() => handleResearch(topic)} className="text-[11px] px-2.5 py-1 rounded-full border border-border hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:border-teal-300 dark:hover:border-teal-700 transition-all text-muted-foreground hover:text-foreground">{topic}</button>
              ))}
            </div>
          </div>
          <Separator className="my-1" />
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}><BookOpen className="w-8 h-8 text-teal-500" /></motion.div>
                <p className="text-xs text-muted-foreground">در حال جستجوی قوانین و مقررات...</p>
              </div>
            ) : result ? (
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{result}</div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center"><BookOpen className="w-8 h-8 text-teal-400" /></div>
                <p className="text-sm">موضوع حقوقی را جستجو کنید</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-teal-500" />تاریخچه جستجو</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <ScrollArea className="max-h-[250px]">
              {history.length === 0 ? (
                <p className="text-[10px] text-muted-foreground text-center py-4">هنوز جستجویی انجام نشده</p>
              ) : (
                <div className="space-y-1.5">
                  {history.map((item, i) => (
                    <button key={i} onClick={() => { setResult(item.result); setQuery(item.query); }} className="w-full text-right p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <p className="text-[11px] font-medium truncate">{item.query}</p>
                      <p className="text-[9px] text-muted-foreground">{item.date.toLocaleTimeString('fa-IR')}</p>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">تذکر</span>
            </div>
            <p className="text-[9px] text-muted-foreground leading-relaxed">نتایج تحقیق جنبه راهنمایی دارد و جایگزین مشاوره حضوری با وکیل نیست.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============ MAIN COMPONENT ============
export default function AiAssistantPage() {
  const [activeTab, setActiveTab] = useState('chat');
  const [sessionStats, setSessionStats] = useState({ queries: 0, documents: 0, contracts: 0, drafts: 0 });
  const [expandedTools, setExpandedTools] = useState(true);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-10rem)] flex flex-col gap-4">
      {/* ============ HEADER ============ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 relative">
            <Bot className="w-6 h-6 text-white" />
            <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-card" />
          </div>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              مرکز هوش مصنوعی حقوقی
              <Badge className="text-[10px] px-1.5 py-0.5 bg-gradient-to-l from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 text-emerald-700 dark:text-emerald-300 border-0">
                <Sparkles className="w-2.5 h-2.5 ml-0.5" />AI Powered
              </Badge>
            </h1>
            <p className="text-xs text-muted-foreground">۶ ابزار هوشمند حقوقی در یک پنل</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1 px-2.5 py-1">
            <Zap className="w-3 h-3 text-emerald-500" />
            <span className="text-emerald-600">فعال</span>
          </Badge>
          <Badge variant="outline" className="text-xs gap-1 px-2.5 py-1">
            <Brain className="w-3 h-3 text-purple-500" />
            <span className="text-purple-600">GLM-5 Turbo</span>
          </Badge>
        </div>
      </div>

      {/* ============ TOOL CARDS ============ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {AI_TOOLS.map(tool => (
          <motion.div key={tool.id} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
            <Card className={`cursor-pointer transition-all duration-200 overflow-hidden border-0 group ${activeTab === tool.id ? `bg-gradient-to-br ${tool.color} text-white shadow-lg` : 'bg-card hover:shadow-md'}`} onClick={() => setActiveTab(tool.id)}>
              <CardContent className="p-3 flex flex-col items-center gap-2 text-center">
                <div className={`p-2.5 rounded-xl group-hover:scale-110 transition-transform ${activeTab === tool.id ? 'bg-white/20' : tool.bg}`}>
                  <tool.icon className={`w-5 h-5 ${activeTab === tool.id ? 'text-white' : tool.textColor}`} />
                </div>
                <p className="text-[11px] font-semibold leading-tight">{tool.title}</p>
                <p className={`text-[9px] leading-relaxed ${activeTab === tool.id ? 'text-white/80' : 'text-muted-foreground'}`}>{tool.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ============ TAB CONTENT ============ */}
      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="h-full">
            {activeTab === 'chat' && <ChatTab />}
            {activeTab === 'doc-analysis' && <DocAnalysisTab />}
            {activeTab === 'contract' && <ContractReviewTab />}
            {activeTab === 'draft' && <DraftGeneratorTab />}
            {activeTab === 'predict' && <CasePredictorTab />}
            {activeTab === 'research' && <LegalResearchTab />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ============ BOTTOM DISCLAIMER ============ */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-500" />
          <div>
            <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">تذکر حقوقی</p>
            <p className="text-[9px] text-amber-600/80 dark:text-amber-400/70">پاسخ‌های AI جنبه راهنمایی دارد و جایگزین مشاوره حضوری با وکیل نیست.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span>استعلام: <strong className="text-emerald-600">{sessionStats.queries}</strong></span>
          <span>تحلیل: <strong className="text-blue-600">{sessionStats.documents}</strong></span>
          <span>قرارداد: <strong className="text-amber-600">{sessionStats.contracts}</strong></span>
        </div>
      </div>
    </motion.div>
  );
}
