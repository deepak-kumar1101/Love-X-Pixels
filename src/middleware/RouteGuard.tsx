import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRBAC } from "@/hooks/useRBAC";
import type { UserRole, PermissionAction } from "@/models/rbac.model";

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: PermissionAction;
  requireAuth?: boolean;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  requiredRole,
  requiredPermission,
  requireAuth = false,
}) => {
  const { user, loading } = useAuth();
  const { hasRole, hasPermission } = useRBAC();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
          <p className="text-xs font-semibold text-muted-foreground">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-3xl border border-rose-200/50 bg-card p-8 text-center shadow-xl">
          <h2 className="font-serif text-2xl font-bold text-foreground">Sign In Required</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            You must be signed into LovePixels to access this area.
          </p>
        </div>
      </div>
    );
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-3xl border border-rose-200/50 bg-card p-8 text-center shadow-xl">
          <h2 className="font-serif text-2xl font-bold text-foreground">Access Restricted</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            This section requires the{" "}
            <code className="rounded bg-rose-500/10 px-1.5 py-0.5 text-rose-500">
              {requiredRole}
            </code>{" "}
            role.
          </p>
        </div>
      </div>
    );
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-3xl border border-rose-200/50 bg-card p-8 text-center shadow-xl">
          <h2 className="font-serif text-2xl font-bold text-foreground">Permission Denied</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            You do not have the required permission (
            <code className="rounded bg-rose-500/10 px-1.5 py-0.5 text-rose-500">
              {requiredPermission}
            </code>
            ).
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
