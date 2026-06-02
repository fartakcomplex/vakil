import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

// ============ CATEGORIES (hierarchical) ============
const catData = [
  // [name, slug, description, icon, color, order, parentId(null=root)]
  // -- REAL ESTATE --
  ['قراردادهای ملکی', 'real-estate', 'قراردادهای املاک و مستغلات', 'Building2', 'bg-amber-100 text-amber-700', 1, null],
  ['خرید و فروش ملک', 'real-estate-buy-sell', 'خرید و فروش انواع املاک', 'Building2', 'bg-amber-100 text-amber-700', 1, 'real-estate'],
  ['اجاره و استیجار', 'real-estate-rent', 'اجاره و استیجار املاک', 'Building2', 'bg-amber-100 text-amber-700', 2, 'real-estate'],
  ['پیش‌فروش ساختمان', 'real-estate-presale', 'پیش‌فروش واحدهای ساختمانی', 'Building2', 'bg-amber-100 text-amber-700', 3, 'real-estate'],
  ['مشارکت در ساخت', 'real-estate-build', 'مشارکت مالک و سازنده', 'Building2', 'bg-amber-100 text-amber-700', 4, 'real-estate'],
  ['رهن و اجاره', 'real-estate-lease', 'رهن و اجاره املاک', 'Building2', 'bg-amber-100 text-amber-700', 5, 'real-estate'],
  ['وکالت ملکی', 'real-estate-poa', 'وکالت در امور ملکی', 'Building2', 'bg-amber-100 text-amber-700', 6, 'real-estate'],
  ['صلح ملکی', 'real-estate-settle', 'صلح و مصالحه ملکی', 'Building2', 'bg-amber-100 text-amber-700', 7, 'real-estate'],
  ['معاوضه ملک', 'real-estate-exchange', 'معاوضه املاک', 'Building2', 'bg-amber-100 text-amber-700', 8, 'real-estate'],
  ['هبه ملک', 'real-estate-gift', 'هبه و بخشش املاک', 'Building2', 'bg-amber-100 text-amber-700', 9, 'real-estate'],
  // -- COMMERCIAL --
  ['قراردادهای تجاری', 'commercial', 'قراردادهای تجاری و بازرگانی', 'Store', 'bg-blue-100 text-blue-700', 2, null],
  ['خرید و فروش کالا', 'commercial-buy', 'خرید و فروش کالا', 'Store', 'bg-blue-100 text-blue-700', 1, 'commercial'],
  ['نمایندگی تجاری', 'commercial-agency', 'نمایندگی و عاملیت تجاری', 'Store', 'bg-blue-100 text-blue-700', 2, 'commercial'],
  ['توزیع و پخش', 'commercial-dist', 'توزیع و پخش محصولات', 'Store', 'bg-blue-100 text-blue-700', 3, 'commercial'],
  ['فرانشیز', 'commercial-franchise', 'فرانشیز و امتیاز تجاری', 'Store', 'bg-blue-100 text-blue-700', 4, 'commercial'],
  ['مشارکت تجاری', 'commercial-partner', 'مشارکت تجاری و شراکت', 'Store', 'bg-blue-100 text-blue-700', 5, 'commercial'],
  ['خرید نسیه', 'commercial-credit', 'خرید نسیه و اعتباری', 'Store', 'bg-blue-100 text-blue-700', 6, 'commercial'],
  ['حمل بار', 'commercial-freight', 'حمل بار و لجستیک', 'Store', 'bg-blue-100 text-blue-700', 7, 'commercial'],
  ['صادرات و واردات', 'commercial-trade', 'صادرات و واردات کالا', 'Store', 'bg-blue-100 text-blue-700', 8, 'commercial'],
  ['آژانس بازرگانی', 'commercial-trading', 'آژانس بازرگانی', 'Store', 'bg-blue-100 text-blue-700', 9, 'commercial'],
  // -- LABOR --
  ['قراردادهای کار', 'labor', 'قراردادهای روابط کارگر و کارفرما', 'HardHat', 'bg-orange-100 text-orange-700', 3, null],
  ['قرارداد کار دائم', 'labor-perm', 'قرارداد کار با مدت نامعین', 'HardHat', 'bg-orange-100 text-orange-700', 1, 'labor'],
  ['قرارداد کار موقت', 'labor-temp', 'قرارداد کار با مدت معین', 'HardHat', 'bg-orange-100 text-orange-700', 2, 'labor'],
  ['قرارداد کار آزمایشی', 'labor-prob', 'قرارداد دوره آزمایشی', 'HardHat', 'bg-orange-100 text-orange-700', 3, 'labor'],
  ['پیمانکاری', 'labor-contract', 'پیمانکاری و انجام کار', 'HardHat', 'bg-orange-100 text-orange-700', 4, 'labor'],
  ['مشاوره کاری', 'labor-consult', 'مشاوره خدمات تخصصی', 'HardHat', 'bg-orange-100 text-orange-700', 5, 'labor'],
  ['کار دورکاری', 'labor-remote', 'کار دورکاری و از راه دور', 'HardHat', 'bg-orange-100 text-orange-700', 6, 'labor'],
  ['اخراج و تسویه', 'labor-term', 'پایان کار و تسویه حقوق', 'HardHat', 'bg-orange-100 text-orange-700', 7, 'labor'],
  ['سنوات و مزایا', 'labor-benefits', 'سنوات و مزایای کار', 'HardHat', 'bg-orange-100 text-orange-700', 8, 'labor'],
  ['ایمنی کارگاهی', 'labor-safety', 'ایمنی و بهداشت کار', 'HardHat', 'bg-orange-100 text-orange-700', 9, 'labor'],
  // -- FAMILY --
  ['قراردادهای خانواده', 'family', 'قراردادهای مسائل خانوادگی', 'Heart', 'bg-pink-100 text-pink-700', 4, null],
  ['عقدنامه ازدواج', 'family-marriage', 'عقدنامه و ازدواج', 'Heart', 'bg-pink-100 text-pink-700', 1, 'family'],
  ['مهریه', 'family-mahr', 'مربوط به مهریه', 'Heart', 'bg-pink-100 text-pink-700', 2, 'family'],
  ['نفقه', 'family-nafaqeh', 'مربوط به نفقه', 'Heart', 'bg-pink-100 text-pink-700', 3, 'family'],
  ['حضانت فرزند', 'family-custody', 'حضانت و سرپرستی', 'Heart', 'bg-pink-100 text-pink-700', 4, 'family'],
  ['طلاق توافقی', 'family-divorce', 'طلاق توافقی', 'Heart', 'bg-pink-100 text-pink-700', 5, 'family'],
  ['اجرت‌المثل', 'family-ujrat', 'اجرت‌المثل', 'Heart', 'bg-pink-100 text-pink-700', 6, 'family'],
  ['وصیت‌نامه', 'family-will', 'وصیت‌نامه خانوادگی', 'Heart', 'bg-pink-100 text-pink-700', 7, 'family'],
  ['حصر وراثت', 'family-inherit', 'ارث و وراثت', 'Heart', 'bg-pink-100 text-pink-700', 8, 'family'],
  ['شروط ضمن عقد', 'family-cond', 'شروط ضمن عقد ازدواج', 'Heart', 'bg-pink-100 text-pink-700', 9, 'family'],
  // -- LEGAL --
  ['قراردادهای حقوقی', 'legal', 'وکالت و مشاوره حقوقی', 'Scale', 'bg-emerald-100 text-emerald-700', 5, null],
  ['وکالت دادگاهی', 'legal-court', 'وکالت در دعاوی دادگاهی', 'Scale', 'bg-emerald-100 text-emerald-700', 1, 'legal'],
  ['وکالت غیردادگاهی', 'legal-noncourt', 'وکالت غیردادگاهی', 'Scale', 'bg-emerald-100 text-emerald-700', 2, 'legal'],
  ['مشاوره حقوقی', 'legal-consult', 'مشاوره حقوقی', 'Scale', 'bg-emerald-100 text-emerald-700', 3, 'legal'],
  ['داوری', 'legal-arbit', 'داوری و حل اختلاف', 'Scale', 'bg-emerald-100 text-emerald-700', 4, 'legal'],
  ['مصالحه', 'legal-recon', 'مصالحه و سازش', 'Scale', 'bg-emerald-100 text-emerald-700', 5, 'legal'],
  ['وکالت تجدیدنظر', 'legal-appeal', 'وکالت تجدیدنظر', 'Scale', 'bg-emerald-100 text-emerald-700', 6, 'legal'],
  ['مشاوره مالیاتی', 'legal-tax', 'مشاوره مالیاتی', 'Scale', 'bg-emerald-100 text-emerald-700', 7, 'legal'],
  ['ثبت شرکت', 'legal-company', 'ثبت شرکت‌ها', 'Scale', 'bg-emerald-100 text-emerald-700', 8, 'legal'],
  ['لایحه‌خوانی', 'legal-petition', 'تهیه و تقدیم لایحه', 'Scale', 'bg-emerald-100 text-emerald-700', 9, 'legal'],
  // -- FINANCIAL --
  ['قراردادهای مالی', 'financial', 'امور مالی و بانکی', 'Landmark', 'bg-green-100 text-green-700', 6, null],
  ['وام بانکی', 'financial-loan', 'وام و تسهیلات بانکی', 'Landmark', 'bg-green-100 text-green-700', 1, 'financial'],
  ['سپرده بانکی', 'financial-deposit', 'سپرده‌گذاری بانکی', 'Landmark', 'bg-green-100 text-green-700', 2, 'financial'],
  ['ضمانت بانکی', 'financial-guarantee', 'ضمانت و تضمین بانکی', 'Landmark', 'bg-green-100 text-green-700', 3, 'financial'],
  ['اعتبار اسنادی', 'financial-lc', 'اعتبار اسنادی و ال‌سی', 'Landmark', 'bg-green-100 text-green-700', 4, 'financial'],
  ['رهن بانکی', 'financial-mortgage', 'رهن املاک نزد بانک', 'Landmark', 'bg-green-100 text-green-700', 5, 'financial'],
  ['لیزینگ', 'financial-lease', 'لیزینگ و اجاره به شرط تملک', 'Landmark', 'bg-green-100 text-green-700', 6, 'financial'],
  ['فروش اقساطی', 'financial-install', 'فروش اقساطی و اعتباری', 'Landmark', 'bg-green-100 text-green-700', 7, 'financial'],
  ['صندوق سرمایه‌گذاری', 'financial-fund', 'سرمایه‌گذاری در صندوق‌ها', 'Landmark', 'bg-green-100 text-green-700', 8, 'financial'],
  ['حواله بانکی', 'financial-transfer', 'حواله و انتقال وجه', 'Landmark', 'bg-green-100 text-green-700', 9, 'financial'],
  // -- INSURANCE --
  ['قراردادهای بیمه', 'insurance', 'انواع بیمه‌نامه', 'Shield', 'bg-cyan-100 text-cyan-700', 7, null],
  ['بیمه بدنه', 'insurance-body', 'بیمه بدنه خودرو', 'Shield', 'bg-cyan-100 text-cyan-700', 1, 'insurance'],
  ['بیمه شخص ثالث', 'insurance-third', 'مسئولیت شخص ثالث', 'Shield', 'bg-cyan-100 text-cyan-700', 2, 'insurance'],
  ['بیمه آتش‌سوزی', 'insurance-fire', 'بیمه آتش‌سوزی', 'Shield', 'bg-cyan-100 text-cyan-700', 3, 'insurance'],
  ['بیمه عمر', 'insurance-life', 'بیمه عمر و سرمایه‌گذاری', 'Shield', 'bg-cyan-100 text-cyan-700', 4, 'insurance'],
  ['بیمه مسئولیت', 'insurance-liab', 'مسئولیت حرفه‌ای', 'Shield', 'bg-cyan-100 text-cyan-700', 5, 'insurance'],
  ['بیمه درمان تکمیلی', 'insurance-health', 'درمان تکمیلی', 'Shield', 'bg-cyan-100 text-cyan-700', 6, 'insurance'],
  ['بیمه مسافرتی', 'insurance-travel', 'بیمه مسافرتی', 'Shield', 'bg-cyan-100 text-cyan-700', 7, 'insurance'],
  ['بیمه مهندسی', 'insurance-eng', 'پروژه‌های ساختمانی', 'Shield', 'bg-cyan-100 text-cyan-700', 8, 'insurance'],
  ['بیمه محصولات', 'insurance-prod', 'محصولات تولیدی', 'Shield', 'bg-cyan-100 text-cyan-700', 9, 'insurance'],
  // -- TECHNOLOGY --
  ['فناوری اطلاعات', 'technology', 'فناوری اطلاعات و ارتباطات', 'Monitor', 'bg-violet-100 text-violet-700', 8, null],
  ['توسعه نرم‌افزار', 'technology-sw', 'توسعه و برنامه‌نویسی', 'Monitor', 'bg-violet-100 text-violet-700', 1, 'technology'],
  ['طراحی وب‌سایت', 'technology-web', 'طراحی و توسعه وب', 'Monitor', 'bg-violet-100 text-violet-700', 2, 'technology'],
  ['اپلیکیشن موبایل', 'technology-mobile', 'اپلیکیشن موبایل', 'Monitor', 'bg-violet-100 text-violet-700', 3, 'technology'],
  ['میزبانی و هاستینگ', 'technology-host', 'میزبانی وب', 'Monitor', 'bg-violet-100 text-violet-700', 4, 'technology'],
  ['سرویس ابری', 'technology-cloud', 'رایانش ابری', 'Monitor', 'bg-violet-100 text-violet-700', 5, 'technology'],
  ['امنیت سایبری', 'technology-cyber', 'امنیت سایبری', 'Monitor', 'bg-violet-100 text-violet-700', 6, 'technology'],
  ['پشتیبانی فنی', 'technology-support', 'پشتیبانی فنی', 'Monitor', 'bg-violet-100 text-violet-700', 7, 'technology'],
  ['هوش مصنوعی', 'technology-ai', 'هوش مصنوعی', 'Monitor', 'bg-violet-100 text-violet-700', 8, 'technology'],
  ['بلاکچین', 'technology-block', 'بلاکچین و قرارداد هوشمند', 'Monitor', 'bg-violet-100 text-violet-700', 9, 'technology'],
  // -- GOVERNMENT --
  ['قراردادهای دولتی', 'government', 'امور اداری و دولتی', 'Building', 'bg-slate-100 text-slate-700', 9, null],
  ['مناقصه عمومی', 'government-tender', 'مناقصه عمومی', 'Building', 'bg-slate-100 text-slate-700', 1, 'government'],
  ['مزایده دولتی', 'government-auction', 'مزایده دولتی', 'Building', 'bg-slate-100 text-slate-700', 2, 'government'],
  ['خرید دولتی', 'government-purchase', 'خرید دولتی', 'Building', 'bg-slate-100 text-slate-700', 3, 'government'],
  ['پیمانکاری دولتی', 'government-contract', 'پیمانکاری دولتی', 'Building', 'bg-slate-100 text-slate-700', 4, 'government'],
  ['مشاوره دولتی', 'government-consult', 'مشاوره دولتی', 'Building', 'bg-slate-100 text-slate-700', 5, 'government'],
  ['استخدام دولتی', 'government-employ', 'استخدام کشوری', 'Building', 'bg-slate-100 text-slate-700', 6, 'government'],
  ['اساسنامه', 'government-articles', 'اساسنامه شرکت', 'Building', 'bg-slate-100 text-slate-700', 7, 'government'],
  ['حقوق سهامداران', 'government-shares', 'حقوق سهامداران', 'Building', 'bg-slate-100 text-slate-700', 8, 'government'],
  // -- INTERNATIONAL --
  ['قراردادهای بین‌المللی', 'international', 'تجارت بین‌المللی', 'Globe', 'bg-indigo-100 text-indigo-700', 10, null],
  ['واردات', 'international-import', 'واردات کالا از خارج', 'Globe', 'bg-indigo-100 text-indigo-700', 1, 'international'],
  ['صادرات', 'international-export', 'صادرات کالا', 'Globe', 'bg-indigo-100 text-indigo-700', 2, 'international'],
  ['حمل بین‌المللی', 'international-ship', 'حمل بین‌المللی', 'Globe', 'bg-indigo-100 text-indigo-700', 3, 'international'],
  ['حقوق گمرکی', 'international-customs', 'حقوق گمرکی', 'Globe', 'bg-indigo-100 text-indigo-700', 4, 'international'],
  ['نمایندگی خارجی', 'international-agency', 'نمایندگی در خارج', 'Globe', 'bg-indigo-100 text-indigo-700', 5, 'international'],
  ['همکاری بین‌المللی', 'international-coop', 'همکاری بین‌المللی', 'Globe', 'bg-indigo-100 text-indigo-700', 6, 'international'],
  ['انتقال فناوری', 'international-tech', 'انتقال فناوری', 'Globe', 'bg-indigo-100 text-indigo-700', 7, 'international'],
  ['لیزینگ بین‌المللی', 'international-lease', 'لیزینگ بین‌المللی', 'Globe', 'bg-indigo-100 text-indigo-700', 8, 'international'],
  // -- MEDICAL --
  ['قراردادهای پزشکی', 'medical', 'خدمات پزشکی و درمانی', 'Stethoscope', 'bg-red-100 text-red-700', 11, null],
  ['رضایت‌نامه پزشکی', 'medical-consent', 'رضایت‌نامه بیمار', 'Stethoscope', 'bg-red-100 text-red-700', 1, 'medical'],
  ['مسئولیت پزشکی', 'medical-liab', 'مسئولیت پزشکی', 'Stethoscope', 'bg-red-100 text-red-700', 2, 'medical'],
  ['درمان بیمار', 'medical-treat', 'درمان خدمات پزشکی', 'Stethoscope', 'bg-red-100 text-red-700', 3, 'medical'],
  ['آزمایشگاه', 'medical-lab', 'خدمات آزمایشگاهی', 'Stethoscope', 'bg-red-100 text-red-700', 4, 'medical'],
  ['داروسازی', 'medical-pharma', 'داروسازی و تأمین دارو', 'Stethoscope', 'bg-red-100 text-red-700', 5, 'medical'],
  ['بیمارستان', 'medical-hospital', 'بیمارستان', 'Stethoscope', 'bg-red-100 text-red-700', 6, 'medical'],
  ['کلینیک خصوصی', 'medical-clinic', 'کلینیک خصوصی', 'Stethoscope', 'bg-red-100 text-red-700', 7, 'medical'],
  ['دندانپزشکی', 'medical-dental', 'خدمات دندانپزشکی', 'Stethoscope', 'bg-red-100 text-red-700', 8, 'medical'],
  ['فیزیوتراپی', 'medical-physio', 'خدمات فیزیوتراپی', 'Stethoscope', 'bg-red-100 text-red-700', 9, 'medical'],
  // -- EDUCATION --
  ['قراردادهای آموزشی', 'education', 'آموزش و پژوهش', 'GraduationCap', 'bg-yellow-100 text-yellow-700', 12, null],
  ['آموزش خصوصی', 'education-private', 'آموزش خصوصی', 'GraduationCap', 'bg-yellow-100 text-yellow-700', 1, 'education'],
  ['آموزش آنلاین', 'education-online', 'آموزش آنلاین', 'GraduationCap', 'bg-yellow-100 text-yellow-700', 2, 'education'],
  ['پژوهش علمی', 'education-research', 'پژوهش و تحقیقات', 'GraduationCap', 'bg-yellow-100 text-yellow-700', 3, 'education'],
  ['انتشارات', 'education-publish', 'نشر و چاپ آثار', 'GraduationCap', 'bg-yellow-100 text-yellow-700', 4, 'education'],
  ['بورسیه', 'education-scholar', 'بورسیه و حمایت مالی', 'GraduationCap', 'bg-yellow-100 text-yellow-700', 5, 'education'],
  ['کارآموزی', 'education-intern', 'کارآموزی عملی', 'GraduationCap', 'bg-yellow-100 text-yellow-700', 6, 'education'],
  ['ترجمه', 'education-trans', 'ترجمه متون', 'GraduationCap', 'bg-yellow-100 text-yellow-700', 7, 'education'],
  ['دوره مجازی', 'education-virtual', 'دوره آموزشی مجازی', 'GraduationCap', 'bg-yellow-100 text-yellow-700', 8, 'education'],
  ['همکاری دانشگاهی', 'education-academic', 'همکاری دانشگاهی', 'GraduationCap', 'bg-yellow-100 text-yellow-700', 9, 'education'],
  // -- CONSTRUCTION --
  ['قراردادهای ساختمانی', 'construction', 'عمران و ساختمان', 'Hammer', 'bg-stone-100 text-stone-700', 13, null],
  ['پیمان ساختمانی', 'construction-build', 'پیمان ساختمانی', 'Hammer', 'bg-stone-100 text-stone-700', 1, 'construction'],
  ['نظارت ساختمانی', 'construction-superv', 'نظارت ساختمانی', 'Hammer', 'bg-stone-100 text-stone-700', 2, 'construction'],
  ['طراحی معماری', 'construction-arch', 'طراحی معماری', 'Hammer', 'bg-stone-100 text-stone-700', 3, 'construction'],
  ['تأسیسات', 'construction-facil', 'تأسیسات ساختمانی', 'Hammer', 'bg-stone-100 text-stone-700', 4, 'construction'],
  ['نقشه‌کشی', 'construction-draft', 'نقشه‌کشی', 'Hammer', 'bg-stone-100 text-stone-700', 5, 'construction'],
  ['راه‌سازی', 'construction-road', 'راه‌سازی', 'Hammer', 'bg-stone-100 text-stone-700', 6, 'construction'],
  ['پل‌سازی', 'construction-bridge', 'پل‌سازی', 'Hammer', 'bg-stone-100 text-stone-700', 7, 'construction'],
  ['برق‌کشی', 'construction-elec', 'برق‌کشی ساختمان', 'Hammer', 'bg-stone-100 text-stone-700', 8, 'construction'],
  ['شهرسازی', 'construction-urban', 'شهرسازی', 'Hammer', 'bg-stone-100 text-stone-700', 9, 'construction'],
  // -- AGRICULTURE --
  ['قراردادهای کشاورزی', 'agriculture', 'کشاورزی و دامی', 'Sprout', 'bg-lime-100 text-lime-700', 14, null],
  ['خرید فروش محصولات', 'agriculture-buy', 'خرید فروش محصولات کشاورزی', 'Sprout', 'bg-lime-100 text-lime-700', 1, 'agriculture'],
  ['اجاره زمین', 'agriculture-land', 'اجاره زمین کشاورزی', 'Sprout', 'bg-lime-100 text-lime-700', 2, 'agriculture'],
  ['مشارکت زراعی', 'agriculture-partner', 'مشارکت در کشاورزی', 'Sprout', 'bg-lime-100 text-lime-700', 3, 'agriculture'],
  ['آبیاری', 'agriculture-irrig', 'سیستم آبیاری', 'Sprout', 'bg-lime-100 text-lime-700', 4, 'agriculture'],
  ['دامپروری', 'agriculture-live', 'دامپروری', 'Sprout', 'bg-lime-100 text-lime-700', 5, 'agriculture'],
  ['پرورش ماهی', 'agriculture-fish', 'پرورش ماهی', 'Sprout', 'bg-lime-100 text-lime-700', 6, 'agriculture'],
  ['گلخانه', 'agriculture-green', 'گلخانه', 'Sprout', 'bg-lime-100 text-lime-700', 7, 'agriculture'],
  ['باغداری', 'agriculture-orchard', 'باغداری', 'Sprout', 'bg-lime-100 text-lime-700', 8, 'agriculture'],
  // -- INDUSTRIAL --
  ['قراردادهای صنعتی', 'industrial', 'صنعت و تولید', 'Factory', 'bg-zinc-100 text-zinc-700', 15, null],
  ['تولید قطعات', 'industrial-parts', 'تولید قطعات', 'Factory', 'bg-zinc-100 text-zinc-700', 1, 'industrial'],
  ['مونتاژ صنعتی', 'industrial-assembly', 'مونتاژ', 'Factory', 'bg-zinc-100 text-zinc-700', 2, 'industrial'],
  ['کارگاه صنعتی', 'industrial-workshop', 'کارگاه صنعتی', 'Factory', 'bg-zinc-100 text-zinc-700', 3, 'industrial'],
  ['کنترل کیفیت', 'industrial-quality', 'کنترل کیفیت', 'Factory', 'bg-zinc-100 text-zinc-700', 4, 'industrial'],
  ['بسته‌بندی', 'industrial-pack', 'بسته‌بندی', 'Factory', 'bg-zinc-100 text-zinc-700', 5, 'industrial'],
  ['انبارداری', 'industrial-warehouse', 'انبارداری', 'Factory', 'bg-zinc-100 text-zinc-700', 6, 'industrial'],
  ['نگهداری صنعتی', 'industrial-maint', 'نگهداری', 'Factory', 'bg-zinc-100 text-zinc-700', 7, 'industrial'],
  ['ایمنی صنعتی', 'industrial-safety', 'ایمنی صنعتی', 'Factory', 'bg-zinc-100 text-zinc-700', 8, 'industrial'],
  // -- TRANSPORT --
  ['قراردادهای حمل و نقل', 'transport', 'حمل و نقل', 'Truck', 'bg-sky-100 text-sky-700', 16, null],
  ['باربری', 'transport-freight', 'باربری و حمل بار', 'Truck', 'bg-sky-100 text-sky-700', 1, 'transport'],
  ['مسافربری', 'transport-pass', 'مسافربری', 'Truck', 'bg-sky-100 text-sky-700', 2, 'transport'],
  ['لجستیک', 'transport-logistic', 'لجستیک', 'Truck', 'bg-sky-100 text-sky-700', 3, 'transport'],
  ['حمل دریایی', 'transport-maritime', 'حمل دریایی', 'Truck', 'bg-sky-100 text-sky-700', 4, 'transport'],
  ['حمل هوایی', 'transport-air', 'حمل هوایی', 'Truck', 'bg-sky-100 text-sky-700', 5, 'transport'],
  ['ترخیص کالا', 'transport-customs', 'ترخیص کالا', 'Truck', 'bg-sky-100 text-sky-700', 6, 'transport'],
  ['پستی', 'transport-postal', 'خدمات پستی', 'Truck', 'bg-sky-100 text-sky-700', 7, 'transport'],
  // -- CULTURE --
  ['قراردادهای فرهنگی', 'culture', 'فرهنگی و هنری', 'Palette', 'bg-fuchsia-100 text-fuchsia-700', 17, null],
  ['نشر کتاب', 'culture-publish', 'نشر و چاپ', 'Palette', 'bg-fuchsia-100 text-fuchsia-700', 1, 'culture'],
  ['حق تألیف', 'culture-copyright', 'حق تألیف', 'Palette', 'bg-fuchsia-100 text-fuchsia-700', 2, 'culture'],
  ['تولید فیلم', 'culture-film', 'تولید فیلم', 'Palette', 'bg-fuchsia-100 text-fuchsia-700', 3, 'culture'],
  ['کنسرت', 'culture-concert', 'کنسرت', 'Palette', 'bg-fuchsia-100 text-fuchsia-700', 4, 'culture'],
  ['نمایشگاه هنری', 'culture-exhibit', 'نمایشگاه', 'Palette', 'bg-fuchsia-100 text-fuchsia-700', 5, 'culture'],
  ['طراحی گرافیک', 'culture-design', 'طراحی گرافیک', 'Palette', 'bg-fuchsia-100 text-fuchsia-700', 6, 'culture'],
  ['عکاسی', 'culture-photo', 'عکاسی حرفه‌ای', 'Palette', 'bg-fuchsia-100 text-fuchsia-700', 7, 'culture'],
  ['موسیقی', 'culture-music', 'موسیقی', 'Palette', 'bg-fuchsia-100 text-fuchsia-700', 8, 'culture'],
  // -- SPORTS --
  ['قراردادهای ورزشی', 'sports', 'ورزشی', 'Trophy', 'bg-rose-100 text-rose-700', 18, null],
  ['بازیکن ورزشی', 'sports-player', 'قرارداد بازیکن', 'Trophy', 'bg-rose-100 text-rose-700', 1, 'sports'],
  ['مربیگری', 'sports-coach', 'مربیگری', 'Trophy', 'bg-rose-100 text-rose-700', 2, 'sports'],
  ['اسپانسر', 'sports-sponsor', 'اسپانسر', 'Trophy', 'bg-rose-100 text-rose-700', 3, 'sports'],
  ['برگزاری مسابقات', 'sports-event', 'برگزاری مسابقات', 'Trophy', 'bg-rose-100 text-rose-700', 4, 'sports'],
  ['باشگاه ورزشی', 'sports-club', 'باشگاه', 'Trophy', 'bg-rose-100 text-rose-700', 5, 'sports'],
  ['تجهیزات ورزشی', 'sports-equip', 'تجهیزات', 'Trophy', 'bg-rose-100 text-rose-700', 6, 'sports'],
  // -- ENERGY --
  ['قراردادهای انرژی', 'energy', 'انرژی', 'Zap', 'bg-yellow-100 text-yellow-700', 19, null],
  ['نفت و گاز', 'energy-oil', 'نفت و گاز', 'Zap', 'bg-yellow-100 text-yellow-700', 1, 'energy'],
  ['پتروشیمی', 'energy-petro', 'پتروشیمی', 'Zap', 'bg-yellow-100 text-yellow-700', 2, 'energy'],
  ['برق‌آب', 'energy-util', 'برق و آب', 'Zap', 'bg-yellow-100 text-yellow-700', 3, 'energy'],
  ['انرژی خورشیدی', 'energy-solar', 'انرژی خورشیدی', 'Zap', 'bg-yellow-100 text-yellow-700', 4, 'energy'],
  ['انرژی بادی', 'energy-wind', 'انرژی بادی', 'Zap', 'bg-yellow-100 text-yellow-700', 5, 'energy'],
  ['معادن', 'energy-mining', 'معادن', 'Zap', 'bg-yellow-100 text-yellow-700', 6, 'energy'],
  // -- DIGITAL --
  ['قراردادهای دیجیتال', 'digital', 'اینترنتی و دیجیتال', 'Wifi', 'bg-purple-100 text-purple-700', 20, null],
  ['فروشگاه آنلاین', 'digital-ecom', 'فروشگاه اینترنتی', 'Wifi', 'bg-purple-100 text-purple-700', 1, 'digital'],
  ['درگاه پرداخت', 'digital-pay', 'درگاه پرداخت', 'Wifi', 'bg-purple-100 text-purple-700', 2, 'digital'],
  ['تجارت الکترونیک', 'digital-trade', 'تجارت الکترونیک', 'Wifi', 'bg-purple-100 text-purple-700', 3, 'digital'],
  ['حریم خصوصی', 'digital-privacy', 'حریم خصوصی', 'Wifi', 'bg-purple-100 text-purple-700', 4, 'digital'],
  ['پلتفرم دیجیتال', 'digital-platform', 'پلتفرم', 'Wifi', 'bg-purple-100 text-purple-700', 5, 'digital'],
  ['امضای الکترونیک', 'digital-sig', 'امضای الکترونیک', 'Wifi', 'bg-purple-100 text-purple-700', 6, 'digital'],
  ['محتوای دیجیتال', 'digital-content', 'محتوای دیجیتال', 'Wifi', 'bg-purple-100 text-purple-700', 7, 'digital'],
  ['بازی آنلاین', 'digital-game', 'بازی‌های آنلاین', 'Wifi', 'bg-purple-100 text-purple-700', 8, 'digital'],
];

const LAWS = {
  'real-estate': ['قانون مدنی ایران (مواد ۴۶۷-۴۸۰)', 'قانون ثبت اسناد و املاک', 'آیین دادرسی مدنی'],
  'commercial': ['قانون تجارت ایران', 'قانون ثبت شرکت‌ها', 'قانون مالیات بر ارزش افزوده', 'قانون حمایت از مصرف‌کننده'],
  'labor': ['قانون کار ایران', 'قانون تأمین اجتماعی', 'قانون بیمه بیکاری'],
  'family': ['قانون حمایت از خانواده', 'قانون مدنی ایران', 'آیین دادرسی مدنی'],
  'legal': ['قانون وکالت', 'آیین دادرسی مدنی', 'قانون آیین دادرسی کیفری'],
  'financial': ['قانون عملیات بانکی بدون ربا', 'قانون بازار اوراق بهادار', 'قانون مالیات‌های مستقیم'],
  'insurance': ['قانون بیمه اجباری شخص ثالث', 'قانون بیمه ایران', 'قانون تأسیس بیمه مرکزی'],
  'technology': ['قانون تجارت الکترونیک', 'قانون جرایم رایانه‌ای', 'قانون حمایت از حقوق مؤلفان'],
  'government': ['قانون برگزاری مناقصات عمومی', 'قانون استخدام کشوری', 'قانون تشکیلات دیوان عدالت اداری'],
  'international': ['قانون تجارت بین‌الملل', 'قواعد اینکوترمز ۲۰۲۰', 'قانون امور گمرکی'],
  'medical': ['قانون نظام پزشکی', 'قانون بیمه خدمات درمانی', 'قانون مسئولیت مدنی پزشکان'],
  'education': ['قانون آموزش و پرورش', 'قانون حمایت از حقوق مؤلفان'],
  'construction': ['قانون شهرداری', 'قانون نظام مهندسی', 'مقررات ملی ساختمان'],
  'agriculture': ['قانون حفظ کاربری اراضی زراعی', 'قانون توزیع عادلانه آب'],
  'industrial': ['قانون کار', 'قانون بهداشت صنعتی', 'قانون حفاظت از محیط زیست'],
  'transport': ['قانون حمل و نقل جاده‌ای', 'قانون دریایی ایران', 'قانون هواپیمایی کشوری'],
  'culture': ['قانون حمایت از حقوق مؤلفان و هنرمندان', 'قانون نشر و چاپ'],
  'sports': ['قانون تربیت بدنی', 'قانون فدراسیون‌های ورزشی'],
  'energy': ['قانون وظایف عمومی دولت در امور برق', 'قانون نفت', 'قانون انرژی‌های تجدیدپذیر'],
  'digital': ['قانون تجارت الکترونیک', 'قانون جرایم رایانه‌ای', 'قانون پول الکترونیک'],
};

const DIFFS = ['GENERAL', 'SPECIALIZED', 'ADVANCED'];
const DIFF_LABELS = { GENERAL: 'عمومی', SPECIALIZED: 'تخصصی', ADVANCED: 'پیشرفته' };

function getParentSlug(slug) {
  return catData.find(c => c[1] === slug)?.[6] || null;
}

function makeHTML(title, preamble, parties, terms, obls, termClauses, dispute, sigs) {
  const tH = terms.map((t, i) => `<div class="mb-3"><p class="font-bold">ماده ${i+1}: ${t}</p></div>`).join('\n');
  const oH = obls.map((o, i) => `<div class="mb-2"><p>${i+1}. ${o}</p></div>`).join('\n');
  const tCH = termClauses.map((c, i) => `<div class="mb-2"><p>${i+1}. ${c}</p></div>`).join('\n');
  return `<div class="contract-template"><h2 class="text-xl font-bold text-center mb-6 border-b pb-3">${title}</h2><section class="mb-6"><h3 class="font-bold mb-2">مقدمه</h3><p>${preamble}</p></section><section class="mb-6"><h3 class="font-bold mb-2">طرفین قرارداد</h3><p>${parties}</p></section><section class="mb-6"><h3 class="font-bold mb-2">مفاد قرارداد</h3>${tH}</section><section class="mb-6"><h3 class="font-bold mb-2">تعهدات</h3>${oH}</section><section class="mb-6"><h3 class="font-bold mb-2">فسخ</h3>${tCH}</section><section class="mb-6"><h3 class="font-bold mb-2">حل اختلاف</h3><p>${dispute}</p></section><section class="mt-8 border-t pt-4"><h3 class="font-bold mb-4">امضا</h3><p>${sigs}</p></section></div>`;
}

// Speed up SQLite
try { await db.$executeRaw('PRAGMA synchronous = OFF'); } catch {}
try { await db.$executeRaw('PRAGMA journal_mode = WAL'); } catch {}

// ============ CREATE CATEGORIES (roots first, then children) ============
console.log('Creating categories...');
const catMap = new Map(); // slug -> id

// First pass: root categories
for (const c of catData) {
  if (c[6] !== null) continue; // skip children
  const cat = await db.contractCategory.create({
    data: { name: c[0], slug: c[1], description: c[2], icon: c[3], color: c[4], order: c[5] }
  });
  catMap.set(c[1], cat.id);
}

// Second pass: child categories
for (const c of catData) {
  if (c[6] === null) continue; // skip roots
  const parentId = catMap.get(c[6]);
  if (!parentId) continue;
  const cat = await db.contractCategory.create({
    data: { name: c[0], slug: c[1], description: c[2], icon: c[3], color: c[4], order: c[5], parentId }
  });
  catMap.set(c[1], cat.id);
}
console.log(`Created ${catMap.size} categories.`);

// ============ GENERATE CONTRACTS ============
console.log('Generating and inserting contracts...');
let count = 0;

for (const c of catData) {
  if (c[6] === null) continue; // only children get contracts
  const catId = catMap.get(c[1]);
  if (!catId) continue;

  // Determine parent slug for laws lookup
  const parentSlug = c[6]; // already the slug of the parent
  const laws = LAWS[parentSlug] || ['قانون مدنی ایران'];

  const n = 5 + Math.floor(Math.random() * 4); // 5-8 contracts per subcategory

  for (let i = 0; i < n; i++) {
    const diff = DIFFS[i % DIFFS.length];
    const dl = DIFF_LABELS[diff];
    const title = `${c[0]} - نمونه ${i+1} (${dl})`;
    const preamble = `این قرارداد بر اساس ${laws[0]} و سایر قوانین مربوطه بین طرفین منعقد می‌گردد. طرفین با آگاهی کامل از حقوق و تعهدات خود توافق نموده‌اند. این قرارداد در سطح ${dl} تنظیم شده است و شامل کلیه شرایط و مقررات لازم می‌باشد.`;
    const parties = `الف) طرف اول: [نام] به شماره ملی [کد ملی] و آدرس [آدرس]. ب) طرف دوم: [نام] به شماره ملی [کد ملی] و آدرس [آدرس].`;
    const terms = [
      `تعریف: این قرارداد ${title} بوده و شامل ${c[2]} می‌باشد.`,
      `مدت: از تاریخ [تاریخ] لغایت [تاریخ] معتبر خواهد بود.`,
      `مبلغ: مبلغ [مبلغ] ریال تعیین می‌گردد.`,
      `پرداخت: طبق توافق طرفین و در مواعد مقرر.`,
      `اجرا: طرفین موظف به رعایت مفاد قرارداد هستند.`,
      `تمدید: قابل تمدید در صورت توافق طرفین.`,
      `تغییرات: کتباً و با امضای طرفین.`,
    ];
    const obligations = [
      'رعایت مفاد قرارداد',
      'ارائه خدمات با کیفیت مناسب',
      'افزودن اطلاعات لازم',
      'رعایت قوانین مرتبط',
      'مذاکره برای حل اختلاف',
    ];
    const termination = [
      'تخلف از مفاد',
      'ورشکستگی طرفین',
      'فورس ماژور',
      'ابلاغ کتبی فسخ',
    ];
    const dispute = `اختلافات ابتدا از طریق مذاکره و در صورت عدم توافق، دادگاه صالحه بر اساس ${laws[0]} رسیدگی می‌نماید.`;
    const sigs = `امضا طرف اول: ___\nامضا طرف دوم: ___\nتاریخ: ___\nمحل: ___`;
    const content = makeHTML(title, preamble, parties, terms, obligations, termination, dispute, sigs);

    await db.contract.create({
      data: {
        title,
        slug: `${c[1]}-${i}`,
        description: c[2],
        content,
        summary: `${title}. بر اساس ${laws[0]} تنظیم شده است.`,
        categoryId: catId,
        tags: JSON.stringify([c[0], dl, laws[0].split('(')[0].trim()]),
        applicableLaws: JSON.stringify(laws),
        difficulty: diff,
        isPublished: true,
      }
    });
    count++;
  }

  if (count % 50 === 0) console.log(`  Progress: ${count} contracts...`);
}

console.log(`\nDone! Created ${count} contracts across ${catMap.size} categories.`);
await db.$disconnect();
