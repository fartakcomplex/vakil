'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import { toPersianNumber, getInitials, formatDate } from '@/lib/utils-helpers';
import {
  Trophy, Star, Target, Flame, Zap, Crown, Award, Medal,
  BookOpen, MessageSquare, FileCheck, Users, Clock, TrendingUp,
  CheckCircle2, Circle, Lock, Sparkles, Brain, Briefcase,
  Shield, Gem, Heart, Rocket, Lightbulb, GraduationCap, Scale,
} from 'lucide-react';

// ---- Badge Data ----
interface BadgeItem {
  id: string;
  icon: React.ElementType;
  name: string;
  description: string;
  earned: boolean;
  earnedDate: string | null;
  gradient: string;
  iconBg: string;
}

const BADGES_DATA: BadgeItem[] = [
  { id: 'first-login', icon: Rocket, name: 'شروع‌کننده', description: 'اولین ورود به سامانه', earned: true, earnedDate: '1403/01/15', gradient: 'from-emerald-400 to-teal-500', iconBg: 'bg-emerald-100 dark:bg-emerald-900/40' },
  { id: 'first-case', icon: Briefcase, name: 'اولین پرونده', description: 'ثبت اولین پرونده حقوقی', earned: true, earnedDate: '1403/01/20', gradient: 'from-blue-400 to-indigo-500', iconBg: 'bg-blue-100 dark:bg-blue-900/40' },
  { id: 'ten-cases', icon: FileCheck, name: 'حرفه‌ای', description: 'ثبت ۱۰ پرونده', earned: true, earnedDate: '1403/03/10', gradient: 'from-purple-400 to-violet-500', iconBg: 'bg-purple-100 dark:bg-purple-900/40' },
  { id: 'hundred-ai', icon: Brain, name: 'هوش‌مند', description: '۱۰۰ درخواست هوش مصنوعی', earned: true, earnedDate: '1403/04/05', gradient: 'from-pink-400 to-rose-500', iconBg: 'bg-pink-100 dark:bg-pink-900/40' },
  { id: 'streak-7', icon: Flame, name: 'هفت‌روز فعال', description: '۷ روز متوالی ورود', earned: true, earnedDate: '1403/02/28', gradient: 'from-orange-400 to-red-500', iconBg: 'bg-orange-100 dark:bg-orange-900/40' },
  { id: 'streak-30', icon: Zap, name: 'ثابت‌قدم', description: '۳۰ روز متوالی ورود', earned: false, earnedDate: null, gradient: 'from-amber-400 to-yellow-500', iconBg: 'bg-amber-100 dark:bg-amber-900/40' },
  { id: 'social-butterfly', icon: MessageSquare, name: 'مچ‌گیر', description: '۵۰ دیدگاه در انجمن', earned: true, earnedDate: '1403/05/12', gradient: 'from-cyan-400 to-sky-500', iconBg: 'bg-cyan-100 dark:bg-cyan-900/40' },
  { id: 'knowledge-seeker', icon: BookOpen, name: 'دانش‌جو', description: 'تکمیل ۵ دوره آموزشی', earned: false, earnedDate: null, gradient: 'from-teal-400 to-emerald-500', iconBg: 'bg-teal-100 dark:bg-teal-900/40' },
  { id: 'top-lawyer', icon: Crown, name: 'وکیل برتر', description: 'رتبه اول جدول رده‌بندی', earned: false, earnedDate: null, gradient: 'from-yellow-400 to-amber-500', iconBg: 'bg-yellow-100 dark:bg-yellow-900/40' },
  { id: 'team-player', icon: Users, name: 'همیار تیم', description: 'همکاری در ۲۰ پرونده تیمی', earned: true, earnedDate: '1403/06/01', gradient: 'from-violet-400 to-purple-500', iconBg: 'bg-violet-100 dark:bg-violet-900/40' },
  { id: 'night-owl', icon: Clock, name: 'شب‌بیدار', description: 'فعالیت بعد از ساعت ۱۲ شب', earned: true, earnedDate: '1403/03/20', gradient: 'from-slate-400 to-gray-600', iconBg: 'bg-slate-100 dark:bg-slate-900/40' },
  { id: 'genius', icon: Gem, name: 'نابغه حقوقی', description: 'حل ۱۰۰ چالش روزانه', earned: false, earnedDate: null, gradient: 'from-rose-400 to-pink-600', iconBg: 'bg-rose-100 dark:bg-rose-900/40' },
  { id: 'mentor', icon: GraduationCap, name: 'منتور', description: 'راهنمایی ۱۰ کارآموز جدید', earned: false, earnedDate: null, gradient: 'from-indigo-400 to-blue-600', iconBg: 'bg-indigo-100 dark:bg-indigo-900/40' },
  { id: 'perfect-score', icon: Star, name: 'امتیاز کامل', description: 'کسب امتیاز کامل در یک آزمون', earned: true, earnedDate: '1403/04/15', gradient: 'from-emerald-400 to-green-600', iconBg: 'bg-emerald-100 dark:bg-emerald-900/40' },
];

// ---- Leaderboard Data ----
interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string | null;
  points: number;
  casesCompleted: number;
  badgesCount: number;
  gradient: string;
}

const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'دکتر احمدی', avatar: null, points: 12450, casesCompleted: 156, badgesCount: 12, gradient: 'from-yellow-400 to-amber-500' },
  { rank: 2, name: 'وکیل رضایی', avatar: null, points: 11200, casesCompleted: 142, badgesCount: 11, gradient: 'from-gray-300 to-slate-400' },
  { rank: 3, name: 'وکیل محمدی', avatar: null, points: 10800, casesCompleted: 138, badgesCount: 10, gradient: 'from-orange-300 to-amber-400' },
  { rank: 4, name: 'وکیل حسینی', avatar: null, points: 9500, casesCompleted: 120, badgesCount: 9, gradient: '' },
  { rank: 5, name: 'دکتر کریمی', avatar: null, points: 8900, casesCompleted: 112, badgesCount: 8, gradient: '' },
  { rank: 6, name: 'وکیل صادقی', avatar: null, points: 8200, casesCompleted: 105, badgesCount: 8, gradient: '' },
  { rank: 7, name: 'وکیل نوری', avatar: null, points: 7800, casesCompleted: 98, badgesCount: 7, gradient: '' },
  { rank: 8, name: 'کارآموز عباسی', avatar: null, points: 6500, casesCompleted: 82, badgesCount: 6, gradient: '' },
  { rank: 9, name: 'وکیل تقوی', avatar: null, points: 6100, casesCompleted: 78, badgesCount: 6, gradient: '' },
  { rank: 10, name: 'وکیل مرادی', avatar: null, points: 5800, casesCompleted: 72, badgesCount: 5, gradient: '' },
];

// ---- Daily Challenges ----
interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  points: number;
  completed: boolean;
  icon: React.ElementType;
}

const DAILY_CHALLENGES: DailyChallenge[] = [
  { id: 'dc1', title: 'بررسی یک پرونده جدید', description: 'جزئیات حداقل یک پرونده جدید را بررسی کنید', points: 20, completed: true, icon: Briefcase },
  { id: 'dc2', title: 'ارسال یک درخواست هوش مصنوعی', description: 'از دستیار هوش مصنوعی برای تحلیل یک سند استفاده کنید', points: 30, completed: false, icon: Brain },
  { id: 'dc3', title: 'به‌روزرسانی یادداشت پرونده', description: 'یک یادداشت جدید به پرونده فعال اضافه کنید', points: 15, completed: false, icon: FileCheck },
];

// ---- Player Stats (mock) ----
const PLAYER_STATS = {
  totalPoints: 7350,
  level: 12,
  currentLevelPoints: 7350,
  nextLevelPoints: 8000,
  rank: 4,
  streakDays: 18,
  badgesEarned: 8,
  totalBadges: 14,
  dailyCompleted: 1,
  dailyTotal: 3,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function GamificationPage() {
  const [dailyChallenges, setDailyChallenges] = useState(DAILY_CHALLENGES);

  const earnedBadges = BADGES_DATA.filter((b) => b.earned);
  const lockedBadges = BADGES_DATA.filter((b) => !b.earned);
  const progressPercent = Math.round((PLAYER_STATS.currentLevelPoints / PLAYER_STATS.nextLevelPoints) * 100);
  const pointsToNext = PLAYER_STATS.nextLevelPoints - PLAYER_STATS.currentLevelPoints;

  const toggleChallenge = (id: string) => {
    setDailyChallenges((prev) =>
      prev.map((ch) => ch.id === id ? { ...ch, completed: !ch.completed } : ch)
    );
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
          <Trophy className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold">سیستم بازی‌وارسازی</h1>
          <p className="text-sm text-muted-foreground">امتیازات، نشان‌ها و چالش‌های روزانه شما</p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'امتیاز کل', value: toPersianNumber(PLAYER_STATS.totalPoints), icon: Star, gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-900/10' },
          { label: 'رتبه شما', value: toPersianNumber(PLAYER_STATS.rank), icon: Trophy, gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
          { label: 'روز فعال متوالی', value: toPersianNumber(PLAYER_STATS.streakDays), icon: Flame, gradient: 'from-red-500 to-rose-500', bg: 'bg-red-50 dark:bg-red-900/10' },
          { label: 'نشان‌های کسب‌شده', value: `${toPersianNumber(PLAYER_STATS.badgesEarned)} از ${toPersianNumber(PLAYER_STATS.totalBadges)}`, icon: Award, gradient: 'from-purple-500 to-violet-500', bg: 'bg-purple-50 dark:bg-purple-900/10' },
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className={`overflow-hidden border-0 shadow-sm ${stat.bg}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Level & Progress Section */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden border-0 shadow-sm">
          <div className="bg-gradient-to-l from-emerald-600 via-teal-600 to-cyan-600 px-5 py-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                  <span className="text-2xl font-bold text-white">{toPersianNumber(PLAYER_STATS.level)}</span>
                </div>
                <div className="text-white">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    سطح {toPersianNumber(PLAYER_STATS.level)}
                    <Sparkles className="w-4 h-4" />
                  </h2>
                  <p className="text-sm text-white/80 mt-0.5">
                    {toPersianNumber(PLAYER_STATS.totalPoints)} امتیاز · تا سطح بعدی {toPersianNumber(pointsToNext)} امتیاز
                  </p>
                </div>
              </div>
              <div className="w-full sm:w-64">
                <div className="flex justify-between text-xs text-white/80 mb-1.5">
                  <span>سطح {toPersianNumber(PLAYER_STATS.level)}</span>
                  <span>سطح {toPersianNumber(PLAYER_STATS.level + 1)}</span>
                </div>
                <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-white rounded-full shadow-inner"
                  />
                </div>
                <p className="text-[11px] text-white/70 mt-1 text-center">{toPersianNumber(progressPercent)}٪</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Badges Grid */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-4">
          <Medal className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold">نشان‌ها و دستاوردها</h2>
          <Badge variant="secondary" className="text-[11px]">{toPersianNumber(earnedBadges.length)} کسب‌شده</Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
          <AnimatePresence>
            {BADGES_DATA.map((badge) => {
              const Icon = badge.icon;
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="relative"
                >
                  <Card className={`overflow-hidden border-0 shadow-sm ${badge.earned ? '' : 'opacity-50 grayscale'}`}>
                    <CardContent className="p-3 flex flex-col items-center text-center gap-2">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${badge.earned ? badge.gradient : 'from-gray-300 to-gray-400'} flex items-center justify-center shadow-md ${badge.earned ? 'text-white' : 'text-gray-500'}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-medium leading-relaxed">{badge.name}</p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">{badge.description}</p>
                      {badge.earned ? (
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                          <CheckCircle2 className="w-2.5 h-2.5 ml-0.5" />
                          {badge.earnedDate}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                          <Lock className="w-2.5 h-2.5 ml-0.5" />
                          قفل
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Daily Challenges + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Challenges */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="pb-3">
              <div className="bg-gradient-to-l from-orange-500 to-amber-500 -mx-6 -mt-6 px-6 pt-5 pb-4 rounded-t-xl">
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <Target className="w-5 h-5" />
                  چالش‌های روزانه
                </CardTitle>
                <p className="text-orange-100 text-xs mt-1">وظایف روزانه برای کسب امتیاز بیشتر</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              {dailyChallenges.map((challenge) => {
                const Icon = challenge.icon;
                return (
                  <div
                    key={challenge.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                      challenge.completed
                        ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10'
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => toggleChallenge(challenge.id)}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${challenge.completed ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                      {challenge.completed ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${challenge.completed ? 'line-through text-muted-foreground' : ''}`}>{challenge.title}</p>
                      <p className="text-[11px] text-muted-foreground">{challenge.description}</p>
                    </div>
                    <Badge className={`text-[11px] px-2 py-0 shrink-0 ${challenge.completed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-0'}`}>
                      +{toPersianNumber(challenge.points)}
                    </Badge>
                  </div>
                );
              })}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span>پیشرفت روزانه</span>
                  <span>{toPersianNumber(dailyChallenges.filter(c => c.completed).length)} از {toPersianNumber(dailyChallenges.length)}</span>
                </div>
                <Progress value={(dailyChallenges.filter(c => c.completed).length / dailyChallenges.length) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Leaderboard */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="pb-3">
              <div className="bg-gradient-to-l from-violet-500 to-purple-600 -mx-6 -mt-6 px-6 pt-5 pb-4 rounded-t-xl">
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <Crown className="w-5 h-5" />
                  جدول رده‌بندی
                </CardTitle>
                <p className="text-violet-100 text-xs mt-1">۱۰ وکیل برتر بر اساس امتیاز</p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[480px]">
                <div className="divide-y divide-border/50">
                  {LEADERBOARD.map((entry) => (
                    <div
                      key={entry.rank}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30 ${entry.rank <= 3 ? 'bg-muted/20' : ''}`}
                    >
                      {/* Rank */}
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm">
                        {entry.rank <= 3 ? (
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${entry.gradient} flex items-center justify-center text-white`}>
                            {toPersianNumber(entry.rank)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">{toPersianNumber(entry.rank)}</span>
                        )}
                      </div>

                      {/* Avatar */}
                      <Avatar className="w-9 h-9 shrink-0">
                        <AvatarFallback className="text-xs bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
                          {getInitials(entry.name, entry.name)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{entry.name}</p>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span>{toPersianNumber(entry.casesCompleted)} پرونده</span>
                          <span>·</span>
                          <span>{toPersianNumber(entry.badgesCount)} نشان</span>
                        </div>
                      </div>

                      {/* Points */}
                      <div className="text-left shrink-0">
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{toPersianNumber(entry.points)}</p>
                        <p className="text-[10px] text-muted-foreground">امتیاز</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
