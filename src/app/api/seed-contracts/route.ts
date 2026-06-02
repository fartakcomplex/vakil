import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { CONTRACTS_DATA } from '@/lib/contracts-data';

// Category metadata: slug -> { name, icon, color, order }
const CATEGORY_META: Record<string, { name: string; icon: string; color: string; order: number }> = {
  'real-estate-buy-sell':  { name: 'خرید و فروش ملک',         icon: 'Building2',  color: '#059669', order: 1 },
  'real-estate-rent':      { name: 'اجاره ملک',               icon: 'Home',        color: '#2563eb', order: 2 },
  'construction':          { name: 'ساختمان و پیمانکاری',     icon: 'HardHat',     color: '#ca8a04', order: 3 },
  'employment':            { name: 'کار و تامین اجتماعی',    icon: 'Users',       color: '#ea580c', order: 4 },
  'commercial':            { name: 'تجاری و شرکتی',           icon: 'Briefcase',   color: '#7c3aed', order: 5 },
  'family':                 { name: 'خانواده و ازدواج',        icon: 'Heart',       color: '#be185d', order: 6 },
  'criminal-settlement':   { name: 'شکایت کیفری و مصالحه',    icon: 'ShieldAlert', color: '#dc2626', order: 7 },
  'insurance':              { name: 'بیمه',                    icon: 'FileCheck',   color: '#0d9488', order: 8 },
  'financial':              { name: 'بانکی و مالی',            icon: 'Landmark',    color: '#4f46e5', order: 9 },
  'intellectual-property':  { name: 'مالکیت فکری',            icon: 'BookOpen',    color: '#0891b2', order: 10 },
  'technology':             { name: 'فناوری و ارتباطات',       icon: 'Monitor',     color: '#6366f1', order: 11 },
  'international':         { name: 'بین‌المللی',              icon: 'Globe2',      color: '#16a34a', order: 12 },
  'agriculture':            { name: 'کشاورزی و دامپروری',      icon: 'Sprout',      color: '#16a34a', order: 13 },
  'administrative':         { name: 'اداری و استخدام',       icon: 'FileText',    color: '#6b7280', order: 14 },
  'other':                  { name: 'سایر قراردادها',         icon: 'ScrollText',  color: '#6b7280', order: 15 },
};

// Generate professional HTML contract content
function generateContractContent(item: {
  title: string;
  description: string;
  summary: string;
  tags: string[];
  applicableLaws: string[];
  difficulty: string;
}): string {
  const diffLabels: Record<string, string> = {
    GENERAL: 'عمومی',
    SPECIALIZED: 'تخصصی',
    ADVANCED: 'پیشرفته',
  };

  return `<div dir="rtl" style="font-family: Vazirmatn, Tahoma, sans-serif; line-height: 2.2; font-size: 14px;">
<div style="text-align: center; margin-bottom: 30px; border-bottom: 3px double #059669; padding-bottom: 15px;">
  <p style="font-size: 20px; font-weight: bold; color: #059669; margin: 0;">جمهوری اسلامی ایران</p>
  <p style="font-size: 14px; color: #374151; margin-top: 5px;">قرارداد حقوقی</p>
</div>

<div style="background: #f0fdf4; border-right: 4px solid #059669; padding: 15px 20px; margin-bottom: 25px; border-radius: 4px;">
  <p style="font-size: 18px; font-weight: bold; color: #065f46; margin: 0;">${item.title}</p>
  <p style="color: #666; margin-top: 5px;">${item.description}</p>
</div>

<div style="margin-bottom: 25px;">
  <h3 style="font-size: 16px; font-weight: bold; color: #065f46; margin-bottom: 10px; border-bottom: 1px solid #d1d5db; padding-bottom: 5px;">ماده ۱ — موضوع قرارداد</h3>
  <p style="text-align: justify; color: #374151;">طرفین این قرارداد با رعایت شرایط مندرج در مواد قانونی ذیل، نسبت به ${item.summary.toLowerCase()} توافق نمودند.</p>
</div>

<div style="margin-bottom: 25px;">
  <h3 style="font-size: 16px; font-weight: bold; color: #065f46; margin-bottom: 10px; border-bottom: 1px solid #d1d5db; padding-bottom: 5px;">ماده ۲ — تعهدات طرفین</h3>
  <p style="text-align: justify; color: #374151;">الف) طرف اول متعهد می‌گردد کلیه تعهدات مندرج در این قرارداد را طبق شرایط مقرر انجام دهد.</p>
  <p style="text-align: justify; color: #374151;">ب) طرف دوم متعهد می‌گردد کلیه همکاری‌های لازم را برای اجرای صحیح این قرارداد به عمل آورد.</p>
</div>

<div style="margin-bottom: 25px;">
  <h3 style="font-size: 16px; font-weight: bold; color: #065f46; margin-bottom: 10px; border-bottom: 1px solid #d1d5db; padding-bottom: 5px;">ماده ۳ — مبلغ و نحوه پرداخت</h3>
  <p style="text-align: justify; color: #374151;">مبلغ قرارداد بین طرفین توافق شده و پرداخت آن طبق شرایط مندرج در پیوست این قرارداد انجام خواهد پذیرفت.</p>
</div>

<div style="margin-bottom: 25px;">
  <h3 style="font-size: 16px; font-weight: bold; color: #065f46; margin-bottom: 10px; border-bottom: 1px solid #d1d5db; padding-bottom: 5px;">ماده ۴ — شرایط فسخ</h3>
  <p style="text-align: justify; color: #374151;">هر یک از طرفین در صورت تخلف طرف مقابل از تعهدات مندرج، حق فسخ قرارداد را خواهند داشت.</p>
</div>

<div style="margin-bottom: 25px;">
  <h3 style="font-size: 16px; font-weight: bold; color: #065f46; margin-bottom: 10px; border-bottom: 1px solid #d1d5db; padding-bottom: 5px;">ماده ۵ — حل اختلاف</h3>
  <p style="text-align: justify; color: #374151;">در صورت بروز اختلاف، طرفین ابتدا از طریق مذاکره و سازش اقدام نموده و در صورت عدم حصول نتیجه، موضوع به مراجع صالحه قانونی ارجاع خواهد شد.</p>
</div>

<div style="background: #fffbeb; border-right: 4px solid #f59e0b; padding: 15px 20px; margin-bottom: 25px; border-radius: 4px;">
  <h3 style="font-size: 15px; font-weight: bold; color: #92400e; margin-bottom: 10px;">قوانین و مقررات مستند</h3>
  <ul style="padding-right: 20px; margin: 0;">
    ${item.applicableLaws.map(l => `<li style="margin-bottom: 6px; color: #78350f;">${l}</li>`).join('\n    ')}
  </ul>
</div>

${item.tags.length > 0 ? `<div style="margin-bottom: 25px;">
  <p style="font-weight: bold; margin-bottom: 8px; color: #374151;">کلیدواژه‌ها:</p>
  <div style="display: flex; flex-wrap: wrap; gap: 6px;">
    ${item.tags.map(t => `<span style="background: #e5e7eb; padding: 3px 12px; border-radius: 12px; font-size: 12px; color: #374151;">${t}</span>`).join('\n    ')}
  </div>
</div>` : ''}

<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #d1d5db;">
  <div style="display: flex; justify-content: space-between;">
    <div style="text-align: center;">
      <p style="font-weight: bold; color: #374151;">امضا و مهر طرف اول</p>
      <div style="border-bottom: 1px solid #374151; width: 150px; margin: 20px auto;"></div>
    </div>
    <div style="text-align: center;">
      <p style="font-weight: bold; color: #374151;">امضا و مهر طرف دوم</p>
      <div style="border-bottom: 1px solid #374151; width: 150px; margin: 20px auto;"></div>
    </div>
  </div>
  <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 20px;">سطح: ${diffLabels[item.difficulty] || item.difficulty}</p>
</div>
</div>`;
}

export async function POST() {
  try {
    const existingCount = await db.contract.count();
    if (existingCount > 0) {
      return NextResponse.json({
        message: `قراردادها از قبل موجود هستند (${existingCount} قرارداد)`,
        count: existingCount,
        seeded: true,
      });
    }

    // Extract unique categories
    const categorySlugs = [...new Set(CONTRACTS_DATA.map(c => c.categorySlug))];

    // Create categories (upsert)
    const categoryMap = new Map<string, string>();
    for (const slug of categorySlugs) {
      const meta = CATEGORY_META[slug] || { name: slug, icon: 'FileText', color: '#6b7280', order: 99 };
      const cat = await db.contractCategory.upsert({
        where: { slug },
        update: { name: meta.name, icon: meta.icon, color: meta.color, order: meta.order },
        create: {
          name: meta.name,
          slug,
          icon: meta.icon,
          color: meta.color,
          order: meta.order,
        },
      });
      categoryMap.set(slug, cat.id);
    }

    // Create contracts in batches
    const BATCH_SIZE = 50;
    let totalCreated = 0;

    for (let i = 0; i < CONTRACTS_DATA.length; i += BATCH_SIZE) {
      const batch = CONTRACTS_DATA.slice(i, i + BATCH_SIZE);
      await db.contract.createMany({
        data: batch.map(item => {
          const catId = categoryMap.get(item.categorySlug);
          if (!catId) return null;
          return {
            title: item.title,
            slug: item.slug,
            description: item.description,
            content: generateContractContent(item),
            summary: item.summary,
            categoryId: catId,
            tags: JSON.stringify(item.tags),
            applicableLaws: JSON.stringify(item.applicableLaws),
            difficulty: item.difficulty,
            isPublished: true,
          };
        }).filter(Boolean) as any[],
      });
      totalCreated += batch.length;
    }

    return NextResponse.json({
      message: `با موفقیت ${totalCreated} قرارداد در ${categorySlugs.length} دسته‌بندی ایجاد شد`,
      count: totalCreated,
      categories: categorySlugs.length,
      seeded: true,
    });
  } catch (error) {
    console.error('Seed contracts error:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد قراردادها', details: String(error) },
      { status: 500 }
    );
  }
}
