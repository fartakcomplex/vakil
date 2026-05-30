import ZAI from 'z-ai-web-dev-sdk';

let zai: Awaited<ReturnType<typeof ZAI.create>> | null = null;

const AI_SYSTEM_PROMPT = `تو یک دستیار هوش مصنوعی حقوقی برای پلتفرم لِگال‌هاب (LegalHub) هستی. تو به زبان فارسی صحبت می‌کنی و در زمینه حقوق ایران تخصص داری.

قابلیت‌های تو:
۱. تحلیل قراردادها و شناسایی ریسک‌ها
۲. خلاصه‌سازی اسناد حقوقی
۳. کمک در تنظیم لایحه و دادخواست
۴. تحقیق حقوقی و یافتن قوانین مرتبط
۵. مشاوره حقوقی عمومی
۶. کمک در امور خانوادگی، کیفری، حقوقی، شرکتی و کار

قوانین تو:
- همیشه به فارسی پاسخ بده
- پاسخ‌هایت را ساختاریافته و واضح ارائه بده
- در صورت نیاز به اطلاعات بیشتر، سوال بپرس
- هرگز جای وکیل را نگیر - تو یک ابزار کمکی هستی
- در موارد حساس، حتماً به کاربر اطلاع بده که مشاوره حضوری لازم است`;

const server = Bun.serve({
  port: 3001,
  async fetch(req) {
    if (req.method === 'GET' && new URL(req.url).pathname === '/api/ai/health') {
      return Response.json({ status: 'ok', service: 'legalhub-ai' });
    }

    if (req.method === 'POST' && new URL(req.url).pathname === '/api/ai') {
      try {
        const body = await req.json();
        const { messages } = body;

        if (!messages || !Array.isArray(messages)) {
          return Response.json({ error: 'پیام‌های نامعتبر' }, { status: 400 });
        }

        try {
          if (!zai) {
            zai = await ZAI.create();
          }

          const systemMessage = { role: 'system', content: AI_SYSTEM_PROMPT };
          const allMessages = [systemMessage, ...messages];

          const completion = await zai.chat.completions.create({
            messages: allMessages as any,
          });

          const aiMessage = completion.choices?.[0]?.message?.content || 'پاسخی دریافت نشد';
          return Response.json({ message: aiMessage });
        } catch (aiError) {
          console.error('AI SDK Error:', aiError);
          // Return a helpful Persian fallback response
          return Response.json({
            message: 'متأسفانه سرویس هوش مصنوعی در حال حاضر در دسترس نیست. لطفاً بعداً تلاش کنید. برای سؤالات فوری حقوقی، می‌توانید از بخش پرونده‌ها، انجمن یا پیام‌رسان استفاده کنید.'
          });
        }
      } catch (error) {
        console.error('AI Service Error:', error);
        return Response.json({
          message: 'متأسفانه خطایی در پردازش درخواست رخ داد. لطفاً دوباره تلاش کنید.'
        }, { status: 500 });
      }
    }

    return new Response('Not Found', { status: 404 });
  },
});

console.log('🤖 LegalHub AI Service running on port 3001');
