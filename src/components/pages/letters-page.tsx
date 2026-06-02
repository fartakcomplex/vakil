'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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
  Mail, Search, Grid3X3 as Grid, List, Eye, BookOpen,
  Tag, Scale, Copy, Check, ChevronLeft, ChevronRight,
  Shield, GraduationCap, Layers, Building2, FileText,
  Briefcase, Heart, Landmark, Gavel, Stethoscope, Home, UserCheck,
  ShieldAlert, Users, Factory, PiggyBank, HeartPulse, FileCheck,
} from 'lucide-react';

// Types
interface LetterCategoryChild {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  order: number;
  parentId: string | null;
}

interface LetterCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  order: number;
  parentId: string | null;
  children?: LetterCategoryChild[];
  _count?: { letters: number };
}

interface OfficialLetter {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  summary: string | null;
  categoryId: string;
  category: LetterCategory;
  recipientType: string | null;
  tags: string | null;
  applicableLaws: string | null;
  difficulty: string;
  viewCount: number;
  isPublished: boolean;
  version: string;
  createdAt: string;
  updatedAt: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Gavel: Gavel, Shield: Shield, Landmark: Landmark, HeartPulse: HeartPulse, Briefcase: Briefcase,
  Building2: Building2, Factory: Factory, PiggyBank: PiggyBank, Heart: Heart,
  GraduationCap: GraduationCap, BookOpen: BookOpen, Stethoscope: Stethoscope,
  UserCheck: UserCheck, Home: Home, ShieldAlert: ShieldAlert, Users: Users, FileText: FileText,
  Scale: Scale, FileCheck: FileCheck,
};

function parseTags(tagsStr: string | null): string[] {
  if (!tagsStr) return [];
  try { return JSON.parse(tagsStr); } catch { return []; }
}

function parseLaws(lawsStr: string | null): string[] {
  if (!lawsStr) return [];
  try { return JSON.parse(lawsStr); } catch { return []; }
}

function getDifficultyLabel(d: string) {
  switch (d) {
    case 'GENERAL': return { label: 'عمومی', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' };
    case 'SPECIALIZED': return { label: 'تخصصی', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' };
    case 'ADVANCED': return { label: 'پیشرفته', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' };
    default: return { label: d, color: 'bg-gray-100 text-gray-800' };
  }
}

export default function LettersPage() {
  const { token } = useAppStore();
  const { toast } = useToast();

  const [letters, setLetters] = useState<OfficialLetter[]>([]);
  const [categories, setCategories] = useState<LetterCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedRecipient, setSelectedRecipient] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLetter, setSelectedLetter] = useState<OfficialLetter | null>(null);
  const [copied, setCopied] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const fetchLetters = useCallback(async (page: number = 1) => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (searchQuery) params.set('search', searchQuery);
      if (selectedCategory) params.set('categoryId', selectedCategory);
      if (selectedDifficulty) params.set('difficulty', selectedDifficulty);
      if (selectedRecipient) params.set('recipientType', selectedRecipient);

      const res = await fetch(`/api/letters?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLetters(data.letters || []);
        setCategories(data.categories || []);
        setTotalPages(data.pagination?.pages || 1);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('Fetch letters error:', err);
    } finally {
      setLoading(false);
    }
  }, [token, searchQuery, selectedCategory, selectedDifficulty, selectedRecipient]);

  useEffect(() => {
    fetchLetters(1);
  }, [fetchLetters]);

  // Seed letters on first load
  useEffect(() => {
    const seedLetters = async () => {
      setSeeding(true);
      try {
        await fetch('/api/seed-letters', { method: 'POST' });
      } catch { /* ignore */ }
      setSeeding(false);
    };
    seedLetters();
  }, []);

  const handleViewLetter = async (letter: OfficialLetter) => {
    setSelectedLetter(letter);
    // Increment view via API
    try {
      await fetch(`/api/letters/${letter.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch { /* ignore */ }
  };

  const handleCopyContent = (content: string) => {
    // Strip HTML tags for clipboard
    const text = content.replace(/<[^>]*>/g, '').replace(/\n{3,}/g, '\n\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast({ title: 'کپی شد', description: 'متن نامه در کلیپ‌بورد کپی شد' });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const recipientTypes = useMemo(() => {
    const types = new Set<string>();
    letters.forEach(l => { if (l.recipientType) types.add(l.recipientType); });
    return Array.from(types).sort();
  }, [letters]);

  const recipientTypeLabels: Record<string, string> = {
    government: 'دولتی', court: 'دادگاه', insurance: 'بیمه', bank: 'بانک',
    company: 'شرکت', person: 'شخص حقیقی', municipality: 'شهرداری',
  };

  const filteredCount = useMemo(() => {
    let count = 0;
    categories.forEach(c => { count += c._count?.letters || 0; });
    return count;
  }, [categories]);

  // Skeleton loader
  if (seeding) {
    return (
      <div className="p-6 space-y-6" dir="rtl">
        <div className="flex items-center gap-3">
          <Mail className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">نامه‌های رسمی حقوقی</h1>
            <p className="text-sm text-muted-foreground">در حال آماده‌سازی نامه‌ها...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">نامه‌های رسمی حقوقی</h1>
            <p className="text-sm text-muted-foreground">{filteredCount} نامه رسمی آماده استفاده</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <Card className="border-0 shadow-sm bg-white/50 dark:bg-slate-800/50 backdrop-blur">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="جستجو در نامه‌ها..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-9 rounded-md border bg-background px-3 text-sm"
              >
                <option value="">همه دسته‌بندی‌ها</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name} ({cat._count?.letters || 0})</option>
                ))}
              </select>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="h-9 rounded-md border bg-background px-3 text-sm"
              >
                <option value="">همه سطوح</option>
                <option value="GENERAL">عمومی</option>
                <option value="SPECIALIZED">تخصصی</option>
                <option value="ADVANCED">پیشرفته</option>
              </select>
              {recipientTypes.length > 0 && (
                <select
                  value={selectedRecipient}
                  onChange={(e) => setSelectedRecipient(e.target.value)}
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">همه گیرندگان</option>
                  {recipientTypes.map(t => (
                    <option key={t} value={t}>{recipientTypeLabels[t] || t}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setSelectedCategory(''); setCurrentPage(1); }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !selectedCategory
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          همه
        </button>
        {categories.map(cat => {
          const Icon = ICON_MAP[cat.icon || 'FileText'] || FileText;
          return (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.id); setCurrentPage(1); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
              style={selectedCategory === cat.id ? { backgroundColor: cat.color || '#2563eb' } : {}}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.name}
              <span className="opacity-70">({cat._count?.letters || 0})</span>
            </button>
          );
        })}
      </div>

      {/* Letters Grid/List */}
      {loading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className={viewMode === 'grid' ? 'h-48 rounded-xl' : 'h-24 rounded-xl'} />
          ))}
        </div>
      ) : letters.length === 0 ? (
        <div className="text-center py-16">
          <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-lg text-muted-foreground">نامه‌ای یافت نشد</p>
          <p className="text-sm text-muted-foreground mt-1">فیلترهای جستجو را تغییر دهید</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {letters.map((letter, idx) => {
              const diff = getDifficultyLabel(letter.difficulty);
              const CatIcon = ICON_MAP[letter.category.icon || 'FileText'] || FileText;
              return (
                <motion.div
                  key={letter.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: idx * 0.02 }}
                  layout
                >
                  <Card
                    className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur h-full"
                    onClick={() => handleViewLetter(letter)}
                  >
                    <CardContent className="p-5 flex flex-col h-full">
                      {/* Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: letter.category.color + '20', color: letter.category.color }}
                        >
                          <CatIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm leading-relaxed line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {letter.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {letter.category.name}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1 leading-relaxed">
                        {letter.summary || letter.description}
                      </p>

                      {/* Tags */}
                      {letter.tags && parseTags(letter.tags).length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {parseTags(letter.tags).slice(0, 3).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                              {tag}
                            </Badge>
                          ))}
                          {parseTags(letter.tags).length > 3 && (
                            <span className="text-[10px] text-muted-foreground self-center">
                              +{parseTags(letter.tags).length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                        <Badge className={diff.color}>{diff.label}</Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{letter.viewCount}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {letters.map((letter, idx) => {
              const diff = getDifficultyLabel(letter.difficulty);
              const CatIcon = ICON_MAP[letter.category.icon || 'FileText'] || FileText;
              return (
                <motion.div
                  key={letter.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2, delay: idx * 0.01 }}
                  layout
                >
                  <Card
                    className="group cursor-pointer hover:shadow-md transition-all duration-200 border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur"
                    onClick={() => handleViewLetter(letter)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: letter.category.color + '20', color: letter.category.color }}
                        >
                          <CatIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm group-hover:text-blue-600 transition-colors truncate">
                            {letter.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">{letter.category.name}</span>
                            {letter.recipientType && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                                {recipientTypeLabels[letter.recipientType] || letter.recipientType}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Badge className={diff.color}>{diff.label}</Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{letter.viewCount}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => fetchLetters(currentPage - 1)}
          >
            <ChevronRight className="w-4 h-4" />
            قبلی
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const page = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
              if (page > totalPages) return null;
              return (
                <Button
                  key={page}
                  variant={page === currentPage ? 'default' : 'outline'}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => fetchLetters(page)}
                >
                  {page}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => fetchLetters(currentPage + 1)}
          >
            بعدی
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Letter Detail Dialog */}
      <Dialog open={!!selectedLetter} onOpenChange={() => setSelectedLetter(null)}>
        <DialogContent className="max-w-4xl max-h-[95dvh] sm:max-h-[90dvh] overflow-y-auto sm:overflow-y-hidden" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Mail className="w-5 h-5 text-blue-600" />
              {selectedLetter?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedLetter && (
            <div className="sm:overflow-y-auto">
              <ScrollArea className="sm:h-[calc(90dvh-120px)]">
                <div className="pr-4 sm:pr-6">
                  {/* Meta info */}
                  <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b">
                    <Badge style={{ backgroundColor: selectedLetter.category.color + '20', color: selectedLetter.category.color }}>
                      {selectedLetter.category.name}
                    </Badge>
                    <Badge className={getDifficultyLabel(selectedLetter.difficulty).color}>
                      {getDifficultyLabel(selectedLetter.difficulty).label}
                    </Badge>
                    {selectedLetter.recipientType && (
                      <Badge variant="outline">
                        {recipientTypeLabels[selectedLetter.recipientType] || selectedLetter.recipientType}
                      </Badge>
                    )}
                  </div>

                  {/* Tags */}
                  {selectedLetter.tags && parseTags(selectedLetter.tags).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                      {parseTags(selectedLetter.tags).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  )}

                  {/* Applicable Laws */}
                  {selectedLetter.applicableLaws && parseLaws(selectedLetter.applicableLaws).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <Scale className="w-3.5 h-3.5 text-muted-foreground" />
                      {parseLaws(selectedLetter.applicableLaws).map(law => (
                        <Badge key={law} variant="outline" className="text-xs">{law}</Badge>
                      ))}
                    </div>
                  )}

                  {/* Letter Content */}
                  <div
                    className="prose prose-sm max-w-none dark:prose-invert bg-white dark:bg-slate-900 rounded-xl p-6 shadow-inner border leading-8"
                    dangerouslySetInnerHTML={{ __html: selectedLetter.content }}
                  />

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-6 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyContent(selectedLetter.content)}
                    >
                      {copied ? <Check className="w-4 h-4 ml-1" /> : <Copy className="w-4 h-4 ml-1" />}
                      {copied ? 'کپی شد!' : 'کپی متن نامه'}
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
