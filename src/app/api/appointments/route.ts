import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTokenFromHeader } from '@/lib/auth';

// GET appointments
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
    const status = searchParams.get('status');
    const lawyerId = searchParams.get('lawyerId');
    const clientId = searchParams.get('clientId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (lawyerId) where.lawyerId = lawyerId;
    if (clientId) where.clientId = clientId;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) (where.date as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) (where.date as Record<string, unknown>).lte = new Date(dateTo);
    }

    const [appointments, total] = await Promise.all([
      db.appointment.findMany({
        where,
        include: {
          lawyer: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          client: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.appointment.count({ where }),
    ]);

    return NextResponse.json({
      appointments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    return NextResponse.json({ error: 'خطا در دریافت نوبت‌ها' }, { status: 500 });
  }
}

// POST create appointment
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
    const { title, description, date, startTime, endTime, lawyerId, clientId, type, notes } = body;

    if (!title || !date || !startTime || !endTime || !lawyerId || !clientId) {
      return NextResponse.json({ error: 'فیلدهای الزامی را تکمیل کنید' }, { status: 400 });
    }

    const appointment = await db.appointment.create({
      data: {
        title,
        description,
        date: new Date(date),
        startTime,
        endTime,
        lawyerId,
        clientId,
        type: type || 'IN_PERSON',
        notes,
      },
      include: {
        lawyer: { select: { id: true, firstName: true, lastName: true } },
        client: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Create notification for lawyer
    await db.notification.create({
      data: {
        userId: lawyerId,
        title: 'نوبت جدید',
        message: `نوبت جدیدی با عنوان "${title}" برای ${session.user.firstName} ${session.user.lastName} ثبت شد`,
        type: 'INFO',
        category: 'appointment',
        link: `/appointments/${appointment.id}`,
      },
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    console.error('Create appointment error:', error);
    return NextResponse.json({ error: 'خطا در ایجاد نوبت' }, { status: 500 });
  }
}
