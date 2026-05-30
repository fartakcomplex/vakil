// ============================================================================
// LegalHub Super App - Helper Utility Functions
// ============================================================================

import { t } from './persian';
import type { Language } from './persian';

// ============ PERSIAN NUMBERS ============

const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'] as const;

/**
 * Convert Latin/English digits to Persian (Farsi) digits.
 */
export function toPersianNumber(num: number | string): string {
  return String(num).replace(/\d/g, (d) => persianDigits[Number(d)] ?? d);
}

// ============ CURRENCY ============

/**
 * Format a number as Iranian Toman currency with commas and Persian digits.
 * Example: 2500000 → "۲,۵۰۰,۰۰۰ تومان"
 */
export function formatCurrency(amount: number, lang: Language = 'fa'): string {
  const formatted = amount.toLocaleString('en-US');
  if (lang === 'fa') {
    return `${toPersianNumber(formatted)} تومان`;
  }
  return `${formatted} Toman`;
}

// ============ DATE FORMATTING ============

const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد',
  'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر',
  'دی', 'بهمن', 'اسفند',
] as const;

/**
 * Simple Gregorian → approximate Jalali conversion for display.
 * Returns a formatted date string in the given language.
 * For Farsi: "۱۰ مرداد ۱۴۰۳"  |  For English: "Jul 31, 2024"
 *
 * NOTE: This is a lightweight approximation. For production Jalali
 * accuracy, use a library like `jalaali-js`.
 */
export function formatDate(date: string | Date, lang: Language = 'fa'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (lang === 'en') {
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  // Approximate Jalali conversion
  const gy = d.getFullYear();
  const gm = d.getMonth() + 1;
  const gd = d.getDate();

  // Simple algorithm for approximate Jalali
  const gDaysInMonth = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const gy2 = gm > 2 ? gy + 1 : gy;
  const days = 355666 + (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) + gd + gDaysInMonth[gm - 1];
  const jy = -1595 + (33 * Math.floor(days / 12053));
  let jDays = days % 12053;
  let jm: number;
  let jd: number;

  jDays %= 365 + (Math.floor(jDays / 1461) === 4 ? 1 : 0);

  if (jDays < 186) {
    jm = 1 + Math.floor(jDays / 31);
    jd = 1 + (jDays % 31);
  } else {
    jm = 7 + Math.floor((jDays - 186) / 30);
    jd = 1 + ((jDays - 186) % 30);
  }

  return `${toPersianNumber(jd)} ${persianMonths[jm - 1]} ${toPersianNumber(jy)}`;
}

/**
 * Format time string (HH:MM) in Persian or English.
 */
export function formatTime(time: string, lang: Language = 'fa'): string {
  if (lang === 'fa') {
    return toPersianNumber(time);
  }
  return time;
}

// ============ NAME HELPERS ============

/**
 * Get initials from first name and last name.
 * Farsi-aware: returns the first letter of firstName.
 * Example: "محمد" + "رضایی" → "م.ر"
 */
export function getInitials(firstName: string, lastName: string): string {
  const first = firstName?.trim() || '';
  const last = lastName?.trim() || '';
  if (!first && !last) return '?';
  if (!last) return first.charAt(0);
  return `${first.charAt(0)}.${last.charAt(0)}`;
}

/**
 * Get full display name.
 */
export function getFullName(user: { firstName?: string | null; lastName?: string | null }, lang: Language = 'fa'): string {
  const first = user.firstName || '';
  const last = user.lastName || '';
  if (!first && !last) return lang === 'fa' ? 'ناشناس' : 'Unknown';
  return `${first} ${last}`.trim();
}

// ============ STATUS / PRIORITY COLORS ============

/**
 * Map a status string to a Tailwind CSS color class for badges.
 */
export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    // Case statuses
    OPEN: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    CLOSED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    ARCHIVED: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',

    // Task statuses
    TODO: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    DONE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',

    // Invoice statuses
    PAID: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    PARTIAL: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    OVERDUE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',

    // Appointment statuses
    CONFIRMED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    NO_SHOW: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',

    // Payment statuses
    COMPLETED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    FAILED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    REFUNDED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',

    // Lead statuses
    NEW: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
    CONTACTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    QUALIFIED: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    CONVERTED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    LOST: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',

    // Hearing statuses
    SCHEDULED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    POSTPONED: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',

    // Notification types
    INFO: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    WARNING: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    ERROR: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    SUCCESS: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',

    // Course statuses
    PUBLISHED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    DRAFT: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',

    // Enrollment statuses
    ACTIVE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    DROPPED: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  };

  return map[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
}

/**
 * Map a priority string to a Tailwind CSS color class for badges.
 */
export function getPriorityColor(priority: string): string {
  const map: Record<string, string> = {
    LOW: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    MEDIUM: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    URGENT: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return map[priority] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
}

// ============ DISPLAY NAME MAPPERS ============

/**
 * Get the localized display name for a role.
 */
export function getRoleName(role: string, lang: Language = 'fa'): string {
  const key = `role.${role}`;
  const translated = t(key, lang);
  // If no translation found, return the role itself
  return translated !== key ? translated : role;
}

/**
 * Get the localized display name for a case type.
 */
export function getCaseTypeName(type: string, lang: Language = 'fa'): string {
  const key = `caseType.${type}`;
  const translated = t(key, lang);
  return translated !== key ? translated : type;
}

/**
 * Get the localized display name for a status.
 */
export function getStatusName(status: string, lang: Language = 'fa'): string {
  // Try different status prefixes
  for (const prefix of ['caseStatus', 'taskStatus', 'invoiceStatus', 'appointmentStatus', 'paymentStatus', 'leadStatus', 'hearingStatus', 'courseStatus']) {
    const key = `${prefix}.${status}`;
    const translated = t(key, lang);
    if (translated !== key) return translated;
  }
  return status;
}

/**
 * Get the localized display name for an appointment type.
 */
export function getAppointmentTypeName(type: string, lang: Language = 'fa'): string {
  const key = `appointmentType.${type}`;
  const translated = t(key, lang);
  return translated !== key ? translated : type;
}

/**
 * Get the localized display name for a payment method.
 */
export function getPaymentMethodName(method: string, lang: Language = 'fa'): string {
  const key = `paymentMethod.${method}`;
  const translated = t(key, lang);
  return translated !== key ? translated : method;
}

// ============ FILE SIZE ============

/**
 * Format file size in human-readable form.
 * Example: 2048000 → "2.0 MB"
 */
export function formatFileSize(bytes: number, lang: Language = 'fa'): string {
  if (bytes === 0) return lang === 'fa' ? '۰ بایت' : '0 Bytes';

  const units = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت', 'ترابایت'];
  const enUnits = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(1));

  if (lang === 'fa') {
    return `${toPersianNumber(size)} ${units[i] || 'بایت'}`;
  }
  return `${size} ${enUnits[i] || 'Bytes'}`;
}

// ============ TIME HELPERS ============

/**
 * Format hours as a readable string.
 * Example: 3.5 → "۳ ساعت و ۳۰ دقیقه"
 */
export function formatHours(hours: number, lang: Language = 'fa'): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);

  if (lang === 'fa') {
    const parts: string[] = [];
    if (h > 0) parts.push(`${toPersianNumber(h)} ساعت`);
    if (m > 0) parts.push(`${toPersianNumber(m)} دقیقه`);
    return parts.join(' و ') || toPersianNumber('0');
  }

  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  return parts.join(' ') || '0h';
}

/**
 * Calculate relative time string (e.g. "2 hours ago", "3 days ago").
 */
export function getRelativeTime(date: string | Date, lang: Language = 'fa'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (lang === 'fa') {
    if (diffSec < 60) return 'همین الان';
    if (diffMin < 60) return `${toPersianNumber(diffMin)} دقیقه پیش`;
    if (diffHour < 24) return `${toPersianNumber(diffHour)} ساعت پیش`;
    if (diffDay < 7) return `${toPersianNumber(diffDay)} روز پیش`;
    return formatDate(d, 'fa');
  }

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(d, 'en');
}

// ============ HASH / SECURITY ============

/**
 * Simple hash function for client-side checks (e.g., password comparison hints).
 * NOT cryptographically secure — use server-side auth.ts hashing for real security.
 */
export function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

// ============ MISC HELPERS ============

/**
 * Truncate text to a maximum length with ellipsis.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Generate a random hex color for calendar events or tags.
 */
export function randomColor(): string {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Parse JSON safely, returning null on failure.
 */
export function safeJsonParse<T>(json: string | null | undefined): T | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/**
 * Sleep for a given number of milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Debounce a function call.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
