import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET digital library books - with optional categories mode
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Mode: categories - return category tree only
    if (searchParams.get('mode') === 'categories') {
      const categories = await db.digitalBookCategory.findMany({
        orderBy: { order: 'asc' },
        include: {
          children: { orderBy: { order: 'asc' } },
          _count: { select: { books: { where: { isPublished: true } } } },
        },
        where: { parentId: null },
      });
      return NextResponse.json({ categories });
    }

    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const bookType = searchParams.get('bookType') || '';
    const difficulty = searchParams.get('difficulty') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build where clause
    const where: Record<string, unknown> = { isPublished: true };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { author: { contains: search } },
        { publisher: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (bookType) {
      where.bookType = bookType;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    const [books, total, categories] = await Promise.all([
      db.digitalBook.findMany({
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
      db.digitalBook.count({ where }),
      db.digitalBookCategory.findMany({
        where: { parentId: null },
        orderBy: { order: 'asc' },
        include: {
          children: { orderBy: { order: 'asc' } },
          _count: { select: { books: { where: { isPublished: true } } } },
        },
      }),
    ]);

    return NextResponse.json({
      books,
      categories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get digital library error:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت کتابخانه دیجیتال' },
      { status: 500 }
    );
  }
}
