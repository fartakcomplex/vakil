import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET licenses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status') || '';
    const licenseType = searchParams.get('licenseType') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build where clause
    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (licenseType) {
      where.licenseType = licenseType;
    }

    const [licenses, total] = await Promise.all([
      db.license.findMany({
        where,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.license.count({ where }),
    ]);

    return NextResponse.json({
      licenses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get licenses error:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت مجوزها' },
      { status: 500 }
    );
  }
}
