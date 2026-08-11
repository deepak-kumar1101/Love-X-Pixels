import type { UserRole, PermissionAction } from "@/models/rbac.model";

/**
 * Role hierarchy order (highest authority to lowest).
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  Owner: 100,
  CoOwner: 90,
  Admin: 80,
  Moderator: 70,
  Staff: 60,
  Verified: 50,
  Member: 40,
  Guest: 10,
};

/**
 * Centralized Permission Matrix
 */
const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  Owner: [
    "manage:all",
    "manage:users",
    "manage:events",
    "manage:payouts",
    "manage:reviews",
    "manage:gallery",
    "manage:partners",
    "manage:announcements",
    "manage:settings",
    "view:dashboard",
    "public:read",
  ],
  CoOwner: [
    "manage:users",
    "manage:events",
    "manage:payouts",
    "manage:reviews",
    "manage:gallery",
    "manage:partners",
    "manage:announcements",
    "view:dashboard",
    "public:read",
  ],
  Admin: [
    "manage:events",
    "manage:payouts",
    "manage:reviews",
    "manage:gallery",
    "manage:partners",
    "manage:announcements",
    "view:dashboard",
    "public:read",
  ],
  Moderator: ["manage:reviews", "manage:announcements", "view:dashboard", "public:read"],
  Staff: ["view:dashboard", "public:read"],
  Verified: ["public:read"],
  Member: ["public:read"],
  Guest: ["public:read"],
};

export class RBACService {
  /** Check if a set of roles has a specific permission action */
  static hasPermission(userRoles: UserRole[] = ["Guest"], action: PermissionAction): boolean {
    if (userRoles.includes("Owner")) return true;

    return userRoles.some((role) => {
      const perms = ROLE_PERMISSIONS[role] || [];
      return perms.includes("manage:all") || perms.includes(action);
    });
  }

  /** Check if user possesses at least a minimum role */
  static hasRole(userRoles: UserRole[] = ["Guest"], targetRole: UserRole): boolean {
    const targetRank = ROLE_HIERARCHY[targetRole];
    return userRoles.some((role) => ROLE_HIERARCHY[role] >= targetRank);
  }

  /** Get highest authority role from user's role list */
  static getHighestRole(userRoles: UserRole[] = ["Guest"]): UserRole {
    if (!userRoles.length) return "Guest";
    return userRoles.reduce((prev, curr) =>
      ROLE_HIERARCHY[curr] > ROLE_HIERARCHY[prev] ? curr : prev,
    );
  }
}
