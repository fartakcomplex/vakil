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
  Search, Filter, Eye, Check, ChevronLeft, ChevronRight,
  Star, Clock, Layers,
  Shield, Award, ScrollText, BadgeCheck, AlertTriangle,
  Calendar, User, Building2, FileText, RefreshCw,
  XCircle, CheckCircle2, HourglassIcon,
} from 'lucide-react';

// Types
interface LicenseUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

interface License {
  id: string;
  licenseNumber: string;
  licenseType: string;
  status: string;
  title: string;
  description: string | null;
  userId: string;
  user: LicenseUser;
  issueDate: string;
  expiryDate: string;
  issuingBody: string;
  renewalDate: string | null;
  certificateUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// License type config
const licenseTypeConfig: Record<string, { label: string; color: string; icon: typeof FileText }> = {
  LAWYER_LICENSE: { label: 'پروانه وکالت', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', icon: Award },
  SPECIALIZATION: { label: 'تخصص', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300', icon: Award },
  CERTIFICATE: { label: 'گواهینامه', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', icon: BadgeCheck },
  ACCREDITATION: { label: 'اعتباربخشی', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', icon: Shield },
};

// Status config
const statusConfig: Record<string, { label: string; color: string; icon: typeof FileText }> = {
  ACTIVE: { label: 'فعال', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', icon: CheckCircle2 },
  EXPIRED: { label: 'منقضی', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300', icon: XCircle },
  REVOKED: { label: 'لغو شده', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', icon: XCircle },
  PENDING_RENEWAL: { label: 'در انتظار تمدید', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', icon: HourglassIcon },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function daysUntilExpiry(expiryDate: string): number {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function isExpiringSoon(expiryDate: string, status: string): boolean {
  if (status !== 'ACTIVE') return false;
  const days = daysUntilExpiry(expiryDate);
  return days > 0 && days <= 30;
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

export default function LicensesPage() {
  const { token } = useAppStore();
  const { toast } = useToast();

  // State
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedLicenseType, setSelectedLicenseType] = useState<string>('all');
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch licenses
  const fetchLicenses = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (search) params.set('search', search);
      if (selectedStatus !== 'all') params.set('status', selectedStatus);
      if (selectedLicenseType !== 'all') params.set('licenseType', selectedLicenseType);

      const res = await fetch(`/api/licenses?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const data = await res.json();
        setLicenses(data.licenses || []);
        setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
      }
    } catch {
      setLicenses([]);
    } finally {
      setLoading(false);
    }
  }, [search, selectedStatus, selectedLicenseType, token]);

  useEffect(() => {
    fetchLicenses(1);
  }, [fetchLicenses]);

  // Debounced search
  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout | null>(null);
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimer) clearTimeout(searchTimer);
    setSearchTimer(setTimeout(() => {
      fetchLicenses(1);
    }, 400));
  };

  // Status click
  const handleStatusClick = (status: string) => {
    setSelectedStatus(status === selectedStatus ? 'all' : status);
  };

  // License type click
  const handleLicenseTypeClick = (type: string) => {
    setSelectedLicenseType(type === selectedLicenseType ? 'all' : type);
  };

  // Open license dialog
  const openLicense = (license: License) => {
    setSelectedLicense(license);
    setDialogOpen(true);
  };

  // Page navigation
  const goToPage = (page: number) => {
    fetchLicenses(page);
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">مدیریت مجوزها</h1>
            <p className="text-xs text-muted-foreground">
              تعداد کل: {pagination.total}
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="جستجو در مجوزها..."
          className="pr-9 pl-4 h-11 text-sm bg-card shadow-sm"
        />
      </div>

      {/* Status Filter */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="w-4 h-4" />
          وضعیت
        </div>
        <ScrollArea className="w-full" direction="horizontal">
          <div className="flex gap-2 pb-2 min-w-0">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleStatusClick('all')}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all border ${
                selectedStatus === 'all'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-card text-foreground border-border hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }`}
            >
              همه
            </motion.button>
            {Object.entries(statusConfig).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleStatusClick(key)}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5 ${
                    selectedStatus === key
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-card text-foreground border-border hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {config.label}
                </motion.button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* License Type Filter */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Layers className="w-4 h-4" />
          نوع مجوز
        </div>
        <div className="flex gap-2 flex-wrap">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleLicenseTypeClick('all')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all border ${
              selectedLicenseType === 'all'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-card text-foreground border-border hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            }`}
          >
            همه
          </motion.button>
          {Object.entries(licenseTypeConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <motion.button
                key={key}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleLicenseTypeClick(key)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5 ${
                  selectedLicenseType === key
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-card text-foreground border-border hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
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

      {/* Licenses List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : licenses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">نتیجه‌ای یافت نشد</p>
          <p className="text-sm text-muted-foreground mt-1">فیلترهای جستجو را تغییر دهید</p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedStatus}-${selectedLicenseType}-${search}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {licenses.map((license, index) => (
              <motion.div
                key={license.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <Card
                  className="group cursor-pointer hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all overflow-hidden"
                  onClick={() => openLicense(license)}
                >
                  <CardContent className="p-0">
                    <div className="flex items-start gap-4 p-4">
                      {/* Icon */}
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        license.status === 'ACTIVE'
                          ? isExpiringSoon(license.expiryDate, license.status)
                            ? 'bg-amber-100 dark:bg-amber-900/30'
                            : 'bg-emerald-100 dark:bg-emerald-900/30'
                          : license.status === 'PENDING_RENEWAL'
                          ? 'bg-amber-100 dark:bg-amber-900/30'
                          : license.status === 'REVOKED'
                          ? 'bg-red-100 dark:bg-red-900/30'
                          : 'bg-slate-100 dark:bg-slate-800/50'
                      }`}>
                        {(() => {
                          const Icon = licenseTypeConfig[license.licenseType]?.icon || Shield;
                          return <Icon className={`w-5 h-5 ${
                            license.status === 'ACTIVE'
                              ? isExpiringSoon(license.expiryDate, license.status)
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                              : license.status === 'PENDING_RENEWAL'
                              ? 'text-amber-600 dark:text-amber-400'
                              : license.status === 'REVOKED'
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-slate-500 dark:text-slate-400'
                          }`} />;
                        })()}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {license.title}
                          </h3>
                          <Badge
                            variant="secondary"
                            className={`text-[11px] px-2 py-0.5 ${statusConfig[license.status]?.color || ''}`}
                          >
                            {(() => {
                              const Icon = statusConfig[license.status]?.icon || Shield;
                              return <><Icon className="w-2.5 h-2.5 ml-0.5" />{statusConfig[license.status]?.label || license.status}</>;
                            })()}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-[11px] px-2 py-0.5 ${licenseTypeConfig[license.licenseType]?.color || ''}`}
                          >
                            {licenseTypeConfig[license.licenseType]?.label || license.licenseType}
                          </Badge>

                          {/* Expiring soon warning */}
                          {isExpiringSoon(license.expiryDate, license.status) && (
                            <Badge className="bg-amber-500 text-white text-[10px] px-2 py-0.5 animate-pulse">
                              <AlertTriangle className="w-2.5 h-2.5 ml-0.5" />
                              رو به اتمام
                            </Badge>
                          )}
                        </div>

                        {license.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {stripHtml(license.description)}
                          </p>
                        )}

                        {/* Info Row */}
                        <div className="flex items-center gap-4 text-[11px] text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {license.user.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {license.issuingBody}
                          </span>
                          <span className="flex items-center gap-1">
                            <ScrollText className="w-3 h-3" />
                            {license.licenseNumber}
                          </span>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="shrink-0 flex flex-col items-end gap-1.5 text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(license.issueDate)}
                        </div>
                        <div className={`flex items-center gap-1 ${
                          license.status === 'EXPIRED' || (license.status === 'ACTIVE' && daysUntilExpiry(license.expiryDate) <= 30)
                            ? 'text-rose-500 dark:text-rose-400'
                            : ''
                        }`}>
                          <Clock className="w-3 h-3" />
                          {formatDate(license.expiryDate)}
                        </div>
                        {license.renewalDate && (
                          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            <RefreshCw className="w-3 h-3" />
                            {formatDate(license.renewalDate)}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {!loading && licenses.length > 0 && totalPages > 1 && (
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
                  className={`h-9 w-9 text-xs ${pagination.page === pageNum ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
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

      {/* License Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[95dvh] sm:max-h-[90dvh] overflow-y-auto sm:overflow-y-hidden flex flex-col p-0">
          {selectedLicense && (
            <>
              {/* Dialog Header */}
              <DialogHeader className="bg-gradient-to-l from-blue-600 to-cyan-600 p-6 rounded-none">
                <DialogTitle className="text-white flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                    {(() => {
                      const Icon = licenseTypeConfig[selectedLicense.licenseType]?.icon || Shield;
                      return <Icon className="w-5 h-5 text-white" />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold leading-relaxed">{selectedLicense.title}</h2>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge className="bg-white/20 text-white text-[11px] px-2 py-0.5 border border-white/30 hover:bg-white/30">
                        {statusConfig[selectedLicense.status]?.label || selectedLicense.status}
                      </Badge>
                      <Badge className="bg-white/20 text-white text-[11px] px-2 py-0.5 border border-white/30 hover:bg-white/30">
                        {licenseTypeConfig[selectedLicense.licenseType]?.label || selectedLicense.licenseType}
                      </Badge>
                      {isExpiringSoon(selectedLicense.expiryDate, selectedLicense.status) && (
                        <Badge className="bg-amber-400 text-amber-900 text-[11px] px-2 py-0.5">
                          <AlertTriangle className="w-3 h-3 ml-0.5" />رو به اتمام
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
                    {/* Warning Banner for Expiring Soon */}
                    {isExpiringSoon(selectedLicense.expiryDate, selectedLicense.status) && (
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                            هشدار: این مجوز رو به اتمام است
                          </p>
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                            {daysUntilExpiry(selectedLicense.expiryDate)} روز تا انقضای مجوز باقی‌مانده است. لطفاً نسبت به تمدید آن اقدام فرمایید.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* License Details Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                        <div className="text-[11px] text-muted-foreground">شماره مجوز</div>
                        <div className="text-sm font-medium flex items-center gap-1.5">
                          <ScrollText className="w-3.5 h-3.5 text-blue-600" />
                          {selectedLicense.licenseNumber}
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                        <div className="text-[11px] text-muted-foreground">نوع مجوز</div>
                        <div className="text-sm font-medium">
                          {licenseTypeConfig[selectedLicense.licenseType]?.label || selectedLicense.licenseType}
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                        <div className="text-[11px] text-muted-foreground">تاریخ صدور</div>
                        <div className="text-sm font-medium flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-600" />
                          {formatDate(selectedLicense.issueDate)}
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                        <div className="text-[11px] text-muted-foreground">تاریخ انقضا</div>
                        <div className={`text-sm font-medium flex items-center gap-1.5 ${
                          selectedLicense.status === 'EXPIRED' || isExpiringSoon(selectedLicense.expiryDate, selectedLicense.status)
                            ? 'text-rose-600 dark:text-rose-400'
                            : ''
                        }`}>
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(selectedLicense.expiryDate)}
                        </div>
                      </div>
                    </div>

                    {/* User & Issuing Body */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{selectedLicense.user.name}</p>
                          <p className="text-xs text-muted-foreground">{selectedLicense.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{selectedLicense.issuingBody}</p>
                          <p className="text-xs text-muted-foreground">مرجع صادرکننده</p>
                        </div>
                      </div>
                    </div>

                    {/* Renewal Date */}
                    {selectedLicense.renewalDate && (
                      <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                        <RefreshCw className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        <div>
                          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                            تاریخ تمدید: {formatDate(selectedLicense.renewalDate)}
                          </p>
                          <p className="text-xs text-amber-600 dark:text-amber-400">در انتظار تأیید</p>
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {selectedLicense.description && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          توضیحات
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 rounded-lg p-3">
                          {stripHtml(selectedLicense.description)}
                        </p>
                      </div>
                    )}

                    {/* Notes */}
                    {selectedLicense.notes && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          یادداشت‌ها
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 rounded-lg p-3">
                          {stripHtml(selectedLicense.notes)}
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Dialog Footer */}
                <div className="border-t p-4 flex items-center justify-between bg-muted/30">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      صدور: {formatDate(selectedLicense.issueDate)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      انقضا: {formatDate(selectedLicense.expiryDate)}
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
