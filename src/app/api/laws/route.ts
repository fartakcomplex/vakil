import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET laws - with optional categories mode
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Mode: categories - return category tree only
    if (searchParams.get('mode') === 'categories') {
      const categories = await db.legalLawCategory.findMany({
        orderBy: { order: 'asc' },
        include: {
          children: { orderBy: { order: 'asc' } },
          _count: { select: { laws: { where: { isPublished: true } } } },
        },
        where: { parentId: null },
      });
      return NextResponse.json({ categories });
    }

    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const difficulty = searchParams.get('difficulty') || '';
    const lawType = searchParams.get('lawType') || '';
    const searchContent = searchParams.get('searchContent') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    // Build where clause
    const where: Record<string, unknown> = { isPublished: true };

    if (search) {
      // By default, search in metadata fields only (fast)
      const searchFields: Record<string, unknown>[] = [
        { title: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
        { summary: { contains: search } },
      ];
      // Only search content when explicitly requested
      if (searchContent) {
        searchFields.push({ content: { contains: search } });
      }
      where.OR = searchFields;
    }

    if (lawType) {
      where.lawType = lawType;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    // Don't include full content in list view (performance)
    const [laws, total, categories] = await Promise.all([
      db.legalLaw.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          summary: true,
          categoryId: true,
          lawNumber: true,
          lawType: true,
          approvalDate: true,
          source: true,
          tags: true,
          difficulty: true,
          viewCount: true,
          isPublished: true,
          version: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: { id: true, name: true, slug: true, icon: true, color: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.legalLaw.count({ where }),
      db.legalLawCategory.findMany({
        where: { parentId: null },
        orderBy: { order: 'asc' },
        include: {
          children: { orderBy: { order: 'asc' } },
          _count: { select: { laws: { where: { isPublished: true } } } },
        },
      }),
    ]);

    return NextResponse.json({
      laws,
      categories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get laws error:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت قوانین' },
      { status: 500 }
    );
  }
}
