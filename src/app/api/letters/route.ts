import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET letters - with optional categories mode
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Mode: categories - return category tree only
    if (searchParams.get('mode') === 'categories') {
      const categories = await db.letterCategory.findMany({
        orderBy: { order: 'asc' },
        include: {
          children: { orderBy: { order: 'asc' } },
          _count: { select: { letters: { where: { isPublished: true } } } },
        },
        where: { parentId: null },
      });
      return NextResponse.json({ categories });
    }

    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const difficulty = searchParams.get('difficulty') || '';
    const recipientType = searchParams.get('recipientType') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build where clause
    const where: Record<string, unknown> = { isPublished: true };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
        { summary: { contains: search } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (recipientType) {
      where.recipientType = recipientType;
    }

    const [letters, total, categories] = await Promise.all([
      db.officialLetter.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true, icon: true, color: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.officialLetter.count({ where }),
      db.letterCategory.findMany({
        where: { parentId: null },
        orderBy: { order: 'asc' },
        include: {
          children: { orderBy: { order: 'asc' } },
          _count: { select: { letters: { where: { isPublished: true } } } },
        },
      }),
    ]);

    return NextResponse.json({
      letters,
      categories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get letters error:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت نامه‌ها' },
      { status: 500 }
    );
  }
}
