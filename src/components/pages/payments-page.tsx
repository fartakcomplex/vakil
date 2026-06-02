'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDate, getStatusColor, getStatusName, toPersianNumber } from '@/lib/utils-helpers';
import {
  CreditCard,
  Building2,
  QrCode,
  Receipt,
  Download,
  Check,
  X,
  Tag,
  Wallet,
  Clock,
  AlertTriangle,
  ArrowDownLeft,
  Banknote,
  Percent,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  Copy,
  ArrowLeftRight,
  History,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { InvoiceStatus } from '@/lib/types';

type PaymentMethodType = 'card' | 'bank' | 'qr';

// ============ COMPONENT ============
export default function PaymentsPage() {
  const { toast } = useToast();
  const { invoices, payments } = useAppStore();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('card');
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<'success' | 'failure' | null>(null);

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Unpaid invoices
  const unpaidInvoices = useMemo(() => {
    return invoices.filter((inv) => inv.status === 'PENDING' || inv.status === 'OVERDUE');
  }, [invoices]);

  const paidInvoices = useMemo(() => {
    return invoices.filter((inv) => inv.status === 'PAID' || inv.status === 'PARTIAL');
  }, [invoices]);

  // Selection logic
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === unpaidInvoices.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(unpaidInvoices.map((i) => i.id)));
    }
  };

  const selectedTotal = useMemo(() => {
    return unpaidInvoices.filter((i) => selectedIds.has(i.id)).reduce((sum, i) => sum + i.total, 0);
  }, [unpaidInvoices, selectedIds]);

  const selectedCount = selectedIds.size;

  const applyDiscount = () => {
    if (discountCode.trim()) {
      setDiscountApplied(true);
      toast({ title: 'کد تخفیف اعمال شد', description: '۱۰٪ تخفیف برای فاکتورهای انتخاب‌شده' });
    }
  };

  const finalAmount = discountApplied ? selectedTotal * 0.9 : selectedTotal;

  const handlePay = async () => {
    if (selectedCount === 0) {
      toast({ title: 'خطا', description: 'لطفاً حداقل یک فاکتور انتخاب کنید', variant: 'destructive' });
      return;
    }
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 2500));
    setIsProcessing(false);
    setPaymentResult('success');
    toast({ title: 'پرداخت موفق!', description: `${toPersianNumber(selectedCount)} فاکتور با موفقیت پرداخت شد` });
  };

  const formatCardNumber = (val: string) => {
    const nums = val.replace(/\D/g, '').slice(0, 16);
    return nums.replace(/(.{4})/g, '$1-').replace(/-$/, '');
  };

  const invoiceStatusBadge = (status: InvoiceStatus) => {
    const label = getStatusName(status);
    return <Badge className={`text-xs ${getStatusColor(status)}`}>{label}</Badge>;
  };

  // ============ PAYMENT RESULT OVERLAY ============
  if (paymentResult) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[60vh]"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="text-center max-w-sm"
        >
          {paymentResult === 'success' ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10, delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </motion.div>
              <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">پرداخت موفق!</h2>
              <p className="text-muted-foreground text-sm mb-4">
                {toPersianNumber(selectedCount)} فاکتور به مبلغ {formatCurrency(finalAmount)} با موفقیت پرداخت شد
              </p>
              <div className="bg-muted rounded-xl p-3 mb-4 text-sm space-y-1">
                <p className="text-muted-foreground">شماره تراکنش: <span className="font-mono font-medium">TXN-{Date.now().toString().slice(-8)}</span></p>
                <p className="text-muted-foreground">تاریخ: {formatDate(new Date())}</p>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => { setPaymentResult(null); setSelectedIds(new Set()); setDiscountApplied(false); setDiscountCode(''); }}>
                  <Check className="w-4 h-4 ml-1" />
                  بازگشت
                </Button>
                <Button variant="outline" onClick={() => toast({ title: 'دانلود رسید', description: 'رسید در حال آماده‌سازی...' })}>
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">پرداخت ناموفق</h2>
              <p className="text-muted-foreground text-sm mb-4">متأسفانه پرداخت انجام نشد. لطفاً دوباره تلاش کنید.</p>
              <Button className="w-full" variant="destructive" onClick={() => setPaymentResult(null)}>
                تلاش مجدد
              </Button>
            </>
          )}
        </motion.div>
      </motion.div>
    );
  }

  // ============ MAIN LAYOUT ============
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold">پرداخت آنلاین</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>پرداخت امن با رمزنگاری SSL</span>
        </div>
      </div>

      <Tabs defaultValue="pay" className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="pay" className="text-sm">
            <Wallet className="w-4 h-4 ml-1" />
            پرداخت فاکتور
          </TabsTrigger>
          <TabsTrigger value="history" className="text-sm">
            <History className="w-4 h-4 ml-1" />
            تاریخچه پرداخت
          </TabsTrigger>
        </TabsList>

        {/* ============ PAY TAB ============ */}
        <TabsContent value="pay" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Invoice Selection */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">فاکتورهای پرداخت‌نشده</CardTitle>
                    <Button variant="ghost" size="sm" onClick={toggleSelectAll} className="text-xs">
                      {selectedIds.size === unpaidInvoices.length ? 'لغو انتخاب همه' : 'انتخاب همه'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {unpaidInvoices.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground text-sm">فاکتور پرداخت‌نشده‌ای وجود ندارد</div>
                    ) : (
                      unpaidInvoices.map((inv, idx) => (
                        <motion.div
                          key={inv.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors cursor-pointer ${
                            selectedIds.has(inv.id) ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''
                          }`}
                          onClick={() => toggleSelect(inv.id)}
                        >
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                            selectedIds.has(inv.id) ? 'bg-emerald-600 border-emerald-600' : 'border-muted-foreground/30'
                          }`}>
                            {selectedIds.has(inv.id) && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-medium truncate">{inv.invoiceNumber}</span>
                              {invoiceStatusBadge(inv.status)}
                              {inv.status === 'OVERDUE' && (
                                <AlertTriangle className="w-3 h-3 text-red-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>پرونده: {inv.case?.title || '—'}</span>
                              <Separator orientation="vertical" className="h-3" />
                              <span>مهلت: {formatDate(inv.dueDate)}</span>
                            </div>
                          </div>
                          <div className="text-left shrink-0">
                            <p className="text-sm font-bold">{formatCurrency(inv.total)}</p>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method Selection */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">روش پرداخت</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { key: 'card' as const, icon: CreditCard, label: 'کارت بانکی', desc: 'ویزا / مسترکارت' },
                      { key: 'bank' as const, icon: Building2, label: 'انتقال بانکی', desc: 'حواله مستقیم' },
                      { key: 'qr' as const, icon: QrCode, label: 'پرداخت QR', desc: 'اسکن کد' },
                    ].map((method) => (
                      <motion.button
                        key={method.key}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setPaymentMethod(method.key)}
                        className={`p-4 rounded-xl border-2 text-center transition-colors ${
                          paymentMethod === method.key
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                            : 'border-border hover:border-muted-foreground/30'
                        }`}
                      >
                        <method.icon className={`w-8 h-8 mx-auto mb-2 ${paymentMethod === method.key ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                        <p className="text-sm font-medium">{method.label}</p>
                        <p className="text-xs text-muted-foreground">{method.desc}</p>
                      </motion.button>
                    ))}
                  </div>

                  {/* Card Form */}
                  <AnimatePresence mode="wait">
                    {paymentMethod === 'card' && (
                      <motion.div
                        key="card-form"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 overflow-hidden"
                      >
                        <Separator />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="sm:col-span-2 space-y-1.5">
                            <label className="text-xs text-muted-foreground">شماره کارت</label>
                            <Input
                              value={cardNumber}
                              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                              placeholder="XXXX-XXXX-XXXX-XXXX"
                              className="text-sm font-mono"
                              dir="ltr"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs text-muted-foreground">تاریخ انقضا</label>
                            <Input
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))}
                              placeholder="MM/YY"
                              className="text-sm font-mono"
                              dir="ltr"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs text-muted-foreground">CVV</label>
                            <Input
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                              placeholder="••••"
                              type="password"
                              className="text-sm font-mono"
                              dir="ltr"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Bank Transfer Info */}
                  <AnimatePresence>
                    {paymentMethod === 'bank' && (
                      <motion.div
                        key="bank-info"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 overflow-hidden"
                      >
                        <Separator />
                        <div className="bg-muted rounded-xl p-4 space-y-2">
                          <p className="text-sm font-medium">اطلاعات حساب بانکی</p>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">بانک</span><span>بانک ملت</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">شماره حساب</span><span className="font-mono">6104-XXXX-XXXX-XXXX</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">شماره شبا</span><span className="font-mono text-xs">IR-XXXX-XXXX-XXXX-XXXX-XXXX-XX</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">نام صاحب حساب</span><span>شرکت لِگال‌هاب</span></div>
                          </div>
                          <Button variant="outline" size="sm" className="text-xs" onClick={() => toast({ title: 'کپی شد' })}>
                            <Copy className="w-3 h-3 ml-1" />
                            کپی اطلاعات
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* QR Code */}
                  <AnimatePresence>
                    {paymentMethod === 'qr' && (
                      <motion.div
                        key="qr-code"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <Separator />
                        <div className="flex flex-col items-center py-4">
                          <div className="w-40 h-40 bg-muted rounded-xl border-2 border-dashed border-muted-foreground/20 flex items-center justify-center mb-3">
                            <QrCode className="w-20 h-20 text-muted-foreground/40" />
                          </div>
                          <p className="text-sm text-muted-foreground">کد QR را با اپلیکیشن بانکی خود اسکن کنید</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </div>

            {/* Payment Summary Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">خلاصه پرداخت</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">تعداد فاکتور</span>
                      <span className="font-medium">{toPersianNumber(selectedCount)} فاکتور</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">جمع کل</span>
                      <span className="font-medium">{formatCurrency(selectedTotal)}</span>
                    </div>
                    {discountApplied && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex justify-between text-sm text-emerald-600"
                      >
                        <span className="flex items-center gap-1"><Percent className="w-3 h-3" /> تخفیف (۱۰٪)</span>
                        <span>-{formatCurrency(selectedTotal * 0.1)}</span>
                      </motion.div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-base font-bold">
                      <span>مبلغ نهایی</span>
                      <span className="text-emerald-600">{formatCurrency(finalAmount)}</span>
                    </div>
                  </div>

                  {/* Discount Code */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">کد تخفیف</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          value={discountCode}
                          onChange={(e) => { setDiscountCode(e.target.value); setDiscountApplied(false); }}
                          placeholder="کد تخفیف خود را وارد کنید"
                          className="pr-9 text-sm"
                          disabled={discountApplied}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={applyDiscount}
                        disabled={discountApplied || !discountCode.trim()}
                      >
                        {discountApplied ? <Check className="w-4 h-4" /> : 'اعمال'}
                      </Button>
                    </div>
                  </div>

                  {/* Pay Button */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handlePay}
                      disabled={selectedCount === 0 || isProcessing}
                      className="w-full h-12 bg-gradient-to-l from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white text-base rounded-xl disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                          در حال پردازش...
                        </>
                      ) : (
                        <>
                          <Banknote className="w-5 h-5 ml-2" />
                          پرداخت {formatCurrency(finalAmount)}
                        </>
                      )}
                    </Button>
                  </motion.div>

                  <p className="text-[10px] text-muted-foreground text-center">
                    با پرداخت، شرایط و قوانین لِگال‌هاب را می‌پذیرید
                  </p>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <Clock className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                      <p className="text-lg font-bold">{toPersianNumber(unpaidInvoices.filter(i => i.status === 'OVERDUE').length)}</p>
                      <p className="text-[10px] text-muted-foreground">سررسید گذشته</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <Receipt className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                      <p className="text-lg font-bold">{toPersianNumber(unpaidInvoices.filter(i => i.status === 'PENDING').length)}</p>
                      <p className="text-[10px] text-muted-foreground">در انتظار پرداخت</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ============ HISTORY TAB ============ */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">تاریخچه پرداخت‌ها</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {payments.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">هنوز پرداختی ثبت نشده است</div>
                ) : (
                  payments.map((pay, idx) => (
                    <motion.div
                      key={pay.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        pay.status === 'COMPLETED' ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-red-100 dark:bg-red-900/40'
                      }`}>
                        {pay.status === 'COMPLETED' ? (
                          <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {pay.description || `پرداخت فاکتور ${pay.invoiceId?.slice(0, 8) || ''}`}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatDate(pay.createdAt)}</span>
                          <Separator orientation="vertical" className="h-3" />
                          <span>{pay.transactionId || '—'}</span>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold">{formatCurrency(pay.amount)}</p>
                        <Badge className={`text-[10px] ${getStatusColor(pay.status)}`}>{getStatusName(pay.status)}</Badge>
                      </div>
                      {pay.status === 'COMPLETED' && (
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-emerald-600 shrink-0" onClick={() => toast({ title: 'دانلود رسید', description: 'رسید در حال آماده‌سازی...' })}>
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
