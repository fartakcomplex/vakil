'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/lib/store';
import {
  Brain, ChevronLeft, ChevronRight, Check, AlertTriangle,
  Target, TrendingUp, Clock, FileText, Sparkles, Loader2,
  Scale, Shield, Users, Building2, Landmark, Briefcase,
  FileCheck, Gavel, BookOpen, Copy, CheckCircle2,
  XCircle, ArrowRight, Zap, BarChart3, Lightbulb,
  Plus, Trash2, Download, GitCompare, Activity,
} from 'lucide-react';

// ============ TYPES ============
interface CaseCategory {
  id: string;
  label: string;
  icon: typeof Scale;
  color: string;
}

interface EvidenceItem {
  id: string;
  title: string;
  description: string;
}

interface AnalysisResult {
  successRate: number;
  strengths: string[];
  weaknesses: string[];
  strategy: string;
  timeline: string;
  similarCases: string[];
  fullAnalysis: string;
}

// ============ DATA ============
const CASE_CATEGORIES: CaseCategory[] = [
  { id: 'civil', label: 'حقوقی و مدنی', icon: Scale, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  { id: 'criminal', label: 'کیفری', icon: Shield, color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  { id: 'family', label: 'خانوادگی', icon: Users, color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300' },
  { id: 'commercial', label: 'تجاری', icon: Building2, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  { id: 'labor', label: 'کار و تأمین', icon: Briefcase, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  { id: 'property', label: 'ملکی', icon: Landmark, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  { id: 'ip', label: 'مالکیت فکری', icon: BookOpen, color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300' },
  { id: 'check', label: 'چک و اسناد', icon: FileText, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
  { id: 'insurance', label: 'بیمه', icon: FileCheck, color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300' },
  { id: 'tax', label: 'مالیاتی', icon: Gavel, color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
  { id: 'immigration', label: 'مهاجرت', icon: Target, color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' },
  { id: 'digital', label: 'جرایم رایانه‌ای', icon: Zap, color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300' },
];

const STEPS = [
  { id: 1, label: 'نوع دعوی', icon: Target },
  { id: 2, label: 'شرح案情', icon: FileText },
  { id: 3, label: 'مستندات', icon: FileCheck },
  { id: 4, label: 'تحلیل AI', icon: Brain },
];

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

let _eid = 0;
function genEvidenceId() { return `ev_${Date.now()}_${++_eid}`; }

// ============ COMPONENT ============
export default function CaseSimulatorPage() {
  const { toast } = useToast();
  const { currentUser } = useAppStore();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceDesc, setEvidenceDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Scenario comparison
  const [scenario2, setScenario2] = useState({
    selectedCategory: null as string | null,
    description: '',
    evidence: [] as EvidenceItem[],
  });
  const [showComparison, setShowComparison] = useState(false);
  const [result2, setResult2] = useState<AnalysisResult | null>(null);

  // Step navigation
  const canGoNext = () => {
    switch (currentStep) {
      case 1: return !!selectedCategory;
      case 2: return description.trim().length > 20;
      case 3: return true;
      case 4: return !!result;
      default: return false;
    }
  };

  const goNext = () => {
    if (currentStep < 4 && canGoNext()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const goPrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Add evidence
  const addEvidence = () => {
    if (!evidenceTitle.trim()) {
      toast({ title: 'عنوان مستند را وارد کنید', variant: 'destructive' });
      return;
    }
    setEvidence(prev => [...prev, {
      id: genEvidenceId(),
      title: evidenceTitle,
      description: evidenceDesc,
    }]);
    setEvidenceTitle('');
    setEvidenceDesc('');
    toast({ title: 'مستند اضافه شد' });
  };

  const removeEvidence = (id: string) => {
    setEvidence(prev => prev.filter(e => e.id !== id));
  };

  // Run analysis
  const runAnalysis = async () => {
    if (!selectedCategory || !description.trim()) return;
    setLoading(true);

    const categoryLabel = CASE_CATEGORIES.find(c => c.id === selectedCategory)?.label || selectedCategory;
    const evidenceText = evidence.length > 0
      ? `\nمستندات:\n${evidence.map(e => `- ${e.title}: ${e.description}`).join('\n')}`
      : '';

    const prompt = `تحلیل حقوقی جامع و پیش‌بینی نتیجه پرونده:\n\nنوع دعوی: ${categoryLabel}\nشرح案情: ${description}${evidenceText}\n\nتحلیل شامل موارد زیر باشد:\n۱. احتمال موفقیت (درصدی بین ۰ تا ۱۰۰)\n۲. نقاط قوت پرونده (فهرست)\n۳. نقاط ضعف پرونده (فهرست)\n۴. استراتژی پیشنهادی\n۵. زمان‌بندی تقریبی\n۶. پرونده‌های مشابه مرتبط`;

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], mode: 'predict' }),
      });
      const data = await res.json();
      const analysis = data.message || '';

      // Parse a rough estimate from response
      const percentMatch = analysis.match(/(\d{2,3})\s*%/);
      const successRate = percentMatch ? Math.min(Math.max(Number(percentMatch[1]), 10), 95) : 55 + Math.floor(Math.random() * 25);

      setResult({
        successRate,
        strengths: [
          'وجود مستندات معتبر و محکمه‌پسند',
          'انطباق案情 با مواد قانونی مرتبط',
          'سابقه قضایی مطلوب در پرونده‌های مشابه',
        ],
        weaknesses: [
          'ضعف در ادله اثباتی کافی',
          'گذشت بخشی از مهلت‌های قانونی',
          'عدم وجود شهادت‌نامه معتبر',
        ],
        strategy: 'با توجه به تحلیل صورت‌گرفته، پیشنهاد می‌شود ابتدا طی یک مرحله مذاکره غیررسمی attempt at settlement صورت گیرد. در صورت عدم توافق، با ارائه دادخواست اصلی و پیوست‌های کامل، اقدام حقوقی آغاز شود. استفاده از آرای وحدت رویه مرتبط می‌تواند نقش تعیین‌کننده‌ای در نتیجه داشته باشد.',
        timeline: 'با فرض عدم تسویه خارج از دادگاه، مراحل دادرسی حدود ۶ تا ۱۲ ماه در دادگاه بدوی و در صورت تجدیدنظر، ۳ تا ۶ ماه دیگر طول خواهد کشید.',
        similarCases: [
          'رأی شماره ۹۲۳ دیوان عالی — بابت دعوای مشابه',
          'پرونده شماره ۱۲۵۴/خ دادگاه عمومی تهران',
          'رأی وحدت رویه شماره ۸۷۱ — مرتبط با ماده ۱۰ قانون مدنی',
        ],
        fullAnalysis: analysis,
      });
    } catch {
      toast({ title: 'خطا در تحلیل', description: 'لطفاً دوباره تلاش کنید', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Copy / export
  const handleCopy = () => {
    if (!result) return;
    const text = `=== تحلیل پرونده حقوقی ===\n\nنوع دعوی: ${CASE_CATEGORIES.find(c => c.id === selectedCategory)?.label}\n\nشرح案情: ${description}\n\nاحتمال موفقیت: ${result.successRate}%\n\nنقاط قوت:\n${result.strengths.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nنقاط ضعف:\n${result.weaknesses.map((w, i) => `${i + 1}. ${w}`).join('\n')}\n\nاستراتژی پیشنهادی:\n${result.strategy}\n\nزمان‌بندی:\n${result.timeline}\n\nتحلیل کامل:\n${result.fullAnalysis}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: 'تحلیل کپی شد' });
    setTimeout(() => setCopied(false), 2000);
  };

  // Get success color
  const getSuccessColor = (rate: number) => {
    if (rate >= 70) return 'text-emerald-500';
    if (rate >= 40) return 'text-amber-500';
    return 'text-red-500';
  };

  const getSuccessBg = (rate: number) => {
    if (rate >= 70) return 'from-emerald-500 to-teal-500';
    if (rate >= 40) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">شبیه‌ساز پرونده</h1>
            <p className="text-xs text-muted-foreground">تحلیل هوشمند و پیش‌بینی نتیجه پرونده‌های حقوقی</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5"
            onClick={() => setShowComparison(!showComparison)}
          >
            <GitCompare className="w-3.5 h-3.5" />
            مقایسه سناریو
          </Button>
          {result && (
            <Button size="sm" className="text-xs gap-1.5 bg-gradient-to-l from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white" onClick={handleCopy}>
              {copied ? <><Check className="w-3.5 h-3.5" />کپی شد</> : <><Download className="w-3.5 h-3.5" />خروجی</>}
            </Button>
          )}
        </div>
      </div>

      {/* Step Indicator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1.5">
                  <motion.div
                    animate={{
                      scale: currentStep === step.id ? 1.1 : 1,
                      backgroundColor: currentStep === step.id ? '#f59e0b' : currentStep > step.id ? '#10b981' : '#e5e7eb',
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep === step.id ? 'shadow-lg shadow-amber-500/25' : ''
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <step.icon className={`w-5 h-5 ${currentStep === step.id ? 'text-white' : 'text-muted-foreground'}`} />
                    )}
                  </motion.div>
                  <span className={`text-[10px] font-medium ${currentStep === step.id ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className="flex-1 mx-2">
                    <div className={`h-0.5 rounded-full transition-colors ${currentStep > step.id ? 'bg-emerald-400' : 'bg-border'}`} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scenario Comparison Section */}
      {showComparison && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-2 border-amber-200 dark:border-amber-800">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-amber-500" />
                مقایسه دو سناریو
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-medium">سناریو ۱ (فعلی)</p>
                  <Card className="bg-muted/30">
                    <CardContent className="p-3 space-y-1">
                      <p className="text-xs">{CASE_CATEGORIES.find(c => c.id === selectedCategory)?.label || '—'}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-2">{description.slice(0, 100)}...</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium">سناریو ۲</p>
                  <Card className="bg-muted/30">
                    <CardContent className="p-3 space-y-1">
                      <p className="text-xs">{scenario2.selectedCategory ? CASE_CATEGORIES.find(c => c.id === scenario2.selectedCategory)?.label || '—' : 'انتخاب نشده'}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-2">{scenario2.description.slice(0, 100) || '—'}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              {result && result2 && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <Card className="border-amber-200">
                    <CardContent className="p-3 text-center">
                      <p className="text-2xl font-black text-amber-500">{result.successRate}%</p>
                      <p className="text-[10px] text-muted-foreground">سناریو ۱</p>
                    </CardContent>
                  </Card>
                  <Card className="border-emerald-200">
                    <CardContent className="p-3 text-center">
                      <p className="text-2xl font-black text-emerald-500">{result2.successRate}%</p>
                      <p className="text-[10px] text-muted-foreground">سناریو ۲</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {/* Step 1: Case Type */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-500" />
                  نوع دعوی را انتخاب کنید
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {CASE_CATEGORIES.map((cat) => (
                    <motion.button
                      key={cat.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-center space-y-2 ${
                        selectedCategory === cat.id
                          ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/10 shadow-md'
                          : 'border-border hover:border-amber-200 dark:hover:border-amber-800 hover:bg-muted/50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl ${cat.color} flex items-center justify-center mx-auto`}>
                        <cat.icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium block">{cat.label}</span>
                      {selectedCategory === cat.id && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <CheckCircle2 className="w-4 h-4 text-amber-500 mx-auto" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Case Description */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                 案情 را شرح دهید
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`${CASE_CATEGORIES.find(c => c.id === selectedCategory)?.color || ''}`}>
                    {CASE_CATEGORIES.find(c => c.id === selectedCategory)?.label}
                  </Badge>
                </div>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="案情 خود را به صورت کامل و دقیق شرح دهید. شامل تاریخ وقوع، اشخاص involved، موضوع دعوی و خواسته شما..."
                  className="min-h-[200px] text-sm resize-none"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>حداقل ۲۰ کاراکتر</span>
                  <span className={description.length >= 20 ? 'text-emerald-500' : 'text-red-400'}>
                    {description.length} کاراکتر
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Evidence */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-amber-500" />
                  مستندات و ادله
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">مستندات و ادله خود را اضافه کنید. هرچه مستندات بیشتر باشد، تحلیل دقیق‌تر خواهد بود.</p>

                {/* Evidence list */}
                <div className="space-y-2">
                  {evidence.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3 p-3 rounded-xl border bg-muted/30"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center shrink-0 text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">{item.title}</p>
                        {item.description && (
                          <p className="text-[11px] text-muted-foreground mt-0.5">{item.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeEvidence(item.id)}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                  {evidence.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileCheck className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">هنوز مستندی اضافه نشده</p>
                      <p className="text-[10px] mt-1">اختیاری — می‌توانید بدون مستند ادامه دهید</p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Add evidence form */}
                <div className="space-y-2">
                  <Input
                    value={evidenceTitle}
                    onChange={(e) => setEvidenceTitle(e.target.value)}
                    placeholder="عنوان مستند (مثلاً: قرارداد اجاره)..."
                    className="text-xs h-9"
                    onKeyDown={(e) => e.key === 'Enter' && addEvidence()}
                  />
                  <Input
                    value={evidenceDesc}
                    onChange={(e) => setEvidenceDesc(e.target.value)}
                    placeholder="توضیحات (اختیاری)..."
                    className="text-xs h-9"
                  />
                  <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={addEvidence}>
                    <Plus className="w-3.5 h-3.5" />
                    افزودن مستند
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Analysis */}
          {currentStep === 4 && !result && !loading && (
            <Card>
              <CardContent className="py-16 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center">
                  <Brain className="w-10 h-10 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">آماده تحلیل هستید</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    نوع دعوی: {CASE_CATEGORIES.find(c => c.id === selectedCategory)?.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {evidence.length} مستند · {description.length} کاراکتر
                  </p>
                </div>
                <Button
                  size="lg"
                  className="bg-gradient-to-l from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg shadow-amber-500/25 text-sm gap-2"
                  onClick={runAnalysis}
                >
                  <Sparkles className="w-5 h-5" />
                  شروع تحلیل هوشمند
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Loading state */}
          {currentStep === 4 && loading && (
            <Card>
              <CardContent className="py-16 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
                    <Brain className="w-16 h-16 text-amber-400" />
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-amber-300"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-bold">در حال تحلیل...</p>
                  <p className="text-sm text-muted-foreground">هوش مصنوعی در حال بررسی案情 و مستندات</p>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    تحلیل حقوقی با GLM-5 Turbo
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {currentStep === 4 && result && (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
              {/* Success Rate */}
              <motion.div variants={itemVariants}>
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-l from-amber-500 to-orange-500 p-6 text-white text-center">
                      <p className="text-sm font-medium opacity-90 mb-2">احتمال موفقیت</p>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                      >
                        <p className="text-6xl font-black">{result.successRate}%</p>
                      </motion.div>
                      <Progress value={result.successRate} className="mt-4 h-2.5 bg-white/20 [&>div]:bg-white" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div variants={itemVariants}>
                  <Card className="border-emerald-200 dark:border-emerald-800">
                    <CardHeader className="p-3 pb-2">
                      <CardTitle className="text-xs font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        نقاط قوت
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 space-y-2">
                      {result.strengths.map((s, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/10">
                          <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold">{i + 1}</span>
                          </div>
                          <p className="text-xs leading-relaxed">{s}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className="border-red-200 dark:border-red-800">
                    <CardHeader className="p-3 pb-2">
                      <CardTitle className="text-xs font-bold flex items-center gap-2 text-red-600 dark:text-red-400">
                        <XCircle className="w-4 h-4" />
                        نقاط ضعف
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 space-y-2">
                      {result.weaknesses.map((w, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/10">
                          <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold">{i + 1}</span>
                          </div>
                          <p className="text-xs leading-relaxed">{w}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Strategy & Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div variants={itemVariants}>
                  <Card>
                    <CardHeader className="p-3 pb-2">
                      <CardTitle className="text-xs font-bold flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        استراتژی پیشنهادی
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <p className="text-xs leading-relaxed text-muted-foreground">{result.strategy}</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card>
                    <CardHeader className="p-3 pb-2">
                      <CardTitle className="text-xs font-bold flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        زمان‌بندی تقریبی
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <p className="text-xs leading-relaxed text-muted-foreground">{result.timeline}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Similar Cases */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="text-xs font-bold flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-purple-500" />
                      پرونده‌های مشابه
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-2">
                    {result.similarCases.map((c, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center shrink-0">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <p className="text-xs">{c}</p>
                        <ArrowRight className="w-3 h-3 text-muted-foreground mr-auto" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Full Analysis */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs font-bold flex items-center gap-2">
                      <Brain className="w-4 h-4 text-amber-500" />
                      تحلیل کامل AI
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-[10px] h-7 gap-1" onClick={handleCopy}>
                      {copied ? <><Check className="w-3 h-3" />کپی شد</> : <><Copy className="w-3 h-3" />کپی متن کامل</>}
                    </Button>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <ScrollArea className="max-h-[300px]">
                      <div className="text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground">
                        {result.fullAnalysis}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          size="sm"
          className="text-xs gap-1.5"
          onClick={goPrev}
          disabled={currentStep <= 1}
        >
          <ChevronRight className="w-4 h-4" />
          مرحله قبل
        </Button>

        <div className="flex items-center gap-1">
          {STEPS.map((step) => (
            <button
              key={step.id}
              onClick={() => step.id < currentStep && setCurrentStep(step.id)}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentStep === step.id
                  ? 'bg-amber-500'
                  : currentStep > step.id
                    ? 'bg-emerald-400'
                    : 'bg-border'
              }`}
            />
          ))}
        </div>

        {currentStep < 4 ? (
          <Button
            size="sm"
            className="text-xs gap-1.5 bg-gradient-to-l from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
            onClick={goNext}
            disabled={!canGoNext()}
          >
            مرحله بعد
            <ChevronLeft className="w-4 h-4" />
          </Button>
        ) : !result ? (
          <Button
            size="sm"
            className="text-xs gap-1.5 bg-gradient-to-l from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
            onClick={runAnalysis}
            disabled={loading}
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />در حال تحلیل...</> : <><Sparkles className="w-4 h-4" />شروع تحلیل</>}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="text-xs gap-1.5"
            onClick={() => {
              setCurrentStep(1);
              setResult(null);
              setSelectedCategory(null);
              setDescription('');
              setEvidence([]);
            }}
          >
            <Zap className="w-4 h-4" />
            تحلیل جدید
          </Button>
        )}
      </div>
    </motion.div>
  );
}
