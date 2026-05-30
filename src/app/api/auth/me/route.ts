import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTokenFromHeader } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request);
    if (!token) {
      return NextResponse.json(
        { error: 'توکن احراز هویت یافت نشد' },
        { status: 401 }
      );
    }

    // Find session by token
    const session = await db.session.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            lawyerProfile: true,
            clientProfile: true,
            accountantProfile: true,
            internProfile: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'نشست نامعتبر است' },
        { status: 401 }
      );
    }

    if (session.expiresAt < new Date()) {
      // Delete expired session
      await db.session.delete({ where: { id: session.id } });
      return NextResponse.json(
        { error: 'نشست منقضی شده است' },
        { status: 401 }
      );
    }

    const { password: _, ...userWithoutPassword } = session.user;

    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات کاربر' },
      { status: 500 }
    );
  }
}
