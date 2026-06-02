import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET surveys
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build where clause
    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    const [surveys, total] = await Promise.all([
      db.survey.findMany({
        where,
        include: {
          _count: {
            select: {
              questions: true,
              responses: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.survey.count({ where }),
    ]);

    return NextResponse.json({
      surveys,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get surveys error:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت نظرسنجی‌ها' },
      { status: 500 }
    );
  }
}
