// Seed data for Iranian legal contracts
// Generated contract templates with realistic Persian legal content

export interface SeedCategory {
  name: string;
  slug: string;
  description: string;
  icon: string; // lucide icon name
  color: string; // tailwind color class
  order: number;
  parentId?: string;
}

export interface SeedContract {
  title: string;
  slug: string;
  description: string;
  content: string; // Full HTML contract template text in Persian
  summary: string; // 2-3 sentence summary
  categorySlug: string; // reference to category slug
  tags: string[];
  applicableLaws: string[];
  difficulty: 'GENERAL' | 'SPECIALIZED' | 'ADVANCED';
}

// =============================================================================
// CATEGORIES
// =============================================================================

export const contractCategories: SeedCategory[] = [
  // ---- 1. قراردادهای ملکی ----
  { name: 'قراردادهای ملکی', slug: 'real-estate', description: 'قراردادهای مربوط به املاک و مستغلات شامل خرید، فروش، اجاره و سایر معاملات ملکی', icon: 'Building2', color: 'bg-amber-100 text-amber-700', order: 1 },
  { name: 'خرید و فروش ملک', slug: 'real-estate-buy-sell', description: 'قراردادهای خرید و فروش انواع املاک شامل آپارتمان، زمین، ویلا و مغازه', icon: 'Building2', color: 'bg-amber-100 text-amber-700', order: 1, parentId: 'real-estate' },
  { name: 'اجاره و استیجار', slug: 'real-estate-rental', description: 'قراردادهای اجاره و استیجار املاک مسکونی و تجاری', icon: 'Building2', color: 'bg-amber-100 text-amber-700', order: 2, parentId: 'real-estate' },
  { name: 'وکالت ملکی', slug: 'real-estate-power-of-attorney', description: 'قراردادهای وکالت در امور ملکی', icon: 'Building2', color: 'bg-amber-100 text-amber-700', order: 3, parentId: 'real-estate' },
  { name: 'پیش‌فروش ساختمان', slug: 'real-estate-presale', description: 'قراردادهای پیش‌فروش واحدهای ساختمانی', icon: 'Building2', color: 'bg-amber-100 text-amber-700', order: 4, parentId: 'real-estate' },
  { name: 'مشارکت در ساخت', slug: 'real-estate-construction-partnership', description: 'قراردادهای مشارکت مالک و سازنده در احداث ساختمان', icon: 'Building2', color: 'bg-amber-100 text-amber-700', order: 5, parentId: 'real-estate' },
  { name: 'رهن ملکی', slug: 'real-estate-mortgage', description: 'قراردادهای رهن و وثیقه‌گذاری املاک', icon: 'Building2', color: 'bg-amber-100 text-amber-700', order: 6, parentId: 'real-estate' },
  { name: 'صلح و مصالحه ملکی', slug: 'real-estate-settlement', description: 'قراردادهای صلح و مصالحه در دعاوی ملکی', icon: 'Building2', color: 'bg-amber-100 text-amber-700', order: 7, parentId: 'real-estate' },
  { name: 'معاوضه ملکی', slug: 'real-estate-exchange', description: 'قراردادهای معاوضه و تبادل املاک', icon: 'Building2', color: 'bg-amber-100 text-amber-700', order: 8, parentId: 'real-estate' },
  { name: 'هبه ملک', slug: 'real-estate-gift', description: 'قراردادهای هبه و بخشش املاک', icon: 'Building2', color: 'bg-amber-100 text-amber-700', order: 9, parentId: 'real-estate' },
  { name: 'وصیت ملکی', slug: 'real-estate-will', description: 'قراردادهای وصیت در خصوص املاک', icon: 'Building2', color: 'bg-amber-100 text-amber-700', order: 10, parentId: 'real-estate' },
  { name: 'اقرار ملکی', slug: 'real-estate-declaration', description: 'قراردادهای اقرار و اعتراف حقوق ملکی', icon: 'Building2', color: 'bg-amber-100 text-amber-700', order: 11, parentId: 'real-estate' },
  { name: 'مزایده ملکی', slug: 'real-estate-auction', description: 'قراردادهای مزایده و مناقصه املاک', icon: 'Building2', color: 'bg-amber-100 text-amber-700', order: 12, parentId: 'real-estate' },

  // ---- 2. قراردادهای تجاری ----
  { name: 'قراردادهای تجاری', slug: 'commercial', description: 'قراردادهای مربوط به فعالیت‌های تجاری و بازرگانی', icon: 'Store', color: 'bg-blue-100 text-blue-700', order: 2 },
  { name: 'خرید و فروش کالا', slug: 'commercial-buy-sell', description: 'قراردادهای خرید و فروش انواع کالا و محصولات تجاری', icon: 'Store', color: 'bg-blue-100 text-blue-700', order: 1, parentId: 'commercial' },
  { name: 'نمایندگی تجاری', slug: 'commercial-agency', description: 'قراردادهای نمایندگی و عاملیت تجاری', icon: 'Store', color: 'bg-blue-100 text-blue-700', order: 2, parentId: 'commercial' },
  { name: 'توزیع و پخش', slug: 'commercial-distribution', description: 'قراردادهای توزیع و پخش محصولات', icon: 'Store', color: 'bg-blue-100 text-blue-700', order: 3, parentId: 'commercial' },
  { name: 'آژانس بازرگانی', slug: 'commercial-trading-agency', description: 'قراردادهای آژانس بازرگانی و واسطه‌گری', icon: 'Store', color: 'bg-blue-100 text-blue-700', order: 4, parentId: 'commercial' },
  { name: 'فرانشیز', slug: 'commercial-franchise', description: 'قراردادهای فرانشیز و امتیاز تجاری', icon: 'Store', color: 'bg-blue-100 text-blue-700', order: 5, parentId: 'commercial' },
  { name: 'خرید نسیه', slug: 'commercial-credit-purchase', description: 'قراردادهای خرید نسیه و اعتباری', icon: 'Store', color: 'bg-blue-100 text-blue-700', order: 6, parentId: 'commercial' },
  { name: 'اسناد تجاری', slug: 'commercial-instruments', description: 'قراردادهای مربوط به اسناد تجاری و باربر', icon: 'Store', color: 'bg-blue-100 text-blue-700', order: 7, parentId: 'commercial' },
  { name: 'حمل بار تجاری', slug: 'commercial-freight', description: 'قراردادهای حمل بار و لجستیک تجاری', icon: 'Store', color: 'bg-blue-100 text-blue-700', order: 8, parentId: 'commercial' },
  { name: 'مشارکت تجاری', slug: 'commercial-partnership', description: 'قراردادهای مشارکت تجاری و شراکت', icon: 'Store', color: 'bg-blue-100 text-blue-700', order: 9, parentId: 'commercial' },
  { name: 'حق اختراع تجاری', slug: 'commercial-patent', description: 'قراردادهای ثبت و انتقال حق اختراع', icon: 'Store', color: 'bg-blue-100 text-blue-700', order: 10, parentId: 'commercial' },
  { name: 'بازاریابی و تبلیغات', slug: 'commercial-marketing', description: 'قراردادهای بازاریابی و تبلیغات تجاری', icon: 'Store', color: 'bg-blue-100 text-blue-700', order: 11, parentId: 'commercial' },
  { name: 'جلسات تجاری', slug: 'commercial-meetings', description: 'قراردادهای برگزاری جلسات و رویدادهای تجاری', icon: 'Store', color: 'bg-blue-100 text-blue-700', order: 12, parentId: 'commercial' },

  // ---- 3. قراردادهای کار و تأمین اجتماعی ----
  { name: 'قراردادهای کار و تأمین اجتماعی', slug: 'labor', description: 'قراردادهای مربوط به روابط کارگر و کارفرما و تأمین اجتماعی', icon: 'HardHat', color: 'bg-orange-100 text-orange-700', order: 3 },
  { name: 'قرارداد کار دائم', slug: 'labor-permanent', description: 'قرارداد کار با مدت نامعین و دائم', icon: 'HardHat', color: 'bg-orange-100 text-orange-700', order: 1, parentId: 'labor' },
  { name: 'قرارداد کار موقت', slug: 'labor-temporary', description: 'قرارداد کار با مدت معین و موقت', icon: 'HardHat', color: 'bg-orange-100 text-orange-700', order: 2, parentId: 'labor' },
  { name: 'قرارداد کار آزمایشی', slug: 'labor-probation', description: 'قرارداد کار دوره آزمایشی', icon: 'HardHat', color: 'bg-orange-100 text-orange-700', order: 3, parentId: 'labor' },
  { name: 'قرارداد پیمانکاری', slug: 'labor-contracting', description: 'قرارداد پیمانکاری و انجام کار مشخص', icon: 'HardHat', color: 'bg-orange-100 text-orange-700', order: 4, parentId: 'labor' },
  { name: 'قرارداد مشاوره کاری', slug: 'labor-consulting', description: 'قرارداد مشاوره و خدمات تخصصی کاری', icon: 'HardHat', color: 'bg-orange-100 text-orange-700', order: 5, parentId: 'labor' },
  { name: 'قرارداد آموزش شاگردآموزی', slug: 'labor-apprenticeship', description: 'قرارداد آموزش و شاگردآموزی حرفه‌ای', icon: 'HardHat', color: 'bg-orange-100 text-orange-700', order: 6, parentId: 'labor' },
  { name: 'قرارداد کار تمام وقت', slug: 'labor-fulltime', description: 'قرارداد کار تمام وقت و ساعات کامل', icon: 'HardHat', color: 'bg-orange-100 text-orange-700', order: 7, parentId: 'labor' },
  { name: 'قرارداد کار پاره وقت', slug: 'labor-parttime', description: 'قرارداد کار پاره وقت و ساعات کاهش‌یافته', icon: 'HardHat', color: 'bg-orange-100 text-orange-700', order: 8, parentId: 'labor' },
  { name: 'قرارداد کار دورکاری', slug: 'labor-remote', description: 'قرارداد کار دورکاری و از راه دور', icon: 'HardHat', color: 'bg-orange-100 text-orange-700', order: 9, parentId: 'labor' },
  { name: 'قرارداد اخراج و تسویه حساب', slug: 'labor-termination', description: 'قراردادهای مربوط به پایان کار و تسویه حقوق', icon: 'HardHat', color: 'bg-orange-100 text-orange-700', order: 10, parentId: 'labor' },
  { name: 'قرارداد بیمه بیکاری', slug: 'labor-unemployment-insurance', description: 'قراردادهای بیمه بیکاری و حمایت اجتماعی', icon: 'HardHat', color: 'bg-orange-100 text-orange-700', order: 11, parentId: 'labor' },
  { name: 'قرارداد بازنشستگی', slug: 'labor-retirement', description: 'قراردادهای بازنشستگی و مستمری', icon: 'HardHat', color: 'bg-orange-100 text-orange-700', order: 12, parentId: 'labor' },

  // ---- 4. قراردادهای خانواده ----
  { name: 'قراردادهای خانواده', slug: 'family', description: 'قراردادهای مربوط به مسائل خانوادگی و حقوق خانواده', icon: 'Heart', color: 'bg-pink-100 text-pink-700', order: 4 },
  { name: 'عقدنامه ازدواج', slug: 'family-marriage', description: 'قرارداد عقدنامه و ازدواج دائم و موقت', icon: 'Heart', color: 'bg-pink-100 text-pink-700', order: 1, parentId: 'family' },
  { name: 'مهریه', slug: 'family-mahriyeh', description: 'قراردادهای مربوط به مهریه و تعیین آن', icon: 'Heart', color: 'bg-pink-100 text-pink-700', order: 2, parentId: 'family' },
  { name: 'نفقه', slug: 'family-nafagheh', description: 'قراردادهای مربوط به نفقه و وظیفه', icon: 'Heart', color: 'bg-pink-100 text-pink-700', order: 3, parentId: 'family' },
  { name: 'حضانت فرزند', slug: 'family-custody', description: 'قراردادهای مربوط به حضانت و سرپرستی فرزندان', icon: 'Heart', color: 'bg-pink-100 text-pink-700', order: 4, parentId: 'family' },
  { name: 'طلاق توافقی', slug: 'family-divorce-mutual', description: 'قرارداد طلاق توافقی و شرایط آن', icon: 'Heart', color: 'bg-pink-100 text-pink-700', order: 5, parentId: 'family' },
  { name: 'طلاق از طرف زن', slug: 'family-divorce-wife', description: 'قرارداد طلاق از طرف زن و شرایط آن', icon: 'Heart', color: 'bg-pink-100 text-pink-700', order: 6, parentId: 'family' },
  { name: 'اجرت‌المثل', slug: 'family-ujrat-al-misl', description: 'قراردادهای مربوط به اجرت‌المثل کارهای زن', icon: 'Heart', color: 'bg-pink-100 text-pink-700', order: 7, parentId: 'family' },
  { name: 'وصیت‌نامه', slug: 'family-will', description: 'قراردادهای وصیت‌نامه خانوادگی', icon: 'Heart', color: 'bg-pink-100 text-pink-700', order: 8, parentId: 'family' },
  { name: 'حصر وراثت', slug: 'family-inheritance', description: 'قراردادهای مربوط به ارث و وراثت', icon: 'Heart', color: 'bg-pink-100 text-pink-700', order: 9, parentId: 'family' },
  { name: 'فسخ نکاح', slug: 'family-annulment', description: 'قراردادهای فسخ نکاح و باطل کردن عقد', icon: 'Heart', color: 'bg-pink-100 text-pink-700', order: 10, parentId: 'family' },
  { name: 'مهرالمثل', slug: 'family-mahr-al-misl', description: 'قراردادهای مربوط به مهرالمثل و تعیین آن', icon: 'Heart', color: 'bg-pink-100 text-pink-700', order: 11, parentId: 'family' },
  { name: 'تنظیمات ازدواج', slug: 'family-marriage-agreement', description: 'قراردادهای تنظیمات و شروط ضمن عقد ازدواج', icon: 'Heart', color: 'bg-pink-100 text-pink-700', order: 12, parentId: 'family' },
  { name: 'رضایت والدین', slug: 'family-parental-consent', description: 'قراردادهای رضایت و اجازه والدین', icon: 'Heart', color: 'bg-pink-100 text-pink-700', order: 13, parentId: 'family' },
  { name: 'دادگاه خانواده', slug: 'family-court', description: 'قراردادهای مربوط به دعاوی دادگاه خانواده', icon: 'Heart', color: 'bg-pink-100 text-pink-700', order: 14, parentId: 'family' },
  { name: 'حکم صلاحیت', slug: 'family-jurisdiction', description: 'قراردادهای مربوط به حکم صلاحیت و مرجع رسیدگی', icon: 'Heart', color: 'bg-pink-100 text-pink-700', order: 15, parentId: 'family' },

  // ---- 5. قراردادهای وکالت و مشاوره حقوقی ----
  { name: 'قراردادهای وکالت و مشاوره حقوقی', slug: 'legal', description: 'قراردادهای وکالت در دادگاه و مشاوره حقوقی', icon: 'Scale', color: 'bg-emerald-100 text-emerald-700', order: 5 },
  { name: 'وکالت در دادگاه', slug: 'legal-court-attorney', description: 'قرارداد وکالت در دعاوی دادگاهی', icon: 'Scale', color: 'bg-emerald-100 text-emerald-700', order: 1, parentId: 'legal' },
  { name: 'وکالت غیردادگاهی', slug: 'legal-non-court-attorney', description: 'قرارداد وکالت در امور غیردادگاهی', icon: 'Scale', color: 'bg-emerald-100 text-emerald-700', order: 2, parentId: 'legal' },
  { name: 'مشاوره حقوقی', slug: 'legal-consulting', description: 'قرارداد مشاوره حقوقی و ارائه نظر کارشناسی', icon: 'Scale', color: 'bg-emerald-100 text-emerald-700', order: 3, parentId: 'legal' },
  { name: 'داوری', slug: 'legal-arbitration', description: 'قرارداد داوری و حل اختلاف', icon: 'Scale', color: 'bg-emerald-100 text-emerald-700', order: 4, parentId: 'legal' },
  { name: 'مصالحه', slug: 'legal-reconciliation', description: 'قرارداد مصالحه و سازش بین طرفین', icon: 'Scale', color: 'bg-emerald-100 text-emerald-700', order: 5, parentId: 'legal' },
  { name: 'وکالت در لایحه‌خوانی', slug: 'legal-petition', description: 'قرارداد وکالت در تهیه و تقدیم لایحه', icon: 'Scale', color: 'bg-emerald-100 text-emerald-700', order: 6, parentId: 'legal' },
  { name: 'وکالت تجدیدنظر', slug: 'legal-appeal', description: 'قرارداد وکالت در دادگاه تجدیدنظر', icon: 'Scale', color: 'bg-emerald-100 text-emerald-700', order: 7, parentId: 'legal' },
  { name: 'وکالت دیوان عالی', slug: 'legal-supreme-court', description: 'قرارداد وکالت در دیوان عالی کشور', icon: 'Scale', color: 'bg-emerald-100 text-emerald-700', order: 8, parentId: 'legal' },
  { name: 'وکالت اجرای حکم', slug: 'legal-execution', description: 'قرارداد وکالت در اجرای احکام دادگاه', icon: 'Scale', color: 'bg-emerald-100 text-emerald-700', order: 9, parentId: 'legal' },
  { name: 'مشاوره مالیاتی', slug: 'legal-tax-consulting', description: 'قرارداد مشاوره مالیاتی و بررسی اوراق', icon: 'Scale', color: 'bg-emerald-100 text-emerald-700', order: 10, parentId: 'legal' },
  { name: 'وکالت در ثبت شرکت', slug: 'legal-company-registration', description: 'قرارداد وکالت در ثبت شرکت‌ها', icon: 'Scale', color: 'bg-emerald-100 text-emerald-700', order: 11, parentId: 'legal' },
  { name: 'وکالت کیفری', slug: 'legal-criminal', description: 'قرارداد وکالت در دعاوی کیفری', icon: 'Scale', color: 'bg-emerald-100 text-emerald-700', order: 12, parentId: 'legal' },

  // ---- 6. قراردادهای مالی و بانکی ----
  { name: 'قراردادهای مالی و بانکی', slug: 'financial', description: 'قراردادهای مربوط به امور مالی، بانکی و سرمایه‌گذاری', icon: 'Landmark', color: 'bg-green-100 text-green-700', order: 6 },
  { name: 'وام بانکی', slug: 'financial-loan', description: 'قراردادهای دریافت وام و تسهیلات بانکی', icon: 'Landmark', color: 'bg-green-100 text-green-700', order: 1, parentId: 'financial' },
  { name: 'سپرده بانکی', slug: 'financial-deposit', description: 'قراردادهای سپرده‌گذاری بانکی', icon: 'Landmark', color: 'bg-green-100 text-green-700', order: 2, parentId: 'financial' },
  { name: 'ضمانت بانکی', slug: 'financial-guarantee', description: 'قراردادهای ضمانت و تضمین بانکی', icon: 'Landmark', color: 'bg-green-100 text-green-700', order: 3, parentId: 'financial' },
  { name: 'اعتبار اسنادی', slug: 'financial-letter-of-credit', description: 'قراردادهای اعتبار اسنادی و ال‌سی', icon: 'Landmark', color: 'bg-green-100 text-green-700', order: 4, parentId: 'financial' },
  { name: 'حواله بانکی', slug: 'financial-transfer', description: 'قراردادهای حواله و انتقال وجه بانکی', icon: 'Landmark', color: 'bg-green-100 text-green-700', order: 5, parentId: 'financial' },
  { name: 'گروگذاشتن سهام', slug: 'financial-share-pledge', description: 'قراردادهای گروگذاشتن و وثیقه سهام', icon: 'Landmark', color: 'bg-green-100 text-green-700', order: 6, parentId: 'financial' },
  { name: 'رهن بانکی', slug: 'financial-mortgage', description: 'قراردادهای رهن املاک نزد بانک', icon: 'Landmark', color: 'bg-green-100 text-green-700', order: 7, parentId: 'financial' },
  { name: 'فکتورینگ', slug: 'financial-factoring', description: 'قراردادهای فکتورینگ و خرید مطالبات', icon: 'Landmark', color: 'bg-green-100 text-green-700', order: 8, parentId: 'financial' },
  { name: 'لیزینگ', slug: 'financial-leasing', description: 'قراردادهای لیزینگ و اجاره به شرط تملیک', icon: 'Landmark', color: 'bg-green-100 text-green-700', order: 9, parentId: 'financial' },
  { name: 'فروش اقساطی', slug: 'financial-installment-sale', description: 'قراردادهای فروش اقساطی و اعتباری', icon: 'Landmark', color: 'bg-green-100 text-green-700', order: 10, parentId: 'financial' },
  { name: 'امانات بانکی', slug: 'financial-safe-deposit', description: 'قراردادهای امانات و گاوصندوق بانکی', icon: 'Landmark', color: 'bg-green-100 text-green-700', order: 11, parentId: 'financial' },
  { name: 'صندوق سرمایه‌گذاری', slug: 'financial-investment-fund', description: 'قراردادهای سرمایه‌گذاری در صندوق‌ها', icon: 'Landmark', color: 'bg-green-100 text-green-700', order: 12, parentId: 'financial' },

  // ---- 7. قراردادهای بیمه ----
  { name: 'قراردادهای بیمه', slug: 'insurance', description: 'قراردادهای مربوط به انواع بیمه‌نامه‌ها', icon: 'Shield', color: 'bg-cyan-100 text-cyan-700', order: 7 },
  { name: 'بیمه بدنه', slug: 'insurance-body', description: 'بیمه بدنه خودرو و وسایل نقلیه', icon: 'Shield', color: 'bg-cyan-100 text-cyan-700', order: 1, parentId: 'insurance' },
  { name: 'بیمه شخص ثالث', slug: 'insurance-third-party', description: 'بیمه مسئولیت مدنی شخص ثالث', icon: 'Shield', color: 'bg-cyan-100 text-cyan-700', order: 2, parentId: 'insurance' },
  { name: 'بیمه آتش‌سوزی', slug: 'insurance-fire', description: 'بیمه آتش‌سوزی و حوادث مرتبط', icon: 'Shield', color: 'bg-cyan-100 text-cyan-700', order: 3, parentId: 'insurance' },
  { name: 'بیمه عمر', slug: 'insurance-life', description: 'بیمه عمر و سرمایه‌گذاری', icon: 'Shield', color: 'bg-cyan-100 text-cyan-700', order: 4, parentId: 'insurance' },
  { name: 'بیمه مسئولیت', slug: 'insurance-liability', description: 'بیمه مسئولیت حرفه‌ای و عمومی', icon: 'Shield', color: 'bg-cyan-100 text-cyan-700', order: 5, parentId: 'insurance' },
  { name: 'بیمه درمان تکمیلی', slug: 'insurance-health-supplement', description: 'بیمه درمان تکمیلی و مکمل', icon: 'Shield', color: 'bg-cyan-100 text-cyan-700', order: 6, parentId: 'insurance' },
  { name: 'بیمه مسافرتی', slug: 'insurance-travel', description: 'بیمه مسافرتی داخلی و خارجی', icon: 'Shield', color: 'bg-cyan-100 text-cyan-700', order: 7, parentId: 'insurance' },
  { name: 'بیمه مهندسی', slug: 'insurance-engineering', description: 'بیمه مهندسی و پروژه‌های ساختمانی', icon: 'Shield', color: 'bg-cyan-100 text-cyan-700', order: 8, parentId: 'insurance' },
  { name: 'بیمه محصولات', slug: 'insurance-products', description: 'بیمه محصولات و مسئولیت تولیدکننده', icon: 'Shield', color: 'bg-cyan-100 text-cyan-700', order: 9, parentId: 'insurance' },
  { name: 'بیمه ناوگان', slug: 'insurance-fleet', description: 'بیمه ناوگان حمل و نقل', icon: 'Shield', color: 'bg-cyan-100 text-cyan-700', order: 10, parentId: 'insurance' },
  { name: 'بیمه زلزله', slug: 'insurance-earthquake', description: 'بیمه زلزله و سوانح طبیعی', icon: 'Shield', color: 'bg-cyan-100 text-cyan-700', order: 11, parentId: 'insurance' },
  { name: 'بیمه کشاورزی', slug: 'insurance-agriculture', description: 'بیمه محصولات و فعالیت‌های کشاورزی', icon: 'Shield', color: 'bg-cyan-100 text-cyan-700', order: 12, parentId: 'insurance' },

  // ---- 8. قراردادهای فناوری اطلاعات ----
  { name: 'قراردادهای فناوری اطلاعات', slug: 'technology', description: 'قراردادهای مربوط به فناوری اطلاعات و ارتباطات', icon: 'Monitor', color: 'bg-violet-100 text-violet-700', order: 8 },
  { name: 'توسعه نرم‌افزار', slug: 'technology-software-development', description: 'قراردادهای توسعه و برنامه‌نویسی نرم‌افزار', icon: 'Monitor', color: 'bg-violet-100 text-violet-700', order: 1, parentId: 'technology' },
  { name: 'طراحی وب‌سایت', slug: 'technology-web-design', description: 'قراردادهای طراحی و توسعه وب‌سایت', icon: 'Monitor', color: 'bg-violet-100 text-violet-700', order: 2, parentId: 'technology' },
  { name: 'اپلیکیشن موبایل', slug: 'technology-mobile-app', description: 'قراردادهای طراحی و توسعه اپلیکیشن موبایل', icon: 'Monitor', color: 'bg-violet-100 text-violet-700', order: 3, parentId: 'technology' },
  { name: 'میزبانی و هاستینگ', slug: 'technology-hosting', description: 'قراردادهای میزبانی و هاستینگ وب', icon: 'Monitor', color: 'bg-violet-100 text-violet-700', order: 4, parentId: 'technology' },
  { name: 'سرویس ابری', slug: 'technology-cloud', description: 'قراردادهای خدمات رایانش ابری', icon: 'Monitor', color: 'bg-violet-100 text-violet-700', order: 5, parentId: 'technology' },
  { name: 'امنیت سایبری', slug: 'technology-cybersecurity', description: 'قراردادهای امنیت سایبری و حفاظت اطلاعات', icon: 'Monitor', color: 'bg-violet-100 text-violet-700', order: 6, parentId: 'technology' },
  { name: 'پشتیبانی فنی', slug: 'technology-support', description: 'قراردادهای پشتیبانی فنی و نگهداری', icon: 'Monitor', color: 'bg-violet-100 text-violet-700', order: 7, parentId: 'technology' },
  { name: 'شبکه و زیرساخت', slug: 'technology-network', description: 'قراردادهای راه‌اندازی و نگهداری شبکه', icon: 'Monitor', color: 'bg-violet-100 text-violet-700', order: 8, parentId: 'technology' },
  { name: 'دیتاسنتر', slug: 'technology-datacenter', description: 'قراردادهای دیتاسنتر و سرور', icon: 'Monitor', color: 'bg-violet-100 text-violet-700', order: 9, parentId: 'technology' },
  { name: 'هوش مصنوعی', slug: 'technology-ai', description: 'قراردادهای توسعه و استفاده از هوش مصنوعی', icon: 'Monitor', color: 'bg-violet-100 text-violet-700', order: 10, parentId: 'technology' },
  { name: 'اینترنت اشیاء', slug: 'technology-iot', description: 'قراردادهای اینترنت اشیاء و سیستم‌های هوشمند', icon: 'Monitor', color: 'bg-violet-100 text-violet-700', order: 11, parentId: 'technology' },
  { name: 'بلاکچین', slug: 'technology-blockchain', description: 'قراردادهای فناوری بلاکچین و قراردادهای هوشمند', icon: 'Monitor', color: 'bg-violet-100 text-violet-700', order: 12, parentId: 'technology' },
  { name: 'داده‌کاوی', slug: 'technology-data-mining', description: 'قراردادهای داده‌کاوی و تحلیل داده', icon: 'Monitor', color: 'bg-violet-100 text-violet-700', order: 13, parentId: 'technology' },
  { name: 'سیستم مدیریت ارتباط مشتری', slug: 'technology-crm', description: 'قراردادهای پیاده‌سازی و نگهداری CRM', icon: 'Monitor', color: 'bg-violet-100 text-violet-700', order: 14, parentId: 'technology' },

  // ---- 9. قراردادهای اداری و دولتی ----
  { name: 'قراردادهای اداری و دولتی', slug: 'government', description: 'قراردادهای مربوط به امور اداری و دولتی', icon: 'Building', color: 'bg-slate-100 text-slate-700', order: 9 },
  { name: 'مناقصه عمومی', slug: 'government-tender', description: 'قراردادهای مناقصه عمومی و مزایدات دولتی', icon: 'Building', color: 'bg-slate-100 text-slate-700', order: 1, parentId: 'government' },
  { name: 'مزایده دولتی', slug: 'government-auction', description: 'قراردادهای مزایده دولتی و فروش اموال', icon: 'Building', color: 'bg-slate-100 text-slate-700', order: 2, parentId: 'government' },
  { name: 'خرید دولتی', slug: 'government-purchase', description: 'قراردادهای خرید دولتی و تأمین نیازها', icon: 'Building', color: 'bg-slate-100 text-slate-700', order: 3, parentId: 'government' },
  { name: 'پیمانکاری دولتی', slug: 'government-contracting', description: 'قراردادهای پیمانکاری پروژه‌های دولتی', icon: 'Building', color: 'bg-slate-100 text-slate-700', order: 4, parentId: 'government' },
  { name: 'مشاوره دولتی', slug: 'government-consulting', description: 'قراردادهای مشاوره و خدمات فنی دولتی', icon: 'Building', color: 'bg-slate-100 text-slate-700', order: 5, parentId: 'government' },
  { name: 'خدماتی دولتی', slug: 'government-services', description: 'قراردادهای خدمات عمومی و دولتی', icon: 'Building', color: 'bg-slate-100 text-slate-700', order: 6, parentId: 'government' },
  { name: 'استخدام دولتی', slug: 'government-employment', description: 'قراردادهای استخدام و کارگزینی دولتی', icon: 'Building', color: 'bg-slate-100 text-slate-700', order: 7, parentId: 'government' },
  { name: 'حقوق کارمندان', slug: 'government-employee-rights', description: 'قراردادهای مربوط به حقوق و مزایای کارمندان', icon: 'Building', color: 'bg-slate-100 text-slate-700', order: 8, parentId: 'government' },
  { name: 'بازنشستگی دولتی', slug: 'government-retirement', description: 'قراردادهای بازنشستگی و مستمری دولتی', icon: 'Building', color: 'bg-slate-100 text-slate-700', order: 9, parentId: 'government' },
  { name: 'هیئت مدیره', slug: 'government-board-of-directors', description: 'قراردادهای مربوط به هیئت مدیره و اداره شرکت‌ها', icon: 'Building', color: 'bg-slate-100 text-slate-700', order: 10, parentId: 'government' },
  { name: 'سهامداران', slug: 'government-shareholders', description: 'قراردادهای مربوط به حقوق و تعهدات سهامداران', icon: 'Building', color: 'bg-slate-100 text-slate-700', order: 11, parentId: 'government' },
  { name: 'اساسنامه', slug: 'government-articles-of-association', description: 'قراردادهای تدوین و اصلاح اساسنامه شرکت‌ها', icon: 'Building', color: 'bg-slate-100 text-slate-700', order: 12, parentId: 'government' },

  // ---- 10. قراردادهای بین‌المللی ----
  { name: 'قراردادهای بین‌المللی', slug: 'international', description: 'قراردادهای مربوط به تجارت و همکاری‌های بین‌المللی', icon: 'Globe', color: 'bg-indigo-100 text-indigo-700', order: 10 },
  { name: 'واردات', slug: 'international-import', description: 'قراردادهای واردات کالا از خارج از کشور', icon: 'Globe', color: 'bg-indigo-100 text-indigo-700', order: 1, parentId: 'international' },
  { name: 'صادرات', slug: 'international-export', description: 'قراردادهای صادرات کالا به خارج از کشور', icon: 'Globe', color: 'bg-indigo-100 text-indigo-700', order: 2, parentId: 'international' },
  { name: 'حمل بین‌المللی', slug: 'international-shipping', description: 'قراردادهای حمل و نقل بین‌المللی', icon: 'Globe', color: 'bg-indigo-100 text-indigo-700', order: 3, parentId: 'international' },
  { name: 'حقوق گمرکی', slug: 'international-customs', description: 'قراردادهای مربوط به حقوق گمرکی و ترخیص کالا', icon: 'Globe', color: 'bg-indigo-100 text-indigo-700', order: 4, parentId: 'international' },
  { name: 'نمایندگی خارجی', slug: 'international-agency', description: 'قراردادهای نمایندگی در کشورهای خارجی', icon: 'Globe', color: 'bg-indigo-100 text-indigo-700', order: 5, parentId: 'international' },
  { name: 'همکاری بین‌المللی', slug: 'international-cooperation', description: 'قراردادهای همکاری و شراکت بین‌المللی', icon: 'Globe', color: 'bg-indigo-100 text-indigo-700', order: 6, parentId: 'international' },
  { name: 'لیزینگ بین‌المللی', slug: 'international-leasing', description: 'قراردادهای لیزینگ بین‌المللی', icon: 'Globe', color: 'bg-indigo-100 text-indigo-700', order: 7, parentId: 'international' },
  { name: 'جوینت ونچر', slug: 'international-joint-venture', description: 'قراردادهای سرمایه‌گذاری مشترک بین‌المللی', icon: 'Globe', color: 'bg-indigo-100 text-indigo-700', order: 8, parentId: 'international' },
  { name: 'انتقال فناوری', slug: 'international-technology-transfer', description: 'قراردادهای انتقال فناوری و دانش فنی', icon: 'Globe', color: 'bg-indigo-100 text-indigo-700', order: 9, parentId: 'international' },
  { name: 'قرارداد انکوترمز', slug: 'international-incoterms', description: 'قراردادهای حمل بر اساس قواعد اینکوترمز', icon: 'Globe', color: 'bg-indigo-100 text-indigo-700', order: 10, parentId: 'international' },

  // ---- 11. قراردادهای پزشکی و درمانی ----
  { name: 'قراردادهای پزشکی و درمانی', slug: 'medical', description: 'قراردادهای مربوط به خدمات پزشکی و درمانی', icon: 'Stethoscope', color: 'bg-red-100 text-red-700', order: 11 },
  { name: 'رضایت‌نامه پزشکی', slug: 'medical-consent', description: 'فرم رضایت‌نامه و آگاهی بیمار', icon: 'Stethoscope', color: 'bg-red-100 text-red-700', order: 1, parentId: 'medical' },
  { name: 'مسئولیت پزشکی', slug: 'medical-liability', description: 'قرارداد مسئولیت پزشکی و درمانی', icon: 'Stethoscope', color: 'bg-red-100 text-red-700', order: 2, parentId: 'medical' },
  { name: 'درمان بیمار', slug: 'medical-treatment', description: 'قرارداد درمان و ارائه خدمات پزشکی', icon: 'Stethoscope', color: 'bg-red-100 text-red-700', order: 3, parentId: 'medical' },
  { name: 'آزمایشگاه', slug: 'medical-laboratory', description: 'قرارداد خدمات آزمایشگاهی', icon: 'Stethoscope', color: 'bg-red-100 text-red-700', order: 4, parentId: 'medical' },
  { name: 'داروسازی', slug: 'medical-pharmacy', description: 'قراردادهای داروسازی و تأمین دارو', icon: 'Stethoscope', color: 'bg-red-100 text-red-700', order: 5, parentId: 'medical' },
  { name: 'تجهیزات پزشکی', slug: 'medical-equipment', description: 'قراردادهای خرید و فروش تجهیزات پزشکی', icon: 'Stethoscope', color: 'bg-red-100 text-red-700', order: 6, parentId: 'medical' },
  { name: 'بیمارستان', slug: 'medical-hospital', description: 'قراردادهای مربوط به بیمارستان و مراکز درمانی', icon: 'Stethoscope', color: 'bg-red-100 text-red-700', order: 7, parentId: 'medical' },
  { name: 'کلینیک خصوصی', slug: 'medical-clinic', description: 'قراردادهای تأسیس و اداره کلینیک خصوصی', icon: 'Stethoscope', color: 'bg-red-100 text-red-700', order: 8, parentId: 'medical' },
  { name: 'دندانپزشکی', slug: 'medical-dental', description: 'قراردادهای خدمات دندانپزشکی', icon: 'Stethoscope', color: 'bg-red-100 text-red-700', order: 9, parentId: 'medical' },
  { name: 'فیزیوتراپی', slug: 'medical-physiotherapy', description: 'قراردادهای خدمات فیزیوتراپی', icon: 'Stethoscope', color: 'bg-red-100 text-red-700', order: 10, parentId: 'medical' },
  { name: 'روان‌شناسی', slug: 'medical-psychology', description: 'قراردادهای خدمات روان‌شناسی و مشاوره', icon: 'Stethoscope', color: 'bg-red-100 text-red-700', order: 11, parentId: 'medical' },
  { name: 'مشاوره ژنتیک', slug: 'medical-genetic-counseling', description: 'قراردادهای خدمات مشاوره ژنتیک', icon: 'Stethoscope', color: 'bg-red-100 text-red-700', order: 12, parentId: 'medical' },

  // ---- 12. قراردادهای آموزشی و پژوهشی ----
  { name: 'قراردادهای آموزشی و پژوهشی', slug: 'education', description: 'قراردادهای مربوط به آموزش و پژوهش', icon: 'GraduationCap', color: 'bg-yellow-100 text-yellow-700', order: 12 },
  { name: 'آموزش خصوصی', slug: 'education-private-tutoring', description: 'قراردادهای آموزش خصوصی و تدریس', icon: 'GraduationCap', color: 'bg-yellow-100 text-yellow-700', order: 1, parentId: 'education' },
  { name: 'آموزش آنلاین', slug: 'education-online', description: 'قراردادهای آموزش آنلاین و الکترونیک', icon: 'GraduationCap', color: 'bg-yellow-100 text-yellow-700', order: 2, parentId: 'education' },
  { name: 'پژوهش علمی', slug: 'education-research', description: 'قراردادهای پژوهش علمی و تحقیقاتی', icon: 'GraduationCap', color: 'bg-yellow-100 text-yellow-700', order: 3, parentId: 'education' },
  { name: 'پایان‌نامه', slug: 'education-thesis', description: 'قراردادهای مربوط به پایان‌نامه و رساله', icon: 'GraduationCap', color: 'bg-yellow-100 text-yellow-700', order: 4, parentId: 'education' },
  { name: 'انتشارات', slug: 'education-publishing', description: 'قراردادهای نشر و چاپ آثار علمی', icon: 'GraduationCap', color: 'bg-yellow-100 text-yellow-700', order: 5, parentId: 'education' },
  { name: 'همکاری دانشگاهی', slug: 'education-academic-cooperation', description: 'قراردادهای همکاری دانشگاهی و علمی', icon: 'GraduationCap', color: 'bg-yellow-100 text-yellow-700', order: 6, parentId: 'education' },
  { name: 'بورسیه', slug: 'education-scholarship', description: 'قراردادهای بورسیه و حمایت مالی دانشجویان', icon: 'GraduationCap', color: 'bg-yellow-100 text-yellow-700', order: 7, parentId: 'education' },
  { name: 'کارآموزی دانشجویی', slug: 'education-internship', description: 'قراردادهای کارآموزی و آموزش عملی', icon: 'GraduationCap', color: 'bg-yellow-100 text-yellow-700', order: 8, parentId: 'education' },
  { name: 'ترجمه', slug: 'education-translation', description: 'قراردادهای ترجمه متون علمی و ادبی', icon: 'GraduationCap', color: 'bg-yellow-100 text-yellow-700', order: 9, parentId: 'education' },
  { name: 'مدرس دانشگاه', slug: 'education-university-lecturer', description: 'قراردادهای استخدام و تدریس اساتید دانشگاه', icon: 'GraduationCap', color: 'bg-yellow-100 text-yellow-700', order: 10, parentId: 'education' },
  { name: 'نرم‌افزار آموزشی', slug: 'education-educational-software', description: 'قراردادهای توسعه نرم‌افزارهای آموزشی', icon: 'GraduationCap', color: 'bg-yellow-100 text-yellow-700', order: 11, parentId: 'education' },
  { name: 'دوره‌های مجازی', slug: 'education-virtual-courses', description: 'قراردادهای برگزاری دوره‌های آموزشی مجازی', icon: 'GraduationCap', color: 'bg-yellow-100 text-yellow-700', order: 12, parentId: 'education' },

  // ---- 13. قراردادهای عمران و ساختمان ----
  { name: 'قراردادهای عمران و ساختمان', slug: 'construction', description: 'قراردادهای مربوط به عمران و ساختمان‌سازی', icon: 'Hammer', color: 'bg-stone-100 text-stone-700', order: 13 },
  { name: 'پیمان ساختمانی', slug: 'construction-building-contract', description: 'قرارداد پیمان ساختمانی و اجرای پروژه', icon: 'Hammer', color: 'bg-stone-100 text-stone-700', order: 1, parentId: 'construction' },
  { name: 'نظارت ساختمانی', slug: 'construction-supervision', description: 'قرارداد نظارت بر اجرای پروژه ساختمانی', icon: 'Hammer', color: 'bg-stone-100 text-stone-700', order: 2, parentId: 'construction' },
  { name: 'طراحی معماری', slug: 'construction-architecture', description: 'قرارداد طراحی معماری و شهرسازی', icon: 'Hammer', color: 'bg-stone-100 text-stone-700', order: 3, parentId: 'construction' },
  { name: 'تأسیسات', slug: 'construction-facilities', description: 'قراردادهای تأسیسات ساختمانی و مکانیکی', icon: 'Hammer', color: 'bg-stone-100 text-stone-700', order: 4, parentId: 'construction' },
  { name: 'نقشه‌کشی', slug: 'construction-drafting', description: 'قراردادهای نقشه‌کشی و فنی ساختمان', icon: 'Hammer', color: 'bg-stone-100 text-stone-700', order: 5, parentId: 'construction' },
  { name: 'شهرسازی', slug: 'construction-urban-planning', description: 'قراردادهای شهرسازی و برنامه‌ریزی شهری', icon: 'Hammer', color: 'bg-stone-100 text-stone-700', order: 6, parentId: 'construction' },
  { name: 'راه‌سازی', slug: 'construction-road', description: 'قراردادهای احداث و نگهداری راه', icon: 'Hammer', color: 'bg-stone-100 text-stone-700', order: 7, parentId: 'construction' },
  { name: 'پل‌سازی', slug: 'construction-bridge', description: 'قراردادهای احداث و تعمیر پل', icon: 'Hammer', color: 'bg-stone-100 text-stone-700', order: 8, parentId: 'construction' },
  { name: 'سدسازی', slug: 'construction-dam', description: 'قراردادهای احداث و نگهداری سد', icon: 'Hammer', color: 'bg-stone-100 text-stone-700', order: 9, parentId: 'construction' },
  { name: 'تونل‌سازی', slug: 'construction-tunnel', description: 'قراردادهای حفر و احداث تونل', icon: 'Hammer', color: 'bg-stone-100 text-stone-700', order: 10, parentId: 'construction' },
  { name: 'لوله‌کشی', slug: 'construction-plumbing', description: 'قراردادهای لوله‌کشی و تأسیسات آب', icon: 'Hammer', color: 'bg-stone-100 text-stone-700', order: 11, parentId: 'construction' },
  { name: 'برق‌کشی ساختمان', slug: 'construction-electrical', description: 'قراردادهای برق‌کشی و تأسیسات برق ساختمان', icon: 'Hammer', color: 'bg-stone-100 text-stone-700', order: 12, parentId: 'construction' },

  // ---- 14. قراردادهای کشاورزی ----
  { name: 'قراردادهای کشاورزی', slug: 'agriculture', description: 'قراردادهای مربوط به فعالیت‌های کشاورزی و دامی', icon: 'Sprout', color: 'bg-lime-100 text-lime-700', order: 14 },
  { name: 'خرید فروش محصولات کشاورزی', slug: 'agriculture-buy-sell', description: 'قراردادهای خرید و فروش محصولات کشاورزی', icon: 'Sprout', color: 'bg-lime-100 text-lime-700', order: 1, parentId: 'agriculture' },
  { name: 'اجاره زمین کشاورزی', slug: 'agriculture-land-lease', description: 'قراردادهای اجاره زمین و اراضی کشاورزی', icon: 'Sprout', color: 'bg-lime-100 text-lime-700', order: 2, parentId: 'agriculture' },
  { name: 'مشارکت زراعی', slug: 'agriculture-farming-partnership', description: 'قراردادهای مشارکت در کشاورزی و زراعت', icon: 'Sprout', color: 'bg-lime-100 text-lime-700', order: 3, parentId: 'agriculture' },
  { name: 'بیمه محصولات کشاورزی', slug: 'agriculture-crop-insurance', description: 'قراردادهای بیمه محصولات کشاورزی', icon: 'Sprout', color: 'bg-lime-100 text-lime-700', order: 4, parentId: 'agriculture' },
  { name: 'آبیاری', slug: 'agriculture-irrigation', description: 'قراردادهای سیستم‌های آبیاری و تأمین آب', icon: 'Sprout', color: 'bg-lime-100 text-lime-700', order: 5, parentId: 'agriculture' },
  { name: 'دامپروری', slug: 'agriculture-livestock', description: 'قراردادهای دامپروری و پرورش دام', icon: 'Sprout', color: 'bg-lime-100 text-lime-700', order: 6, parentId: 'agriculture' },
  { name: 'پرورش ماهی', slug: 'agriculture-fishery', description: 'قراردادهای پرورش ماهی و آبزیان', icon: 'Sprout', color: 'bg-lime-100 text-lime-700', order: 7, parentId: 'agriculture' },
  { name: 'گلخانه', slug: 'agriculture-greenhouse', description: 'قراردادهای احداث و بهره‌برداری گلخانه', icon: 'Sprout', color: 'bg-lime-100 text-lime-700', order: 8, parentId: 'agriculture' },
  { name: 'باغداری', slug: 'agriculture-orchard', description: 'قراردادهای باغداری و پرورش میوه', icon: 'Sprout', color: 'bg-lime-100 text-lime-700', order: 9, parentId: 'agriculture' },
  { name: 'ماشین‌آلات کشاورزی', slug: 'agriculture-machinery', description: 'قراردادهای خرید و فروش و اجاره ماشین‌آلات کشاورزی', icon: 'Sprout', color: 'bg-lime-100 text-lime-700', order: 10, parentId: 'agriculture' },
  { name: 'نهاده‌های کشاورزی', slug: 'agriculture-supplies', description: 'قراردادهای تأمین نهاده‌های کشاورزی', icon: 'Sprout', color: 'bg-lime-100 text-lime-700', order: 11, parentId: 'agriculture' },
  { name: 'صادرات محصولات', slug: 'agriculture-export', description: 'قراردادهای صادرات محصولات کشاورزی', icon: 'Sprout', color: 'bg-lime-100 text-lime-700', order: 12, parentId: 'agriculture' },

  // ---- 15. قراردادهای صنعتی و تولیدی ----
  { name: 'قراردادهای صنعتی و تولیدی', slug: 'industrial', description: 'قراردادهای مربوط به صنعت و تولید', icon: 'Factory', color: 'bg-zinc-100 text-zinc-700', order: 15 },
  { name: 'تولید قطعات', slug: 'industrial-parts-manufacturing', description: 'قراردادهای تولید و قطعه‌سازی صنعتی', icon: 'Factory', color: 'bg-zinc-100 text-zinc-700', order: 1, parentId: 'industrial' },
  { name: 'مونتاژ صنعتی', slug: 'industrial-assembly', description: 'قراردادهای مونتاژ و سرهم‌بندی صنعتی', icon: 'Factory', color: 'bg-zinc-100 text-zinc-700', order: 2, parentId: 'industrial' },
  { name: 'کارگاه صنعتی', slug: 'industrial-workshop', description: 'قراردادهای راه‌اندازی و مدیریت کارگاه صنعتی', icon: 'Factory', color: 'bg-zinc-100 text-zinc-700', order: 3, parentId: 'industrial' },
  { name: 'استاندارد صنعتی', slug: 'industrial-standards', description: 'قراردادهای استانداردسازی و گواهینامه صنعتی', icon: 'Factory', color: 'bg-zinc-100 text-zinc-700', order: 4, parentId: 'industrial' },
  { name: 'کنترل کیفیت', slug: 'industrial-quality-control', description: 'قراردادهای کنترل کیفیت و تضمین کیفیت', icon: 'Factory', color: 'bg-zinc-100 text-zinc-700', order: 5, parentId: 'industrial' },
  { name: 'بسته‌بندی', slug: 'industrial-packaging', description: 'قراردادهای بسته‌بندی صنعتی', icon: 'Factory', color: 'bg-zinc-100 text-zinc-700', order: 6, parentId: 'industrial' },
  { name: 'انبارداری صنعتی', slug: 'industrial-warehousing', description: 'قراردادهای انبارداری و نگهداری کالاهای صنعتی', icon: 'Factory', color: 'bg-zinc-100 text-zinc-700', order: 7, parentId: 'industrial' },
  { name: 'نگهداری و تعمیرات', slug: 'industrial-maintenance', description: 'قراردادهای نگهداری و تعمیرات صنعتی', icon: 'Factory', color: 'bg-zinc-100 text-zinc-700', order: 8, parentId: 'industrial' },
  { name: 'ماشین‌آلات صنعتی', slug: 'industrial-machinery', description: 'قراردادهای خرید و فروش ماشین‌آلات صنعتی', icon: 'Factory', color: 'bg-zinc-100 text-zinc-700', order: 9, parentId: 'industrial' },
  { name: 'ایمنی صنعتی', slug: 'industrial-safety', description: 'قراردادهای ایمنی و بهداشت صنعتی', icon: 'Factory', color: 'bg-zinc-100 text-zinc-700', order: 10, parentId: 'industrial' },
  { name: 'محیط زیست صنعتی', slug: 'industrial-environment', description: 'قراردادهای محیط زیست و مدیریت پسماند صنعتی', icon: 'Factory', color: 'bg-zinc-100 text-zinc-700', order: 11, parentId: 'industrial' },
  { name: 'صادرات صنعتی', slug: 'industrial-export', description: 'قراردادهای صادرات محصولات صنعتی', icon: 'Factory', color: 'bg-zinc-100 text-zinc-700', order: 12, parentId: 'industrial' },

  // ---- 16. قراردادهای حمل و نقل ----
  { name: 'قراردادهای حمل و نقل', slug: 'transportation', description: 'قراردادهای مربوط به حمل و نقل بار و مسافر', icon: 'Truck', color: 'bg-sky-100 text-sky-700', order: 16 },
  { name: 'باربری', slug: 'transportation-freight', description: 'قراردادهای باربری و حمل بار', icon: 'Truck', color: 'bg-sky-100 text-sky-700', order: 1, parentId: 'transportation' },
  { name: 'مسافربری', slug: 'transportation-passenger', description: 'قراردادهای مسافربری و حمل مسافر', icon: 'Truck', color: 'bg-sky-100 text-sky-700', order: 2, parentId: 'transportation' },
  { name: 'لجستیک', slug: 'transportation-logistics', description: 'قراردادهای لجستیک و زنجیره تأمین', icon: 'Truck', color: 'bg-sky-100 text-sky-700', order: 3, parentId: 'transportation' },
  { name: 'انبارداری', slug: 'transportation-warehousing', description: 'قراردادهای انبارداری و تخلیه بار', icon: 'Truck', color: 'bg-sky-100 text-sky-700', order: 4, parentId: 'transportation' },
  { name: 'حمل دریایی', slug: 'transportation-maritime', description: 'قراردادهای حمل دریایی و دریانوردی', icon: 'Truck', color: 'bg-sky-100 text-sky-700', order: 5, parentId: 'transportation' },
  { name: 'حمل هوایی', slug: 'transportation-air', description: 'قراردادهای حمل هوایی و هوانوردی', icon: 'Truck', color: 'bg-sky-100 text-sky-700', order: 6, parentId: 'transportation' },
  { name: 'حمل ریلی', slug: 'transportation-rail', description: 'قراردادهای حمل ریلی و راه‌آهن', icon: 'Truck', color: 'bg-sky-100 text-sky-700', order: 7, parentId: 'transportation' },
  { name: 'پستی', slug: 'transportation-postal', description: 'قراردادهای خدمات پستی و курیر', icon: 'Truck', color: 'bg-sky-100 text-sky-700', order: 8, parentId: 'transportation' },
  { name: 'حمل مواد خطرناک', slug: 'transportation-hazardous', description: 'قراردادهای حمل مواد خطرناک و سمی', icon: 'Truck', color: 'bg-sky-100 text-sky-700', order: 9, parentId: 'transportation' },
  { name: 'ترخیص کالا', slug: 'transportation-clearance', description: 'قراردادهای ترخیص کالا و گمرک', icon: 'Truck', color: 'bg-sky-100 text-sky-700', order: 10, parentId: 'transportation' },
  { name: 'گمرک', slug: 'transportation-customs', description: 'قراردادهای امور گمرکی و صادرات و واردات', icon: 'Truck', color: 'bg-sky-100 text-sky-700', order: 11, parentId: 'transportation' },
  { name: 'لاینر', slug: 'transportation-liner', description: 'قراردادهای حمل خطی و منظم', icon: 'Truck', color: 'bg-sky-100 text-sky-700', order: 12, parentId: 'transportation' },

  // ---- 17. قراردادهای فرهنگی و هنری ----
  { name: 'قراردادهای فرهنگی و هنری', slug: 'cultural', description: 'قراردادهای مربوط به فعالیت‌های فرهنگی و هنری', icon: 'Palette', color: 'bg-fuchsia-100 text-fuchsia-700', order: 17 },
  { name: 'نشر کتاب', slug: 'cultural-book-publishing', description: 'قراردادهای نشر و چاپ کتاب', icon: 'Palette', color: 'bg-fuchsia-100 text-fuchsia-700', order: 1, parentId: 'cultural' },
  { name: 'حق تألیف', slug: 'cultural-copyright', description: 'قراردادهای حق تألیف و مالکیت فکری', icon: 'Palette', color: 'bg-fuchsia-100 text-fuchsia-700', order: 2, parentId: 'cultural' },
  { name: 'تولید فیلم', slug: 'cultural-film-production', description: 'قراردادهای تولید و ساخت فیلم', icon: 'Palette', color: 'bg-fuchsia-100 text-fuchsia-700', order: 3, parentId: 'cultural' },
  { name: 'برگزاری کنسرت', slug: 'cultural-concert', description: 'قراردادهای برگزاری کنسرت و رویداد موسیقی', icon: 'Palette', color: 'bg-fuchsia-100 text-fuchsia-700', order: 4, parentId: 'cultural' },
  { name: 'نمایشگاه هنری', slug: 'cultural-art-exhibition', description: 'قراردادهای برگزاری نمایشگاه هنری', icon: 'Palette', color: 'bg-fuchsia-100 text-fuchsia-700', order: 5, parentId: 'cultural' },
  { name: 'طراحی گرافیک', slug: 'cultural-graphic-design', description: 'قراردادهای طراحی گرافیک و بصری', icon: 'Palette', color: 'bg-fuchsia-100 text-fuchsia-700', order: 6, parentId: 'cultural' },
  { name: 'عکاسی', slug: 'cultural-photography', description: 'قراردادهای عکاسی حرفه‌ای', icon: 'Palette', color: 'bg-fuchsia-100 text-fuchsia-700', order: 7, parentId: 'cultural' },
  { name: 'هنرهای تجسمی', slug: 'cultural-visual-arts', description: 'قراردادهای هنرهای تجسمی و plastici', icon: 'Palette', color: 'bg-fuchsia-100 text-fuchsia-700', order: 8, parentId: 'cultural' },
  { name: 'تئاتر', slug: 'cultural-theater', description: 'قراردادهای اجرای تئاتر و نمایشنامه', icon: 'Palette', color: 'bg-fuchsia-100 text-fuchsia-700', order: 9, parentId: 'cultural' },
  { name: 'موسیقی', slug: 'cultural-music', description: 'قراردادهای تولید و پخش موسیقی', icon: 'Palette', color: 'bg-fuchsia-100 text-fuchsia-700', order: 10, parentId: 'cultural' },
  { name: 'بازیگری', slug: 'cultural-acting', description: 'قراردادهای بازیگری و حضور در تولیدات هنری', icon: 'Palette', color: 'bg-fuchsia-100 text-fuchsia-700', order: 11, parentId: 'cultural' },
  { name: 'کاریکاتور', slug: 'cultural-caricature', description: 'قراردادهای کاریکاتور و طنز گرافیکی', icon: 'Palette', color: 'bg-fuchsia-100 text-fuchsia-700', order: 12, parentId: 'cultural' },

  // ---- 18. قراردادهای ورزشی ----
  { name: 'قراردادهای ورزشی', slug: 'sports', description: 'قراردادهای مربوط به فعالیت‌های ورزشی', icon: 'Trophy', color: 'bg-rose-100 text-rose-700', order: 18 },
  { name: 'بازیکن ورزشی', slug: 'sports-player', description: 'قراردادهای بازیکن ورزشی و حرفه‌ای', icon: 'Trophy', color: 'bg-rose-100 text-rose-700', order: 1, parentId: 'sports' },
  { name: 'مربیگری', slug: 'sports-coaching', description: 'قراردادهای مربیگری و آموزش ورزشی', icon: 'Trophy', color: 'bg-rose-100 text-rose-700', order: 2, parentId: 'sports' },
  { name: 'مدیریت ورزشی', slug: 'sports-management', description: 'قراردادهای مدیریت باشگاه و تیم ورزشی', icon: 'Trophy', color: 'bg-rose-100 text-rose-700', order: 3, parentId: 'sports' },
  { name: 'برگزاری مسابقات', slug: 'sports-competition', description: 'قراردادهای برگزاری مسابقات و رویدادهای ورزشی', icon: 'Trophy', color: 'bg-rose-100 text-rose-700', order: 4, parentId: 'sports' },
  { name: 'اسپانسر ورزشی', slug: 'sports-sponsorship', description: 'قراردادهای اسپانسرشیپ و حمایت مالی ورزشی', icon: 'Trophy', color: 'bg-rose-100 text-rose-700', order: 5, parentId: 'sports' },
  { name: 'ورزشکار حرفه‌ای', slug: 'sports-professional', description: 'قراردادهای ورزشکار حرفه‌ای و مالیات آن', icon: 'Trophy', color: 'bg-rose-100 text-rose-700', order: 6, parentId: 'sports' },
  { name: 'تجهیزات ورزشی', slug: 'sports-equipment', description: 'قراردادهای تأمین و خرید تجهیزات ورزشی', icon: 'Trophy', color: 'bg-rose-100 text-rose-700', order: 7, parentId: 'sports' },
  { name: 'باشگاه ورزشی', slug: 'sports-club', description: 'قراردادهای تأسیس و مدیریت باشگاه ورزشی', icon: 'Trophy', color: 'bg-rose-100 text-rose-700', order: 8, parentId: 'sports' },
  { name: 'رویداد ورزشی', slug: 'sports-event', description: 'قراردادهای برگزاری رویداد ورزشی بزرگ', icon: 'Trophy', color: 'bg-rose-100 text-rose-700', order: 9, parentId: 'sports' },
  { name: 'رسانه ورزشی', slug: 'sports-media', description: 'قراردادهای پخش و رسانه ورزشی', icon: 'Trophy', color: 'bg-rose-100 text-rose-700', order: 10, parentId: 'sports' },

  // ---- 19. قراردادهای انرژی ----
  { name: 'قراردادهای انرژی', slug: 'energy', description: 'قراردادهای مربوط به انرژی و منابع طبیعی', icon: 'Zap', color: 'bg-yellow-100 text-yellow-700', order: 19 },
  { name: 'نفت و گاز', slug: 'energy-oil-gas', description: 'قراردادهای اکتشاف و استخراج نفت و گاز', icon: 'Zap', color: 'bg-yellow-100 text-yellow-700', order: 1, parentId: 'energy' },
  { name: 'پتروشیمی', slug: 'energy-petrochemical', description: 'قراردادهای پتروشیمی و فرآوری مواد', icon: 'Zap', color: 'bg-yellow-100 text-yellow-700', order: 2, parentId: 'energy' },
  { name: 'برق‌آب', slug: 'energy-utilities', description: 'قراردادهای تأمین برق و آب', icon: 'Zap', color: 'bg-yellow-100 text-yellow-700', order: 3, parentId: 'energy' },
  { name: 'انرژی خورشیدی', slug: 'energy-solar', description: 'قراردادهای انرژی خورشیدی و صفحات فتوولتاییک', icon: 'Zap', color: 'bg-yellow-100 text-yellow-700', order: 4, parentId: 'energy' },
  { name: 'انرژی بادی', slug: 'energy-wind', description: 'قراردادهای انرژی بادی و توربین‌های بادی', icon: 'Zap', color: 'bg-yellow-100 text-yellow-700', order: 5, parentId: 'energy' },
  { name: 'پنل خورشیدی', slug: 'energy-solar-panel', description: 'قراردادهای نصب و نگهداری پنل خورشیدی', icon: 'Zap', color: 'bg-yellow-100 text-yellow-700', order: 6, parentId: 'energy' },
  { name: 'سد برق‌آبی', slug: 'energy-hydropower', description: 'قراردادهای احداث و بهره‌برداری سد برق‌آبی', icon: 'Zap', color: 'bg-yellow-100 text-yellow-700', order: 7, parentId: 'energy' },
  { name: 'تصفیه آب', slug: 'energy-water-treatment', description: 'قراردادهای تصفیه آب و فاضلاب', icon: 'Zap', color: 'bg-yellow-100 text-yellow-700', order: 8, parentId: 'energy' },
  { name: 'مدیریت پسماند', slug: 'energy-waste-management', description: 'قراردادهای مدیریت پسماند و بازیافت', icon: 'Zap', color: 'bg-yellow-100 text-yellow-700', order: 9, parentId: 'energy' },
  { name: 'حفاظت محیط زیست', slug: 'energy-environmental-protection', description: 'قراردادهای حفاظت از محیط زیست', icon: 'Zap', color: 'bg-yellow-100 text-yellow-700', order: 10, parentId: 'energy' },
  { name: 'منابع طبیعی', slug: 'energy-natural-resources', description: 'قراردادهای بهره‌برداری از منابع طبیعی', icon: 'Zap', color: 'bg-yellow-100 text-yellow-700', order: 11, parentId: 'energy' },
  { name: 'معادن', slug: 'energy-mining', description: 'قراردادهای اکتشاف و استخراج معادن', icon: 'Zap', color: 'bg-yellow-100 text-yellow-700', order: 12, parentId: 'energy' },

  // ---- 20. قراردادهای الکترونیکی و اینترنتی ----
  { name: 'قراردادهای الکترونیکی و اینترنتی', slug: 'electronic', description: 'قراردادهای مربوط به تجارت الکترونیک و خدمات اینترنتی', icon: 'Wifi', color: 'bg-purple-100 text-purple-700', order: 20 },
  { name: 'فروشگاه آنلاین', slug: 'electronic-online-store', description: 'قراردادهای تأسیس و مدیریت فروشگاه آنلاین', icon: 'Wifi', color: 'bg-purple-100 text-purple-700', order: 1, parentId: 'electronic' },
  { name: 'درگاه پرداخت', slug: 'electronic-payment-gateway', description: 'قراردادهای درگاه پرداخت اینترنتی', icon: 'Wifi', color: 'bg-purple-100 text-purple-700', order: 2, parentId: 'electronic' },
  { name: 'تجارت الکترونیک', slug: 'electronic-ecommerce', description: 'قراردادهای تجارت الکترونیک و خرید آنلاین', icon: 'Wifi', color: 'bg-purple-100 text-purple-700', order: 3, parentId: 'electronic' },
  { name: 'حریم خصوصی', slug: 'electronic-privacy', description: 'قراردادهای حریم خصوصی و حفاظت از داده‌ها', icon: 'Wifi', color: 'bg-purple-100 text-purple-700', order: 4, parentId: 'electronic' },
  { name: 'پلتفرم دیجیتال', slug: 'electronic-digital-platform', description: 'قراردادهای تأسیس و مدیریت پلتفرم دیجیتال', icon: 'Wifi', color: 'bg-purple-100 text-purple-700', order: 5, parentId: 'electronic' },
  { name: 'امضای الکترونیک', slug: 'electronic-digital-signature', description: 'قراردادهای امضای الکترونیک و سند الکترونیک', icon: 'Wifi', color: 'bg-purple-100 text-purple-700', order: 6, parentId: 'electronic' },
  { name: 'خدمات پستی الکترونیک', slug: 'electronic-email-services', description: 'قراردادهای خدمات ایمیل و پست الکترونیک', icon: 'Wifi', color: 'bg-purple-100 text-purple-700', order: 7, parentId: 'electronic' },
  { name: 'شبکه‌های اجتماعی', slug: 'electronic-social-media', description: 'قراردادهای مربوط به شبکه‌های اجتماعی', icon: 'Wifi', color: 'bg-purple-100 text-purple-700', order: 8, parentId: 'electronic' },
  { name: 'بازی آنلاین', slug: 'electronic-online-gaming', description: 'قراردادهای توسعه و پخش بازی آنلاین', icon: 'Wifi', color: 'bg-purple-100 text-purple-700', order: 9, parentId: 'electronic' },
  { name: 'محتوای دیجیتال', slug: 'electronic-digital-content', description: 'قراردادهای تولید و پخش محتوای دیجیتال', icon: 'Wifi', color: 'bg-purple-100 text-purple-700', order: 10, parentId: 'electronic' },
  { name: 'دانلود دیجیتال', slug: 'electronic-digital-download', description: 'قراردادهای فروش و دانلود فایل‌های دیجیتال', icon: 'Wifi', color: 'bg-purple-100 text-purple-700', order: 11, parentId: 'electronic' },
  { name: 'اشتراک دیجیتال', slug: 'electronic-digital-subscription', description: 'قراردادهای اشتراک و عضویت سرویس‌های دیجیتال', icon: 'Wifi', color: 'bg-purple-100 text-purple-700', order: 12, parentId: 'electronic' },
];

// =============================================================================
// CONTRACTS
// =============================================================================

export const contracts: SeedContract[] = [
  // ============================================================================
  // CATEGORY 1: قراردادهای ملکی (Real Estate)
  // ============================================================================
