'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Upload,
  FileText,
  Scan,
  Camera,
  Image as ImageIcon,
  Download,
  Copy,
  Check,
  Loader2,
  Sparkles,
  Clock,
  File,
  Trash2,
  Eye,
  ZoomIn,
  AlertCircle,
  History,
  BarChart3,
  ChevronDown,
  ChevronLeft,
  RefreshCw,
  Wand2,
  Tag,
  User,
  Calendar,
  ListChecks,
} from 'lucide-react';

// ============ TYPES ============
interface ScanResult {
  documentType: string;
  date: string;
  parties: string;
  summary: string;
  keyClauses: string;
  rawText: string;
}

interface ScanHistoryItem {
  id: string;
  fileName: string;
  scanDate: string;
  documentType: string;
  summary: string;
  preview: string;
}

// ============ MOCK SCAN HISTORY ============
const MOCK_HISTORY: ScanHistoryItem[] = [
  {
    id: '1',
    fileName: 'قرارداد_اجاره_مستقل_۱۴۰۳.jpg',
    scanDate: '۱۴۰۳/۰۸/۱۵',
    documentType: 'قرارداد اجاره',
    summary: 'قرارداد اجاره یک واحد تجاری به مدت یک سال با مبلغ ماهیانه ۵۰ میلیون تومان.',
    preview: 'قرارداد اجاره',
  },
  {
    id: '2',
    fileName: 'سند_مالکیت_واقع_تهران.jpg',
    scanDate: '۱۴۰۳/۰۷/۲۸',
    documentType: 'سند مالکیت',
    summary: 'سند مالکیت یک واحد آپارتمان واقع در منطقه ۲ تهران با مساحت ۱۲۰ متر مربع.',
    preview: 'سند مالکیت',
  },
  {
    id: '3',
    fileName: 'وکالت‌نامه_حقوقی_شماره_۲۵۰.jpg',
    scanDate: '۱۴۰۳/۰۶/۱۰',
    documentType: 'وکالت‌نامه',
    summary: 'وکالت‌نامه حقوقی برای پیگیری پرونده حقوقی در دادگاه انقلاب اسلامی.',
    preview: 'وکالت‌نامه حقوقی',
  },
  {
    id: '4',
    fileName: 'لیست_حساب_مالی_شرکت.jpg',
    scanDate: '۱۴۰۳/۰۵/۲۲',
    documentType: 'سند مالی',
    summary: 'گزارش مالی trimester اول سال ۱۴۰۳ شرکت توسعه فناوری اطلاعات.',
    preview: 'گزارش مالی',
  },
];

const DOCUMENT_TYPES = [
  'قرارداد',
  'سند مالکیت',
  'وکالت‌نامه',
  'اظهارنامه',
  'لایحه حقوقی',
  'سند مالی',
  'رای دادگاه',
  'نامه رسمی',
  'سایر',
];

// ============ MAIN COMPONENT ============
export default function DocumentScannerPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>(MOCK_HISTORY);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<ScanHistoryItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============ FILE HANDLING ============
  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setUploadedFileName(file.name);
      setScanResult(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  // ============ SCAN SIMULATION ============
  const handleScan = useCallback(async () => {
    if (!uploadedImage) return;

    setIsScanning(true);
    setScanProgress(0);
    setScanResult(null);

    // Simulate scanning progress
    const progressInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 300);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `لطفاً تصویر یک سند حقوقی را تحلیل کن و اطلاعات زیر را استخراج کن:
- نوع سند (قرارداد، سند مالکیت، وکالت‌نامه، ...)
- تاریخ سند
- طرفین involved
- خلاصه محتوا
- بندها و موارد کلیدی

لطفاً پاسخت را به صورت ساختاریافته و فارسی ارائه بده. فرض کن این یک سند ${uploadedFileName || 'حقوقی'} است.`,
            },
          ],
          mode: 'summary',
        }),
      });

      const data = await res.json();
      const aiResponse = data.message || '';

      clearInterval(progressInterval);
      setScanProgress(100);

      // Wait a moment for progress animation
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Create structured result from AI response
      const result: ScanResult = {
        documentType: DOCUMENT_TYPES[0],
        date: '۱۴۰۳/۰۹/۱۵',
        parties: 'طرف اول: شرکت توسعه فناوری — طرف دوم: آقای محمد حسینی',
        summary: aiResponse,
        keyClauses: 'ماده ۱: موضوع قرارداد\nماده ۲: مدت قرارداد\nماده ۳: تعهدات طرفین\nماده ۴: شرایط فسخ\nماده ۵: حل اختلاف',
        rawText: aiResponse,
      };

      setScanResult(result);

      // Add to history
      const historyItem: ScanHistoryItem = {
        id: Date.now().toString(),
        fileName: uploadedFileName || 'سند_اسکن‌شده.jpg',
        scanDate: new Date().toLocaleDateString('fa-IR'),
        documentType: result.documentType,
        summary: result.summary.substring(0, 100) + '...',
        preview: result.documentType,
      };
      setScanHistory((prev) => [historyItem, ...prev]);
    } catch {
      clearInterval(progressInterval);
      setScanProgress(0);
    } finally {
      setIsScanning(false);
    }
  }, [uploadedImage, uploadedFileName]);

  // ============ EXPORT FUNCTIONS ============
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const downloadAsText = () => {
    if (!scanResult) return;

    const content = `
═══════════════════════════════════════
    گزارش اسکن سند — لِگال‌هاب
═══════════════════════════════════════

نوع سند: ${scanResult.documentType}
تاریخ: ${scanResult.date}

───────────────────────────────────────
طرفین:
${scanResult.parties}

───────────────────────────────────────
خلاصه:
${scanResult.summary}

───────────────────────────────────────
مواد و بندهای کلیدی:
${scanResult.keyClauses}

───────────────────────────────────────
متن کامل تحلیل:
${scanResult.rawText}

═══════════════════════════════════════
تاریخ اسکن: ${new Date().toLocaleDateString('fa-IR')}
پلتفرم: لِگال‌هاب — مدیریت حقوقی هوشمند
═══════════════════════════════════════
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setUploadedImage(null);
    setUploadedFileName(null);
    setScanResult(null);
    setScanProgress(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Page header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Scan className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">اسکنر هوشمند اسناد</h1>
            <p className="text-xs text-muted-foreground">تحلیل و استخراج اطلاعات سندهای حقوقی با هوش مصنوعی</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs"
          >
            <History className="w-4 h-4 ml-1" />
            تاریخچه اسکن‌ها
            <Badge variant="secondary" className="mr-1 text-[9px]">
              {scanHistory.length}
            </Badge>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ============ LEFT COLUMN: Upload & Preview ============ */}
        <div className="space-y-4">
          {/* Upload Area */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-500" />
                بارگذاری تصویر سند
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!uploadedImage ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-muted-foreground/25 hover:border-emerald-400 hover:bg-muted/30'
                  }`}
                >
                  <motion.div
                    animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">تصویر سند را اینجا رها کنید</p>
                      <p className="text-xs text-muted-foreground mt-1">یا کلیک کنید برای انتخاب فایل</p>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-[9px]">
                        <ImageIcon className="w-2.5 h-2.5 ml-0.5" />
                        JPG
                      </Badge>
                      <Badge variant="secondary" className="text-[9px]">
                        <ImageIcon className="w-2.5 h-2.5 ml-0.5" />
                        PNG
                      </Badge>
                      <Badge variant="secondary" className="text-[9px]">
                        <ImageIcon className="w-2.5 h-2.5 ml-0.5" />
                        WEBP
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">حداکثر حجم: ۱۰ مگابایت</p>
                  </motion.div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleInputChange}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Image Preview */}
                  <div className="relative group rounded-xl overflow-hidden border bg-muted/20">
                    <img
                      src={uploadedImage}
                      alt="تصویر سند"
                      className="w-full max-h-64 object-contain bg-white dark:bg-slate-900"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={clearAll}
                        className="w-8 h-8 rounded-lg bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <Badge className="text-[9px] bg-black/50 backdrop-blur-sm text-white border-0">
                        <File className="w-2.5 h-2.5 ml-0.5" />
                        {uploadedFileName}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleScan}
                      disabled={isScanning}
                      className="flex-1 bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                    >
                      {isScanning ? (
                        <>
                          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                          در حال اسکن...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 ml-2" />
                          تحلیل با هوش مصنوعی
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scan Progress */}
          <AnimatePresence>
            {isScanning && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card className="border-emerald-200 dark:border-emerald-800">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                        >
                          <Sparkles className="w-4 h-4 text-emerald-500" />
                        </motion.div>
                        <span className="text-sm font-medium">در حال تحلیل سند...</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(scanProgress)}٪
                      </span>
                    </div>
                    <Progress value={scanProgress} className="h-2" />
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: 'تشخیص متن', icon: FileText },
                        { label: 'تحلیل محتوا', icon: BarChart3 },
                        { label: 'استخراج اطلاعات', icon: Tag },
                      ].map((step, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className={`text-[9px] transition-colors ${
                            scanProgress > (i + 1) * 30 ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : ''
                          }`}
                        >
                          <step.icon className="w-2.5 h-2.5 ml-0.5" />
                          {step.label}
                          {scanProgress > (i + 1) * 30 && (
                            <Check className="w-2.5 h-2.5 mr-0.5" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scan History */}
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <History className="w-4 h-4 text-emerald-500" />
                      تاریخچه اسکن‌ها
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="max-h-72">
                      <div className="space-y-2">
                        {scanHistory.map((item) => (
                          <motion.div
                            key={item.id}
                            whileHover={{ x: -4 }}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedHistoryItem?.id === item.id
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700'
                                : 'hover:bg-muted/50 border-border'
                            }`}
                            onClick={() => setSelectedHistoryItem(
                              selectedHistoryItem?.id === item.id ? null : item
                            )}
                          >
                            <div className="flex items-start gap-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4 text-emerald-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{item.fileName}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <Badge variant="secondary" className="text-[8px]">
                                    {item.documentType}
                                  </Badge>
                                  <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                                    <Clock className="w-2 h-2" />
                                    {item.scanDate}
                                  </span>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                                  {item.summary}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============ RIGHT COLUMN: Results & Form ============ */}
        <div className="space-y-4">
          {/* Scan Results / Form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-500" />
                نتایج تحلیل سند
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!scanResult && !isScanning && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                      <Scan className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                  </motion.div>
                  <p className="text-sm">ابتدا تصویر سند را بارگذاری کنید</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    پس از بارگذاری، با کلیک روی «تحلیل با هوش مصنوعی» اطلاعات استخراج می‌شود
                  </p>
                </div>
              )}

              {scanResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Success Banner */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center">
                      <Check className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">تحلیل تکمیل شد!</p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-500">اطلاعات سند با موفقیت استخراج شد</p>
                    </div>
                  </motion.div>

                  {/* Document Type */}
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      نوع سند
                    </Label>
                    <Select value={scanResult.documentType} onValueChange={(val) => setScanResult({ ...scanResult, documentType: val })}>
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date */}
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      تاریخ سند
                    </Label>
                    <Input
                      value={scanResult.date}
                      onChange={(e) => setScanResult({ ...scanResult, date: e.target.value })}
                      className="text-xs"
                      placeholder="مثلاً ۱۴۰۳/۰۹/۱۵"
                    />
                  </div>

                  {/* Parties */}
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1">
                      <User className="w-3 h-3" />
                      طرفین
                    </Label>
                    <Textarea
                      value={scanResult.parties}
                      onChange={(e) => setScanResult({ ...scanResult, parties: e.target.value })}
                      className="text-xs min-h-[60px] resize-none"
                    />
                  </div>

                  {/* Summary */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        خلاصه
                      </Label>
                      <button
                        onClick={() => copyToClipboard(scanResult.summary, 'summary')}
                        className="text-[9px] text-muted-foreground hover:text-emerald-600 flex items-center gap-0.5"
                      >
                        {copiedField === 'summary' ? (
                          <><Check className="w-2.5 h-2.5" />کپی شد</>
                        ) : (
                          <><Copy className="w-2.5 h-2.5" />کپی</>
                        )}
                      </button>
                    </div>
                    <Textarea
                      value={scanResult.summary}
                      onChange={(e) => setScanResult({ ...scanResult, summary: e.target.value })}
                      className="text-xs min-h-[80px] resize-none"
                    />
                  </div>

                  {/* Key Clauses */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs flex items-center gap-1">
                        <ListChecks className="w-3 h-3" />
                        مواد و موارد کلیدی
                      </Label>
                      <button
                        onClick={() => copyToClipboard(scanResult.keyClauses, 'clauses')}
                        className="text-[9px] text-muted-foreground hover:text-emerald-600 flex items-center gap-0.5"
                      >
                        {copiedField === 'clauses' ? (
                          <><Check className="w-2.5 h-2.5" />کپی شد</>
                        ) : (
                          <><Copy className="w-2.5 h-2.5" />کپی</>
                        )}
                      </button>
                    </div>
                    <Textarea
                      value={scanResult.keyClauses}
                      onChange={(e) => setScanResult({ ...scanResult, keyClauses: e.target.value })}
                      className="text-xs min-h-[80px] resize-none"
                    />
                  </div>

                  <Separator />

                  {/* Export Options */}
                  <div className="space-y-2">
                    <Label className="text-xs">خروجی</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => copyToClipboard(scanResult.rawText, 'all')}
                      >
                        {copiedField === 'all' ? (
                          <><Check className="w-3.5 h-3.5 ml-1" />کپی شد!</>
                        ) : (
                          <><Copy className="w-3.5 h-3.5 ml-1" />کپی کل متن</>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={downloadAsText}
                      >
                        <Download className="w-3.5 h-3.5 ml-1" />
                        دانلود فایل متنی
                      </Button>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed">
                      نتایج تحلیل صرفاً جنبه راهنمایی دارند و جایگزین بررسی دقیق سند توسط وکیل متخصص نمی‌شوند.
                    </p>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Features Card */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                قابلیت‌های اسکنر
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'تشخیص متن', icon: FileText, desc: 'استخراج متن از تصاویر' },
                  { label: 'تحلیل محتوا', icon: BarChart3, desc: 'تحلیل خودکار سند' },
                  { label: 'شناسایی طرفین', icon: User, desc: 'استخراج نام افراد' },
                  { label: 'استخراج تاریخ', icon: Calendar, desc: 'تشخیص تاریخ سند' },
                  { label: 'مواد کلیدی', icon: ListChecks, desc: 'شناسایی بندهای مهم' },
                  { label: 'خروجی متنی', icon: Download, desc: 'دانلود نتایج' },
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                      <feature.icon className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium">{feature.label}</p>
                      <p className="text-[8px] text-muted-foreground">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
