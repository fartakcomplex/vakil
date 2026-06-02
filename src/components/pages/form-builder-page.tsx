'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Type, AlignRight, Hash, CalendarDays, List, CheckSquare,
  CircleDot, FileUp, PenTool, Table2, Minus, Heading,
  Plus, Trash2, Settings, Eye, Save, Download, GripVertical,
  FormInput, ChevronDown, ChevronUp, X, Copy, LayoutGrid,
  FileText, ClipboardList, BookOpen, Star,
} from 'lucide-react';

// ============ TYPES ============
interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  required: boolean;
  helpText: string;
}

interface FieldTemplate {
  type: string;
  label: string;
  icon: typeof Type;
  color: string;
  defaultLabel: string;
  defaultPlaceholder: string;
}

interface FormTemplate {
  id: string;
  title: string;
  description: string;
  icon: typeof FileText;
  color: string;
  fields: FormField[];
}

// ============ FIELD TEMPLATES ============
const FIELD_TYPES: FieldTemplate[] = [
  { type: 'text', label: 'تک‌خطی', icon: Type, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600', defaultLabel: 'فیلد متنی', defaultPlaceholder: 'مقدار را وارد کنید...' },
  { type: 'textarea', label: 'چندخطی', icon: AlignRight, color: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600', defaultLabel: 'توضیحات', defaultPlaceholder: 'متن طولانی‌تر را وارد کنید...' },
  { type: 'number', label: 'عددی', icon: Hash, color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600', defaultLabel: 'عدد', defaultPlaceholder: 'عدد را وارد کنید...' },
  { type: 'date', label: 'تاریخ', icon: CalendarDays, color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600', defaultLabel: 'تاریخ', defaultPlaceholder: '' },
  { type: 'select', label: 'انتخابی', icon: List, color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600', defaultLabel: 'انتخاب گزینه', defaultPlaceholder: 'انتخاب کنید...' },
  { type: 'checkbox', label: 'چک‌باکس', icon: CheckSquare, color: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600', defaultLabel: 'تأیید', defaultPlaceholder: '' },
  { type: 'radio', label: 'رادیو', icon: CircleDot, color: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600', defaultLabel: 'انتخاب', defaultPlaceholder: '' },
  { type: 'file', label: 'فایل', icon: FileUp, color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600', defaultLabel: 'بارگذاری فایل', defaultPlaceholder: '' },
  { type: 'signature', label: 'امضا', icon: PenTool, color: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600', defaultLabel: 'امضا', defaultPlaceholder: '' },
  { type: 'table', label: 'جدول', icon: Table2, color: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600', defaultLabel: 'جدول اطلاعات', defaultPlaceholder: '' },
  { type: 'separator', label: 'جداکننده', icon: Minus, color: 'bg-gray-50 dark:bg-gray-900/20 text-gray-600', defaultLabel: '', defaultPlaceholder: '' },
  { type: 'heading', label: 'عنوان', icon: Heading, color: 'bg-slate-50 dark:bg-slate-900/20 text-slate-600', defaultLabel: 'عنوان بخش', defaultPlaceholder: '' },
];

const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: 'consultation',
    title: 'فرم ثبت درخواست مشاوره',
    description: 'فرم دریافت اطلاعات برای درخواست مشاوره حقوقی',
    icon: ClipboardList,
    color: 'from-emerald-500 to-teal-600',
    fields: [
      { id: 't1', type: 'heading', label: 'اطلاعات متقاضی', placeholder: '', required: false, helpText: '' },
      { id: 't2', type: 'text', label: 'نام و نام خانوادگی', placeholder: 'نام کامل خود را وارد کنید', required: true, helpText: 'نام دقیق مطابق شناسنامه' },
      { id: 't3', type: 'number', label: 'شماره تماس', placeholder: '۰۹۱۲۰۰۰۰۰۰۰', required: true, helpText: '' },
      { id: 't4', type: 'select', label: 'نوع مشاوره', placeholder: 'انتخاب کنید', required: true, helpText: '' },
      { id: 't5', type: 'textarea', label: 'شرح مختصر مشکل', placeholder: 'مسئله حقوقی خود را به اختصار توضیح دهید', required: true, helpText: '' },
      { id: 't6', type: 'file', label: 'فایل‌های پیوست', placeholder: '', required: false, helpText: 'اسناد مرتبط را آپلود کنید' },
    ],
  },
  {
    id: 'client-info',
    title: 'فرم اطلاعات موکل',
    description: 'فرم ثبت اطلاعات شخصی و حقوقی موکل',
    icon: BookOpen,
    color: 'from-blue-500 to-indigo-600',
    fields: [
      { id: 'c1', type: 'heading', label: 'اطلاعات فردی', placeholder: '', required: false, helpText: '' },
      { id: 'c2', type: 'text', label: 'نام', placeholder: 'نام', required: true, helpText: '' },
      { id: 'c3', type: 'text', label: 'نام خانوادگی', placeholder: 'نام خانوادگی', required: true, helpText: '' },
      { id: 'c4', type: 'number', label: 'کد ملی', placeholder: 'کد ملی ۱۰ رقمی', required: true, helpText: '' },
      { id: 'c5', type: 'text', label: 'شماره شناسنامه', placeholder: '', required: true, helpText: '' },
      { id: 'c6', type: 'date', label: 'تاریخ تولد', placeholder: '', required: true, helpText: '' },
      { id: 'c7', type: 'separator', label: '', placeholder: '', required: false, helpText: '' },
      { id: 'c8', type: 'heading', label: 'اطلاعات تماس', placeholder: '', required: false, helpText: '' },
      { id: 'c9', type: 'number', label: 'تلفن همراه', placeholder: '', required: true, helpText: '' },
      { id: 'c10', type: 'text', label: 'آدرس', placeholder: 'آدرس محل سکونت', required: true, helpText: '' },
    ],
  },
  {
    id: 'meeting-report',
    title: 'فرم گزارش جلسه',
    description: 'فرم ثبت صورت‌جلسه ملاقات با موکل',
    icon: Star,
    color: 'from-amber-500 to-orange-600',
    fields: [
      { id: 'm1', type: 'heading', label: 'اطلاعات جلسه', placeholder: '', required: false, helpText: '' },
      { id: 'm2', type: 'date', label: 'تاریخ جلسه', placeholder: '', required: true, helpText: '' },
      { id: 'm3', type: 'select', label: 'نوع جلسه', placeholder: 'انتخاب کنید', required: true, helpText: '' },
      { id: 'm4', type: 'separator', label: '', placeholder: '', required: false, helpText: '' },
      { id: 'm5', type: 'heading', label: 'محتوای جلسه', placeholder: '', required: false, helpText: '' },
      { id: 'm6', type: 'textarea', label: 'موضوع مورد بحث', placeholder: '', required: true, helpText: '' },
      { id: 'm7', type: 'textarea', label: 'تصمیمات اتخاذ شده', placeholder: '', required: true, helpText: '' },
      { id: 'm8', type: 'textarea', label: 'اقدامات بعدی', placeholder: '', required: false, helpText: '' },
    ],
  },
  {
    id: 'case-eval',
    title: 'فرم ارزیابی پرونده',
    description: 'فرم ارزیابی اولیه پرونده حقوقی',
    icon: FileText,
    color: 'from-rose-500 to-pink-600',
    fields: [
      { id: 'e1', type: 'heading', label: 'اطلاعات پرونده', placeholder: '', required: false, helpText: '' },
      { id: 'e2', type: 'text', label: 'عنوان پرونده', placeholder: '', required: true, helpText: '' },
      { id: 'e3', type: 'select', label: 'نوع دعوی', placeholder: '', required: true, helpText: '' },
      { id: 'e4', type: 'textarea', label: 'شرح案情', placeholder: '', required: true, helpText: '' },
      { id: 'e5', type: 'separator', label: '', placeholder: '', required: false, helpText: '' },
      { id: 'e6', type: 'heading', label: 'ارزیابی', placeholder: '', required: false, helpText: '' },
      { id: 'e7', type: 'textarea', label: 'نقاط قوت', placeholder: '', required: true, helpText: '' },
      { id: 'e8', type: 'textarea', label: 'نقاط ضعف', placeholder: '', required: true, helpText: '' },
      { id: 'e9', type: 'radio', label: 'توصیه به پذیرش پرونده', placeholder: '', required: true, helpText: '' },
    ],
  },
];

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.2 } } };

let _id = 0;
function genId() { return `f_${Date.now()}_${++_id}`; }

// ============ COMPONENT ============
export default function FormBuilderPage() {
  const { toast } = useToast();
  const [formTitle, setFormTitle] = useState('فرم حقوقی جدید');
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [dragItemIndex, setDragItemIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Selected field
  const selectedField = fields.find(f => f.id === selectedFieldId) || null;

  // Add field
  const addField = useCallback((type: string) => {
    const template = FIELD_TYPES.find(ft => ft.type === type);
    if (!template) return;
    const newField: FormField = {
      id: genId(),
      type: template.type,
      label: template.defaultLabel,
      placeholder: template.defaultPlaceholder,
      required: false,
      helpText: '',
    };
    setFields(prev => [...prev, newField]);
    setSelectedFieldId(newField.id);
    toast({ title: `فیلد "${template.label}" اضافه شد` });
  }, [toast]);

  // Load template
  const loadTemplate = useCallback((template: FormTemplate) => {
    setFields(template.fields.map(f => ({ ...f, id: genId() })));
    setFormTitle(template.title);
    setSelectedFieldId(null);
    setShowTemplates(false);
    toast({ title: `قالب "${template.title}" بارگذاری شد` });
  }, [toast]);

  // Update field
  const updateField = useCallback((id: string, updates: Partial<FormField>) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  }, []);

  // Delete field
  const deleteField = useCallback((id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
    if (selectedFieldId === id) setSelectedFieldId(null);
    toast({ title: 'فیلد حذف شد' });
  }, [selectedFieldId, toast]);

  // Duplicate field
  const duplicateField = useCallback((id: string) => {
    setFields(prev => {
      const idx = prev.findIndex(f => f.id === id);
      if (idx === -1) return prev;
      const original = prev[idx];
      const copy: FormField = { ...original, id: genId(), label: original.label + ' (کپی)' };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  }, [toast]);

  // Move field up/down
  const moveField = useCallback((id: string, dir: 'up' | 'down') => {
    setFields(prev => {
      const idx = prev.findIndex(f => f.id === id);
      if (idx === -1) return prev;
      if (dir === 'up' && idx === 0) return prev;
      if (dir === 'down' && idx === prev.length - 1) return prev;
      const next = [...prev];
      const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next;
    });
  }, []);

  // Drag handlers for canvas
  const handleDragStart = (index: number) => { setDragItemIndex(index); };
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };
  const handleDrop = (index: number) => {
    if (dragItemIndex === null || dragItemIndex === index) return;
    setFields(prev => {
      const next = [...prev];
      const [moved] = next.splice(dragItemIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragItemIndex(null);
    setDragOverIndex(null);
  };
  const handleDragEnd = () => { setDragItemIndex(null); setDragOverIndex(null); };

  // Render field preview widget
  const renderFieldPreview = (field: FormField) => {
    switch (field.type) {
      case 'text':
        return <Input disabled placeholder={field.placeholder || 'فیلد تک‌خطی'} className="h-9 text-xs" />;
      case 'textarea':
        return <Textarea disabled placeholder={field.placeholder || 'فیلد چندخطی'} className="text-xs min-h-[60px] resize-none" />;
      case 'number':
        return <Input disabled placeholder={field.placeholder || 'فیلد عددی'} type="number" className="h-9 text-xs" dir="ltr" />;
      case 'date':
        return <Input disabled type="date" className="h-9 text-xs" dir="ltr" />;
      case 'select':
        return (
          <div className="flex items-center gap-2 h-9 px-3 border rounded-md bg-muted text-xs text-muted-foreground">
            <List className="w-3.5 h-3.5" />
            {field.placeholder || 'انتخاب گزینه...'}
          </div>
        );
      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-muted-foreground/30" />
            <span className="text-xs text-muted-foreground">{field.label || 'چک‌باکس'}</span>
          </div>
        );
      case 'radio':
        return (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded-full border-2 border-muted-foreground/30" /><span className="text-xs text-muted-foreground">گزینه ۱</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded-full border-2 border-muted-foreground/30" /><span className="text-xs text-muted-foreground">گزینه ۲</span></div>
          </div>
        );
      case 'file':
        return (
          <div className="border-2 border-dashed rounded-lg p-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <FileUp className="w-4 h-4" />
            انتخاب فایل...
          </div>
        );
      case 'signature':
        return (
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <PenTool className="w-6 h-6 mx-auto text-muted-foreground/40 mb-2" />
            <span className="text-xs text-muted-foreground">محل امضا</span>
          </div>
        );
      case 'table':
        return (
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-3 text-[10px]">
              <div className="border-b border-l p-2 bg-muted/50 font-medium">ستون ۱</div>
              <div className="border-b border-l p-2 bg-muted/50 font-medium">ستون ۲</div>
              <div className="border-b p-2 bg-muted/50 font-medium">ستون ۳</div>
              <div className="border-b border-l p-2 text-muted-foreground">—</div>
              <div className="border-b border-l p-2 text-muted-foreground">—</div>
              <div className="border-b p-2 text-muted-foreground">—</div>
            </div>
          </div>
        );
      case 'separator':
        return <Separator />;
      case 'heading':
        return <h3 className="text-sm font-bold text-foreground">{field.label || 'عنوان بخش'}</h3>;
      default:
        return <Input disabled placeholder="فیلد" className="h-9 text-xs" />;
    }
  };

  // Render field type icon
  const getFieldIcon = (type: string) => {
    const ft = FIELD_TYPES.find(f => f.type === type);
    if (!ft) return Type;
    return ft.icon;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
            <FormInput className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">ساخت‌گر فرم هوشمند</h1>
            <p className="text-xs text-muted-foreground">ایجاد فرم‌های حقوقی سفارشی با قابلیت درگ‌اند‌دراپ</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5"
            onClick={() => setShowTemplates(!showTemplates)}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            قالب‌ها
          </Button>
          <Button
            variant={previewMode ? 'default' : 'outline'}
            size="sm"
            className={`text-xs gap-1.5 ${previewMode ? 'bg-gradient-to-l from-emerald-600 to-teal-600' : ''}`}
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="w-3.5 h-3.5" />
            {previewMode ? 'ویرایش' : 'پیش‌نمایش'}
          </Button>
          <Button size="sm" className="text-xs gap-1.5 bg-gradient-to-l from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white">
            <Save className="w-3.5 h-3.5" />
            ذخیره
          </Button>
          <Button size="sm" variant="outline" className="text-xs gap-1.5">
            <Download className="w-3.5 h-3.5" />
            خروجی
          </Button>
        </div>
      </div>

      {/* Template Gallery Modal */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative z-20"
          >
            <Card className="border-2 border-violet-200 dark:border-violet-800 shadow-lg">
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-violet-500" />
                  گالری قالب‌ها
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setShowTemplates(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {FORM_TEMPLATES.map((tpl) => (
                    <motion.div key={tpl.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Card
                        className="cursor-pointer hover:shadow-md transition-all overflow-hidden group"
                        onClick={() => loadTemplate(tpl)}
                      >
                        <div className={`h-2 bg-gradient-to-l ${tpl.color}`} />
                        <CardContent className="p-3 space-y-2">
                          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${tpl.color} flex items-center justify-center shadow-sm`}>
                            <tpl.icon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-bold">{tpl.title}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{tpl.description}</p>
                          </div>
                          <Badge variant="secondary" className="text-[9px]">{tpl.fields.length} فیلد</Badge>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Title */}
      {!previewMode && (
        <div className="relative">
          <Input
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            className="text-lg font-bold text-center h-12 bg-transparent border-dashed hover:border-solid focus:border-solid transition-colors"
          />
        </div>
      )}

      {/* Main Builder Layout */}
      {previewMode ? (
        /* Preview Mode */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="bg-gradient-to-l from-violet-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="text-lg font-bold">{formTitle}</CardTitle>
              <p className="text-xs text-white/70">فرم پیش‌نمایش — {fields.length} فیلد</p>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {fields.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FormInput className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">فرمی ایجاد نشده است</p>
                </div>
              ) : (
                fields.map((field) => (
                  <div key={field.id} className="space-y-1.5">
                    {field.type !== 'separator' && field.type !== 'heading' && (
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">{field.label}</label>
                        {field.required && <span className="text-rose-500 text-xs">*</span>}
                      </div>
                    )}
                    {renderFieldPreview(field)}
                    {field.helpText && (
                      <p className="text-[11px] text-muted-foreground">{field.helpText}</p>
                    )}
                  </div>
                ))
              )}
              <Separator />
              <Button className="w-full bg-gradient-to-l from-violet-600 to-purple-600 text-white">
                ارسال فرم
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        /* Edit Mode: 3-Column Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Sidebar: Toolbox */}
          <div className="lg:col-span-3">
            <Card className="sticky top-4">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs font-bold flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-violet-500" />
                  ابزارها
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <ScrollArea className="max-h-[calc(100vh-16rem)]">
                  <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-1.5">
                    {FIELD_TYPES.map((ft) => (
                      <motion.button
                        key={ft.type}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => addField(ft.type)}
                        className="w-full flex items-center gap-2.5 p-2.5 rounded-lg border border-transparent hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-all text-right group"
                      >
                        <div className={`w-8 h-8 rounded-lg ${ft.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                          <ft.icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-medium">{ft.label}</span>
                        <Plus className="w-3 h-3 text-muted-foreground/40 mr-auto" />
                      </motion.button>
                    ))}
                  </motion.div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Center: Canvas */}
          <div className="lg:col-span-5">
            <Card className="min-h-[400px]">
              <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-bold flex items-center gap-2">
                  <FormInput className="w-3.5 h-3.5 text-violet-500" />
                  صفحه‌آرایی فرم
                  <Badge variant="secondary" className="text-[9px]">{fields.length} فیلد</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <ScrollArea className="max-h-[calc(100vh-16rem)]" ref={canvasRef}>
                  <div className="space-y-2 min-h-[300px] rounded-xl border-2 border-dashed border-border/50 p-3 transition-colors">
                    {fields.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                        <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center mb-3">
                          <FormInput className="w-7 h-7 text-violet-400" />
                        </div>
                        <p className="text-sm font-medium">فرم خالی است</p>
                        <p className="text-xs mt-1">از ابزارهای سمت راست فیلدها را اضافه کنید</p>
                        <Button variant="outline" size="sm" className="text-xs gap-1.5 mt-3" onClick={() => setShowTemplates(true)}>
                          <LayoutGrid className="w-3.5 h-3.5" />
                          یا از قالب آماده استفاده کنید
                        </Button>
                      </div>
                    ) : (
                      <AnimatePresence>
                        {fields.map((field, index) => {
                          const FieldIcon = getFieldIcon(field.type);
                          const isSelected = selectedFieldId === field.id;
                          const isDragging = dragItemIndex === index;
                          const isDragOver = dragOverIndex === index;
                          return (
                            <motion.div
                              key={field.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.2 }}
                              draggable
                              onDragStart={() => handleDragStart(index)}
                              onDragOver={(e) => handleDragOver(e, index)}
                              onDrop={() => handleDrop(index)}
                              onDragEnd={handleDragEnd}
                              onClick={() => setSelectedFieldId(field.id)}
                              className={`relative flex items-start gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer group ${
                                isSelected
                                  ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-900/10 shadow-sm'
                                  : isDragOver
                                    ? 'border-violet-300 dark:border-violet-700 bg-violet-50/30 dark:bg-violet-900/5'
                                    : 'border-transparent hover:border-border hover:bg-muted/30'
                              } ${isDragging ? 'opacity-50' : ''}`}
                            >
                              {/* Drag handle */}
                              <div className="shrink-0 pt-1 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                                <GripVertical className="w-4 h-4" />
                              </div>

                              {/* Field content */}
                              <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className={`w-6 h-6 rounded-md ${FIELD_TYPES.find(f => f.type === field.type)?.color || 'bg-muted'} flex items-center justify-center shrink-0`}>
                                    <FieldIcon className="w-3 h-3" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="text-xs font-medium truncate block">
                                      {field.label || FIELD_TYPES.find(f => f.type === field.type)?.label || 'بدون عنوان'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    {field.required && (
                                      <Badge className="bg-rose-100 text-rose-600 text-[9px] px-1.5 py-0 border-0">الزامی</Badge>
                                    )}
                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                                      {FIELD_TYPES.find(f => f.type === field.type)?.label}
                                    </Badge>
                                  </div>
                                </div>
                                {/* Mini preview */}
                                <div className="opacity-60">
                                  {renderFieldPreview(field)}
                                </div>
                              </div>

                              {/* Actions (show on hover) */}
                              <div className="absolute -left-1 top-1/2 -translate-y-1/2 bg-card border shadow-sm rounded-lg p-0.5 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button
                                  onClick={(e) => { e.stopPropagation(); moveField(field.id, 'up'); }}
                                  className="p-1 rounded hover:bg-muted transition-colors"
                                  title="بالا"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); moveField(field.id, 'down'); }}
                                  className="p-1 rounded hover:bg-muted transition-colors"
                                  title="پایین"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); duplicateField(field.id); }}
                                  className="p-1 rounded hover:bg-muted transition-colors"
                                  title="کپی"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); deleteField(field.id); }}
                                  className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                                  title="حذف"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Index badge */}
                              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-card border text-[9px] font-bold flex items-center justify-center text-muted-foreground">
                                {index + 1}
                              </span>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    )}

                    {/* Drop zone indicator */}
                    {dragOverIndex !== null && dragItemIndex !== null && dragOverIndex === fields.length && (
                      <div className="border-2 border-dashed border-violet-300 dark:border-violet-700 rounded-xl h-16 flex items-center justify-center">
                        <Plus className="w-5 h-5 text-violet-400" />
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar: Properties */}
          <div className="lg:col-span-4">
            <Card className="sticky top-4">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs font-bold flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5 text-violet-500" />
                  ویژگی‌ها
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                {selectedField ? (
                  <ScrollArea className="max-h-[calc(100vh-16rem)]">
                    <motion.div
                      key={selectedField.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      {/* Field type badge */}
                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50">
                        {(() => {
                          const Icon = getFieldIcon(selectedField.type);
                          const ft = FIELD_TYPES.find(f => f.type === selectedField.type);
                          return (
                            <>
                              <div className={`w-8 h-8 rounded-lg ${ft?.color || 'bg-muted'} flex items-center justify-center`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-xs font-bold">{ft?.label || selectedField.type}</p>
                                <p className="text-[10px] text-muted-foreground">شناسه: {selectedField.id.slice(0, 10)}</p>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      {/* Label */}
                      {selectedField.type !== 'separator' && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium">برچسب</label>
                          <Input
                            value={selectedField.label}
                            onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                            className="h-9 text-xs"
                            placeholder="برچسب فیلد"
                          />
                        </div>
                      )}

                      {/* Placeholder */}
                      {['text', 'textarea', 'number', 'select'].includes(selectedField.type) && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium">متن راهنما</label>
                          <Input
                            value={selectedField.placeholder}
                            onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                            className="h-9 text-xs"
                            placeholder="متن داخل فیلد"
                          />
                        </div>
                      )}

                      {/* Required toggle */}
                      {selectedField.type !== 'separator' && selectedField.type !== 'heading' && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div>
                            <label className="text-xs font-medium">الزامی</label>
                            <p className="text-[10px] text-muted-foreground">کاربر باید این فیلد را پر کند</p>
                          </div>
                          <Switch
                            checked={selectedField.required}
                            onCheckedChange={(checked) => updateField(selectedField.id, { required: checked })}
                          />
                        </div>
                      )}

                      {/* Help text */}
                      {selectedField.type !== 'separator' && selectedField.type !== 'heading' && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium">متن کمکی</label>
                          <Textarea
                            value={selectedField.helpText}
                            onChange={(e) => updateField(selectedField.id, { helpText: e.target.value })}
                            className="text-xs min-h-[60px] resize-none"
                            placeholder="توضیحات اضافی زیر فیلد..."
                          />
                        </div>
                      )}

                      <Separator />

                      {/* Quick actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs gap-1.5"
                          onClick={() => duplicateField(selectedField.id)}
                        >
                          <Copy className="w-3 h-3" />
                          کپی فیلد
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                          onClick={() => deleteField(selectedField.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                          حذف
                        </Button>
                      </div>
                    </motion.div>
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
                      <Settings className="w-7 h-7 opacity-40" />
                    </div>
                    <p className="text-xs font-medium">فیلدی انتخاب نشده</p>
                    <p className="text-[10px] mt-1">روی فیلدی کلیک کنید تا ویژگی‌های آن ویرایش شود</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </motion.div>
  );
}
