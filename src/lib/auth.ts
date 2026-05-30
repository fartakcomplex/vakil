// Simple password hashing utility (no bcrypt dependency needed)
// Uses a basic hash function for demonstration purposes

export async function hashPassword(password: string): Promise<string> {
  // Simple hash using TextEncoder + subtle crypto
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '_legalhub_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hash = await hashPassword(password);
  return hash === hashedPassword;
}

// Simple token generation (for demo purposes - in production use JWT)
export function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

// Role hierarchy for authorization
const ROLE_HIERARCHY: Record<string, number> = {
  SUPER_ADMIN: 100,
  COMPLEX_MANAGER: 80,
  LAWYER: 60,
  ACCOUNTANT: 50,
  INTERN: 30,
  SUPPORT: 20,
  CLIENT: 10,
};

export function hasRole(userRole: string, requiredRole: string): boolean {
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[requiredRole] || 0);
}

export function isAdmin(role: string): boolean {
  return role === 'SUPER_ADMIN' || role === 'COMPLEX_MANAGER';
}

// Get user from Authorization header token
export function getTokenFromHeader(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.substring(7);
}
