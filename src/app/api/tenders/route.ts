import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET tenders - with filters and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const tenderType = searchParams.get('tenderType') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { organization: { contains: search } },
        { tenderNumber: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (tenderType) {
      where.tenderType = tenderType;
    }

    const [tenders, total] = await Promise.all([
      db.tender.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
              role: true,
            },
          },
          _count: {
            select: { bids: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.tender.count({ where }),
    ]);

    return NextResponse.json({
      tenders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get tenders error:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت مناقصات' },
      { status: 500 }
    );
  }
}
