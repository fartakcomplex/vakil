'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { toPersianNumber } from '@/lib/utils-helpers';
import {
  Globe,
  Check,
  ChevronLeft,
  ChevronRight,
  Languages,
  Eye,
  ArrowLeftRight,
  Heart,
  Users,
  BookOpen,
  CheckCircle2,
  Star,
  Sparkles,
  ExternalLink,
  AlignLeft,
  AlignRight,
  Type,
  MessageSquare,
  FileText,
  Settings,
  Languages as Translate,
  CircleDot,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/lib/store';

// ============ TYPES ============
interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'rtl' | 'ltr';
  coverage: number;
  isActive: boolean;
}

// ============ MOCK DATA ============
const languages: Language[] = [
  { id: '1', code: 'fa', name: 'فارسی', nativeName: 'فارسی', flag: '🇮🇷', direction: 'rtl', coverage: 100, isActive: true },
  { id: '2', code: 'ar', name: 'العربية', nativeName: 'العربية', flag: '🇸🇦', direction: 'rtl', coverage: 45, isActive: false },
  { id: '3', code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', direction: 'ltr', coverage: 38, isActive: false },
];

const rtlSample = 'این یک نمونه متن فارسی است. لِگال‌هاب پلتفرم جامع مدیریت حقوقی با هوش مصنوعی می‌باشد.';
const ltrSample = 'This is a sample English text. LegalHub is a comprehensive legal management platform with AI.';

// ============ COMPONENT ============
export default function I18nPage() {
  const { toast } = useToast();
  const { language, setLanguage } = useAppStore();
  const [selectedLang, setSelectedLang] = useState(language);

  const handleSelectLanguage = (langCode: string) => {
    setSelectedLang(langCode as 'fa' | 'en');
    setLanguage(langCode as 'fa' | 'en');
    const lang = languages.find((l) => l.code === langCode);
    toast({
      title: 'زبان تغییر کرد',
      description: `زبان نمایش به ${lang?.nativeName || langCode} تغییر یافت`,
    });
  };

  const getCoverageColor = (coverage: number) => {
    if (coverage === 100) return 'text-emerald-600';
    if (coverage >= 60) return 'text-amber-600';
    return 'text-red-500';
  };

  const getCoverageBg = (coverage: number) => {
    if (coverage === 100) return 'bg-emerald-500';
    if (coverage >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold">تنظیمات زبان</h1>
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
          <Globe className="w-3 h-3 ml-1" />
          چندزبانه
        </Badge>
      </div>

      {/* Language Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {languages.map((lang, idx) => (
          <motion.div
            key={lang.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card
              className={`cursor-pointer transition-all overflow-hidden ${
                selectedLang === lang.code
                  ? 'ring-2 ring-emerald-500 shadow-md border-emerald-500'
                  : 'hover:shadow-md hover:border-emerald-300'
              }`}
              onClick={() => handleSelectLanguage(lang.code)}
            >
              {/* Top gradient bar */}
              <div
                className={`h-1.5 ${
                  selectedLang === lang.code
                    ? 'bg-gradient-to-l from-emerald-500 to-emerald-400'
                    : 'bg-muted'
                }`}
              />

              <CardContent className="p-4 text-center space-y-3">
                {/* Flag & Check */}
                <div className="relative inline-block">
                  <span className="text-5xl">{lang.flag}</span>
                  {selectedLang === lang.code && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"
                    >
                      <Check className="w-3.5 h-3.5 text-white" />
                    </motion.div>
                  )}
                </div>

                {/* Names */}
                <div>
                  <p className="text-base font-bold">{lang.nativeName}</p>
                  <p className="text-sm text-muted-foreground">{lang.name}</p>
                </div>

                {/* Direction */}
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  {lang.direction === 'rtl' ? (
                    <><AlignRight className="w-3 h-3" />راست به چپ (RTL)</>
                  ) : (
                    <><AlignLeft className="w-3 h-3" />چپ به راست (LTR)</>
                  )}
                </div>

                {/* Coverage */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">پوشش ترجمه</span>
                    <span className={`font-medium ${getCoverageColor(lang.coverage)}`}>
                      {toPersianNumber(lang.coverage)}٪
                    </span>
                  </div>
                  <Progress value={lang.coverage} className="h-1.5" />
                </div>

                {selectedLang === lang.code && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-xs">
                      <CheckCircle2 className="w-3 h-3 ml-1" />
                      فعال
                    </Badge>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Direction Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-600" />
            پیش‌نمایش جهت متن
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* RTL Preview */}
            <div className="border rounded-xl overflow-hidden">
              <div className="bg-muted/50 px-4 py-2 flex items-center gap-2 text-xs text-muted-foreground">
                <AlignRight className="w-3 h-3" />
                راست به چپ (RTL)
              </div>
              <div className="p-4 bg-white dark:bg-slate-900" dir="rtl">
                <p className="text-sm leading-7">{rtlSample}</p>
                <div className="mt-3 flex gap-2" dir="rtl">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                    <MessageSquare className="w-3 h-3 ml-1" />
                    ارسال پیام
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <FileText className="w-3 h-3 ml-1" />
                    مشاهده سند
                  </Button>
                </div>
              </div>
            </div>

            {/* LTR Preview */}
            <div className="border rounded-xl overflow-hidden">
              <div className="bg-muted/50 px-4 py-2 flex items-center gap-2 text-xs text-muted-foreground">
                <AlignLeft className="w-3 h-3" />
                چپ به راست (LTR)
              </div>
              <div className="p-4 bg-white dark:bg-slate-900" dir="ltr">
                <p className="text-sm leading-7">{ltrSample}</p>
                <div className="mt-3 flex gap-2" dir="ltr">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Send Message
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <FileText className="w-3 h-3 mr-1" />
                    View Document
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Translation Coverage */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Translate className="w-4 h-4 text-emerald-600" />
            وضعیت ترجمه
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {languages.map((lang) => (
            <div key={lang.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{lang.flag}</span>
                  <span className="text-sm font-medium">{lang.nativeName}</span>
                </div>
                <span className={`text-sm font-bold ${getCoverageColor(lang.coverage)}`}>
                  {toPersianNumber(lang.coverage)}٪
                </span>
              </div>
              <div className="relative">
                <Progress value={lang.coverage} className="h-3" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-medium text-white mix-blend-difference">
                    {toPersianNumber(lang.coverage)}٪
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {lang.coverage >= 100 && (
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-[10px]">
                    <Star className="w-2.5 h-2.5 ml-0.5" />
                    کامل
                  </Badge>
                )}
                {lang.coverage < 100 && (
                  <>
                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 text-[10px]">
                      {toPersianNumber(lang.coverage)}٪ ترجمه شده
                    </Badge>
                    <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[10px]">
                      {toPersianNumber(100 - lang.coverage)}٪ باقیمانده
                    </Badge>
                  </>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Contribute & Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="bg-gradient-to-l from-emerald-600 to-emerald-500 rounded-xl p-4 text-white text-center space-y-3">
              <Heart className="w-8 h-8 mx-auto" />
              <p className="font-medium">در ترجمه لِگال‌هاب مشارکت کنید</p>
              <p className="text-emerald-100 text-sm">با کمک شما، لِگال‌هاب را به زبان‌های بیشتری ترجمه می‌کنیم</p>
              <Button
                variant="outline"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30 hover:text-white text-sm"
                onClick={() => toast({ title: 'مشارکت', description: 'بخش مشارکت به زودی فعال می‌شود' })}
              >
                <ExternalLink className="w-4 h-4 ml-2" />
                شروع همکاری
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Settings className="w-4 h-4 text-emerald-600" />
                اطلاعات فنی
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted text-sm">
                  <Type className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <p className="text-muted-foreground text-xs">فونت فارسی</p>
                    <p className="font-medium">Vazirmatn</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted text-sm">
                  <Languages className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <p className="text-muted-foreground text-xs">زبان‌های پشتیبانی</p>
                    <div className="flex gap-1.5 mt-1">
                      {languages.map((l) => (
                        <span key={l.id} className="text-lg">{l.flag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted text-sm">
                  <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <p className="text-muted-foreground text-xs">بخش‌های ترجمه</p>
                    <p className="font-medium">{toPersianNumber(42)} بخش فعال</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted text-sm">
                  <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <p className="text-muted-foreground text-xs">مترجمین فعال</p>
                    <p className="font-medium">{toPersianNumber(12)} نفر</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
