'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/persian';
import { getInitials } from '@/lib/utils-helpers';
import { User, Shield, Bell, Palette, Save, Upload, Smartphone, Globe, Clock, Monitor, Camera, Key, Lock, Eye, LogOut, Wallet, Receipt, Scale } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function SettingsPage() {
  const { currentUser, language, setLanguage, theme, toggleTheme } = useAppStore();
  const [saved, setSaved] = useState<string | null>(null);

  // Profile state
  const [profile, setProfile] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    bio: 'وکیل پایه یک دادگستری با تخصص در حقوق تجاری و شرکت‌ها',
  });

  // Security state
  const [twoFactor, setTwoFactor] = useState(currentUser?.twoFactorEnabled || false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification preferences
  const [notifPrefs, setNotifPrefs] = useState({
    emailCase: true, pushCase: true, smsCase: false, inAppCase: true,
    emailPayment: true, pushPayment: true, smsPayment: true, inAppPayment: true,
    emailTask: true, pushTask: false, smsTask: false, inAppTask: true,
    emailSystem: true, pushSystem: true, smsSystem: false, inAppSystem: true,
  });

  // Appearance
  const [sidebarPosition, setSidebarPosition] = useState('right');

  // Legal settings
  const [legalSettings, setLegalSettings] = useState({
    hourlyRate: '500000',
    currency: 'TOMAN',
    taxRate: '9',
    workStart: '08:00',
    workEnd: '17:00',
    workingDays: 'شنبه تا چهارشنبه',
  });

  const handleSave = (section: string) => {
    setSaved(section);
    setTimeout(() => setSaved(null), 2000);
  };

  const activeSessions = [
    { device: 'کروم در ویندوز', ip: '۱۹۲.۱۶۸.۱.۱', lastActive: 'الان', isCurrent: true },
    { device: 'سافاری در آیفون', ip: '۱۰.۰.۰.۵', lastActive: '۲ ساعت پیش', isCurrent: false },
  ];

  const connectedDevices = [
    { name: 'آیفون ۱۵ پرو', lastSync: '۱۰ دقیقه پیش', active: true },
    { name: 'لپ‌تاپ دل', lastSync: 'همین الان', active: true },
    { name: 'تبلت سامسونگ', lastSync: '۲ روز پیش', active: false },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-500" />
          {t('settings.title')}
        </h1>
        <Badge variant="outline" className="text-xs">نسخه ۱.۰.۰</Badge>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="profile" className="text-xs gap-1"><User className="w-3.5 h-3.5" />پروفایل</TabsTrigger>
          <TabsTrigger value="security" className="text-xs gap-1"><Shield className="w-3.5 h-3.5" />امنیت</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs gap-1"><Bell className="w-3.5 h-3.5" />اعلان‌ها</TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs gap-1"><Palette className="w-3.5 h-3.5" />ظاهر</TabsTrigger>
          <TabsTrigger value="legal" className="text-xs gap-1"><Scale className="w-3.5 h-3.5" />تنظیمات حقوقی</TabsTrigger>
        </TabsList>

        {/* ===== PROFILE TAB ===== */}
        <TabsContent value="profile" className="mt-6 space-y-6">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-500" />
                  تصویر پروفایل
                </CardTitle>
                <CardDescription className="text-xs">تصویر خود را بارگذاری کنید</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-20 h-20">
                      <AvatarFallback className="text-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700">{getInitials(profile.firstName, profile.lastName)}</AvatarFallback>
                    </Avatar>
                    <button className="absolute -bottom-1 -left-1 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition-colors shadow-md">
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <p className="font-semibold">{profile.firstName} {profile.lastName}</p>
                    <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {t(`role.${currentUser?.role || 'LAWYER'}`)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">اطلاعات شخصی</CardTitle>
                <CardDescription className="text-xs">نام، ایمیل و شماره تلفن خود را ویرایش کنید</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label className="text-xs">{t('auth.firstName')}</Label><Input value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">{t('auth.lastName')}</Label><Input value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">{t('auth.email')}</Label><Input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} dir="ltr" /></div>
                  <div className="space-y-1.5"><Label className="text-xs">{t('auth.phone')}</Label><Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} dir="ltr" /></div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">بیوگرافی</Label>
                  <Textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={3} />
                </div>
                <Button onClick={() => handleSave('profile')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {saved === 'profile' ? '✓ ذخیره شد' : 'ذخیره تغییرات'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ===== SECURITY TAB ===== */}
        <TabsContent value="security" className="mt-6 space-y-6">
          {/* Change Password */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-500" />
                  تغییر رمز عبور
                </CardTitle>
                <CardDescription className="text-xs">رمز عبور خود را به صورت دوره‌ای تغییر دهید</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">رمز عبور فعلی</Label>
                  <div className="relative">
                    <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} dir="ltr" />
                    <Eye className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">رمز عبور جدید</Label>
                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} dir="ltr" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">تکرار رمز عبور جدید</Label>
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} dir="ltr" />
                  </div>
                </div>
                <Button onClick={() => handleSave('password')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {saved === 'password' ? '✓ ذخیره شد' : 'تغییر رمز عبور'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* 2FA */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  تأیید دو مرحله‌ای
                </CardTitle>
                <CardDescription className="text-xs">امنیت حساب کاربری خود را افزایش دهید</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">فعال‌سازی {t('auth.twoFactor')}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {twoFactor ? 'تأیید دو مرحله‌ای فعال است' : 'تأیید دو مرحله‌ای غیرفعال است'}
                    </p>
                  </div>
                  <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
                </div>
                {twoFactor && (
                  <Badge variant="secondary" className="mt-3 text-xs text-emerald-600">
                    <Lock className="w-3 h-3 ml-1" />حساب شما محافظت شده است
                  </Badge>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Sessions */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-emerald-500" />
                  نشست‌های فعال
                </CardTitle>
                <CardDescription className="text-xs">دستگاه‌های وارد شده به حساب کاربری</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeSessions.map((session, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                      {session.device.includes('آیفون') ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{session.device}</p>
                        {session.isCurrent && <Badge variant="secondary" className="text-[10px] text-emerald-600">فعلی</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">آی‌پی: {session.ip} · {session.lastActive}</p>
                    </div>
                    {!session.isCurrent && (
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 text-xs gap-1">
                        <LogOut className="w-3 h-3" /> خروج
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Connected Devices */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-500" />
                  دستگاه‌های متصل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {connectedDevices.map((device, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <Smartphone className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{device.name}</p>
                      <p className="text-xs text-muted-foreground">آخرین همگام‌سازی: {device.lastSync}</p>
                    </div>
                    <Badge variant={device.active ? 'secondary' : 'outline'} className={device.active ? 'text-emerald-600' : 'text-muted-foreground'}>
                      {device.active ? 'فعال' : 'غیرفعال'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ===== NOTIFICATIONS TAB ===== */}
        <TabsContent value="notifications" className="mt-6 space-y-6">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-500" />
                  ترجیحات اعلان‌ها
                </CardTitle>
                <CardDescription className="text-xs">نوع دریافت اعلان‌ها را برای هر دسته تعیین کنید</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category headers */}
                {[
                  { category: 'پرونده‌ها', icon: Receipt, keys: ['emailCase', 'pushCase', 'smsCase', 'inAppCase'] },
                  { category: 'پرداخت‌ها', icon: Wallet, keys: ['emailPayment', 'pushPayment', 'smsPayment', 'inAppPayment'] },
                  { category: 'وظایف', icon: Clock, keys: ['emailTask', 'pushTask', 'smsTask', 'inAppTask'] },
                  { category: 'سیستم', icon: Monitor, keys: ['emailSystem', 'pushSystem', 'smsSystem', 'inAppSystem'] },
                ].map((cat) => (
                  <div key={cat.category}>
                    <div className="flex items-center gap-2 mb-3">
                      <cat.icon className="w-4 h-4 text-emerald-500" />
                      <p className="text-sm font-semibold">{cat.category}</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      {[
                        { key: cat.keys[0], label: 'ایمیل' },
                        { key: cat.keys[1], label: 'پوش' },
                        { key: cat.keys[2], label: 'پیامکی' },
                        { key: cat.keys[3], label: 'درون‌برنامه' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                          <span className="text-xs">{item.label}</span>
                          <Switch
                            checked={notifPrefs[item.key as keyof typeof notifPrefs]}
                            onCheckedChange={(checked) => setNotifPrefs({ ...notifPrefs, [item.key]: checked })}
                          />
                        </div>
                      ))}
                    </div>
                    <Separator />
                  </div>
                ))}
                <Button onClick={() => handleSave('notifications')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {saved === 'notifications' ? '✓ ذخیره شد' : 'ذخیره تغییرات'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ===== APPEARANCE TAB ===== */}
        <TabsContent value="appearance" className="mt-6 space-y-6">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Palette className="w-4 h-4 text-emerald-500" />
                  ظاهر و زبان
                </CardTitle>
                <CardDescription className="text-xs">پوسته و زبان رابط کاربری را تنظیم کنید</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme */}
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{t('settings.theme')}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">انتخاب پوسته روشن یا تاریک</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant={theme === 'light' ? 'default' : 'outline'} size="sm" onClick={() => useAppStore.getState().setTheme('light')} className="gap-1">
                        <Eye className="w-3.5 h-3.5" />{t('settings.light')}
                      </Button>
                      <Button variant={theme === 'dark' ? 'default' : 'outline'} size="sm" onClick={() => useAppStore.getState().setTheme('dark')} className="gap-1">
                        <Lock className="w-3.5 h-3.5" />{t('settings.dark')}
                      </Button>
                    </div>
                  </div>
                </div>
                <Separator />
                {/* Language */}
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{t('settings.language')}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">انتخاب زبان رابط کاربری</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant={language === 'fa' ? 'default' : 'outline'} size="sm" onClick={() => setLanguage('fa')} className="gap-1">
                        <Globe className="w-3.5 h-3.5" />فارسی
                      </Button>
                      <Button variant={language === 'en' ? 'default' : 'outline'} size="sm" onClick={() => setLanguage('en')} className="gap-1">
                        <Globe className="w-3.5 h-3.5" />English
                      </Button>
                    </div>
                  </div>
                </div>
                <Separator />
                {/* Sidebar Position */}
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">مکان نوار کناری</p>
                      <p className="text-xs text-muted-foreground mt-0.5">تعیین مکان نمایش نوار کناری</p>
                    </div>
                    <Select value={sidebarPosition} onValueChange={setSidebarPosition}>
                      <SelectTrigger className="w-32 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="right">راست</SelectItem>
                        <SelectItem value="left">چپ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={() => handleSave('appearance')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {saved === 'appearance' ? '✓ ذخیره شد' : 'ذخیره تغییرات'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ===== LEGAL SETTINGS TAB ===== */}
        <TabsContent value="legal" className="mt-6 space-y-6">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-500" />
                  تنظیمات حقوقی
                </CardTitle>
                <CardDescription className="text-xs">تنظیمات پیش‌فرض مربوط به امور حقوقی و مالی</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">نرخ ساعتی پیش‌فرض (تومان)</Label>
                    <Input type="number" value={legalSettings.hourlyRate} onChange={(e) => setLegalSettings({ ...legalSettings, hourlyRate: e.target.value })} dir="ltr" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">واحد پول</Label>
                    <Select value={legalSettings.currency} onValueChange={(v) => setLegalSettings({ ...legalSettings, currency: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TOMAN">تومان</SelectItem>
                        <SelectItem value="RIAL">ریال</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">نرخ مالیات (٪)</Label>
                    <Input type="number" value={legalSettings.taxRate} onChange={(e) => setLegalSettings({ ...legalSettings, taxRate: e.target.value })} dir="ltr" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">ساعات کاری</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input type="time" value={legalSettings.workStart} onChange={(e) => setLegalSettings({ ...legalSettings, workStart: e.target.value })} dir="ltr" />
                      <Input type="time" value={legalSettings.workEnd} onChange={(e) => setLegalSettings({ ...legalSettings, workEnd: e.target.value })} dir="ltr" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">روزهای کاری</Label>
                  <Input value={legalSettings.workingDays} onChange={(e) => setLegalSettings({ ...legalSettings, workingDays: e.target.value })} />
                </div>
                <Button onClick={() => handleSave('legal')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {saved === 'legal' ? '✓ ذخیره شد' : 'ذخیره تغییرات'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
