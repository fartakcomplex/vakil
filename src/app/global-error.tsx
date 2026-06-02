'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="fa" dir="rtl">
      <body>
        <div dir="rtl" style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          padding: '1rem',
          backgroundColor: '#f9fafb',
        }}>
          <div style={{ textAlign: 'center', maxWidth: '28rem' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: '#fef2f2', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 1.5rem',
            }}>
              <span style={{ fontSize: '2.5rem' }}>&#x26A0;</span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#111827' }}>
              خطایی رخ داده است
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              متأسفانه در بارگذاری صفحه مشکلی پیش آمده.
            </p>
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1.5rem',
              textAlign: 'right', wordBreak: 'break-all',
            }}>
              <p style={{ fontSize: '0.75rem', color: '#b91c1c', fontFamily: 'monospace' }}>
                {error?.message || 'خطای ناشناخته'}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#059669', color: 'white', padding: '0.625rem 1.5rem',
                borderRadius: '0.5rem', border: 'none', cursor: 'pointer',
                fontWeight: '500', fontSize: '0.875rem',
              }}
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
