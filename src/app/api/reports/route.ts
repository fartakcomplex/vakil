import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTokenFromHeader } from '@/lib/auth';

// GET reports data
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
    const type = searchParams.get('type') || 'financial';

    if (type === 'financial') {
      // Financial report
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [totalRevenue, totalPending, totalOverdue, recentPayments, monthlyInvoices] =
        await Promise.all([
          db.payment.aggregate({
            where: { status: 'COMPLETED', createdAt: { gte: startOfMonth } },
            _sum: { amount: true },
          }),
          db.invoice.aggregate({
            where: { status: 'PENDING' },
            _sum: { total: true },
          }),
          db.invoice.aggregate({
            where: { status: 'OVERDUE' },
            _sum: { total: true },
          }),
          db.payment.findMany({
            where: { status: 'COMPLETED' },
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
              user: { select: { firstName: true, lastName: true } },
              invoice: { select: { invoiceNumber: true } },
            },
          }),
          db.invoice.findMany({
            where: { createdAt: { gte: startOfMonth } },
            include: {
              client: { select: { firstName: true, lastName: true } },
            },
            orderBy: { createdAt: 'desc' },
          }),
        ]);

      return NextResponse.json({
        type: 'financial',
        data: {
          totalRevenue: totalRevenue._sum.amount || 0,
          totalPending: totalPending._sum.total || 0,
          totalOverdue: totalOverdue._sum.total || 0,
          recentPayments,
          monthlyInvoices,
        },
      });
    }

    if (type === 'cases') {
      // Cases report
      const [statusCounts, typeCounts, recentCases, upcomingHearings] = await Promise.all([
        db.legalCase.groupBy({
          by: ['status'],
          _count: { id: true },
        }),
        db.legalCase.groupBy({
          by: ['type'],
          _count: { id: true },
        }),
        db.legalCase.findMany({
          orderBy: { updatedAt: 'desc' },
          take: 10,
          include: {
            lawyer: { select: { firstName: true, lastName: true } },
            client: { select: { firstName: true, lastName: true } },
          },
        }),
        db.legalCase.findMany({
          where: {
            nextHearing: { gte: new Date() },
            status: { not: 'CLOSED' },
          },
          orderBy: { nextHearing: 'asc' },
          take: 10,
          include: {
            lawyer: { select: { firstName: true, lastName: true } },
            client: { select: { firstName: true, lastName: true } },
          },
        }),
      ]);

      return NextResponse.json({
        type: 'cases',
        data: {
          statusCounts,
          typeCounts,
          recentCases,
          upcomingHearings,
        },
      });
    }

    if (type === 'performance') {
      // Performance report
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [lawyerStats, taskStats, timeStats] = await Promise.all([
        // Lawyer performance: cases per lawyer
        db.legalCase.groupBy({
          by: ['lawyerId'],
          where: { lawyerId: { not: null } },
          _count: { id: true },
        }),
        // Task completion stats
        db.task.groupBy({
          by: ['status'],
          _count: { id: true },
        }),
        // Time entry stats
        db.timeEntry.aggregate({
          where: { createdAt: { gte: startOfMonth } },
          _sum: { hours: true },
          _count: { id: true },
        }),
      ]);

      // Get lawyer details
      const lawyerIds = lawyerStats.map((s) => s.lawyerId).filter(Boolean);
      const lawyers = await db.user.findMany({
        where: { id: { in: lawyerIds } },
        select: { id: true, firstName: true, lastName: true, lawyerProfile: true },
      });

      const lawyerPerformance = lawyerStats.map((stat) => {
        const lawyer = lawyers.find((l) => l.id === stat.lawyerId);
        return {
          lawyerId: stat.lawyerId,
          lawyerName: lawyer ? `${lawyer.firstName} ${lawyer.lastName}` : 'نامشخص',
          casesCount: stat._count.id,
          rating: lawyer?.lawyerProfile?.rating || 0,
          experience: lawyer?.lawyerProfile?.experience || 0,
        };
      });

      return NextResponse.json({
        type: 'performance',
        data: {
          lawyerPerformance,
          taskStats,
          timeStats: {
            totalHours: timeStats._sum.hours || 0,
            totalEntries: timeStats._count.id,
          },
        },
      });
    }

    // Dashboard overview (default)
    const [userCounts, caseCounts, appointmentCounts, revenueThisMonth] = await Promise.all([
      db.user.groupBy({
        by: ['role'],
        _count: { id: true },
      }),
      db.legalCase.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      db.appointment.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      db.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
        _sum: { amount: true },
      }),
    ]);

    const recentActivities = await db.activity.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, avatar: true } },
      },
    });

    return NextResponse.json({
      type: 'dashboard',
      data: {
        userCounts,
        caseCounts,
        appointmentCounts,
        revenueThisMonth: revenueThisMonth._sum.amount || 0,
        recentActivities,
      },
    });
  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json({ error: 'خطا در دریافت گزارش‌ها' }, { status: 500 });
  }
}
