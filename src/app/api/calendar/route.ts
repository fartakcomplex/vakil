import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTokenFromHeader } from '@/lib/auth';

// GET calendar events
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
    const type = searchParams.get('type');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const where: Record<string, unknown> = { userId: session.user.id };
    if (type) where.type = type;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) (where.date as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) (where.date as Record<string, unknown>).lte = new Date(dateTo);
    }

    const events = await db.calendarEvent.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Get calendar events error:', error);
    return NextResponse.json({ error: 'خطا در دریافت رویدادهای تقویم' }, { status: 500 });
  }
}

// POST create calendar event
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
    const { title, description, date, startTime, endTime, type, color } = body;

    if (!title || !date) {
      return NextResponse.json({ error: 'عنوان و تاریخ رویداد الزامی است' }, { status: 400 });
    }

    const event = await db.calendarEvent.create({
      data: {
        userId: session.user.id,
        title,
        description,
        date: new Date(date),
        startTime,
        endTime,
        type: type || 'MEETING',
        color,
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Create calendar event error:', error);
    return NextResponse.json({ error: 'خطا در ایجاد رویداد تقویم' }, { status: 500 });
  }
}
