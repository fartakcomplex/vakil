import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const powerOfAttorney = await db.powerOfAttorney.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true, icon: true, color: true } },
      },
    });

    if (!powerOfAttorney) {
      return NextResponse.json({ error: 'وکالتنامه یافت نشد' }, { status: 404 });
    }

    // Increment view count
    await db.powerOfAttorney.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ powerOfAttorney });
  } catch (error) {
    console.error('Get power of attorney by ID error:', error);
    return NextResponse.json({ error: 'خطا در دریافت وکالتنامه' }, { status: 500 });
  }
}
