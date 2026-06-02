'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { toPersianNumber, formatDate } from '@/lib/utils-helpers';
import {
  Bell,
  BellOff,
  MessageSquare,
  Clock,
  FileText,
  CreditCard,
  Newspaper,
  Send,
  Check,
  X,
  Phone,
  Edit3,
  Copy,
  Plus,
  Calendar,
  Zap,
  Users,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronUp,
  Trash2,
  Eye,
  Star,
  Volume2,
  Settings,
  BarChart3,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Receipt,
  Megaphone,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// ============ TYPES ============
interface NotificationSetting {
  id: string;
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;
}

interface SMSTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
}

interface DeliveryLogEntry {
  id: string;
  recipient: string;
  recipientPhone: string;
  message: string;
  date: string;
  status: 'delivered' | 'failed' | 'pending';
}

// ============ MOCK DATA ============
const initialSettings: NotificationSetting[] = [
  { id: '1', key: 'new_appointments', label: 'جلسات جدید', description: 'اعلان برای جلسات تازه ثبت‌شده', icon: Calendar, enabled: true, smsEnabled: true, emailEnabled: false },
  { id: '2', key: 'deadline_reminders', label: 'یادآوری مهلت', description: 'یادآوری قبل از سررسید پرونده‌ها', icon: Clock, enabled: true, smsEnabled: true, emailEnabled: true },
  { id: '3', key: 'case_updates', label: 'به‌روزرسانی پرونده', description: 'تغییرات وضعیت پرونده‌ها', icon: FileText, enabled: true, smsEnabled: false, emailEnabled: true },
  { id: '4', key: 'new_messages', label: 'پیام‌های جدید', description: 'پیام‌های دریافتی از موکلین', icon: MessageSquare, enabled: false, smsEnabled: false, emailEnabled: true },
  { id: '5', key: 'new_invoices', label: 'فاکتورهای جدید', description: 'صدور فاکتور و یادآوری پرداخت', icon: CreditCard, enabled: true, smsEnabled: true, emailEnabled: true },
  { id: '6', key: 'legal_news', label: 'اخبار حقوقی', description: 'آخرین اخبار و مقالات حقوقی', icon: Newspaper, enabled: false, smsEnabled: false, emailEnabled: false },
];

const initialTemplates: SMSTemplate[] = [
  {
    id: '1',
    name: 'یادآوری جلسه',
    content: 'جناب {name}، جلسه شما در تاریخ {date} ساعت {time} در دفتر وکالت برگزار خواهد شد. لطفاً رأس ساعت حضور یابید.',
    variables: ['name', 'date', 'time'],
  },
  {
    id: '2',
    name: 'یادآوری پرداخت',
    content: 'جناب {name}، فاکتور شماره {invoice_number} به مبلغ {amount} تومان سررسید شده است. لطفاً نسبت به پرداخت اقدام فرمایید.',
    variables: ['name', 'invoice_number', 'amount'],
  },
  {
    id: '3',
    name: 'به‌روزرسانی پرونده',
    content: 'جناب {name}، پرونده شما با شماره {case_number} به‌روزرسانی شد. وضعیت فعلی: {status}.',
    variables: ['name', 'case_number', 'status'],
  },
  {
    id: '4',
    name: 'سررسید مهلت',
    content: 'جناب {name}، یادآوری می‌شود که مهلت {deadline_type} پرونده {case_number} در تاریخ {date} به پایان می‌رسد.',
    variables: ['name', 'deadline_type', 'case_number', 'date'],
  },
  {
    id: '5',
    name: 'ثبت‌نام موفق',
    content: 'جناب {name}، ثبت‌نام شما در سامانه لِگال‌هاب با موفقیت انجام شد. کد پیگیری شما: {tracking_code}',
    variables: ['name', 'tracking_code'],
  },
];

const initialDeliveryLog: DeliveryLogEntry[] = [
  { id: '1', recipient: 'محمد رضایی', recipientPhone: '0912***4567', message: 'یادآوری جلسه — فردا ساعت ۱۰ صبح...', date: '2024-08-15T10:30:00', status: 'delivered' },
  { id: '2', recipient: 'زهرا محمدی', recipientPhone: '0935***8901', message: 'فاکتور شماره INV-1403-004 سررسید شده...', date: '2024-08-15T09:15:00', status: 'delivered' },
  { id: '3', recipient: 'علی احمدی', recipientPhone: '0911***2345', message: 'پرونده KP-1403-012 به‌روزرسانی شد...', date: '2024-08-14T16:45:00', status: 'failed' },
  { id: '4', recipient: 'مینا کریمی', recipientPhone: '0922***6789', message: 'مهلت ارائه لایحه در تاریخ ۲۵ مرداد...', date: '2024-08-14T11:00:00', status: 'delivered' },
  { id: '5', recipient: 'حسین نوری', recipientPhone: '0938***1234', message: 'ثبت‌نام شما با موفقیت انجام شد...', date: '2024-08-13T14:20:00', status: 'pending' },
  { id: '6', recipient: 'سارا عسگری', recipientPhone: '0916***5678', message: 'جلسه در تاریخ ۲۰ مرداد لغو شد...', date: '2024-08-13T09:00:00', status: 'delivered' },
];

// ============ COMPONENT ============
export default function SmsNotificationsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSetting[]>(initialSettings);
  const [templates] = useState<SMSTemplate[]>(initialTemplates);
  const [deliveryLog] = useState<DeliveryLogEntry[]>(initialDeliveryLog);
  const [quickSendPhone, setQuickSendPhone] = useState('');
  const [quickSendMsg, setQuickSendMsg] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [quickScheduleDate, setQuickScheduleDate] = useState('');
  const [quickScheduleTime, setQuickScheduleTime] = useState('');

  const toggleSetting = (id: string, field: 'enabled' | 'smsEnabled' | 'emailEnabled') => {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: !s[field] } : s))
    );
  };

  const handleQuickSend = async () => {
    if (!quickSendPhone.trim() || !quickSendMsg.trim()) {
      toast({ title: 'خطا', description: 'شماره تلفن و متن پیام الزامی است', variant: 'destructive' });
      return;
    }
    setIsSending(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsSending(false);
    toast({ title: 'پیام ارسال شد', description: `پیام به ${quickSendPhone} ارسال شد` });
    setQuickSendPhone('');
    setQuickSendMsg('');
  };

  const smsCredits = 1847;
  const maxCredits = 5000;
  const creditsPercent = (smsCredits / maxCredits) * 100;

  // Stats
  const deliveredCount = deliveryLog.filter(l => l.status === 'delivered').length;
  const failedCount = deliveryLog.filter(l => l.status === 'failed').length;
  const pendingCount = deliveryLog.filter(l => l.status === 'pending').length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold">اعلان و پیامک</h1>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
            <Zap className="w-3 h-3 ml-1" />
            {toPersianNumber(smsCredits)} اعتبار
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList className="bg-muted flex-wrap h-auto gap-1">
          <TabsTrigger value="settings" className="text-xs sm:text-sm">
            <Settings className="w-4 h-4 ml-1" />
            تنظیمات
          </TabsTrigger>
          <TabsTrigger value="templates" className="text-xs sm:text-sm">
            <FileText className="w-4 h-4 ml-1" />
            قالب‌ها
          </TabsTrigger>
          <TabsTrigger value="log" className="text-xs sm:text-sm">
            <BarChart3 className="w-4 h-4 ml-1" />
            تاریخچه ارسال
          </TabsTrigger>
          <TabsTrigger value="quick-send" className="text-xs sm:text-sm">
            <Send className="w-4 h-4 ml-1" />
            ارسال سریع
          </TabsTrigger>
        </TabsList>

        {/* ============ SETTINGS TAB ============ */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">تنظیمات اعلان‌ها</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {settings.map((setting, idx) => (
                      <motion.div
                        key={setting.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                            <setting.icon className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium">{setting.label}</p>
                              <Switch
                                checked={setting.enabled}
                                onCheckedChange={() => toggleSetting(setting.id, 'enabled')}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{setting.description}</p>
                            <AnimatePresence>
                              {setting.enabled && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="flex items-center gap-4 overflow-hidden"
                                >
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-3 h-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">پیامک</span>
                                    <Switch
                                      checked={setting.smsEnabled}
                                      onCheckedChange={() => toggleSetting(setting.id, 'smsEnabled')}
                                      className="scale-75"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Bell className="w-3 h-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">ایمیل</span>
                                    <Switch
                                      checked={setting.emailEnabled}
                                      onCheckedChange={() => toggleSetting(setting.id, 'emailEnabled')}
                                      className="scale-75"
                                    />
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Credits & Stats */}
            <div className="space-y-4">
              {/* SMS Credits */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-emerald-600" />
                    اعتبار پیامک
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-gradient-to-l from-emerald-600 to-emerald-500 rounded-xl p-4 text-white text-center">
                    <p className="text-3xl font-bold">{toPersianNumber(smsCredits)}</p>
                    <p className="text-emerald-100 text-sm">پیامک باقیمانده</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>مصرف شده</span>
                      <span>{toPersianNumber(maxCredits - smsCredits)} از {toPersianNumber(maxCredits)}</span>
                    </div>
                    <Progress value={creditsPercent} className="h-2" />
                  </div>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm" onClick={() => toast({ title: 'خرید اعتبار', description: 'به زودی فعال می‌شود' })}>
                    <Plus className="w-4 h-4 ml-1" />
                    افزایش اعتبار
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium mb-3">آمار ارسال</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>تحویل داده‌شده</span>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">{toPersianNumber(deliveredCount)}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <span>در انتظار</span>
                      </div>
                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">{toPersianNumber(pendingCount)}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <X className="w-4 h-4 text-red-500" />
                        <span>ناموفق</span>
                      </div>
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">{toPersianNumber(failedCount)}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ============ TEMPLATES TAB ============ */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">قالب‌های پیامک</CardTitle>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs" onClick={() => toast({ title: 'قالب جدید', description: 'قابلیت به زودی' })}>
                  <Plus className="w-3 h-3 ml-1" />
                  قالب جدید
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {templates.map((tmpl, idx) => (
                <motion.div
                  key={tmpl.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border rounded-xl overflow-hidden"
                >
                  <div
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setExpandedTemplate(expandedTemplate === tmpl.id ? null : tmpl.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tmpl.name}</p>
                        <p className="text-xs text-muted-foreground">{toPersianNumber(tmpl.variables.length)} متغیر</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); toast({ title: 'کپی قالب' }); }}>
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      {expandedTemplate === tmpl.id ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <AnimatePresence>
                    {expandedTemplate === tmpl.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t bg-muted/30 px-4 py-3 space-y-3">
                          <div className="bg-white dark:bg-slate-900 rounded-lg p-3 text-sm leading-relaxed">
                            {tmpl.content}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {tmpl.variables.map((v) => (
                              <Badge key={v} variant="outline" className="text-xs font-mono">
                                {'{'}{v}{'}'}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="text-xs" onClick={() => toast({ title: 'ویرایش قالب', description: 'قابلیت به زودی' })}>
                              <Edit3 className="w-3 h-3 ml-1" />
                              ویرایش
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ DELIVERY LOG TAB ============ */}
        <TabsContent value="log" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  تاریخچه ارسال پیامک
                </CardTitle>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => toast({ title: 'تازه‌سازی', description: 'لیست به‌روز شد' })}>
                  <RefreshCw className="w-3 h-3 ml-1" />
                  بروزرسانی
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-96">
                <div className="divide-y divide-border">
                  {deliveryLog.map((entry, idx) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="w-9 h-9 shrink-0 mt-0.5">
                        <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-xs">
                          {entry.recipient.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-medium">{entry.recipient}</p>
                          <span className="text-xs text-muted-foreground font-mono" dir="ltr">{entry.recipientPhone}</span>
                          <Badge className={`text-[10px] ${
                            entry.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' :
                            entry.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                          }`}>
                            {entry.status === 'delivered' ? 'تحویل داده‌شده' : entry.status === 'failed' ? 'ناموفق' : 'در انتظار'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{entry.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{formatDate(entry.date)}</p>
                      </div>
                      <div className="shrink-0">
                        {entry.status === 'delivered' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : entry.status === 'failed' ? (
                          <WifiOff className="w-4 h-4 text-red-500" />
                        ) : (
                          <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ QUICK SEND TAB ============ */}
        <TabsContent value="quick-send" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-emerald-600" />
                  ارسال پیامک سریع
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">شماره تلفن گیرنده</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={quickSendPhone}
                      onChange={(e) => setQuickSendPhone(e.target.value)}
                      placeholder="0912XXXXXXX"
                      className="pr-9 text-sm"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">متن پیام</label>
                  <Textarea
                    value={quickSendMsg}
                    onChange={(e) => setQuickSendMsg(e.target.value)}
                    placeholder="متن پیام خود را وارد کنید..."
                    className="text-sm min-h-[100px]"
                    maxLength={500}
                  />
                  <p className="text-[10px] text-muted-foreground text-left" dir="ltr">
                    {quickSendMsg.length} / 500
                  </p>
                </div>

                {/* Quick template insertion */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">قالب آماده</label>
                  <div className="flex flex-wrap gap-1.5">
                    {templates.slice(0, 3).map((tmpl) => (
                      <Button
                        key={tmpl.id}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => setQuickSendMsg(tmpl.content)}
                      >
                        <FileText className="w-3 h-3 ml-1" />
                        {tmpl.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleQuickSend}
                    disabled={isSending || !quickSendPhone.trim() || !quickSendMsg.trim()}
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        در حال ارسال...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 ml-2" />
                        ارسال پیامک
                      </>
                    )}
                  </Button>
                </motion.div>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  ارسال زمان‌بندی‌شده
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
                    <Clock className="w-4 h-4" />
                    <span>پیامک خود را از پیش برنامه‌ریزی کنید</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">تاریخ ارسال</label>
                  <Input
                    type="date"
                    value={quickScheduleDate}
                    onChange={(e) => setQuickScheduleDate(e.target.value)}
                    className="text-sm"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">ساعت ارسال</label>
                  <Input
                    type="time"
                    value={quickScheduleTime}
                    onChange={(e) => setQuickScheduleTime(e.target.value)}
                    className="text-sm"
                    dir="ltr"
                  />
                </div>

                <Button
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                  disabled={!quickScheduleDate || !quickScheduleTime}
                  onClick={() => toast({ title: 'زمان‌بندی ثبت شد', description: 'پیامک در زمان مشخص‌شده ارسال خواهد شد' })}
                >
                  <Calendar className="w-4 h-4 ml-2" />
                  ثبت زمان‌بندی
                </Button>

                {/* Scheduled list */}
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">پیامک‌های زمان‌بندی‌شده</p>
                  {[
                    { name: 'محمد رضایی', date: '۲۰ مرداد ۱۴۰۳', time: '۰۹:۰۰' },
                    { name: 'زهرا محمدی', date: '۲۲ مرداد ۱۴۰۳', time: '۱۴:۳۰' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted text-sm">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.date} — ساعت {item.time}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
