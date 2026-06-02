'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Mic, MicOff, Volume2, VolumeX, Loader2, X,
  MessageCircle, Bot, Send, Sparkles, AlertTriangle,
  Copy, Check,
} from 'lucide-react';

interface VoiceMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ============ WAVEFORM BARS ============
function WaveformBars({ isListening }: { isListening: boolean }) {
  const bars = 12;
  return (
    <div className="flex items-center gap-[3px] h-8">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-emerald-500"
          animate={
            isListening
              ? {
                  height: [4, Math.random() * 24 + 4, 4],
                }
              : { height: 4 }
          }
          transition={
            isListening
              ? {
                  repeat: Infinity,
                  duration: 0.4 + Math.random() * 0.4,
                  delay: i * 0.05,
                  ease: 'easeInOut',
                }
              : { duration: 0.3 }
          }
        />
      ))}
    </div>
  );
}

// ============ PULSE CIRCLES ============
function PulseCircles({ isListening }: { isListening: boolean }) {
  if (!isListening) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute w-14 h-14 rounded-full border-2 border-emerald-500/40"
          animate={{
            scale: [1, 2.2],
            opacity: [0.6, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            delay: i * 0.5,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

export default function AIVoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(true);
  const [synthSupported, setSynthSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Check Web Speech API support
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setRecognitionSupported(false);
    }

    if (!window.speechSynthesis) {
      setSynthSupported(false);
    }

    if (!SpeechRecognitionAPI && !window.speechSynthesis) {
      setIsSupported(false);
    }
  }, []);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, interimTranscript]);

  const startListening = useCallback(() => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'fa-IR';
    recognition.continuous = true;
    recognition.interimResults = true;

    let finalTranscript = '';

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      setTranscript(finalTranscript);
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'aborted') {
        console.error('Speech recognition error:', event.error);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-send when recognition ends (after a pause)
      if (finalTranscript.trim()) {
        handleSendVoiceMessage(finalTranscript.trim());
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setTranscript('');
    setInterimTranscript('');
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      if (isSpeaking) {
        window.speechSynthesis?.cancel();
        setIsSpeaking(false);
      }
      startListening();
    }
  }, [isListening, isSpeaking, startListening, stopListening]);

  const handleSendVoiceMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: VoiceMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((p) => [...p, userMsg]);
    setTranscript('');
    setInterimTranscript('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages
            .map((m) => ({ role: m.role, content: m.content }))
            .concat([{ role: 'user', content: text }]),
          mode: 'general',
        }),
      });
      const data = await res.json();
      const aiMsg: VoiceMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || 'خطا در دریافت پاسخ.',
        timestamp: new Date(),
      };
      setMessages((p) => [...p, aiMsg]);

      // Auto-read AI response
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(aiMsg.content);
        utterance.lang = 'fa-IR';
        utterance.rate = 0.9;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      setMessages((p) => [
        ...p,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'خطا در ارتباط با سرور.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fa-IR';
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([]);
    setTranscript('');
    setInterimTranscript('');
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  // Fallback if not supported
  if (!isSupported) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-24 left-6 z-[200]"
      >
        <Card className="w-64 shadow-xl border-amber-200 dark:border-amber-800">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                مرورگر شما از تشخیص گفتار پشتیبانی نمی‌کند. لطفاً از Chrome یا Edge استفاده کنید.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const formatTime = (date: Date) => {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    const p = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return `${h.replace(/\d/g, (d) => p[Number(d)])}:${m.replace(/\d/g, (d) => p[Number(d)])}`;
  };

  return (
    <>
      {/* ============ EXPANDED PANEL ============ */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-24 left-6 z-[200] w-80 sm:w-96 rounded-2xl shadow-2xl overflow-hidden border bg-card"
          >
            {/* Header */}
            <div className="bg-gradient-to-l from-emerald-600 to-teal-600 text-white p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4" />
                <div>
                  <h3 className="text-sm font-bold">دستیار صوتی</h3>
                  <p className="text-[10px] text-emerald-100">
                    {isListening ? 'در حال گوش دادن...' : isSpeaking ? 'در حال خواندن...' : 'آماده'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Badge className="text-[9px] bg-white/20 text-white border-0">
                  {recognitionSupported ? '🎤 شناسایی' : '🎤—'}
                  {synthSupported ? '🔊 خوانش' : '🔇—'}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 text-white hover:bg-white/20"
                  onClick={() => setShowPanel(false)}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="h-60 p-3" ref={scrollRef}>
              <div className="space-y-3">
                {messages.length === 0 && !isListening && (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                        <Mic className="w-6 h-6 text-emerald-500" />
                      </div>
                    </motion.div>
                    <p className="text-xs text-center">دکمه میکروفون را بزنید و صحبت کنید</p>
                    <p className="text-[10px] text-center text-muted-foreground/60">
                      <Sparkles className="w-2.5 h-2.5 inline ml-0.5" />
                      دستیار صوتی فارسی — زبان: فارسی
                    </p>
                  </div>
                )}

                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        m.role === 'assistant'
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                          : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    >
                      {m.role === 'assistant' ? (
                        <Bot className="w-3 h-3 text-white" />
                      ) : (
                        <Mic className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                      )}
                    </div>
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
                        {m.role === 'assistant' && synthSupported && (
                          <button
                            onClick={() => speakText(m.content)}
                            className="text-[9px] text-muted-foreground hover:text-emerald-600 transition-colors flex items-center gap-0.5"
                          >
                            {isSpeaking ? <VolumeX className="w-2.5 h-2.5" /> : <Volume2 className="w-2.5 h-2.5" />}
                            {isSpeaking ? 'توقف' : 'خواندن'}
                          </button>
                        )}
                        <button
                          onClick={() => copyText(m.id, m.content)}
                          className="text-[9px] text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {copiedId === m.id ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Loading */}
                {loading && (
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-muted rounded-xl px-3 py-2 rounded-tl-sm flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
                      <span className="text-[10px] text-muted-foreground">در حال پاسخ‌دهی...</span>
                    </div>
                  </div>
                )}

                {/* Interim transcript while listening */}
                {(interimTranscript || transcript) && isListening && (
                  <div className="flex gap-2 flex-row-reverse">
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                      <Mic className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                    </div>
                    <div className="max-w-[80%] rounded-xl px-3 py-2 text-[12px] leading-relaxed bg-gradient-to-l from-emerald-600/80 to-teal-600/80 text-white rounded-tr-sm">
                      {transcript}
                      <span className="text-white/50">{interimTranscript}</span>
                      <motion.span className="inline-block w-[2px] h-3 bg-white/80 mr-0.5" animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Bottom controls */}
            <div className="p-3 border-t bg-card">
              {/* Waveform visualization when listening */}
              <div className="flex items-center justify-center mb-2">
                {isListening && <WaveformBars isListening={isListening} />}
                {isSpeaking && (
                  <div className="flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400">در حال خواندن پاسخ...</span>
                  </div>
                )}
                {!isListening && !isSpeaking && !loading && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-muted-foreground">آماده شنیدن</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-2">
                {messages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="text-[10px] text-muted-foreground"
                  >
                    پاک‌سازی
                  </Button>
                )}

                {/* Main mic button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleListening}
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                    isListening
                      ? 'bg-red-500 shadow-red-500/30'
                      : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30'
                  }`}
                >
                  <PulseCircles isListening={isListening} />
                  {isListening ? (
                    <MicOff className="w-5 h-5 text-white" />
                  ) : (
                    <Mic className="w-5 h-5 text-white" />
                  )}
                </motion.button>

                {/* Text fallback */}
                {transcript && !isListening && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSendVoiceMessage(transcript)}
                    disabled={loading}
                    className="text-[10px]"
                  >
                    <Send className="w-3 h-3 ml-1" />
                    ارسال متن
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ FLOATING MIC BUTTON (above floating AI chat) ============ */}
      {!showPanel && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-24 left-6 z-[200]"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowPanel(true)}
            className="relative w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/25 flex items-center justify-center"
          >
            <Mic className="w-5 h-5" />

            {/* Listening indicator ring */}
            {isListening && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-red-400"
                animate={{ scale: [1, 1.3], opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            )}

            {/* Speaking indicator */}
            {isSpeaking && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-emerald-300"
                animate={{ scale: [1, 1.2], opacity: [0.6, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
            )}
          </motion.button>
        </motion.div>
      )}
    </>
  );
}
