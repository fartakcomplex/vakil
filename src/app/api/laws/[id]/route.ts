import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const law = await db.legalLaw.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true, icon: true, color: true } },
      },
    });

    if (!law) {
      return NextResponse.json({ error: 'قانون یافت نشد' }, { status: 404 });
    }

    // Increment view count
    await db.legalLaw.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ law });
  } catch (error) {
    console.error('Get law by ID error:', error);
    return NextResponse.json({ error: 'خطا در دریافت قانون' }, { status: 500 });
  }
}
