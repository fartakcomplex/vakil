'use client';

import { useAppStore } from '@/lib/store';
import LawyerCartable from '@/components/pages/lawyer-cartable';
import ManagerDashboard from '@/components/pages/manager-dashboard';
import ClientDashboard from '@/components/pages/client-dashboard';

/**
 * DashboardPage — routes to the correct role-specific dashboard.
 *
 * LAWYER / INTERN     → Personal Cartable (کارتابل شخصی)
 * COMPLEX_MANAGER / SUPER_ADMIN → Manager Overview (داشبورد مدیریت)
 * CLIENT              → Client Dashboard (داشبورد موکل)
 * ACCOUNTANT / SUPPORT → Manager Overview (fallback)
 */
export default function DashboardPage() {
  const { currentUser } = useAppStore();
  const role = currentUser?.role;

  if (!currentUser) return null;

  switch (role) {
    case 'LAWYER':
    case 'INTERN':
      return <LawyerCartable />;

    case 'CLIENT':
      return <ClientDashboard />;

    case 'SUPER_ADMIN':
    case 'COMPLEX_MANAGER':
    case 'ACCOUNTANT':
    case 'SUPPORT_STAFF':
    default:
      return <ManagerDashboard />;
  }
}
