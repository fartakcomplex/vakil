'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/persian';
import { getInitials, getFullName } from '@/lib/utils-helpers';
import {
  Scale, LayoutDashboard, Briefcase, CalendarDays, FileText, ClipboardList,
  MessageSquare, Bell, Users, BookOpen, Rss, FolderOpen,
  TrendingUp, Target, Settings, Bot, Clock, Menu, Search, Sun, Moon,
  LogOut, User, ChevronLeft, ChevronRight, X, DollarSign,
} from 'lucide-react';

// Navigation items
const NAV_ITEMS = [
  { id: 'dashboard', label: 'nav.dashboard', icon: LayoutDashboard },
  { id: 'cases', label: 'nav.cases', icon: Briefcase },
  { id: 'appointments', label: 'nav.appointments', icon: CalendarDays },
  { id: 'invoices', label: 'nav.invoices', icon: FileText },
  { id: 'tasks', label: 'nav.tasks', icon: ClipboardList },
  { id: 'messages', label: 'nav.messages', icon: MessageSquare },
  { id: 'notifications', label: 'nav.notifications', icon: Bell },
  { id: 'social', label: 'nav.social', icon: Rss },
  { id: 'clients', label: 'nav.all', icon: Users, roles: ['SUPER_ADMIN', 'COMPLEX_MANAGER', 'LAWYER'] },
  { id: 'documents', label: 'nav.documents', icon: FolderOpen },
  { id: 'courses', label: 'nav.courses', icon: BookOpen },
  { id: 'calendar', label: 'nav.calendar', icon: CalendarDays },
  { id: 'timeTracking', label: 'nav.timeTracking', icon: Clock },
  { id: 'leads', label: 'nav.leads', icon: Target, roles: ['SUPER_ADMIN', 'COMPLEX_MANAGER', 'LAWYER'] },
  { id: 'financialAnalytics', label: 'nav.financialAnalytics', icon: DollarSign, roles: ['SUPER_ADMIN', 'COMPLEX_MANAGER', 'ACCOUNTANT'] },
  { id: 'reports', label: 'nav.reports', icon: TrendingUp, roles: ['SUPER_ADMIN', 'COMPLEX_MANAGER', 'ACCOUNTANT'] },
  { id: 'users', label: 'nav.users', icon: Users, roles: ['SUPER_ADMIN'] },
  { id: 'ai-assistant', label: 'AI دستیار', icon: Bot },
  { id: 'settings', label: 'nav.settings', icon: Settings },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { currentPage, setPage, currentUser, notifications } = useAppStore();
  const lang = 'fa';

  const filteredNav = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return currentUser && item.roles.includes(currentUser.role);
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const grouped = [
    { label: 'اصلی', items: filteredNav.slice(0, 8) },
    { label: 'مدیریت', items: filteredNav.slice(8, 15) },
    { label: 'سیستم', items: filteredNav.slice(15) },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
          <Scale className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-sm text-emerald-800 dark:text-emerald-300 truncate">لِگال‌هاب</h2>
          <p className="text-[10px] text-muted-foreground">پلتفرم حقوقی</p>
        </div>
      </div>
      <Separator />
      <ScrollArea className="flex-1 px-3 py-2">
        {grouped.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="text-[10px] font-medium text-muted-foreground px-2 mb-1">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setPage(item.id); onNavigate?.(); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                      isActive
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-medium'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1 text-right">{t(item.label, lang)}</span>
                    {item.id === 'notifications' && unreadCount > 0 && (
                      <Badge className="bg-red-500 text-white text-[10px] px-1.5 min-w-5 text-center">{unreadCount}</Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { currentPage, currentUser, theme, toggleTheme, logout, sidebarOpen, toggleSidebar, setSidebarOpen, notifications, setPage, language } = useAppStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const lang = 'fa';

  const unreadNotifs = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col border-l border-border bg-card transition-all duration-300 ${sidebarOpen ? 'w-60' : 'w-16'}`}>
        <AnimatePresence mode="wait">
          {sidebarOpen ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full">
              <SidebarContent />
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col items-center py-3 gap-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-3">
                <Scale className="w-4 h-4 text-white" />
              </div>
              {NAV_ITEMS.filter((item) => !item.roles || currentUser?.role && item.roles.includes(currentUser.role)).map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <TooltipProvider key={item.id} delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button onClick={() => setPage(item.id)} className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${isActive ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground hover:bg-muted/50'}`}>
                          <Icon className="w-4 h-4" />
                          {item.id === 'notifications' && unreadNotifs > 0 && <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right"><p>{t(item.label, lang)}</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
          <div className="flex items-center gap-3 h-14 px-4">
            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden"><Menu className="w-5 h-5" /></Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                <SheetTitle className="sr-only">منو</SheetTitle>
                <SidebarContent />
              </SheetContent>
            </Sheet>

            {/* Toggle sidebar */}
            <Button variant="ghost" size="icon" className="hidden md:flex" onClick={toggleSidebar}>
              {sidebarOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>

            {/* Search */}
            <div className={`relative flex-1 max-w-md transition-all ${searchOpen ? 'block' : 'hidden sm:block'}`}>
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="جستجو..." className="pr-9 h-9 text-sm" />
            </div>
            {!searchOpen && <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setSearchOpen(true)}><Search className="w-4 h-4" /></Button>}

            <div className="flex-1" />

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Theme toggle */}
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={toggleTheme}>
                      {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>{theme === 'light' ? 'حالت تاریک' : 'حالت روشن'}</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative" onClick={() => setPage('notifications')}>
                <Bell className="w-4 h-4" />
                {unreadNotifs > 0 && <Badge className="absolute -top-0.5 -left-0.5 bg-red-500 text-white text-[10px] px-1 min-w-4 h-4 flex items-center justify-center">{unreadNotifs > 9 ? '۹+' : unreadNotifs}</Badge>}
              </Button>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2">
                    <Avatar className="w-7 h-7"><AvatarFallback className="text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700">{currentUser ? getInitials(currentUser.firstName, currentUser.lastName) : '?'}</AvatarFallback></Avatar>
                    <span className="text-sm font-medium hidden sm:inline">{currentUser ? getFullName(currentUser, lang) : ''}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setPage('settings')}><User className="w-4 h-4 ml-2" />{t('auth.profile')}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPage('settings')}><Settings className="w-4 h-4 ml-2" />{t('nav.settings')}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600"><LogOut className="w-4 h-4 ml-2" />{t('auth.logout')}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div key={currentPage} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-3 px-4 text-center">
          <p className="text-xs text-muted-foreground">© ۱۴۰۴ لِگال‌هاب - پلتفرم مدیریت حقوقی | نسخه ۱.۰.۰</p>
        </footer>
      </div>
    </div>
  );
}
