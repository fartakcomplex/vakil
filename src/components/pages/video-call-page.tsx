'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toPersianNumber } from '@/lib/utils-helpers';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  MessageSquare,
  MessageSquareOff,
  Users,
  Clock,
  Star,
  FileText,
  Camera,
  Check,
  Send,
  X,
  Volume2,
  Shield,
  Phone,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// ============ TYPES ============
type CallState = 'pre-call' | 'in-call' | 'post-call';

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  time: string;
  isMe: boolean;
}

interface Participant {
  id: string;
  name: string;
  role: string;
  status: 'connected' | 'connecting' | 'disconnected';
  initials: string;
}

// ============ MOCK DATA ============
const mockParticipants: Participant[] = [
  { id: '1', name: 'دکتر احمدی', role: 'وکیل', status: 'connected', initials: 'ا.ا' },
  { id: '2', name: 'محمد رضایی', role: 'موکل', status: 'connected', initials: 'م.ر' },
  { id: '3', name: 'سارا محمدی', role: 'دستیار حقوقی', status: 'connecting', initials: 'س.م' },
];

const initialMessages: ChatMessage[] = [
  { id: '1', sender: 'دکتر احمدی', content: 'سلام، وقت بخیر. آیا آماده هستید؟', time: '۱۰:۳۰', isMe: false },
  { id: '2', sender: 'شما', content: 'بله، آماده‌ام.', time: '۱۰:۳۱', isMe: true },
  { id: '3', sender: 'دکتر احمدی', content: 'عالی، پرونده شما را بررسی کردم و نکات مهمی وجود دارد.', time: '۱۰:۳۲', isMe: false },
];

// ============ COMPONENT ============
export default function VideoCallPage() {
  const { toast } = useToast();
  const [callState, setCallState] = useState<CallState>('pre-call');
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('participants');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialMessages);
  const [chatInput, setChatInput] = useState('');
  const [postCallRating, setPostCallRating] = useState(0);
  const [postCallNotes, setPostCallNotes] = useState('');
  const [isPreCallTesting, setIsPreCallTesting] = useState(false);

  // Timer for call
  useEffect(() => {
    if (callState !== 'in-call') return;
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [callState]);

  const formatTimer = useCallback((seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${toPersianNumber(String(h).padStart(2, '0'))}:${toPersianNumber(String(m).padStart(2, '0'))}:${toPersianNumber(String(s).padStart(2, '0'))}`;
    }
    return `${toPersianNumber(String(m).padStart(2, '0'))}:${toPersianNumber(String(s).padStart(2, '0'))}`;
  }, []);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const newMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'شما',
      content: chatInput,
      time: formatTimer(elapsedTime),
      isMe: true,
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');
  };

  const handleJoinCall = () => {
    setCallState('in-call');
    toast({ title: 'اتصال برقرار شد', description: 'جلسه ویدئویی شروع شد' });
  };

  const handleEndCall = () => {
    setCallState('post-call');
    setIsChatOpen(false);
    toast({ title: 'تماس پایان یافت', description: 'مدت تماس: ' + formatTimer(elapsedTime) });
  };

  // ============ PRE-CALL SCREEN ============
  if (callState === 'pre-call') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h1 className="text-xl font-bold">مشاوره ویدئویی</h1>
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            <Clock className="w-3 h-3 ml-1" />
            در انتظار شروع
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Camera Preview Card */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 relative aspect-video flex items-center justify-center">
                <motion.div
                  animate={{ scale: isPreCallTesting ? 1 : 0.95, opacity: isPreCallTesting ? 1 : 0.6 }}
                  className="text-center"
                >
                  <Camera className="w-16 h-16 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">پیش‌نمایش دوربین</p>
                </motion.div>

                {/* PiP self view */}
                <div className="absolute bottom-3 left-3 w-28 h-20 rounded-lg bg-slate-700 border-2 border-emerald-500/50 flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-500 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-slate-300" />
                  </div>
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call Info & Controls */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">آماده اتصال</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">اتصال رمزنگاری‌شده</p>
                    <p className="text-xs text-muted-foreground">تماس با امنیت بالا</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">عنوان پرونده</span>
                  <span className="font-medium">دعوای ملکی کد ۱۴۰۳/۵۶۷</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">نام موکل</span>
                  <span className="font-medium">محمد رضایی</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">وکیل</span>
                  <span className="font-medium">دکتر علی احمدی</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">نوع جلسه</span>
                  <Badge variant="secondary" className="text-xs">مشاوره اولیه</Badge>
                </div>
              </div>

              {/* Pre-call test controls */}
              <div className="flex gap-3 justify-center pt-2">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full w-12 h-12"
                  onClick={() => { setIsPreCallTesting(!isPreCallTesting); toast({ title: isPreCallTesting ? 'دوربین خاموش شد' : 'تست دوربین' }); }}
                >
                  {isPreCallTesting ? <VideoOff className="w-5 h-5 text-red-500" /> : <Video className="w-5 h-5" />}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full w-12 h-12"
                  onClick={() => toast({ title: 'تست میکروفون', description: 'لطفاً صحبت کنید...' })}
                >
                  <Volume2 className="w-5 h-5" />
                </Button>
              </div>

              <Button
                onClick={handleJoinCall}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white text-base rounded-xl"
              >
                <Phone className="w-5 h-5 ml-2" />
                ورود به جلسه
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    );
  }

  // ============ POST-CALL SCREEN ============
  if (callState === 'post-call') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <h1 className="text-xl font-bold">جلسه ویدئویی پایان یافت</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Summary Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">خلاصه جلسه</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-l from-emerald-600 to-emerald-700 rounded-xl p-4 text-white text-center">
                <Clock className="w-8 h-8 mx-auto mb-2" />
                <p className="text-2xl font-bold">{formatTimer(elapsedTime)}</p>
                <p className="text-emerald-200 text-sm">مدت کل جلسه</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">عنوان پرونده</span>
                  <span>دعوای ملکی کد ۱۴۰۳/۵۶۷</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">وکیل</span>
                  <span>دکتر علی احمدی</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">وضعیت</span>
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">تکمیل شده</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rating & Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">امتیاز و یادداشت</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">کیفیت تماس چگونه بود؟</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setPostCallRating(star)}
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= postCallRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>
                {postCallRating > 0 && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-emerald-600">
                    از امتیاز شما متشکریم! ({toPersianNumber(postCallRating)}/۵)
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">یادداشت جلسه</label>
                <Input
                  placeholder="نکات مهم جلسه را وارد کنید..."
                  value={postCallNotes}
                  onChange={(e) => setPostCallNotes(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => toast({ title: 'یادداشت ذخیره شد' })}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Check className="w-4 h-4 ml-1" />
                  ذخیره یادداشت
                </Button>
                <Button variant="outline" onClick={() => { setCallState('pre-call'); setElapsedTime(0); setPostCallRating(0); }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    );
  }

  // ============ IN-CALL SCREEN ============
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-0">
      {/* Top Bar - Call Info */}
      <div className="flex items-center justify-between bg-slate-900 text-white px-4 py-3 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-medium">در حال تماس</span>
          </div>
          <Separator orientation="vertical" className="h-4 bg-slate-700" />
          <span className="text-sm text-slate-300">{formatTimer(elapsedTime)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <FileText className="w-3 h-3" />
          <span>دعوای ملکی کد ۱۴۰۳/۵۶۷</span>
          <Separator orientation="vertical" className="h-3 bg-slate-700" />
          <span>محمد رضایی</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 bg-slate-900">
        {/* Video Area */}
        <div className={`lg:col-span-${isChatOpen ? '3' : '4'} relative`}>
          {/* Main Video */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 relative aspect-video lg:aspect-auto lg:min-h-[500px] flex items-center justify-center">
            <div className="text-center">
              <motion.div
                animate={{ scale: isCameraOff ? 1 : 1.05 }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4">
                  {isCameraOff ? (
                    <VideoOff className="w-10 h-10 text-slate-400" />
                  ) : (
                    <Video className="w-10 h-10 text-emerald-400" />
                  )}
                </div>
              </motion.div>
              <p className="text-white font-medium">دکتر علی احمدی</p>
              <p className="text-slate-400 text-sm mt-1">وکیل پایه یک دادگستری</p>
            </div>

            {/* PiP Self View */}
            <div className="absolute bottom-4 left-4 w-36 h-28 rounded-xl bg-slate-700 border-2 border-emerald-500/40 overflow-hidden shadow-xl">
              <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-500 flex items-center justify-center">
                {isCameraOff ? (
                  <VideoOff className="w-6 h-6 text-slate-400" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-900/50 to-slate-600 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">م.ر</span>
                  </div>
                )}
              </div>
              <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-white bg-black/50 px-1 rounded">شما</span>
              </div>
            </div>

            {/* Screen sharing indicator */}
            <AnimatePresence>
              {isScreenSharing && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-4 right-4 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
                >
                  <MonitorUp className="w-3 h-3" />
                  اشتراک‌گذاری صفحه فعال
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls Bar */}
          <div className="bg-slate-800 px-4 py-3 flex items-center justify-center gap-3">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant={isMuted ? 'destructive' : 'outline'}
                size="lg"
                className={`rounded-full w-12 h-12 ${!isMuted ? 'border-slate-600 text-white hover:bg-slate-700' : ''}`}
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant={isCameraOff ? 'destructive' : 'outline'}
                size="lg"
                className={`rounded-full w-12 h-12 ${!isCameraOff ? 'border-slate-600 text-white hover:bg-slate-700' : ''}`}
                onClick={() => setIsCameraOff(!isCameraOff)}
              >
                {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant={isScreenSharing ? 'default' : 'outline'}
                size="lg"
                className={`rounded-full w-12 h-12 ${!isScreenSharing ? 'border-slate-600 text-white hover:bg-slate-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                onClick={() => setIsScreenSharing(!isScreenSharing)}
              >
                <MonitorUp className="w-5 h-5" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="destructive"
                size="lg"
                className="rounded-full w-14 h-12 bg-red-600 hover:bg-red-700 px-4"
                onClick={handleEndCall}
              >
                <PhoneOff className="w-5 h-5" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant={isChatOpen ? 'default' : 'outline'}
                size="lg"
                className={`rounded-full w-12 h-12 ${!isChatOpen ? 'border-slate-600 text-white hover:bg-slate-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                onClick={() => setIsChatOpen(!isChatOpen)}
              >
                {isChatOpen ? <MessageSquareOff className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Side Panel */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-slate-800 border-r border-slate-700 overflow-hidden hidden lg:block"
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <TabsList className="bg-slate-900 mx-2 mt-2 rounded-lg">
                  <TabsTrigger value="chat" className="text-xs text-slate-300 data-[state=active]:text-white">
                    <MessageSquare className="w-3 h-3 ml-1" />
                    چت
                  </TabsTrigger>
                  <TabsTrigger value="participants" className="text-xs text-slate-300 data-[state=active]:text-white">
                    <Users className="w-3 h-3 ml-1" />
                    شرکت‌کنندگان
                  </TabsTrigger>
                </TabsList>

                {/* Chat Tab */}
                <TabsContent value="chat" className="flex-1 flex flex-col m-0 overflow-hidden">
                  <ScrollArea className="flex-1 p-3">
                    <div className="space-y-3">
                      {chatMessages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${msg.isMe ? 'justify-start' : 'justify-end'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-xl px-3 py-2 ${
                              msg.isMe
                                ? 'bg-emerald-600 text-white rounded-br-none'
                                : 'bg-slate-700 text-slate-200 rounded-bl-none'
                            }`}
                          >
                            {!msg.isMe && <p className="text-xs font-medium text-emerald-400 mb-0.5">{msg.sender}</p>}
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-[10px] mt-1 ${msg.isMe ? 'text-emerald-200' : 'text-slate-400'}`}>{msg.time}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="p-3 border-t border-slate-700">
                    <div className="flex gap-2">
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="پیام خود را بنویسید..."
                        className="bg-slate-700 border-slate-600 text-white text-sm placeholder:text-slate-400"
                      />
                      <Button
                        size="icon"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                        onClick={handleSendMessage}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Participants Tab */}
                <TabsContent value="participants" className="flex-1 m-0 overflow-hidden">
                  <ScrollArea className="h-full p-3">
                    <div className="space-y-3">
                      {mockParticipants.map((p, index) => (
                        <motion.div
                          key={p.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3 p-2 rounded-lg bg-slate-700/50"
                        >
                          <Avatar className="w-9 h-9">
                            <AvatarFallback className="bg-emerald-600 text-white text-xs">
                              {p.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{p.name}</p>
                            <p className="text-xs text-slate-400">{p.role}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                p.status === 'connected'
                                  ? 'bg-emerald-400'
                                  : p.status === 'connecting'
                                    ? 'bg-amber-400 animate-pulse'
                                    : 'bg-red-400'
                              }`}
                            />
                            <span className="text-[10px] text-slate-400">
                              {p.status === 'connected' ? 'متصل' : p.status === 'connecting' ? 'در حال اتصال' : 'قطع'}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="mt-4 p-3 rounded-lg bg-slate-700/30">
                      <p className="text-xs text-slate-400 mb-2">دسترسی‌های جلسه</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                          <Shield className="w-3 h-3 text-emerald-400" />
                          رمزنگاری سرتاسری
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                          <FileText className="w-3 h-3 text-emerald-400" />
                          ضبط خودکار
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                          <Users className="w-3 h-3 text-emerald-400" />
                          حداکثر ۵ شرکت‌کننده
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
