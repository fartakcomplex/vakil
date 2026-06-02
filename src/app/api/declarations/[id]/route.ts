import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const declaration = await db.declaration.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true, icon: true, color: true } },
      },
    });

    if (!declaration) {
      return NextResponse.json({ error: 'اظهارنامه یافت نشد' }, { status: 404 });
    }

    // Increment view count
    await db.declaration.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ declaration });
  } catch (error) {
    console.error('Get declaration by ID error:', error);
    return NextResponse.json({ error: 'خطا در دریافت اظهارنامه' }, { status: 500 });
  }
}
