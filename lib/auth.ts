import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import prisma from './prisma';
import { AuthUser, UserRole } from './types';
export * from './permissions';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'healthpoint-secret-key-32-character-diagnostic-2026-secure'
);

const COOKIE_NAME = 'hp_session_token';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: AuthUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<AuthUser | null> {
  try {
    const verified = await jwtVerify(token, SECRET_KEY);
    return verified.payload as unknown as AuthUser;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export function isStaffRole(role?: UserRole): boolean {
  if (!role) return false;
  return [
    'SUPER_ADMIN',
    'ADMIN',
    'LAB_MANAGER',
    'RECEPTIONIST',
    'PHLEBOTOMIST',
    'REPORT_MANAGER',
  ].includes(role);
}

export function canManageBookings(role?: UserRole): boolean {
  if (!role) return false;
  return ['SUPER_ADMIN', 'ADMIN', 'LAB_MANAGER', 'RECEPTIONIST'].includes(role);
}

export function canManageTests(role?: UserRole): boolean {
  if (!role) return false;
  return ['SUPER_ADMIN', 'ADMIN', 'LAB_MANAGER'].includes(role);
}

export function canManageReports(role?: UserRole): boolean {
  if (!role) return false;
  return ['SUPER_ADMIN', 'ADMIN', 'LAB_MANAGER', 'REPORT_MANAGER'].includes(role);
}

export function canManageStaff(role?: UserRole): boolean {
  if (!role) return false;
  return ['SUPER_ADMIN', 'ADMIN'].includes(role);
}

export function canManageWebsite(role?: UserRole): boolean {
  if (!role) return false;
  return ['SUPER_ADMIN', 'ADMIN'].includes(role);
}
