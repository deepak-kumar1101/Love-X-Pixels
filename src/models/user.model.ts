import type { UserRole } from "./rbac.model";

export interface UserProfile {
  id: string;
  uid: string;
  displayName: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  country?: string;
  joinedAt: string;
  lastLogin: string;
  roles: UserRole[];
  badges?: string[];
  isVerified: boolean;
  isBanned: boolean;
  isMuted: boolean;
  createdAt: string;
  updatedAt: string;
}
