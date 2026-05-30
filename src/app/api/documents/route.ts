import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTokenFromHeader } from '@/lib/auth';

// GET documents
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
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const uploadedBy = searchParams.get('uploadedBy');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (type) where.type = type;
    if (uploadedBy) where.uploadedBy = uploadedBy;

    const [documents, total] = await Promise.all([
      db.document.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.document.count({ where }),
    ]);

    return NextResponse.json({
      documents,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get documents error:', error);
    return NextResponse.json({ error: 'خطا در دریافت اسناد' }, { status: 500 });
  }
}

// POST upload document
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

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const category = formData.get('category') as string | null;
    const tags = formData.get('tags') as string | null;
    const description = formData.get('description') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'فایل الزامی است' }, { status: 400 });
    }

    // In production, upload to cloud storage. For demo, save path as reference.
    const filePath = `/uploads/documents/${Date.now()}-${file.name}`;
    const buffer = await file.arrayBuffer();

    // Save file to public/uploads directory
    const fs = await import('fs');
    const path = await import('path');
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'documents');
    
    try {
      fs.mkdirSync(uploadDir, { recursive: true });
      fs.writeFileSync(path.join(uploadDir, `${Date.now()}-${file.name}`), Buffer.from(buffer));
    } catch {
      // If file write fails, still save metadata
    }

    const document = await db.document.create({
      data: {
        name: file.name,
        type: file.type || 'application/octet-stream',
        filePath,
        fileSize: file.size,
        mimeType: file.type,
        category,
        tags: tags ? JSON.stringify(tags.split(',')) : null,
        uploadedBy: session.user.id,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error('Upload document error:', error);
    return NextResponse.json({ error: 'خطا در بارگذاری سند' }, { status: 500 });
  }
}
