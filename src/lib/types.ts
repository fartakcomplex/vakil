// ============================================================================
// LegalHub Super App - Complete TypeScript Type Definitions
// ============================================================================

// ============ ENUM TYPES ============

export type Role =
  | 'SUPER_ADMIN'
  | 'COMPLEX_MANAGER'
  | 'LAWYER'
  | 'INTERN'
  | 'CLIENT'
  | 'ACCOUNTANT'
  | 'SUPPORT_STAFF';

export type CaseType =
  | 'civil'
  | 'criminal'
  | 'family'
  | 'corporate'
  | 'labor'
  | 'tax'
  | 'ip'
  | 'immigration';

export type CaseStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'PENDING'
  | 'CLOSED'
  | 'ARCHIVED';

export type CasePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'NO_SHOW';

export type AppointmentType = 'IN_PERSON' | 'VIDEO' | 'PHONE';

export type InvoiceStatus =
  | 'PENDING'
  | 'PAID'
  | 'PARTIAL'
  | 'OVERDUE'
  | 'CANCELLED';

export type PaymentMethod =
  | 'CARD'
  | 'BANK_TRANSFER'
  | 'CASH'
  | 'WALLET'
  | 'INSTALLMENT';

export type PaymentStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED';

export type WalletTransactionType =
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'PAYMENT'
  | 'REFUND';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

export type MessageType = 'TEXT' | 'FILE' | 'SYSTEM';

export type PostType =
  | 'DISCUSSION'
  | 'ARTICLE'
  | 'ANNOUNCEMENT'
  | 'QUESTION'
  | 'KNOWLEDGE';

export type CourseType = 'COURSE' | 'WEBINAR';

export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'DROPPED';

export type NotificationType = 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';

export type NotificationCategory =
  | 'case'
  | 'appointment'
  | 'payment'
  | 'system'
  | 'message';

export type CalendarEventType =
  | 'MEETING'
  | 'DEADLINE'
  | 'HEARING'
  | 'TASK'
  | 'REMINDER';

export type HearingStatus =
  | 'SCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'POSTPONED';

export type CaseDocumentType =
  | 'contract'
  | 'evidence'
  | 'correspondence'
  | 'brief'
  | 'motion'
  | 'complaint';

export type TimelineEventType =
  | 'status_change'
  | 'hearing'
  | 'filing'
  | 'note'
  | 'deadline';

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';

export type InstallmentStatus = 'PENDING' | 'PAID' | 'OVERDUE';

export type DocumentCategory =
  | 'legal'
  | 'contract'
  | 'financial'
  | 'template'
  | 'report'
  | 'other';

// ============ USER & AUTH ============

export interface User {
  id: string;
  email: string;
  password?: string;
  phone: string | null;
  nationalCode: string | null;
  firstName: string;
  lastName: string;
  avatar: string | null;
  role: Role;
  isActive: boolean;
  isVerified: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string | null;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  // Populated relations (optional)
  lawyerProfile?: LawyerProfile | null;
  clientProfile?: ClientProfile | null;
  accountantProfile?: AccountantProfile | null;
  internProfile?: InternProfile | null;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  ipAddress: string | null;
  userAgent: string | null;
  expiresAt: string;
  createdAt: string;
  user?: User;
}

export interface Device {
  id: string;
  userId: string;
  name: string | null;
  type: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  isCurrent: boolean;
  lastUsed: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string | null;
  entityId: string | null;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user?: User;
}

// ============ PROFILES ============

export interface LawyerProfile {
  id: string;
  userId: string;
  licenseNumber: string | null;
  specialization: string | null;
  bio: string | null;
  experience: number;
  rating: number;
  hourlyRate: number | null;
  isAvailable: boolean;
  barAdmission: string | null;
  education: string | null;
  languages: string | null; // JSON array
  createdAt: string;
  updatedAt: string;
}

export interface ClientProfile {
  id: string;
  userId: string;
  company: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  occupation: string | null;
  referredBy: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AccountantProfile {
  id: string;
  userId: string;
  license: string | null;
  department: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InternProfile {
  id: string;
  userId: string;
  university: string | null;
  field: string | null;
  supervisorId: string | null;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  supervisor?: User | null;
}

// ============ CASE MANAGEMENT ============

export interface LegalCase {
  id: string;
  title: string;
  caseNumber: string;
  type: CaseType;
  status: CaseStatus;
  priority: CasePriority;
  description: string;
  summary: string | null;
  court: string | null;
  courtBranch: string | null;
  judgeName: string | null;
  filingDate: string | null;
  nextHearing: string | null;
  closedAt: string | null;
  closedReason: string | null;
  tags: string | null; // JSON array
  createdAt: string;
  updatedAt: string;
  // Foreign keys
  lawyerId: string | null;
  internId: string | null;
  clientId: string;
  // Populated relations
  lawyer?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'> | null;
  client?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
  intern?: Pick<User, 'id' | 'firstName' | 'lastName'> | null;
  // Nested relations
  documents?: CaseDocument[];
  timeline?: CaseTimeline[];
  comments?: CaseComment[];
  notes?: CaseNote[];
  hearings?: Hearing[];
  deadlines?: CaseDeadline[];
  invoices?: Invoice[];
  activities?: Activity[];
}

export interface CaseDocument {
  id: string;
  caseId: string;
  name: string;
  type: CaseDocumentType;
  filePath: string;
  fileSize: number;
  mimeType: string | null;
  uploadedBy: string;
  tags: string | null; // JSON
  createdAt: string;
}

export interface CaseTimeline {
  id: string;
  caseId: string;
  title: string;
  description: string | null;
  type: TimelineEventType;
  date: string;
  createdBy: string;
  createdAt: string;
}

export interface CaseComment {
  id: string;
  caseId: string;
  content: string;
  isInternal: boolean;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
}

export interface CaseNote {
  id: string;
  caseId: string;
  title: string;
  content: string;
  authorId: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Hearing {
  id: string;
  caseId: string;
  title: string;
  date: string;
  time: string;
  location: string | null;
  judge: string | null;
  notes: string | null;
  status: HearingStatus;
  createdAt: string;
}

export interface CaseDeadline {
  id: string;
  caseId: string;
  title: string;
  date: string;
  isCompleted: boolean;
  notes: string | null;
  createdAt: string;
}

// ============ APPOINTMENTS ============

export interface Appointment {
  id: string;
  title: string;
  description: string | null;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  type: AppointmentType;
  lawyerId: string;
  clientId: string;
  notes: string | null;
  videoUrl: string | null;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
  lawyer?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
  client?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
}

// ============ FINANCIAL ============

export interface Invoice {
  id: string;
  invoiceNumber: string;
  caseId: string | null;
  clientId: string;
  amount: number;
  tax: number;
  discount: number;
  total: number;
  status: InvoiceStatus;
  dueDate: string;
  paidAmount: number;
  paidAt: string | null;
  createdBy: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  case?: LegalCase | null;
  client?: Pick<User, 'id' | 'firstName' | 'lastName'>;
  creator?: Pick<User, 'id' | 'firstName' | 'lastName'>;
  payments?: Payment[];
  installments?: Installment[];
}

export interface Payment {
  id: string;
  invoiceId: string | null;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId: string | null;
  description: string | null;
  userId: string;
  createdAt: string;
  invoice?: Invoice | null;
  user?: Pick<User, 'id' | 'firstName' | 'lastName'>;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  amount: number;
  type: WalletTransactionType;
  description: string | null;
  referenceId: string | null;
  balance: number;
  createdAt: string;
  user?: Pick<User, 'id' | 'firstName' | 'lastName'>;
}

export interface Installment {
  id: string;
  invoiceId: string;
  amount: number;
  dueDate: string;
  paidAmount: number;
  status: InstallmentStatus;
  paidAt: string | null;
  createdAt: string;
  invoice?: Invoice;
}

// ============ TASKS & ACTIVITY ============

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: CasePriority;
  dueDate: string | null;
  completedAt: string | null;
  caseId: string | null;
  assignedTo: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  assignee?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
  activities?: Activity[];
}

export interface Activity {
  id: string;
  type: string;
  title: string;
  description: string | null;
  userId: string | null;
  caseId: string | null;
  taskId: string | null;
  createdAt: string;
  user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'> | null;
  case?: Pick<LegalCase, 'id' | 'title'> | null;
  task?: Pick<Task, 'id' | 'title'> | null;
}

// ============ MESSAGING ============

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: MessageType;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  sender?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
  receiver?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
}

// ============ SOCIAL / COMMUNITY ============

export interface Post {
  id: string;
  authorId: string;
  title: string | null;
  content: string;
  type: PostType;
  tags: string | null; // JSON array
  isPinned: boolean;
  likes: number;
  createdAt: string;
  updatedAt: string;
  author?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
}

// ============ LMS (LEARNING MANAGEMENT) ============

export interface Course {
  id: string;
  title: string;
  description: string | null;
  instructorId: string;
  type: CourseType;
  status: CourseStatus;
  thumbnail: string | null;
  duration: number; // minutes
  createdAt: string;
  updatedAt: string;
  instructor?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
  enrollments?: Enrollment[];
  lessons?: Lesson[];
  enrollmentStatus?: EnrollmentStatus | null;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string | null;
  videoUrl: string | null;
  order: number;
  duration: number; // minutes
  createdAt: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
  progress: number;
  completedAt: string | null;
  certificateId: string | null;
  createdAt: string;
  user?: Pick<User, 'id' | 'firstName' | 'lastName'>;
  course?: Pick<Course, 'id' | 'title'>;
}

export interface Exam {
  id: string;
  courseId: string | null;
  title: string;
  questions: string; // JSON
  passingScore: number;
  duration: number; // minutes
  createdAt: string;
  results?: ExamResult[];
}

export interface ExamResult {
  id: string;
  examId: string;
  userId: string;
  score: number;
  answers: string; // JSON
  passed: boolean;
  completedAt: string;
  exam?: Exam;
}

// ============ DOCUMENTS ============

export interface Document {
  id: string;
  name: string;
  type: string;
  filePath: string;
  fileSize: number;
  mimeType: string | null;
  category: string | null;
  tags: string | null; // JSON array
  version: number;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
}

// ============ NOTIFICATIONS ============

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  isRead: boolean;
  readAt: string | null;
  link: string | null;
  createdAt: string;
}

// ============ CALENDAR ============

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  date: string;
  startTime: string | null;
  endTime: string | null;
  type: CalendarEventType;
  color: string | null;
  createdAt: string;
  user?: Pick<User, 'id' | 'firstName' | 'lastName'>;
}

// ============ TIME TRACKING ============

export interface TimeEntry {
  id: string;
  userId: string;
  caseId: string | null;
  date: string;
  hours: number;
  description: string | null;
  isBilled: boolean;
  createdAt: string;
  user?: Pick<User, 'id' | 'firstName' | 'lastName'>;
  case?: Pick<LegalCase, 'id' | 'title' | 'caseNumber'> | null;
}

// ============ CRM / LEADS ============

export interface Lead {
  id: string;
  assignedToId: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  status: LeadStatus;
  notes: string | null;
  value: number | null;
  createdAt: string;
  updatedAt: string;
  assignedTo?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
}

// ============ SETTINGS ============

export interface Setting {
  id: string;
  key: string;
  value: string;
  updatedAt: string;
}

// ============ API / PAGINATION ============

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  pagination?: Pagination;
}

// ============ COMMON API RESPONSE TYPES ============

export interface LoginResponse {
  user: User;
  token: string;
}

export interface DashboardStats {
  totalCases: number;
  openCases: number;
  totalAppointments: number;
  pendingAppointments: number;
  totalInvoices: number;
  pendingInvoices: number;
  totalRevenue: number;
  unpaidAmount: number;
  totalTasks: number;
  completedTasks: number;
  unreadNotifications: number;
  unreadMessages: number;
  activeLeads: number;
  upcomingHearings: number;
  totalTimeEntries: number;
  totalHoursBilled: number;
}

export interface ReportData {
  financial?: {
    totalRevenue: number;
    pendingPayments: number;
    overdueInvoices: number;
    monthlyRevenue: Array<{ month: string; amount: number }>;
  };
  cases?: {
    byStatus: Array<{ status: string; count: number }>;
    byType: Array<{ type: string; count: number }>;
    byPriority: Array<{ priority: string; count: number }>;
  };
  performance?: {
    topLawyers: Array<{
      lawyerId: string;
      lawyerName: string;
      totalCases: number;
      completedCases: number;
      totalHours: number;
      rating: number;
    }>;
    tasksOverview: Array<{ status: string; count: number }>;
  };
}
