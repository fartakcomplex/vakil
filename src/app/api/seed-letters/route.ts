import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { LETTERS_DATA_PART1 } from '@/lib/letters-data-part1';
import { LETTERS_DATA_PART2 } from '@/lib/letters-data-part2';

// Category metadata: slug -> { name, icon, color, order }
const CATEGORY_META: Record<string, { name: string; icon: string; color: string; order: number }> = {
  'courts':           { name: 'دادگاه‌ها و مراجع قضایی', icon: 'Gavel',          color: '#7c3aed', order: 1 },
  'registry':         { name: 'ثبت اسناد و املاک',       icon: 'FileCheck',      color: '#2563eb', order: 2 },
  'tax':              { name: 'اداره مالیات و دارایی',    icon: 'Landmark',       color: '#dc2626', order: 3 },
  'social-security':  { name: 'تامین اجتماعی',            icon: 'Shield',         color: '#059669', order: 4 },
  'insurance':        { name: 'اداره بیمه',                icon: 'HeartPulse',     color: '#ea580c', order: 5 },
  'municipality':     { name: 'شهرداری و دهیاری',         icon: 'Building2',      color: '#4f46e5', order: 6 },
  'labor':            { name: 'وزارت کار و اداره کار',     icon: 'Briefcase',      color: '#ca8a04', order: 7 },
  'industry':         { name: 'وزارت صمت',                 icon: 'Factory',        color: '#0891b2', order: 8 },
  'banking':          { name: 'بانک‌ها و موسسات مالی',     icon: 'PiggyBank',      color: '#0d9488', order: 9 },
  'funds':            { name: 'صندوق‌ها و سرمایه‌گذاری',   icon: 'TrendingUp',     color: '#e11d48', order: 10 },
  'charity':          { name: 'اوقاف و امور خیریه',       icon: 'Heart',          color: '#be185d', order: 11 },
  'education':        { name: 'آموزش و پرورش',           icon: 'GraduationCap',  color: '#6366f1', order: 12 },
  'university':       { name: 'دانشگاه و علوم',           icon: 'BookOpen',       color: '#2563eb', order: 13 },
  'health':           { name: 'بهداشت و درمان',            icon: 'Stethoscope',    color: '#dc2626', order: 14 },
  'civil-registry':   { name: 'سازمان ثبت احوال',         icon: 'UserCheck',      color: '#7c3aed', order: 15 },
  'housing':          { name: 'مسکن و شهرسازی',           icon: 'Home',           color: '#059669', order: 16 },
  'judiciary':        { name: 'دادسرا و دادستان',         icon: 'ShieldAlert',    color: '#dc2626', order: 17 },
  'police':           { name: 'نیروی انتظامی',            icon: 'ShieldAlert',    color: '#1e40af', order: 18 },
  'dispute-council':  { name: 'شورای حل اختلاف',          icon: 'Users',          color: '#ca8a04', order: 19 },
  'other':            { name: 'سایر مراجع',                icon: 'FileText',       color: '#6b7280', order: 20 },
};

// Generate professional HTML letter content from data
function generateLetterContent(item: {
  title: string;
  description: string;
  summary: string;
  recipientType: string;
  tags: string[];
  applicableLaws: string[];
  categorySlug: string;
}): string {
  const catName = CATEGORY_META[item.categorySlug]?.name || item.categorySlug;
  const recipientLabel: Record<string, string> = {
    court: 'ریاست محترم دادگاه', government: 'مدیریت محترم', insurance: 'مدیریت محترم شرکت بیمه',
    bank: 'مدیریت محترم بانک', company: 'مدیریت محترم', person: 'جناب آقای / سرکار خانم',
    municipality: 'شهرداری محترم',
  };
  const recipient = recipientLabel[item.recipientType] || 'جناب مدیر محترم';

  return `<div dir="rtl" style="font-family: Vazirmatn, Tahoma, sans-serif; line-height: 2.2; font-size: 14px;">
<div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1e40af; padding-bottom: 15px;">
  <p style="font-size: 18px; font-weight: bold; color: #1e40af; margin: 0;">بسمه تعالی</p>
</div>
<div style="margin-bottom: 25px;">
  <p style="font-weight: bold; margin-bottom: 5px;">${recipient}</p>
  <p style="color: #666;">موضوع: ${item.title}</p>
</div>
<div style="margin-bottom: 20px;">
  <p>با سلام و احترام؛</p>
  <p>به استحضار می‌رساند، ${item.description}</p>
</div>
<div style="background: #f0f9ff; border-right: 4px solid #2563eb; padding: 15px; margin: 20px 0; border-radius: 4px;">
  <p style="font-weight: bold; margin-bottom: 8px; color: #1e40af;">شرح موضوع:</p>
  <p>${item.summary}</p>
</div>
${item.applicableLaws.length > 0 ? `<div style="margin-bottom: 20px;">
  <p style="font-weight: bold; margin-bottom: 8px;">مقررات قانونی مستند:</p>
  <ul style="padding-right: 20px; margin: 0;">
    ${item.applicableLaws.map(l => `<li style="margin-bottom: 4px; color: #374151;">${l}</li>`).join('\n    ')}
  </ul>
</div>` : ''}
${item.tags.length > 0 ? `<div style="margin-bottom: 20px;">
  <p style="font-weight: bold; margin-bottom: 8px;">کلیدواژه‌ها:</p>
  <div style="display: flex; flex-wrap: wrap; gap: 6px;">
    ${item.tags.map(t => `<span style="background: #e5e7eb; padding: 2px 10px; border-radius: 12px; font-size: 12px; color: #374151;">${t}</span>`).join('\n    ')}
  </div>
</div>` : ''}
<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #d1d5db;">
  <p>با تجدید احترام</p>
</div>
<div style="margin-top: 40px; text-align: left;">
  <p style="color: #9ca3af; font-size: 11px;">دسته‌بندی: ${catName} | سطح: ${item.difficulty === 'GENERAL' ? 'عمومی' : item.difficulty === 'SPECIALIZED' ? 'تخصصی' : 'پیشرفته'}</p>
</div>
</div>`;
}

export async function POST() {
  try {
    // Check if already seeded
    const existingCount = await db.officialLetter.count();
    if (existingCount > 0) {
      return NextResponse.json({
        message: `نامه‌ها از قبل موجود هستند (${existingCount} نامه)`,
        count: existingCount,
        seeded: true,
      });
    }

    // Merge all letter data
    const allLetters = [...LETTERS_DATA_PART1, ...LETTERS_DATA_PART2];

    // Extract unique categories from data
    const categorySlugs = [...new Set(allLetters.map(l => l.categorySlug))];

    // Create categories in DB
    const categoryMap = new Map<string, string>(); // slug -> id
    for (const slug of categorySlugs) {
      const meta = CATEGORY_META[slug] || { name: slug, icon: 'FileText', color: '#6b7280', order: 99 };
      const cat = await db.letterCategory.create({
        data: {
          name: meta.name,
          slug,
          icon: meta.icon,
          color: meta.color,
          order: meta.order,
        },
      });
      categoryMap.set(slug, cat.id);
    }

    // Create letters in batches
    const BATCH_SIZE = 50;
    let totalCreated = 0;

    for (let i = 0; i < allLetters.length; i += BATCH_SIZE) {
      const batch = allLetters.slice(i, i + BATCH_SIZE);
      await db.officialLetter.createMany({
        data: batch.map(item => ({
          title: item.title,
          slug: item.slug,
          description: item.description,
          content: generateLetterContent(item),
          summary: item.summary,
          categoryId: categoryMap.get(item.categorySlug)!,
          recipientType: item.recipientType,
          tags: JSON.stringify(item.tags),
          applicableLaws: JSON.stringify(item.applicableLaws),
          difficulty: item.difficulty,
          isPublished: true,
        })),
        skipDuplicates: true,
      });
      totalCreated += batch.length;
    }

    // Update category letter counts
    for (const [slug, catId] of categoryMap.entries()) {
      const count = await db.officialLetter.count({ where: { categoryId: catId } });
      // Prisma doesn't have letterCount field, skip
    }

    return NextResponse.json({
      message: `با موفقیت ${totalCreated} نامه در ${categorySlugs.length} دسته‌بندی ایجاد شد`,
      count: totalCreated,
      categories: categorySlugs.length,
      seeded: true,
    });
  } catch (error) {
    console.error('Seed letters error:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد نامه‌ها', details: String(error) },
      { status: 500 }
    );
  }
}
