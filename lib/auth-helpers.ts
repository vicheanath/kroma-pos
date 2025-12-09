/**
 * Authentication and Authorization Helpers
 */

import { auth } from "./auth";
import { redirect } from "next/navigation";

export type UserRole = "admin" | "manager" | "cashier" | "staff";

/**
 * Get the current session
 */
export async function getSession() {
  return await auth();
}

/**
 * Get the current user from session
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}

/**
 * Get the current user's role
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const session = await getSession();
  return (session?.user?.role as UserRole) || null;
}

/**
 * Require authentication - redirects to signin if not authenticated
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect("/auth/signin");
  }
  return session;
}

/**
 * Require a specific role - redirects to dashboard if user doesn't have the role
 */
export async function requireRole(requiredRole: UserRole | UserRole[]) {
  const session = await requireAuth();
  const userRole = session.user?.role as UserRole;

  if (!userRole) {
    redirect("/dashboard");
  }

  const allowedRoles = Array.isArray(requiredRole)
    ? requiredRole
    : [requiredRole];

  if (!allowedRoles.includes(userRole)) {
    redirect("/dashboard");
  }

  return session;
}

/**
 * Check if user has a specific role
 */
export async function hasRole(role: UserRole | UserRole[]): Promise<boolean> {
  const userRole = await getCurrentUserRole();
  if (!userRole) return false;

  const allowedRoles = Array.isArray(role) ? role : [role];
  return allowedRoles.includes(userRole);
}

/**
 * Check if user has admin role
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole("admin");
}

/**
 * Check if user has manager or admin role
 */
export async function isManagerOrAdmin(): Promise<boolean> {
  return hasRole(["admin", "manager"]);
}

/**
 * Get role hierarchy level (higher number = more permissions)
 */
export function getRoleLevel(role: UserRole): number {
  const levels: Record<UserRole, number> = {
    admin: 4,
    manager: 3,
    cashier: 2,
    staff: 1,
  };
  return levels[role] || 0;
}

/**
 * Check if user role has permission (based on hierarchy)
 */
export function canAccessRole(
  userRole: UserRole,
  requiredRole: UserRole
): boolean {
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole);
}
