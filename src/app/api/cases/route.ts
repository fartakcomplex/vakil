import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTokenFromHeader } from '@/lib/auth';

// GET all cases
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
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const lawyerId = searchParams.get('lawyerId');
    const clientId = searchParams.get('clientId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (type) where.type = type;
    if (priority) where.priority = priority;
    if (lawyerId) where.lawyerId = lawyerId;
    if (clientId) where.clientId = clientId;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { caseNumber: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [cases, total] = await Promise.all([
      db.legalCase.findMany({
        where,
        include: {
          lawyer: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          client: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          intern: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.legalCase.count({ where }),
    ]);

    return NextResponse.json({
      cases,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get cases error:', error);
    return NextResponse.json({ error: 'خطا در دریافت پرونده‌ها' }, { status: 500 });
  }
}

// POST create case
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
    const { title, type, clientId, lawyerId, internId, description, summary, court, courtBranch, judgeName, priority, filingDate, nextHearing, tags } = body;

    if (!title || !type || !clientId || !description) {
      return NextResponse.json({ error: 'فیلدهای الزامی را تکمیل کنید' }, { status: 400 });
    }

    // Generate case number
    const caseCount = await db.legalCase.count();
    const caseNumber = `CASE-${String(caseCount + 1).padStart(4, '0')}-${new Date().getFullYear()}`;

    const legalCase = await db.legalCase.create({
      data: {
        title,
        caseNumber,
        type,
        description,
        summary,
        court,
        courtBranch,
        judgeName,
        priority: priority || 'MEDIUM',
        filingDate: filingDate ? new Date(filingDate) : undefined,
        nextHearing: nextHearing ? new Date(nextHearing) : undefined,
        clientId,
        lawyerId,
        internId,
        tags: tags ? JSON.stringify(tags) : null,
      },
      include: {
        lawyer: { select: { id: true, firstName: true, lastName: true } },
        client: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json({ case: legalCase }, { status: 201 });
  } catch (error) {
    console.error('Create case error:', error);
    return NextResponse.json({ error: 'خطا در ایجاد پرونده' }, { status: 500 });
  }
}
