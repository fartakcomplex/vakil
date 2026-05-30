import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTokenFromHeader } from '@/lib/auth';

// GET courses
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
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const [courses, total] = await Promise.all([
      db.course.findMany({
        where,
        include: {
          _count: { select: { enrollments: true, lessons: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.course.count({ where }),
    ]);

    // Get user enrollments for each course
    const enrollments = await db.enrollment.findMany({
      where: { userId: session.user.id },
      select: { courseId: true, status: true, progress: true },
    });

    const enrollmentMap = new Map(enrollments.map((e) => [e.courseId, e]));

    const coursesWithEnrollment = courses.map((course) => ({
      ...course,
      userEnrollment: enrollmentMap.get(course.id) || null,
    }));

    return NextResponse.json({
      courses: coursesWithEnrollment,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get courses error:', error);
    return NextResponse.json({ error: 'خطا در دریافت دوره‌ها' }, { status: 500 });
  }
}

// POST create course
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
    const { title, description, type, status, thumbnail, duration } = body;

    if (!title) {
      return NextResponse.json({ error: 'عنوان دوره الزامی است' }, { status: 400 });
    }

    const course = await db.course.create({
      data: {
        title,
        description,
        type: type || 'COURSE',
        status: status || 'DRAFT',
        thumbnail,
        duration: duration || 0,
        instructorId: session.user.id,
      },
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    console.error('Create course error:', error);
    return NextResponse.json({ error: 'خطا در ایجاد دوره' }, { status: 500 });
  }
}
