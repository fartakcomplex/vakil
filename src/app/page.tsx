'use client';

import { useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import AppShell from '@/components/app-shell';
import LoginPage from '@/components/pages/login-page';
import RegisterPage from '@/components/pages/register-page';
import DashboardPage from '@/components/pages/dashboard-page';
import CasesPage from '@/components/pages/cases-page';
import AppointmentsPage from '@/components/pages/appointments-page';
import InvoicesPage from '@/components/pages/invoices-page';
import TasksPage from '@/components/pages/tasks-page';
import MessagesPage from '@/components/pages/messages-page';
import SocialPage from '@/components/pages/social-page';
import ClientsPage from '@/components/pages/clients-page';
import CoursesPage from '@/components/pages/courses-page';
import DocumentsPage from '@/components/pages/documents-page';
import CalendarPage from '@/components/pages/calendar-page';
import ReportsPage from '@/components/pages/reports-page';
import LeadsPage from '@/components/pages/leads-page';
import SettingsPage from '@/components/pages/settings-page';
import AiAssistantPage from '@/components/pages/ai-assistant-page';
import NotificationsPage from '@/components/pages/notifications-page';
import UsersPage from '@/components/pages/users-page';
import TimeTrackingPage from '@/components/pages/time-tracking-page';

const PAGE_MAP: Record<string, React.ComponentType> = {
  dashboard: DashboardPage,
  cases: CasesPage,
  appointments: AppointmentsPage,
  invoices: InvoicesPage,
  tasks: TasksPage,
  messages: MessagesPage,
  social: SocialPage,
  clients: ClientsPage,
  documents: DocumentsPage,
  courses: CoursesPage,
  calendar: CalendarPage,
  reports: ReportsPage,
  leads: LeadsPage,
  settings: SettingsPage,
  'ai-assistant': AiAssistantPage,
  notifications: NotificationsPage,
  users: UsersPage,
  timeTracking: TimeTrackingPage,
};

const API_ENDPOINTS = [
  '/api/auth/me',
  '/api/cases?limit=100',
  '/api/appointments?limit=100',
  '/api/invoices?limit=100',
  '/api/tasks?limit=100',
  '/api/notifications?limit=100',
  '/api/posts?limit=100',
  '/api/documents?limit=100',
  '/api/courses?limit=100',
  '/api/messages?limit=100',
  '/api/leads?limit=100',
  '/api/calendar?limit=100',
  '/api/time-entries?limit=100',
  '/api/users?limit=100',
  '/api/payments?limit=100',
];

export default function Home() {
  const { isAuthenticated, currentPage, token } = useAppStore();

  // Hydrate from localStorage on mount
  useEffect(() => {
    // Check if theme class matches store
    const stored = useAppStore.getState();
    if (stored.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Subscribe to theme changes
  useEffect(() => {
    const unsub = useAppStore.subscribe((state) => {
      if (state.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });
    return unsub;
  }, []);

  const fetchAllData = useCallback(async () => {
    const { setUsers, setCases, setAppointments, setInvoices, setPayments, setTasks, setNotifications, setPosts, setDocuments, setCourses, setMessages, setLeads, setCalendarEvents, setTimeEntries } = useAppStore.getState();

    const fetchWithAuth = async (url: string) => {
      try {
        const res = await fetch(url, { headers: { Authorization: `Bearer ${useAppStore.getState().token}` } });
        if (res.ok) {
          const data = await res.json();
          return data.data || data;
        }
        return null;
      } catch {
        return null;
      }
    };

    // Fetch all in parallel
    const results = await Promise.allSettled(API_ENDPOINTS.map((url) => fetchWithAuth(url)));

    results.forEach((result, idx) => {
      if (result.status === 'fulfilled' && result.value) {
        const endpoint = API_ENDPOINTS[idx];
        const data = Array.isArray(result.value) ? result.value : result.value.data ? result.value.data : [];

        if (endpoint.includes('/auth/me')) {
          // Update current user if returned
          if (result.value && !Array.isArray(result.value)) {
            useAppStore.setState({ currentUser: result.value });
          }
        } else if (endpoint.includes('/cases')) setCases(data);
        else if (endpoint.includes('/appointments')) setAppointments(data);
        else if (endpoint.includes('/invoices')) setInvoices(data);
        else if (endpoint.includes('/tasks')) setTasks(data);
        else if (endpoint.includes('/notifications')) setNotifications(data);
        else if (endpoint.includes('/posts')) setPosts(data);
        else if (endpoint.includes('/documents')) setDocuments(data);
        else if (endpoint.includes('/courses')) setCourses(data);
        else if (endpoint.includes('/messages')) setMessages(data);
        else if (endpoint.includes('/leads')) setLeads(data);
        else if (endpoint.includes('/calendar')) setCalendarEvents(data);
        else if (endpoint.includes('/time-entries')) setTimeEntries(data);
        else if (endpoint.includes('/users')) setUsers(data);
        else if (endpoint.includes('/payments')) setPayments(data);
      }
    });
  }, []);

  // Seed and fetch data on mount
  useEffect(() => {
    if (!isAuthenticated) return;

    // Try seed first, then fetch
    fetch('/api/seed', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } })
      .catch(() => { /* ignore if already seeded */ })
      .finally(() => fetchAllData());
  }, [isAuthenticated, token, fetchAllData]);

  // Show login/register if not authenticated
  if (!isAuthenticated) {
    if (currentPage === 'register') {
      return <RegisterPage />;
    }
    return <LoginPage />;
  }

  // Authenticated: show AppShell with the correct page
  const PageComponent = PAGE_MAP[currentPage];

  return (
    <AppShell>
      {PageComponent ? <PageComponent /> : (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">صفحه مورد نظر یافت نشد</p>
        </div>
      )}
    </AppShell>
  );
}
