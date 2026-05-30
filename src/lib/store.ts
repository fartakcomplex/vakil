import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  User,
  LegalCase,
  Appointment,
  Invoice,
  Payment,
  Task,
  Notification,
  Post,
  Document,
  Course,
  Message,
  Lead,
  CalendarEvent,
  TimeEntry,
} from './types';

// ============ APP STATE INTERFACE ============

export interface AppState {
  // ---- Auth ----
  isAuthenticated: boolean;
  currentUser: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;

  // ---- UI / Navigation ----
  currentPage: string;
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  language: 'fa' | 'en';
  setPage: (page: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setLanguage: (lang: 'fa' | 'en') => void;

  // ---- Data Caches ----
  users: User[];
  cases: LegalCase[];
  appointments: Appointment[];
  invoices: Invoice[];
  payments: Payment[];
  tasks: Task[];
  notifications: Notification[];
  posts: Post[];
  documents: Document[];
  courses: Course[];
  messages: Message[];
  leads: Lead[];
  calendarEvents: CalendarEvent[];
  timeEntries: TimeEntry[];

  // ---- Data Setters ----
  setUsers: (users: User[]) => void;
  setCases: (cases: LegalCase[]) => void;
  setAppointments: (appts: Appointment[]) => void;
  setInvoices: (invoices: Invoice[]) => void;
  setPayments: (payments: Payment[]) => void;
  setTasks: (tasks: Task[]) => void;
  setNotifications: (notifications: Notification[]) => void;
  setPosts: (posts: Post[]) => void;
  setDocuments: (docs: Document[]) => void;
  setCourses: (courses: Course[]) => void;
  setMessages: (messages: Message[]) => void;
  setLeads: (leads: Lead[]) => void;
  setCalendarEvents: (events: CalendarEvent[]) => void;
  setTimeEntries: (entries: TimeEntry[]) => void;

  // ---- Loading State ----
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

// ============ PERSIST CONFIG ============

// Only auth and UI preference state should be persisted to localStorage.
// Data caches are re-fetched from the API on each app load.
interface PersistedState {
  isAuthenticated: boolean;
  currentUser: User | null;
  token: string | null;
  theme: 'light' | 'dark';
  language: 'fa' | 'en';
}

const INITIAL_STATE = {
  // Auth
  isAuthenticated: false,
  currentUser: null,
  token: null,

  // UI / Navigation
  currentPage: 'dashboard',
  sidebarOpen: true,
  theme: 'light' as const,
  language: 'fa' as const,

  // Data caches — all empty initially, populated from API
  users: [],
  cases: [],
  appointments: [],
  invoices: [],
  payments: [],
  tasks: [],
  notifications: [],
  posts: [],
  documents: [],
  courses: [],
  messages: [],
  leads: [],
  calendarEvents: [],
  timeEntries: [],

  // Loading
  loading: false,
};

// ============ ZUSTAND STORE ============

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      // ---- Auth Actions ----
      login: (user, token) =>
        set({
          isAuthenticated: true,
          currentUser: user,
          token,
        }),

      logout: () =>
        set({
          isAuthenticated: false,
          currentUser: null,
          token: null,
          // Clear data caches on logout
          users: [],
          cases: [],
          appointments: [],
          invoices: [],
          payments: [],
          tasks: [],
          notifications: [],
          posts: [],
          documents: [],
          courses: [],
          messages: [],
          leads: [],
          calendarEvents: [],
          timeEntries: [],
        }),

      // ---- UI Actions ----
      setPage: (page) => set({ currentPage: page }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
      setLanguage: (language) => set({ language }),

      // ---- Data Setters ----
      setUsers: (users) => set({ users }),
      setCases: (cases) => set({ cases }),
      setAppointments: (appointments) => set({ appointments }),
      setInvoices: (invoices) => set({ invoices }),
      setPayments: (payments) => set({ payments }),
      setTasks: (tasks) => set({ tasks }),
      setNotifications: (notifications) => set({ notifications }),
      setPosts: (posts) => set({ posts }),
      setDocuments: (documents) => set({ documents }),
      setCourses: (courses) => set({ courses }),
      setMessages: (messages) => set({ messages }),
      setLeads: (leads) => set({ leads }),
      setCalendarEvents: (calendarEvents) => set({ calendarEvents }),
      setTimeEntries: (timeEntries) => set({ timeEntries }),

      // ---- Loading ----
      setLoading: (loading) => set({ loading }),
    }),
    {
      name: 'legalhub-store',
      storage: createJSONStorage<PersistedState>(() => {
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        // Fallback for SSR – in-memory storage
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      // Only persist auth & UI preferences (not data caches)
      partialize: (state): PersistedState => ({
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser,
        token: state.token,
        theme: state.theme,
        language: state.language,
      }),
    },
  ),
);
