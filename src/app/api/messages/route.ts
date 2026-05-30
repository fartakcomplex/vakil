import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTokenFromHeader } from '@/lib/auth';

// GET messages
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
    const withUserId = searchParams.get('with');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '30');

    const where: Record<string, unknown> = {
      OR: [
        { senderId: session.user.id },
        { receiverId: session.user.id },
      ],
    };

    // If specific conversation
    if (withUserId) {
      where.AND = [
        {
          OR: [
            { senderId: session.user.id, receiverId: withUserId },
            { senderId: withUserId, receiverId: session.user.id },
          ],
        },
      ];
    }

    const [messages, total] = await Promise.all([
      db.message.findMany({
        where,
        include: {
          sender: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          receiver: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        },
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.message.count({ where }),
    ]);

    // Mark messages as read
    if (withUserId) {
      await db.message.updateMany({
        where: {
          senderId: withUserId,
          receiverId: session.user.id,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      messages,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ error: 'خطا در دریافت پیام‌ها' }, { status: 500 });
  }
}

// POST send message
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
    const { receiverId, content, type } = body;

    if (!receiverId || !content) {
      return NextResponse.json({ error: 'گیرنده و محتوای پیام الزامی است' }, { status: 400 });
    }

    const message = await db.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        content,
        type: type || 'TEXT',
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        receiver: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });

    // Create notification for receiver
    await db.notification.create({
      data: {
        userId: receiverId,
        title: 'پیام جدید',
        message: `پیام جدیدی از ${session.user.firstName} ${session.user.lastName} دریافت کردید`,
        type: 'INFO',
        category: 'message',
        link: `/messages?with=${session.user.id}`,
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'خطا در ارسال پیام' }, { status: 500 });
  }
}
