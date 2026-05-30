'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Scale,
  Briefcase,
  Bot,
  CalendarDays,
  DollarSign,
  MessageSquare,
  Rss,
  TrendingUp,
  FolderOpen,
  BookOpen,
  Target,
  Calendar,
  Shield,
  UserPlus,
  ArrowLeft,
  Star,
  Check,
  Lock,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Send,
  Users,
  Building2,
  GraduationCap,
  UserCog,
  Calculator,
  Headphones,
  Eye,
  Zap,
  Award,
  Globe,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/lib/store';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  CartesianGrid,
} from 'recharts';

// ============ ANIMATION VARIANTS ============

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const fadeInDown = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
};

// ============ ANIMATED SECTION WRAPPER ============

function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: 'easeOut' } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============ COUNTER HOOK ============

function useCounter(end: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (startOnView && !isInView) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, startOnView, isInView]);

  return { count, ref };
}

// ============ CHART DATA ============

const growthData = [
  { month: 'فروردین', users: 1200, cases: 800 },
  { month: 'اردیبهشت', users: 2800, cases: 1900 },
  { month: 'خرداد', users: 4200, cases: 3100 },
  { month: 'تیر', users: 5800, cases: 4500 },
  { month: 'مرداد', users: 7500, cases: 6200 },
  { month: 'شهریور', users: 9200, cases: 7800 },
  { month: 'مهر', users: 10500, cases: 9100 },
  { month: 'آبان', users: 12000, cases: 10500 },
];

// ============ FEATURES DATA ============

const features = [
  { icon: Briefcase, title: 'مدیریت پرونده‌ها', desc: 'مدیریت هوشمند پرونده‌ها با تایم‌لاین کامل، وضعیت‌بندی و دسته‌بندی حرفه‌ای' },
  { icon: Bot, title: 'دستیار هوش مصنوعی', desc: 'تحلیل قرارداد، پیشنهاد استدلال حقوقی و مشاوره AI با هوش مصنوعی پیشرفته' },
  { icon: CalendarDays, title: 'نوبت‌دهی آنلاین', desc: 'سیستم رزرو و مشاوره آنلاین با تقویم یکپارچه و اعلان خودکار' },
  { icon: DollarSign, title: 'مالی و صورت‌حساب', desc: 'فاکتور خودکار، پرداخت آنلاین و کیف پول دیجیتال با مدیریت اقساط' },
  { icon: MessageSquare, title: 'پیام‌رسان امن', desc: 'ارتباط امن و رمزنگاری‌شده بین وکیل و موکل با تاریخچه کامل مکالمات' },
  { icon: Rss, title: 'شبکه اجتماعی', desc: 'انجمن حقوقی، اشتراک‌گذاری دانش، نظرات کاربران و محتوای تخصصی' },
  { icon: TrendingUp, title: 'گزارش‌ها و تحلیل', desc: 'داشبورد تحلیلی پیشرفته با نمودارها و گزارش‌های عملکرد لحظه‌ای' },
  { icon: FolderOpen, title: 'مدیریت اسناد', desc: 'آرشیو دیجیتال با قابلیت OCR، جستجوی هوشمند و نسخه‌بندی خودکار' },
  { icon: BookOpen, title: 'سیستم آموزش', desc: 'دوره‌ها، آزمون‌های آنلاین و صدور گواهینامه برای توسعه حرفه‌ای وکلا' },
  { icon: Target, title: 'سیستم CRM', desc: 'مدیریت ارتباط با مشتریان، پیگیری لیدها و قیف فروش حقوقی' },
  { icon: Calendar, title: 'تقویم هوشمند', desc: 'مدیریت جلسات، مهلت‌های قانونی و یادآورهای هوشمند خودکار' },
  { icon: Shield, title: 'امنیت پیشرفته', desc: 'رمزنگاری سرتاسر، احراز هویت دو مرحله‌ای و مانیتورینگ امنیتی ۲۴/۷' },
];

// ============ ROLES DATA ============

const roles = [
  { icon: Building2, name: 'سوپر ادمین', capabilities: ['مدیریت سیستم', 'تنظیمات کلی', 'گزارش‌های سازمانی'] },
  { icon: UserCog, name: 'مدیر', capabilities: ['مدیریت تیم', 'تعریف فرآیندها', 'نظارت عملکرد'] },
  { icon: Scale, name: 'وکیل', capabilities: ['مدیریت پرونده', 'مشاوره آنلاین', 'دسترسی AI'] },
  { icon: GraduationCap, name: 'کارآموز', capabilities: ['مشاهده پرونده‌ها', 'یادگیری دوره‌ها', 'وظایف محوله'] },
  { icon: Users, name: 'موکل', capabilities: ['پیگیری پرونده', 'ارتباط با وکیل', 'پرداخت آنلاین'] },
  { icon: Calculator, name: 'حسابدار', capabilities: ['مدیریت فاکتور', 'گزارش مالی', 'پیگیری پرداخت'] },
  { icon: Headphones, name: 'پشتیبانی', capabilities: ['تیکت‌ها', 'پایگاه دانش', 'پاسخگویی'] },
];

// ============ TESTIMONIALS DATA ============

const testimonials = [
  {
    name: 'دکتر محمد احمدی',
    role: 'وکیل ارشد',
    initials: 'م.ا',
    color: 'bg-emerald-600',
    quote: 'لِگال‌هاب مدیریت دفتر وکالت ما را کاملاً متحول کرده. سرعت کار سه برابر شده و هیچ پرونده‌ای از قلم نمی‌افتد.',
    rating: 5,
  },
  {
    name: 'سارا رضایی',
    role: 'مدیر دفتر حقوقی',
    initials: 'س.ر',
    color: 'bg-teal-600',
    quote: 'سیستم گزارش‌دهی و داشبورد تحلیلی لِگال‌هاب به ما کمک کرد تا تصمیمات بهتری بگیریم. فوق‌العاده است!',
    rating: 5,
  },
  {
    name: 'علی محمدپور',
    role: 'مدیرعامل هلدینگ حقوقی',
    initials: 'ع.م',
    color: 'bg-cyan-600',
    quote: 'با لِگال‌هاب توانستیم عملکرد ۷ دفتر وکالت خود را به صورت متمرکز مدیریت کنیم. پشتیبانی عالی.',
    rating: 5,
  },
];

// ============ PRICING DATA ============

const pricingTiers = [
  {
    name: 'پایه',
    price: 'رایگان',
    period: '',
    description: 'شروع حرفه‌ای مدیریت حقوقی',
    features: ['۱ وکیل', '۱۰ پرونده فعال', 'پیام‌رسان', 'تقویم', 'گزارش‌های پایه'],
    cta: 'شروع رایگان',
    popular: false,
  },
  {
    name: 'حرفه‌ای',
    price: '۹,۹۰۰,۰۰۰',
    period: 'تومان / ماه',
    description: 'برای دفاتر حقوقی متوسط',
    features: ['بی‌نهایت وکیل', 'بی‌نهایت پرونده', 'دستیار AI', 'CRM کامل', 'گزارش‌های پیشرفته', 'نوبت‌دهی آنلاین', 'اولویت پشتیبانی'],
    cta: 'شروع دوره آزمایشی',
    popular: true,
  },
  {
    name: 'سازمانی',
    price: 'تماس بگیرید',
    period: '',
    description: 'برای سازمان‌ها و هلدینگ‌ها',
    features: ['تمام امکانات حرفه‌ای', 'سفارشی‌سازی', 'API اختصاصی', 'SLA ۹۹.۹۹%', 'مدیر اختصاصی حساب', 'آموزش تیم'],
    cta: 'تماس با فروش',
    popular: false,
  },
];

// ============ FLOATING CARDS FOR HERO ============

const floatingCards = [
  { icon: Briefcase, label: 'پرونده جدید', sublabel: '+۱۲ امروز' },
  { icon: MessageSquare, label: 'پیام‌ها', sublabel: '۳ خوانده‌نشده' },
  { icon: CalendarDays, label: 'جلسه بعدی', sublabel: '۱۰:۳۰ صبح' },
];

// ============ MAIN COMPONENT ============

export default function LandingPage() {
  const setPage = useAppStore((s) => s.setPage);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [email, setEmail] = useState('');
  const [scrolled, setScrolled] = useState(false);

  // Scroll listener for sticky nav
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIdx((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigate = (page: string) => {
    setPage(page);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ============ STICKY NAVIGATION ============ */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-background/80 backdrop-blur-xl border-b border-border shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
                <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-foreground">
                لِگال‌هاب
              </span>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">امکانات</a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">نحوه کار</a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">تعرفه‌ها</a>
              <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">نظرات</a>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="text-muted-foreground"
              >
                {theme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleNavigate('login')}>
                ورود
              </Button>
              <Button size="sm" onClick={() => handleNavigate('register')}>
                ثبت‌نام رایگان
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex lg:hidden items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground">
                {theme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-border"
            >
              <div className="px-4 py-4 space-y-3">
                <a href="#features" className="block text-sm text-muted-foreground hover:text-foreground py-2" onClick={() => setMobileMenuOpen(false)}>امکانات</a>
                <a href="#how-it-works" className="block text-sm text-muted-foreground hover:text-foreground py-2" onClick={() => setMobileMenuOpen(false)}>نحوه کار</a>
                <a href="#pricing" className="block text-sm text-muted-foreground hover:text-foreground py-2" onClick={() => setMobileMenuOpen(false)}>تعرفه‌ها</a>
                <a href="#testimonials" className="block text-sm text-muted-foreground hover:text-foreground py-2" onClick={() => setMobileMenuOpen(false)}>نظرات</a>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" size="sm" onClick={() => { handleNavigate('login'); setMobileMenuOpen(false); }}>ورود</Button>
                  <Button className="flex-1" size="sm" onClick={() => { handleNavigate('register'); setMobileMenuOpen(false); }}>ثبت‌نام</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ============ 1. HERO SECTION ============ */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-emerald-600 to-teal-700" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-teal-300/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-400/10 blur-3xl" />
        </div>
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-right">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <motion.div variants={fadeInDown}>
                  <Badge className="mb-6 bg-white/15 text-white border-white/20 backdrop-blur-sm px-4 py-1.5 text-sm">
                    <Zap className="w-3.5 h-3.5 ml-1" />
                    نسل جدید پلتفرم حقوقی
                  </Badge>
                </motion.div>

                <motion.h1
                  variants={fadeInUp}
                  className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-tight mb-6"
                >
                  لِگال‌هاب
                  <br />
                  <span className="text-emerald-200">آینده مدیریت حقوقی</span>
                </motion.h1>

                <motion.p variants={fadeInUp} className="text-base sm:text-lg lg:text-xl text-white/80 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                  پلتفرم جامع مدیریت دفاتر وکالت و شرکت‌های حقوقی. از مدیریت پرونده و نوبت‌دهی تا هوش مصنوعی حقوقی — همه در یک ابراپلیکیشن.
                </motion.p>

                <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                  <Button
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 shadow-xl shadow-black/10 text-base px-8 h-12"
                    onClick={() => handleNavigate('register')}
                  >
                    <Zap className="w-4 h-4 ml-2" />
                    شروع رایگان
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm text-base px-8 h-12"
                    onClick={() => handleNavigate('login')}
                  >
                    <Eye className="w-4 h-4 ml-2" />
                    مشاهده دمو
                  </Button>
                </motion.div>

                <motion.div variants={fadeInUp} className="flex items-center gap-6 mt-8 justify-center lg:justify-start text-white/60 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    <span>بدون نیاز به کارت بانکی</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    <span>آماده در ۵ دقیقه</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Floating Cards Illustration */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden md:block relative"
            >
              <div className="relative w-full max-w-md mx-auto">
                {/* Main Card */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/30 flex items-center justify-center">
                      <Scale className="w-5 h-5 text-emerald-200" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">داشبورد لِگال‌هاب</div>
                      <div className="text-white/50 text-xs">خلاصه عملکرد امروز</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 rounded-xl p-3">
                      <div className="text-emerald-300 text-2xl font-bold">۲۴</div>
                      <div className="text-white/60 text-xs">پرونده فعال</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3">
                      <div className="text-teal-300 text-2xl font-bold">۸</div>
                      <div className="text-white/60 text-xs">جلسه امروز</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3">
                      <div className="text-cyan-300 text-2xl font-bold">۹۶٪</div>
                      <div className="text-white/60 text-xs">رضایت موکلان</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3">
                      <div className="text-green-300 text-2xl font-bold">۱۵</div>
                      <div className="text-white/60 text-xs">پیام جدید</div>
                    </div>
                  </div>
                </motion.div>

                {/* Floating mini cards */}
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute -top-4 -left-4 bg-white/15 backdrop-blur-lg rounded-xl p-3 border border-white/20 shadow-xl"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-500/30 flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-green-300" />
                    </div>
                    <div>
                      <div className="text-white text-xs font-medium">پرونده جدید</div>
                      <div className="text-white/50 text-[10px]">+۱۲ امروز</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute -bottom-4 -right-4 bg-white/15 backdrop-blur-lg rounded-xl p-3 border border-white/20 shadow-xl"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/30 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-blue-300" />
                    </div>
                    <div>
                      <div className="text-white text-xs font-medium">پیام‌ها</div>
                      <div className="text-white/50 text-[10px]">۳ خوانده‌نشده</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -14, 0] }}
                  transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                  className="absolute top-1/2 -right-8 bg-white/15 backdrop-blur-lg rounded-xl p-3 border border-white/20 shadow-xl"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/30 flex items-center justify-center">
                      <CalendarDays className="w-4 h-4 text-orange-300" />
                    </div>
                    <div>
                      <div className="text-white text-xs font-medium">جلسه بعدی</div>
                      <div className="text-white/50 text-[10px]">۱۰:۳۰ صبح</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 75C480 70 600 80 720 85C840 90 960 90 1080 85C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" className="fill-background" />
          </svg>
        </div>
      </section>

      {/* ============ 2. STATS SECTION ============ */}
      <section className="py-16 sm:py-20 lg:py-28 bg-background relative">
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, oklch(0.45 0.15 160 / 0.08) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12 sm:mb-16">
            <Badge variant="secondary" className="mb-4">آمار و ارقام</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              اعداد صحبت می‌کنند
            </h2>
            <p className="text-muted-foreground mt-3 text-base sm:text-lg max-w-2xl mx-auto">
              اعتماد هزاران وکیل و شرکت حقوقی در سراسر ایران
            </p>
          </AnimatedSection>

          {/* Stat Cards */}
          <AnimatedSection delay={0.1}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
              <StatCard value={10000} suffix="+" label="وکیل فعال" icon={Scale} />
              <StatCard value={50000} suffix="+" label="پرونده موفق" icon={Briefcase} />
              <StatCard value={99.9} suffix="%" label="آپتایم" icon={Zap} decimals={1} />
              <StatCard value={2000000000} suffix="+" prefix="۲ " label="میلیارد تومان پرداخت" icon={DollarSign} compact />
            </div>
          </AnimatedSection>

          {/* Chart */}
          <AnimatedSection delay={0.2}>
            <Card className="border-border/50 shadow-none overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-foreground text-base sm:text-lg">رشد پلتفرم</h3>
                    <p className="text-muted-foreground text-sm">تعداد کاربران و پرونده‌ها در ۸ ماه اخیر</p>
                  </div>
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    <TrendingUp className="w-3 h-3 ml-1" />
                    +۳۴٪ رشد
                  </Badge>
                </div>
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="oklch(0.45 0.15 160)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="oklch(0.45 0.15 160)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="oklch(0.55 0.12 180)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="oklch(0.55 0.12 180)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.8 0.02 155 / 0.3)" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12, fill: 'oklch(0.5 0.02 155)' }}
                        axisLine={{ stroke: 'oklch(0.8 0.02 155 / 0.3)' }}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: 'oklch(0.5 0.02 155)' }}
                        axisLine={{ stroke: 'oklch(0.8 0.02 155 / 0.3)' }}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'oklch(1 0 0)',
                          border: '1px solid oklch(0.91 0.01 155)',
                          borderRadius: '8px',
                          fontSize: '13px',
                          direction: 'rtl',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="users"
                        stroke="oklch(0.45 0.15 160)"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorUsers)"
                        name="کاربران"
                      />
                      <Area
                        type="monotone"
                        dataKey="cases"
                        stroke="oklch(0.55 0.12 180)"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCases)"
                        name="پرونده‌ها"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </section>

      {/* ============ 3. FEATURES GRID ============ */}
      <section id="features" className="py-16 sm:py-20 lg:py-28 bg-secondary/30 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12 sm:mb-16">
            <Badge variant="secondary" className="mb-4">امکانات</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              همه چیز که یک دفتر حقوقی نیاز دارد
            </h2>
            <p className="text-muted-foreground mt-3 text-base sm:text-lg max-w-2xl mx-auto">
              ۱۲ ماژول قدرتمند برای مدیریت کامل عملیات حقوقی شما
            </p>
          </AnimatedSection>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          >
            {features.map((feature, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <Card className="group relative overflow-hidden border-border/50 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-full bg-card">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardContent className="p-5 sm:p-6 relative">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-base mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ 4. HOW IT WORKS ============ */}
      <section id="how-it-works" className="py-16 sm:py-20 lg:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12 sm:mb-16">
            <Badge variant="secondary" className="mb-4">نحوه کار</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              شروع در سه مرحله ساده
            </h2>
            <p className="text-muted-foreground mt-3 text-base sm:text-lg max-w-2xl mx-auto">
              بدون نیاز به نصب و راه‌اندازی پیچیده — همین الان شروع کنید
            </p>
          </AnimatedSection>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 relative"
          >
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-16 right-[20%] left-[20%] h-0.5 bg-gradient-to-l from-primary/40 via-primary/20 to-primary/40" />

            {[
              {
                step: '1',
                icon: UserPlus,
                title: 'ثبت‌نام و تنظیم حساب',
                desc: 'در کمتر از ۲ دقیقه ثبت‌نام کنید، اطلاعات دفتر خود را وارد کنید و پلتفرم را شخصی‌سازی کنید.',
              },
              {
                step: '2',
                icon: Briefcase,
                title: 'ایجاد پرونده و تخصیص وکیل',
                desc: 'پرونده‌های حقوقی را ایجاد کنید و به صورت خودکار یا دستی به وکلای تیم تخصیص دهید.',
              },
              {
                step: '3',
                icon: TrendingUp,
                title: 'پیگیری و مدیریت',
                desc: 'وضعیت پرونده‌ها را پیگیری کنید، گزارش‌های تحلیلی بگیرید و به صورت هوشمند مدیریت کنید.',
              },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeInUp} className="relative text-center">
                <div className="flex flex-col items-center">
                  {/* Step circle */}
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20 shadow-lg shadow-primary/5">
                      <item.icon className="w-9 h-9 text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ 5. ROLE-BASED SHOWCASE ============ */}
      <section className="py-16 sm:py-20 lg:py-28 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12 sm:mb-16">
            <Badge variant="secondary" className="mb-4">نقش‌ها</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              طراحی شده برای هر نقش
            </h2>
            <p className="text-muted-foreground mt-3 text-base sm:text-lg max-w-2xl mx-auto">
              هر عضو تیم حقوقی دسترسی اختصاصی به ابزارهای مورد نیاز خود دارد
            </p>
          </AnimatedSection>

          <div className="overflow-x-auto pb-4 -mx-4 px-4">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="flex gap-4 sm:gap-6 min-w-max lg:min-w-0 lg:grid lg:grid-cols-7"
            >
              {roles.map((role, i) => (
                <motion.div key={i} variants={fadeInUp} className="w-52 sm:w-56 shrink-0">
                  <Card className="group border-border/50 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-full bg-card text-center">
                    <CardContent className="p-5 sm:p-6 flex flex-col items-center">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        <role.icon className="w-7 h-7 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground text-sm mb-3">{role.name}</h3>
                      <ul className="space-y-1.5">
                        {role.capabilities.map((cap, j) => (
                          <li key={j} className="text-muted-foreground text-xs flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-primary shrink-0" />
                            {cap}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ 6. TESTIMONIALS SECTION ============ */}
      <section id="testimonials" className="py-16 sm:py-20 lg:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12 sm:mb-16">
            <Badge variant="secondary" className="mb-4">نظرات مشتریان</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              وکلای برتر به لِگال‌هاب اعتماد کرده‌اند
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <div className="relative max-w-4xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={testimonialIdx}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="border-border/50 shadow-xl shadow-primary/5 bg-card">
                    <CardContent className="p-8 sm:p-12 text-center">
                      {/* Stars */}
                      <div className="flex justify-center gap-1 mb-6">
                        {Array.from({ length: testimonials[testimonialIdx].rating }).map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>

                      {/* Quote */}
                      <blockquote className="text-lg sm:text-xl text-foreground leading-relaxed mb-8 font-medium">
                        «{testimonials[testimonialIdx].quote}»
                      </blockquote>

                      {/* Avatar + Name */}
                      <div className="flex items-center justify-center gap-3">
                        <div className={`w-12 h-12 rounded-full ${testimonials[testimonialIdx].color} flex items-center justify-center text-white font-bold text-sm`}>
                          {testimonials[testimonialIdx].initials}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-foreground">{testimonials[testimonialIdx].name}</div>
                          <div className="text-muted-foreground text-sm">{testimonials[testimonialIdx].role}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>

              {/* Navigation dots */}
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTestimonialIdx(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i === testimonialIdx
                        ? 'bg-primary w-8'
                        : 'bg-primary/20 hover:bg-primary/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============ 7. PRICING SECTION ============ */}
      <section id="pricing" className="py-16 sm:py-20 lg:py-28 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12 sm:mb-16">
            <Badge variant="secondary" className="mb-4">تعرفه‌ها</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              طرح مناسب خود را انتخاب کنید
            </h2>
            <p className="text-muted-foreground mt-3 text-base sm:text-lg max-w-2xl mx-auto">
              همه طرح‌ها شامل ۱۴ روز آزمایشی رایگان هستند
            </p>
          </AnimatedSection>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto"
          >
            {pricingTiers.map((tier, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <Card className={`relative h-full flex flex-col transition-all duration-300 ${
                  tier.popular
                    ? 'border-primary shadow-xl shadow-primary/10 scale-[1.02]'
                    : 'border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5'
                }`}>
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1 shadow-lg shadow-primary/25">
                        <Award className="w-3.5 h-3.5 ml-1" />
                        پیشنهاد ویژه
                      </Badge>
                    </div>
                  )}
                  <CardContent className={`p-6 sm:p-8 flex flex-col flex-1 ${tier.popular ? 'pt-10' : ''}`}>
                    <h3 className="text-xl font-bold text-foreground mb-2">{tier.name}</h3>
                    <p className="text-muted-foreground text-sm mb-6">{tier.description}</p>

                    <div className="mb-6">
                      <span className="text-3xl sm:text-4xl font-extrabold text-foreground">{tier.price}</span>
                      {tier.period && (
                        <span className="text-muted-foreground text-sm mr-2">{tier.period}</span>
                      )}
                    </div>

                    <ul className="space-y-3 mb-8 flex-1">
                      {tier.features.map((feature, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full ${
                        tier.popular
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                      onClick={() => handleNavigate('register')}
                    >
                      {tier.cta}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ 8. CTA SECTION ============ */}
      <section className="py-16 sm:py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-emerald-600 to-teal-700" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-teal-300/10 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.div variants={fadeInUp} className="mb-6">
                <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20">
                  <Scale className="w-8 h-8 text-white" />
                </div>
              </motion.div>

              <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
                آماده‌اید مدیریت حقوقی خود را متحول کنید؟
              </motion.h2>

              <motion.p variants={fadeInUp} className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                همین الان به هزاران وکیل و شرکت حقوقی بپیوندید که با لِگال‌هاب عملکرد خود را به سطح جدیدی ارتقا داده‌اند.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-10">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 shadow-xl shadow-black/10 text-base px-8 h-12"
                  onClick={() => handleNavigate('register')}
                >
                  <Zap className="w-4 h-4 ml-2" />
                  شروع رایگان
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm text-base px-8 h-12"
                  onClick={() => handleNavigate('register')}
                >
                  <Phone className="w-4 h-4 ml-2" />
                  تماس با تیم فروش
                </Button>
              </motion.div>

              {/* Trust badges */}
              <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-6 sm:gap-8">
                {[
                  { icon: Lock, label: 'رمزنگاری SSL' },
                  { icon: Shield, label: 'GDPR' },
                  { icon: Award, label: 'ISO 27001' },
                ].map((badge, i) => (
                  <div key={i} className="flex items-center gap-2 text-white/60 text-sm">
                    <badge.icon className="w-4 h-4" />
                    <span>{badge.label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============ 9. FOOTER ============ */}
      <footer className="bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="py-12 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-12">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <Scale className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">لِگال‌هاب</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-sm">
                پلتفرم جامع مدیریت حقوقی و وکالت. با لِگال‌هاب، مدیریت دفتر وکالت خود را به سطح جدیدی ارتقا دهید.
              </p>
              {/* Social Icons */}
              <div className="flex gap-3">
                {['Telegram', 'Instagram', 'Twitter', 'LinkedIn'].map((social) => (
                  <button
                    key={social}
                    className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
                    aria-label={social}
                  >
                    <Globe className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">محصول</h4>
              <ul className="space-y-2.5">
                {['امکانات', 'تعرفه‌ها', 'توسعه‌دهندگان API', 'آپدیت‌ها', 'نقشه راه'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">شرکت</h4>
              <ul className="space-y-2.5">
                {['درباره ما', 'تماس با ما', 'بلاگ', 'فرصت‌های شغلی', 'شرکا'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support & Legal */}
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">پشتیبانی</h4>
              <ul className="space-y-2.5">
                {['مرکز راهنما', 'مستندات', 'تیکت پشتیبانی', 'وضعیت سرویس'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
              <h4 className="font-semibold text-foreground mb-4 text-sm mt-6">حقوقی</h4>
              <ul className="space-y-2.5">
                {['حریم خصوصی', 'شرایط استفاده', 'خط‌مشی کوکی'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className="py-6 border-t border-border">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail className="w-4 h-4" />
                <span>عضویت در خبرنامه:</span>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Input
                  type="email"
                  placeholder="ایمیل شما"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="max-w-xs bg-secondary border-border/50 text-sm"
                  dir="ltr"
                />
                <Button size="sm" className="shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="py-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-muted-foreground text-xs">
              © ۱۴۰۴ لِگال‌هاب. تمامی حقوق محفوظ است.
            </p>
            <div className="flex items-center gap-4 text-muted-foreground text-xs">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />تهران، ایران</span>
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" />۰۲۱-۱۲۳۴۵۶۷۸</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============ STAT CARD COMPONENT ============

function StatCard({
  value,
  suffix = '',
  prefix = '',
  label,
  icon: Icon,
  decimals = 0,
  compact = false,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  decimals?: number;
  compact?: boolean;
}) {
  const { count, ref } = useCounter(value, 2000);

  const formatCompact = (n: number): string => {
    if (n >= 1000000000) return toPersianNum(Math.floor(n / 1000000000)) + ' میلیارد';
    if (n >= 1000000) return toPersianNum(Math.floor(n / 1000000)) + ' میلیون';
    if (n >= 1000) return toPersianNum(Math.floor(n / 1000)) + ' هزار';
    return toPersianNum(n);
  };

  return (
    <div ref={ref} className="bg-card rounded-2xl border border-border/50 p-5 sm:p-6 text-center hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div className="text-2xl sm:text-3xl font-extrabold text-foreground mb-1">
        {prefix}{compact ? formatCompact(count) : toPersianNum(count)}{suffix}
      </div>
      <div className="text-muted-foreground text-sm">{label}</div>
    </div>
  );
}

// ============ HELPERS ============

const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
function toPersianNum(n: number | string): string {
  return String(n).replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}
