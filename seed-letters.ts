import { PrismaClient } from '@prisma/client';
import { LETTERS_DATA_PART1 } from './src/lib/letters-data-part1';
import { LETTERS_DATA_PART2 } from './src/lib/letters-data-part2';

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: 'دادگاه‌ها و مراجع قضایی', slug: 'courts', icon: 'Scale', color: '#dc2626', order: 1 },
  { name: 'اداره بیمه', slug: 'insurance', icon: 'Shield', color: '#16a34a', order: 2 },
  { name: 'اداره مالیات و دارایی', slug: 'tax', icon: 'Landmark', color: '#ca8a04', order: 3 },
  { name: 'تامین اجتماعی', slug: 'social-security', icon: 'HeartPulse', color: '#059669', order: 4 },
  { name: 'وزارت کار و اداره کار', slug: 'labor', icon: 'Briefcase', color: '#ea580c', order: 5 },
  { name: 'شهرداری و دهیاری', slug: 'municipality', icon: 'Building', color: '#0891b2', order: 6 },
  { name: 'اداره ثبت اسناد و املاک', slug: 'registry', icon: 'FileCheck', color: '#7c3aed', order: 7 },
  { name: 'بانک‌ها و موسسات مالی', slug: 'banking', icon: 'Building2', color: '#2563eb', order: 8 },
  { name: 'وزارت صمت', slug: 'industry', icon: 'Factory', color: '#64748b', order: 9 },
  { name: 'صندوق‌ها و بیمه‌های خاص', slug: 'funds', icon: 'PiggyBank', color: '#65a30d', order: 10 },
  { name: 'اوقاف و امور خیریه', slug: 'charity', icon: 'Heart', color: '#e11d48', order: 11 },
  { name: 'آموزش و پرورش', slug: 'education', icon: 'GraduationCap', color: '#9333ea', order: 12 },
  { name: 'دانشگاه و علوم', slug: 'university', icon: 'BookOpen', color: '#0284c7', order: 13 },
  { name: 'بهداشت و درمان', slug: 'health', icon: 'Stethoscope', color: '#ef4444', order: 14 },
  { name: 'سازمان ثبت احوال', slug: 'civil-registry', icon: 'UserCheck', color: '#0d9488', order: 15 },
  { name: 'راه و شهرسازی و نوسازی', slug: 'housing', icon: 'Home', color: '#d97706', order: 16 },
  { name: 'نیروی انتظامی و پلیس', slug: 'police', icon: 'ShieldAlert', color: '#1e40af', order: 17 },
  { name: 'قوه قضاییه و دیوان عدالت', slug: 'judiciary', icon: 'Gavel', color: '#991b1b', order: 18 },
  { name: 'شورای حل اختلاف', slug: 'dispute-council', icon: 'Users', color: '#15803d', order: 19 },
  { name: 'سایر نامه‌های حقوقی', slug: 'other', icon: 'FileText', color: '#78716c', order: 20 },
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function generateContent(letter: any): string {
  const h = hashStr(letter.slug);
  const refs = letter.applicableLaws && letter.applicableLaws.length > 0
    ? letter.applicableLaws.join(" \u060C ")
    : "";
  const attachments = [
    "\u062A\u0635\u0648\u06CC\u0631 \u06A9\u0627\u0631\u062A \u0645\u0644\u06CC",
    "\u062A\u0635\u0648\u06CC\u0631 \u0634\u0646\u0627\u0633\u0646\u0627\u0645\u0647",
    "\u06A9\u067E\u06CC \u0633\u0646\u062F \u0645\u0627\u0644\u06A9\u06CC\u062A",
    "\u06AF\u0648\u0627\u0647\u06CC \u0639\u062F\u0645 \u0633\u0648\u0621\u067E\u06CC\u0634\u0646\u0647",
    "\u0635\u0648\u0631\u062A\u062C\u0644\u0633\u0647",
    "\u0631\u0627\u06CC \u062F\u0627\u062F\u06AF\u0627\u0647",
    "\u0628\u06CC\u0645\u0647\u200C\u0646\u0627\u0645\u0647",
    "\u0641\u06CC\u0634 \u0645\u0627\u0644\u06CC\u0627\u062A\u06CC",
    "\u0631\u0633\u06CC\u062F \u067E\u0631\u062F\u0627\u062E\u062A",
    "\u0648\u06A9\u0627\u0644\u062A\u0646\u0627\u0645\u0647",
  ];
  const numAtt = 3 + (h % 4);
  const atts: string[] = [];
  for (let i = 0; i < numAtt; i++) atts.push(attachments[(h + i * 7) % attachments.length]);

  const lines = [
    '<div dir="rtl" style="font-family:Tahoma,sans-serif;padding:20px;line-height:2.2">',
    '<h3 style="text-align:center;font-size:14pt;font-weight:bold;margin-bottom:20px">\u0628\u0633\u0645\u0647 \u062A\u0639\u0627\u0644\u06CC</h3>',
    '<p style="margin-bottom:10px"><strong>\u062A\u0627\u0631\u06CC\u062E:</strong> ............</p>',
    '<p style="margin-bottom:10px"><strong>\u0634\u0645\u0627\u0631\u0647:</strong> ............</p>',
    '<p style="margin-bottom:10px"><strong>\u067E\u06CC\u0648\u0633\u062A:</strong> ' + numAtt + ' \u0628\u0631\u06AF\u0647</p>',
    '<hr style="margin:15px 0"/>',
    '<p><strong>\u0645\u0648\u0636\u0648\u0639:</strong> ' + letter.title + '</p>',
    '<p>\u0628\u0627 \u0633\u0644\u0627\u0645 \u0648 \u0627\u062D\u062A\u0631\u0627\u0645\u060C \u0628\u062F\u06CC\u0646\u200C\u0648\u0633\u06CC\u0644\u0647 \u0631\u0627\u062C\u0639 \u0628\u0647 \u0645\u0648\u0636\u0648\u0639 \u00AB' + letter.title + '\u00BB \u0628\u0647 \u0627\u0633\u062A\u062D\u0636\u0627\u0631 \u0645\u06CC\u200C\u0631\u0633\u0627\u0646\u062F:</p>',
    '<p>' + letter.description + '</p>',
    '<p>\u0628\u062F\u06CC\u0646\u200C\u0648\u0633\u06CC\u0644\u0647 \u0628\u0627 \u0639\u0646\u0627\u06CC\u062A \u0628\u0647 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u067E\u06CC\u0648\u0633\u062A \u0648 \u0645\u0642\u0631\u0631\u0627\u062A \u0642\u0627\u0646\u0648\u0646\u06CC\u060C \u0627\u0632 \u0645\u0642\u0627\u0645 \u0645\u062D\u062A\u0631\u0645 \u062A\u0642\u0627\u0636\u0627\u06CC \u0631\u0633\u06CC\u062F\u06AF\u06CC \u0648 \u0635\u062F\u0648\u0631 \u062F\u0633\u062A\u0648\u0631 \u0644\u0627\u0632\u0645 \u0631\u0627 \u0627\u0633\u062A\u062F\u0639\u0627 \u062F\u0627\u0631\u0645. ' + (refs ? '\u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0642\u0627\u0646\u0648\u0646\u06CC: ' + refs : '') + '</p>',
    '<hr style="margin:20px 0"/>',
    '<p style="white-space:pre-line">\u0646\u0627\u0645\u0647\u200C\u062F\u0647\u0646\u062F\u0647: ............\n\u06A9\u062F \u0645\u0644\u06CC: ............\n\u062A\u0627\u0631\u06CC\u062E: ............\n\u0627\u0645\u0636\u0627 \u0648 \u0645\u0647\u0631:</p>',
    '<hr style="margin:15px 0"/>',
    '<p style="font-size:10pt;color:#666"><strong>\u067E\u06CC\u0648\u0633\u062A\u200C\u0647\u0627:</strong><br/>' + atts.map((a, i) => (i + 1) + '. ' + a).join('<br/>') + '</p>',
    '<p style="font-size:9pt;color:#999"><strong>\u0631\u0648\u0646\u0648\u0634\u062A:</strong> \u0628\u0627\u06CC\u06AF\u0627\u0646\u06CC - \u067E\u0631\u0648\u0646\u062F\u0647 \u0645\u0648\u06A9\u0644</p>',
    '</div>',
  ];
  return lines.join('\n');
}

async function main() {
  console.log('Creating 20 categories...');
  const catMap: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    const c = await prisma.letterCategory.create({ data: cat });
    catMap[cat.slug] = c.id;
    console.log('  Created:', cat.name);
  }

  const allLetters = [...LETTERS_DATA_PART1, ...LETTERS_DATA_PART2];
  console.log('Total letters to seed:', allLetters.length);

  const BATCH = 50;
  let count = 0;
  for (let i = 0; i < allLetters.length; i += BATCH) {
    const batch = allLetters.slice(i, i + BATCH);
    const ops = batch
      .filter((l: any) => catMap[l.categorySlug])
      .map((l: any) =>
        prisma.officialLetter.create({
          data: {
            title: l.title,
            slug: l.slug,
            description: l.description,
            content: generateContent(l),
            summary: l.summary,
            categoryId: catMap[l.categorySlug],
            recipientType: l.recipientType,
            tags: JSON.stringify(l.tags),
            applicableLaws: JSON.stringify(l.applicableLaws),
            difficulty: l.difficulty,
            isPublished: true,
            version: '1.0',
          },
        })
      );
    await Promise.all(ops);
    count += ops.length;
    console.log('Progress:', count + '/' + allLetters.length);
  }

  console.log('DONE! Created', count, 'letters in 20 categories');
  await prisma.$disconnect();
}

main().catch((e: any) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
