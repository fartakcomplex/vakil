'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { getInitials } from '@/lib/utils-helpers';
import {
  Bot, Send, X, Minimize2, Maximize2, Loader2, Copy, Check,
  Sparkles, Trash2, MessageCircle, Zap, RotateCcw, ChevronDown,
} from 'lucide-react';

interface QuickChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function FloatingAI() {
  const { currentUser } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<QuickChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSend = async (overrideInput?: string) => {
    const msgText = overrideInput || input;
    if (!msgText.trim() || loading) return;

    const userMsg: QuickChatMessage = { id: Date.now().toString(), role: 'user', content: msgText, timestamp: new Date() };
    setMessages(p => [...p, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })).concat([{ role: 'user', content: msgText }]),
          mode: 'general',
        }),
      });
      const data = await res.json();
      setMessages(p => [...p, { id: (Date.now() + 1).toString(), role: 'assistant', content: data.message || 'خطا در دریافت پاسخ.', timestamp: new Date() }]);
    } catch {
      setMessages(p => [...p, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'خطا در ارتباط.', timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  const formatTime = (date: Date) => {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    const p = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    return `${h.replace(/\d/g, d => p[Number(d)])}:${m.replace(/\d/g, d => p[Number(d)])}`;
  };

  const quickQuestions = [
    'مشاوره طلاق',
    'حقوق کارگر',
    'ثبت شرکت',
    'قرارداد اجاره',
  ];

  return (
    <>
      {/* ============ CHAT WINDOW ============ */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`fixed bottom-24 left-6 z-[200] rounded-2xl shadow-2xl overflow-hidden border ${
              isMinimized ? 'w-72' : 'w-80 sm:w-96'
            } bg-card`}
          >
            {/* Header */}
            <div className="bg-gradient-to-l from-emerald-600 to-teal-600 text-white p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">دستیار حقوقی AI</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                    <span className="text-[10px] text-emerald-100">آنلاین</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="w-7 h-7 text-white hover:bg-white/20" onClick={() => setIsMinimized(!isMinimized)}>
                  {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                </Button>
                <Button variant="ghost" size="icon" className="w-7 h-7 text-white hover:bg-white/20" onClick={() => setIsOpen(false)}>
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <ScrollArea className="h-72 p-3" ref={scrollRef}>
                  <div className="space-y-3">
                    {messages.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}>
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                            <Bot className="w-6 h-6 text-emerald-500" />
                          </div>
                        </motion.div>
                        <p className="text-xs text-center">سلام! سؤال حقوقی دارید؟</p>
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          {quickQuestions.map((q, i) => (
                            <button key={i} onClick={() => handleSend(q)} className="text-[10px] px-2 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all">
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {messages.map(m => (
                      <motion.div key={m.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <Avatar className="w-6 h-6 shrink-0">
                          <AvatarFallback className={`text-[8px] ${m.role === 'assistant' ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                            {m.role === 'assistant' ? <Bot className="w-3 h-3" /> : getInitials(currentUser?.firstName || '', currentUser?.lastName || '')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`max-w-[80%] rounded-xl px-3 py-2 text-[12px] leading-relaxed whitespace-pre-wrap ${
                          m.role === 'assistant' ? 'bg-muted rounded-tl-sm' : 'bg-gradient-to-l from-emerald-600 to-teal-600 text-white rounded-tr-sm'
                        }`}>{m.content}</div>
                      </motion.div>
                    ))}

                    {loading && (
                      <div className="flex gap-2">
                        <Avatar className="w-6 h-6"><AvatarFallback className="text-[8px] bg-gradient-to-br from-emerald-500 to-teal-600 text-white"><Bot className="w-3 h-3" /></AvatarFallback></Avatar>
                        <div className="bg-muted rounded-xl px-3 py-2 rounded-tl-sm flex items-center gap-2">
                          <div className="flex gap-0.5">
                            <motion.div className="w-1.5 h-1.5 rounded-full bg-emerald-500" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                            <motion.div className="w-1.5 h-1.5 rounded-full bg-emerald-500" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }} />
                            <motion.div className="w-1.5 h-1.5 rounded-full bg-emerald-500" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }} />
                          </div>
                          <span className="text-[10px] text-muted-foreground">فکر کردن...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-3 border-t bg-card">
                  <div className="flex gap-2">
                    <Textarea
                      ref={inputRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      placeholder="سؤال حقوقی..." 
                      className="text-xs min-h-[36px] max-h-20 resize-none"
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    />
                    <Button onClick={() => handleSend()} disabled={!input.trim() || loading} size="icon" className="shrink-0 bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white h-9 w-9">
                      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                  {messages.length > 0 && (
                    <div className="flex items-center justify-center mt-1.5">
                      <button onClick={handleClear} className="text-[9px] text-muted-foreground hover:text-foreground flex items-center gap-0.5">
                        <Trash2 className="w-2.5 h-2.5" />پاک کردن
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ FLOATING BUTTON ============ */}
      <motion.div
        className="fixed bottom-6 left-6 z-[200]"
        animate={isOpen ? { scale: 0 } : { scale: 1 }}
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/30 flex items-center justify-center relative"
        >
          <MessageCircle className="w-6 h-6" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-card animate-pulse" />
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        </motion.button>
      </motion.div>
    </>
  );
}
