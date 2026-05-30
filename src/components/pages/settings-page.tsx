'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/persian';
import { getInitials } from '@/lib/utils-helpers';
import { User, Shield, Bell, Palette, Globe, Save } from 'lucide-react';

export default function SettingsPage() {
  const { currentUser, language, setLanguage, theme, toggleTheme } = useAppStore();
  const [profile, setProfile] = useState({ firstName: currentUser?.firstName || '', lastName: currentUser?.lastName || '', email: currentUser?.email || '', phone: currentUser?.phone || '' });
  const [twoFactor, setTwoFactor] = useState(currentUser?.twoFactorEnabled || false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-3xl">
      <h1 className="text-xl font-bold">{t('settings.title')}</h1>

      <Tabs defaultValue="profile">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="profile" className="text-xs flex items-center gap-1"><User className="w-3.5 h-3.5" />{t('settings.profile')}</TabsTrigger>
          <TabsTrigger value="security" className="text-xs flex items-center gap-1"><Shield className="w-3.5 h-3.5" />{t('settings.security')}</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs flex items-center gap-1"><Bell className="w-3.5 h-3.5" />{t('settings.notifications')}</TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs flex items-center gap-1"><Palette className="w-3.5 h-3.5" />ظاهر</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">{t('settings.profile')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-16 h-16"><AvatarFallback className="text-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700">{getInitials(profile.firstName, profile.lastName)}</AvatarFallback></Avatar>
                <div><p className="font-semibold">{profile.firstName} {profile.lastName}</p><p className="text-sm text-muted-foreground">{currentUser?.email}</p></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1"><Label className="text-xs">{t('auth.firstName')}</Label><Input value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} /></div>
                <div className="space-y-1"><Label className="text-xs">{t('auth.lastName')}</Label><Input value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} /></div>
                <div className="space-y-1"><Label className="text-xs">{t('auth.email')}</Label><Input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></div>
                <div className="space-y-1"><Label className="text-xs">{t('auth.phone')}</Label><Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
              </div>
              <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white">{saved ? '✓ ذخیره شد' : t('settings.save')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">{t('settings.security')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">{t('auth.twoFactor')}</p><p className="text-xs text-muted-foreground">افزایش امنیت حساب کاربری</p></div>
                <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="space-y-1"><Label className="text-xs">رمز عبور فعلی</Label><Input type="password" /></div>
                <div className="space-y-1"><Label className="text-xs">رمز عبور جدید</Label><Input type="password" /></div>
                <div className="space-y-1"><Label className="text-xs">تکرار رمز عبور جدید</Label><Input type="password" /></div>
              </div>
              <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white">{t('settings.save')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">{t('settings.notifications')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'اعلان‌های ایمیل', desc: 'دریافت اعلان از طریق ایمیل', value: emailNotif, set: setEmailNotif },
                { label: 'اعلان‌های پوش', desc: 'دریافت اعلان فوری', value: pushNotif, set: setPushNotif },
                { label: 'اعلان‌های پیامکی', desc: 'دریافت اعلان از طریق SMS', value: smsNotif, set: setSmsNotif },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                  <Switch checked={item.value} onCheckedChange={item.set} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">ظاهر و زبان</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">{t('settings.theme')}</p><p className="text-xs text-muted-foreground">انتخاب پوسته روشن یا تاریک</p></div>
                <div className="flex gap-2">
                  <Button variant={theme === 'light' ? 'default' : 'outline'} size="sm" onClick={() => useAppStore.getState().setTheme('light')}>{t('settings.light')}</Button>
                  <Button variant={theme === 'dark' ? 'default' : 'outline'} size="sm" onClick={() => useAppStore.getState().setTheme('dark')}>{t('settings.dark')}</Button>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium">{t('settings.language')}</p><p className="text-xs text-muted-foreground">انتخاب زبان رابط کاربری</p></div>
                <div className="flex gap-2">
                  <Button variant={language === 'fa' ? 'default' : 'outline'} size="sm" onClick={() => setLanguage('fa')}>فارسی</Button>
                  <Button variant={language === 'en' ? 'default' : 'outline'} size="sm" onClick={() => setLanguage('en')}>English</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
