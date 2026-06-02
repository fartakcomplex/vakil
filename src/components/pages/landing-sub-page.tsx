'use client';
import { motion } from 'framer-motion';
import { ArrowRight, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubPageProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onBack: () => void;
}

export default function LandingSubPage({ title, subtitle, children, onBack }: SubPageProps) {
  return (
    <div dir="rtl" className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-950 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-white/60 hover:text-white hover:bg-white/10 mb-6"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            بازگشت به صفحه اصلی
          </Button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white" style={{ fontFamily: "'Lalezar', sans-serif" }}>
              {title}
            </h1>
          </div>
          <p className="text-white/60 text-sm sm:text-base max-w-2xl">{subtitle}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-p:leading-8 prose-p:text-muted-foreground prose-li:text-muted-foreground"
        >
          {children}
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center">
        <p className="text-xs text-muted-foreground">© ۱۴۰۴ لِگال‌هاب - پلتفرم مدیریت حقوقی</p>
      </footer>
    </div>
  );
}
