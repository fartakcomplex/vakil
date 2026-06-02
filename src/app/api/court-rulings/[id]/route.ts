import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const ruling = await db.courtRuling.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true, icon: true, color: true } },
      },
    });

    if (!ruling) {
      return NextResponse.json({ error: 'رأی قضایی یافت نشد' }, { status: 404 });
    }

    // Increment view count
    await db.courtRuling.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ ruling });
  } catch (error) {
    console.error('Get court ruling by ID error:', error);
    return NextResponse.json({ error: 'خطا در دریافت رأی قضایی' }, { status: 500 });
  }
}
