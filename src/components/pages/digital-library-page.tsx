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
  Star, Clock, Layers, Download, Copy,
  BookOpen, Library, GraduationCap, Users,
  Building2, Globe, Sparkles, Calendar,
  BookMarked, Scale,
} from 'lucide-react';

// Types
interface LibraryCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  order: number;
  parentId: string | null;
}

interface Book {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  summary: string | null;
  categoryId: string;
  category: LibraryCategory;
  tags: string | null;
  bookType: string;
  author: string;
  publisher: string | null;
  isbn: string | null;
  pagesCount: number;
  downloadCount: number;
  viewCount: number;
  isPremium: boolean;
  isPublished: boolean;
  language: string;
  publishedYear: number | null;
  coverUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Book type config
const bookTypeConfig: Record<string, { label: string; color: string; icon: typeof FileText }> = {
  BOOK: { label: 'کتاب', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', icon: BookOpen },
  REFERENCE: { label: 'مرجع', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300', icon: Library },
  ENCYCLOPEDIA: { label: 'دایرةالمعارف', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300', icon: GraduationCap },
  COMMENTARY: { label: 'تفسیر', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', icon: Scale },
};

// Category icon mapping
const categoryIconMap: Record<string, typeof FileText> = {
  civil: Scale,
  criminal: Star,
  commercial: BookOpen,
  labor: Users,
  tax: Building2,
  constitutional: Globe,
  international: Globe,
  islamic: BookMarked,
  general: Library,
};

function getCategoryIcon(slug: string) {
  return categoryIconMap[slug] || Library;
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

export default function DigitalLibraryPage() {
  const { token } = useAppStore();
  const { toast } = useToast();

  // State
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<LibraryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBookType, setSelectedBookType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/digital-library?mode=categories');
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

  // Fetch books
  const fetchBooks = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (search) params.set('search', search);
      if (selectedCategory !== 'all') params.set('categoryId', selectedCategory);
      if (selectedBookType !== 'all') params.set('bookType', selectedBookType);

      const res = await fetch(`/api/digital-library?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const data = await res.json();
        setBooks(data.books || []);
        setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 0 });

        if (data.categories && data.categories.length > 0 && categories.length === 0) {
          setCategories(data.categories);
        }
      }
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedBookType, token, categories.length]);

  useEffect(() => {
    fetchBooks(1);
  }, [fetchBooks]);

  // Debounced search
  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout | null>(null);
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimer) clearTimeout(searchTimer);
    setSearchTimer(setTimeout(() => {
      fetchBooks(1);
    }, 400));
  };

  // Category click
  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? 'all' : categoryId);
  };

  // Book type click
  const handleBookTypeClick = (type: string) => {
    setSelectedBookType(type === selectedBookType ? 'all' : type);
  };

  // Open book dialog
  const openBook = (book: Book) => {
    setSelectedBook(book);
    setDialogOpen(true);
  };

  // Download book
  const handleDownload = (book: Book) => {
    if (book.isPremium) {
      toast({ title: 'این کتاب ویژه است و نیاز به اشتراک دارد', variant: 'destructive' });
      return;
    }
    toast({ title: 'دانلود شروع شد', variant: 'default' });
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
    fetchBooks(page);
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
            <Library className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">کتابخانه دیجیتال حقوقی</h1>
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
          placeholder="جستجو در کتابخانه دیجیتال..."
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
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-card text-foreground border-border hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20'
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
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-card text-foreground border-border hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20'
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

      {/* Book Type Filter */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="w-4 h-4" />
          نوع کتاب
        </div>
        <div className="flex gap-2 flex-wrap">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleBookTypeClick('all')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all border ${
              selectedBookType === 'all'
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-card text-foreground border-border hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20'
            }`}
          >
            همه
          </motion.button>
          {Object.entries(bookTypeConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <motion.button
                key={key}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleBookTypeClick(key)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5 ${
                  selectedBookType === key
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-card text-foreground border-border hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20'
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

      {/* Books List */}
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
      ) : books.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Library className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">نتیجه‌ای یافت نشد</p>
          <p className="text-sm text-muted-foreground mt-1">فیلترهای جستجو را تغییر دهید</p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedCategory}-${selectedBookType}-${viewMode}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
            }
          >
            {books.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <Card
                  className="group cursor-pointer hover:shadow-md hover:border-amber-200 dark:hover:border-amber-800 transition-all overflow-hidden relative"
                  onClick={() => openBook(book)}
                >
                  <CardContent className="p-0">
                    {viewMode === 'grid' ? (
                      /* Grid View */
                      <div className="space-y-3 p-4">
                        {/* Top section: type + category */}
                        <div className="flex items-center justify-between">
                          <Badge
                            variant="secondary"
                            className={`text-[11px] px-2 py-0.5 ${bookTypeConfig[book.bookType]?.color || ''}`}
                          >
                            {bookTypeConfig[book.bookType]?.label || book.bookType}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[11px] px-2 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                          >
                            {book.category.name}
                          </Badge>
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-sm group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-relaxed">
                          {book.title}
                        </h3>

                        {/* Summary */}
                        {book.summary && (
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                            {stripHtml(book.summary)}
                          </p>
                        )}

                        {/* Author & Publisher */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Users className="w-3 h-3" />
                            <span>{book.author}</span>
                          </div>
                          {book.publisher && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Building2 className="w-3 h-3" />
                              <span>{book.publisher}</span>
                            </div>
                          )}
                        </div>

                        {/* Tags */}
                        {book.tags && (
                          <div className="flex flex-wrap gap-1">
                            {parseJsonField(book.tags).slice(0, 3).map((tag, i) => (
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
                              {book.viewCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <Download className="w-3 h-3" />
                              {book.downloadCount}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {book.pagesCount} صفحه
                          </div>
                        </div>

                        {/* Premium Badge */}
                        {book.isPremium && (
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
                        <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                          {(() => {
                            const Icon = bookTypeConfig[book.bookType]?.icon || BookOpen;
                            return <Icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
                          })()}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-sm group-hover:text-amber-600 transition-colors">
                              {book.title}
                            </h3>
                            <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${bookTypeConfig[book.bookType]?.color || ''}`}>
                              {bookTypeConfig[book.bookType]?.label || book.bookType}
                            </Badge>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                              {book.category.name}
                            </Badge>
                            {book.isPremium && (
                              <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0">
                                <Star className="w-2.5 h-2.5 ml-0.5" />ویژه
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{book.author}</span>
                            {book.publisher && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{book.publisher}</span>}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-col items-end gap-1 shrink-0 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{book.viewCount}</span>
                          <span className="flex items-center gap-1"><Download className="w-3 h-3" />{book.downloadCount}</span>
                          <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{book.pagesCount} صفحه</span>
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
      {!loading && books.length > 0 && totalPages > 1 && (
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
                  className={`h-9 w-9 text-xs ${pagination.page === pageNum ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''}`}
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

      {/* Book Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[95dvh] sm:max-h-[90dvh] overflow-y-auto sm:overflow-y-hidden flex flex-col p-0">
          {selectedBook && (
            <>
              {/* Dialog Header */}
              <DialogHeader className="bg-gradient-to-l from-amber-600 to-orange-600 p-6 rounded-none">
                <DialogTitle className="text-white flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                    {(() => {
                      const Icon = bookTypeConfig[selectedBook.bookType]?.icon || BookOpen;
                      return <Icon className="w-5 h-5 text-white" />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold leading-relaxed">{selectedBook.title}</h2>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge className="bg-white/20 text-white text-[11px] px-2 py-0.5 border border-white/30 hover:bg-white/30">
                        {selectedBook.category.name}
                      </Badge>
                      <Badge className="bg-white/20 text-white text-[11px] px-2 py-0.5 border border-white/30 hover:bg-white/30">
                        {bookTypeConfig[selectedBook.bookType]?.label || selectedBook.bookType}
                      </Badge>
                      {selectedBook.isPremium && (
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
                    {/* Book Info Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                        <div className="text-[11px] text-muted-foreground">نویسنده</div>
                        <div className="text-sm font-medium flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-amber-600" />
                          {selectedBook.author}
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                        <div className="text-[11px] text-muted-foreground">ناشر</div>
                        <div className="text-sm font-medium flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-amber-600" />
                          {selectedBook.publisher || '—'}
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                        <div className="text-[11px] text-muted-foreground">تعداد صفحات</div>
                        <div className="text-sm font-medium flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                          {selectedBook.pagesCount} صفحه
                        </div>
                      </div>
                      {selectedBook.isbn && (
                        <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                          <div className="text-[11px] text-muted-foreground">شابک</div>
                          <div className="text-sm font-medium">{selectedBook.isbn}</div>
                        </div>
                      )}
                      {selectedBook.publishedYear && (
                        <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                          <div className="text-[11px] text-muted-foreground">سال انتشار</div>
                          <div className="text-sm font-medium flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-amber-600" />
                            {selectedBook.publishedYear}
                          </div>
                        </div>
                      )}
                      <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                        <div className="text-[11px] text-muted-foreground">زبان</div>
                        <div className="text-sm font-medium">{selectedBook.language === 'fa' ? 'فارسی' : selectedBook.language}</div>
                      </div>
                    </div>

                    {/* Summary */}
                    {selectedBook.summary && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                          <BookMarked className="w-4 h-4" />
                          خلاصه
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 rounded-lg p-3">
                          {stripHtml(selectedBook.summary)}
                        </p>
                      </div>
                    )}

                    {/* Tags */}
                    {selectedBook.tags && parseJsonField(selectedBook.tags).length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          برچسب‌ها
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {parseJsonField(selectedBook.tags).map((tag, i) => (
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
                        <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          متن کامل
                        </h3>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1.5"
                            onClick={() => handleCopyText(selectedBook.content)}
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
                          <Button
                            size="sm"
                            className="h-8 text-xs gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
                            onClick={() => handleDownload(selectedBook)}
                          >
                            <Download className="w-3.5 h-3.5" />
                            دانلود
                          </Button>
                        </div>
                      </div>
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none bg-card border rounded-xl p-6 leading-loose text-sm whitespace-pre-wrap"
                        dir="rtl"
                        dangerouslySetInnerHTML={{ __html: selectedBook.content }}
                      />
                    </div>
                  </div>
                </ScrollArea>

                {/* Dialog Footer */}
                <div className="border-t p-4 flex items-center justify-between bg-muted/30">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      بازدید: {selectedBook.viewCount}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5" />
                      دانلود: {selectedBook.downloadCount}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      {selectedBook.pagesCount} صفحه
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
