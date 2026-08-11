export type UserRole =
  "Owner" | "CoOwner" | "Admin" | "Moderator" | "Staff" | "Verified" | "Member" | "Guest";

export type PermissionAction =
  | "manage:all"
  | "manage:users"
  | "manage:events"
  | "manage:payouts"
  | "manage:reviews"
  | "manage:gallery"
  | "manage:partners"
  | "manage:announcements"
  | "manage:settings"
  | "view:dashboard"
  | "public:read";

export interface RolePermissions {
  role: UserRole;
  permissions: PermissionAction[];
}
