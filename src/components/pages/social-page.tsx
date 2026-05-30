'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/persian';
import { getInitials, getRelativeTime } from '@/lib/utils-helpers';
import { Plus, Heart, MessageCircle, Pin, BookOpen, HelpCircle, Megaphone } from 'lucide-react';
import type { PostType } from '@/lib/types';

export default function SocialPage() {
  const { posts, setPosts, currentUser } = useAppStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', type: 'DISCUSSION' as PostType });
  const [commentText, setCommentText] = useState('');

  const sorted = useMemo(() => [...posts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }), [posts]);

  const typeIcon = (type: PostType) => {
    switch (type) {
      case 'ARTICLE': return <BookOpen className="w-3.5 h-3.5" />;
      case 'QUESTION': return <HelpCircle className="w-3.5 h-3.5" />;
      case 'ANNOUNCEMENT': return <Megaphone className="w-3.5 h-3.5" />;
      default: return <MessageCircle className="w-3.5 h-3.5" />;
    }
  };

  const typeColor = (type: PostType) => {
    switch (type) {
      case 'ARTICLE': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300';
      case 'QUESTION': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
      case 'ANNOUNCEMENT': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300';
      default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
    }
  };

  const handleCreate = async () => {
    if (!form.content.trim()) return;
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${useAppStore.getState().token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setPosts([data.data, ...posts]);
        setDialogOpen(false);
        setForm({ title: '', content: '', type: 'DISCUSSION' });
      }
    } catch { /* ignore */ }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('social.title')}</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white"><Plus className="w-4 h-4 ml-1" />{t('social.newPost')}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t('social.newPost')}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1"><Label className="text-xs">نوع</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as PostType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{(['DISCUSSION', 'ARTICLE', 'QUESTION', 'ANNOUNCEMENT'] as PostType[]).map((pt) => <SelectItem key={pt} value={pt}>{t(`social.${pt.toLowerCase()}`)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label className="text-xs">عنوان</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">محتوا</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} /></div>
              <Button onClick={handleCreate} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">{t('common.save')}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4 max-w-2xl mx-auto">
        {sorted.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10 shrink-0"><AvatarFallback className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700">{getInitials(post.author?.firstName || '', post.author?.lastName || '')}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-medium">{post.author?.firstName} {post.author?.lastName}</span>
                    <span className="text-xs text-muted-foreground">{getRelativeTime(post.createdAt)}</span>
                    {post.isPinned && <Pin className="w-3 h-3 text-amber-500" />}
                    <Badge className={`text-[10px] px-1.5 ${typeColor(post.type)}`}>{typeIcon(post.type)} {t(`social.${post.type.toLowerCase()}`)}</Badge>
                  </div>
                  {post.title && <h3 className="font-semibold text-sm mb-2">{post.title}</h3>}
                  <p className="text-sm text-muted-foreground leading-relaxed">{post.content}</p>
                  <Separator className="my-3" />
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-rose-500 text-xs"><Heart className="w-3.5 h-3.5 ml-1" />{post.likes}</Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground text-xs"><MessageCircle className="w-3.5 h-3.5 ml-1" />{post.comments?.length || 0}</Button>
                  </div>
                  {(post.comments || []).length > 0 && (
                    <div className="mt-3 space-y-2">
                      {post.comments!.slice(0, 2).map((c) => (
                        <div key={c.id} className="flex gap-2 text-sm">
                          <Avatar className="w-6 h-6 shrink-0"><AvatarFallback className="text-[10px]">{getInitials(c.author?.firstName || '', c.author?.lastName || '')}</AvatarFallback></Avatar>
                          <div><span className="font-medium text-xs">{c.author?.firstName} {c.author?.lastName}</span><p className="text-muted-foreground text-xs">{c.content}</p></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {posts.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">{t('common.noData')}</div>}
      </div>
    </motion.div>
  );
}
