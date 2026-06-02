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
  FileText, Search, Filter, Grid3X3 as Grid, List, Eye, BookOpen,
  Tag, Download, Copy, Check, ChevronLeft, ChevronRight,
  Star, Shield, GraduationCap, Clock, Layers, ShieldCheck,
  Scale, Briefcase, Gavel, FileCheck,
} from 'lucide-react';

// Types
interface PowerOfAttorneyCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  order: number;
  parentId: string | null;
}

interface PowerOfAttorney {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  summary: string | null;
  categoryId: string;
  category: PowerOfAttorneyCategory;
  tags: string | null;
  scope: string | null;
  difficulty: string;
  downloadCount: number;
  viewCount: number;
  isPremium: boolean;
  isPublished: boolean;
  version: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Difficulty config
const difficultyConfig: Record<string, { label: string; color: string; icon: typeof FileText }> = {
  GENERAL: { label: 'عمومی', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', icon: BookOpen },
  SPECIALIZED: { label: 'تخصصی', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', icon: Star },
  ADVANCED: { label: 'پیشرفته', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300', icon: GraduationCap },
};

// Scope config
const scopeConfig: Record<string, { label: string; icon: typeof FileText }> = {
  GENERAL: { label: 'عام', icon: Shield },
  SPECIAL: { label: 'خاص', icon: FileCheck },
  JUDICIAL: { label: 'قضایی', icon: Gavel },
  LEGAL: { label: 'حقوقی', icon: Scale },
  COMMERCIAL: { label: 'تجاری', icon: Briefcase },
};

// Category icon mapping
const categoryIconMap: Record<string, typeof FileText> = {
  civil: Shield,
  criminal: Gavel,
  family: ShieldCheck,
  real_estate: Scale,
  commercial: Briefcase,
  labor: Shield,
  general: FileText,
  judicial: Gavel,
  administrative: Shield,
};

function getCategoryIcon(slug: string) {
  return categoryIconMap[slug] || ShieldCheck;
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

export default function PowerOfAttorneyPage() {
  const { token } = useAppStore();
  const { toast } = useToast();

  // State
  const [powerOfAttorneys, setPowerOfAttorneys] = useState<PowerOfAttorney[]>([]);
  const [categories, setCategories] = useState<PowerOfAttorneyCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedScope, setSelectedScope] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [selectedItem, setSelectedItem] = useState<PowerOfAttorney | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/power-of-attorney?mode=categories');
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

  // Fetch power of attorneys
  const fetchItems = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (search) params.set('search', search);
      if (selectedCategory !== 'all') params.set('categoryId', selectedCategory);
      if (selectedDifficulty !== 'all') params.set('difficulty', selectedDifficulty);
      if (selectedScope !== 'all') params.set('scope', selectedScope);

      const res = await fetch(`/api/power-of-attorney?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const data = await res.json();
        setPowerOfAttorneys(data.powerOfAttorneys || []);
        setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 0 });

        if (data.categories && data.categories.length > 0 && categories.length === 0) {
          setCategories(data.categories);
        }
      }
    } catch {
      setPowerOfAttorneys([]);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedDifficulty, selectedScope, token, categories.length]);

  useEffect(() => {
    fetchItems(1);
  }, [fetchItems]);

  // Debounced search
  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout | null>(null);
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimer) clearTimeout(searchTimer);
    setSearchTimer(setTimeout(() => {
      fetchItems(1);
    }, 400));
  };

  // Category click
  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? 'all' : categoryId);
  };

  // Difficulty click
  const handleDifficultyClick = (difficulty: string) => {
    setSelectedDifficulty(difficulty === selectedDifficulty ? 'all' : difficulty);
  };

  // Scope click
  const handleScopeClick = (scope: string) => {
    setSelectedScope(scope === selectedScope ? 'all' : scope);
  };

  // Open dialog
  const openItem = (item: PowerOfAttorney) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  // Copy text
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
    fetchItems(page);
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">کتابخانه وکالت‌نامه‌ها</h1>
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
          placeholder="جستجو در وکالت‌نامه‌ها..."
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
                  ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                  : 'bg-card text-foreground border-border hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20'
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
                        ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                        : 'bg-card text-foreground border-border hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20'
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

      {/* Scope Filter */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <ShieldCheck className="w-4 h-4" />
          حوزه وکالت
        </div>
        <div className="flex gap-2 flex-wrap">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleScopeClick('all')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all border ${
              selectedScope === 'all'
                ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                : 'bg-card text-foreground border-border hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20'
            }`}
          >
            همه
          </motion.button>
          {Object.entries(scopeConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <motion.button
                key={key}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleScopeClick(key)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5 ${
                  selectedScope === key
                    ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                    : 'bg-card text-foreground border-border hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20'
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
          <Filter className="w-4 h-4" />
          سطح دشواری
        </div>
        <div className="flex gap-2 flex-wrap">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDifficultyClick('all')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all border ${
              selectedDifficulty === 'all'
                ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                : 'bg-card text-foreground border-border hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20'
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
                    ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                    : 'bg-card text-foreground border-border hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20'
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

      {/* Power of Attorneys List */}
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
      ) : powerOfAttorneys.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">نتیجه‌ای یافت نشد</p>
          <p className="text-sm text-muted-foreground mt-1">فیلترهای جستجو را تغییر دهید</p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedCategory}-${selectedDifficulty}-${selectedScope}-${viewMode}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
            }
          >
            {powerOfAttorneys.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <Card
                  className="group cursor-pointer hover:shadow-md hover:border-violet-200 dark:hover:border-violet-800 transition-all overflow-hidden"
                  onClick={() => openItem(item)}
                >
                  <CardContent className="p-0">
                    {viewMode === 'grid' ? (
                      /* Grid View */
                      <div className="space-y-3 p-4">
                        {/* Top section: category + difficulty */}
                        <div className="flex items-center justify-between">
                          <Badge
                            variant="secondary"
                            className="text-[11px] px-2 py-0.5 bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border border-violet-200 dark:border-violet-800"
                          >
                            {item.category.name}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-[11px] px-2 py-0.5 ${difficultyConfig[item.difficulty]?.color || ''}`}
                          >
                            {difficultyConfig[item.difficulty]?.label || item.difficulty}
                          </Badge>
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-sm group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-2 leading-relaxed">
                          {item.title}
                        </h3>

                        {/* Summary */}
                        {item.summary && (
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                            {stripHtml(item.summary)}
                          </p>
                        )}

                        {/* Tags */}
                        {item.tags && (
                          <div className="flex flex-wrap gap-1">
                            {parseJsonField(item.tags).slice(0, 3).map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0">
                                <Tag className="w-2.5 h-2.5 ml-0.5" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Scope Badge */}
                        {item.scope && scopeConfig[item.scope] && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-purple-600 border-purple-200 dark:border-purple-800 dark:text-purple-400">
                            {(() => {
                              const Icon = scopeConfig[item.scope!].icon;
                              return <><Icon className="w-2.5 h-2.5 ml-0.5" />{scopeConfig[item.scope!].label}</>;
                            })()}
                          </Badge>
                        )}

                        <Separator className="my-1" />

                        {/* Footer */}
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {item.viewCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <Download className="w-3 h-3" />
                              {item.downloadCount}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            نسخه {item.version}
                          </div>
                        </div>

                        {item.isPremium && (
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0">
                              <Star className="w-2.5 h-2.5 ml-0.5" />
                              ویژه
                            </Badge>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* List View */
                      <div className="flex items-start gap-4 p-4">
                        {/* Icon */}
                        <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                          {(() => {
                            const Icon = getCategoryIcon(item.category.slug);
                            return <Icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />;
                          })()}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-sm group-hover:text-violet-600 transition-colors">
                              {item.title}
                            </h3>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                              {item.category.name}
                            </Badge>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${difficultyConfig[item.difficulty]?.color || ''}`}>
                              {difficultyConfig[item.difficulty]?.label || item.difficulty}
                            </Badge>
                            {item.isPremium && (
                              <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0">
                                <Star className="w-2.5 h-2.5 ml-0.5" />ویژه
                              </Badge>
                            )}
                          </div>
                          {item.summary && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {stripHtml(item.summary)}
                            </p>
                          )}
                          {/* Tags inline */}
                          <div className="flex flex-wrap items-center gap-1">
                            {parseJsonField(item.tags).slice(0, 3).map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0">
                                <Tag className="w-2.5 h-2.5 ml-0.5" />{tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-col items-end gap-1 shrink-0 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{item.viewCount}</span>
                          <span className="flex items-center gap-1"><Download className="w-3 h-3" />{item.downloadCount}</span>
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
      {!loading && powerOfAttorneys.length > 0 && totalPages > 1 && (
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
                  className={`h-9 w-9 text-xs ${pagination.page === pageNum ? 'bg-violet-600 hover:bg-violet-700 text-white' : ''}`}
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

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[95dvh] sm:max-h-[90dvh] overflow-y-auto sm:overflow-y-hidden flex flex-col p-0">
          {selectedItem && (
            <>
              {/* Dialog Header */}
              <DialogHeader className="bg-gradient-to-l from-violet-600 to-purple-600 p-6 rounded-none">
                <DialogTitle className="text-white flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                    {(() => {
                      const Icon = getCategoryIcon(selectedItem.category.slug);
                      return <Icon className="w-5 h-5 text-white" />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold leading-relaxed">{selectedItem.title}</h2>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge className="bg-white/20 text-white text-[11px] px-2 py-0.5 border border-white/30 hover:bg-white/30">
                        {selectedItem.category.name}
                      </Badge>
                      <Badge className="bg-white/20 text-white text-[11px] px-2 py-0.5 border border-white/30 hover:bg-white/30">
                        {difficultyConfig[selectedItem.difficulty]?.label || selectedItem.difficulty}
                      </Badge>
                      {selectedItem.scope && scopeConfig[selectedItem.scope] && (
                        <Badge className="bg-white/20 text-white text-[11px] px-2 py-0.5 border border-white/30 hover:bg-white/30">
                          {scopeConfig[selectedItem.scope].label}
                        </Badge>
                      )}
                      {selectedItem.isPremium && (
                        <Badge className="bg-amber-400 text-amber-900 text-[11px] px-2 py-0.5">
                          <Star className="w-3 h-3 ml-0.5" />ویژه
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
                    {/* Summary */}
                    {selectedItem.summary && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-violet-700 dark:text-violet-400 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          خلاصه
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 rounded-lg p-3">
                          {stripHtml(selectedItem.summary)}
                        </p>
                      </div>
                    )}

                    {/* Tags */}
                    {selectedItem.tags && parseJsonField(selectedItem.tags).length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-violet-700 dark:text-violet-400 flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          برچسب‌ها
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {parseJsonField(selectedItem.tags).map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs px-3 py-1.5">
                              <Tag className="w-3 h-3 ml-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Full Content */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-violet-700 dark:text-violet-400 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          متن کامل وکالت‌نامه
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs gap-1.5"
                          onClick={() => handleCopyText(selectedItem.content)}
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
                        dangerouslySetInnerHTML={{ __html: selectedItem.content }}
                      />
                    </div>
                  </div>
                </ScrollArea>

                {/* Dialog Footer */}
                <div className="border-t p-4 flex items-center justify-between bg-muted/30">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      بازدید: {selectedItem.viewCount}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5" />
                      دانلود: {selectedItem.downloadCount}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      نسخه: {selectedItem.version}
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
