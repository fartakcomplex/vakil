'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/persian';
import { toPersianNumber } from '@/lib/utils-helpers';
import { BookOpen, Plus, GraduationCap, Clock, Users, Play } from 'lucide-react';

export default function CoursesPage() {
  const { courses } = useAppStore();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'enrolled'>('all');

  const filtered = useMemo(() => {
    let list = courses;
    if (tab === 'enrolled') list = list.filter((c) => c.enrollmentStatus === 'ACTIVE' || c.enrollmentStatus === 'COMPLETED');
    if (search) list = list.filter((c) => c.title.includes(search));
    return list;
  }, [courses, search, tab]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold">{t('courses.title')}</h1>
        <div className="flex gap-2">
          <Button variant={tab === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setTab('all')}>همه دوره‌ها</Button>
          <Button variant={tab === 'enrolled' ? 'default' : 'outline'} size="sm" onClick={() => setTab('enrolled')}>{t('courses.myCourses')}</Button>
        </div>
      </div>
      <div className="relative max-w-md"><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجوی دوره..." className="pr-9 text-sm" /></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <motion.div key={c.id} whileHover={{ y: -2 }}>
            <Card className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-32 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center relative">
                <BookOpen className="w-12 h-12 text-white/30" />
                <Badge className="absolute top-2 right-2 text-xs bg-white/20 text-white hover:bg-white/20">{t(`courses.${c.type === 'WEBINAR' ? 'webinar' : 'title'}`)}</Badge>
              </div>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-sm truncate">{c.title}</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{toPersianNumber(c.duration)} دقیقه</span>
                  {c.instructor && <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" />{c.instructor.firstName} {c.instructor.lastName}</span>}
                </div>
                {c.enrollmentStatus && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs"><span>پیشرفت</span><span>{toPersianNumber(c.enrollments?.[0]?.progress || 0)}٪</span></div>
                    <Progress value={c.enrollments?.[0]?.progress || 0} className="h-1.5" />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">{c.enrollmentStatus ? t(`courseStatus.${c.enrollmentStatus === 'ACTIVE' ? 'PUBLISHED' : c.enrollmentStatus}`) : t(`courseStatus.${c.status}`)}</Badge>
                  <Button size="sm" variant="outline" className="text-xs">{c.enrollmentStatus ? 'ادامه' : t('courses.enroll')}</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {filtered.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground text-sm">{t('common.noData')}</div>}
      </div>
    </motion.div>
  );
}
