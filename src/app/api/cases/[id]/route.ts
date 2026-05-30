import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTokenFromHeader } from '@/lib/auth';

type RouteParams = { params: Promise<{ id: string }> };

// GET single case
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    const legalCase = await db.legalCase.findUnique({
      where: { id },
      include: {
        lawyer: { select: { id: true, firstName: true, lastName: true, avatar: true, lawyerProfile: true } },
        client: { select: { id: true, firstName: true, lastName: true, avatar: true, clientProfile: true } },
        intern: { select: { id: true, firstName: true, lastName: true } },
        documents: { orderBy: { createdAt: 'desc' } },
        timeline: { orderBy: { date: 'desc' } },
        comments: { orderBy: { createdAt: 'desc' } },
        notes: { orderBy: { createdAt: 'desc' } },
        hearings: { orderBy: { date: 'desc' } },
        deadlines: { orderBy: { date: 'asc' } },
        invoices: { orderBy: { createdAt: 'desc' } },
        activities: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!legalCase) {
      return NextResponse.json({ error: 'پرونده یافت نشد' }, { status: 404 });
    }

    return NextResponse.json({ case: legalCase });
  } catch (error) {
    console.error('Get case error:', error);
    return NextResponse.json({ error: 'خطا در دریافت پرونده' }, { status: 500 });
  }
}

// PUT update case
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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
    const { title, type, status, priority, description, summary, court, courtBranch, judgeName, lawyerId, internId, nextHearing, closedReason, tags } = body;

    const existingCase = await db.legalCase.findUnique({ where: { id } });
    if (!existingCase) {
      return NextResponse.json({ error: 'پرونده یافت نشد' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (type !== undefined) updateData.type = type;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (description !== undefined) updateData.description = description;
    if (summary !== undefined) updateData.summary = summary;
    if (court !== undefined) updateData.court = court;
    if (courtBranch !== undefined) updateData.courtBranch = courtBranch;
    if (judgeName !== undefined) updateData.judgeName = judgeName;
    if (lawyerId !== undefined) updateData.lawyerId = lawyerId;
    if (internId !== undefined) updateData.internId = internId;
    if (nextHearing !== undefined) updateData.nextHearing = new Date(nextHearing);
    if (closedReason !== undefined) updateData.closedReason = closedReason;
    if (tags !== undefined) updateData.tags = JSON.stringify(tags);
    if (status === 'CLOSED') updateData.closedAt = new Date();

    const updatedCase = await db.legalCase.update({
      where: { id },
      data: updateData,
      include: {
        lawyer: { select: { id: true, firstName: true, lastName: true } },
        client: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json({ case: updatedCase });
  } catch (error) {
    console.error('Update case error:', error);
    return NextResponse.json({ error: 'خطا در بروزرسانی پرونده' }, { status: 500 });
  }
}

// DELETE case
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    const existingCase = await db.legalCase.findUnique({ where: { id } });
    if (!existingCase) {
      return NextResponse.json({ error: 'پرونده یافت نشد' }, { status: 404 });
    }

    await db.legalCase.delete({ where: { id } });

    return NextResponse.json({ message: 'پرونده با موفقیت حذف شد' });
  } catch (error) {
    console.error('Delete case error:', error);
    return NextResponse.json({ error: 'خطا در حذف پرونده' }, { status: 500 });
  }
}
