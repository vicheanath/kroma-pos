"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

type UserRole = "admin" | "manager" | "cashier" | "staff";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  fallback?: React.ReactNode;
}

/**
 * Client-side authentication guard component
 * Use this for client components that need role-based access
 */
export function AuthGuard({
  children,
  requiredRole,
  fallback,
}: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      const signInUrl = `/auth/signin?callbackUrl=${encodeURIComponent(
        pathname || "/dashboard"
      )}`;
      router.push(signInUrl);
    }
  }, [status, router, pathname]);

  // Show loading state while checking session
  if (status === "loading") {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      )
    );
  }

  // Redirect handled by useEffect, but show nothing while redirecting
  if (status === "unauthenticated") {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Redirecting to login...</p>
          </div>
        </div>
      )
    );
  }

  // Check role-based access
  if (requiredRole && session?.user?.role) {
    const userRole = session.user.role as UserRole;
    const allowedRoles = Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole];

    if (!allowedRoles.includes(userRole)) {
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-md">
            <h2 className="text-2xl font-bold">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to access this page. Required role:{" "}
              {Array.isArray(requiredRole)
                ? requiredRole.join(" or ")
                : requiredRole}
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-primary hover:underline"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
