import { NextRequest, NextResponse } from 'next/server';

// Legal AI System Prompt
const SYSTEM_PROMPT = `تو دستیار هوش مصنوعی حقوقی لِگال‌هاب هستی. یک پلتفرم جامع مدیریت حقوقی در ایران.

قوانن و ویژگی‌های تو:
1. پاسخ‌هایت باید حرفه‌ای، دقیق و قابل اعتماد باشد.
2. به قوانین جمهوری اسلامی ایران و رویه قضایی ایران تسلط داری.
3. همیشه منابع قانونی و ماده‌های مرتبط را ذکر کن.
4. پاسخ‌ها به زبان فارسی و با لحن رسمی اما قابل فهم باشد.
5. در مورد مسائلی که نیاز به بررسی دقیق‌تر دارند، حتماً به مشاوره حضوری با وکیل ارجاع بده.
6. هرگز مشاوره پزشکی، مالی سرمایه‌گذاری یا سایر حوزه‌های غیرحقوقی نده.
7. پاسخ‌هایت ساختاریافته و با بولت‌پوینت مرتب باشد.
8. در صورت عدم اطمینان، صراحتاً اعلام کن و پیشنهاد مراجعه به وکیل بده.

حوزه‌های تخصصی تو:
- حقوق مدنی و کیفری
- حقوق خانواده و طلاق
- حقوق تجاری و شرکتی
- حقوق کار و تامین اجتماعی
- حقوق مهاجرت
- حقوق مالیاتی
- مالکیت فکری
- حقوق سایبری
- قراردادها و اسناد تجاری
- ارث و وصیت
- دعاوی ملکی

از آنجایی که این سامانه با قوانین ایران کار می‌کند، پاسخ‌هایت باید مطابق با قوانین جاری جمهوری اسلامی ایران باشد.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, mode } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'پیام‌های مورد نیاز ارسال نشده است' },
        { status: 400 }
      );
    }

    // Check for config file
    const fs = await import('fs/promises');
    const path = await import('path');
    const os = await import('os');
    
    let config: { baseUrl: string; apiKey: string } | null = null;
    const configPaths = [
      path.join(process.cwd(), '.z-ai-config'),
      path.join(os.homedir(), '.z-ai-config'),
      '/etc/.z-ai-config',
    ];
    
    for (const configPath of configPaths) {
      try {
        const configStr = await fs.readFile(configPath, 'utf-8');
        const parsed = JSON.parse(configStr);
        if (parsed.baseUrl && parsed.apiKey) {
          config = parsed;
          break;
        }
      } catch {
        // Continue to next path
      }
    }

    if (!config) {
      // Fallback: generate a smart response without AI API
      return NextResponse.json({
        message: generateFallbackResponse(messages, mode),
        fallback: true,
      });
    }

    // Use the z-ai-web-dev-sdk via dynamic import
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create(config);

    const systemMessage = mode === 'contract' 
      ? SYSTEM_PROMPT + '\n\nحالت فعلی: تحلیل قرارداد. لطفاً قرارداد ارائه‌شده را به دقت تحلیل کن و نقاط قوت، ضعف و ریسک‌ها را مشخص کن.'
      : mode === 'risk'
      ? SYSTEM_PROMPT + '\n\nحالت فعلی: شناسایی ریسک. لطفاً ریسک‌های حقوقی مورد را شناسایی و راهکار کاهش ریسک ارائه بده.'
      : mode === 'summary'
      ? SYSTEM_PROMPT + '\n\nحالت فعلی: خلاصه‌سازی. لطفاً متن ارائه‌شده را به صورت خلاصه و ساختاریافته ارائه کن.'
      : mode === 'draft'
      ? SYSTEM_PROMPT + '\n\nحالت فعلی: تنظیم لایحه/دادخواست. لطفاً بر اساس اطلاعات ارائه‌شده، یک لایحه حقوقی یا دادخواست حرفه‌ای تنظیم کن.'
      : mode === 'research'
      ? SYSTEM_PROMPT + '\n\nحالت فعلی: تحقیق حقوقی. لطفاً قوانین و مقررات مرتبط با موضوع را بررسی و رویه قضایی را توضیح بده.'
      : SYSTEM_PROMPT;

    const chatMessages = [
      { role: 'system', content: systemMessage },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const completion = await zai.chat.completions.create({
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 2000,
    });

    const aiMessage = completion.choices?.[0]?.message?.content || 'پاسخی دریافت نشد. لطفاً دوباره تلاش کنید.';

    return NextResponse.json({ message: aiMessage });
  } catch (error) {
    console.error('AI API Error:', error);
    
    // Return fallback response on error
    const body = await request.json().catch(() => ({}));
    return NextResponse.json({
      message: generateFallbackResponse(body.messages || [], body.mode),
      fallback: true,
    });
  }
}

// Fallback response generator when AI API is unavailable
function generateFallbackResponse(messages: { role: string; content: string }[], mode?: string): string {
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
  const userText = lastUserMsg?.content?.toLowerCase() || '';
  
  if (mode === 'contract' || userText.includes('قرارداد')) {
    return `📋 **تحلیل قرارداد**

متأسفانه در حال حاضر امکان اتصال به موتور هوش مصنوعی وجود ندارد، اما تحلیل کلی ارائه می‌شود:

🔍 **نکات کلیدی بررسی قرارداد:**
• شناسایی طرفین قرارداد و اهلیت آن‌ها
• بررسی موضوع قرارداد و مشروعیت آن
• بررسی شرایط تعهدات و الزامات
• شناسایی بندهای مجازات و شرایط فسخ
• بررسی حل اختلاف و مرجع صالح
• بررسی شرایط محرمانگی و عدم افشا

⚠️ **توصیه:** برای تحلیل دقیق‌تر، لطفاً قرارداد خود را در پنل آپلود کنید و از خدمات مشاوره حضوری با وکلای متخصص ما استفاده نمایید.`;
  }
  
  if (mode === 'draft' || userText.includes('دادخواست') || userText.includes('لایحه')) {
    return `📝 **تنظیم لایحه/دادخواست**

برای تنظیم لایحه حقوقی یا دادخواست، اطلاعات زیر مورد نیاز است:

📌 **اطلاعات لازم:**
1. نام و مشخصات خواهان/وکیل
2. نام و مشخصات خوانده
3. خواسته دقیق (موضوع دعوی)
4. دلایل و مستندات
5. مبلغ خواسته (در صورت وجود)

🔧 **اقدام بعدی:**
لطفاً اطلاعات بالا را ارائه دهید تا لایحه اولیه تنظیم شود. همچنین می‌توانید از بخش "لایحه‌های حقوقی" در پنل برای مدیریت لایحه‌ها استفاده کنید.`;
  }
  
  if (mode === 'risk' || userText.includes('ریسک')) {
    return `⚠️ **ارزیابی ریسک حقوقی**

برای شناسایی ریسک‌های حقوقی، لطفاً موارد زیر را مشخص کنید:
• نوع قرارداد یا توافق
• طرفین مشارکت
• حوزه فعالیت
• مبلغ و ارزش معامله

🎯 **ریسک‌های رایج:**
1. ریسک عدم ایفای تعهدات طرف مقابل
2. ریسک تغییرات قوانین و مقررات
3. ریسک مالی و نقدینگی
4. ریسک تنظیمات قراردادی ناقص
5. ریسک حل اختلاف و داوری

💡 **پیشنهاد:** برای ارزیابی دقیق، با وکیل متخصص مشورت کنید.`;
  }
  
  if (userText.includes('طلاق') || userText.includes('خانواده') || userText.includes('مهریه')) {
    return `👨‍👩‍👧‍👦 **مشاوره حقوق خانواده**

مسائل خانوادگی نیازمند مشاوره تخصصی هستند:

📋 **خدمات ما در حوزه خانواده:**
• طلاق توافقی و از یک طرف
• حضانت و ملاقات فرزند
• مهریه و نفقه
• اجرت‌المثل ایام زوجیت
• وصیت و ارث

📖 **نکات مهم قانونی:**
• اولین مشاوره ۱۵ دقیقه رایگان است
• در دعاوی خانوادگی، دادگاه خانواده صالح است
• امکان مشاوره آنلاین و حضوری وجود دارد

📞 برای مشاوره تخصصی، از بخش "رزرو نوبت" اقدام کنید.`;
  }
  
  if (userText.includes('ثبت شرکت') || userText.includes('شرکت') || userText.includes('تجاری')) {
    return `🏢 **حقوق تجاری و شرکتی**

خدمات حقوقی شرکت ما:

📋 **ثبت انواع شرکت:**
• شرکت سهامی خاص و عام
• شرکت مسئولیت محدود
• شرکت تضامنی و نسبی
• شرکت تعاونی

💡 **نکات کلیدی:**
• حداقل ۳ شریک برای مسئولیت محدود
• حداقل سرمایه ۱ میلیون ریال برای سهامی خاص
• اساسنامه باید توسط وکیل تنظیم شود

📞 برای مشاوره تخصصی ثبت شرکت، از بخش "قراردادها" یا "رزرو نوبت" اقدام کنید.`;
  }
  
  if (userText.includes('مهاجرت') || userText.includes('ویزا')) {
    return `✈️ **حقوق مهاجرت**

خدمات مهاجرتی لِگال‌هاب:

📋 **خدمات ما:**
• ویزای تحصیلی و کاری
• ویزای سرمایه‌گذاری
• اقامت دائم و شهروندی
• پناهندگی

🌍 **مقاصد محبوب:**
• کانادا (اکسپرس اینتری)
• استرالیا (اسکلled ویزا)
• آلمان (بلوکارت)
• پرتغال (اقامت طلایی)

📞 برای ارزیابی رایگان شرایط مهاجرت، از بخش "رزرو نوبت" اقدام کنید.`;
  }
  
  // Default general response
  return `⚖️ **دستیار هوش مصنوعی لِگال‌هاب**

سلام! من دستیار حقوقی شما هستم. در حال حاضر در حال به‌روزرسانی هستم و پاسخ‌های کاملاً هوشمند را به زودی ارائه خواهم داد.

🔧 **خدمات فعلی:**
• مشاوره آنلاین با وکلای متخصص
• تحلیل قراردادها
• تنظیم لایحه و دادخواست
• پیگیری پرونده‌ها

📞 **سریع‌ترین راه:**
از منوی سمت چپ امکانات هوش مصنوعی را انتخاب کنید، یا مستقیماً سؤال خود را بپرسید.

💡 **نکته:** برای مشاوره حضوری و تلفنی، از بخش نوبت‌دهی اقدام کنید. اولین مشاوره رایگان است!`;
}
