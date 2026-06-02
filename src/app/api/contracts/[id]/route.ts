import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const contract = await db.contract.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true, icon: true, color: true } },
      },
    });

    if (!contract) {
      return NextResponse.json({ error: 'قرارداد یافت نشد' }, { status: 404 });
    }

    // Increment view count
    await db.contract.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ contract });
  } catch (error) {
    console.error('Get contract by ID error:', error);
    return NextResponse.json({ error: 'خطا در دریافت قرارداد' }, { status: 500 });
  }
}
