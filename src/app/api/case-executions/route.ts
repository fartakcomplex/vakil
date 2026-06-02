import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET case executions - with filters and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const executionType = searchParams.get('executionType') || '';
    const caseId = searchParams.get('caseId') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { description: { contains: search } },
        { executionNumber: { contains: search } },
        { court: { contains: search } },
        { judge: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (executionType) {
      where.executionType = executionType;
    }

    if (caseId) {
      where.caseId = caseId;
    }

    const [executions, total] = await Promise.all([
      db.caseExecution.findMany({
        where,
        include: {
          case: {
            select: {
              id: true,
              caseNumber: true,
              title: true,
              status: true,
              type: true,
            },
          },
          _count: {
            select: { actions: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.caseExecution.count({ where }),
    ]);

    return NextResponse.json({
      executions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get case executions error:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اجراییه‌ها' },
      { status: 500 }
    );
  }
}
