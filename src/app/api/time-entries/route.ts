import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTokenFromHeader } from '@/lib/auth';

// GET time entries
export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request);
    if (!token) {
      return NextResponse.json({ error: 'توکن احراز هویت یافت نشد' }, { status: 401 });
    }

    const session = await db.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'نشست نامعتبر است' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const caseId = searchParams.get('caseId');
    const isBilled = searchParams.get('isBilled');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (caseId) where.caseId = caseId;
    if (isBilled !== null && isBilled !== undefined) where.isBilled = isBilled === 'true';
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) (where.date as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) (where.date as Record<string, unknown>).lte = new Date(dateTo);
    }

    const [timeEntries, total] = await Promise.all([
      db.timeEntry.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.timeEntry.count({ where }),
    ]);

    // Calculate total hours
    const totalHours = await db.timeEntry.aggregate({
      where,
      _sum: { hours: true },
    });

    return NextResponse.json({
      timeEntries,
      totalHours: totalHours._sum.hours || 0,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get time entries error:', error);
    return NextResponse.json({ error: 'خطا در دریافت ثبت زمان‌ها' }, { status: 500 });
  }
}

// POST create time entry
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request);
    if (!token) {
      return NextResponse.json({ error: 'توکن احراز هویت یافت نشد' }, { status: 401 });
    }

    const session = await db.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'نشست نامعتبر است' }, { status: 401 });
    }

    const body = await request.json();
    const { caseId, date, hours, description } = body;

    if (!date || hours === undefined || hours <= 0) {
      return NextResponse.json({ error: 'تاریخ و مدت زمان الزامی است' }, { status: 400 });
    }

    const timeEntry = await db.timeEntry.create({
      data: {
        userId: session.user.id,
        caseId,
        date: new Date(date),
        hours,
        description,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json({ timeEntry }, { status: 201 });
  } catch (error) {
    console.error('Create time entry error:', error);
    return NextResponse.json({ error: 'خطا در ثبت زمان' }, { status: 500 });
  }
}
