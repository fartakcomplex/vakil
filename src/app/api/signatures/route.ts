import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET signing workflows - with filters and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const documentType = searchParams.get('documentType') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (documentType) {
      where.documentType = documentType;
    }

    const [workflows, total] = await Promise.all([
      db.signingWorkflow.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
              role: true,
            },
          },
          signatures: {
            include: {
              signer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatar: true,
                  role: true,
                },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.signingWorkflow.count({ where }),
    ]);

    return NextResponse.json({
      workflows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get signatures error:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت امضاهای الکترونیکی' },
      { status: 500 }
    );
  }
}
