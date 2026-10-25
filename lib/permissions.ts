import { UserRole } from './types';

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
