import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTokenFromHeader } from '@/lib/auth';

// GET tasks
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
    const priority = searchParams.get('priority');
    const assignedTo = searchParams.get('assignedTo');
    const caseId = searchParams.get('caseId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedTo = assignedTo;
    if (caseId) where.caseId = caseId;

    const [tasks, total] = await Promise.all([
      db.task.findMany({
        where,
        include: {
          assignee: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          activities: { orderBy: { createdAt: 'desc' }, take: 5 },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.task.count({ where }),
    ]);

    return NextResponse.json({
      tasks,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json({ error: 'خطا در دریافت وظایف' }, { status: 500 });
  }
}

// POST create task
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
    const { title, description, assignedTo, priority, dueDate, caseId } = body;

    if (!title || !assignedTo) {
      return NextResponse.json({ error: 'عنوان و مسئول وظیفه الزامی است' }, { status: 400 });
    }

    const task = await db.task.create({
      data: {
        title,
        description,
        assignedTo,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : undefined,
        caseId,
        createdBy: session.user.id,
      },
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Create notification for assignee
    await db.notification.create({
      data: {
        userId: assignedTo,
        title: 'وظیفه جدید',
        message: `وظیفه جدیدی با عنوان "${title}" به شما اختصاص یافت`,
        type: 'INFO',
        category: 'system',
        link: `/tasks/${task.id}`,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json({ error: 'خطا در ایجاد وظیفه' }, { status: 500 });
  }
}
