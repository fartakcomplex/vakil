import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET pro bono cases - with filters and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const caseType = searchParams.get('caseType') || '';
    const priority = searchParams.get('priority') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { applicantName: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (caseType) {
      where.caseType = caseType;
    }

    if (priority) {
      where.priority = priority;
    }

    const [proBonoCases, total] = await Promise.all([
      db.proBonoCase.findMany({
        where,
        include: {
          lawyer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
              role: true,
              lawyerProfile: {
                select: {
                  licenseNumber: true,
                  specialization: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.proBonoCase.count({ where }),
    ]);

    return NextResponse.json({
      proBonoCases,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get pro bono cases error:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت پرونده‌های حسن نیت' },
      { status: 500 }
    );
  }
}
