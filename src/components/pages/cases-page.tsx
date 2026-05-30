'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/persian';
import { formatDate, getStatusColor, getPriorityColor, getCaseTypeName, getStatusName, toPersianNumber } from '@/lib/utils-helpers';
import { Briefcase, Plus, Search, LayoutGrid, List, ArrowLeft, FileText, MessageSquare, Clock, CalendarDays, StickyNote, Gavel, ChevronLeft } from 'lucide-react';
import type { CaseStatus, CasePriority, CaseType } from '@/lib/types';

export default function CasesPage() {
  const { cases, setCases, users, setPage } = useAppStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCase, setNewCase] = useState({ title: '', type: 'civil' as CaseType, priority: 'MEDIUM' as CasePriority, description: '', clientId: '' });

  const filtered = useMemo(() => {
    return cases.filter((c) => {
      const matchSearch = !search || c.title.includes(search) || c.caseNumber.includes(search);
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchType = typeFilter === 'all' || c.type === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [cases, search, statusFilter, typeFilter]);

  const selected = cases.find((c) => c.id === selectedCase);
  const clients = users.filter((u) => u.role === 'CLIENT');
  const lawyers = users.filter((u) => u.role === 'LAWYER');

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${useAppStore.getState().token}` },
        body: JSON.stringify(newCase),
      });
      if (res.ok) {
        const data = await res.json();
        setCases([data.data, ...cases]);
        setDialogOpen(false);
        setNewCase({ title: '', type: 'civil', priority: 'MEDIUM', description: '', clientId: '' });
      }
    } catch { /* ignore */ }
  };

  if (selected) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => setSelectedCase(null)}>
            <ArrowLeft className="w-4 h-4 ml-1" /> بازگشت
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{selected.title}</h1>
            <p className="text-sm text-muted-foreground">{selected.caseNumber}</p>
          </div>
          <Badge className={getStatusColor(selected.status)}>{getStatusName(selected.status)}</Badge>
          <Badge className={getPriorityColor(selected.priority)}>{t(`priority.${selected.priority}`)}</Badge>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="overview" className="text-xs">خلاصه</TabsTrigger>
            <TabsTrigger value="documents" className="text-xs">مدارک</TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs">تاریخچه</TabsTrigger>
            <TabsTrigger value="comments" className="text-xs">نظرات</TabsTrigger>
            <TabsTrigger value="notes" className="text-xs">یادداشت</TabsTrigger>
            <TabsTrigger value="hearings" className="text-xs">جلسات</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card><CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-sm">اطلاعات پرونده</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">نوع:</span> <Badge variant="secondary">{getCaseTypeName(selected.type)}</Badge></div>
                  <div><span className="text-muted-foreground">دادگاه:</span> {selected.court || '—'}</div>
                  <div><span className="text-muted-foreground">قاضی:</span> {selected.judgeName || '—'}</div>
                  <div><span className="text-muted-foreground">شعبه:</span> {selected.courtBranch || '—'}</div>
                  <div><span className="text-muted-foreground">تاریخ ثبت:</span> {selected.filingDate ? formatDate(selected.filingDate) : '—'}</div>
                  <div><span className="text-muted-foreground">جلسه بعدی:</span> {selected.nextHearing ? formatDate(selected.nextHearing) : '—'}</div>
                </div>
                <Separator />
                <h3 className="font-semibold text-sm">توضیحات</h3>
                <p className="text-sm text-muted-foreground">{selected.description || 'توضیحاتی ثبت نشده'}</p>
              </CardContent></Card>
              <Card><CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-sm">اطراف پرونده</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">وکیل:</span> <span>{selected.lawyer ? `${selected.lawyer.firstName} ${selected.lawyer.lastName}` : '—'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">موکل:</span> <span>{selected.client ? `${selected.client.firstName} ${selected.client.lastName}` : '—'}</span></div>
                  {selected.intern && <div className="flex justify-between"><span className="text-muted-foreground">کارآموز:</span> <span>{selected.intern.firstName} {selected.intern.lastName}</span></div>}
                </div>
              </CardContent></Card>
            </div>
          </TabsContent>
          {['documents', 'timeline', 'comments', 'notes', 'hearings'].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">
                {tab === 'documents' && <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />}
                {tab === 'timeline' && <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />}
                {tab === 'comments' && <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />}
                {tab === 'notes' && <StickyNote className="w-8 h-8 mx-auto mb-2 opacity-40" />}
                {tab === 'hearings' && <Gavel className="w-8 h-8 mx-auto mb-2 opacity-40" />}
                داده‌ای برای این بخش موجود نیست
              </CardContent></Card>
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold">{t('cases.title')}</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white"><Plus className="w-4 h-4 ml-1" />{t('cases.new')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t('cases.new')}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1"><Label className="text-xs">{t('cases.title')}</Label><Input value={newCase.title} onChange={(e) => setNewCase({ ...newCase, title: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">{t('cases.type')}</Label>
                  <Select value={newCase.type} onValueChange={(v) => setNewCase({ ...newCase, type: v as CaseType })}>
                    <SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{(['civil', 'criminal', 'family', 'corporate', 'labor', 'tax'] as CaseType[]).map((ct) => <SelectItem key={ct} value={ct}>{getCaseTypeName(ct)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label className="text-xs">{t('cases.priority')}</Label>
                  <Select value={newCase.priority} onValueChange={(v) => setNewCase({ ...newCase, priority: v as CasePriority })}>
                    <SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as CasePriority[]).map((p) => <SelectItem key={p} value={p}>{t(`priority.${p}`)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1"><Label className="text-xs">{t('cases.client')}</Label>
                <Select value={newCase.clientId} onValueChange={(v) => setNewCase({ ...newCase, clientId: v })}>
                  <SelectTrigger><SelectValue placeholder="انتخاب موکل" /></SelectTrigger>
                  <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label className="text-xs">{t('cases.description')}</Label><Textarea value={newCase.description} onChange={(e) => setNewCase({ ...newCase, description: e.target.value })} rows={3} /></div>
              <Button onClick={handleCreate} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">{t('common.save')}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('cases.search')} className="pr-9 text-sm" /></div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 text-sm"><SelectValue placeholder="وضعیت" /></SelectTrigger>
          <SelectContent><SelectItem value="all">همه وضعیت‌ها</SelectItem>{(['OPEN', 'IN_PROGRESS', 'PENDING', 'CLOSED', 'ARCHIVED'] as CaseStatus[]).map((s) => <SelectItem key={s} value={s}>{getStatusName(s)}</SelectItem>)}</SelectContent>
        </Select>
        <div className="flex gap-1">
          <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}><LayoutGrid className="w-4 h-4" /></Button>
          <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}><List className="w-4 h-4" /></Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <motion.div key={c.id} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedCase(c.id)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600"><Briefcase className="w-5 h-5" /></div>
                    <Badge className={`${getPriorityColor(c.priority)} text-xs`}>{t(`priority.${c.priority}`)}</Badge>
                  </div>
                  <h3 className="font-semibold text-sm mb-1 truncate">{c.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{c.caseNumber} · {getCaseTypeName(c.type)}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className={`${getStatusColor(c.status)} text-xs`}>{getStatusName(c.status)}</Badge>
                    <span className="text-xs text-muted-foreground">{c.client ? `${c.client.firstName} ${c.client.lastName}` : ''}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {filtered.map((c) => (
              <div key={c.id} className="flex items-center gap-4 p-3 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => setSelectedCase(c.id)}>
                <Briefcase className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{c.title}</p><p className="text-xs text-muted-foreground">{c.caseNumber}</p></div>
                <Badge variant="secondary" className={`text-xs shrink-0 ${getStatusColor(c.status)}`}>{getStatusName(c.status)}</Badge>
                <Badge variant="secondary" className={`text-xs shrink-0 ${getPriorityColor(c.priority)}`}>{t(`priority.${c.priority}`)}</Badge>
              </div>
            ))}
            {filtered.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">{t('common.noData')}</div>}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
