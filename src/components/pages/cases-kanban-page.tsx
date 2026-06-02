'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/persian';
import { getPriorityColor, getCaseTypeName, toPersianNumber } from '@/lib/utils-helpers';
import type { CaseStatus, CasePriority, CaseType } from '@/lib/types';
import {
  Search, LayoutGrid, Filter, GripVertical, Clock, AlertCircle,
  CalendarDays, ArrowRight, ArrowLeft,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// ---- Column Definitions ----
interface KanbanColumn {
  id: CaseStatus;
  title: string;
  color: string;
  bgGradient: string;
  dotColor: string;
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'OPEN', title: 'جدید', color: 'text-emerald-700 dark:text-emerald-300', bgGradient: 'from-emerald-500 to-teal-600', dotColor: 'bg-emerald-500' },
  { id: 'IN_PROGRESS', title: 'در حال بررسی', color: 'text-blue-700 dark:text-blue-300', bgGradient: 'from-blue-500 to-indigo-600', dotColor: 'bg-blue-500' },
  { id: 'PENDING', title: 'جلسه بعدی', color: 'text-amber-700 dark:text-amber-300', bgGradient: 'from-amber-500 to-orange-600', dotColor: 'bg-amber-500' },
  { id: 'CLOSED', title: 'منتظر تصمیم', color: 'text-purple-700 dark:text-purple-300', bgGradient: 'from-purple-500 to-violet-600', dotColor: 'bg-purple-500' },
  { id: 'ARCHIVED', title: 'بسته شده', color: 'text-gray-700 dark:text-gray-300', bgGradient: 'from-gray-500 to-slate-600', dotColor: 'bg-gray-400' },
];

const PRIORITY_CONFIG: Record<CasePriority, { color: string; label: string; dotColor: string }> = {
  URGENT: { color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-300 dark:border-red-800', label: 'فوری', dotColor: 'bg-red-500' },
  HIGH: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border-orange-300 dark:border-orange-800', label: 'زیاد', dotColor: 'bg-orange-500' },
  MEDIUM: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300 dark:border-amber-800', label: 'متوسط', dotColor: 'bg-amber-500' },
  LOW: { color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-300 dark:border-green-800', label: 'کم', dotColor: 'bg-green-500' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function CasesKanbanPage() {
  const { cases, users, setCases } = useAppStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const { toast } = useToast();

  const dragItem = useRef<string | null>(null);
  const dragOverColumn = useRef<CaseStatus | null>(null);

  const clients = useMemo(() => {
    const map = new Map<string, string>();
    users.filter((u) => u.role === 'CLIENT').forEach((u) => {
      map.set(u.id, `${u.firstName} ${u.lastName}`);
    });
    return map;
  }, [users]);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchSearch = !search || c.title.includes(search) || c.caseNumber.includes(search);
      const matchType = typeFilter === 'all' || c.type === typeFilter;
      const matchPriority = priorityFilter === 'all' || c.priority === priorityFilter;
      return matchSearch && matchType && matchPriority;
    });
  }, [cases, search, typeFilter, priorityFilter]);

  const casesByColumn = useMemo(() => {
    const map: Record<CaseStatus, typeof filteredCases> = {
      OPEN: [], IN_PROGRESS: [], PENDING: [], CLOSED: [], ARCHIVED: [],
    };
    filteredCases.forEach((c) => {
      if (map[c.status]) map[c.status].push(c);
    });
    return map;
  }, [filteredCases]);

  const handleDragStart = useCallback((caseId: string) => {
    dragItem.current = caseId;
  }, []);

  const handleDragOver = useCallback((columnId: CaseStatus) => {
    dragOverColumn.current = columnId;
  }, []);

  const handleDrop = useCallback((columnId: CaseStatus) => {
    const caseId = dragItem.current;
    if (!caseId || dragOverColumn.current === null) return;
    const currentCase = cases.find((c) => c.id === caseId);
    if (!currentCase || currentCase.status === columnId) return;

    const updatedCases = cases.map((c) =>
      c.id === caseId
        ? { ...c, status: columnId, updatedAt: new Date().toISOString() }
        : c
    );
    setCases(updatedCases);

    const colName = KANBAN_COLUMNS.find((col) => col.id === columnId)?.title;
    toast({
      title: 'وضعیت پرونده تغییر کرد',
      description: `«${currentCase.title}» به ستون «${colName}» منتقل شد`,
    });

    dragItem.current = null;
    dragOverColumn.current = null;
  }, [cases, setCases, toast]);

  const handleDragEnd = useCallback(() => {
    dragItem.current = null;
    dragOverColumn.current = null;
  }, []);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-emerald-500" />
            تخته کانبان پرونده‌ها
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {toPersianNumber(cases.length)} پرونده · مدیریت بصری وضعیت پرونده‌ها
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی عنوان یا شماره پرونده..."
            className="pr-9 text-sm"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40 text-sm">
            <SelectValue placeholder="نوع پرونده" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه انواع</SelectItem>
            {(['civil', 'criminal', 'family', 'corporate', 'labor', 'tax'] as CaseType[]).map((ct) => (
              <SelectItem key={ct} value={ct}>{getCaseTypeName(ct)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-40 text-sm">
            <SelectValue placeholder="اولویت" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه اولویت‌ها</SelectItem>
            {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as CasePriority[]).map((p) => (
              <SelectItem key={p} value={p}>{t(`priority.${p}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {KANBAN_COLUMNS.map((column) => {
          const columnCases = casesByColumn[column.id] || [];
          return (
            <motion.div
              key={column.id}
              variants={cardVariants}
              className="flex flex-col"
            >
              {/* Column Header */}
              <div className={`flex items-center justify-between px-4 py-3 rounded-t-xl bg-gradient-to-l ${column.bgGradient} text-white`}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white/80" />
                  <h3 className="text-sm font-bold">{column.title}</h3>
                </div>
                <Badge className="bg-white/20 text-white border-0 text-[11px] px-2 py-0.5 hover:bg-white/30">
                  {toPersianNumber(columnCases.length)}
                </Badge>
              </div>

              {/* Column Body (Drop Zone) */}
              <div
                className="flex-1 min-h-[300px] max-h-[calc(100vh-300px)] rounded-b-xl border border-t-0 border-border/50 bg-muted/20 backdrop-blur-sm p-2 transition-colors"
                onDragOver={(e) => {
                  e.preventDefault();
                  handleDragOver(column.id);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(column.id);
                }}
                onDragLeave={() => {
                  dragOverColumn.current = null;
                }}
              >
                <ScrollArea className="h-full max-h-[calc(100vh-320px)]">
                  <div className="space-y-2 p-1">
                    <AnimatePresence mode="popLayout">
                      {columnCases.map((c) => {
                        const priorityConfig = PRIORITY_CONFIG[c.priority];
                        const clientName = c.clientId ? clients.get(c.clientId) : null;
                        return (
                          <motion.div
                            key={c.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            draggable
                            onDragStart={() => handleDragStart(c.id)}
                            onDragEnd={handleDragEnd}
                            className="cursor-grab active:cursor-grabbing"
                          >
                            <Card className="shadow-sm hover:shadow-md transition-all duration-200 border border-border/50 hover:border-border group">
                              <CardContent className="p-3 space-y-2.5">
                                {/* Drag Handle + Title */}
                                <div className="flex items-start gap-2">
                                  <GripVertical className="w-4 h-4 text-muted-foreground/40 mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate leading-relaxed">{c.title}</p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">{c.caseNumber}</p>
                                  </div>
                                </div>

                                {/* Client Name */}
                                {clientName && (
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                    <span className="truncate">{clientName}</span>
                                  </p>
                                )}

                                {/* Badges Row */}
                                <div className="flex items-center justify-between gap-2">
                                  <Badge className={`text-[10px] px-2 py-0 border ${priorityConfig.color}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ml-1 ${priorityConfig.dotColor}`} />
                                    {priorityConfig.label}
                                  </Badge>
                                  {c.type && (
                                    <Badge variant="secondary" className="text-[10px] px-2 py-0">
                                      {getCaseTypeName(c.type)}
                                    </Badge>
                                  )}
                                </div>

                                {/* Deadline */}
                                {c.nextHearing && (
                                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                    <CalendarDays className="w-3 h-3" />
                                    <span>{c.nextHearing}</span>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>

                    {/* Empty State */}
                    {columnCases.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground/50">
                        <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mb-2">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                        <p className="text-xs">پرونده‌ای وجود ندارد</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
