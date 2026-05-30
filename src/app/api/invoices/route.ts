import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTokenFromHeader } from '@/lib/auth';

// GET invoices
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
    const clientId = searchParams.get('clientId');
    const caseId = searchParams.get('caseId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (clientId) where.clientId = clientId;
    if (caseId) where.caseId = caseId;

    const [invoices, total] = await Promise.all([
      db.invoice.findMany({
        where,
        include: {
          client: { select: { id: true, firstName: true, lastName: true } },
          creator: { select: { id: true, firstName: true, lastName: true } },
          case: { select: { id: true, title: true, caseNumber: true } },
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.invoice.count({ where }),
    ]);

    return NextResponse.json({
      invoices,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    return NextResponse.json({ error: 'خطا در دریافت فاکتورها' }, { status: 500 });
  }
}

// POST create invoice
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
    const { clientId, caseId, amount, tax, discount, dueDate, notes } = body;

    if (!clientId || amount === undefined || !dueDate) {
      return NextResponse.json({ error: 'فیلدهای الزامی را تکمیل کنید' }, { status: 400 });
    }

    // Generate invoice number
    const invoiceCount = await db.invoice.count();
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(4, '0')}-${new Date().getFullYear()}`;

    const taxAmount = tax || 0;
    const discountAmount = discount || 0;
    const total = amount + taxAmount - discountAmount;

    const invoice = await db.invoice.create({
      data: {
        invoiceNumber,
        clientId,
        caseId,
        amount,
        tax: taxAmount,
        discount: discountAmount,
        total,
        status: 'PENDING',
        dueDate: new Date(dueDate),
        createdBy: session.user.id,
        notes,
      },
      include: {
        client: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    console.error('Create invoice error:', error);
    return NextResponse.json({ error: 'خطا در ایجاد فاکتور' }, { status: 500 });
  }
}
