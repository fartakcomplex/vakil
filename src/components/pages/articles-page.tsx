'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import {
  FileText, Search, Filter, Grid3X3 as Grid, List, Eye,
  Tag, Check, ChevronLeft, ChevronRight,
  Star, Clock, Layers, Newspaper, PenTool,
  Users, BookOpen, MessageSquare, Sparkles,
  Calendar, ThumbsUp, User, GraduationCap, Shield, Globe, Copy,
} from 'lucide-react';

// Types
interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  order: number;
  parentId: string | null;
}

interface ArticleAuthor {
  id: string;
  name: string;
  avatarUrl: string | null;
  title: string | null;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  summary: string | null;
  categoryId: string;
  category: ArticleCategory;
  tags: string | null;
  articleType: string;
  difficulty: string;
  viewCount: number;
  likeCount: number;
  isFeatured: boolean;
  isPublished: boolean;
  author: ArticleAuthor;
  readTime: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Article type config
const articleTypeConfig: Record<string, { label: string; color: string; icon: typeof FileText }> = {
  ARTICLE: { label: 'مقاله', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', icon: FileText },
  JOURNAL: { label: 'ژورنال', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300', icon: Newspaper },
  ANALYSIS: { label: 'تحلیل', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300', icon: PenTool },
  OPINION: { label: 'دیدگاه', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300', icon: MessageSquare },
  REVIEW: { label: 'نقد', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300', icon: Sparkles },
};

// Difficulty config
const difficultyConfig: Record<string, { label: string; color: string; icon: typeof FileText }> = {
  GENERAL: { label: 'عمومی', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', icon: BookOpen },
  SPECIALIZED: { label: 'تخصصی', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', icon: Star },
  ADVANCED: { label: 'پیشرفته', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300', icon: GraduationCap },
};

// Category icon mapping
const categoryIconMap: Record<string, typeof FileText> = {
  civil: FileText,
  criminal: Shield,
  commercial: Star,
  labor: Users,
  tax: BookOpen,
  constitutional: FileText,
  international: Globe,
  general: Newspaper,
};

function getCategoryIcon(slug: string) {
  return categoryIconMap[slug] || Newspaper;
}

function parseJsonField(field: string | null): string[] {
  if (!field) return [];
  try {
    const parsed = JSON.parse(field);
    if (Array.isArray(parsed)) return parsed;
    return [field];
  } catch {
    return field ? field.split(',').map(s => s.trim()).filter(Boolean) : [];
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('fa-IR').format(date);
}

export default function ArticlesPage() {
  const { token } = useAppStore();
  const { toast } = useToast();

  // State
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedArticleType, setSelectedArticleType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/articles?mode=categories');
        if (res.ok) {
          const data = await res.json();
          if (data.categories && data.categories.length > 0) {
            setCategories(data.categories);
          }
        }
      } catch {
        // Will retry on next fetch
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch articles
  const fetchArticles = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (search) params.set('search', search);
      if (selectedCategory !== 'all') params.set('categoryId', selectedCategory);
      if (selectedArticleType !== 'all') params.set('articleType', selectedArticleType);
      if (selectedDifficulty !== 'all') params.set('difficulty', selectedDifficulty);

      const res = await fetch(`/api/articles?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
        setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 0 });

        if (data.categories && data.categories.length > 0 && categories.length === 0) {
          setCategories(data.categories);
        }
      }
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedArticleType, selectedDifficulty, token, categories.length]);

  useEffect(() => {
    fetchArticles(1);
  }, [fetchArticles]);

  // Debounced search
  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout | null>(null);
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimer) clearTimeout(searchTimer);
    setSearchTimer(setTimeout(() => {
      fetchArticles(1);
    }, 400));
  };

  // Category click
  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? 'all' : categoryId);
  };

  // Article type click
  const handleArticleTypeClick = (type: string) => {
    setSelectedArticleType(type === selectedArticleType ? 'all' : type);
  };

  // Difficulty click
  const handleDifficultyClick = (difficulty: string) => {
    setSelectedDifficulty(difficulty === selectedDifficulty ? 'all' : difficulty);
  };

  // Open article dialog
  const openArticle = (article: Article) => {
    setSelectedArticle(article);
    setDialogOpen(true);
  };

  // Copy article text
  const handleCopyText = async (content: string) => {
    const plainText = stripHtml(content);
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      toast({ title: 'متن با موفقیت کپی شد', variant: 'default' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'خطا در کپی', variant: 'destructive' });
    }
  };

  // Page navigation
  const goToPage = (page: number) => {
    fetchArticles(page);
  };

  const totalPages = pagination.pages;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
            <Newspaper className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">نشریات و مقالات حقوقی</h1>
            <p className="text-xs text-muted-foreground">
              تعداد کل: {pagination.total}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="جستجو در مقالات و نشریات..."
          className="pr-9 pl-4 h-11 text-sm bg-card shadow-sm"
        />
      </div>

      {/* Category Chips */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Layers className="w-4 h-4" />
          دسته‌بندی‌ها
        </div>
        <ScrollArea className="w-full" direction="horizontal">
          <div className="flex gap-2 pb-2 min-w-0">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryClick('all')}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all border ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-card text-foreground border-border hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
              }`}
            >
              همه دسته‌ها
            </motion.button>
            {categoriesLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-24 rounded-full shrink-0" />
              ))
            ) : (
              categories.map((cat) => {
                const Icon = getCategoryIcon(cat.slug);
                return (
                  <motion.button
                    key={cat.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5 ${
                      selectedCategory === cat.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-card text-foreground border-border hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat.name}
                  </motion.button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Article Type Filter */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="w-4 h-4" />
          نوع نشریه
        </div>
        <div className="flex gap-2 flex-wrap">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleArticleTypeClick('all')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all border ${
              selectedArticleType === 'all'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-card text-foreground border-border hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
            }`}
          >
            همه
          </motion.button>
          {Object.entries(articleTypeConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <motion.button
                key={key}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleArticleTypeClick(key)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5 ${
                  selectedArticleType === key
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-card text-foreground border-border hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {config.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Difficulty Filter */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Star className="w-4 h-4" />
          سطح دشواری
        </div>
        <div className="flex gap-2 flex-wrap">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDifficultyClick('all')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all border ${
              selectedDifficulty === 'all'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-card text-foreground border-border hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
            }`}
          >
            همه
          </motion.button>
          {Object.entries(difficultyConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <motion.button
                key={key}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDifficultyClick(key)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5 ${
                  selectedDifficulty === key
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-card text-foreground border-border hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {config.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Articles List */}
      {loading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Newspaper className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">نتیجه‌ای یافت نشد</p>
          <p className="text-sm text-muted-foreground mt-1">فیلترهای جستجو را تغییر دهید</p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedCategory}-${selectedArticleType}-${selectedDifficulty}-${viewMode}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
            }
          >
            {articles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <Card
                  className="group cursor-pointer hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800 transition-all overflow-hidden relative"
                  onClick={() => openArticle(article)}
                >
                  <CardContent className="p-0">
                    {viewMode === 'grid' ? (
                      /* Grid View */
                      <div className="space-y-3 p-4">
                        {/* Top section: type + difficulty */}
                        <div className="flex items-center justify-between">
                          <Badge
                            variant="secondary"
                            className={`text-[11px] px-2 py-0.5 ${articleTypeConfig[article.articleType]?.color || ''}`}
                          >
                            {articleTypeConfig[article.articleType]?.label || article.articleType}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-[11px] px-2 py-0.5 ${difficultyConfig[article.difficulty]?.color || ''}`}
                          >
                            {difficultyConfig[article.difficulty]?.label || article.difficulty}
                          </Badge>
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-relaxed">
                          {article.title}
                        </h3>

                        {/* Summary */}
                        {article.summary && (
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                            {stripHtml(article.summary)}
                          </p>
                        )}

                        {/* Author */}
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <span className="text-xs text-muted-foreground">{article.author.name}</span>
                        </div>

                        {/* Tags */}
                        {article.tags && (
                          <div className="flex flex-wrap gap-1">
                            {parseJsonField(article.tags).slice(0, 3).map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0">
                                <Tag className="w-2.5 h-2.5 ml-0.5" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <Separator className="my-1" />

                        {/* Footer */}
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {article.viewCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3" />
                              {article.likeCount}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {article.readTime} دقیقه
                          </div>
                        </div>

                        {/* Featured Badge */}
                        {article.isFeatured && (
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0">
                              <Sparkles className="w-2.5 h-2.5 ml-0.5" />
                              ویژه
                            </Badge>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* List View */
                      <div className="flex items-start gap-4 p-4">
                        {/* Icon */}
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                          {(() => {
                            const Icon = articleTypeConfig[article.articleType]?.icon || Newspaper;
                            return <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
                          })()}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-sm group-hover:text-emerald-600 transition-colors">
                              {article.title}
                            </h3>
                            <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${articleTypeConfig[article.articleType]?.color || ''}`}>
                              {articleTypeConfig[article.articleType]?.label || article.articleType}
                            </Badge>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${difficultyConfig[article.difficulty]?.color || ''}`}>
                              {difficultyConfig[article.difficulty]?.label || article.difficulty}
                            </Badge>
                            {article.isFeatured && (
                              <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0">
                                <Sparkles className="w-2.5 h-2.5 ml-0.5" />ویژه
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {article.summary ? stripHtml(article.summary) : article.description || ''}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1"><User className="w-3 h-3" />{article.author.name}</span>
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.viewCount}</span>
                            <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{article.likeCount}</span>
                          </div>
                        </div>

                        {/* Date */}
                        <div className="flex flex-col items-end gap-1 shrink-0 text-[11px] text-muted-foreground">
                          {article.publishedAt && (
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(article.publishedAt)}</span>
                          )}
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{article.readTime} دقیقه</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {!loading && articles.length > 0 && totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 pt-4"
        >
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => goToPage(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={pagination.page === pageNum ? 'default' : 'outline'}
                  size="icon"
                  className={`h-9 w-9 text-xs ${pagination.page === pageNum ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
                  onClick={() => goToPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => goToPage(pagination.page + 1)}
            disabled={pagination.page >= totalPages}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {/* Article Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[95dvh] sm:max-h-[90dvh] overflow-y-auto sm:overflow-y-hidden flex flex-col p-0">
          {selectedArticle && (
            <>
              {/* Dialog Header */}
              <DialogHeader className="bg-gradient-to-l from-emerald-600 to-teal-600 p-6 rounded-none">
                <DialogTitle className="text-white flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                    {(() => {
                      const Icon = articleTypeConfig[selectedArticle.articleType]?.icon || Newspaper;
                      return <Icon className="w-5 h-5 text-white" />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold leading-relaxed">{selectedArticle.title}</h2>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge className="bg-white/20 text-white text-[11px] px-2 py-0.5 border border-white/30 hover:bg-white/30">
                        {selectedArticle.category.name}
                      </Badge>
                      <Badge className="bg-white/20 text-white text-[11px] px-2 py-0.5 border border-white/30 hover:bg-white/30">
                        {articleTypeConfig[selectedArticle.articleType]?.label || selectedArticle.articleType}
                      </Badge>
                      <Badge className="bg-white/20 text-white text-[11px] px-2 py-0.5 border border-white/30 hover:bg-white/30">
                        {difficultyConfig[selectedArticle.difficulty]?.label || selectedArticle.difficulty}
                      </Badge>
                      {selectedArticle.isFeatured && (
                        <Badge className="bg-amber-400 text-amber-900 text-[11px] px-2 py-0.5">
                          <Sparkles className="w-3 h-3 ml-0.5" />ویژه
                        </Badge>
                      )}
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              {/* Dialog Body */}
              <div className="flex-1 overflow-y-auto sm:overflow-hidden flex flex-col">
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-6">
                    {/* Author Info */}
                    <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{selectedArticle.author.name}</p>
                        {selectedArticle.author.title && (
                          <p className="text-xs text-muted-foreground">{selectedArticle.author.title}</p>
                        )}
                      </div>
                      {selectedArticle.publishedAt && (
                        <div className="mr-auto text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(selectedArticle.publishedAt)}
                        </div>
                      )}
                    </div>

                    {/* Summary */}
                    {selectedArticle.summary && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          خلاصه
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 rounded-lg p-3">
                          {stripHtml(selectedArticle.summary)}
                        </p>
                      </div>
                    )}

                    {/* Tags */}
                    {selectedArticle.tags && parseJsonField(selectedArticle.tags).length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          برچسب‌ها
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {parseJsonField(selectedArticle.tags).map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs px-3 py-1.5">
                              <Tag className="w-3 h-3 ml-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Full Article Content */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          متن کامل مقاله
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs gap-1.5"
                          onClick={() => handleCopyText(selectedArticle.content)}
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600">کپی شد</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              کپی متن
                            </>
                          )}
                        </Button>
                      </div>
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none bg-card border rounded-xl p-6 leading-loose text-sm whitespace-pre-wrap"
                        dir="rtl"
                        dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                      />
                    </div>
                  </div>
                </ScrollArea>

                {/* Dialog Footer */}
                <div className="border-t p-4 flex items-center justify-between bg-muted/30">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      بازدید: {selectedArticle.viewCount}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      پسند: {selectedArticle.likeCount}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      زمان مطالعه: {selectedArticle.readTime} دقیقه
                    </span>
                  </div>
                  <Button onClick={() => setDialogOpen(false)} variant="outline" className="text-xs h-8">
                    بستن
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
