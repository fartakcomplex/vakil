'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';

// Client-only wrapper to prevent hydration mismatches
function ClientOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  return mounted ? <>{children}</> : <>{fallback}</>;
}
import { motion, useInView, AnimatePresence, useScroll, useTransform } from 'framer-motion';
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
  Mail,
  MapPin,
  PhoneCall,
  ArrowLeft,
  Send,
  UserPlus,
  LogIn,
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
  Zap,
  Award,
  TrendingUp,
  Lock,
  Eye,
  Sparkles,
  Crown,
  ArrowUpLeft,
  Quote,
  Play,
  Timer,
  CheckCircle2,
  CircleDot,
  MessageSquare,
  Instagram,
  Linkedin,
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

const fadeInLeft = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const fadeInRight = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
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

// ============ FLOATING ICONS BACKGROUND ============
function FloatingIcons() {
  const icons = [
    { Icon: Scale, x: '10%', y: '20%', size: 24, delay: 0 },
    { Icon: Gavel, x: '85%', y: '15%', size: 20, delay: 1.5 },
    { Icon: FileText, x: '70%', y: '70%', size: 22, delay: 0.8 },
    { Icon: Shield, x: '20%', y: '75%', size: 18, delay: 2.2 },
    { Icon: Award, x: '90%', y: '45%', size: 16, delay: 3.0 },
    { Icon: Scale, x: '5%', y: '55%', size: 14, delay: 1.0 },
    { Icon: Briefcase, x: '50%', y: '10%', size: 20, delay: 2.5 },
    { Icon: Landmark, x: '35%', y: '80%', size: 16, delay: 0.5 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {icons.map(({ Icon, x, y, size, delay }, i) => (
        <motion.div
          key={i}
          className="absolute text-white/[0.07]"
          style={{ left: x, top: y }}
          animate={{
            y: [0, -20, 0, 20, 0],
            rotate: [0, 5, 0, -5, 0],
            opacity: [0.05, 0.12, 0.05, 0.12, 0.05],
          }}
          transition={{
            duration: 8 + seededRandom(i + 500) * 4,
            delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Icon size={size} />
        </motion.div>
      ))}
    </div>
  );
}

// ============ PARTICLES BACKGROUND ============
// Deterministic pseudo-random based on index to avoid hydration mismatch
function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
function Particles() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const particles = useMemo(() => 
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: seededRandom(i) * 100,
      y: seededRandom(i + 100) * 100,
      size: seededRandom(i + 200) * 3 + 1,
      duration: seededRandom(i + 300) * 4 + 6,
      delay: seededRandom(i + 400) * 5,
    })), []
  );
  if (!mounted) return <div className="absolute inset-0 overflow-hidden pointer-events-none" />;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

// ============ MARQUEE ============
function InfiniteMarquee({ items, speed = 30 }: { items: string[]; speed?: number }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <motion.div
        className="inline-flex"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 mx-6 text-sm text-white/60 font-medium">
            <CircleDot className="w-1.5 h-1.5 text-emerald-400" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ============ GRADIENT TEXT ============
function GradientText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`bg-clip-text text-transparent bg-gradient-to-l from-emerald-300 via-teal-200 to-cyan-300 ${className}`} style={{ fontFamily: "'Lalezar', sans-serif" }}>
      {children}
    </span>
  );
}

// ============ GLOW BUTTON ============
function GlowButton({ children, className = '', onClick, variant = 'primary' }: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'primary' | 'outline';
}) {
  return (
    <motion.div whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}>
      <Button
        size="lg"
        onClick={onClick}
        className={`relative overflow-hidden group text-base px-8 h-13 font-semibold ${
          variant === 'primary'
            ? 'bg-white text-emerald-700 hover:bg-white/95 shadow-[0_0_30px_rgba(255,255,255,0.3)]'
            : 'border-2 border-white/40 text-white hover:bg-white/15 backdrop-blur-md'
        } ${className}`}
      >
        <span className="relative z-10 flex items-center gap-2">{children}</span>
        {variant === 'primary' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-l from-emerald-200 to-teal-200 opacity-0 group-hover:opacity-20 transition-opacity"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </Button>
    </motion.div>
  );
}

// ============ DATA ============
const consultationTypes = [
  {
    icon: Phone,
    title: 'مشاوره تلفنی',
    price: '۳۰۰,۰۰۰',
    priceSuffix: 'تومان',
    duration: '۳۰ دقیقه',
    desc: 'مشاوره فوری تلفنی با وکلای مجرب در تمام حوزه‌های حقوقی. بدون نیاز به مراجعه حضوری.',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    features: ['پاسخ فوری', 'بدون نیاز به حضور', 'مذاکره مستقیم'],
  },
  {
    icon: MessageCircle,
    title: 'مشاوره چتی',
    price: '۲۰۰,۰۰۰',
    priceSuffix: 'تومان',
    duration: '۳۰ دقیقه',
    desc: 'مشاوره متنی آنلاین با پاسخگویی سریع و دقیق. متن مکالمه قابل ارجاع آینده.',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    features: ['ثبت متن کامل', 'ارسال فایل', 'پاسخ سریع'],
  },
  {
    icon: Video,
    title: 'مشاوره ویدئویی',
    price: '۵۰۰,۰۰۰',
    priceSuffix: 'تومان',
    duration: '۴۵ دقیقه',
    desc: 'مشاوره تصویری زنده با ارتباط رو در رو مجازی. نزدیک‌ترین تجربه به جلسه حضوری.',
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
    features: ['ارتباط رو در رو', 'اشتراک‌گذاری صفحه', 'ضبط جلسه'],
  },
  {
    icon: Users,
    title: 'مشاوره حضوری',
    price: '۱,۰۰۰,۰۰۰',
    priceSuffix: 'تومان',
    duration: '۶۰ دقیقه',
    desc: 'جلسه حضوری در دفتر مرکزی با وکیل اختصاصی. بررسی مستندات و مدارک.',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    features: ['بررسی مدارک', 'جلسه اختصاصی', 'پیگیری حضوری'],
  },
];

const practiceAreas = [
  { icon: Scale, title: 'حقوقی و مدنی', count: '+۲,۵۰۰', color: 'text-emerald-600 dark:text-emerald-400' },
  { icon: Gavel, title: 'کیفری', count: '+۱,۸۰۰', color: 'text-red-600 dark:text-red-400' },
  { icon: HeartHandshake, title: 'خانواده', count: '+۳,۲۰۰', color: 'text-pink-600 dark:text-pink-400' },
  { icon: Building2, title: 'تجاری و شرکتی', count: '+۱,۵۰۰', color: 'text-blue-600 dark:text-blue-400' },
  { icon: Briefcase, title: 'کار و تامین اجتماعی', count: '+۱,۲۰۰', color: 'text-amber-600 dark:text-amber-400' },
  { icon: Globe2, title: 'مهاجرت', count: '+۹۰۰', color: 'text-cyan-600 dark:text-cyan-400' },
  { icon: Landmark, title: 'مالیات', count: '+۸۰۰', color: 'text-violet-600 dark:text-violet-400' },
  { icon: FileText, title: 'مالکیت فکری', count: '+۶۰۰', color: 'text-teal-600 dark:text-teal-400' },
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
    color: 'from-emerald-500 to-teal-600',
    quote: 'پرونده طلاق من بسیار پیچیده بود، اما وکلای لِگال‌هاب با حرفه‌ای‌گری کامل آن را پیگیری کردند. مشاوره اول رایگان بود و باعث شد خیالم راحت شود.',
    rating: 5,
  },
  {
    name: 'رضا کریمی',
    role: 'مدیرعامل شرکت فناوری',
    initials: 'ر.ک',
    color: 'from-blue-500 to-indigo-600',
    quote: 'برای مسائل مالیاتی شرکت نیاز به مشاوره فوری داشتیم. مشاوره تلفنی سریع و دقیق بود و راهکارهای عملی ارائه دادند. بسیار ممنونم.',
    rating: 5,
  },
  {
    name: 'فاطمه اکبری',
    role: 'دانشجوی حقوق',
    initials: 'ف.ا',
    color: 'from-violet-500 to-purple-600',
    quote: 'به عنوان دانشجوی حقوق، از سیستم آموزش و مشاوره لِگال‌هاب استفاده کردم. کیفیت محتوا و دسترسی به وکلای متخصص فوق‌العاده است.',
    rating: 5,
  },
];

const faqs = [
  { q: 'مشاوره اول رایگان است؟', a: 'بله، اولین مشاوره ۱۵ دقیقه‌ای به صورت رایگان ارائه می‌شود تا شما با کیفیت خدمات ما آشنا شوید و بهترین تصمیم را بگیرید.' },
  { q: 'چگونه می‌توانم وکیل مناسب خود را انتخاب کنم؟', a: 'در لِگال‌هاب می‌توانید پروفایل وکلای متخصص را مشاهده کنید، سوابق و تخصص آن‌ها را بررسی کنید و بر اساس نیاز خود وکیل مورد نظر را انتخاب نمایید.' },
  { q: 'آیا اطلاعات من محرمانه باقی می‌ماند؟', a: 'بله، حفظ محرمانگی اطلاعات شما اولویت اصلی ماست. تمام ارتباطات با رمزنگاری پیشرفته محافظت شده و طبق قوانین حقوقی ایران عمل می‌کنیم.' },
  { q: 'مدت زمان پاسخگویی به درخواست‌ها چقدر است؟', a: 'مشاوره تلفنی و چتی در کمتر از ۳۰ دقیقه فعال می‌شود. برای مشاوره حضوری و ویدئویی، نوبت‌دهی در کمتر از ۲۴ ساعت انجام می‌گیرد.' },
  { q: 'هزینه‌ها چگونه محاسبه می‌شود؟', a: 'هزینه مشاوره بر اساس نوع و مدت زمان تعیین شده است. پس از ثبت‌نام، می‌توانید تعرفه دقیق هر نوع مشاوره را در پنل کاربری خود مشاهده کنید.' },
  { q: 'آیا امکان عقد قرارداد آنلاین وجود دارد؟', a: 'بله، پس از مشاوره اولیه می‌توانید قرارداد حقوقی خود را به صورت آنلاین در پنل کاربری امضا کنید و روند پیگیری پرونده آغاز می‌شود.' },
];

const featuredLawyers = [
  { name: 'دکتر احمد نوری', spec: 'حقوق تجاری بین‌المللی', exp: '۱۸ سال', rating: 4.9, cases: 850, color: 'from-emerald-500 to-teal-600' },
  { name: 'سرکار زهرا محمدی', spec: 'خانواده و طلاق', exp: '۱۲ سال', rating: 4.8, cases: 1200, color: 'from-pink-500 to-rose-600' },
  { name: 'دکتر علیرضا حسینی', spec: 'کیفری و جرایم', exp: '۱۵ سال', rating: 4.9, cases: 650, color: 'from-blue-500 to-indigo-600' },
];

const marqueeItems = [
  'حقوقی و مدنی',
  'کیفری',
  'خانواده و طلاق',
  'تجاری و شرکتی',
  'کار و تامین اجتماعی',
  'مهاجرت',
  'مالیات',
  'ملکی',
  'مالکیت فکری',
  'دانشگاهی',
  'سایبری',
  'پزشکی',
];

const legalAreas = ['حقوقی و مدنی', 'کیفری', 'خانواده', 'تجاری و شرکتی', 'کار و تامین اجتماعی', 'مهاجرت', 'مالیات', 'مالکیت فکری'];
const consultTypes = ['مشاوره تلفنی', 'مشاوره چتی', 'مشاوره ویدئویی', 'مشاوره حضوری'];

// ============ LIVE COUNTER (fake but realistic) ============
function useLiveCounter() {
  const [count, setCount] = useState(47);
  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => {
        const delta = Math.random() > 0.4 ? 1 : -1;
        return Math.max(23, Math.min(89, prev + delta));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  return count;
}

// ============ STAT CARD ============
function StatCard({ value, suffix, label, icon: Icon }: { value: number; suffix: string; label: string; icon: React.ComponentType<{ className?: string }> }) {
  const { count, ref } = useCounter(value);
  return (
    <div ref={ref} className="text-center group">
      <div className="relative inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-4 group-hover:bg-white/20 transition-colors group-hover:scale-110 transition-transform">
        <Icon className="w-7 h-7 text-white" />
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-white/20"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-1">
        {count.toLocaleString('fa-IR')}
        <span className="text-emerald-300">{suffix}</span>
      </div>
      <div className="text-white/60 text-sm font-medium">{label}</div>
    </div>
  );
}

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
  const [selectedConsult, setSelectedConsult] = useState<number | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const liveCount = useLiveCounter();

  // Parallax
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

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
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowStickyBar(window.scrollY > 600);
    };
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

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    } catch { /* handled silently */ } finally {
      setFormSubmitting(false);
    }
  };

  const scrollToSection = useCallback((id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ============ STICKY NAVIGATION ============ */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-background/70 backdrop-blur-2xl border-b border-border/50 shadow-lg shadow-black/5'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <motion.div
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25"
                whileHover={{ rotate: 12, scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Scale className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-lg font-bold text-foreground">لِگال‌هاب</span>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {[
                { label: 'خدمات مشاوره', id: 'services' },
                { label: 'تیم وکلای ما', id: 'lawyers' },
                { label: 'نحوه کار', id: 'how-it-works' },
                { label: 'نظرات', id: 'testimonials' },
                { label: 'سوالات متداول', id: 'faq' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground">
                {theme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setPage('login')} className="hover:bg-muted/50">ورود</Button>
              <Button
                size="sm"
                onClick={() => scrollToSection('contact-form')}
                className="bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20"
              >
                رزرو مشاوره رایگان
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
              className="lg:hidden bg-background/95 backdrop-blur-2xl border-b border-border"
            >
              <div className="px-4 py-4 space-y-1">
                {[
                  { label: 'خدمات مشاوره', id: 'services' },
                  { label: 'تیم وکلای ما', id: 'lawyers' },
                  { label: 'نحوه کار', id: 'how-it-works' },
                  { label: 'نظرات', id: 'testimonials' },
                  { label: 'سوالات متداول', id: 'faq' },
                ].map((item) => (
                  <button key={item.id} onClick={() => scrollToSection(item.id)} className="block w-full text-right text-sm text-muted-foreground hover:text-foreground py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">{item.label}</button>
                ))}
                <div className="flex gap-2 pt-3 px-3">
                  <Button variant="outline" className="flex-1" size="sm" onClick={() => { setPage('login'); setMobileMenuOpen(false); }}>ورود</Button>
                  <Button className="flex-1 bg-gradient-to-l from-emerald-600 to-teal-600 text-white" size="sm" onClick={() => { scrollToSection('contact-form'); setMobileMenuOpen(false); }}>رزرو مشاوره</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ============ HERO SECTION ============ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-950" />
        
        {/* Animated mesh gradient overlay */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full opacity-30"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)' }}
            animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full opacity-25"
            style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.4) 0%, transparent 70%)' }}
            animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/3 left-1/2 w-[500px] h-[500px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)' }}
            animate={{ x: [0, 30, 0], y: [0, -50, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <FloatingIcons />
        <Particles />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32 w-full">
          <div className="text-center max-w-5xl mx-auto">
            <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
              {/* Urgency badge */}
              <motion.div variants={fadeInUp} className="flex justify-center mb-8">
                <motion.div
                  className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm rounded-full px-5 py-2.5"
                  animate={{ boxShadow: ['0 0 0 0 rgba(16,185,129,0.3)', '0 0 20px 4px rgba(16,185,129,0.15)', '0 0 0 0 rgba(16,185,129,0.3)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <span className="text-emerald-400 text-sm font-medium">
                    اکنون {liveCount} نفر در حال دریافت مشاوره هستند
                  </span>
                </motion.div>
              </motion.div>

              {/* Main heading */}
              <motion.h1 variants={fadeInUp} className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-snug sm:leading-tight mb-6 tracking-tight" style={{ fontFamily: "'Lalezar', sans-serif" }}>
                راهکار حقوقی هوشمند
                <br />
                <GradientText>برای هر مسئله‌ای</GradientText>
              </motion.h1>

              {/* Subtitle */}
              <motion.p variants={fadeInUp} className="text-base sm:text-lg lg:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
                اولین مشاوره رایگان. مشاوره تلفنی، چتی و ویدئویی با وکلای برتر ایران.
                ثبت‌نام آنلاین و رزرو نوبت فوری.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12">
                <GlowButton variant="primary" className="w-full sm:w-auto" onClick={() => scrollToSection('contact-form')}>
                  <PhoneCall className="w-5 h-5" />
                  مشاوره رایگان ۱۵ دقیقه‌ای
                </GlowButton>
                <GlowButton variant="outline" className="w-full sm:w-auto" onClick={() => scrollToSection('services')}>
                  <Play className="w-4 h-4" />
                  مشاهده خدمات
                </GlowButton>
              </motion.div>

              {/* Trust badges row */}
              <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                {[
                  { icon: Shield, label: 'مجوز رسمی کانون وکلا', color: 'text-emerald-400' },
                  { icon: Lock, label: 'محرمانگی اطلاعات', color: 'text-blue-400' },
                  { icon: Clock, label: 'پشتیبانی ۲۴ ساعته', color: 'text-amber-400' },
                  { icon: Award, label: '۱۰+ سال تجربه', color: 'text-violet-400' },
                ].map((badge, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-2 bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] rounded-xl px-4 py-2.5"
                    whileHover={{ y: -2, backgroundColor: 'rgba(255,255,255,0.1)' }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <badge.icon className={`w-4 h-4 ${badge.color}`} />
                    <span className="text-white/70 text-xs sm:text-sm">{badge.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ============ INFINITE MARQUEE ============ */}
      <div className="bg-background border-y border-border/50 py-4">
        <InfiniteMarquee items={marqueeItems} />
      </div>

      {/* ============ CONSULTATION TYPES ============ */}
      <section id="services" className="py-14 sm:py-20 lg:py-28 bg-background relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/[0.03] rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              خدمات مشاوره
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-4" style={{ fontFamily: "'Lalezar', sans-serif" }}>
              نوع مشاوره خود را انتخاب کنید
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              چهار روش متنوع مشاوره حقوقی — متناسب با نیاز، بودجه و زمان شما
            </p>
          </AnimatedSection>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
          >
            {consultationTypes.map((item, i) => (
              <motion.div key={i} variants={scaleIn}>
                <Card
                  className={`group relative overflow-hidden cursor-pointer transition-all duration-500 h-full bg-card hover:shadow-2xl hover:shadow-primary/10 ${
                    selectedConsult === i ? `border-primary/50 ring-2 ring-primary/20 ${item.bgColor}` : 'border-border/50 hover:border-primary/30'
                  }`}
                  onClick={() => setSelectedConsult(selectedConsult === i ? null : i)}
                >
                  {/* Top accent line */}
                  <div className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-l ${item.color} transition-all duration-300 ${selectedConsult === i ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />

                  <CardContent className="p-5 sm:p-6">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Title & Price */}
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-foreground text-lg">{item.title}</h3>
                      <Badge variant="secondary" className="text-xs shrink-0 mr-2">{item.duration}</Badge>
                    </div>
                    <p className="text-primary font-extrabold text-xl mb-3">
                      {item.price} <span className="text-sm font-normal text-muted-foreground">{item.priceSuffix}</span>
                    </p>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">{item.desc}</p>

                    {/* Features */}
                    <div className="space-y-2 mb-5">
                      {item.features.map((f, fi) => (
                        <div key={fi} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className={`w-4 h-4 shrink-0`} style={{ color: selectedConsult === i ? 'var(--primary)' : 'var(--muted-foreground)' }} />
                          {f}
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <Button
                      className="w-full group-hover:shadow-lg transition-all duration-300"
                      onClick={(e) => { e.stopPropagation(); scrollToSection('contact-form'); }}
                    >
                      رزرو مشاوره
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ BENTO GRID - WHY US ============ */}
      <section className="py-14 sm:py-20 lg:py-28 bg-secondary/20 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <Crown className="w-4 h-4" />
              چرا لِگال‌هاب؟
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-4" style={{ fontFamily: "'Lalezar', sans-serif" }}>
              مزیت‌هایی که ما را متمایز می‌کند
            </h2>
          </AnimatedSection>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {/* Large card */}
            <motion.div variants={fadeInUp} className="lg:col-span-2">
              <Card className="group relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 text-white h-full border-0">
                <CardContent className="p-8 sm:p-10 relative z-10">
                  <div className="flex flex-col lg:flex-row items-start gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-3">حفظ کامل محرمانگی اطلاعات</h3>
                      <p className="text-white/80 leading-relaxed mb-4">
                        تمامی ارتباطات و اطلاعات شما با بالاترین سطح رمزنگاری محافظت می‌شود.
                        ما طبق قوانین حقوقی ایران و استانداردهای بین‌المللی حریم خصوصی عمل می‌کنیم
                        و هیچ‌گونه اطلاعاتی را با اشخاص ثالث به اشتراک نمی‌گذاریم.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {['رمزنگاری AES-256', 'سرورهای امن ایران', 'تاییدیه کانون وکلا'].map((tag, i) => (
                          <span key={i} className="bg-white/15 backdrop-blur-sm rounded-lg px-3 py-1.5 text-sm">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
              </Card>
            </motion.div>

            {/* Small card */}
            <motion.div variants={fadeInUp}>
              <Card className="group h-full bg-card border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-500 overflow-hidden">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">پاسخ‌دهی فوری</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    مشاوره تلفنی در کمتر از ۳۰ دقیقه فعال می‌شود. پشتیبانی ۲۴ ساعته و آنلاین.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* More small cards */}
            {[
              { icon: Eye, title: 'شفافیت کامل', desc: 'ردیابی لحظه‌ای پرونده. تمامی اقدامات وکلای شما قابل مشاهده و پیگیری است.', color: 'bg-blue-500/10', iconColor: 'text-blue-500' },
              { icon: TrendingUp, title: 'نرخ برد بالا', desc: '۹۶٪ موفقیت در پرونده‌های حقوقی. آمار شفاف و مستند از عملکرد وکلا.', color: 'bg-emerald-500/10', iconColor: 'text-emerald-500' },
              { icon: Users, title: 'تیم متخصص', desc: 'بیش از ۵۰ وکیل متخصص در تمامی حوزه‌های حقوقی با سابقه ثابت شده.', color: 'bg-violet-500/10', iconColor: 'text-violet-500' },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <Card className="group h-full bg-card border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-500 overflow-hidden">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ FEATURED LAWYERS SECTION ============ */}
      <section id="lawyers" className="py-14 sm:py-20 lg:py-28 bg-background relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-emerald-500/[0.04] rounded-full blur-3xl -translate-y-1/2" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <BadgeCheck className="w-4 h-4" />
              تیم وکلای ما
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-4" style={{ fontFamily: "'Lalezar', sans-serif" }}>
              وکلای برتر، نتایج استثنایی
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              تیم مجرب ما از بهترین وکلای ایران با تخصص‌های متنوع حقوقی تشکیل شده است
            </p>
          </AnimatedSection>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
          >
            {featuredLawyers.map((lawyer, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <Card className="group relative overflow-hidden bg-card border-border/50 hover:shadow-2xl hover:border-primary/30 transition-all duration-500 h-full">
                  <CardContent className="p-6 sm:p-8">
                    {/* Avatar & badge */}
                    <div className="flex items-start gap-4 mb-5">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${lawyer.color} flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {lawyer.name.split(' ').slice(1, 2).map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground text-lg leading-tight">{lawyer.name}</h3>
                        <p className="text-primary text-sm font-medium">{lawyer.spec}</p>
                      </div>
                      <Badge variant="secondary" className="shrink-0 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">
                        <Star className="w-3 h-3 ml-1 fill-amber-500 text-amber-500" />
                        {lawyer.rating}
                      </Badge>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="bg-muted/50 rounded-xl p-3 text-center">
                        <p className="text-lg font-bold text-foreground">{lawyer.exp}</p>
                        <p className="text-xs text-muted-foreground">سابقه فعالیت</p>
                      </div>
                      <div className="bg-muted/50 rounded-xl p-3 text-center">
                        <p className="text-lg font-bold text-foreground">{lawyer.cases.toLocaleString('fa-IR')}+</p>
                        <p className="text-xs text-muted-foreground">پرونده موفق</p>
                      </div>
                    </div>

                    {/* CTA */}
                    <Button
                      variant="outline"
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                      onClick={() => scrollToSection('contact-form')}
                    >
                      رزرو نوبت مشاوره
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Practice areas quick scroll */}
          <AnimatedSection delay={0.2} className="mt-16">
            <h3 className="text-center text-lg font-semibold text-foreground mb-6" style={{ fontFamily: "'Lalezar', sans-serif" }}>حوزه‌های تخصصی حقوقی</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {practiceAreas.map((area, i) => (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={scaleIn}
                >
                  <Card className="group cursor-pointer hover:border-primary/30 hover:shadow-lg transition-all duration-300 bg-card border-border/50">
                    <CardContent className="px-4 py-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                        <area.icon className={`w-5 h-5 ${area.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{area.title}</p>
                        <p className="text-xs text-muted-foreground">{area.count} پرونده</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how-it-works" className="py-14 sm:py-20 lg:py-28 bg-secondary/20 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <Timer className="w-4 h-4" />
              نحوه کار
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-4" style={{ fontFamily: "'Lalezar', sans-serif" }}>
              در سه مرحله مشاوره بگیرید
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              بدون نیاز به مراجعه حضوری — تمامی مراحل به صورت آنلاین و در کمترین زمان
            </p>
          </AnimatedSection>

          <div className="max-w-4xl mx-auto">
            {/* Vertical timeline for mobile, horizontal for desktop */}
            <div className="relative">
              {/* Connecting line (desktop) */}
              <div className="hidden md:block absolute top-24 right-[16%] left-[16%] h-0.5">
                <motion.div
                  className="h-full bg-gradient-to-l from-emerald-500/40 via-primary/40 to-emerald-500/40 rounded-full"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  style={{ transformOrigin: 'right' }}
                />
              </div>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                className="space-y-8 md:space-y-0 md:grid md:grid-cols-3 md:gap-8"
              >
                {[
                  {
                    step: '۰۱',
                    icon: UserPlus,
                    title: 'ثبت‌نام سریع',
                    desc: 'در کمتر از یک دقیقه ثبت‌نام کنید. فقط نام و شماره تلفن کافیست.',
                    color: 'from-emerald-500 to-teal-600',
                  },
                  {
                    step: '۰۲',
                    icon: CalendarCheck,
                    title: 'انتخاب وکیل و رزرو نوبت',
                    desc: 'پروفایل وکلای متخصص را ببینید، وکیل مناسب را انتخاب و نوبت بگیرید.',
                    color: 'from-blue-500 to-indigo-600',
                  },
                  {
                    step: '۰۳',
                    icon: FileSignature,
                    title: 'دریافت مشاوره و عقد قرارداد',
                    desc: 'مشاوره حقوقی دریافت کنید و در صورت نیاز قرارداد را به صورت آنلاین امضا کنید.',
                    color: 'from-violet-500 to-purple-600',
                  },
                ].map((item, i) => (
                  <motion.div key={i} variants={fadeInUp} className="relative text-center">
                    <div className="flex flex-col items-center">
                      {/* Step circle */}
                      <motion.div
                        className="relative mb-6"
                        whileHover={{ scale: 1.08 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-xl`}>
                          <item.icon className="w-9 h-9 text-white" />
                        </div>
                        <div className="absolute -top-3 -right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center shadow-lg">
                          <span className="text-xs sm:text-sm font-extrabold text-primary">{item.step}</span>
                        </div>
                        {/* Pulse ring */}
                        <motion.div
                          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.color} opacity-20`}
                          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0, 0.2] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                        />
                      </motion.div>
                      <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ STATISTICS ============ */}
      <section className="py-14 sm:py-20 lg:py-28 bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-950 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-3" style={{ fontFamily: "'Lalezar', sans-serif" }}>
              اعداد، حرف می‌زنند
            </h2>
            <p className="text-white/50 text-base sm:text-lg">اعتماد هزاران مشتری در سراسر ایران</p>
          </AnimatedSection>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section id="testimonials" className="py-14 sm:py-20 lg:py-28 bg-background relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <MessageSquare className="w-4 h-4" />
              نظرات مشتریان
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-4" style={{ fontFamily: "'Lalezar', sans-serif" }}>
              رضایت مشتریان، افتخار ماست
            </h2>
          </AnimatedSection>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
          >
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <Card className={`group h-full bg-card border-border/50 hover:shadow-2xl hover:border-primary/30 transition-all duration-500 relative overflow-hidden ${
                  testimonialIdx === i ? 'ring-2 ring-primary/30' : ''
                }`}>
                  {/* Quote decoration */}
                  <div className="absolute top-4 left-4 text-primary/10">
                    <Quote className="w-12 h-12" />
                  </div>

                  <CardContent className="p-6 sm:p-8 relative z-10">
                    {/* Stars */}
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: t.rating }).map((_, si) => (
                        <Star key={si} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    {/* Quote */}
                    <blockquote className="text-foreground leading-relaxed mb-6 text-sm sm:text-base">
                      &laquo;{t.quote}&raquo;
                    </blockquote>

                    {/* Author */}
                    <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                        {t.initials}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground text-sm">{t.name}</div>
                        <div className="text-muted-foreground text-xs">{t.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ FAQ SECTION ============ */}
      <section id="faq" className="py-14 sm:py-20 lg:py-28 bg-secondary/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <MessageCircle className="w-4 h-4" />
              سوالات متداول
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground" style={{ fontFamily: "'Lalezar', sans-serif" }}>
              پاسخ سوالات شما
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <Card className="border-border/50 bg-card shadow-lg shadow-primary/5">
              <CardContent className="p-4 sm:p-6">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, i) => (
                    <AccordionItem key={i} value={`faq-${i}`}>
                      <AccordionTrigger className="text-right text-base font-medium hover:no-underline">
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

      {/* ============ CONSULTATION FORM ============ */}
      <section id="contact-form" className="py-14 sm:py-20 lg:py-28 bg-background relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/[0.04] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/[0.04] rounded-full blur-3xl" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <Send className="w-4 h-4" />
              درخواست مشاوره
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-4" style={{ fontFamily: "'Lalezar', sans-serif" }}>
              همین الان شروع کنید
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              فرم زیر را پر کنید تا کارشناسان ما در اسرع وقت با شما تماس بگیرند
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <Card className="border-border/50 shadow-2xl shadow-primary/5 bg-card relative overflow-hidden">
              {/* Top gradient bar */}
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-l from-emerald-500 via-teal-500 to-cyan-500" />

              <CardContent className="p-6 sm:p-8">
                <form onSubmit={handleFormSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="form-name">نام و نام خانوادگی *</Label>
                      <Input id="form-name" name="name" placeholder="مثال: علی محمدی" value={formData.name} onChange={handleFormChange} required className="h-12 sm:h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="form-phone">شماره تلفن *</Label>
                      <Input id="form-phone" name="phone" type="tel" placeholder="۰۹۱۲۳۴۵۶۷۸۹" value={formData.phone} onChange={handleFormChange} required className="h-12 sm:h-11" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="form-email">ایمیل</Label>
                    <Input id="form-email" name="email" type="email" placeholder="example@email.com" value={formData.email} onChange={handleFormChange} dir="ltr" className="h-12 sm:h-11" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>نوع مشاوره</Label>
                      <Select value={formData.consultationType} onValueChange={(v) => setFormData((p) => ({ ...p, consultationType: v }))}>
                        <SelectTrigger className="w-full h-12 sm:h-11"><SelectValue placeholder="انتخاب کنید" /></SelectTrigger>
                        <SelectContent>
                          {consultTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>حوزه حقوقی</Label>
                      <Select value={formData.legalArea} onValueChange={(v) => setFormData((p) => ({ ...p, legalArea: v }))}>
                        <SelectTrigger className="w-full h-12 sm:h-11"><SelectValue placeholder="انتخاب کنید" /></SelectTrigger>
                        <SelectContent>
                          {legalAreas.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="form-desc">توضیحات مختصر</Label>
                    <Textarea id="form-desc" name="description" placeholder="شرح مختصر مشکل یا سوال حقوقی خود را بنویسید..." rows={4} value={formData.description} onChange={handleFormChange} />
                  </div>

                  <Button type="submit" className="w-full h-12 text-base bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 font-semibold" disabled={formSubmitting}>
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

                  <AnimatePresence>
                    {formSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg"
                      >
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        درخواست شما با موفقیت ثبت شد. کارشناسان ما به زودی تماس خواهند گرفت.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="py-14 sm:py-20 lg:py-28 bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-950 relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)' }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6" style={{ fontFamily: "'Lalezar', sans-serif" }}>
              آماده حل مسئله حقوقی
              <br />
              <GradientText>خود هستید؟</GradientText>
            </h2>
            <p className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              همین الان ثبت‌نام کنید و اولین مشاوره رایگان ۱۵ دقیقه‌ای خود را دریافت کنید.
              تیم وکلای متخصص ما آماده خدمت‌رسانی به شماست.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <GlowButton variant="primary" className="w-full sm:w-auto" onClick={() => scrollToSection('contact-form')}>
                <PhoneCall className="w-5 h-5" />
                شروع مشاوره رایگان
              </GlowButton>
              <GlowButton variant="outline" className="w-full sm:w-auto" onClick={() => setPage('register')}>
                <UserPlus className="w-5 h-5" />
                ثبت‌نام در سایت
              </GlowButton>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-slate-950 border-t border-white/10 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Scale className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">لِگال‌هاب</span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed mb-4">
                سامانه مشاوره حقوقی آنلاین با تیم وکلای متخصص. صفر تا صد پیگیری پرونده حقوقی شما.
              </p>
              <div className="flex gap-3">
                <motion.a href="#" whileHover={{ scale: 1.1, y: -2 }} className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-colors">
                  <Instagram className="w-4 h-4" />
                </motion.a>
                <motion.a href="#" whileHover={{ scale: 1.1, y: -2 }} className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-colors">
                  <Linkedin className="w-4 h-4" />
                </motion.a>
                <motion.a href="#" whileHover={{ scale: 1.1, y: -2 }} className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                </motion.a>
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="font-semibold text-white mb-4">خدمات ما</h4>
              <ul className="space-y-2.5">
                {consultationTypes.map((c, i) => (
                  <li key={i}>
                    <button onClick={() => scrollToSection('services')} className="text-sm text-white/50 hover:text-white transition-colors">{c.title}</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas */}
            <div>
              <h4 className="font-semibold text-white mb-4">حوزه‌های حقوقی</h4>
              <ul className="space-y-2.5">
                {practiceAreas.slice(0, 6).map((a, i) => (
                  <li key={i}>
                    <button onClick={() => scrollToSection('lawyers')} className="text-sm text-white/50 hover:text-white transition-colors">{a.title}</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-white mb-4">تماس با ما</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-white/50">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span dir="ltr" className="text-left">۰۲۱-۱۲۳۴۵۶۷۸</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-white/50">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span dir="ltr" className="text-left">info@legalhub.ir</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-white/50">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>تهران، خیابان ولیعصر، پلاک ۱۲۳</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-white/50">
                  <Headphones className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>پشتیبانی ۲۴ ساعته</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm">
              تمامی حقوق مادی و معنوی این سامانه متعلق به لِگال‌هاب می‌باشد.
            </p>
            <div className="flex items-center gap-4 text-sm text-white/40">
              <button className="hover:text-white transition-colors">شرایط استفاده</button>
              <button className="hover:text-white transition-colors">حریم خصوصی</button>
            </div>
          </div>
        </div>
      </footer>

      {/* ============ STICKY BOTTOM BAR ============ */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-2xl border-t border-border/50 shadow-2xl shadow-black/10"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16 gap-4">
                <div className="hidden sm:flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {liveCount} نفر آنلاین
                    </span>
                  </div>
                  <span className="text-muted-foreground/30">|</span>
                  <span className="text-sm text-muted-foreground">اولین مشاوره رایگان</span>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex"
                    onClick={() => setShowStickyBar(false)}
                  >
                    بستن
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => scrollToSection('contact-form')}
                    className="bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 font-semibold"
                  >
                    <PhoneCall className="w-4 h-4 ml-1.5" />
                    رزرو مشاوره رایگان
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ FLOATING PHONE BUTTON ============ */}
      <motion.a
        href="tel:+982112345678"
        className="fixed bottom-20 sm:bottom-24 left-6 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/30 text-white"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ boxShadow: ['0 0 0 0 rgba(16,185,129,0.4)', '0 0 0 12px rgba(16,185,129,0)', '0 0 0 0 rgba(16,185,129,0.4)'] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Phone className="w-6 h-6" />
      </motion.a>
    </div>
  );
}
