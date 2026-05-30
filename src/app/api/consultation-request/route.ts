import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST public consultation request (no auth required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, consultationType, legalArea, description } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'نام و شماره تلفن الزامی است' },
        { status: 400 }
      );
    }

    // Find first admin user to assign the lead to
    const adminUser = await db.user.findFirst({
      where: { role: { in: ['SUPER_ADMIN', 'COMPLEX_MANAGER'] } },
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: 'سیستم در حال حاضر قادر به دریافت درخواست نیست' },
        { status: 503 }
      );
    }

    const lead = await db.lead.create({
      data: {
        name,
        email: email || null,
        phone,
        source: `CONSULTATION_${consultationType || 'WEBSITE'}`,
        status: 'NEW',
        assignedToId: adminUser.id,
        value: 0,
        notes: `نوع مشاوره: ${consultationType || 'نامشخص'}\nحوزه حقوقی: ${legalArea || 'نامشخص'}${description ? '\nتوضیحات: ' + description : ''}`,
      },
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json(
      { message: 'درخواست مشاوره شما با موفقیت ثبت شد', leadId: lead.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Consultation request error:', error);
    return NextResponse.json(
      { error: 'خطا در ثبت درخواست مشاوره' },
      { status: 500 }
    );
  }
}
