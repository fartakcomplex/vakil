import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTokenFromHeader } from '@/lib/auth';

// GET payments
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
    const method = searchParams.get('method');
    const invoiceId = searchParams.get('invoiceId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (method) where.method = method;
    if (invoiceId) where.invoiceId = invoiceId;

    const [payments, total] = await Promise.all([
      db.payment.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
          invoice: { select: { id: true, invoiceNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.payment.count({ where }),
    ]);

    return NextResponse.json({
      payments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get payments error:', error);
    return NextResponse.json({ error: 'خطا در دریافت پرداخت‌ها' }, { status: 500 });
  }
}

// POST create payment
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
    const { invoiceId, amount, method, transactionId, description } = body;

    if (amount === undefined || !method) {
      return NextResponse.json({ error: 'مبلغ و روش پرداخت الزامی است' }, { status: 400 });
    }

    const payment = await db.payment.create({
      data: {
        invoiceId,
        amount,
        method,
        transactionId,
        description,
        userId: session.user.id,
        status: 'COMPLETED',
      },
      include: {
        invoice: true,
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Update invoice paid amount if linked to an invoice
    if (invoiceId) {
      const invoice = await db.invoice.findUnique({ where: { id: invoiceId } });
      if (invoice) {
        const newPaidAmount = invoice.paidAmount + amount;
        await db.invoice.update({
          where: { id: invoiceId },
          data: {
            paidAmount: newPaidAmount,
            paidAt: newPaidAmount >= invoice.total ? new Date() : undefined,
            status: newPaidAmount >= invoice.total ? 'PAID' : 'PARTIAL',
          },
        });
      }
    }

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json({ error: 'خطا در ثبت پرداخت' }, { status: 500 });
  }
}
