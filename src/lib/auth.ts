import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getDb } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'madni_clinic_super_secure_jwt_secret_key_2026';
const COOKIE_NAME = 'madni_admin_token';

export interface AdminPayload {
  userId: number;
  email: string;
  name: string;
  role: string;
}

export function signAdminToken(payload: AdminPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminPayload;
  } catch {
    return null;
  }
}

export async function getAuthenticatedAdmin(): Promise<AdminPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyAdminToken(token);
  if (!payload) return null;

  // Confirm user still exists in DB
  const db = getDb();
  const user = db.prepare('SELECT id, email, name, role FROM users WHERE id = ?').get(payload.userId) as
    | { id: number; email: string; name: string; role: string }
    | undefined;

  if (!user) return null;

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
