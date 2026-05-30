import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone, nationalCode, role } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'ایمیل، رمز عبور، نام و نام خانوادگی الزامی است' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'رمز عبور باید حداقل ۶ کاراکتر باشد' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'کاربری با این ایمیل قبلاً ثبت شده است' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        nationalCode,
        role: role || 'CLIENT',
        isActive: true,
        isVerified: false,
      },
    });

    // Create role-specific profile
    if (role === 'LAWYER') {
      await db.lawyerProfile.create({
        data: { userId: user.id },
      });
    } else if (role === 'CLIENT') {
      await db.clientProfile.create({
        data: { userId: user.id },
      });
    } else if (role === 'ACCOUNTANT') {
      await db.accountantProfile.create({
        data: { userId: user.id },
      });
    } else if (role === 'INTERN') {
      await db.internProfile.create({
        data: { userId: user.id, startDate: new Date() },
      });
    }

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: 'ثبت‌نام با موفقیت انجام شد', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'خطا در ثبت‌نام' },
      { status: 500 }
    );
  }
}
