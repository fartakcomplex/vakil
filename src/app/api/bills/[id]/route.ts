import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const bill = await db.bill.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true, icon: true, color: true } },
      },
    });

    if (!bill) {
      return NextResponse.json({ error: 'لایحه یافت نشد' }, { status: 404 });
    }

    // Increment view count
    await db.bill.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ bill });
  } catch (error) {
    console.error('Get bill by ID error:', error);
    return NextResponse.json({ error: 'خطا در دریافت لایحه' }, { status: 500 });
  }
}
