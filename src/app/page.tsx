'use client';

import { useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import type { User, LegalCase, Appointment, Invoice, Payment, Task, Notification, Post, Document, Course, Message, Lead, CalendarEvent, TimeEntry } from '@/lib/types';
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
import FinancialAnalyticsPage from '@/components/pages/financial-analytics-page';
import LandingPage from '@/components/pages/landing-page';

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
  financialAnalytics: FinancialAnalyticsPage,
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

    // Helper: extract the array data from API response objects like { cases: [...], pagination: {...} }
    const extractArray = (res: unknown): unknown[] => {
      if (Array.isArray(res)) return res;
      if (res && typeof res === 'object' && !Array.isArray(res)) {
        const obj = res as Record<string, unknown>;
        // Try known keys first (most common API response keys)
        const knownKeys = ['data', 'cases', 'messages', 'invoices', 'appointments', 'tasks', 'notifications', 'posts', 'documents', 'courses', 'leads', 'calendarEvents', 'events', 'timeEntries', 'users', 'payments'];
        for (const key of knownKeys) {
          if (Array.isArray(obj[key])) return obj[key] as unknown[];
        }
        // Fallback: find any key that has an array value (skip 'pagination')
        for (const key of Object.keys(obj)) {
          if (key !== 'pagination' && key !== 'unreadCount' && Array.isArray(obj[key])) return obj[key] as unknown[];
        }
      }
      return [];
    };

    results.forEach((result, idx) => {
      if (result.status === 'fulfilled' && result.value) {
        const endpoint = API_ENDPOINTS[idx];
        const raw = result.value;

        if (endpoint.includes('/auth/me')) {
          // Update current user if returned (may be wrapped in { user: ... })
          if (raw && !Array.isArray(raw)) {
            const user = (raw as Record<string, unknown>).user || raw;
            useAppStore.setState({ currentUser: user as User });
          }
        } else if (endpoint.includes('/cases')) setCases(extractArray(raw) as LegalCase[]);
        else if (endpoint.includes('/appointments')) setAppointments(extractArray(raw) as Appointment[]);
        else if (endpoint.includes('/invoices')) setInvoices(extractArray(raw) as Invoice[]);
        else if (endpoint.includes('/tasks')) setTasks(extractArray(raw) as Task[]);
        else if (endpoint.includes('/notifications')) setNotifications(extractArray(raw) as Notification[]);
        else if (endpoint.includes('/posts')) setPosts(extractArray(raw) as Post[]);
        else if (endpoint.includes('/documents')) setDocuments(extractArray(raw) as Document[]);
        else if (endpoint.includes('/courses')) setCourses(extractArray(raw) as Course[]);
        else if (endpoint.includes('/messages')) setMessages(extractArray(raw) as Message[]);
        else if (endpoint.includes('/leads')) setLeads(extractArray(raw) as Lead[]);
        else if (endpoint.includes('/calendar')) setCalendarEvents(extractArray(raw) as CalendarEvent[]);
        else if (endpoint.includes('/time-entries')) setTimeEntries(extractArray(raw) as TimeEntry[]);
        else if (endpoint.includes('/users')) setUsers(extractArray(raw) as User[]);
        else if (endpoint.includes('/payments')) setPayments(extractArray(raw) as Payment[]);
      }
    });
  }, []);

  // Seed database on first load (before login, so users can log in)
  const seededRef = useCallback(() => {
    let done = false;
    return () => {
      if (done) return;
      done = true;
      fetch('/api/seed', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
        .catch(() => { /* ignore */ });
    };
  }, []);

  useEffect(() => {
    seededRef()();
  }, [seededRef]);

  // Fetch data after login
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchAllData();
  }, [isAuthenticated, fetchAllData]);

  // Show landing page first when not authenticated
  // currentPage 'dashboard' is the default - show landing page instead
  if (!isAuthenticated) {
    if (currentPage === 'dashboard' || currentPage === 'landing') {
      return <LandingPage />;
    }
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
