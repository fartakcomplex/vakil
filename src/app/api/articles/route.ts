import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET articles - with optional categories mode
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Mode: categories - return category tree only
    if (searchParams.get('mode') === 'categories') {
      const categories = await db.articleCategory.findMany({
        orderBy: { order: 'asc' },
        include: {
          children: { orderBy: { order: 'asc' } },
          _count: { select: { articles: { where: { isPublished: true } } } },
        },
        where: { parentId: null },
      });
      return NextResponse.json({ categories });
    }

    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const articleType = searchParams.get('articleType') || '';
    const difficulty = searchParams.get('difficulty') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build where clause
    const where: Record<string, unknown> = { isPublished: true };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { summary: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (articleType) {
      where.articleType = articleType;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    const [articles, total, categories] = await Promise.all([
      db.legalArticle.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true, icon: true, color: true },
          },
          author: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.legalArticle.count({ where }),
      db.articleCategory.findMany({
        where: { parentId: null },
        orderBy: { order: 'asc' },
        include: {
          children: { orderBy: { order: 'asc' } },
          _count: { select: { articles: { where: { isPublished: true } } } },
        },
      }),
    ]);

    return NextResponse.json({
      articles,
      categories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get articles error:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت مقالات' },
      { status: 500 }
    );
  }
}
