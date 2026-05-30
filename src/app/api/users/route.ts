import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, getTokenFromHeader, isAdmin } from '@/lib/auth';

// GET all users (admin only)
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

    if (!isAdmin(session.user.role)) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        include: {
          lawyerProfile: true,
          clientProfile: true,
          accountantProfile: true,
          internProfile: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    const usersWithoutPassword = users.map(({ password: _, ...u }) => u);

    return NextResponse.json({
      users: usersWithoutPassword,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'خطا در دریافت لیست کاربران' }, { status: 500 });
  }
}

// POST create user (admin only)
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

    if (!isAdmin(session.user.role)) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, firstName, lastName, phone, nationalCode, role } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'فیلدهای الزامی را تکمیل کنید' }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'کاربری با این ایمیل قبلاً ثبت شده است' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        nationalCode,
        role: role || 'CLIENT',
      },
    });

    if (role === 'LAWYER') {
      await db.lawyerProfile.create({ data: { userId: user.id } });
    } else if (role === 'CLIENT') {
      await db.clientProfile.create({ data: { userId: user.id } });
    } else if (role === 'ACCOUNTANT') {
      await db.accountantProfile.create({ data: { userId: user.id } });
    } else if (role === 'INTERN') {
      await db.internProfile.create({ data: { userId: user.id, startDate: new Date() } });
    }

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'خطا در ایجاد کاربر' }, { status: 500 });
  }
}
