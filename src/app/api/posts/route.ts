import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTokenFromHeader } from '@/lib/auth';

// GET social posts
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
    const type = searchParams.get('type');
    const authorId = searchParams.get('authorId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (authorId) where.authorId = authorId;

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        include: {
          author: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true, lawyerProfile: true } },
          comments: {
            include: {
              author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
            },
            orderBy: { createdAt: 'asc' },
            take: 10,
          },
          _count: { select: { comments: true } },
        },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.post.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json({ error: 'خطا در دریافت پست‌ها' }, { status: 500 });
  }
}

// POST create post
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
    const { title, content, type, tags, isPinned } = body;

    if (!content) {
      return NextResponse.json({ error: 'محتوای پست الزامی است' }, { status: 400 });
    }

    const post = await db.post.create({
      data: {
        authorId: session.user.id,
        title,
        content,
        type: type || 'DISCUSSION',
        tags: tags ? JSON.stringify(tags) : null,
        isPinned: isPinned || false,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json({ error: 'خطا در ایجاد پست' }, { status: 500 });
  }
}
