'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Scale,
  Phone,
  MessageCircle,
  Video,
  Users,
  Clock,
  Shield,
  CheckCircle,
  Star,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  PhoneCall,
  ArrowLeft,
  Send,
  UserPlus,
  LogIn,
  BookOpen,
  Briefcase,
  Building2,
  Gavel,
  HeartHandshake,
  Landmark,
  Globe2,
  FileText,
  BadgeCheck,
  Headphones,
  Menu,
  X,
  CalendarCheck,
  FileSignature,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useAppStore } from '@/lib/store';

// ============ ANIMATION VARIANTS ============

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

// ============ ANIMATED SECTION WRAPPER ============

function AnimatedSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, delay, ease: 'easeOut' },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============ ANIMATED COUNTER HOOK ============

function useCounter(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, isInView]);

  return { count, ref };
}

// ============ DATA ============

const consultationTypes = [
  {
    icon: Phone,
    title: 'مشاوره تلفنی',
    price: '۳۰۰,۰۰۰ تومان',
    duration: '۳۰ دقیقه',
    desc: 'مشاوره فوری تلفنی با وکلای مجرب در تمام حوزه‌های حقوقی',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: MessageCircle,
    title: 'مشاوره چتی',
    price: '۲۰۰,۰۰۰ تومان',
    duration: '۳۰ دقیقه',
    desc: 'مشاوره متنی آنلاین با پاسخگویی سریع و دقیق',
    color: 'from-teal-500 to-cyan-600',
  },
  {
    icon: Video,
    title: 'مشاوره ویدئویی',
    price: '۵۰۰,۰۰۰ تومان',
    duration: '۴۵ دقیقه',
    desc: 'مشاوره تصویری زنده با ارتباط رو در رو مجازی',
    color: 'from-cyan-500 to-sky-600',
  },
  {
    icon: Users,
    title: 'مشاوره حضوری',
    price: '۱,۰۰۰,۰۰۰ تومان',
    duration: '۶۰ دقیقه',
    desc: 'جلسه حضوری در دفتر مرکزی با وکیل اختصاصی',
    color: 'from-emerald-600 to-green-700',
  },
];

const practiceAreas = [
  { icon: Scale, title: 'حقوقی و مدنی', count: '+۲۵۰۰ پرونده' },
  { icon: Gavel, title: 'کیفری', count: '+۱۸۰۰ پرونده' },
  { icon: HeartHandshake, title: 'خانواده', count: '+۳۲۰۰ پرونده' },
  { icon: Building2, title: 'تجاری و شرکتی', count: '+۱۵۰۰ پرونده' },
  { icon: Briefcase, title: 'کار و تامین اجتماعی', count: '+۱۲۰۰ پرونده' },
  { icon: Globe2, title: 'مهاجرت', count: '+۹۰۰ پرونده' },
  { icon: Landmark, title: 'مالیات', count: '+۸۰۰ پرونده' },
  { icon: FileText, title: 'مالکیت فکری', count: '+۶۰۰ پرونده' },
];

const stats = [
  { value: 5000, suffix: '+', label: 'مشتری راضی', icon: Users },
  { value: 10000, suffix: '+', label: 'پرونده موفق', icon: CheckCircle },
  { value: 50, suffix: '+', label: 'وکیل متخصص', icon: BadgeCheck },
  { value: 99, suffix: '٪', label: 'رضایت', icon: Star },
];

const testimonials = [
  {
    name: 'مریم حسینی',
    role: 'کارمند دولتی',
    initials: 'م.ح',
    color: 'bg-emerald-600',
    quote:
      'پرونده طلاق من بسیار پیچیده بود، اما وکلای لِگال‌هاب با حرفه‌ای‌گری کامل آن را پیگیری کردند. مشاوره اول رایگان بود و باعث شد خیالم راحت شود.',
    rating: 5,
  },
  {
    name: 'رضا کریمی',
    role: 'مدیرعامل شرکت',
    initials: 'ر.ک',
    color: 'bg-teal-600',
    quote:
      'برای مسائل مالیاتی شرکت نیاز به مشاوره فوری داشتیم. مشاوره تلفنی سریع و دقیق بود و راهکارهای عملی ارائه دادند. بسیار ممنونم.',
    rating: 5,
  },
  {
    name: 'فاطمه اکبری',
    role: 'دانشجوی حقوق',
    initials: 'ف.ا',
    color: 'bg-cyan-600',
    quote:
      'به عنوان دانشجوی حقوق، از سیستم آموزش و مشاوره لِگال‌هاب استفاده کردم. کیفیت محتوا و دسترسی به وکلای متخصص فوق‌العاده است.',
    rating: 5,
  },
];

const faqs = [
  {
    q: 'مشاوره اول رایگان است؟',
    a: 'بله، اولین مشاوره ۱۵ دقیقه‌ای به صورت رایگان ارائه می‌شود تا شما با کیفیت خدمات ما آشنا شوید و بهترین تصمیم را بگیرید.',
  },
  {
    q: 'چگونه می‌توانم وکیل مناسب خود را انتخاب کنم؟',
    a: 'در لِگال‌هاب می‌توانید پروفایل وکلای متخصص را مشاهده کنید، سوابق و تخصص آن‌ها را بررسی کنید و بر اساس نیاز خود وکیل مورد نظر را انتخاب نمایید.',
  },
  {
    q: 'آیا اطلاعات من محرمانه باقی می‌ماند؟',
    a: 'بله، حفظ محرمانگی اطلاعات شما اولویت اصلی ماست. تمام ارتباطات با رمزنگاری پیشرفته محافظت شده و طبق قوانین حقوقی ایران عمل می‌کنیم.',
  },
  {
    q: 'مدت زمان پاسخگویی به درخواست‌ها چقدر است؟',
    a: 'مشاوره تلفنی و چتی در کمتر از ۳۰ دقیقه فعال می‌شود. برای مشاوره حضوری و ویدئویی، نوبت‌دهی در کمتر از ۲۴ ساعت انجام می‌گیرد.',
  },
  {
    q: 'هزینه‌ها چگونه محاسبه می‌شود؟',
    a: 'هزینه مشاوره بر اساس نوع و مدت زمان تعیین شده است. پس از ثبت‌نام، می‌توانید تعرفه دقیق هر نوع مشاوره را در پنل کاربری خود مشاهده کنید.',
  },
  {
    q: 'آیا امکان عقد قرارداد آنلاین وجود دارد؟',
    a: 'بله، پس از مشاوره اولیه می‌توانید قرارداد حقوقی خود را به صورت آنلاین در پنل کاربری امضا کنید و روند پیگیری پرونده آغاز می‌شود.',
  },
];

const legalAreas = [
  'حقوقی و مدنی',
  'کیفری',
  'خانواده',
  'تجاری و شرکتی',
  'کار و تامین اجتماعی',
  'مهاجرت',
  'مالیات',
  'مالکیت فکری',
];

const consultTypes = [
  'مشاوره تلفنی',
  'مشاوره چتی',
  'مشاوره ویدئویی',
  'مشاوره حضوری',
];

// ============ MAIN COMPONENT ============

export default function LandingPage() {
  const setPage = useAppStore((s) => s.setPage);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    consultationType: '',
    legalArea: '',
    description: '',
  });

  // Scroll listener
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

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const res = await fetch('/api/consultation-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormSuccess(true);
        setFormData({ name: '', phone: '', email: '', consultationType: '', legalArea: '', description: '' });
        setTimeout(() => setFormSuccess(false), 4000);
      }
    } catch {
      /* handled silently */
    } finally {
      setFormSubmitting(false);
    }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
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
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
                <Scale className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">لِگال‌هاب</span>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-6">
              <button onClick={() => scrollToSection('services')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">خدمات مشاوره</button>
              <button onClick={() => scrollToSection('areas')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">حوزه‌های حقوقی</button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">نحوه کار</button>
              <button onClick={() => scrollToSection('faq')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">سوالات متداول</button>
              <button onClick={() => scrollToSection('contact-form')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">تماس با ما</button>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground">
                {theme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setPage('login')}>ورود</Button>
              <Button size="sm" onClick={() => setPage('register')}>ثبت‌نام</Button>
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
                <button onClick={() => scrollToSection('services')} className="block w-full text-right text-sm text-muted-foreground hover:text-foreground py-2">خدمات مشاوره</button>
                <button onClick={() => scrollToSection('areas')} className="block w-full text-right text-sm text-muted-foreground hover:text-foreground py-2">حوزه‌های حقوقی</button>
                <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-right text-sm text-muted-foreground hover:text-foreground py-2">نحوه کار</button>
                <button onClick={() => scrollToSection('faq')} className="block w-full text-right text-sm text-muted-foreground hover:text-foreground py-2">سوالات متداول</button>
                <button onClick={() => scrollToSection('contact-form')} className="block w-full text-right text-sm text-muted-foreground hover:text-foreground py-2">تماس با ما</button>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" size="sm" onClick={() => { setPage('login'); setMobileMenuOpen(false); }}>ورود</Button>
                  <Button className="flex-1" size="sm" onClick={() => { setPage('register'); setMobileMenuOpen(false); }}>ثبت‌نام</Button>
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
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28 w-full">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
              <motion.div variants={fadeInUp}>
                <Badge className="mb-6 bg-white/15 text-white border-white/20 backdrop-blur-sm px-4 py-1.5 text-sm">
                  <Shield className="w-3.5 h-3.5 ml-1" />
                  مجوز رسمی از کانون وکلای دادگستری
                </Badge>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6"
              >
                مشاوره حقوقی تخصصی
                <br />
                <span className="text-emerald-200">با وکلای برتر ایران</span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-base sm:text-lg lg:text-xl text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
                اولین مشاوره رایگان. ثبت‌نام آنلاین، رزرو نوبت و دریافت مشاوره حقوقی
                در تمام حوزه‌ها. صفر تا صد پیگیری پرونده شما در پنل هوشمند لِگال‌هاب.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 shadow-xl shadow-black/10 text-base px-8 h-12"
                  onClick={() => scrollToSection('contact-form')}
                >
                  <PhoneCall className="w-4 h-4 ml-2" />
                  رزرو مشاوره رایگان
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm text-base px-8 h-12"
                  onClick={() => setPage('register')}
                >
                  <UserPlus className="w-4 h-4 ml-2" />
                  ثبت‌نام
                </Button>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap items-center justify-center gap-6 mt-10 text-white/80 text-sm"
              >
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <Clock className="w-4 h-4 text-emerald-200" />
                  <span>بیش از ۱۰ سال تجربه</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <Star className="w-4 h-4 text-emerald-200" />
                  <span>۹۶٪ رضایت مشتریان</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <Headphones className="w-4 h-4 text-emerald-200" />
                  <span>پشتیبانی ۲۴/۷</span>
                </div>
              </motion.div>
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

      {/* ============ 2. CONSULTATION TYPES SECTION ============ */}
      <section id="services" className="py-16 sm:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">خدمات مشاوره</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              نوع مشاوره خود را انتخاب کنید
            </h2>
            <p className="text-muted-foreground mt-3 text-base sm:text-lg max-w-2xl mx-auto">
              چهار روش مشاوره متناسب با نیاز و بودجه شما
            </p>
          </AnimatedSection>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {consultationTypes.map((item, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <Card className="group relative overflow-hidden border-border/50 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-full bg-card">
                  <div className={`absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-l ${item.color}`} />
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-lg`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-foreground text-base mb-1">{item.title}</h3>
                    <p className="text-primary font-extrabold text-xl mb-1">{item.price}</p>
                    <p className="text-muted-foreground text-sm mb-3">{item.duration}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">{item.desc}</p>
                    <Button
                      className="w-full"
                      size="sm"
                      onClick={() => scrollToSection('contact-form')}
                    >
                      رزرو مشاوره
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ 3. PRACTICE AREAS SECTION ============ */}
      <section id="areas" className="py-16 sm:py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">حوزه‌های حقوقی</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              تخصص در تمامی حوزه‌های حقوقی
            </h2>
            <p className="text-muted-foreground mt-3 text-base sm:text-lg max-w-2xl mx-auto">
              تیم وکلای متخصص ما در تمام شاخه‌های حقوقی آماده خدمت‌رسانی هستند
            </p>
          </AnimatedSection>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {practiceAreas.map((area, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <Card className="group hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 bg-card cursor-pointer h-full">
                  <CardContent className="p-5 sm:p-6 flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                      <area.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm mb-1">{area.title}</h3>
                    <p className="text-muted-foreground text-xs">{area.count}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ 4. HOW IT WORKS SECTION ============ */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">نحوه کار</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              سه مرحله ساده تا مشاوره حقوقی
            </h2>
            <p className="text-muted-foreground mt-3 text-base sm:text-lg max-w-2xl mx-auto">
              بدون نیاز به مراجعه حضوری - تمامی مراحل به صورت آنلاین
            </p>
          </AnimatedSection>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 relative"
          >
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 right-[20%] left-[20%] h-0.5 bg-gradient-to-l from-primary/40 via-primary/20 to-primary/40" />

            {[
              {
                step: '۱',
                icon: UserPlus,
                title: 'ثبت‌نام و انتخاب خدمات',
                desc: 'در کمتر از یک دقیقه ثبت‌نام کنید و نوع مشاوره و حوزه حقوقی مورد نظر خود را انتخاب کنید.',
              },
              {
                step: '۲',
                icon: CalendarCheck,
                title: 'رزرو نوبت مشاوره',
                desc: 'از تقویم هوشمند نوبت دلخواه خود را انتخاب و پرداخت آنلاین را انجام دهید.',
              },
              {
                step: '۳',
                icon: FileSignature,
                title: 'دریافت مشاوره و عقد قرارداد',
                desc: 'مشاوره حقوقی دریافت کنید و در صورت نیاز قرارداد وکالت را به صورت آنلاین امضا نمایید.',
              },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeInUp} className="relative text-center">
                <div className="flex flex-col items-center">
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

      {/* ============ 5. STATISTICS SECTION ============ */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-primary via-emerald-600 to-teal-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-white/20 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">اعداد ما صحبت می‌کنند</h2>
            <p className="text-white/70 mt-3 text-base sm:text-lg">اعتماد هزاران مشتری در سراسر ایران</p>
          </AnimatedSection>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {stats.map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </div>
        </div>
      </section>

      {/* ============ 6. TESTIMONIALS SECTION ============ */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">نظرات مشتریان</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              مشتریان ما چه می‌گویند
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
                      <div className="flex justify-center gap-1 mb-6">
                        {Array.from({ length: testimonials[testimonialIdx].rating }).map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <blockquote className="text-lg sm:text-xl text-foreground leading-relaxed mb-8 font-medium">
                        &laquo;{testimonials[testimonialIdx].quote}&raquo;
                      </blockquote>
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

              {/* Nav dots */}
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTestimonialIdx(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      i === testimonialIdx ? 'bg-primary w-8' : 'bg-primary/30'
                    }`}
                    aria-label={`نظر ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============ 7. FAQ SECTION ============ */}
      <section id="faq" className="py-16 sm:py-20 bg-secondary/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">سوالات متداول</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              پاسخ به سوالات شما
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <Card className="border-border/50 bg-card">
              <CardContent className="p-4 sm:p-6">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, i) => (
                    <AccordionItem key={i} value={`faq-${i}`}>
                      <AccordionTrigger className="text-right text-base font-medium">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed text-right">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </section>

      {/* ============ 8. CONSULTATION BOOKING FORM SECTION ============ */}
      <section id="contact-form" className="py-16 sm:py-20 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">فرم درخواست مشاوره</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              درخواست مشاوره خود را ثبت کنید
            </h2>
            <p className="text-muted-foreground mt-3 text-base sm:text-lg">
              کارشناسان ما در اسرع وقت با شما تماس خواهند گرفت
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <Card className="border-border/50 shadow-lg shadow-primary/5 bg-card">
              <CardContent className="p-6 sm:p-8">
                <form onSubmit={handleFormSubmit} className="space-y-5">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="form-name">نام و نام خانوادگی *</Label>
                    <Input
                      id="form-name"
                      name="name"
                      placeholder="مثال: علی محمدی"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="form-phone">شماره تلفن *</Label>
                    <Input
                      id="form-phone"
                      name="phone"
                      type="tel"
                      placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                      value={formData.phone}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="form-email">ایمیل</Label>
                    <Input
                      id="form-email"
                      name="email"
                      type="email"
                      placeholder="example@email.com"
                      value={formData.email}
                      onChange={handleFormChange}
                      dir="ltr"
                    />
                  </div>

                  {/* Consultation Type & Legal Area */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>نوع مشاوره</Label>
                      <Select
                        value={formData.consultationType}
                        onValueChange={(v) => setFormData((p) => ({ ...p, consultationType: v }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="انتخاب کنید" />
                        </SelectTrigger>
                        <SelectContent>
                          {consultTypes.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>حوزه حقوقی</Label>
                      <Select
                        value={formData.legalArea}
                        onValueChange={(v) => setFormData((p) => ({ ...p, legalArea: v }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="انتخاب کنید" />
                        </SelectTrigger>
                        <SelectContent>
                          {legalAreas.map((a) => (
                            <SelectItem key={a} value={a}>{a}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="form-desc">توضیحات مختصر</Label>
                    <Textarea
                      id="form-desc"
                      name="description"
                      placeholder="شرح مختصر مشکل یا سوال حقوقی خود را بنویسید..."
                      rows={4}
                      value={formData.description}
                      onChange={handleFormChange}
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full h-12 text-base"
                    disabled={formSubmitting}
                  >
                    {formSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        در حال ارسال...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 ml-2" />
                        ارسال درخواست مشاوره
                      </>
                    )}
                  </Button>

                  {/* Success message */}
                  <AnimatePresence>
                    {formSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        درخواست مشاوره شما با موفقیت ثبت شد. به زودی با شما تماس خواهیم گرفت.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </section>

      {/* ============ 9. FINAL CTA SECTION ============ */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-primary via-emerald-600 to-teal-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-10 left-20 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-10 right-20 w-80 h-80 rounded-full bg-white/20 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
              همین الان مشاوره رایگان بگیرید
            </h2>
            <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
              اولین مشاوره شما کاملاً رایگان است. بدون تعهد، بدون هزینه پنهان.
              ثبت‌نام کنید و از تخصص وکلای برتر بهره‌مند شوید.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 shadow-xl shadow-black/10 text-base px-8 h-12"
                onClick={() => setPage('register')}
              >
                <UserPlus className="w-4 h-4 ml-2" />
                ثبت‌نام رایگان
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm text-base px-8 h-12"
                onClick={() => setPage('login')}
              >
                <LogIn className="w-4 h-4 ml-2" />
                ورود به حساب کاربری
              </Button>
            </div>
            <div className="flex items-center justify-center gap-4 text-white/60 text-sm">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>بدون هزینه پنهان</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>لغو هر زمان</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>تضمین کیفیت</span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============ 10. FOOTER ============ */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                  <Scale className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground">لِگال‌هاب</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                پلتفرم جامع مشاوره حقوقی آنلاین. وکلای متخصص، مشاوره تلفنی، چتی، ویدئویی و حضوری.
              </p>
              {/* Social Media */}
              <div className="flex items-center gap-3">
                {['instagram', 'telegram', 'linkedin', 'twitter'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label={social}
                  >
                    <Globe2 className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">دسترسی سریع</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'درباره ما', action: () => {} },
                  { label: 'قوانین و مقررات', action: () => {} },
                  { label: 'حریم خصوصی', action: () => {} },
                  { label: 'تماس با ما', action: () => scrollToSection('contact-form') },
                ].map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={link.action}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">خدمات</h4>
              <ul className="space-y-2.5">
                {['مشاوره تلفنی', 'مشاوره چتی', 'مشاوره ویدئویی', 'مشاوره حضوری'].map((service) => (
                  <li key={service}>
                    <button
                      onClick={() => scrollToSection('services')}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {service}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">اطلاعات تماس</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span dir="ltr">021-9130XXXX</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <span dir="ltr">info@legalhub.ir</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground text-sm">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>تهران، خیابان ولیعصر، پلاک ۱۲۳</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-border pt-6 text-center">
            <p className="text-muted-foreground text-sm">
              تمامی حقوق مادی و معنوی این وب‌سایت متعلق به لِگال‌هاب است. ۱۴۰۴ - طراحی و توسعه با افتخار.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============ STAT CARD COMPONENT ============

function StatCard({ value, suffix, label, icon: Icon }: { value: number; suffix: string; label: string; icon: React.ComponentType<{ className?: string }> }) {
  const { count, ref } = useCounter(value);
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
      }}
      className="text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div className="text-3xl sm:text-4xl font-extrabold text-white mb-1">
        {count.toLocaleString('fa-IR')}{suffix}
      </div>
      <div className="text-white/70 text-sm">{label}</div>
    </motion.div>
  );
}
