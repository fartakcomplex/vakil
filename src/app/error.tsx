'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Log the error for debugging
    console.error('Client-side error:', error);
    setErrorMsg(error.message || String(error));
  }, [error]);

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">خطایی رخ داده است</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          متأسفانه در بارگذاری صفحه مشکلی پیش آمده. لطفاً دوباره تلاش کنید.
        </p>
        {errorMsg && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-right">
            <p className="text-xs text-red-700 dark:text-red-300 font-mono break-all">{errorMsg}</p>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            تلاش مجدد
          </Button>
          <Button variant="outline" onClick={() => { window.location.href = '/'; }} className="gap-2">
            <Home className="w-4 h-4" />
            بازگشت به صفحه اصلی
          </Button>
        </div>
      </div>
    </div>
  );
}
