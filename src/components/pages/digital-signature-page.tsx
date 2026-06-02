'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toPersianNumber, formatDate } from '@/lib/utils-helpers';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import {
  PenTool,
  Eraser,
  Undo2,
  Check,
  ShieldCheck,
  FileText,
  Clock,
  User,
  Award,
  Download,
  Eye,
  Lock,
  Fingerprint,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Palette,
  Minus,
  Square,
  RotateCcw,
  Calendar,
  FileSignature,
  Stamp,
  Key,
  ScanFace,
  BadgeCheck as Certificate,
  Star,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// ============ TYPES ============
type PenColor = 'black' | 'blue' | 'red';
type PenThickness = 'thin' | 'medium' | 'thick';

interface SignedDocument {
  id: string;
  name: string;
  signer: string;
  role: string;
  date: string;
  verified: boolean;
}

// ============ MOCK DATA ============
const mockDocument = `قرارداد امانتداری و وکالت

شماره قرارداد: LH-1403-0089
تاریخ: ۱۵ مرداد ۱۴۰۳

این قرارداد بین جناب آقای محمد رضایی (به‌عنوان موکل) و دفتر وکالت دکتر علی احمدی (به‌عنوان وکیل) منعقد می‌گردد.

ماده ۱ — موضوع قرارداد:
وکیل موظف است در زمینه دعوای ملکی موضوع پرونده KP-1403-012 نزد مراجع قضایی و اداری مربوطه، اقدامات حقوقی لازم را به‌نام و از طرف موکل به عمل آورد.

ماده ۲ — تعهدات وکیل:
۲-۱. بررسی کامل پرونده و ارائه مشاوره حقوقی
۲-۲. تنظیم لایحه‌ها و شکواییه‌های لازم
۲-۳. حضور در جلسات دادگاه و دفاع از حقوق موکل
۲-۴. ارائه گزارش‌های دوره‌ای به موکل

ماده ۳ — تعهدات موکل:
۳-۱. ارائه تمامی مدارک و مستندات مورد نیاز
۳-۲. پرداخت حق‌الوکاله طبق تعرفه مصوب
۳-۳. اعلام هرگونه تغییر در اطلاعات پرونده

ماده ۴ — مدت قرارداد:
این قرارداد از تاریخ امضا به مدت یک سال اعتبار دارد و قابل تمدید می‌باشد.`;

const mockSignedDocuments: SignedDocument[] = [
  { id: '1', name: 'قرارداد امانتداری LH-1403-0045', signer: 'محمد رضایی', role: 'موکل', date: '2024-08-10T10:30:00', verified: true },
  { id: '2', name: 'لایحه دفاعیه پرونده KP-1403-008', signer: 'دکتر احمدی', role: 'وکیل', date: '2024-08-05T14:15:00', verified: true },
  { id: '3', name: 'توافق‌نامه صلح و سازش', signer: 'زهرا محمدی', role: 'موکل', date: '2024-07-28T09:00:00', verified: true },
  { id: '4', name: 'ماهو存的 وکالتنامه', signer: 'علی نوری', role: 'موکل', date: '2024-07-20T11:45:00', verified: false },
];

// ============ COMPONENT ============
export default function DigitalSignaturePage() {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState<PenColor>('black');
  const [penThickness, setPenThickness] = useState<PenThickness>('medium');
  const [signatureData, setSignatureData] = useState<string[]>([]);
  const [showDocPreview, setShowDocPreview] = useState(true);
  const [otpValue, setOtpValue] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [signerInfo] = useState({
    name: 'محمد رضایی',
    role: 'موکل',
    nationalCode: '۰۰۱۲۳۴۵۶۷۸',
  });

  const colorMap: Record<PenColor, string> = {
    black: '#1e293b',
    blue: '#2563eb',
    red: '#dc2626',
  };

  const thicknessMap: Record<PenThickness, number> = {
    thin: 1.5,
    medium: 3,
    thick: 5,
  };

  // Canvas drawing
  const getCanvasContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    return { canvas, ctx };
  }, []);

  useEffect(() => {
    const result = getCanvasContext();
    if (!result) return;
    const { canvas, ctx } = result;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Redraw strokes
    signatureData.forEach((stroke) => {
      const points = JSON.parse(stroke);
      if (points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = points[0].color;
      ctx.lineWidth = points[0].thickness;
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    });
  }, [signatureData.length, getCanvasContext]);

  const getPoint = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const currentStrokeRef = useRef<Array<{ x: number; y: number; color: string; thickness: number }>>([]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const result = getCanvasContext();
    if (!result) return;
    const { ctx } = result;
    setIsDrawing(true);
    const point = { ...getPoint(e), color: colorMap[penColor], thickness: thicknessMap[penThickness] };
    currentStrokeRef.current = [point];
    ctx.beginPath();
    ctx.strokeStyle = colorMap[penColor];
    ctx.lineWidth = thicknessMap[penThickness];
    ctx.moveTo(point.x, point.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const result = getCanvasContext();
    if (!result) return;
    const { ctx } = result;
    const point = { ...getPoint(e), color: colorMap[penColor], thickness: thicknessMap[penThickness] };
    currentStrokeRef.current.push(point);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentStrokeRef.current.length > 1) {
      setSignatureData((prev) => [...prev, JSON.stringify(currentStrokeRef.current)]);
    }
    currentStrokeRef.current = [];
  };

  const clearCanvas = () => {
    setSignatureData([]);
    const result = getCanvasContext();
    if (!result) return;
    const { ctx, canvas } = result;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    toast({ title: 'امضا پاک شد' });
  };

  const undoStroke = () => {
    setSignatureData((prev) => {
      const next = prev.slice(0, -1);
      // Redraw
      const result = getCanvasContext();
      if (result) {
        const { ctx, canvas } = result;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        next.forEach((stroke) => {
          const points = JSON.parse(stroke);
          if (points.length < 2) return;
          ctx.beginPath();
          ctx.strokeStyle = points[0].color;
          ctx.lineWidth = points[0].thickness;
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
          }
          ctx.stroke();
        });
      }
      return next;
    });
  };

  const handleVerifyOtp = async () => {
    if (otpValue.length < 5) {
      toast({ title: 'خطا', description: 'کد تأیید ۵ رقمی را وارد کنید', variant: 'destructive' });
      return;
    }
    setIsVerifying(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsVerifying(false);
    setIsVerified(true);
    toast({ title: 'تأیید شد', description: 'هویت شما با موفقیت تأیید شد' });
  };

  const handleSign = async () => {
    if (!isVerified) {
      toast({ title: 'خطا', description: 'ابتدا هویت خود را تأیید کنید', variant: 'destructive' });
      return;
    }
    if (signatureData.length === 0) {
      toast({ title: 'خطا', description: 'لطفاً امضا کنید', variant: 'destructive' });
      return;
    }
    setIsSigning(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsSigning(false);
    setIsSigned(true);
    toast({ title: 'سند امضا شد', description: 'امضا دیجیتال با موفقیت اعمال شد' });
  };

  // ============ SIGNED SUCCESS OVERLAY ============
  if (isSigned) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 10, delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </motion.div>
          <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">سند با موفقیت امضا شد!</h2>
          <p className="text-muted-foreground text-sm mb-4">امضا دیجیتال شما با گواهی معتبر اعمال شد</p>

          {/* Certificate Card */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Certificate className="w-5 h-5 text-emerald-600" />
                <p className="text-sm font-medium">گواهی امضای دیجیتال</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">شناسه سند</span><span className="font-mono text-xs">DSG-{Date.now().toString().slice(-8)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">امضاکننده</span><span>{signerInfo.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">تاریخ امضا</span><span>{formatDate(new Date())}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">وضعیت</span><Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-xs">معتبر</Badge></div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => { setIsSigned(false); setIsVerified(false); setOtpValue(''); setSignatureData([]); }}>
              امضای سند دیگر
            </Button>
            <Button variant="outline" onClick={() => toast({ title: 'دانلود سند', description: 'سند امضا‌شده در حال آماده‌سازی...' })}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // ============ MAIN LAYOUT ============
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold">امضای دیجیتال</h1>
        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
          <ShieldCheck className="w-3 h-3 ml-1" />
          امن و معتبر
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Document Preview */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                پیش‌نمایش سند
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setShowDocPreview(!showDocPreview)}>
                {showDocPreview ? 'بستن' : 'مشاهده'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <AnimatePresence>
              {showDocPreview && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <ScrollArea className="h-72 border rounded-b-xl">
                    <div className="p-4 whitespace-pre-wrap text-sm leading-7 font-mono" dir="rtl">
                      {mockDocument}
                    </div>
                  </ScrollArea>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Signer Info & OTP */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              اطلاعات امضاکننده
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gradient-to-l from-emerald-600 to-emerald-500 rounded-xl p-4 text-white">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 border-2 border-white/30">
                  <AvatarFallback className="bg-emerald-700 text-lg">م.ر</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{signerInfo.name}</p>
                  <p className="text-emerald-100 text-sm">{signerInfo.role}</p>
                  <p className="text-emerald-200 text-xs mt-0.5 font-mono">کد ملی: {signerInfo.nationalCode}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>تاریخ: {formatDate(new Date())}</span>
            </div>

            {/* OTP Verification */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-600" />
                <p className="text-sm font-medium">تأیید هویت</p>
                {isVerified && <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-xs">تأیید شده</Badge>}
              </div>

              {!isVerified ? (
                <>
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
                    <ScanFace className="w-4 h-4 shrink-0" />
                    <span>کد تأیید برای <span className="font-mono" dir="ltr">{signerInfo.nationalCode}</span> ارسال شد</span>
                  </div>
                  <div className="flex justify-center gap-1" dir="ltr">
                    <InputOTP maxLength={5} value={otpValue} onChange={setOtpValue}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSeparator />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <Button
                    onClick={handleVerifyOtp}
                    disabled={isVerifying || otpValue.length < 5}
                    className="w-full h-10 bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    {isVerifying ? (
                      <><Loader2 className="w-4 h-4 ml-2 animate-spin" />در حال تأیید...</>
                    ) : (
                      <><Fingerprint className="w-4 h-4 ml-2" />تأیید کد</>
                    )}
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-sm text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>هویت شما با موفقیت تأیید شد</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Signature Pad */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <PenTool className="w-4 h-4 text-emerald-600" />
              امضا
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Pen controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Color picker */}
              <div className="flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-muted-foreground" />
                {(['black', 'blue', 'red'] as PenColor[]).map((color) => (
                  <button
                    key={color}
                    onClick={() => setPenColor(color)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      penColor === color ? 'border-emerald-500 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: colorMap[color] }}
                  />
                ))}
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Thickness picker */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">ضخامت:</span>
                {([
                  { key: 'thin' as PenThickness, label: 'نازک', icon: <Minus className="w-3 h-3" /> },
                  { key: 'medium' as PenThickness, label: 'متوسط', icon: <Square className="w-3 h-3" /> },
                  { key: 'thick' as PenThickness, label: 'ضخیم', icon: <Stamp className="w-3 h-3" /> },
                ]).map((t) => (
                  <Button
                    key={t.key}
                    variant={penThickness === t.key ? 'default' : 'outline'}
                    size="sm"
                    className={`h-8 w-8 p-0 ${penThickness === t.key ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                    onClick={() => setPenThickness(t.key)}
                  >
                    {t.icon}
                  </Button>
                ))}
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Action buttons */}
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" className="h-8 px-2 text-xs" onClick={undoStroke} disabled={signatureData.length === 0}>
                  <Undo2 className="w-3 h-3 ml-1" />
                  برگشت
                </Button>
                <Button variant="outline" size="sm" className="h-8 px-2 text-xs" onClick={clearCanvas} disabled={signatureData.length === 0}>
                  <RotateCcw className="w-3 h-3 ml-1" />
                  پاک‌کردن
                </Button>
              </div>
            </div>

            {/* Canvas */}
            <div className="relative border-2 border-dashed rounded-xl overflow-hidden bg-white dark:bg-slate-900">
              <canvas
                ref={canvasRef}
                className="w-full cursor-crosshair touch-none"
                style={{ height: '200px' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              {signatureData.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-muted-foreground text-sm">اینجا امضا کنید...</p>
                </div>
              )}
            </div>

            {/* Sign Button */}
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                onClick={handleSign}
                disabled={!isVerified || isSigning || signatureData.length === 0}
                className="w-full h-12 bg-gradient-to-l from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white text-base rounded-xl disabled:opacity-50"
              >
                {isSigning ? (
                  <><Loader2 className="w-5 h-5 ml-2 animate-spin" />در حال اعمال امضا...</>
                ) : (
                  <><PenTool className="w-5 h-5 ml-2" />اعمال امضا دیجیتال</>
                )}
              </Button>
            </motion.div>

            <p className="text-[10px] text-muted-foreground text-center">
              با امضا، محتوای سند را مطالعه و تأیید می‌کنید. امضا دیجیتال دارای اعتبار قانونی است.
            </p>
          </CardContent>
        </Card>

        {/* Signed Documents List */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              اسناد امضا‌شده
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-72">
              <div className="divide-y divide-border">
                {mockSignedDocuments.map((doc, idx) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      doc.verified ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-slate-100 dark:bg-slate-800'
                    }`}>
                      {doc.verified ? (
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{doc.signer}</span>
                        <span>•</span>
                        <span>{doc.role}</span>
                        <span>•</span>
                        <span>{formatDate(doc.date)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {doc.verified ? (
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-xs">
                          <CheckCircle2 className="w-3 h-3 ml-1" />
                          تأیید شده
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 text-xs">
                          <Clock className="w-3 h-3 ml-1" />
                          در انتظار
                        </Badge>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast({ title: 'مشاهده سند', description: doc.name })}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast({ title: 'دانلود', description: 'سند در حال دانلود...' })}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
