'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import {
  Search, BookOpen, Star, Clock, ChevronLeft, Lightbulb,
  ArrowLeft, Volume2, Tag, Link2, X, History, Sparkles,
  GraduationCap, Scale, Gavel, Building2, Users, Globe,
  FileText, Shield,
} from 'lucide-react';

// ---- Types ----
interface LegalTerm {
  id: number;
  term: string;
  pronunciation: string;
  category: string;
  definition: string;
  related: string[];
  example: string;
}

// ---- Data ----
const LEGAL_TERMS: LegalTerm[] = [
  { id: 1, term: 'خلع ید', pronunciation: 'خَلعِ یَد', category: 'حقوق مدنی', definition: 'درخواست مستأجر از دادگاه برای تخلیه و تحویل ملک اجاره‌ای به موجر پس از پایان مدت اجاره یا فسخ قرارداد. این دعوا معمولاً در دادگاه‌های حقوقی مطرح می‌شود.', related: ['اجاره', 'موجر', 'مستأجر'], example: 'وکیل خلع ید دادخواست تخلیه را تقدیم دادگاه کرد.' },
  { id: 2, term: 'دعوای ملکی', pronunciation: 'دِعوایِ مَلکی', category: 'حقوق مدنی', definition: 'دعوایی که ناشی از اختلاف بر سر مالکیت، تصرف یا حقوق مربوط به املاک غیرمنقول مانند زمین و آپارتمان است. این دعاوی شامل خلع ید، تطلیق و اثبات مالکیت می‌شود.', related: ['اثبات مالکیت', 'تطلیق', 'خلع ید'], example: 'دعوای ملکی بین دو خواهر بر سر ارث پدری مطرح شد.' },
  { id: 3, term: 'قرارداد اجاره', pronunciation: 'قَراردادِ اجارِه', category: 'حقوق مدنی', definition: 'عقدی که به موجب آن یکی از طرفین مال خود را به دیگری به اجاره واگذار می‌کند و طرف دیگر متعهد به پرداخت اجاره‌بها می‌شود. مدت و شرایط در قرارداد مشخص می‌گردد.', related: ['اجاره‌بها', 'موجر', 'مستأجر', 'وثیقه'], example: 'قرارداد اجاره برای مدت یک سال و با اجاره‌بهای ماهیانه منعقد شد.' },
  { id: 4, term: 'سرقت', pronunciation: 'سَرقت', category: 'حقوق کیفری', definition: 'ربودن مال دیگری به صورت پنهانی و با نیت تملک آن. سرقت از جرایم مهم کیفری محسوب شده و مجازات آن بسته به شرایط از حبس تا قطع دست متغیر است.', related: ['جرایم مالی', 'دیه', 'مجازات'], example: 'متهم به سرقت از یک فروشگاه دستگیر شد.' },
  { id: 5, term: 'قتل', pronunciation: 'قَتل', category: 'حقوق کیفری', definition: 'سلب حیات انسان به صورت غیرقانونی توسط شخص دیگری. قتل ممکن است عمدی، شبه‌عمد یا غیرعمدی باشد و هر کدام مجازات خاص خود را دارند.', related: ['قصاص', 'دیه', 'مجازات اعدام'], example: 'قتل عمدی با مجازات قصاص همراه است.' },
  { id: 6, term: 'کلاهبرداری', pronunciation: 'کَلاهبرداری', category: 'حقوق کیفری', definition: 'فریب دادن شخص با وسایل متقلبانه جهت بردن مال او. کلاهبرداری از جرایم علیه اموال و مالکیت است و مجازات آن حبس و رد مال به صاحب آن می‌باشد.', related: ['جرایم مالی', 'تزویر', 'فریب'], example: 'متهم با جعل سند بانکی اقدام به کلاهبرداری کرده بود.' },
  { id: 7, term: 'شرکت سهامی', pronunciation: 'شِرکتِ سِهامی', category: 'حقوق تجاری', definition: 'شرکتی که سرمایه آن به قطعات سهام تقسیم شده و مسئولیت صاحبان سهام محدود به مبلغ اسمی سهام آنهاست. این نوع شرکت یکی از مهم‌ترین اشخاص حقوقی تجاری است.', related: ['سهام', 'اشخاص حقوقی', 'مسئولیت محدود'], example: 'شرکت سهامی با سرمایه پانصد میلیون تومان ثبت شد.' },
  { id: 8, term: 'ورشکستگی', pronunciation: 'وَرشکَستگی', category: 'حقوق تجاری', definition: 'توقف تاجر از پرداخت دیون خود به دلیل ناتوانی مالی. ورشکستگی ممکن است به صورت عادی یا تقصیری باشد و در هر دو حالت آثار حقوقی مهمی دارد.', related: ['تاجر', 'دیون', 'توقف پرداخت'], example: 'دادگاه ورشکستگی تاجر را به دلیل بدهی‌های سنگین اعلام کرد.' },
  { id: 9, term: 'برات', pronunciation: 'بِرات', category: 'حقوق تجاری', definition: 'سندی تجاری که به موجب آن یک شخص (صادرکننده) شخص دیگری (محال‌علیه) را به پرداخت مبلغ معینی به شخص سوم (ذی‌نفع) در زمان و مکان مشخص امر می‌کند.', related: ['سفته', 'چک', 'اسناد تجاری'], example: 'برات به عنوان یکی از اسناد تجاری معتبر شناخته می‌شود.' },
  { id: 10, term: 'قرارداد کار', pronunciation: 'قَراردادِ کار', category: 'حقوق کار', definition: 'توافقی کتبی یا شفاهی بین کارگر و کارفرما که موضوع آن انجام کار در ازای دریافت حقوق و مزایای مشخص است. این قرارداد باید مطابق با قانون کار تنظیم شود.', related: ['حقوق کارگر', 'بیمه تأمین اجتماعی', 'کارفرما'], example: 'قرارداد کار جدید با حقوق افزایش‌یافته منعقد شد.' },
  { id: 11, term: 'بیمه تأمین اجتماعی', pronunciation: 'بیمِه تأمینِ اِجتماعی', category: 'حقوق کار', definition: 'نظامی که به منظور تأمین رفاه و امنیت اجتماعی کارگران و خانواده آنها تأسیس شده و شامل خدمات درمانی، بازنشستگی، ازکارافتادگی و بیمه بیکاری می‌شود.', related: ['بازنشستگی', 'حقوق بازنشستگی', 'کارفرما'], example: 'حقوق بیمه تأمین اجتماعی توسط کارفرما و کارگر مشترکاً پرداخت می‌شود.' },
  { id: 12, term: 'اضافه‌کاری', pronunciation: 'اِضافه‌کاری', category: 'حقوق کار', definition: 'ساعات کار فراتر از ساعات معمولی قانونی کار که کارگر موظف به انجام آن شده است. بر اساس قانون کار، اضافه‌کاری باید با نرخ بالاتری محاسبه و پرداخت گردد.', related: ['حقوق کارگر', 'ساعات کار', 'تعطیلات'], example: 'پرداخت حقوق اضافه‌کاری طبق ماده ۵۹ قانون کار الزامی است.' },
  { id: 13, term: 'حقوق بین‌الملل', pronunciation: 'حُقوقِ بَین‌اِلمللی', category: 'حقوق بین‌الملل', definition: 'مجموعه قواعد و اصولی که روابط بین دولت‌ها و اشخاص بین‌المللی را تنظیم می‌کند. این حقوق شامل حقوق بین‌الملل عمومی و خصوصی می‌باشد.', related: ['معاهده', 'سازمان ملل', 'دیپلماسی'], example: 'معاهده ژنو یکی از اسناد مهم حقوق بین‌الملل است.' },
  { id: 14, term: 'پناهندگی', pronunciation: 'پَناهندگی', category: 'حقوق بین‌الملل', definition: 'حق فردی که به دلیل ترس از آزار و اذیت نژادی، مذهبی یا سیاسی کشور خود را ترک کرده و از کشوری دیگر درخواست حمایت و پناهگاه می‌کند.', related: ['مهاجرت', 'پناهنده', 'کنوانسیون ۱۹۵۱'], example: 'درخواست پناهندگی وی به سازمان ملل ارجاع شد.' },
  { id: 15, term: 'دادخواست', pronunciation: 'دادخواست', category: 'اصطلاحات عمومی', definition: 'سند رسمی و مکتوبی که به دادگاه تقدیم می‌شود و حاوی درخواست و تقاضای حقوقی شخص از مرجع قضایی است. تنظیم صحیح دادخواست یکی از مهم‌ترین مراحل دادرسی است.', related: ['شکواییه', 'لایحه', 'دادگاه'], example: 'دادخواست مطالبه وجه به دادگاه حقوقی تقدیم شد.' },
  { id: 16, term: 'لایحه دفاعیه', pronunciation: 'لایحِه دِفاعیه', category: 'اصطلاحات عمومی', definition: 'نوشته‌ای حقوقی که وکیل یا اصیل در دفاع از موکل خود در مقابل دادخواست طرف مقابل به دادگاه ارائه می‌دهد. لایحه باید مستدل و مستند به قوانین باشد.', related: ['وکیل', 'دفاع', 'دادخواست'], example: 'لایحه دفاعیه وکیل مقرون به دلایل محکمه‌پسند بود.' },
  { id: 17, term: 'آرای وحدت رویه', pronunciation: 'آرایِ وِحدت رُویه', category: 'اصطلاحات عمومی', definition: 'آرایی که از سوی دیوان عالی کشور صادر می‌شود به منظور ایجاد وحدت در رویه قضایی و جلوگیری از صدور آرای متعارض توسط شعب مختلف دادگاه‌ها.', related: ['دیوان عالی', 'رویه قضایی', 'رأی'], example: 'آرای وحدت رویه برای شعب دادگاه الزام‌آور است.' },
  { id: 18, term: 'رسیدگی تجدیدنظر', pronunciation: 'رَسیدگی تَجدیدنَظَر', category: 'اصطلاحات عمومی', definition: 'مرحله‌ای از دادرسی که در آن شخص محکوم‌علیه از رأی صادر شده توسط دادگاه بدایت اعتراض کرده و درخواست بررسی مجدد پرونده در دادگاه تجدیدنظر را دارد.', related: ['دادگاه بدایت', 'تجدیدنظرخواهی', 'رأی'], example: 'رسیدگی تجدیدنظر در ظرف بیست روز پس از ابلاغ رأی قابل درخواست است.' },
  { id: 19, term: 'وثیقه', pronunciation: 'وَثیقِه', category: 'اصطلاحات عمومی', definition: 'اموال یا اسنادی که به منظور تضمین اجرای تعهد یا بدهی به مرجع ذی‌صلاح ارائه می‌شود. وثیقه می‌تواند سند ملکی، پول نقد یا ضمانت بانکی باشد.', related: ['تضمین', 'بازداشت', 'کفالت'], example: 'وکیل با ارائه سند ملکی وثیقه گرفت و موکل را آزاد کرد.' },
  { id: 20, term: 'طلاق', pronunciation: 'طَلاق', category: 'حقوق مدنی', definition: 'انحلال ازدواج به صورت قانونی و رسمی. طلاق ممکن است به صورت رجعی یا بائن باشد و شرایط خاصی مانند داوری و مطالبه مهریه دارد.', related: ['مهریه', 'نفقه', 'حضانت'], example: 'دادگاه طلاق زوجین را پس از انجام داوری صادر کرد.' },
  { id: 21, term: 'مهریه', pronunciation: 'مهریِه', category: 'حقوق مدنی', definition: 'مالی که به موجب عقد نکاح به زن تعلق می‌گیرد و زن پس از عقد مالک آن می‌شود. مهریه باید مشخص و معین باشد و در زمان عقد در عقدنامه ثبت گردد.', related: ['طلاق', 'نفقه', 'عقد نکاح'], example: 'مهریه طبق عقدنامه مبلغ صد سکه طلا تعیین شده بود.' },
  { id: 22, term: 'نفقه', pronunciation: 'نَفَقِه', category: 'حقوق مدنی', definition: 'هزینه‌هایی که شخص بر اساس قانون موظف به پرداخت آن برای تأمین زندگی همسر و فرزندان خود است. نفقه شامل خوراک، پوشاک، مسکن و هزینه‌های درمانی می‌باشد.', related: ['مهریه', 'حضانت', 'طلاق'], example: 'زن حق مطالبه نفقه از شوهر خود را دارد.' },
  { id: 23, term: 'حضانت', pronunciation: 'حَضانَت', category: 'حقوق مدنی', definition: 'حق و تکلیف نگهداری، تربیت و سرپرستی کودکان پس از جدایی والدین. حضانت معمولاً تا سن هفت سالگی با مادر و پس از آن با پدر است مگر آنکه صلاحیت او سلب شود.', related: ['طلاق', 'نفقه', 'سرپرستی'], example: 'دادگاه حضانت کودک را به مادر واگذار کرد.' },
  { id: 24, term: 'دیه', pronunciation: 'دیِه', category: 'حقوق کیفری', definition: 'مبلغ مالی که به عنوان خسارت به مجنی‌علیه یا ورثه او پرداخت می‌شود در مواردی که جنایت منجر به نقص عضو یا فوت شده باشد. مقدار دیه بر اساس فتاوای شرعی تعیین می‌گردد.', related: ['قتل', 'جنایت', 'قصاص'], example: 'مقدار دیه در فتاوای جدید مراجع تقلید افزایش یافت.' },
  { id: 25, term: 'شکواییه', pronunciation: 'شِکواییِه', category: 'حقوق کیفری', definition: 'گزارش رسمی جرم به مقامات قضایی و انتظامی. شکواییه معمولاً توسط شاکی یا مرجع انتظامی تنظیم و به دادسرا ارسال می‌شود تا تحقیقات مقدماتی آغاز گردد.', related: ['دادخواست', 'دادسرا', 'تحقیقات'], example: 'شاکی شکواییه سرقت را به دادسرا تقدیم کرد.' },
  { id: 26, term: 'تعزیر', pronunciation: 'تَعزیر', category: 'حقوق کیفری', definition: 'مجازاتی که نوع و مقدار آن را قانون‌گذار تعیین کرده و بر خلاف حد، قابل تعویض و تخفیف است. تعزیرات شامل حبس، شلاق، جزای نقدی و محرومیت از حقوق اجتماعی است.', related: ['حد', 'قصاص', 'مجازات'], example: 'مجرم به تحمل یک سال حبس تعزیری محکوم شد.' },
  { id: 27, term: 'اطلاعات معاملاتی', pronunciation: 'اِطلاعاتِ مُعامَلاتی', category: 'حقوق تجاری', definition: 'اطلاعاتی که شرکت‌های تجاری موظف به افشای آن هستند و شامل وضعیت مالی، سود و زیان، ترازنامه و گزارش حسابرسی شرکت می‌باشد.', related: ['شرکت سهامی', 'ترازنامه', 'حسابرسی'], example: 'اطلاعات معاملاتی شرکت به صورت فصلی منتشر می‌شود.' },
  { id: 28, term: 'اعلام ورشکستگی', pronunciation: 'اِعلانِ وَرشکَستگی', category: 'حقوق تجاری', definition: 'اعلام رسمی توقف پرداخت دیون توسط تاجر به مراجع صالحه. پس از اعلام ورشکستگی، اموال تاجر توقیف و اداره ورشکستگی تشکیل می‌شود.', related: ['ورشکستگی', 'تاجر', 'توقیف اموال'], example: 'اعلام ورشکستگی تاجر در روزنامه رسمی منتشر شد.' },
  { id: 29, term: 'سازمان تجارت جهانی', pronunciation: 'سازمانِ تِجارتِ جِهانی', category: 'حقوق بین‌الملل', definition: 'تنها نهاد بین‌المللی که قواعد تجارت بین‌المللی را تنظیم می‌کند. این سازمان در سال ۱۹۹۵ تأسیس شده و هدف آن تسهیل تجارت آزاد و عادلانه بین کشورهاست.', related: ['توافق تجاری', 'تعرفه گمرکی', 'حقوق بین‌الملل'], example: 'ایران عضویت خود را در سازمان تجارت جهانی در حال بررسی دارد.' },
  { id: 30, term: 'کفالت', pronunciation: 'کَفالت', category: 'اصطلاحات عمومی', definition: 'تعهد شخص ثالث برای حضور متهم در جلسات دادرسی و جلوگیری از فرار وی. کفالت یکی از راه‌های آزادی موقت متهم در مرحله تحقیقات مقدماتی است.', related: ['وثیقه', 'بازداشت', 'تحقیقات مقدماتی'], example: 'وکیل توانست با معرفی یک کفیل، آزادی موقت موکل را بگیرد.' },
  { id: 31, term: 'اعتراض ثالث', pronunciation: 'اِعتراضِ ثالِث', category: 'اصطلاحات عمومی', definition: 'دعوایی که شخص ثالث به موجب آن اعتراض خود را نسبت به حکم دادگاه که حقوق او را تضییع کرده اظهار می‌دارد. این دعوای ویژه‌ای است که مستقیماً در دادگاه تجدیدنظر مطرح می‌شود.', related: ['تجدیدنظر', 'حکم دادگاه', 'حقوق ثالث'], example: 'اعتراض ثالث در ظرف یک ماه پس از ابلاغ رأی قابل طرح است.' },
  { id: 32, term: 'سفته', pronunciation: 'سُفتِه', category: 'حقوق تجاری', definition: 'سند تجاری تعهدآمیز که به موجب آن صادرکننده متعهد می‌شود مبلغ معینی را در سررسید مشخص به دارنده سفته پرداخت نماید. سفته از اسناد تجاری مهم و قابل ظهرنویسی است.', related: ['برات', 'چک', 'اسناد تجاری'], example: 'سفته به عنوان تضمین حسن انجام کار به کارفرما داده شد.' },
  { id: 33, term: 'ممنوع‌الخروج', pronunciation: 'مَمنوع‌الخُروج', category: 'اصطلاحات عمومی', definition: 'ممنوعیت خروج شخص از کشور به حکم مقام قضایی یا انتظامی. این محدودیت معمولاً در مواردی مانند بدهی مالی، پرونده‌های کیفری و اتهامات امنیتی اعمال می‌شود.', related: ['بازداشت', 'تعزیر', 'خروج از کشور'], example: 'بدهکار ممنوع‌الخروج شد تا بدهی خود را پرداخت کند.' },
  { id: 34, term: 'وصیت', pronunciation: 'وَصیّت', category: 'حقوق مدنی', definition: 'عقدی که به موجب آن شخص (موصی) تعیین می‌کند که پس از مرگش اموال یا بخشی از آن به شخص یا اشخاص معین (موصی‌له) برسد. وصیت باید در حدود ثلث اموال باشد.', related: ['ارث', 'میراث', 'تملیک'], example: 'مردمک وصیت‌نامه خود را در حضور دو شاهد تنظیم کرد.' },
  { id: 35, term: 'ارث', pronunciation: 'اِرث', category: 'حقوق مدنی', definition: 'انتقال اموال متوفی به ورثه بر اساس قوانین و مقررات شرعی و قانونی. سهم هر یک از ورثه بر اساس نسبت سببی و نسبی با متوفی تعیین می‌گردد.', related: ['وصیت', 'میراث', 'ترکه'], example: 'ارث متوفی بین همسر و فرزندان به نسبت مساوی تقسیم شد.' },
];

// ---- Categories ----
const CATEGORIES = [
  { id: 'all', label: 'همه', icon: BookOpen },
  { id: 'اصطلاحات عمومی', label: 'اصطلاحات عمومی', icon: Scale },
  { id: 'حقوق مدنی', label: 'حقوق مدنی', icon: FileText },
  { id: 'حقوق کیفری', label: 'حقوق کیفری', icon: Gavel },
  { id: 'حقوق تجاری', label: 'حقوق تجاری', icon: Building2 },
  { id: 'حقوق کار', label: 'حقوق کار', icon: Users },
  { id: 'حقوق بین‌الملل', label: 'حقوق بین‌الملل', icon: Globe },
];

// ---- Persian Alphabet ----
const PERSIAN_ALPHABET = [
  'الف', 'ب', 'پ', 'ت', 'ث', 'ج', 'چ', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'ژ',
  'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ک', 'گ', 'ل', 'م',
  'ن', 'و', 'ه', 'ی',
];

const LETTER_MAP: Record<string, string> = {
  'الف': 'ا', 'ب': 'ب', 'پ': 'پ', 'ت': 'ت', 'ث': 'ث', 'ج': 'ج', 'چ': 'چ', 'ح': 'ح',
  'خ': 'خ', 'د': 'د', 'ذ': 'ذ', 'ر': 'ر', 'ز': 'ز', 'ژ': 'ژ', 'س': 'س', 'ش': 'ش',
  'ص': 'ص', 'ض': 'ض', 'ط': 'ط', 'ظ': 'ظ', 'ع': 'ع', 'غ': 'غ', 'ف': 'ف', 'ق': 'ق',
  'ک': 'ک', 'گ': 'گ', 'ل': 'ل', 'م': 'م', 'ن': 'ن', 'و': 'و', 'ه': 'ه', 'ی': 'ی',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function LegalDictionaryPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<LegalTerm | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>(['خلع ید', 'قرارداد کار', 'طلاق']);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  // Word of the day
  const wordOfDay = LEGAL_TERMS[0]; // خلع ید

  // Filtered terms
  const filteredTerms = useMemo(() => {
    return LEGAL_TERMS.filter((term) => {
      const matchCategory = activeCategory === 'all' || term.category === activeCategory;
      const matchLetter = !activeLetter || term.term.startsWith(LETTER_MAP[activeLetter] || '');
      const matchSearch = !search ||
        term.term.includes(search) ||
        term.definition.includes(search) ||
        term.category.includes(search);
      return matchCategory && matchLetter && matchSearch;
    });
  }, [search, activeCategory, activeLetter]);

  // Autocomplete suggestions
  const autocompleteSuggestions = useMemo(() => {
    if (!search || search.length < 1) return [];
    return LEGAL_TERMS.filter(
      (t) => t.term.includes(search) || t.definition.includes(search)
    ).slice(0, 6);
  }, [search]);

  const handleTermClick = useCallback((term: LegalTerm) => {
    setSelectedTerm(term);
    setRecentSearches((prev) => {
      const updated = [term.term, ...prev.filter((s) => s !== term.term)];
      return updated.slice(0, 10);
    });
    setShowAutocomplete(false);
    setSearch('');
  }, []);

  const handleLetterClick = useCallback((letter: string) => {
    setActiveLetter((prev) => prev === letter ? null : letter);
  }, []);

  const clearLetter = useCallback(() => {
    setActiveLetter(null);
  }, []);

  const removeRecentSearch = useCallback((term: string) => {
    setRecentSearches((prev) => prev.filter((s) => s !== term));
  }, []);

  // If a term is selected, show detail view
  if (selectedTerm) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => setSelectedTerm(null)} className="gap-1">
          <ArrowLeft className="w-4 h-4 ml-1" />
          بازگشت به فرهنگ لغات
        </Button>

        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-l from-emerald-600 to-teal-600 -mx-6 -mt-6 px-6 pt-6 pb-5 rounded-b-xl">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                <Scale className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">{selectedTerm.term}</h1>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-emerald-100 text-sm flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5" />
                    {selectedTerm.pronunciation}
                  </span>
                  <Badge className="bg-white/20 text-white border-0 text-[11px]">
                    {selectedTerm.category}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Definition */}
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                تعریف
              </h3>
              <p className="text-sm leading-7 text-foreground/90">{selectedTerm.definition}</p>
            </div>

            <Separator />

            {/* Example */}
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                مثال کاربردی
              </h3>
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                <p className="text-sm leading-7">{selectedTerm.example}</p>
              </div>
            </div>

            <Separator />

            {/* Related Terms */}
            {selectedTerm.related.length > 0 && (
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
                  <Link2 className="w-4 h-4 text-blue-500" />
                  اصطلاحات مرتبط
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTerm.related.map((rel) => {
                    const relatedTerm = LEGAL_TERMS.find((t) => t.term === rel);
                    return (
                      <Badge
                        key={rel}
                        variant="secondary"
                        className="cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors text-xs px-3 py-1"
                        onClick={() => relatedTerm && handleTermClick(relatedTerm)}
                      >
                        {rel}
                        <ChevronLeft className="w-3 h-3 mr-1" />
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold">فرهنگ لغات حقوقی</h1>
          <p className="text-sm text-muted-foreground">
            {toPersianNumber(LEGAL_TERMS.length)} اصطلاح حقوقی · جستجوی آسان و سریع
          </p>
        </div>
      </div>

      {/* Word of the Day */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-l from-amber-500 via-orange-500 to-rose-500 -mx-6 -mt-6 px-6 pt-5 pb-5 rounded-b-xl">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-white/90 text-xs font-medium">کلمه روز</span>
            </div>
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleTermClick(wordOfDay)}>
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white">{wordOfDay.term}</h2>
                <p className="text-white/80 text-xs mt-0.5 line-clamp-1">{wordOfDay.definition}</p>
              </div>
              <ChevronLeft className="w-5 h-5 text-white/60" />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Search Bar */}
      <motion.div variants={itemVariants} className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowAutocomplete(true);
          }}
          onFocus={() => setShowAutocomplete(true)}
          onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
          placeholder="جستجوی اصطلاح حقوقی..."
          className="pr-9 text-sm"
        />
        {/* Autocomplete Dropdown */}
        {showAutocomplete && autocompleteSuggestions.length > 0 && (
          <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg border max-h-64 overflow-y-auto">
            <CardContent className="p-1">
              {autocompleteSuggestions.map((term) => (
                <button
                  key={term.id}
                  className="w-full text-right px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-2"
                  onMouseDown={() => {
                    handleTermClick(term);
                    setSearch('');
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{term.term}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{term.definition.slice(0, 60)}...</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] shrink-0">{term.category}</Badge>
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Recent Searches */}
      {recentSearches.length > 0 && !search && (
        <motion.div variants={itemVariants} className="flex items-center gap-2 flex-wrap">
          <History className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground shrink-0">جستجوهای اخیر:</span>
          {recentSearches.map((term) => {
            const found = LEGAL_TERMS.find((t) => t.term === term);
            return (
              <Badge
                key={term}
                variant="secondary"
                className="cursor-pointer text-xs px-2.5 py-1 group"
                onClick={() => found && handleTermClick(found)}
              >
                {term}
                <X
                  className="w-3 h-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRecentSearch(term);
                  }}
                />
              </Badge>
            );
          })}
        </motion.div>
      )}

      {/* Letter Navigation */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-muted-foreground">فیلتر حرف اول:</span>
          {activeLetter && (
            <Badge variant="outline" className="text-[11px] px-2 py-0 gap-1">
              {activeLetter}
              <X className="w-3 h-3 cursor-pointer" onClick={clearLetter} />
            </Badge>
          )}
        </div>
        <ScrollArea className="w-full" direction="ltr">
          <div className="flex gap-1 flex-nowrap pb-1" dir="ltr">
            {PERSIAN_ALPHABET.map((letter) => {
              const hasTerms = LEGAL_TERMS.some((t) => t.term.startsWith(LETTER_MAP[letter] || ''));
              return (
                <button
                  key={letter}
                  className={`w-9 h-9 rounded-lg text-xs font-medium flex items-center justify-center transition-all shrink-0 ${
                    activeLetter === letter
                      ? 'bg-emerald-600 text-white shadow-md'
                      : hasTerms
                        ? 'bg-muted/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-300 text-foreground'
                        : 'bg-muted/20 text-muted-foreground/40 cursor-not-allowed'
                  }`}
                  onClick={() => hasTerms && handleLetterClick(letter)}
                  disabled={!hasTerms}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </motion.div>

      {/* Category Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="flex-wrap h-auto gap-1">
            {CATEGORIES.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id} className="text-xs gap-1">
                <cat.icon className="w-3.5 h-3.5" />
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Results count */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {toPersianNumber(filteredTerms.length)} اصطلاح یافت شد
          {activeLetter && <span className="mr-1">با حرف «{activeLetter}»</span>}
        </p>
        {(search || activeCategory !== 'all' || activeLetter) && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7 gap-1"
            onClick={() => {
              setSearch('');
              setActiveCategory('all');
              setActiveLetter(null);
            }}
          >
            <X className="w-3 h-3" />
            پاک کردن فیلترها
          </Button>
        )}
      </motion.div>

      {/* Terms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredTerms.map((term) => (
            <motion.div
              key={term.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                className="border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden"
                onClick={() => handleTermClick(term)}
              >
                <CardContent className="p-4 space-y-3">
                  {/* Term Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {term.term}
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Volume2 className="w-3 h-3" />
                        {term.pronunciation}
                      </p>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                      <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>

                  {/* Category Badge */}
                  <Badge variant="secondary" className="text-[10px] px-2 py-0">
                    {term.category}
                  </Badge>

                  {/* Definition */}
                  <p className="text-xs leading-6 text-muted-foreground line-clamp-2">{term.definition}</p>

                  {/* Related Terms */}
                  {term.related.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-muted-foreground">مرتبط:</span>
                      {term.related.slice(0, 3).map((rel) => (
                        <span key={rel} className="text-[10px] text-emerald-600 dark:text-emerald-400">
                          {rel}
                          {rel !== term.related.slice(0, 3).at(-1) && '،'}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Example */}
                  <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/50">
                    <p className="text-[11px] leading-5 text-amber-800 dark:text-amber-200">{term.example}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredTerms.length === 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <Search className="w-7 h-7 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">اصطلاحی یافت نشد</p>
              <p className="text-xs text-muted-foreground/60 mt-1">عبارت جستجو یا فیلترها را تغییر دهید</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
