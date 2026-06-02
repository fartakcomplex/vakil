import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { BILLS_DATA_PART1 } from '@/lib/bills-data-part1';
import { BILLS_DATA_PART2 } from '@/lib/bills-data-part2';

// Category metadata: slug -> { name, icon, color, order }
const CATEGORY_META: Record<string, { name: string; icon: string; color: string; order: number }> = {
  'civil':          { name: 'لایحه‌های مدنی',           icon: 'Scale',          color: '#7c3aed', order: 1 },
  'criminal':       { name: 'لایحه‌های کیفری',          icon: 'ShieldAlert',    color: '#dc2626', order: 2 },
  'commercial':    { name: 'لایحه‌های تجاری',          icon: 'Briefcase',      color: '#2563eb', order: 3 },
  'family':         { name: 'لایحه‌های خانواده',         icon: 'Heart',          color: '#be185d', order: 4 },
  'labor':          { name: 'لایحه‌های کار و تامین اجتماعی', icon: 'Users',      color: '#ca8a04', order: 5 },
  'tax':            { name: 'لایحه‌های مالیاتی',         icon: 'Landmark',       color: '#059669', order: 6 },
  'land':           { name: 'لایحه‌های زمین و املاک',   icon: 'Building2',      color: '#4f46e5', order: 7 },
  'insurance':      { name: 'لایحه‌های بیمه',            icon: 'HeartPulse',     color: '#ea580c', order: 8 },
  'banking':        { name: 'لایحه‌های بانکی',            icon: 'PiggyBank',      color: '#0d9488', order: 9 },
  'health':         { name: 'لایحه‌های بهداشت و درمان',   icon: 'Stethoscope',    color: '#dc2626', order: 10 },
  'education':      { name: 'لایحه‌های آموزش',            icon: 'GraduationCap',  color: '#6366f1', order: 11 },
  'environment':    { name: 'لایحه‌های محیط زیست',       icon: 'Leaf',           color: '#16a34a', order: 12 },
  'technology':     { name: 'لایحه‌های فناوری و ارتباطات', icon: 'Monitor',       color: '#0891b2', order: 13 },
  'transportation': { name: 'لایحه‌های راه و ترابری',   icon: 'Car',            color: '#e11d48', order: 14 },
  'housing':        { name: 'لایحه‌های مسکن',            icon: 'Home',           color: '#059669', order: 15 },
  'agriculture':    { name: 'لایحه‌های کشاورزی',          icon: 'Sprout',         color: '#16a34a', order: 16 },
  'culture':        { name: 'لایحه‌های فرهنگ و هنر',     icon: 'Palette',        color: '#7c3aed', order: 17 },
  'energy':         { name: 'لایحه‌های انرژی',            icon: 'Zap',            color: '#ca8a04', order: 18 },
  'defense':        { name: 'لایحه‌های دفاعی و امنیتی',  icon: 'Shield',         color: '#1e40af', order: 19 },
  'other':          { name: 'لایحه‌های متفرقه',          icon: 'FileText',       color: '#6b7280', order: 20 },
};

// Generate professional HTML bill content
function generateBillContent(item: {
  title: string;
  description: string;
  summary: string;
  billNumber: string;
  billType: string;
  presentationDate: string;
  tags: string[];
  applicableLaws: string[];
  categorySlug: string;
  status: string;
  difficulty: string;
}): string {
  const catName = CATEGORY_META[item.categorySlug]?.name || item.categorySlug;

  const typeLabels: Record<string, string> = {
    NEW: 'لایحه جدید',
    AMENDMENT: 'لایحه اصلاحی',
    SUPPLEMENTARY: 'لایحه الحاقی',
  };

  const statusLabels: Record<string, string> = {
    DRAFT: 'پیش‌نویس',
    UNDER_REVIEW: 'در دست بررسی',
    APPROVED: 'تصویب شده',
    REJECTED: 'رد شده',
  };

  const difficultyLabels: Record<string, string> = {
    GENERAL: 'عمومی',
    SPECIALIZED: 'تخصصی',
    ADVANCED: 'پیشرفته',
  };

  return `<div dir="rtl" style="font-family: Vazirmatn, Tahoma, sans-serif; line-height: 2.2; font-size: 14px;">
<div style="text-align: center; margin-bottom: 30px; border-bottom: 3px double #1e40af; padding-bottom: 15px;">
  <p style="font-size: 20px; font-weight: bold; color: #1e40af; margin: 0;">جمهوری اسلامی ایران</p>
  <p style="font-size: 14px; color: #374151; margin-top: 5px;">لایحه قانونی</p>
</div>

<div style="background: #f0f9ff; border-right: 4px solid #1e40af; padding: 15px 20px; margin-bottom: 25px; border-radius: 4px;">
  <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
    <div>
      <p style="font-size: 18px; font-weight: bold; color: #1e3a5f; margin: 0;">${item.title}</p>
      <p style="color: #666; margin-top: 5px;">${item.description}</p>
    </div>
    <div style="text-align: left; font-size: 12px; color: #666;">
      <p>شماره لایحه: ${item.billNumber}</p>
      <p>تاریخ ارائه: ${item.presentationDate}</p>
    </div>
  </div>
</div>

<div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 25px;">
  <span style="background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 12px; font-size: 12px;">${typeLabels[item.billType] || item.billType}</span>
  <span style="background: ${item.status === 'APPROVED' ? '#d1fae5' : item.status === 'UNDER_REVIEW' ? '#fef3c7' : item.status === 'REJECTED' ? '#fee2e2' : '#f3f4f6'}; color: ${item.status === 'APPROVED' ? '#065f46' : item.status === 'UNDER_REVIEW' ? '#92400e' : item.status === 'REJECTED' ? '#991b1b' : '#374151'}; padding: 4px 12px; border-radius: 12px; font-size: 12px;">وضعیت: ${statusLabels[item.status] || item.status}</span>
  <span style="background: #ede9fe; color: #5b21b6; padding: 4px 12px; border-radius: 12px; font-size: 12px;">سطح: ${difficultyLabels[item.difficulty] || item.difficulty}</span>
</div>

<div style="margin-bottom: 25px;">
  <h3 style="font-size: 16px; font-weight: bold; color: #1e3a5f; margin-bottom: 10px; border-bottom: 1px solid #d1d5db; padding-bottom: 5px;">خلاصه و توجیهات لایحه</h3>
  <p style="text-align: justify; color: #374151;">${item.summary}</p>
</div>

<div style="background: #fffbeb; border-right: 4px solid #f59e0b; padding: 15px 20px; margin-bottom: 25px; border-radius: 4px;">
  <h3 style="font-size: 15px; font-weight: bold; color: #92400e; margin-bottom: 10px;">مقررات و قوانین مستند</h3>
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
  <p style="color: #6b7280; font-size: 12px;">دسته‌بندی: ${catName} | ${typeLabels[item.billType] || item.billType} | ${statusLabels[item.status] || item.status}</p>
</div>
</div>`;
}

export async function POST() {
  try {
    // Check if already seeded - clear and reseed to handle partial seeds
    const existingCount = await db.bill.count();
    if (existingCount >= 100) {
      return NextResponse.json({
        message: `لایحه‌ها از قبل موجود هستند (${existingCount} لایحه)`,
        count: existingCount,
        seeded: true,
      });
    }

    // Clear any partial data
    if (existingCount > 0) {
      await db.bill.deleteMany({});
      await db.billCategory.deleteMany({});
    }

    // Merge all bill data
    const allBills = [...BILLS_DATA_PART1, ...BILLS_DATA_PART2];

    // Extract unique categories from data
    const categorySlugs = [...new Set(allBills.map(b => b.categorySlug))];

    // Create categories in DB (use upsert to handle partial seeds)
    const categoryMap = new Map<string, string>(); // slug -> id
    for (const slug of categorySlugs) {
      const meta = CATEGORY_META[slug] || { name: slug, icon: 'FileText', color: '#6b7280', order: 99 };
      const cat = await db.billCategory.upsert({
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

    // Create bills in batches
    const BATCH_SIZE = 50;
    let totalCreated = 0;

    for (let i = 0; i < allBills.length; i += BATCH_SIZE) {
      const batch = allBills.slice(i, i + BATCH_SIZE);
      await db.bill.createMany({
        data: batch.map(item => ({
          title: item.title,
          slug: item.slug,
          description: item.description,
          content: generateBillContent(item),
          summary: item.summary,
          categoryId: categoryMap.get(item.categorySlug)!,
          billNumber: item.billNumber,
          billType: item.billType,
          presentationDate: item.presentationDate,
          tags: JSON.stringify(item.tags),
          applicableLaws: JSON.stringify(item.applicableLaws),
          difficulty: item.difficulty,
          status: item.status,
          isPublished: true,
        })),
        skipDuplicates: true,
      });
      totalCreated += batch.length;
    }

    return NextResponse.json({
      message: `با موفقیت ${totalCreated} لایحه در ${categorySlugs.length} دسته‌بندی ایجاد شد`,
      count: totalCreated,
      categories: categorySlugs.length,
      seeded: true,
    });
  } catch (error) {
    console.error('Seed bills error:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد لایحه‌ها', details: String(error) },
      { status: 500 }
    );
  }
}
