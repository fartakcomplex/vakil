import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const maxDuration = 300;

export async function POST() {
  try {
    // ============ IDEMPOTENT CHECK ============
    const articleCount = await db.legalArticle.count();
    if (articleCount > 0) {
      return NextResponse.json({ success: true, message: 'داده‌ها از قبل وجود دارند' });
    }

    // Speed up SQLite
    try { await db.$executeRaw('PRAGMA synchronous = OFF'); } catch (_e) { /* ignore */ }
    try { await db.$executeRaw('PRAGMA journal_mode = WAL'); } catch (_e) { /* ignore */ }

    // ============ GET EXISTING USERS ============
    const users = await db.user.findMany({ take: 10 });
    if (users.length === 0) {
      return NextResponse.json({ success: false, message: 'ابتدا دیتابیس را با seed اولیه پر کنید' });
    }
    const lawyerUser = users.find(u => u.role === 'LAWYER') || users[0];
    const clientUser = users.find(u => u.role === 'CLIENT') || users[1];
    const adminUser = users.find(u => u.role === 'SUPER_ADMIN') || users[0];

    // ============ MODULE 1: LEGAL ARTICLES ============
    const catCivil = await db.articleCategory.create({
      data: { name: 'حقوق مدنی', slug: 'hoghogh-madani', description: 'مقالات و تحلیل‌های حقوق مدنی شامل قراردادها، مالکیت، تعهدات و مسئولیت مدنی', icon: 'Scale', color: '#2563eb', order: 1 },
    });
    const catCriminal = await db.articleCategory.create({
      data: { name: 'حقوق کیفری', slug: 'hoghogh-keyfari', description: 'مقالات مربوط به حقوق کیفری، مجازات‌ها، جرایم و رویه قضایی کیفری', icon: 'ShieldAlert', color: '#dc2626', order: 2 },
    });
    const catCommercial = await db.articleCategory.create({
      data: { name: 'حقوق تجاری', slug: 'hoghogh-tejarati', description: 'تحلیل‌های تخصصی حقوق تجاری بین‌الملل، شرکت‌ها، اسناد تجاری و قراردادهای تجاری', icon: 'Briefcase', color: '#ca8a04', order: 3 },
    });

    const articlesData = [
      {
        title: 'بررسی تحلیلی ماده ۱۰ قانون مدنی و شرط ضمن عقد',
        slug: 'matlab-10-ghanon-madani',
        description: 'تحلیل جامع ماده ۱۰ قانون مدنی در خصوص التزام به شروط ضمن عقد',
        summary: 'ماده ۱۰ قانون مدنی ایران مقرر می‌دارد که عقود بین متعاملین لازم‌الاتباع است و شرط ضمن عقد حکم قرارداد را خواهد داشت. این مقاله به بررسی دقیق این ماده و تطبیق آن با رویه قضایی می‌پردازد.',
        categoryId: catCivil.id,
        authorId: lawyerUser.id,
        articleType: 'ANALYSIS',
        tags: '["ماده ۱۰", "قرارداد", "شروط ضمن عقد", "قانون مدنی"]',
        difficulty: 'SPECIALIZED',
        isFeatured: true,
        publishDate: '۱۴۰۳/۰۴/۱۵',
        content: `<h2>مقدمه و جایگاه ماده ۱۰ در نظام حقوقی ایران</h2><p>ماده ۱۰ قانون مدنی یکی از مهم‌ترین مواد این قانون است که اصل لزوم وفای به عقد و شرط ضمن آن را تبیین می‌نماید. بر اساس این ماده، قراردادها میان طرفین لازم‌الاتباع بوده و هیچ‌یک از طرفین نمی‌تواند بدون رضایت دیگری آن را فسخ نماید مگر در مواردی که قانون تصریح کرده است. این اصل که از قواعد مسلم حقوقی به شمار می‌رود، پایه و اساس امنیت معاملات و روابط حقوقی در جامعه محسوب می‌شود.</p><h2>شرط ضمن عقد و اقسام آن</h2><p>شرط ضمن عقد به شرطی اطلاق می‌شود که در ضمن قرارداد ذکر می‌گردد و یکی از اجزای اصلی توافق طرفین محسوب می‌شود. فقها و حقوق‌دانان شروط ضمن عقد را به سه دسته تقسیم کرده‌اند: شروط صحیح که هم موافق مقتضای عقد بوده و عقد بدون آن‌ها ممکن نیست؛ شروط صحیح غیرمقتضی که اگرچه عقد بدون آن‌ها صحیح است ولی به تنهایی مشکلی ایجاد نمی‌کنند؛ و شروط باطل که برخلاف مقتضای عقد بوده و قانوناً نامعتبر شناخته می‌شوند. رویه قضایی دیوان عالی کشور در آرای متعدد به تفصیل این اقسام را تبیین نموده است.</p>`,
      },
      {
        title: 'مسئولیت مدنی ناشی از تصادفات رانندگی',
        slug: 'masooliyat-madani-tasadof',
        description: 'بررسی مسئولیت مدنی راننده و بیمه‌گر در تصادفات رانندگی',
        summary: 'در تصادفات رانندگی، تعیین مسئول و میزان جبران خسارت از مباحث مهم حقوقی است. این مقاله به بررسی قواعد مسئولیت مدنی در تصادفات و نقش بیمه می‌پردازد.',
        categoryId: catCivil.id,
        authorId: lawyerUser.id,
        articleType: 'ARTICLE',
        tags: '["تصادف", "مسئولیت مدنی", "بیمه شخص ثالث", "جبران خسارت"]',
        difficulty: 'GENERAL',
        isFeatured: false,
        publishDate: '۱۴۰۳/۰۵/۰۱',
        content: `<h2>اساس مسئولیت مدنی در تصادفات رانندگی</h2><p>مبنای مسئولیت مدنی ناشی از تصادفات رانندگی در نظام حقوقی ایران بر قاعده «تسبیب» و ماده ۱ قانون مسئولیت مدنی استوار است. طبق این ماده، هر کس بدون مجوز قانونی به دیگری ضرری وارد کند، مسئول جبران خسارت ناشی از عمل خود خواهد بود. در تصادفات رانندگی، راننده متخلف که با تخلف از مقررات راهنمایی و رانندگی موجب ورود آسیب به دیگری شده باشد، بر اساس قواعد مسئولیت مبتنی بر تقصیر، ملزم به جبران خسارت است. میزان تقصیر راننده توسط کارشناسان راهنمایی و رانندگی تعیین می‌گردد و دادگاه بر اساس گزارش کارشناسی حکم می‌صادر.</p><h2>نقش بیمه شخص ثالث در جبران خسارت</h2><p>طبق قانون بیمه اجباری شخص ثالث، بیمه‌گر مکلف است در صورت بروز حادثه، خسارت بدنی وارد شده به شخص ثالث را تا سقف تعیین‌شده در قانون جبران نماید. این قانون که در سال ۱۳۸۷ با اصلاحات مهمی به تصویب رسید، بیمه شخص ثالث را به عنوان یک ابزار حمایتی مؤثر در قبال زیان‌دیدگان تصادفات رانندگی تثبیت نموده است. با این حال، تفاوت قابل توجهی بین جبران خسارت مالی و بدنی وجود دارد و نحوه مطالبه هر یک از این موارد تابع مقررات خاص خود می‌باشد.</p>`,
      },
      {
        title: 'تحلیل جرم کلاهبرداری و ارکان آن در قانون مجازات اسلامی',
        slug: 'jeray-kalabardari',
        description: 'بررسی کامل ارکان جرم کلاهبرداری و موانع تعقیب',
        summary: 'کلاهبرداری یکی از جرایم مهم مالی در قانون مجازات اسلامی است. این مقاله به بررسی ارکان مادی و معنوی این جرم و رویه قضایی دیوان عالی می‌پردازد.',
        categoryId: catCriminal.id,
        authorId: lawyerUser.id,
        articleType: 'ANALYSIS',
        tags: '["کلاهبرداری", "قانون مجازات اسلامی", ' +
          '"جرم مالی", "دیوان عالی"]',
        difficulty: 'SPECIALIZED',
        isFeatured: true,
        publishDate: '۱۴۰۳/۰۳/۲۰',
        content: `<h2>تعریف و ارکان جرم کلاهبرداری</h2><p>ماده ۱ قانون تشدید مجازات مرتکبین ارتشاء و کلاهبرداری و خیانت در اموال و اعتبارات دولتی و عمومی، کلاهبرداری را «اخذ اموال یا وجه یا نوشته‌های دارای ارزش یا امتیازات یا هواها و امثال آن‌ها با فریب و تقلب» تعریف کرده است. عنصر مادی این جرم شامل رفتار فریبنده و عنصر روانی شامل سوءنیت عام و خاص است. فریب و تقلب باید در واقعیت وجود داشته باشد و صرف وعده و امید دادن بدون عمل متقلبانه، مشمول عنوان کلاهبرداری نخواهد بود. رویه قضایی دیوان عالی کشور شرط «فریب» را به عنوان رکن اساسی این جرم تأکید نموده است.</p><h2>تفاوت کلاهبرداری با سایر جرایم مالی</h2><p>تمایز کلاهبرداری از جرایمی نظیر خیانت در امانت و تحصیل مال غیرقانونی از اهمیت ویژه‌ای برخوردار است. در خیانت در امانت، مال به صورت قانونی به شخص سپرده شده ولی او از آن سوءاستفاده می‌کند، در حالی که در کلاهبرداری، مال از ابتدا با فریب و تقلب به دست آمده است. تحصیل مال غیرقانونی نیز شامل هرگونه به دست آوردن مال از طریق نامشروع است و دایره آن وسیع‌تر از کلاهبرداری می‌باشد.</p>`,
      },
      {
        title: 'حق حبس در قراردادهای پیمانکاری و راه‌سازی',
        slug: 'hagh-hebs-peymankari',
        description: 'بررسی حق حبس پیمانکار نسبت به اموال کارفرما',
        summary: 'حق حبس یکی از تضمینات مهم قانونی در قراردادهای پیمانکاری است که به پیمانکار اجازه می‌دهد تا دریافت مطالبات خود، از تحویل کار امتناع نماید.',
        categoryId: catCivil.id,
        authorId: lawyerUser.id,
        articleType: 'JOURNAL',
        tags: '["حق حبس", "پیمانکاری", "تضمینات قراردادی", "قانون مدنی"]',
        difficulty: 'ADVANCED',
        isFeatured: false,
        publishDate: '۱۴۰۳/۰۲/۱۰',
        content: `<h2>مفهوم و مبانی حقوقی حق حبس</h2><p>حق حبس یا «حق امساک» از جمله تضمینات واقعی و مبتنی بر مالکیت در نظام حقوقی ایران است که بر اساس مواد ۲۲۷ تا ۲۳۳ قانون مدنی مقرر شده است. در قراردادهای پیمانکاری، پیمانکاری که مطالبات معوق از کارفرما دارد، می‌تواند از تحویل پروژه یا تجهیزات خودداری کند. این حق مشروط بر آن است که طلب پیمانکار ناشی از قرارداد باشد و مدت آن نیز به اصل طلب محدود است. رویه قضایی شعبه حقوقی دیوان عالی در پرونده‌های متعدد، حق حبس پیمانکار را تأیید نموده ولی شرایط استفاده از آن را严密 تعیین کرده است.</p><h2>حدود و شرایط اعمال حق حبس</h2><p>اعمال حق حبس تابع شرایط خاصی است که رعایت آن‌ها ضروری می‌باشد. نخست آنکه طلب باید معین و معلوم باشد و مشمول موارد اختلافی که جهت آن‌ها مشخص نشده باشد، نخواهد گردید. دوم، حق حبس تنها تا زمان دریافت طلب اصلی اعمال می‌شود و پس از وصول مطالبات، پیمانکار مکلف به تحویل کار خواهد بود. همچنین اگر کارفرما تضمین کافی ارائه نماید، حق حبس ساقط خواهد شد.</p>`,
      },
      {
        title: 'آرای وحدت رویه در دعاوی ملکی و کاربرد آن در دادگاه‌ها',
        slug: 'aray-vahed-rooyeh-melki',
        description: 'بررسی نقش آرای وحدت رویه در ایجاد انسجام رویه قضایی',
        summary: 'آرای وحدت رویه دیوان عالی کشور نقش بسزایی در ایجاد یکپارچگی رویه قضایی دارند. این مقاله مهم‌ترین آرای وحدت رویه ملکی را بررسی می‌کند.',
        categoryId: catCivil.id,
        authorId: lawyerUser.id,
        articleType: 'REVIEW',
        tags: '["آرای وحدت رویه", ' +
          '"دیوان عالی", ' +
          '"دعاوی ملکی", ' +
          '"رویه قضایی"]',
        difficulty: 'GENERAL',
        isFeatured: false,
        publishDate: '۱۴۰۳/۰۶/۰۵',
        content: `<h2>ماهیت آرای وحدت رویه و اهمیت آن</h2><p>آرای وحدت رویه از جمله مهم‌ترین منابع معنوی حقوق در نظام قضایی ایران محسوب می‌شوند. این آرای که توسط شعبه حقوقی دیوان عالی کشور صادر می‌گردند، زمانی الزام‌آور هستند که دو شعبه یا بیشتر دیوان عالی یا دادگاه‌ها در رسیدگی به یک نوع دعوی، رویه متفاوتی اتخاذ کرده باشند. هدف از صدور این آرای، ایجاد وحدت رویه و جلوگیری از صدور آرای متعارض در دعاوی مشابه است. وکلای دادگستری و قضات مکلف به رعایت این آرای در رسیدگی‌های خود می‌باشند.</p><h2>مهم‌ترین آرای وحدت رویه در دعاوی ملکی</h2><p>در دعاوی ملکی، آرای وحدت رویه موضوعات متنوعی از جمله خلع ید، اثبات مالکیت، مطالبه اجاره‌بها و تعیین اجرت‌المثل را پوشش می‌دهند. یکی از معروف‌ترین آرای وحدت رویه، رأی شماره ۲۱ سال ۱۳۷۰ است که شرط صراحت در تنظیم سند رسمی را تفسیر نموده و مقرر داشته که مراد از «صراحت» لفظی، اعمالی است که مفهوم قطعی و غیرقابل تأویل داشته باشد. این رأی در دعاوی اثبات مالکیت و نقل و انتقال املاک کاربرد فراوانی دارد.</p>`,
      },
      {
        title: 'نقش ادله الکترونیکی در اثبات دعاوی حقوقی',
        slug: 'addele-electronic-esthbat',
        description: 'بررسی حجیت ادله الکترونیکی و نامه‌های الکترونیکی در دادگاه',
        summary: 'با توسعه فناوری، ادله الکترونیکی جایگاه ویژه‌ای در اثبات دعاوی پیدا کرده‌اند. این مقاله به بررسی قانون تجارت الکترونیکی و حجیت ادله دیجیتال می‌پردازد.',
        categoryId: catCriminal.id,
        authorId: lawyerUser.id,
        articleType: 'ARTICLE',
        tags: '["ادله الکترونیکی", ' +
          '"تجارت الکترونیکی", ' +
          '"اثبات دعوی", ' +
          '"امضای دیجیتال"]',
        difficulty: 'SPECIALIZED',
        isFeatured: true,
        publishDate: '۱۴۰۳/۰۱/۲۸',
        content: `<h2>ادله الکترونیکی و مبانی قانونی آن</h2><p>قانون تجارت الکترونیکی مصوب ۱۳۸۲، ادله الکترونیکی را به رسمیت شناخته و حجیت آن‌ها را در مراجع قضایی و شبه‌قضایی پذیرفته است. بر اساس ماده ۸ این قانون، داده‌های پیام‌های الکترونیکی معتبرند مگر آنکه ادله دال بر عدم اعتبار آن‌ها ارائه شود. این حکم شامل ایمیل‌ها، پیام‌های متنی، اسناد الکترونیکی امضا شده و سایر اشکال ارتباطات دیجیتال می‌باشد. با این حال، شرایط پذیرش این ادله از جمله قابلیت استناد، حفظ یکپارچگی و احراز هویت فرستنده باید مورد توجه قرار گیرد.</p><h2>امضای دیجیتال و گواهی الکترونیکی</h2><p>امضای دیجیتالی که بر اساس گواهی صادره از مراجع معتبر صادر شده باشد، حجیت امضای مکتوب را دارد و در این خصوص ماده ۱۰ قانون تجارت الکترونیکی تصریح نموده است. مرجع صدور گواهی الکترونیکی در ایران مرکز توسعه تجارت الکترونیکی وزارت صنعت، معدن و تجارت است و گواهی‌های صادره توسط این مرکز اعتبار قانونی کامل دارند. قضات در رسیدگی به دعاوی باید با ادله الکترونیکی همان‌گونه برخورد کنند که با اسناد مکتوب رفتار می‌شود.</p>`,
      },
      {
        title: 'شرایط تنبیه اردات و مقررات مربوط به امور نظامیان',
        slug: 'tanbih-ordat-nezami',
        description: 'بررسی عناصر تشکیل‌دهنده جرم تنبیه اردات در قانون مجازات اسلامی',
        summary: 'جرم تنبیه اردات از جرایم خاص نظامی است که علیه اوامر مقامات مافوق صورت می‌گیرد.',
        categoryId: catCriminal.id,
        authorId: lawyerUser.id,
        articleType: 'OPINION',
        tags: '["تنبیه اردات", ' +
          '"جرایم نظامی", ' +
          '"قانون مجازات اسلامی", ' +
          '"دیوان نظامی"]',
        difficulty: 'ADVANCED',
        isFeatured: false,
        publishDate: '۱۴۰۳/۰۴/۰۱',
        content: `<h2>تعریف و عناصر تشکیل‌دهنده جرم تنبیه اردات</h2><p>تنبیه اردات یکی از جرایم مستوجب تعزیر است که در ماده ۶۰۰ قانون مجازات اسلامی پیش‌بینی شده است. این جرم زمانی واقع می‌شود که فرد نظامی یا غیرنظامی به الأخره لشکری که به وی اطلاع شده یا ابلاغ گردیده است، معترض شده یا از اجرای آن امتناع نماید. عنصر مادی این جرم شامل اعتراض یا امتناع صریح نسبت به دستور مقام مافوق و عنصر روانی شامل سوءنیت عام و آگاهی از لزوم اجرای امر می‌باشد.</p><h2>مجازات و رویه قضایی</h2><p>مجازات این جرم بر اساس قانون، حبس از شش ماه تا دو سال است. در رویه قضایی، دادگاه‌ها تمایز بین عدم امکان اجرای امر و امتناع عمدی قائل شده‌اند و در صورت اثبات عدم امکان اجرای امر، مجازات ساقط خواهد شد.</p>`,
      },
      {
        title: 'مسئولیت شرکت‌های تجاری در قبال سهامداران و طلبکاران',
        slug: 'masooliyat-sherkat-tejarati',
        description: 'بررسی انواع مسئولیت شرکت‌های تجاری و ضمانت‌های قانونی',
        summary: 'شرکت‌های تجاری بر اساس نوع ثبتی خود مسئولیت‌های متفاوتی در قبال طلبکاران و سهامداران دارند.',
        categoryId: catCommercial.id,
        authorId: lawyerUser.id,
        articleType: 'ARTICLE',
        tags: '["شرکت‌های تجاری", ' +
          '"مسئولیت مدنی", ' +
          '"سهامداران", ' +
          '"قانون تجارت"]',
        difficulty: 'GENERAL',
        isFeatured: false,
        publishDate: '۱۴۰۳/۰۵/۲۰',
        content: `<h2>انواع شرکت‌ها و مسئولیت متفاوت آن‌ها</h2><p>قانون تجارت ایران هفت نوع شرکت تجاری را شناخته است: شرکت سهامی، شرکت با مسئولیت محدود، شرکت تضامنی، شرکت نسبی، شرکت مختلط غیرسهامی، شرکت مختلط سهامی و شرکت تعاونی. هر یک از این شرکت‌ها از نظر مسئولیت شرکا در قبال طلبکاران تفاوت‌های بنیادینی دارند. در شرکت با مسئولیت محدود، مسئولیت شرکا محدود به آورده آن‌هاست، در حالی که در شرکت تضامنی، شرکا مسئولیت تضامنی و نامحدود دارند.</p><h2>ضمانت اجراهای قانونی و حقوق طلبکاران</h2><p>طلبکاران شرکت‌های تجاری از جمله سهامداران، کارمندان، تأمین‌کنندگان و سازمان مالیاتی هستند. قانون تجارت و قانون ثبت شرکت‌ها ضمانت‌های متعددی برای حمایت از حقوق این افراد پیش‌بینی نموده است. از جمله این ضمانت‌ها می‌توان به حق عدم اعمال شخصیت حقوقی در صورت سوءاستفاده، حق طلب تضامنی از شرکا و حق پیگیری قضایی مستقیم مدیران متخلف اشاره نمود.</p>`,
      },
      {
        title: 'حل اختلافات تجاری بین‌المللی: داوری versus دادگاه',
        slug: 'hal-ekhtelafat-tejarati-international',
        description: 'مقایسه داوری و دادگاه در حل اختلافات تجاری بین‌المللی',
        summary: 'در تجارت بین‌المللی، انتخاب روش حل اختلاف از اهمیت بالایی برخوردار است. این مقاله داوری و دادگاه را مقایسه می‌کند.',
        categoryId: catCommercial.id,
        authorId: lawyerUser.id,
        articleType: 'ANALYSIS',
        tags: '["داوری بین‌المللی", ' +
          '"حل اختلاف", ' +
          '"تجارت بین‌الملل", ' +
          '"قانون داوری"]',
        difficulty: 'ADVANCED',
        isFeatured: true,
        publishDate: '۱۴۰۳/۰۶/۱۵',
        content: `<h2>مزایای داوری بین‌المللی</h2><p>داوری بین‌المللی به عنوان رایج‌ترین روش حل اختلاف در تجارت جهانی، مزایای متعددی نسبت به دادگاه‌های ملی دارد. نخست، داوران متخصص در موضوع اختلاف انتخاب می‌شوند و این امر کیفیت تصمیم‌گیری را ارتقا می‌دهد. دوم، محرمانگی فرآیند داوری از آنجا که تجار تمایل به حفظ اسرار تجاری خود دارند، بسیار مهم است. سوم، آرای داوری بر اساس کنوانسیون نیویورک ۱۹۵۸ در بیش از ۱۷۰ کشور قابل اجرا هستند و این ویژگی، اجرای حکم را در سطح بین‌المللی تسهیل می‌نماید.</p><h2>نقش قانون داوری ایران</h2><p>قانون داوری تجاری بین‌المللی ایران مصوب ۱۳۷۶ که بر اساس قانون نمونه آنسیترال تدوین شده، چارچوب حقوقی مناسبی برای داوری‌های بین‌المللی در ایران فراهم آورده است. مرجع داوری ایران نیز تحت نظارت اتاق بازرگانی ایران فعالیت می‌کند و توانسته در سال‌های اخیر اعتماد تجار خارجی را جلب نماید.</p>`,
      },
      {
        title: 'بررسی حقوقی قراردادهای فریلنسری و کار از راه دور',
        slug: 'freelance-contracts-law',
        description: 'تحلیل وضعیت حقوقی قراردادهای فریلنسری در نظام حقوقی ایران',
        summary: 'با گسترش کار از راه دور، قراردادهای فریلنسری چالش‌های حقوقی جدیدی ایجاد کرده‌اند.',
        categoryId: catCommercial.id,
        authorId: lawyerUser.id,
        articleType: 'OPINION',
        tags: '["فریلنسری", ' +
          '"کار از راه دور", ' +
          '"قرارداد کار", ' +
          '"حقوق کار"]',
        difficulty: 'GENERAL',
        isFeatured: false,
        publishDate: '۱۴۰۳/۰۳/۰۸',
        content: `<h2>ماهیت قراردادهای فریلنسری</h2><p>قراردادهای فریلنسری از نظر ماهیت حقوقی در فضای خاکستری بین قرارداد کار و قرارداد پیمانکاری قرار دارند. در نظام حقوقی ایران، قانون کار مشمول افرادی می‌شود که تحت نظارت و کنترل کارفرما فعالیت می‌کنند و روابط کارگری دارند. فریلنسرها معمولاً آزادانه در زمان و مکان مورد نظر خود فعالیت می‌کنند و از این رو مشمول قانون کار نخواهند بود. با این حال، اگر شرایط قرارداد به گونه‌ای باشد که مشخصات قرارداد کار (نظارت، تبعیت، دریافت حقوق ثابت) را دارا باشد، ممکن است قانون کار اعمال گردد.</p><h2>چالش‌های حقوقی و پیشنهادها</h2><p>مهم‌ترین چالش‌های حقوقی فریلنسری شامل تعیین نوع قرارداد، مالیات بر درآمد، تأمین اجتماعی و بیمه مسئولیت می‌باشد. فریلنسرها باید نسبت به مالیات بر درآمد خود اقدام نمایند و در قرارداد خود بندهای محکم مربوط به مالکیت فکری و محرمانگی اطلاعات را گنجانند.</p>`,
      },
    ];

    await Promise.all(
      articlesData.map((a) =>
        db.legalArticle.create({
          data: {
            ...a,
            isPublished: true,
            viewCount: Math.floor(Math.random() * 500) + 50,
            likeCount: Math.floor(Math.random() * 100),
          },
        })
      )
    );

    // ============ MODULE 2: SURVEYS ============
    const survey1 = await db.survey.create({
      data: {
        title: 'رضایت‌سنجی مشتریان',
        description: 'survey رضایت مشتریان از خدمات حقوقی مجموعه',
        status: 'ACTIVE',
        targetGroup: 'CLIENTS',
      },
    });
    const survey2 = await db.survey.create({
      data: {
        title: 'ارزیابی خدمات حقوقی',
        description: 'بررسی کیفیت خدمات حقوقی ارائه شده توسط وکلای مجموعه',
        status: 'ACTIVE',
        targetGroup: 'ALL',
      },
    });
    const survey3 = await db.survey.create({
      data: {
        title: 'بازخورد مشاوره',
        description: 'جمع‌آوری بازخورد از جلسات مشاوره حقوقی',
        status: 'ACTIVE',
        targetGroup: 'CLIENTS',
      },
    });

    // Survey 1 Questions
    await db.surveyQuestion.createMany({
      data: [
        { surveyId: survey1.id, question: 'در مجموع چقدر از خدمات حقوقی ما راضی هستید؟', type: 'RATING', order: 1 },
        { surveyId: survey1.id, question: 'کیفیت مشاوره حقوقی دریافتی را چگونه ارزیابی می‌کنید؟', type: 'CHOICE', options: '["عالی", ' +
          '"خوب", ' +
          '"متوسط", ' +
          '"ضعیف"]', order: 2 },
        { surveyId: survey1.id, question: 'آیا پیشنهاد بهبودی خاصی دارید؟', type: 'TEXT', order: 3 },
        { surveyId: survey1.id, question: 'کدام بخش از خدمات ما بیشتر مورد استفاده شما قرار گرفت؟', type: 'MULTICHOICE', options: '["مشاوره حقوقی", ' +
          '"پرونده‌های دادگاه", ' +
          '"تنظیم قرارداد", ' +
          '"ثبت شرکت"]', order: 4 },
      ],
    });

    // Survey 2 Questions
    await db.surveyQuestion.createMany({
      data: [
        { surveyId: survey2.id, question: 'سرعت پاسخگویی وکلا چگونه بود؟', type: 'RATING', order: 1 },
        { surveyId: survey2.id, question: 'حرفه‌ای‌گری و دانش حقوقی وکیل شما چگونه ارزیابی می‌شود؟', type: 'CHOICE', options: '["بسیار خوب", ' +
          '"خوب", ' +
          '"قابل قبول", ' +
          '"نیاز به بهبود"]', order: 2 },
        { surveyId: survey2.id, question: 'آیا توضیحات حقوقی ارائه شده قابل فهم بود؟', type: 'RATING', order: 3 },
        { surveyId: survey2.id, question: 'نقاط قوت و ضعف خدمات را ذکر کنید', type: 'TEXT', order: 4 },
        { surveyId: survey2.id, question: 'نحوه اطلاع‌رسانی و پیگیری پرونده را چگونه ارزیابی می‌کنید؟', type: 'MULTICHOICE', options: '["مناسب", ' +
          '"نسبتاً مناسب", ' +
          '"نیاز به بهبود"]', order: 5 },
      ],
    });

    // Survey 3 Questions
    await db.surveyQuestion.createMany({
      data: [
        { surveyId: survey3.id, question: 'آیا مشاوره دریافتی به سؤالات شما پاسخ داده است؟', type: 'RATING', order: 1 },
        { surveyId: survey3.id, question: 'میزان رضایت شما از مدت زمان جلسه مشاوره', type: 'RATING', order: 2 },
        { surveyId: survey3.id, question: 'موضوع مشاوره شما چه بود؟', type: 'CHOICE', options: '["حقوقی", ' +
          '"کیفری", ' +
          '"خانوادگی", ' +
          '"تجاری", ' +
          '"کار و تأمین اجتماعی"]', order: 3 },
      ],
    });

    // Survey Responses
    const allUsers = await db.user.findMany({ take: 5 });
    await db.surveyResponse.createMany({
      data: [
        { surveyId: survey1.id, userId: allUsers[0]?.id || users[0].id, answers: '{"q1":5,"q2":"عالی","q3":"بسیار ممنون از خدمات عالی شما","q4":["مشاوره حقوقی","تنظیم قرارداد"]}', rating: 5, comment: 'خدمات عالی بود' },
        { surveyId: survey1.id, userId: allUsers[1]?.id || users[1].id, answers: '{"q1":4,"q2":"خوب","q3":"پیشنهاد می‌کنم سیستم پیامرسان بهتر شود","q4":["پرونده‌های دادگاه"]}', rating: 4, comment: 'خوب بود' },
        { surveyId: survey2.id, userId: allUsers[2]?.id || users[0].id, answers: '{"q1":5,"q2":"بسیار خوب","q3":5,"q4":"وکیل ما بسیار حرفه‌ای بود","q5":"مناسب"}', rating: 5, comment: '' },
        { surveyId: survey2.id, userId: allUsers[3]?.id || users[1].id, answers: '{"q1":3,"q2":"قابل قبول","q3":4,"q4":"زمان پاسخگویی باید کاهش یابد","q5":"نیاز به بهبود"}', rating: 3, comment: 'نیاز به بهبود سرعت' },
        { surveyId: survey3.id, userId: allUsers[0]?.id || users[0].id, answers: '{"q1":5,"q2":4,"q3":"حقوقی"}', rating: 5, comment: '' },
        { surveyId: survey3.id, userId: allUsers[4]?.id || users[1].id, answers: '{"q1":4,"q2":5,"q3":"خانوادگی"}', rating: 4, comment: 'مشاوره خوبی بود' },
      ],
    });

    // ============ MODULE 3: DIGITAL LIBRARY ============
    const bookCat1 = await db.digitalBookCategory.create({
      data: { name: 'کتاب‌های حقوقی', slug: 'ketab-hoghoghi', description: 'کتاب‌های مرجع و تخصصی در حوزه حقوق و قانون', icon: 'BookOpen', color: '#2563eb', order: 1 },
    });
    const bookCat2 = await db.digitalBookCategory.create({
      data: { name: 'مراجع قانونی', slug: 'maraje-ghanooni', description: 'مجموعه قوانین، مقررات و آیین‌نامه‌های رسمی کشور', icon: 'Landmark', color: '#059669', order: 2 },
    });
    const bookCat3 = await db.digitalBookCategory.create({
      data: { name: 'تفسیرها و نظرات', slug: 'tafsir-nazarat', description: 'تفسیرها و نظرات حقوقی و فقهی بر قوانین موضوعه', icon: 'MessageSquare', color: '#7c3aed', order: 3 },
    });

    await db.digitalBook.createMany({
      data: [
        { title: 'قانون مدنی ایران (ج.۱)', slug: 'ghanon-madani-j1', description: 'مجموعه کامل مواد قانون مدنی جلد اول', author: 'دکتر ناصر کاتوزیان', publisher: 'انتشارات گنج دانش', isbn: '978-964-445-001-1', categoryId: bookCat2.id, bookType: 'REFERENCE', pages: 892, tags: '["قانون مدنی", ' +
          '"مرجع"]', difficulty: 'GENERAL', viewCount: 1250, downloadCount: 320, isPremium: false },
        { title: 'دوره مقدماتی حقوق مدنی', slug: 'dore-moghaddamati-madani', description: 'مجموعه جامع حقوق مدنی در پنج جلد', author: 'دکتر سید حسن صفایی', publisher: 'انتشارات میزان', isbn: '978-964-6631-01-2', categoryId: bookCat1.id, bookType: 'BOOK', pages: 1560, tags: '["حقوق مدنی", ' +
          '"آموزشی"]', difficulty: 'GENERAL', viewCount: 2100, downloadCount: 540, isPremium: true },
        { title: 'قانون مجازات اسلامی (بخش تعزیرات)', slug: 'ghanon-mojazat-tazirat', description: 'مجموعه کامل قانون مجازات اسلامی بخش تعزیرات', author: 'دکتر عباسعلی کدخدایی', publisher: 'انتشارات سمت', isbn: '978-964-459-102-3', categoryId: bookCat2.id, bookType: 'REFERENCE', pages: 720, tags: '["مجازات اسلامی", ' +
          '"تعزیرات"]', difficulty: 'SPECIALIZED', viewCount: 980, downloadCount: 210, isPremium: false },
        { title: 'حقوق تجارت بین‌الملل', slug: 'hoghogh-tejarat-international', description: 'بررسی جامع حقوق تجارت بین‌الملل شامل کنوانسیون‌ها و رویه‌ها', author: 'دکتر محمدرضا بهزادی', publisher: 'انتشارات بنیاد حقوقی میزان', isbn: '978-964-6631-55-6', categoryId: bookCat1.id, bookType: 'BOOK', pages: 1100, tags: '["تجارت بین‌الملل", ' +
          '"کنوانسیون"]', difficulty: 'ADVANCED', viewCount: 650, downloadCount: 150, isPremium: true },
        { title: 'الزام به ایفای تعهد و قراردادها', slug: 'elzam-eyfay-tahood', description: 'تحلیل جامع الزام به ایفای تعهد و انواع قراردادها', author: 'دکتر مصطفی بابایی', publisher: 'انتشارات دانشگاه تهران', isbn: '978-964-03-0078-4', categoryId: bookCat1.id, bookType: 'COMMENTARY', pages: 540, tags: '["ایفای تعهد", ' +
          '"قرارداد"]', difficulty: 'SPECIALIZED', viewCount: 890, downloadCount: 200, isPremium: false },
        { title: 'آیین دادرسی مدنی و کیفری', slug: 'ayin-dadresi-madani-keyfari', description: 'شرح کامل آیین دادرسی مدنی و کیفری', author: 'دکتر جعفر العبرین', publisher: 'انتشارات جنگل', isbn: '978-964-987-023-1', categoryId: bookCat1.id, bookType: 'ENCYCLOPEDIA', pages: 2200, tags: '["آیین دادرسی", ' +
          '"دادرسی مدنی", ' +
          '"دادرسی کیفری"]', difficulty: 'GENERAL', viewCount: 3200, downloadCount: 890, isPremium: true },
        { title: 'نظرات حقوقی استاد کاتوزیان', slug: 'nazarat-hoghoghi-katoozian', description: 'مجموعه نظرات و تحلیل‌های حقوقی استاد ناصر کاتوزیان', author: 'دکتر ناصر کاتوزیان', publisher: 'انتشارات گنج دانش', isbn: '978-964-445-050-9', categoryId: bookCat3.id, bookType: 'COMMENTARY', pages: 980, tags: '["نظرات حقوقی", ' +
          '"کاتوزیان"]', difficulty: 'ADVANCED', viewCount: 450, downloadCount: 110, isPremium: true },
        { title: 'قانون کار و تأمین اجتماعی', slug: 'ghanon-kar-tamin-ejtemaei', description: 'مجموعه قوانین کار و تأمین اجتماعی با آخرین اصلاحات', author: 'دکتر حسین علیزاده', publisher: 'انتشارات سمت', isbn: '978-964-459-200-5', categoryId: bookCat2.id, bookType: 'REFERENCE', pages: 680, tags: '["قانون کار", ' +
          '"تأمین اجتماعی"]', difficulty: 'GENERAL', viewCount: 1850, downloadCount: 480, isPremium: false },
      ],
    });

    // ============ MODULE 4: LICENSES ============
    await db.license.createMany({
      data: [
        { userId: lawyerUser.id, licenseType: 'LAWYER_LICENSE', licenseNumber: 'LAW-BATCH2-001', issuingBody: 'کانون وکلای دادگستری تهران', issueDate: '۱۳۹۸/۰۱/۰۱', expiryDate: '۱۴۰۴/۰۱/۰۱', status: 'ACTIVE', notes: 'پروانه وکالت پایه یک دادگستری' },
        { userId: lawyerUser.id, licenseType: 'SPECIALIZATION', licenseNumber: 'SPEC-BATCH2-001', issuingBody: 'مرکز وکلا', issueDate: '۱۳۹۹/۰۶/۰۱', expiryDate: '۱۴۰۵/۰۶/۰۱', status: 'ACTIVE', notes: 'تخصص در حقوق تجارت بین‌الملل' },
        { userId: users[2]?.id || lawyerUser.id, licenseType: 'CERTIFICATE', licenseNumber: 'CERT-BATCH2-001', issuingBody: 'دانشگاه تهران - دانشکده حقوق', issueDate: '۱۳۹۷/۰۹/۱۵', expiryDate: '۱۴۰۷/۰۹/۱۵', status: 'EXPIRED', notes: 'گواهی پایان دوره دکتری حقوق خصوصی' },
        { userId: users[3]?.id || clientUser.id, licenseType: 'ACCREDITATION', licenseNumber: 'ACC-BATCH2-001', issuingBody: 'سازمان ملی استاندارد', issueDate: '۱۴۰۰/۰۳/۰۱', expiryDate: '۱۴۰۳/۰۳/۰۱', status: 'PENDING_RENEWAL', notes: 'گواهی صلاحیت مشاوره حقوقی ISO' },
        { userId: users[4]?.id || clientUser.id, licenseType: 'LAWYER_LICENSE', licenseNumber: 'LAW-BATCH2-002', issuingBody: 'کانون وکلای دادگستری اصفهان', issueDate: '۱۴۰۱/۰۴/۰۱', expiryDate: '۱۴۰۶/۰۴/۰۱', status: 'ACTIVE', notes: 'پروانه وکالت پایه یک اصفهان' },
      ],
    });

    // ============ MODULE 5: TENDERS ============
    const tenders = await db.tender.createMany({
      data: [
        { title: 'مناقصه خدمات حقوقی وزارت اقتصاد', description: 'نیاز به مشاوران حقوقی جهت بررسی و تنظیم قراردادهای سرمایه‌گذاری خارجی', organization: 'وزارت امور اقتصادی و دارایی', tenderNumber: 'TND-1403-001', tenderType: 'GOVERNMENT', budgetRange: '{"min":500000000,"max":1500000000}', deadline: new Date('2024-09-15'), status: 'OPEN', requirements: '{"minExperience":10,"specialization":"corporate","license":"required"}', createdBy: adminUser.id },
        { title: 'دعوت به رقابت خدمات حقوقی بانک ملی', description: 'انتخاب مشاور حقوقی ارشد برای بخش حقوقی بانک', organization: 'بانک ملی ایران', tenderNumber: 'TND-1403-002', tenderType: 'PRIVATE', budgetRange: '{"min":300000000,"max":800000000}', deadline: new Date('2024-08-30'), status: 'OPEN', requirements: '{"minExperience":7,"specialization":"banking"}', createdBy: adminUser.id },
        { title: 'مناقصه بین‌المللی حقوق شرکت‌های نفت', description: 'مشاوره حقوقی بین‌المللی در حوزه قراردادهای نفتی و گازی', organization: 'شرکت ملی نفت ایران', tenderNumber: 'TND-1403-003', tenderType: 'GOVERNMENT', budgetRange: '{"min":2000000000,"max":5000000000}', deadline: new Date('2024-10-01'), status: 'OPEN', requirements: '{"minExperience":15,"languages":["fa","en","ar"],"specialization":"oil-gas"}', createdBy: adminUser.id },
        { title: 'فراخوان خدمات حقوقی شهرداری تهران', description: 'ارائه خدمات حقوقی در حوزه شهرداری و شهرسازی', organization: 'شهرداری تهران', tenderNumber: 'TND-1403-004', tenderType: 'GOVERNMENT', budgetRange: '{"min":200000000,"max":600000000}', deadline: new Date('2024-07-20'), status: 'CLOSED', requirements: '{"minExperience":5,"specialization":"municipal"}', createdBy: adminUser.id },
        { title: 'مناقصه بین‌المللی صندوق توسعه ملی', description: 'مشاوره حقوقی برای سرمایه‌گذاری‌های خارجی صندوق', organization: 'صندوق توسعه ملی', tenderNumber: 'TND-1403-005', tenderType: 'INTERNATIONAL', budgetRange: '{"min":1000000000,"max":3000000000}', deadline: new Date('2024-11-01'), status: 'OPEN', requirements: '{"minExperience":12,"specialization":"investment","languages":["fa","en"]}', createdBy: adminUser.id },
      ],
    });

    // ============ MODULE 6: SIGNATURES ============
    const workflow1 = await db.signingWorkflow.create({
      data: { title: 'امضای قرارداد تجاری شرکت پارس', documentType: 'contract', status: 'COMPLETED', createdBy: adminUser.id },
    });
    const workflow2 = await db.signingWorkflow.create({
      data: { title: 'امضای وکالت‌نامه دادگستری', documentType: 'powerOfAttorney', status: 'IN_PROGRESS', createdBy: lawyerUser.id },
    });
    const workflow3 = await db.signingWorkflow.create({
      data: { title: 'امضای لایحه دفاعیه پرونده ملکی', documentType: 'letter', status: 'PENDING', createdBy: lawyerUser.id },
    });

    await db.eSignature.createMany({
      data: [
        { workflowId: workflow1.id, signerId: adminUser.id, order: 1, status: 'SIGNED', signedAt: new Date('2024-07-01T10:00:00') },
        { workflowId: workflow1.id, signerId: lawyerUser.id, order: 2, status: 'SIGNED', signedAt: new Date('2024-07-01T14:30:00') },
        { workflowId: workflow1.id, signerId: clientUser.id, order: 3, status: 'SIGNED', signedAt: new Date('2024-07-02T09:15:00') },
        { workflowId: workflow2.id, signerId: lawyerUser.id, order: 1, status: 'SIGNED', signedAt: new Date('2024-07-10T11:00:00') },
        { workflowId: workflow2.id, signerId: clientUser.id, order: 2, status: 'PENDING' },
        { workflowId: workflow2.id, signerId: adminUser.id, order: 3, status: 'PENDING' },
        { workflowId: workflow3.id, signerId: lawyerUser.id, order: 1, status: 'PENDING' },
        { workflowId: workflow3.id, signerId: adminUser.id, order: 2, status: 'PENDING' },
      ],
    });

    // ============ MODULE 7: CASE EXECUTIONS ============
    const existingCases = await db.legalCase.findMany({ take: 5 });

    // If no cases, create standalone ones
    let caseIds: string[];
    if (existingCases.length === 0) {
      const createdCases = await Promise.all([
        db.legalCase.create({
          data: {
            title: 'پرونده اجرایی مطالبه وجه',
            caseNumber: `CEX-${Date.now()}-1`,
            type: 'civil',
            status: 'IN_PROGRESS',
            priority: 'HIGH',
            description: 'اجرای حکم محکومیت مالی',
            clientId: clientUser.id,
            lawyerId: lawyerUser.id,
          },
        }),
        db.legalCase.create({
          data: {
            title: 'اجرای حکم تخلیه ملک',
            caseNumber: `CEX-${Date.now()}-2`,
            type: 'civil',
            status: 'IN_PROGRESS',
            priority: 'MEDIUM',
            description: 'اجرای حکم تخلیه و تحویل ملک',
            clientId: clientUser.id,
            lawyerId: lawyerUser.id,
          },
        }),
      ]);
      caseIds = createdCases.map(c => c.id);
    } else {
      caseIds = existingCases.map(c => c.id);
    }

    const execution1 = await db.caseExecution.create({
      data: { caseId: caseIds[0], executionType: 'JUDGMENT', status: 'IN_PROGRESS', executionNumber: 'EXEC-001', court: 'اجرای دادگاه حقوقی تهران', judge: 'قاضی رضایی', description: 'اجرای حکم قطعی محکومیت مالی به مبلغ پانصد میلیون ریال', startDate: '۱۴۰۳/۰۴/۰۱', totalAmount: 500000000, collectedAmount: 150000000 },
    });
    await db.executionAction.createMany({
      data: [
        { executionId: execution1.id, actionType: 'filing', title: 'تشکیل پرونده اجرایی', description: 'تقدیم درخواست صدور برگه اجرایی به اجرای دادگاه', actionDate: '۱۴۰۳/۰۴/۰۱', result: 'موفق - برگه اجرایی صادر شد', createdBy: lawyerUser.id },
        { executionId: execution1.id, actionType: 'notice', title: 'ابلاغ برگه اجرایی به محکوم‌علیه', description: 'ابلاغ برگه اجرایی از طریق اداره پست', actionDate: '۱۴۰۳/۰۴/۱۰', result: 'ابلاغ قانونی انجام شد', createdBy: lawyerUser.id },
        { executionId: execution1.id, actionType: 'attachment', title: 'تأمین خواسته و بازداشت اموال', description: 'بازداشت حساب بانکی محکوم‌علیه به میزان محکوم‌به', actionDate: '۱۴۰۳/۰۴/۲۰', result: 'بازداشت موفق performed', amount: 150000000, createdBy: lawyerUser.id },
      ],
    });

    const execution2 = await db.caseExecution.create({
      data: { caseId: caseIds[0] || caseIds[0], executionType: 'ATTACHMENT', status: 'PENDING', executionNumber: 'EXEC-002', court: 'اجرای ثبت اسناد تهران', judge: 'رئیس اجرای ثبت', description: 'اجرای حکم رد مال و وصول ثمن', startDate: '۱۴۰۳/۰۵/۰۱', totalAmount: 850000000, collectedAmount: 0 },
    });
    await db.executionAction.createMany({
      data: [
        { executionId: execution2.id, actionType: 'filing', title: 'ثبت درخواست اجرا', description: 'تقدیم مدارک اجرایی به اداره ثبت', actionDate: '۱۴۰۳/۰۵/۰۱', result: 'در حال بررسی', createdBy: lawyerUser.id },
        { executionId: execution2.id, actionType: 'hearing', title: 'جلسه بررسی درخواست اجرا', description: 'حضور در اداره ثبت جهت بررسی مدارک', actionDate: '۱۴۰۳/۰۵/۱۵', result: 'در انتظار تعیین وقت', createdBy: lawyerUser.id },
      ],
    });

    if (caseIds[1]) {
      const execution3 = await db.caseExecution.create({
        data: { caseId: caseIds[1], executionType: 'EVICTION', status: 'COMPLETED', executionNumber: 'EXEC-003', court: 'اجرای دادگاه تهران', judge: 'قاضی محمدی', description: 'اجرای حکم تخلیه ملک تجاری', startDate: '۱۴۰۳/۰۲/۰۱', endDate: '۱۴۰۳/۰۳/۱۵', totalAmount: 200000000, collectedAmount: 200000000 },
      });
      await db.executionAction.createMany({
        data: [
          { executionId: execution3.id, actionType: 'notice', title: 'ابلاغ حکم تخلیه', description: 'ابلاغ رسمی حکم تخلیه به متصرف', actionDate: '۱۴۰۳/۰۲/۰۵', result: 'ابلاغ انجام شد', createdBy: lawyerUser.id },
          { executionId: execution3.id, actionType: 'payment', title: 'وصول اجرت‌المثل', description: 'وصول اجرت‌المثل ایام تصرف غیرمجاز', actionDate: '۱۴۰۳/۰۳/۰۱', result: 'موفق - مبلغ وصول شد', amount: 200000000, createdBy: lawyerUser.id },
        ],
      });
    }

    // Two more standalone executions
    const execution4 = await db.caseExecution.create({
      data: { caseId: caseIds[0], executionType: 'SEIZURE', status: 'IN_PROGRESS', executionNumber: 'EXEC-004', court: 'اجرای کیفری تهران', judge: 'رئیس اجرای کیفری', description: 'مصادره اموال متهم و وصول جریمه', startDate: '۱۴۰۳/۰۶/۰۱', totalAmount: 1200000000, collectedAmount: 400000000 },
    });
    await db.executionAction.createMany({
      data: [
        { executionId: execution4.id, actionType: 'attachment', title: 'شناسایی و شناسایی اموال', description: 'استعلام از سامانه یکپارچه اموال و شناسایی اموال قابل توقیف', actionDate: '۱۴۰۳/۰۶/۰۵', result: 'شناسایی ۳ ملک و ۲ خودرو', createdBy: lawyerUser.id },
        { executionId: execution4.id, actionType: 'attachment', title: 'توقیف خودرو', description: 'توقیف خودرو پژو ۲۰۶ متعلق به محکوم‌علیه', actionDate: '۱۴۰۳/۰۶/۱۰', result: 'توقیف موفق', amount: 400000000, createdBy: lawyerUser.id },
      ],
    });

    const execution5 = await db.caseExecution.create({
      data: { caseId: caseIds[0], executionType: 'FORFEITURE', status: 'SUSPENDED', executionNumber: 'EXEC-005', court: 'اجرای دادگاه اصفهان', judge: 'قاضی کریمی', description: 'اجرای حکم مصادره ملک متعلق به محکوم‌علیه', startDate: '۱۴۰۳/۰۳/۲۰', totalAmount: 3500000000, collectedAmount: 0 },
    });
    await db.executionAction.createMany({
      data: [
        { executionId: execution5.id, actionType: 'filing', title: 'تشکیل پرونده اجرایی', description: 'ارائه درخواست اجرای حکم مصادره', actionDate: '۱۴۰۳/۰۳/۲۰', result: 'پرونده تشکیل شد', createdBy: lawyerUser.id },
        { executionId: execution5.id, actionType: 'notice', title: 'ابلاغ به محکوم‌علیه', description: 'ابلاغ حکم مصادره و مهلت اعتراض', actionDate: '۱۴۰۳/۰۳/۲۵', result: 'محکوم‌علیه اعتراض نمود - اجرا معلق شد', createdBy: lawyerUser.id },
      ],
    });

    // ============ MODULE 8: PRO BONO ============
    await db.proBonoCase.createMany({
      data: [
        { title: 'دعوی مطالبه نفقه فرزند', description: 'مادر مجرد با درآمد بسیار پایین تقاضای مطالبه نفقه فرزند ۵ ساله از پدر را دارد', caseType: 'family', applicantName: 'زهرا محمدی', applicantPhone: '۰۹۱۲۱۲۳۴۵۶۷', applicantEmail: 'z.mohammadi@email.com', incomeLevel: 'VERY_LOW', status: 'ASSIGNED', priority: 'HIGH', assignedTo: lawyerUser.id, notes: 'مورد فوری - کودک در شرایط سخت زندگی قرار دارد', startDate: '۱۴۰۳/۰۴/۰۱' },
        { title: 'اخراج غیرقانونی کارگر ساختمانی', description: 'کارگر ساختمانی بدون دریافت حقوق سه ماهه و مزایا از کار اخراج شده است', caseType: 'labor', applicantName: 'محمد حسینی', applicantPhone: '۰۹۱۹۸۷۶۵۴۳۲', applicantEmail: 'm.hosseini@email.com', incomeLevel: 'LOW', status: 'IN_PROGRESS', priority: 'HIGH', assignedTo: lawyerUser.id, notes: 'مدارک حقوقی موجود - نیاز به پیگیری فوری', startDate: '۱۴۰۳/۰۳/۱۵' },
        { title: 'دعوی خلع ید از ملک مسکونی', description: 'سالمند با درآمد محدود که ملک مسکونی وی به تصرف شخص دیگری درآمده است', caseType: 'civil', applicantName: 'حاج قربان علیزاده', applicantPhone: '۰۹۳۵۱۱۱۲۲۳۳', incomeLevel: 'VERY_LOW', status: 'PENDING', priority: 'MEDIUM', notes: 'نیاز به وکیل متخصص ملکی - موکل سالمند است' },
        { title: 'پرونده کیفری سرقت متهم بی‌بضاعت', description: 'متهم بدون امکان پرداخت حق‌الوکاله جهت دفاع در دادگاه کیفری', caseType: 'criminal', applicantName: 'رضا کمالی', applicantPhone: '۰۹۱۶۵۵۵۶۶۶۷', applicantEmail: 'r.kamali@email.com', incomeLevel: 'VERY_LOW', status: 'PENDING', priority: 'URGENT', notes: 'جلسه دادگاه نزدیک است - نیاز فوری به وکیل' },
        { title: 'دعوی حضانت فرزند بعد از فوت مادر', description: 'پدربزرگ تقاضای حضانت نوه ۸ ساله خود را پس از فوت مادر نوه دارد', caseType: 'family', applicantName: 'حاج محمود نوری', applicantPhone: '۰۹۳۲۷۷۷۸۸۸۹', incomeLevel: 'LOW', status: 'COMPLETED', priority: 'MEDIUM', assignedTo: lawyerUser.id, notes: 'حکم صادر شد - حضانت به پدربزرگ واگذار گردید', startDate: '۱۴۰۳/۰۱/۰۱', completedDate: '۱۴۰۳/۰۳/۰۱' },
      ],
    });

    return NextResponse.json({ success: true, message: 'داده‌ها با موفقیت ایجاد شدند' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'خطای ناشناخته';
    console.error('Seed batch 2 error:', message);
    return NextResponse.json(
      { success: false, message: 'خطا در ایجاد داده‌ها: ' + message },
      { status: 500 }
    );
  }
}
