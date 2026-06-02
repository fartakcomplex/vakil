'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Bot, Send, X, Loader2, MessageCircle,
  Sparkles, Scale, Phone, Building2,
  HeartHandshake, Briefcase, Globe2,
  Minimize2, Maximize2, Trash2, Volume2, VolumeX,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_ACTIONS = [
  { label: 'مشاوره رایگان', icon: Phone, prompt: 'درباره مشاوره رایگان حقوقی بیشتر بگو', color: 'from-emerald-500 to-emerald-600' },
  { label: 'ثبت شرکت', icon: Building2, prompt: 'مراحل ثبت شرکت در ایران چگونه است؟', color: 'from-blue-500 to-blue-600' },
  { label: 'طلاق و خانواده', icon: HeartHandshake, prompt: 'در مورد طلاق و مسائل خانواده توضیح بده', color: 'from-pink-500 to-rose-600' },
  { label: 'حقوق کارگر', icon: Briefcase, prompt: 'حقوق کارگر و قرارداد کار شامل چه مواردی می‌شود؟', color: 'from-amber-500 to-orange-600' },
  { label: 'مهاجرت', icon: Globe2, prompt: 'مسائل حقوقی مهاجرت و ویزا را توضیح بده', color: 'from-cyan-500 to-teal-600' },
];

export default function LandingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showBadge, setShowBadge] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-open after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
      // Hide badge after opening
      setTimeout(() => setShowBadge(false), 1000);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const PRE_CHAT_MESSAGE = 'سلام! 👋 من دستیار هوش مصنوعی لِگال‌هاب هستم. چطور می‌تونم کمکتون کنم؟';

  const handleSend = async (overrideInput?: string) => {
    const msgText = overrideInput || input;
    if (!msgText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: msgText,
      timestamp: new Date(),
    };
    setMessages((p) => [...p, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages
            .map((m) => ({ role: m.role, content: m.content }))
            .concat([{ role: 'user', content: msgText }]),
          mode: 'general',
        }),
      });
      const data = await res.json();
      setMessages((p) => [
        ...p,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message || 'خطا در دریافت پاسخ. لطفاً دوباره تلاش کنید.',
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((p) => [
        ...p,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'متأسفانه خطایی در ارتباط رخ داد. لطفاً اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  const handleSpeak = (text: string) => {
    if (typeof window === 'undefined') return;
    const synth = window.speechSynthesis;
    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fa-IR';
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    synth.speak(utterance);
  };

  const formatTime = (date: Date) => {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    const p = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return `${h.replace(/\d/g, (d) => p[Number(d)])}:${m.replace(/\d/g, (d) => p[Number(d)])}`;
  };

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
            className={`fixed bottom-24 right-6 z-[200] rounded-2xl shadow-2xl overflow-hidden border ${
              isMinimized ? 'w-72' : 'w-80 sm:w-96'
            } bg-card`}
          >
            {/* Header */}
            <div className="bg-gradient-to-l from-emerald-600 to-teal-600 text-white p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <motion.div
                  className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Bot className="w-4 h-4" />
                </motion.div>
                <div>
                  <h3 className="text-sm font-bold">دستیار هوشمند لِگال‌هاب</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                    <span className="text-[10px] text-emerald-100">آنلاین و آماده کمک</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 text-white hover:bg-white/20"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 text-white hover:bg-white/20"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <ScrollArea className="h-72 p-3" ref={scrollRef}>
                  <div className="space-y-3">
                    {/* Pre-chat message */}
                    {messages.length === 0 && (
                      <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground py-2">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                        >
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Scale className="w-7 h-7 text-white" />
                          </div>
                        </motion.div>

                        {/* Welcome message */}
                        <div className="flex gap-2 w-full">
                          <Avatar className="w-7 h-7 shrink-0">
                            <AvatarFallback className="text-[10px] bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                              <Bot className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="max-w-[85%] rounded-xl px-3 py-2.5 text-xs leading-relaxed bg-muted rounded-tl-sm">
                            {PRE_CHAT_MESSAGE}
                          </div>
                        </div>

                        {/* Quick action buttons */}
                        <div className="w-full space-y-1.5">
                          <p className="text-[10px] font-medium text-muted-foreground text-center">موضوع مورد نظرتون رو انتخاب کنید:</p>
                          <div className="flex flex-wrap gap-1.5 justify-center">
                            {QUICK_ACTIONS.map((action, i) => {
                              const Icon = action.icon;
                              return (
                                <motion.button
                                  key={i}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.08 }}
                                  onClick={() => handleSend(action.prompt)}
                                  className="flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all hover:scale-105 active:scale-95"
                                >
                                  <Icon className="w-3 h-3" />
                                  {action.label}
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Chat messages */}
                    {messages.map((m) => (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                      >
                        <Avatar className="w-6 h-6 shrink-0">
                          <AvatarFallback
                            className={`text-[8px] ${
                              m.role === 'assistant'
                                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                          >
                            {m.role === 'assistant' ? <Bot className="w-3 h-3" /> : 'م'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-1 max-w-[80%]">
                          <div
                            className={`rounded-xl px-3 py-2 text-[12px] leading-relaxed whitespace-pre-wrap ${
                              m.role === 'assistant'
                                ? 'bg-muted rounded-tl-sm'
                                : 'bg-gradient-to-l from-emerald-600 to-teal-600 text-white rounded-tr-sm'
                            }`}
                          >
                            {m.content}
                          </div>
                          <div className={`flex items-center gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <span className="text-[9px] text-muted-foreground">{formatTime(m.timestamp)}</span>
                            {m.role === 'assistant' && (
                              <button
                                onClick={() => handleSpeak(m.content)}
                                className="text-[9px] text-muted-foreground hover:text-emerald-600 transition-colors flex items-center gap-0.5"
                              >
                                {isSpeaking ? <VolumeX className="w-2.5 h-2.5" /> : <Volume2 className="w-2.5 h-2.5" />}
                                {isSpeaking ? 'توقف' : 'خواندن'}
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Loading indicator */}
                    {loading && (
                      <div className="flex gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-[8px] bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                            <Bot className="w-3 h-3" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-muted rounded-xl px-3 py-2 rounded-tl-sm flex items-center gap-2">
                          <div className="flex gap-0.5">
                            <motion.div
                              className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                              animate={{ y: [0, -4, 0] }}
                              transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                            />
                            <motion.div
                              className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                              animate={{ y: [0, -4, 0] }}
                              transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }}
                            />
                            <motion.div
                              className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                              animate={{ y: [0, -4, 0] }}
                              transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground">در حال تحلیل...</span>
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
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="سؤال حقوقی خود را بپرسید..."
                      className="text-xs min-h-[36px] max-h-20 resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                    />
                    <Button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || loading}
                      size="icon"
                      className="shrink-0 bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white h-9 w-9"
                    >
                      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                  {messages.length > 0 && (
                    <div className="flex items-center justify-center mt-1.5">
                      <button
                        onClick={handleClear}
                        className="text-[9px] text-muted-foreground hover:text-foreground flex items-center gap-0.5"
                      >
                        <Trash2 className="w-2.5 h-2.5" />پاک کردن مکالمه
                      </button>
                    </div>
                  )}
                  <div className="flex items-center justify-center mt-1">
                    <p className="text-[8px] text-muted-foreground/60">
                      <Sparkles className="w-2 h-2 inline ml-0.5" />
                      پاسخ‌ها جنبه مشاوره‌ای دارند و جایگزین نظر وکیل نیستند
                    </p>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ FLOATING BUTTON (bottom-RIGHT) ============ */}
      <motion.div
        className="fixed bottom-6 right-6 z-[200]"
        animate={isOpen ? { scale: 0 } : { scale: 1 }}
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setIsOpen(true);
            setShowBadge(false);
          }}
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/30 flex items-center justify-center relative"
        >
          <MessageCircle className="w-6 h-6" />

          {/* Notification badge */}
          <AnimatePresence>
            {showBadge && !isOpen && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -left-1 flex items-center justify-center"
              >
                <div className="w-5 h-5 bg-red-500 rounded-full border-2 border-card flex items-center justify-center">
                  <span className="text-[8px] text-white font-bold">۱</span>
                </div>
                <motion.div
                  className="absolute w-5 h-5 bg-red-500 rounded-full"
                  animate={{ scale: [1, 1.6, 1], opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Online indicator */}
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-green-400 rounded-full border-2 border-card animate-pulse" />
        </motion.button>
      </motion.div>
    </>
  );
}
