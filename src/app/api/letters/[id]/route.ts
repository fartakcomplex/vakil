import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const letter = await db.officialLetter.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true, icon: true, color: true } },
      },
    });

    if (!letter) {
      return NextResponse.json({ error: 'نامه یافت نشد' }, { status: 404 });
    }

    // Increment view count
    await db.officialLetter.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ letter });
  } catch (error) {
    console.error('Get letter by ID error:', error);
    return NextResponse.json({ error: 'خطا در دریافت نامه' }, { status: 500 });
  }
}
