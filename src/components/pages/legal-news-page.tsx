'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Newspaper, Search, Bookmark, BookmarkCheck, Share2, Copy, Check,
  TrendingUp, Clock, Tag, Mail, Send, Rss, Eye,
  Scale, FileText, Gavel, Building2, Briefcase, Landmark,
  ChevronLeft, Flame, Bell, ExternalLink, CalendarDays,
} from 'lucide-react';

// ============ DATA ============
interface NewsItem {
  id: number;
  title: string;
  summary: string;
  category: string;
  source: string;
  date: string;
  featured: boolean;
  views: number;
}

const NEWS: NewsItem[] = [
  {
    id: 1,
    title: 'آیین‌نامه جدید اجرای اسناد رسمی ابلاغ شد',
    summary: 'معاونت قوه قضاییه آیین‌نامه جدید اجرای اسناد رسمی را ابلاغ کرد که شامل تغییرات مهمی در روند اجرای اسناد است. بر اساس این آیین‌نامه، مهلت‌های جدیدی برای اعتراض به دستورات اجرایی تعیین شده و فرآیند توقیف اموال تسهیل شده است.',
    category: 'قوانین جدید',
    source: 'خبرگزاری میزان',
    date: '۱۴۰۴/۰۳/۱۵',
    featured: true,
    views: 12450,
  },
  {
    id: 2,
    title: 'رأی وحدت رویه شماره ۹۵۰ در موضوع بطلان معامله صوری',
    summary: 'دیوان عالی کشور رأی وحدت رویه جدیدی در خصوص ادعای بطلان معامله صوری صادر کرد. این رأی مهم‌ترین تغییر در رویه قضایی سال جاری محسوب می‌شود و شفافیت بیشتری در تشخیص معاملات صوری ایجاد کرده است.',
    category: 'آرای مهم',
    source: 'سایت قوه قضاییه',
    date: '۱۴۰۴/۰۳/۱۲',
    featured: true,
    views: 9870,
  },
  {
    id: 3,
    title: 'تغییرات جدید قانون مالیات‌های مستقیم از اول تیرماه',
    summary: 'وزارت امور اقتصادی و دارایی تغییرات جدید قانون مالیات‌های مستقیم را اعلام کرد که شامل افزایش سقف معافیت مالیاتی و اصلاح نرخ‌هاست. کسب‌وکارهای خرد از این تغییرات بیشترین سود را خواهند برد.',
    category: 'حقوق تجارت',
    source: 'خبرگزاری ایسنا',
    date: '۱۴۰۴/۰۳/۱۰',
    featured: false,
    views: 8340,
  },
  {
    id: 4,
    title: 'تشکیل شعب ویژه حقوق کار در دادگاه‌های سراسر کشور',
    summary: 'ریاست قوه قضاییه در بخشنامه‌ای جدید، تشکیل شعب ویژه رسیدگی به دعاوی حقوق کار را در تمامی دادگاه‌های عمومی و انقلاب کشور اعلام کرد. این اقدام به هدف تسریع در رسیدگی به دعاوی کارگران صورت گرفته است.',
    category: 'حقوق کار',
    source: 'خبرگزاری تسنیم',
    date: '۱۴۰۴/۰۳/۰۸',
    featured: false,
    views: 7650,
  },
  {
    id: 5,
    title: 'قوانین جدید مهاجرت سرمایه‌گذاران خارجی به ایران',
    summary: 'سازمان سرمایه‌گذاری و کمک‌های فنی و اقتصادی ایران، آیین‌نامه جدید تسهیل صدور مجوز اقامت برای سرمایه‌گذاران خارجی را اعلام کرد. مشوق‌های مالیاتی و فرآیندهای سریع‌تر اقامت از مهم‌ترین تغییرات هستند.',
    category: 'مهاجرت',
    source: 'خبرگزاری ایرنا',
    date: '۱۴۰۴/۰۳/۰۵',
    featured: false,
    views: 6920,
  },
  {
    id: 6,
    title: 'الکترونیکی شدن تمامی فرآیندهای ثبت اسناد و املاک',
    summary: 'اداره کل ثبت اسناد و املاک کشور اعلام کرد که از ابتدای شهریور ماه تمامی فرآیندهای ثبتی به صورت کاملاً الکترونیکی انجام خواهد شد. این اقدام بخشی از طرح تحول دیجیتال قوه قضاییه است.',
    category: 'قوه قضاییه',
    source: 'خبرگزاری فارس',
    date: '۱۴۰۴/۰۳/۰۳',
    featured: false,
    views: 5480,
  },
  {
    id: 7,
    title: 'آرای مهم دیوان عدالت اداری در موضوع خدمات شهری',
    summary: 'دیوان عدالت اداری مجموعه‌ای از آرای مهم خود در زمینه اختلافات بین شهروندان و شهرداری‌ها را منتشر کرد. این آرای منتخب شامل موضوعات عوارض، تخریب ساختمان‌های غیرمجاز و حقوق عابرین پیاده است.',
    category: 'آرای مهم',
    source: 'سایت دیوان عدالت اداری',
    date: '۱۴۰۴/۰۲/۲۸',
    featured: false,
    views: 4210,
  },
  {
    id: 8,
    title: 'اصلاحیه قانون تجارت الکترونیک تصویب شد',
    summary: 'مجلس شورای اسلامی اصلاحیه جدید قانون تجارت الکترونیک را تصویب کرد. این اصلاحیه شامل مقررات جدید در زمینه تجارت الکترونیک بین‌المللی، حفاظت از داده‌های مصرف‌کنندگان و مسئولیت پلتفرم‌های آنلاین است.',
    category: 'قوانین جدید',
    source: 'خبرگزاری خانه ملت',
    date: '۱۴۰۴/۰۲/۲۵',
    featured: false,
    views: 3890,
  },
  {
    id: 9,
    title: 'راه‌اندازی سامانه ملی حمایت از حقوق مالکیت فکری',
    summary: 'مرکز مالکیت فکری ایران سامانه ملی ثبت و حمایت از حقوق مالکیت فکری را راه‌اندازی کرد. این سامانه امکان ثبت آنلاین اختراعات، علائم تجاری و طرح‌های صنعتی را فراهم می‌آورد و فرآیند ثبت را به شدت تسریع کرده است.',
    category: 'حقوق تجارت',
    source: 'خبرگزاری میزان',
    date: '۱۴۰۴/۰۲/۲۲',
    featured: false,
    views: 3450,
  },
  {
    id: 10,
    title: 'اعلام سررسید مهلت تسویه حق بیمه کارفرمایان',
    summary: 'سازمان تأمین اجتماعی اعلام کرد مهلت تسویه حق بیمه کارفرمایان برای سه ماهه اول سال تغییر کرده است. کارفرمایانی که در مهلت جدید تسویه کنند، از تخفیف ویژه‌ای برخوردار خواهند شد.',
    category: 'حقوق کار',
    source: 'سایت سازمان تأمین اجتماعی',
    date: '۱۴۰۴/۰۲/۲۰',
    featured: false,
    views: 2980,
  },
];

const CATEGORIES = [
  'همه', 'قوه قضاییه', 'قوانین جدید', 'آرای مهم',
  'حقوق تجارت', 'حقوق کار', 'مهاجرت',
];

const TRENDING_TOPICS = [
  { title: 'تغییرات آیین‌نامه اجرای اسناد', count: '۱۲.۴K', icon: Scale },
  { title: 'الکترونیکی‌سازی ثبت اسناد', count: '۸.۷K', icon: FileText },
  { title: 'اصلاحیه مالیات مستقیم', count: '۷.۲K', icon: Building2 },
  { title: 'شعب ویژه حقوق کار', count: '۵.۹K', icon: Briefcase },
  { title: 'قانون تجارت الکترونیک', count: '۴.۱K', icon: Landmark },
];

const categoryColorMap: Record<string, string> = {
  'قوه قضاییه': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'قوانین جدید': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'آرای مهم': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'حقوق تجارت': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  'حقوق کار': 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  'مهاجرت': 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
};

const categoryIconMap: Record<string, typeof Scale> = {
  'قوه قضاییه': Landmark,
  'قوانین جدید': Gavel,
  'آرای مهم': Scale,
  'حقوق تجارت': Briefcase,
  'حقوق کار': Building2,
  'مهاجرت': FileText,
};

// ============ COMPONENT ============
export default function LegalNewsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('همه');
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Filter news
  const filteredNews = useMemo(() => {
    return NEWS.filter(item => {
      const matchCategory = selectedCategory === 'همه' || item.category === selectedCategory;
      const matchSearch = !search.trim() ||
        item.title.includes(search) ||
        item.summary.includes(search) ||
        item.source.includes(search);
      return matchCategory && matchSearch;
    });
  }, [search, selectedCategory]);

  const featuredNews = filteredNews.filter(n => n.featured);
  const regularNews = filteredNews.filter(n => !n.featured);

  // Toggle bookmark
  const toggleBookmark = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast({ title: 'نشان‌گذاری حذف شد' });
      } else {
        next.add(id);
        toast({ title: 'خبر نشان‌گذاری شد', description: 'از بخش نشان‌شده‌ها قابل دسترسی است' });
      }
      return next;
    });
  };

  // Share (copy link)
  const handleShare = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`https://legalhub.ir/news/${id}`);
    setCopiedId(id);
    toast({ title: 'لینک خبر کپی شد' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Subscribe
  const handleSubscribe = () => {
    if (!subscribeEmail.trim() || !subscribeEmail.includes('@')) {
      toast({ title: 'ایمیل نامعتبر است', variant: 'destructive' });
      return;
    }
    setSubscribed(true);
    toast({ title: 'عضویت با موفقیت انجام شد', description: 'اخبار حقوقی برای شما ارسال خواهد شد' });
    setTimeout(() => setSubscribed(false), 3000);
    setSubscribeEmail('');
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md">
            <Newspaper className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">اخبار حقوقی</h1>
            <p className="text-xs text-muted-foreground">آخرین اخبار و تحولات حوزه حقوق و قضایی</p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs gap-1 px-3 py-1.5 self-start">
          <Rss className="w-3 h-3 text-rose-500" />
          <span className="text-rose-600">{NEWS.length} خبر</span>
        </Badge>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="جستجو در اخبار حقوقی..."
          className="pr-9 pl-4 h-11 text-sm bg-card shadow-sm"
        />
      </div>

      {/* Category Filters */}
      <ScrollArea className="w-full" direction="horizontal">
        <div className="flex gap-2 pb-2 min-w-0">
          {CATEGORIES.map((cat) => {
            const Icon = cat === 'همه' ? Newspaper : (categoryIconMap[cat] || FileText);
            return (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-card text-foreground border-border hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat}
              </motion.button>
            );
          })}
        </div>
      </ScrollArea>

      <Separator />

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Left Main Column */}
        <div className="lg:col-span-3 space-y-5">
          {/* Featured News */}
          {featuredNews.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <Flame className="w-4 h-4" />
                اخبار ویژه
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredNews.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <Card className="group cursor-pointer hover:shadow-lg transition-all overflow-hidden relative border-0">
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-rose-600 via-rose-500/80 to-transparent opacity-90 z-10" />
                      {/* Pattern background */}
                      <div className="relative h-56 bg-gradient-to-br from-slate-800 to-slate-900 flex items-end p-0">
                        <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                          <Badge className="bg-white/20 text-white text-[11px] px-2 py-0.5 border border-white/30 backdrop-blur-sm hover:bg-white/30">
                            <Flame className="w-2.5 h-2.5 ml-0.5" />
                            ویژه
                          </Badge>
                          <Badge className={`${categoryColorMap[item.category] || ''} text-[11px] px-2 py-0.5 border-0`}>
                            {item.category}
                          </Badge>
                        </div>
                        {/* Decorative icon */}
                        <div className="absolute top-4 left-4 z-20 opacity-20">
                          <Scale className="w-20 h-20 text-white" />
                        </div>
                        {/* Content */}
                        <div className="relative z-10 p-4 text-white">
                          <h3 className="font-bold text-base leading-relaxed mb-2 group-hover:text-rose-200 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-xs text-white/80 leading-relaxed line-clamp-2 mb-3">
                            {item.summary}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-[11px] text-white/70">
                              <span className="flex items-center gap-1">
                                <CalendarDays className="w-3 h-3" />
                                {item.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {item.views.toLocaleString('fa-IR')} بازدید
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => toggleBookmark(item.id, e)}
                                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                              >
                                {bookmarks.has(item.id) ? (
                                  <BookmarkCheck className="w-4 h-4 text-amber-300" />
                                ) : (
                                  <Bookmark className="w-4 h-4 text-white/60 hover:text-white" />
                                )}
                              </button>
                              <button
                                onClick={(e) => handleShare(item.id, e)}
                                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                              >
                                {copiedId === item.id ? (
                                  <Check className="w-4 h-4 text-emerald-300" />
                                ) : (
                                  <Share2 className="w-4 h-4 text-white/60 hover:text-white" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Regular News Grid */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-muted-foreground" />
              آخرین اخبار
              <Badge variant="secondary" className="text-[10px]">{regularNews.length} خبر</Badge>
            </h2>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedCategory}-${search}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {regularNews.map((item, index) => {
                  const CatIcon = categoryIconMap[item.category] || FileText;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <Card className="group cursor-pointer hover:shadow-lg hover:border-rose-200 dark:hover:border-rose-800 transition-all relative overflow-hidden">
                        <CardContent className="p-4 space-y-3">
                          {/* Category + Source row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className={`text-[10px] px-2 py-0.5 ${categoryColorMap[item.category] || ''}`}
                              >
                                <CatIcon className="w-2.5 h-2.5 ml-0.5" />
                                {item.category}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => toggleBookmark(item.id, e)}
                                className="p-1 rounded-full hover:bg-muted transition-colors"
                              >
                                {bookmarks.has(item.id) ? (
                                  <BookmarkCheck className="w-3.5 h-3.5 text-rose-500" />
                                ) : (
                                  <Bookmark className="w-3.5 h-3.5 text-muted-foreground hover:text-rose-500" />
                                )}
                              </button>
                              <button
                                onClick={(e) => handleShare(item.id, e)}
                                className="p-1 rounded-full hover:bg-muted transition-colors"
                              >
                                {copiedId === item.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Share2 className="w-3.5 h-3.5 text-muted-foreground hover:text-rose-500" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Title */}
                          <h3 className="font-bold text-sm leading-relaxed group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                            {item.title}
                          </h3>

                          {/* Summary */}
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                            {item.summary}
                          </p>

                          {/* Meta row */}
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <CalendarDays className="w-3 h-3" />
                                {item.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {item.views.toLocaleString('fa-IR')}
                              </span>
                            </div>
                            <span className="flex items-center gap-1 text-rose-500 dark:text-rose-400">
                              <ExternalLink className="w-3 h-3" />
                              ادامه مطلب
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            {filteredNews.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Newspaper className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-muted-foreground">خبری یافت نشد</p>
                <p className="text-sm text-muted-foreground mt-1">فیلترها یا عبارت جستجو را تغییر دهید</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Trending */}
          <Card className="overflow-hidden">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-rose-500" />
                پربازدیدترین‌ها
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-3">
                {TRENDING_TOPICS.map((topic, index) => {
                  const Icon = topic.icon;
                  return (
                    <motion.div
                      key={index}
                      whileHover={{ x: -4 }}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-sm font-black w-5 h-5 rounded-md flex items-center justify-center ${
                          index < 3 ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400' : 'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </span>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          index < 3 ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500' : 'bg-muted text-muted-foreground'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium leading-relaxed group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-2">
                          {topic.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                          <Eye className="w-2.5 h-2.5" />
                          {topic.count} بازدید
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Subscribe */}
          <Card className="overflow-hidden">
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                عضویت در خبرنامه
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                اخبار و تحولات مهم حقوقی را به صورت هفتگی در ایمیل خود دریافت کنید.
              </p>
              {subscribed ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-medium"
                >
                  <Check className="w-4 h-4" />
                  با موفقیت عضو خبرنامه شدید!
                </motion.div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      value={subscribeEmail}
                      onChange={(e) => setSubscribeEmail(e.target.value)}
                      placeholder="ایمیل شما..."
                      className="pr-9 text-xs h-10"
                      dir="ltr"
                      type="email"
                      onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                    />
                  </div>
                  <Button
                    size="icon"
                    className="h-10 w-10 bg-gradient-to-br from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shrink-0"
                    onClick={handleSubscribe}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Tag className="w-4 h-4 text-muted-foreground" />
                آمار سریع
              </div>
              <Separator />
              <div className="space-y-2.5">
                {[
                  { label: 'کل اخبار امروز', value: NEWS.length, icon: Newspaper, color: 'text-rose-500' },
                  { label: 'دسته‌بندی‌ها', value: CATEGORIES.length - 1, icon: Tag, color: 'text-blue-500' },
                  { label: 'خبر ویژه', value: NEWS.filter(n => n.featured).length, icon: Flame, color: 'text-amber-500' },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                      {stat.label}
                    </span>
                    <span className="text-xs font-bold">{stat.value}</span>
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
