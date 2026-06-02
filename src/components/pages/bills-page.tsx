'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import {
  ScrollText, Search, Grid3X3 as Grid, List, Eye, BookOpen,
  Tag, Scale, Copy, Check, ChevronLeft, ChevronRight,
  Shield, GraduationCap, Building2, FileText, Leaf, Monitor,
  Home, Car, Sprout, Palette, Zap, ShieldAlert, Users,
  Briefcase, Heart, Landmark, Stethoscope, PiggyBank,
  FileCheck, Clock, CheckCircle2, AlertCircle, HelpCircle,
} from 'lucide-react';

// Types
interface BillCategoryChild {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  order: number;
  parentId: string | null;
}

interface BillCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  order: number;
  parentId: string | null;
  children?: BillCategoryChild[];
  _count?: { bills: number };
}

interface Bill {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  summary: string | null;
  categoryId: string;
  category: BillCategory;
  billNumber: string | null;
  billType: string;
  presentationDate: string | null;
  tags: string | null;
  applicableLaws: string | null;
  difficulty: string;
  status: string;
  viewCount: number;
  isPublished: boolean;
  version: string;
  createdAt: string;
  updatedAt: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Scale: Scale, Shield: Shield, Landmark: Landmark, HeartPulse: Stethoscope, Briefcase: Briefcase,
  Building2: Building2, PiggyBank: PiggyBank, Heart: Heart,
  GraduationCap: GraduationCap, BookOpen: BookOpen, Stethoscope: Stethoscope,
  Users: Users, Home: Home, ShieldAlert: ShieldAlert, FileText: FileText,
  Leaf: Leaf, Monitor: Monitor, Car: Car, Sprout: Sprout, Palette: Palette,
  Zap: Zap, FileCheck: FileCheck,
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

function getBillTypeLabel(t: string) {
  switch (t) {
    case 'NEW': return { label: 'جدید', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' };
    case 'AMENDMENT': return { label: 'اصلاحی', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' };
    case 'SUPPLEMENTARY': return { label: 'الحاقی', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300' };
    default: return { label: t, color: 'bg-gray-100 text-gray-800' };
  }
}

function getStatusLabel(s: string) {
  switch (s) {
    case 'DRAFT': return { label: 'پیش‌نویس', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', icon: FileText };
    case 'UNDER_REVIEW': return { label: 'در دست بررسی', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: Clock };
    case 'APPROVED': return { label: 'تصویب شده', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle2 };
    case 'REJECTED': return { label: 'رد شده', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: AlertCircle };
    default: return { label: s, color: 'bg-gray-100 text-gray-800', icon: HelpCircle };
  }
}

export default function BillsPage() {
  const { token } = useAppStore();
  const { toast } = useToast();

  const [bills, setBills] = useState<Bill[]>([]);
  const [categories, setCategories] = useState<BillCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedBillType, setSelectedBillType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [copied, setCopied] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const fetchBills = useCallback(async (page: number = 1) => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (searchQuery) params.set('search', searchQuery);
      if (selectedCategory) params.set('categoryId', selectedCategory);
      if (selectedDifficulty) params.set('difficulty', selectedDifficulty);
      if (selectedBillType) params.set('billType', selectedBillType);
      if (selectedStatus) params.set('status', selectedStatus);

      const res = await fetch(`/api/bills?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBills(data.bills || []);
        setCategories(data.categories || []);
        setTotalPages(data.pagination?.pages || 1);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('Fetch bills error:', err);
    } finally {
      setLoading(false);
    }
  }, [token, searchQuery, selectedCategory, selectedDifficulty, selectedBillType, selectedStatus]);

  useEffect(() => {
    fetchBills(1);
  }, [fetchBills]);

  // Seed bills on first load
  useEffect(() => {
    const seedBills = async () => {
      setSeeding(true);
      try {
        await fetch('/api/seed-bills', { method: 'POST' });
      } catch { /* ignore */ }
      setSeeding(false);
    };
    seedBills();
  }, []);

  const handleViewBill = async (bill: Bill) => {
    setSelectedBill(bill);
    try {
      await fetch(`/api/bills/${bill.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch { /* ignore */ }
  };

  const handleCopyContent = (content: string) => {
    const text = content.replace(/<[^>]*>/g, '').replace(/\n{3,}/g, '\n\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast({ title: 'کپی شد', description: 'متن لایحه در کلیپ‌بورد کپی شد' });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const filteredCount = useMemo(() => {
    let count = 0;
    categories.forEach(c => { count += c._count?.bills || 0; });
    return count;
  }, [categories]);

  // Skeleton loader
  if (seeding) {
    return (
      <div className="p-6 space-y-6" dir="rtl">
        <div className="flex items-center gap-3">
          <ScrollText className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold">لایحه‌های حقوقی</h1>
            <p className="text-sm text-muted-foreground">در حال آماده‌سازی لایحه‌ها...</p>
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
            <ScrollText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">لایحه‌های حقوقی</h1>
            <p className="text-sm text-muted-foreground">{filteredCount} لایحه آماده استفاده</p>
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
                placeholder="جستجو در لایحه‌ها..."
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
                  <option key={cat.id} value={cat.id}>{cat.name} ({cat._count?.bills || 0})</option>
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
              <select
                value={selectedBillType}
                onChange={(e) => setSelectedBillType(e.target.value)}
                className="h-9 rounded-md border bg-background px-3 text-sm"
              >
                <option value="">همه انواع</option>
                <option value="NEW">جدید</option>
                <option value="AMENDMENT">اصلاحی</option>
                <option value="SUPPLEMENTARY">الحاقی</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-9 rounded-md border bg-background px-3 text-sm"
              >
                <option value="">همه وضعیت‌ها</option>
                <option value="DRAFT">پیش‌نویس</option>
                <option value="UNDER_REVIEW">در دست بررسی</option>
                <option value="APPROVED">تصویب شده</option>
                <option value="REJECTED">رد شده</option>
              </select>
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
              ? 'bg-purple-600 text-white shadow-sm'
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
              style={selectedCategory === cat.id ? { backgroundColor: cat.color || '#7c3aed' } : {}}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.name}
              <span className="opacity-70">({cat._count?.bills || 0})</span>
            </button>
          );
        })}
      </div>

      {/* Bills Grid/List */}
      {loading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className={viewMode === 'grid' ? 'h-56 rounded-xl' : 'h-28 rounded-xl'} />
          ))}
        </div>
      ) : bills.length === 0 ? (
        <div className="text-center py-16">
          <ScrollText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-lg text-muted-foreground">لایحه‌ای یافت نشد</p>
          <p className="text-sm text-muted-foreground mt-1">فیلترهای جستجو را تغییر دهید</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {bills.map((bill, idx) => {
              const diff = getDifficultyLabel(bill.difficulty);
              const btype = getBillTypeLabel(bill.billType);
              const bstatus = getStatusLabel(bill.status);
              const CatIcon = ICON_MAP[bill.category.icon || 'FileText'] || FileText;
              const StatusIcon = bstatus.icon;
              return (
                <motion.div
                  key={bill.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: idx * 0.02 }}
                  layout
                >
                  <Card
                    className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur h-full"
                    onClick={() => handleViewBill(bill)}
                  >
                    <CardContent className="p-5 flex flex-col h-full">
                      {/* Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: bill.category.color + '20', color: bill.category.color }}
                        >
                          <CatIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm leading-relaxed line-clamp-2 group-hover:text-purple-600 transition-colors">
                            {bill.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {bill.category.name}
                          </p>
                        </div>
                      </div>

                      {/* Bill number and date */}
                      <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                        {bill.billNumber && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {bill.billNumber}
                          </span>
                        )}
                        {bill.presentationDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {bill.presentationDate}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1 leading-relaxed">
                        {bill.summary || bill.description}
                      </p>

                      {/* Tags */}
                      {bill.tags && parseTags(bill.tags).length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {parseTags(bill.tags).slice(0, 3).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                              {tag}
                            </Badge>
                          ))}
                          {parseTags(bill.tags).length > 3 && (
                            <span className="text-[10px] text-muted-foreground self-center">
                              +{parseTags(bill.tags).length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Badge className={diff.color}>{diff.label}</Badge>
                          <Badge className={btype.color}>{btype.label}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={bstatus.color}>
                            <StatusIcon className="w-3 h-3 ml-1" />
                            {bstatus.label}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Eye className="w-3.5 h-3.5" />
                            <span>{bill.viewCount}</span>
                          </div>
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
            {bills.map((bill, idx) => {
              const diff = getDifficultyLabel(bill.difficulty);
              const btype = getBillTypeLabel(bill.billType);
              const bstatus = getStatusLabel(bill.status);
              const CatIcon = ICON_MAP[bill.category.icon || 'FileText'] || FileText;
              const StatusIcon = bstatus.icon;
              return (
                <motion.div
                  key={bill.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2, delay: idx * 0.01 }}
                  layout
                >
                  <Card
                    className="group cursor-pointer hover:shadow-md transition-all duration-200 border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur"
                    onClick={() => handleViewBill(bill)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: bill.category.color + '20', color: bill.category.color }}
                        >
                          <CatIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm group-hover:text-purple-600 transition-colors truncate">
                            {bill.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs text-muted-foreground">{bill.category.name}</span>
                            {bill.billNumber && (
                              <span className="text-xs text-muted-foreground">{bill.billNumber}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge className={diff.color}>{diff.label}</Badge>
                          <Badge className={btype.color}>{btype.label}</Badge>
                          <Badge className={bstatus.color}>
                            <StatusIcon className="w-3 h-3 ml-1" />
                            {bstatus.label}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Eye className="w-3.5 h-3.5" />
                            <span>{bill.viewCount}</span>
                          </div>
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
            onClick={() => fetchBills(currentPage - 1)}
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
                  onClick={() => fetchBills(page)}
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
            onClick={() => fetchBills(currentPage + 1)}
          >
            بعدی
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Bill Detail Dialog */}
      <Dialog open={!!selectedBill} onOpenChange={() => setSelectedBill(null)}>
        <DialogContent className="max-w-4xl max-h-[95dvh] sm:max-h-[90dvh] overflow-y-auto sm:overflow-y-hidden" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <ScrollText className="w-5 h-5 text-purple-600" />
              {selectedBill?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedBill && (
            <div className="sm:overflow-y-auto">
              <ScrollArea className="sm:h-[calc(90dvh-120px)]">
                <div className="pr-4 sm:pr-6">
                  {/* Meta info */}
                  <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b">
                    <Badge style={{ backgroundColor: selectedBill.category.color + '20', color: selectedBill.category.color }}>
                      {selectedBill.category.name}
                    </Badge>
                    <Badge className={getDifficultyLabel(selectedBill.difficulty).color}>
                      {getDifficultyLabel(selectedBill.difficulty).label}
                    </Badge>
                    <Badge className={getBillTypeLabel(selectedBill.billType).color}>
                      {getBillTypeLabel(selectedBill.billType).label}
                    </Badge>
                    <Badge className={getStatusLabel(selectedBill.status).color}>
                      {getStatusLabel(selectedBill.status).label}
                    </Badge>
                    {selectedBill.billNumber && (
                      <Badge variant="outline">شماره: {selectedBill.billNumber}</Badge>
                    )}
                    {selectedBill.presentationDate && (
                      <Badge variant="outline">تاریخ: {selectedBill.presentationDate}</Badge>
                    )}
                  </div>

                  {/* Tags */}
                  {selectedBill.tags && parseTags(selectedBill.tags).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                      {parseTags(selectedBill.tags).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  )}

                  {/* Applicable Laws */}
                  {selectedBill.applicableLaws && parseLaws(selectedBill.applicableLaws).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <Scale className="w-3.5 h-3.5 text-muted-foreground" />
                      {parseLaws(selectedBill.applicableLaws).map(law => (
                        <Badge key={law} variant="outline" className="text-xs">{law}</Badge>
                      ))}
                    </div>
                  )}

                  {/* Bill Content */}
                  <div
                    className="prose prose-sm max-w-none dark:prose-invert bg-white dark:bg-slate-900 rounded-xl p-6 shadow-inner border leading-8"
                    dangerouslySetInnerHTML={{ __html: selectedBill.content }}
                  />

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-6 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyContent(selectedBill.content)}
                    >
                      {copied ? <Check className="w-4 h-4 ml-1" /> : <Copy className="w-4 h-4 ml-1" />}
                      {copied ? 'کپی شد!' : 'کپی متن لایحه'}
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
