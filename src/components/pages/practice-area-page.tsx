'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useInView } from 'framer-motion';
import {
  Scale, Gavel, HeartHandshake, Building2, Briefcase, Globe2, Landmark, FileText,
  ArrowRight, ArrowLeft, PhoneCall, Shield, Clock, Star, CheckCircle2, Users, BadgeCheck, Quote,
  Phone, MessageCircle, Video, UserCheck, FileCheck, TrendingUp, Award,
  BookOpen, Zap, Lock, Eye, Target, Lightbulb, ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';

// ============ ICON MAP ============
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'حقوقی و مدنی': Scale,
  'کیفری': Gavel,
  'خانواده': HeartHandshake,
  'تجاری و شرکتی': Building2,
  'کار و تامین اجتماعی': Briefcase,
  'مهاجرت': Globe2,
  'مالیات': Landmark,
  'مالکیت فکری': FileText,
};

// ============ GRADIENT MAP ============
const gradientMap: Record<string, string> = {
  'حقوقی و مدنی': 'from-emerald-600 to-teal-700',
  'کیفری': 'from-red-600 to-rose-700',
  'خانواده': 'from-pink-600 to-rose-600',
  'تجاری و شرکتی': 'from-blue-600 to-indigo-700',
  'کار و تامین اجتماعی': 'from-amber-500 to-orange-600',
  'مهاجرت': 'from-cyan-600 to-sky-700',
  'مالیات': 'from-violet-600 to-purple-700',
  'مالکیت فکری': 'from-teal-600 to-emerald-700',
};

const lightGradientMap: Record<string, string> = {
  'حقوقی و مدنی': 'from-emerald-50 to-teal-50',
  'کیفری': 'from-red-50 to-rose-50',
  'خانواده': 'from-pink-50 to-rose-50',
  'تجاری و شرکتی': 'from-blue-50 to-indigo-50',
  'کار و تامین اجتماعی': 'from-amber-50 to-orange-50',
  'مهاجرت': 'from-cyan-50 to-sky-50',
  'مالیات': 'from-violet-50 to-purple-50',
  'مالکیت فکری': 'from-teal-50 to-emerald-50',
};

const accentMap: Record<string, string> = {
  'حقوقی و مدنی': 'text-emerald-600 dark:text-emerald-400',
  'کیفری': 'text-red-600 dark:text-red-400',
  'خانواده': 'text-pink-600 dark:text-pink-400',
  'تجاری و شرکتی': 'text-blue-600 dark:text-blue-400',
  'کار و تامین اجتماعی': 'text-amber-600 dark:text-amber-400',
  'مهاجرت': 'text-cyan-600 dark:text-cyan-400',
  'مالیات': 'text-violet-600 dark:text-violet-400',
  'مالکیت فکری': 'text-teal-600 dark:text-teal-400',
};

const bgAccentMap: Record<string, string> = {
  'حقوقی و مدنی': 'bg-emerald-500/10',
  'کیفری': 'bg-red-500/10',
  'خانواده': 'bg-pink-500/10',
  'تجاری و شرکتی': 'bg-blue-500/10',
  'کار و تامین اجتماعی': 'bg-amber-500/10',
  'مهاجرت': 'bg-cyan-500/10',
  'مالیات': 'bg-violet-500/10',
  'مالکیت فکری': 'bg-teal-500/10',
};

const borderAccentMap: Record<string, string> = {
  'حقوقی و مدنی': 'border-emerald-500/20 hover:border-emerald-500/40',
  'کیفری': 'border-red-500/20 hover:border-red-500/40',
  'خانواده': 'border-pink-500/20 hover:border-pink-500/40',
  'تجاری و شرکتی': 'border-blue-500/20 hover:border-blue-500/40',
  'کار و تامین اجتماعی': 'border-amber-500/20 hover:border-amber-500/40',
  'مهاجرت': 'border-cyan-500/20 hover:border-cyan-500/40',
  'مالیات': 'border-violet-500/20 hover:border-violet-500/40',
  'مالکیت فکری': 'border-teal-500/20 hover:border-teal-500/40',
};

// ============ AREA DATA ============
interface AreaData {
  heroDesc: string;
  intro: string;
  services: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }[];
  process: { step: number; title: string; desc: string }[];
  stats: { value: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
  faqs: { q: string; a: string }[];
  relatedAreas: string[];
}

const areasData: Record<string, AreaData> = {
  'حقوقی و مدنی': {
    heroDesc: 'مشاوره تخصصی در دعاوی ملکی، قراردادها، مطالبه وجه، اجرای اسناد و تمامی امور حقوقی و مدنی',
    intro: 'دعاوی حقوقی و مدنی شامل گستره وسیعی از اختلافات بین اشخاص حقیقی و حقوقی است. از دعاوی ملکی و قراردادها گرفته تا مطالبه وجه و چک برگشتی، اسناد تجاری، الزام به ایفای تعهد و سایر موارد حقوقی. تیم وکلای متخصص لِگال‌هاب با سال‌ها تجربه در محاکم قضایی، بهترین راهکار حقوقی را برای شما ارائه می‌دهد. ما با بررسی دقیق مدارک و شواهد، احتمال موفقیت پرونده شما را افزایش داده و در تمامی مراحل دادرسی همراه شما هستیم.',
    services: [
      { icon: FileCheck, title: 'دعاوی ملکی', desc: 'خلع ید، تصرف عدوانی، کلاسه‌بندی املاک، tranhات مالکیت، تفکیک و افراز ملک و الزام به تنظیم سند رسمی' },
      { icon: ClipboardList, title: 'دعاوی قراردادی', desc: 'بطلان قرارداد، فسخ قرارداد، الزام به ایفای تعهد، جبران خسارت قراردادی و دعاوی پیمانکاری' },
      { icon: BookOpen, title: 'مطالبه وجه و چک', desc: 'وصول مطالبات، مطالبه وجه، مطالبه وجه چک و سفته، رسید judicial و دعاوی اسناد تجاری' },
      { icon: Scale, title: 'اجرای احکام', desc: 'اجرای مفاد اسناد رسمی، اجرای آرای دادگاه، توقیف اموال و فروش اموال توقیفی' },
      { icon: Shield, title: 'حقوق مصرف‌کننده', desc: 'دعاوی علیه شرکت‌ها، تخلفات تولیدی و خدماتی، تقلب و کلاهبرداری، ضمانت محصولات' },
      { icon: Users, title: 'حقوق شخصی', desc: 'تغییر نام و نام خانوادگی، صدور گواهی عدم سوءپیشینه، اقامت و شهادت‌نامه، امور حسبی' },
    ],
    process: [
      { step: 1, title: 'ثبت درخواست', desc: 'فرم مشاوره را تکمیل کنید و مدارک خود را آپلود نمایید' },
      { step: 2, title: 'بررسی اولیه', desc: 'وکیل متخصص مدارک شما را بررسی و نظر مشورتی اولیه ارائه می‌دهد' },
      { step: 3, title: 'جلسه مشاوره', desc: 'جلسه مشاوره حضوری یا آنلاین برای بررسی کامل پرونده و تعیین استراتژی' },
      { step: 4, title: 'تنظیم لایحه', desc: 'تنظیم لایحه دفاعیه و شکواییه و پیگیری مراحل ثبتی دعوی' },
      { step: 5, title: 'پیگیری دادرسی', desc: 'حضور در جلسات دادگاه، پیگیری روند دادرسی و ارائه گزارش دوره‌ای' },
    ],
    stats: [
      { value: '+۲,۵۰۰', label: 'پرونده موفق', icon: CheckCircle2 },
      { value: '۹۸٪', label: 'رضایت‌مندی', icon: Star },
      { value: '+۳۰', label: 'وکیل متخصص', icon: BadgeCheck },
      { value: '+۵', label: 'سال تجربه میانگین', icon: Award },
    ],
    faqs: [
      { q: 'هزینه وکیل برای دعاوی ملکی چقدر است؟', a: 'هزینه وکیل بسته به نوع دعوی، ارزش خواسته و پیچیدگی پرونده متفاوت است. در جلسه مشاوره اول رایگان، هزینه تقریبی به شما اعلام می‌شود. ما تعرفه منصفانه و شفاف داریم.' },
      { q: 'آیا می‌توانم بدون مراجعه حضوری پرونده خود را ثبت کنم؟', a: 'بله، تمامی مراحل از ثبت درخواست تا مشاوره اولیه به صورت آنلاین قابل انجام است. مدارک را از طریق پنل کاربری آپلود کنید و مشاوره آنلاین بگیرید.' },
      { q: 'مدت زمان رسیدگی به دعاوی حقوقی چقدر است؟', a: 'بسته به نوع دعوی و شعبه دادگاه، مدت زمان متفاوت است. دعاوی.simple معمولاً ۳ تا ۶ ماه و دعاوی پیچیده ممکن است تا یک سال طول بکشد.' },
      { q: 'آیا در صورت شکست در دعوی، هزینه وکیل برگردانده می‌شود؟', a: 'در قراردادهای حقوقی ما، هزینه مشاوره و تنظیم لایحه در صورت عدم موفقیت بازگردانده می‌شود. این تضمین نشان‌دهنده اعتماد ما به کیفیت خدماتمان است.' },
      { q: 'تفاوت دعوای حقوقی و کیفری چیست؟', a: 'دعوای حقوقی مربوط به اختلافات مالی و مدنی بین اشخاص است و هدف اصلی آن جبران خسارت است. دعوای کیفری مربوط به جرایم و مجازات‌هاست و مقام دادستان در آن نقش دارد.' },
    ],
    relatedAreas: ['کیفری', 'ملکی', 'تجاری و شرکتی'],
  },
  'کیفری': {
    heroDesc: 'دفاع تخصصی در دعاوی کیفری، جرایم اقتصادی، کلاهبرداری و تمامی امور جنایی',
    intro: 'دعاوی کیفری از حساس‌ترین و مهم‌ترین پرونده‌های حقوقی هستند که آزادی، آبرو و سرنوشت افراد را تحت تأثیر قرار می‌دهند. تیم وکلای کیفری لِگال‌هاب با تخصص و تجربه فراوان در دفاع از متهمان و شاکیان، بهترین خط دفاعی را طراحی می‌کند. از جرایم مالیاتی و اقتصادی گرفته تا سرقت، کلاهبرداری، جرایم سایبری و قتل، ما با جدیت تمام از حقوق شما دفاع می‌کنیم. اولویت ما حفظ آزادی و آبروی موکلین و دستیابی به بهترین نتیجه ممکن در کمترین زمان است.',
    services: [
      { icon: Gavel, title: 'جرایم مالی', desc: 'کلاهبرداری، خیانت در امانت، صدور چک بلامحل، اختلاس و جرایم مالی و بانکی' },
      { icon: Shield, title: 'جرایم اقتصادی', desc: 'قاچاق، ارزابری، پولشویی، فرار مالیاتی و سایر جرایم اقتصادی کلان' },
      { icon: Eye, title: 'جرایم سایبری', desc: 'هک، سرقت اطلاعات، جعل رایانه‌ای، کلاهبرداری اینترنتی و حریم خصوصی' },
      { icon: Lock, title: 'جرایم علیه اشخاص', desc: 'ضرب و جرح، تهدید، آزار و اذیت، مزاحمت، افترا و تهمت و نشر اکاذیب' },
      { icon: Scale, title: 'بازجویی و دادرسی', desc: 'حضور در بازجویی‌ها، تحقیقات مقدماتی، جلسات دادگاه و ارائه دفاعیات' },
      { icon: FileCheck, title: 'اعتراض نظر', desc: 'اعتراض به رأی دادگاه، تجدیدنظرخواهی، فرجام‌خواهی و واخواهی در آرای کیفری' },
    ],
    process: [
      { step: 1, title: 'مشاوره فوری', desc: 'در پرونده‌های کیفری زمان اهمیت بالایی دارد. مشاوره فوری تلفنی یا حضوری' },
      { step: 2, title: 'بررسی دقیق', desc: 'بررسی اتهامات، مدارک و شواهد با دقت و حساسیت ویژه' },
      { step: 3, title: 'طراحی دفاع', desc: 'طراحی استراتژی دفاعی و آماده‌سازی لایحه دفاعیه' },
      { step: 4, title: 'پیگیری دادرسی', desc: 'حضور در جلسات دادگاه، دادسرا و بازجویی‌ها' },
      { step: 5, title: 'پیگیری نتیجه', desc: 'پیگیری صدور رأی و در صورت نیاز اعتراض و تجدیدنظر' },
    ],
    stats: [
      { value: '+۱,۸۰۰', label: 'پرونده کیفری', icon: CheckCircle2 },
      { value: '۹۵٪', label: 'تخفیف مجازات', icon: Star },
      { value: '+۲۰', label: 'وکیل جنایی', icon: BadgeCheck },
      { value: '+۱۰', label: 'سال تجربه', icon: Award },
    ],
    faqs: [
      { q: 'در صورت دستگیری، چه اقدامی باید انجام دهم؟', a: 'در اولین فرصت با وکیل کیفری ما تماس بگیرید. حضور وکیل در مراحل بازجویی بسیار حیاتی است و می‌تواند از حقوق شما محافظت کند. ما خدمات مشاوره فوری ۲۴ ساعته ارائه می‌دهیم.' },
      { q: 'تفاوت شاکی و متهم چیست؟', a: 'شاکی شخصی است که جرمی را گزارش می‌دهد و خواهان مجازات مجرم است. متهم کسی است که به ارتکاب جرم متهم شده. در بسیاری از جرایم، فرد می‌تواند همزمان شاکی و متهم باشد.' },
      { q: 'آیا امکان آزادی موقت با وثیقه وجود دارد؟', a: 'بله، در بیشتر جرایم غیرعمد و جرایم با مجازات کمتر از سه سال حبس، امکان آزادی با وثیقه یا کفالت وجود دارد. وکیل ما برای صدور قرار آزادی موقت اقدام می‌کند.' },
      { q: 'هزینه وکیل کیفری چگونه محاسبه می‌شود؟', a: 'هزینه بستگی به نوع جرم، مرحله دادرسی و پیچیدگی پرونده دارد. در مشاوره اول رایگان، هزینه دقیق اعلام می‌شود. امکان پرداخت اقساطی نیز وجود دارد.' },
      { q: 'آیا در صورت رأی بد، امکان تجدیدنظر وجود دارد؟', a: 'بله، تمامی آرای کیفری قابل اعتراض و تجدیدنظر هستند. ما در مرحله تجدیدنظرخواهی نیز همراه شما هستیم و تا حصول نتیجه نهایی پرونده را پیگیری می‌کنیم.' },
    ],
    relatedAreas: ['حقوقی و مدنی', 'حقوقی و مدنی', 'مالکیت فکری'],
  },
  'خانواده': {
    heroDesc: 'مشاوره تخصصی در امور خانواده، طلاق، مهریه، حضانت فرزند و نفقه',
    intro: 'دعاوی خانواده از عاطفی‌ترین و حساس‌ترین پرونده‌های حقوقی هستند که مستقیماً با زندگی شخصی و خانوادگی افراد سروکار دارند. تیم وکلای متخصص خانواده لِگال‌هاب با درک کامل حساسیت این پرونده‌ها، با همدلی و حرفه‌ای‌گری کامل همراه شما هستند. چه در بحث طلاق توافقی یا از一方، چه در دعاوی حضانت و نفقه، ما تلاش می‌کنیم بهترین نتیجه را با کمترین تنش و آسیب عاطفی برای شما و خانواده‌تان به ارمغان بیاوریم.',
    services: [
      { icon: HeartHandshake, title: 'طلاق توافقی', desc: 'تنظیم توافقنامه طلاق، تعیین حقوق مالی، حضانت فرزند و مهریه با کمترین تنش' },
      { icon: Scale, title: 'طلاق از یک طرف', desc: 'پرونده‌های طلاق بدون توافق، اثبات عسر و حرج، سوءرفتار و عدم پرداخت نفقه' },
      { icon: Users, title: 'حضانت فرزند', desc: 'دعوای حضانت، ملاقات فرزند، تغییر حضانت و حق مخارج فرزند' },
      { icon: FileCheck, title: 'مهریه و نفقه', desc: 'وصول مهریه، مطالبه نفقه، اجرت‌المثل و دعاوی مالی مربوط به خانواده' },
      { icon: Shield, title: 'نکاح و ازدواج', desc: 'تنظیم عقدنامه، شرایط ضمن عقد، شروط خاص و دعاوی ناشی از عقد نکاح' },
      { icon: BookOpen, title: 'وصیت و ارث', desc: 'ارث و میراث، وصیت‌نامه، حصر وراثت، تقسیم ترکه و دعاوی ارثی' },
    ],
    process: [
      { step: 1, title: 'مشاوره محرمانه', desc: 'جلسه محرمانه برای بررسی شرایط خانوادگی و تعیین بهترین راهکار' },
      { step: 2, title: 'بررسی گزینه‌ها', desc: 'بررسی تمامی راه‌حل‌ها از مذاکره و میانجی‌گری تا پیگیری قضایی' },
      { step: 3, title: 'تنظیم شکواییه', desc: 'تنظیم دادخواست یا توافقنامه و ثبت در سامانه ثبتی' },
      { step: 4, title: 'جلسات دادگاه', desc: 'حضور در دادگاه خانواده و دفاع از حقوق شما' },
      { step: 5, title: 'نتیجه‌گیری', desc: 'پیگیری صدور حکم و اجرای آن و در صورت نیاز اعتراض' },
    ],
    stats: [
      { value: '+۳,۲۰۰', label: 'پرونده خانواده', icon: CheckCircle2 },
      { value: '۹۷٪', label: 'رضایت‌مندی', icon: Star },
      { value: '+۲۵', label: 'وکیل خانواده', icon: BadgeCheck },
      { value: '۷۰٪', label: 'توافقی حل‌شده', icon: Award },
    ],
    faqs: [
      { q: 'تفاوت طلاق توافقی و از یک طرف چیست؟', a: 'طلاق توافقی زمانی است که هر دو طرف به طلاق رضایت دارند و درباره مسائل مالی و حضانت توافق کرده‌اند. طلاق از یک طرف زمانی است که تنها یکی از زوجین تقاضای طلاق دارد و باید دلایل و مستندات محکمه‌پسند ارائه شود.' },
      { q: 'مهریه چگونه وصول می‌شود؟', a: 'بسته به نوع وثیقه مهریه (سند ملکی، چک، ضمانت شخص و...) روش وصول متفاوت است. وکلای ما بهترین روش وصول را با کمترین هزینه و زمان برای شما تعیین می‌کنند.' },
      { q: 'شرایط گرفتن حضانت فرزند چیست؟', a: 'حضانت فرزند تا ۷ سالگی با مادر و پس از آن با پدر است. دادگاه در صورت وجود دلیل موجه (مانند اعتیاد، سوءرفتار یا عدم صلاحیت) می‌تواند حکم به تغییر حضانت بدهد.' },
      { q: 'آیا مشاوره خانوادگی رایگان است؟', a: 'اولین جلسه مشاوره ۱۵ دقیقه‌ای رایگان است. همچنین در پرونده‌های طلاق توافقی، مشاوره اولیه رایگان ارائه می‌شود.' },
      { q: 'مدت زمان رسیدگی به پرونده خانواده چقدر است؟', a: 'طلاق توافقی معمولاً ۱ تا ۳ ماه و طلاق از یک طرف ۳ تا ۹ ماه طول می‌کشد. دعاوی حضانت و نفقه نیز بین ۲ تا ۶ ماه زمان نیاز دارند.' },
    ],
    relatedAreas: ['حقوقی و مدنی', 'حقوقی و مدنی'],
  },
  'تجاری و شرکتی': {
    heroDesc: 'مشاوره حقوقی شرکت‌ها، ثبت شرکت، قراردادهای تجاری و دعاوی شرکتی',
    intro: 'امور حقوقی شرکت‌ها و کسب‌وکارها نیازمند دانش تخصصی حقوق تجارت و تجربه عملی در مدیریت ریسک‌های حقوقی است. تیم وکلای تجاری لِگال‌هاب با تسلط کامل بر قانون تجارت، قانون شرکت‌ها و رویه‌های قضایی، خدمات جامع حقوقی به شرکت‌ها، استارتاپ‌ها و کسب‌وکارها ارائه می‌دهد. از ثبت شرکت و تنظیم اساسنامه گرفته تا قراردادهای تجاری بین‌المللی، ادغام شرکت‌ها و حل اختلافات شرکتی، ما شریک حقوقی مطمئن شما هستیم.',
    services: [
      { icon: Building2, title: 'ثبت شرکت', desc: 'ثبت انواع شرکت‌ها (سهامی، مسئولیت محدود، تعاونی)، تغییرات شرکت و انحلال' },
      { icon: FileCheck, title: 'قراردادهای تجاری', desc: 'تنظیم و بررسی قراردادهای تجاری، نمایندگی، پیمانکاری، اجاره و فروش' },
      { icon: Scale, title: 'حل اختلاف شرکتی', desc: 'دعاوی بین شرکا، اخراج شریک، تقسیم سود و منافع و انحلال شرکت' },
      { icon: TrendingUp, title: 'حقوق استارتاپ', desc: 'ثبت استارتاپ، جذب سرمایه، قراردادهای فناوری و حفاظت از دارایی فکری' },
      { icon: Globe2, title: 'تجارت بین‌الملل', desc: 'قراردادهای بین‌المللی، واردات و صادرات، اعتبارات اسنادی و دیپلماسی تجاری' },
      { icon: Shield, title: 'رعایت قانون', desc: 'انطباق با قوانین تجاری، مالیاتی و نظارتی و پیشگیری از ریسک‌های حقوقی' },
    ],
    process: [
      { step: 1, title: 'تحلیل نیاز', desc: 'بررسی نوع فعالیت و نیازهای حقوقی شرکت شما' },
      { step: 2, title: 'مشاوره اولیه', desc: 'ارائه مشاوره حقوقی در مورد ساختار حقوقی و ریسک‌ها' },
      { step: 3, title: 'تنظیم اسناد', desc: 'تنظیم اساسنامه، قراردادها و سایر اسناد حقوقی' },
      { step: 4, title: 'ثبت رسمی', desc: 'ثبت در مراجع ذی‌صلاح و اخذ مجوزهای لازم' },
      { step: 5, title: 'پشتیبانی مستمر', desc: 'مشاوره مستمر و به‌روزرسانی امور حقوقی شرکت' },
    ],
    stats: [
      { value: '+۱,۵۰۰', label: 'مشتری حقوقی', icon: CheckCircle2 },
      { value: '۹۶٪', label: 'رضایت‌مندی', icon: Star },
      { value: '+۴۰۰', label: 'ثبت شرکت', icon: BadgeCheck },
      { value: '+۸', label: 'سال تجربه', icon: Award },
    ],
    faqs: [
      { q: 'انواع شرکت‌ها در ایران کدامند؟', a: 'شرکت‌های سهامی عام و خاص، شرکت‌های مسئولیت محدود، تضامنی، نسبی، مختلط غیرسهامی و مختلط سهامی، تعاونی تولید و مصرف. هر نوع مزایا و محدودیت‌های خاص خود را دارد.' },
      { q: 'هزینه ثبت شرکت چقدر است؟', a: 'هزینه ثبت شرکت بستگی به نوع شرکت، سرمایه اولیه و خدمات اضافی دارد. در مشاوره رایگان، هزینه دقیق اعلام می‌شود.' },
      { q: 'آیا می‌توانم شرکت خودم را بدون وکیل ثبت کنم؟', a: 'از نظر قانونی بله، اما به دلیل پیچیدگی مراحل ثبتی و نیاز به آشنایی با قوانین، استفاده از وکیل متخصص به‌شدت توصیه می‌شود.' },
      { q: 'تفاوت شرکت سهامی و مسئولیت محدود چیست؟', a: 'شرکت سهامی سرمایه به سهام تقسیم شده و مسئولیت شرکا محدود به مبلغ سهام آنهاست. در شرکت مسئولیت محدود، مسئولیت شرکا به مبلغ سرمایه ثبت‌شده محدود است و سهام ندارد.' },
      { q: 'آیا خدمات حقوقی استارتاپ ارائه می‌دهید؟', a: 'بله، ما پکیج اختصاصی حقوقی برای استارتاپ‌ها شامل ثبت شرکت، تنظیم قراردادهای فاوندر، حفاظت از دارایی فکری و مشاوره جذب سرمایه ارائه می‌دهیم.' },
    ],
    relatedAreas: ['حقوقی و مدنی', 'مالکیت فکری', 'مالیات'],
  },
  'کار و تامین اجتماعی': {
    heroDesc: 'دفاع از حقوق کارگران و کارفرمایان، بیمه تامین اجتماعی و دعاوی کار',
    intro: 'حقوق کار و تامین اجتماعی یکی از مهم‌ترین شاخه‌های حقوقی است که مستقیماً بر زندگی روزمره میلیون‌ها نفر تأثیر می‌گذارد. تیم وکلای متخصص حقوق کار لِگال‌هاب با تسلط بر قانون کار، قانون تامین اجتماعی و آرای هیئت تشخیص و حل اختلاف، خدمات جامع حقوقی به کارگران و کارفرمایان ارائه می‌دهد. چه در بحث قرارداد کار و بیمه باشید، چه در دعوای اخراج یا مطالبه حقوق معوقه، ما با تعهد به عدالت و حقوق قانونی شما دفاع می‌کنیم.',
    services: [
      { icon: Briefcase, title: 'قرارداد کار', desc: 'تنظیم و بررسی قرارداد کار، تمدید و فسخ قرارداد و شرایط ضمن عقد کار' },
      { icon: Users, title: 'اخراج و اعتراض', desc: 'اعتراض به اخراج غیرقانونی، درخواست بازگشت به کار و مطالبه حقوق' },
      { icon: FileCheck, title: 'حقوق و مزایا', desc: 'مطالبه حقوق معوقه، اضافه‌کاری، پاداش، سنوات و عیدی' },
      { icon: Shield, title: 'بیمه و تامین اجتماعی', desc: 'دعاوی بیمه‌ای، تصادفات ناشی از کار، مزایای بازنشستگی و ازکارافتادگی' },
      { icon: Scale, title: 'تعاون و کارگری', desc: 'تشکیل و اداره تعاونی‌ها، دعاوی اعضای تعاونی و مسائل کارگاهی' },
      { icon: BookOpen, title: 'ایمنی کار', desc: 'حقوق ایمنی کارگران، حوادث کارگاهی، مسئولیت کارفرما و بازرسی کار' },
    ],
    process: [
      { step: 1, title: 'مشاوره اولیه', desc: 'بررسی وضعیت شغلی و شناسایی حقوق قانونی شما' },
      { step: 2, title: 'جمع‌آوری مدارک', desc: 'آماده‌سازی قرارداد کار، فیش حقوقی و سایر مدارک' },
      { step: 3, title: 'تفاهم اولیه', desc: 'تلاش برای حل توافقی با کارفرما قبل از اقدام قضایی' },
      { step: 4, title: 'دادخواست', desc: 'تنظیم و ثبت دادخواست در هیئت تشخیص و حل اختلاف' },
      { step: 5, title: 'پیگیری', desc: 'حضور در جلسات رسیدگی و پیگیری صدور و اجرای رأی' },
    ],
    stats: [
      { value: '+۱,۲۰۰', label: 'پرونده کار', icon: CheckCircle2 },
      { value: '۹۴٪', label: 'رضایت‌مندی', icon: Star },
      { value: '+۱۵', label: 'وکیل کار', icon: BadgeCheck },
      { value: '۸۰٪', label: 'توافقی حل‌شده', icon: Award },
    ],
    faqs: [
      { q: 'آیا اخراج بدون دلیل قانونی است؟', a: 'خیر، اخراج کارگر باید طبق ماده ۲۷ قانون کار و با رعایت شرایط قانونی باشد. اخراج غیرقانونی قابل اعتراض و پیگیری قضایی است و کارگر حق مطالبه خسارت را دارد.' },
      { q: 'حقوق معوقه چگونه وصول می‌شود؟', a: 'با مراجعه به هیئت تشخیص اداره کار و ارائه مدارک (قرارداد کار، فیش حقوقی)، حقوق معوقه قابل مطالبه و وصول است.' },
      { q: 'آیا بیمه اجباری است؟', a: 'بله، طبق قانون تمامی کارگران مشمول بیمه تامین اجتماعی اجباری هستند. عدم بیمه کردن کارگر توسط کارفرما جرم محسوب می‌شود.' },
      { q: 'تفاوت قرارداد موقت و دائم چیست؟', a: 'قرارداد دائم بدون محدودیت زمانی است و کارفرما نمی‌تواند به دلخل ساده آن را فسخ کند. قرارداد موقت برای مدت محدود منعقد می‌شود و پس از پایان مدت، در صورت ادامه کار تبدیل به قرارداد دائم می‌شود.' },
      { q: 'هزینه وکیل کار چقدر است؟', a: 'هزینه وکیل کار معمولاً بر اساس حقوق معوقه محاسبه می‌شود. ما در مشاوره اول رایگان، هزینه دقیق را اعلام می‌کنیم. امکان پرداخت پس از موفقیت نیز وجود دارد.' },
    ],
    relatedAreas: ['حقوقی و مدنی', 'حقوقی و مدنی'],
  },
  'مهاجرت': {
    heroDesc: 'مشاوره تخصصی مهاجرت قانونی، ویزا، اقامت و شهروندی در کشورهای مختلف',
    intro: 'مهاجرت یکی از مهم‌ترین تصمیمات زندگی است که نیازمند مشاوره دقیق و آگاهی کامل از قوانین مهاجرتی کشور مقصد است. تیم وکلای مهاجرتی لِگال‌هاب با همکاری با شبکه وکلای بین‌المللی، خدمات جامع مشاوره مهاجرتی برای کشورهای کانادا، آمریکا، استرالیا، اروپا و سایر کشورها ارائه می‌دهد. از ثبت درخواست ویزا و اقامت گرفته تا شهروندی، ما در تمامی مراحل همراه شما هستیم.',
    services: [
      { icon: Globe2, title: 'ویزای تحصیلی', desc: 'پذیرش تحصیلی، ویزای دانشجویی، بورسیه و فرآیند اخذ پذیرش از دانشگاه‌های معتبر' },
      { icon: Briefcase, title: 'ویزای کاری', desc: 'ویزای کار تخصصی، جاب‌آفر، نامزدی استانی و فرصت‌های کاری بین‌المللی' },
      { icon: HeartHandshake, title: 'ویزای سرمایه‌گذاری', desc: 'ویزای سرمایه‌گذاری، ثبت شرکت خارجی و برنامه‌های نوآوری و استارتاپی' },
      { icon: Users, title: 'ویزای خانوادگی', desc: 'حمایت خانوادگی، پیوستن به همسر یا والدین و ویزای توریستی خانوادگی' },
      { icon: FileCheck, title: 'اقامت و شهروندی', desc: 'اقامت دائم، شهروندی، پاسپورت دوم و برنامه‌های اقامت طلایی' },
      { icon: Shield, title: 'پناهندگی و پناهجوی', desc: 'پناهندگی قانونی، حمایت از پناهجویان و پیگیری پرونده‌های پناهندگی' },
    ],
    process: [
      { step: 1, title: 'ارزیابی رایگان', desc: 'بررسی شرایط شما و تعیین بهترین مسیر مهاجرتی' },
      { step: 2, title: 'انتخاب مسیر', desc: 'انتخاب بهترین روش مهاجرت: تحصیلی، کاری، سرمایه‌گذاری یا خانوادگی' },
      { step: 3, title: 'آماده‌سازی مدارک', desc: 'جمع‌آوری و ترجمه مدارک و آماده‌سازی فرم‌ها' },
      { step: 4, title: 'ثبت درخواست', desc: 'ثبت درخواست ویزا یا اقامت و پیگیری پرونده' },
      { step: 5, title: 'همراهی', desc: 'آماده‌سازی برای مصاحبه و مهاجرت و خدمات پس از ورود' },
    ],
    stats: [
      { value: '+۹۰۰', label: 'پرونده مهاجرت', icon: CheckCircle2 },
      { value: '۹۳٪', label: 'موفقیت ویزا', icon: Star },
      { value: '+۳۰', label: 'کشور مقصد', icon: BadgeCheck },
      { value: '+۶', label: 'سال تجربه', icon: Award },
    ],
    faqs: [
      { q: 'بهترین کشور برای مهاجرت کدام است؟', a: 'بهترین کشور بستگی به شرایط شما (سن، تحصیلات، زبان، سرمایه و هدف) دارد. کانادا و استرالیا برای متخصصان، آلمان برای تحصیلی و پرتغال برای سرمایه‌گذاری گزینه‌های محبوب هستند.' },
      { q: 'هزینه مهاجرت چقدر است؟', a: 'هزینه بستگی به کشور مقصد، نوع ویزا و خدمات مورد نیاز دارد. در مشاوره اول رایگان، هزینه تقریبی و برنامه مالی به شما ارائه می‌شود.' },
      { q: 'آیا تضمین اخذ ویزا وجود دارد؟', a: 'هیچ وکیلی نمی‌تواند تضمین ۱۰۰٪ اخذ ویزا بدهد، اما ما با تجربه فراوان و آماده‌سازی حرفه‌ای مدارک، شانس موفقیت شما را به حداکثر می‌رسانیم.' },
      { q: 'مدت زمان فرآیند مهاجرت چقدر است؟', a: 'از ۳ ماه برای ویزای توریستی تا ۲ سال برای اقامت و شهروندی بسته به کشور و نوع درخواست متفاوت است.' },
      { q: 'آیا می‌توانم همزمان برای چند کشور اقدام کنم؟', a: 'بله، شما می‌توانید همزمان برای چند کشور درخواست دهید. ما بهترین استراتژی چندگانه را برای افزایش شانس موفقیت طراحی می‌کنیم.' },
    ],
    relatedAreas: ['حقوقی و مدنی', 'تجاری و شرکتی'],
  },
  'مالیات': {
    heroDesc: 'مشاوره تخصصی مالیاتی، دعاوی مالیاتی، تخفیف جرائم و برنامه‌ریزی مالیاتی',
    intro: 'امور مالیاتی یکی از پیچیده‌ترین و حساس‌ترین حوزه‌های حقوقی برای کسب‌وکارها و اشخاص حقیقی است. تیم وکلای مالیاتی لِگال‌هاب با تسلط کامل بر قوانین مالیاتی، رویه‌های سازمان امور مالیاتی و آرای هیئت‌های حل اختلاف، خدمات جامع مالیاتی ارائه می‌دهد. از برنامه‌ریزی مالیاتی و مشاوره قبل از عملیات مالیاتی گرفته تا دعاوی مالیاتی و اخذ تخفیف جرائم، ما بهترین راهکار مالیاتی را برای شما ارائه می‌دهیم.',
    services: [
      { icon: Landmark, title: 'دعاوی مالیاتی', desc: 'اعتراض به تشخیص مالیات، رسیدگی هیئت‌های حل اختلاف و دیوان عدالت اداری' },
      { icon: FileCheck, title: 'برنامه‌ریزی مالیاتی', desc: 'بهینه‌سازی ساختار مالیاتی، کاهش تعهدات مالیاتی قانونی و برنامه‌ریزی بلندمدت' },
      { icon: Scale, title: 'تخفیف جرائم', desc: 'درخواست بخشش جرائم مالیاتی، تقسیط بدهی مالیاتی و تسهیل شرایط پرداخت' },
      { icon: Building2, title: 'مالیات شرکت‌ها', desc: 'مشاوره مالیاتی شرکت‌ها، ارزش افزوده، مالیات عملکرد و نقل و انتقال سهام' },
      { icon: Shield, title: 'مالیات اشخاص', desc: 'مالیات بر درآمد اشخاص حقیقی، اجاره، مشاغل و مستغلات' },
      { icon: BookOpen, title: 'انتقال ارث', desc: 'مالیات بر ارث، انتقال سهام و اموال و مالیات شغل اشخاص متوفی' },
    ],
    process: [
      { step: 1, title: 'بررسی وضعیت', desc: 'بررسی اوراق مالیاتی و شناسایی ریسک‌ها و فرصت‌ها' },
      { step: 2, title: 'مشاوره تخصصی', desc: 'ارائه مشاوره مالیاتی و تعیین بهترین استراتژی' },
      { step: 3, title: 'عملیات مالیاتی', desc: 'ثبت اظهارنامه، تنظیم دفاتر و آماده‌سازی مدارک' },
      { step: 4, title: 'پیگیری اعتراض', desc: 'در صورت لزوم، اعتراض به تشخیص مالیات و پیگیری در هیئت‌ها' },
      { step: 5, title: 'تقسیط و تخفیف', desc: 'درخواست تقسیط و تخفیف جرائم و پیگیری تا نتیجه نهایی' },
    ],
    stats: [
      { value: '+۸۰۰', label: 'پرونده مالیاتی', icon: CheckCircle2 },
      { value: '۹۲٪', label: 'تخفیف موفق', icon: Star },
      { value: '+۱۵', label: 'وکیل مالیاتی', icon: BadgeCheck },
      { value: '+۵', label: 'سال تجربه', icon: Award },
    ],
    faqs: [
      { q: 'چگونه جرائم مالیاتی را کاهش دهم؟', a: 'با ارائه مستندات و مدارک معتبر و درخواست بخشش در مراجع ذی‌صلاح، امکان کاهش جرائم مالیاتی تا ۱۰۰٪ در صورت شرایط خاص وجود دارد.' },
      { q: 'آیا نیاز به مشاوره مالیاتی دائم دارم؟', a: 'برای کسب‌وکارها و شرکت‌ها، مشاوره مالیاتی دوره‌ای بسیار مفید است و می‌تواند از بروز مشکلات مالیاتی جلوگیری کند.' },
      { q: 'تفاوت مالیات بر درآمد و عملکرد چیست؟', a: 'مالیات بر درآمد برای اشخاص حقیقی و مشاغل است. مالیات عملکرد برای اشخاص حقوقی (شرکت‌ها) محاسبه می‌شود.' },
      { q: 'هزینه وکیل مالیاتی چقدر است؟', a: 'هزینه بستگی به نوع پرونده و مبلغ مالیات دارد. معمولاً درصدی از تخفیف به‌دست‌آمده به عنوان حق‌الوکاله محاسبه می‌شود.' },
      { q: 'آیا می‌توانم اظهارنامه مالیاتی خود را اصلاح کنم؟', a: 'بله، امکان اصلاح اظهارنامه قبل از رسیدگی و تشخیص قطعی وجود دارد. در صورت نیاز، وکیل مالیاتی ما این کار را برای شما انجام می‌دهد.' },
    ],
    relatedAreas: ['تجاری و شرکتی', 'حقوقی و مدنی'],
  },
  'مالکیت فکری': {
    heroDesc: 'ثبت اختراع، علامت تجاری، حق تألیف و حفاظت از دارایی‌های فکری و صنعتی',
    intro: 'دارایی‌های فکری از مهم‌ترین ثروت‌های شرکت‌ها و افراد خلاق هستند. حفاظت از اختراعات، علامت‌های تجاری، آثار هنری و نرم‌افزارها نیازمند دانش تخصصی حقوق مالکیت فکری است. تیم وکلای مالکیت فکری لِگال‌هاب با تسلط بر قوانین داخلی و کنوانسیون‌های بین‌المللی، خدمات جامع ثبت و حفاظت از دارایی‌های فکری ارائه می‌دهد. از ثبت اختراع و علامت تجاری گرفته تا لایسنس‌دهی و حل اختلافات مربوط به مالکیت فکری.',
    services: [
      { icon: FileText, title: 'ثبت اختراع', desc: 'ثبت اختراع در داخلی و بین‌المللی، بررسی قابلیت ثبت و حفاظت از اختراعات' },
      { icon: Shield, title: 'ثبت علامت تجاری', desc: 'ثبت برند و لوگو، جستجوی علامت مشابه و حفاظت از هویت تجاری' },
      { icon: BookOpen, title: 'حق تألیف', desc: 'ثبت آثار ادبی و هنری، نرم‌افزار، موسیقی و فیلمنامه' },
      { icon: Building2, title: 'لایسنس و قرارداد', desc: 'تنظیم قراردادهای لایسنس، انتقال حقوق مالکیت فکری و فرانچایز' },
      { icon: Eye, title: 'نقض و تقلب', desc: 'پیگیری نقض حقوق مالکیت فکری، تقلب علامت تجاری و جعل صنعتی' },
      { icon: Globe2, title: 'بین‌المللی', desc: 'ثبت بین‌المللی اختراع (PCT)، مادریت و پروتکل مادرید' },
    ],
    process: [
      { step: 1, title: 'جستجوی اولیه', desc: 'بررسی是否存在 سوابق ثبت مشابه و ارزیابی قابلیت ثبت' },
      { step: 2, title: 'آماده‌سازی', desc: 'تنظیم اظهارنامه، توصیف اختراع یا علامت و آماده‌سازی مدارک' },
      { step: 3, title: 'ثبت درخواست', desc: 'ثبت در داخلی و در صورت نیاز در سامانه‌های بین‌المللی' },
      { step: 4, title: 'پیگیری', desc: 'پیگیری فرآیند بررسی و پاسخ به ایرادات احتمالی' },
      { step: 5, title: 'صدور گواهی', desc: 'دریافت گواهی ثبت و حفاظت مستمر از حقوق مالکیت فکری' },
    ],
    stats: [
      { value: '+۶۰۰', label: 'ثبت موفق', icon: CheckCircle2 },
      { value: '۹۷٪', label: 'تایید ثبت', icon: Star },
      { value: '+۱۰', label: 'وکیل مالکیت فکری', icon: BadgeCheck },
      { value: '+۵', label: 'سال تجربه', icon: Award },
    ],
    faqs: [
      { q: 'فرآیند ثبت اختراع چقدر طول می‌کشد؟', a: 'ثبت اختراع در ایران معمولاً ۱۸ تا ۳۶ ماه طول می‌کشد. ثبت بین‌المللی (PCT) نیز زمان بیشتری نیاز دارد.' },
      { q: 'تفاوت اختراع و ایده چیست؟', a: 'اختراع باید قابل ساخت و استفاده عملی باشد و جدید باشد. ایده صرف بدون جزئیات فنی و قابلیت اجرا، قابل ثبت به عنوان اختراع نیست.' },
      { q: 'آیا علامت تجاری بین‌المللی ثبت می‌شود؟', a: 'بله، از طریق سیستم مادریت (اتریوش) می‌توان علامت تجاری را در بیش از ۱۲۰ کشور به صورت همزمان ثبت کرد.' },
      { q: 'حقوق مالکیت فکری نرم‌افزار چگونه حفاظت می‌شود؟', a: 'نرم‌افزارها از طریق حق تألیف محافظت می‌شوند. همچنین الگوریتم‌های خاص ممکن است قابلیت ثبت به عنوان اختراع داشته باشند.' },
      { q: 'هزینه ثبت علامت تجاری چقدر است؟', a: 'هزینه بستگی به تعداد کلاس‌های ثبت و نوع خدمات دارد. در مشاوره اول رایگان، هزینه دقیق اعلام می‌شود.' },
    ],
    relatedAreas: ['تجاری و شرکتی', 'حقوقی و مدنی'],
  },
};

// ============ ANIMATION HELPERS ============
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: 'easeOut' } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============ MAIN COMPONENT ============
interface Props {
  areaName: string;
  onBack: () => void;
  onNavigateArea: (area: string) => void;
}

export default function PracticeAreaPage({ areaName, onBack, onNavigateArea }: Props) {
  const data = areasData[areaName];
  const setPage = useAppStore((s) => s.setPage);
  const Icon = iconMap[areaName] || Scale;
  const gradient = gradientMap[areaName] || 'from-emerald-600 to-teal-700';
  const lightGrad = lightGradientMap[areaName] || 'from-emerald-50 to-teal-50';
  const accent = accentMap[areaName] || 'text-emerald-600';
  const bgAccent = bgAccentMap[areaName] || 'bg-emerald-500/10';
  const borderAccent = borderAccentMap[areaName] || 'border-emerald-500/20';

  if (!data) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">حوزه مورد نظر یافت نشد</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ============ HERO ============ */}
      <div className={`relative bg-gradient-to-br from-slate-950 ${gradient} py-20 sm:py-28 overflow-hidden`}>
        {/* Decorative */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-white/[0.04] blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-white/[0.03] blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Button variant="ghost" onClick={onBack} className="text-white/60 hover:text-white hover:bg-white/10 mb-8">
              <ArrowRight className="w-4 h-4 ml-2" />
              بازگشت به صفحه اصلی
            </Button>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white" style={{ fontFamily: "'Lalezar', sans-serif" }}>
                  {areaName}
                </h1>
                <p className="text-white/50 text-sm mt-1">حوزه تخصصی حقوقی</p>
              </div>
            </motion.div>

            <motion.p variants={fadeInUp} className="text-lg sm:text-xl text-white/80 max-w-3xl leading-relaxed mb-8">
              {data.heroDesc}
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-wrap gap-3">
              <Button size="lg" onClick={() => setPage('login')} className={`bg-white ${accent} hover:bg-white/90 shadow-lg px-8`}>
                <PhoneCall className="w-5 h-5 ml-2" />
                مشاوره رایگان
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8">
                <MessageCircle className="w-5 h-5 ml-2" />
                مشاوره آنلاین
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* ============ INTRO ============ */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <p className={`text-base sm:text-lg leading-8 ${accent} bg-clip-text font-semibold text-foreground`}>
              {data.intro}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ============ SERVICES ============ */}
      <section className="py-12 sm:py-16 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-3" style={{ fontFamily: "'Lalezar', sans-serif" }}>
              خدمات تخصصی {areaName}
            </h2>
            <p className="text-muted-foreground">خدمات جامع حقوقی در حوزه {areaName}</p>
          </AnimatedSection>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.services.map((service, i) => (
              <motion.div key={i} variants={scaleIn}>
                <Card className={`group h-full border ${borderAccent} hover:shadow-xl transition-all duration-300 bg-card`}>
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl ${bgAccent} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <service.icon className={`w-6 h-6 ${accent}`} />
                    </div>
                    <h3 className="font-bold text-foreground text-lg mb-2">{service.title}</h3>
                    <p className="text-muted-foreground text-sm leading-7">{service.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ PROCESS ============ */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-3" style={{ fontFamily: "'Lalezar', sans-serif" }}>
              مراحل پیگیری پرونده
            </h2>
            <p className="text-muted-foreground">از ثبت درخواست تا نتیجه نهایی همراه شما هستیم</p>
          </AnimatedSection>

          <div className="relative">
            {/* Connector line */}
            <div className="absolute top-8 right-8 left-8 h-0.5 bg-border hidden md:block" />

            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {data.process.map((step, i) => (
                <motion.div key={i} variants={fadeInUp} className="relative text-center">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-4 shadow-lg relative z-10`}>
                    <span className="text-xl font-extrabold text-white">{step.step}</span>
                  </div>
                  <h3 className="font-bold text-foreground text-sm mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-xs leading-6">{step.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className={`py-12 sm:py-16 bg-gradient-to-br ${lightGrad}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {data.stats.map((stat, i) => (
              <motion.div key={i} variants={fadeInUp} className="text-center">
                <div className={`w-12 h-12 rounded-xl ${bgAccent} flex items-center justify-center mx-auto mb-3`}>
                  <stat.icon className={`w-6 h-6 ${accent}`} />
                </div>
                <div className={`text-2xl sm:text-3xl font-extrabold ${accent} mb-1`}>{stat.value}</div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-3" style={{ fontFamily: "'Lalezar', sans-serif" }}>
              سوالات متداول {areaName}
            </h2>
          </AnimatedSection>

          <div className="space-y-4">
            {data.faqs.map((faq, i) => (
              <AnimatedSection key={i} delay={i * 0.05}>
                <Card className="bg-card border-border/50">
                  <CardContent className="p-5">
                    <h3 className="font-bold text-foreground mb-3 flex items-start gap-3">
                      <span className={`shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold`}>
                        {i + 1}
                      </span>
                      {faq.q}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-7 pr-10">{faq.a}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className={`py-14 sm:py-20 bg-gradient-to-br from-slate-950 ${gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-20 w-72 h-72 rounded-full bg-white/[0.04] blur-3xl" />
          <div className="absolute bottom-10 left-20 w-64 h-64 rounded-full bg-white/[0.03] blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} whileInView="visible" viewport={{ once: true }}>
            <motion.h2 variants={fadeInUp} className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-4" style={{ fontFamily: "'Lalezar', sans-serif" }}>
              نیاز به مشاوره {areaName} دارید؟
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-white/70 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
              اولین مشاوره ۱۵ دقیقه‌ای رایگان است. همین الان ثبت نام کنید و با وکیل متخصص {areaName} مشورت کنید.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={() => setPage('login')} className="bg-white text-emerald-700 hover:bg-white/90 shadow-lg px-8">
                <PhoneCall className="w-5 h-5 ml-2" />
                شروع مشاوره رایگان
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8">
                <Video className="w-5 h-5 ml-2" />
                مشاوره ویدئویی
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============ RELATED AREAS ============ */}
      {data.relatedAreas.length > 0 && (
        <section className="py-12 sm:py-16 bg-secondary/20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-center text-lg font-semibold text-foreground mb-6">حوزه‌های مرتبط</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {data.relatedAreas.map((area, i) => {
                const RelIcon = iconMap[area] || Scale;
                return (
                  <Card key={i} className="cursor-pointer hover:shadow-md transition-all duration-300 bg-card border-border/50" onClick={() => onNavigateArea(area)}>
                    <CardContent className="px-4 py-3 flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg ${bgAccentMap[area] || 'bg-emerald-500/10'} flex items-center justify-center`}>
                        <RelIcon className={`w-4 h-4 ${accentMap[area] || 'text-emerald-600'}`} />
                      </div>
                      <span className="text-sm font-semibold text-foreground">{area}</span>
                      <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-border py-6 text-center">
        <p className="text-xs text-muted-foreground">© ۱۴۰۴ لِگال‌هاب - پلتفرم مدیریت حقوقی</p>
      </footer>
    </div>
  );
}
