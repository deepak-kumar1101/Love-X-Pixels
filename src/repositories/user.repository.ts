import { BaseRepository } from "./base.repository";
import type { UserProfile } from "@/models/user.model";
import type { UserRole } from "@/models/rbac.model";

export class UserRepository extends BaseRepository<UserProfile> {
  constructor() {
    super("users");
  }

  async getProfile(uid: string): Promise<UserProfile | null> {
    return this.getById(uid);
  }

  async createProfile(profile: UserProfile): Promise<string> {
    return this.add(profile, profile.uid);
  }

  async updateRoles(uid: string, roles: UserRole[]): Promise<void> {
    return this.update(uid, { roles, updatedAt: new Date().toISOString() });
  }

  async updateLastLogin(uid: string): Promise<void> {
    return this.update(uid, {
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  async updateStatus(
    uid: string,
    status: { isBanned?: boolean; isMuted?: boolean; isVerified?: boolean },
  ): Promise<void> {
    return this.update(uid, { ...status, updatedAt: new Date().toISOString() });
  }
}

export const userRepository = new UserRepository();
