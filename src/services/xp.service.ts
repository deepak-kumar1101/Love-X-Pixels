import { updateFirestoreDoc } from "@/lib/firebase";
import { userRepository } from "@/repositories/user.repository";
import { NotificationService } from "./notification.service";
import type { UserGamification } from "@/models/gamification.model";

export class XPService {
  /** Calculate level based on XP */
  static calculateLevel(xp: number): number {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  /** Calculate XP required for next level */
  static calculateXPRequired(level: number): number {
    return level * 250;
  }

  /** Award XP to user with level up detection and notification */
  static async awardXP(
    uid: string,
    amount: number,
    reason: string,
    multiplier = 1.0,
  ): Promise<void> {
    try {
      const profile = await userRepository.getProfile(uid);
      if (!profile) return;

      const currentXP = (profile as unknown as UserGamification).xp || 0;
      const earnedXP = Math.round(amount * multiplier);
      const newXP = currentXP + earnedXP;

      const oldLevel = this.calculateLevel(currentXP);
      const newLevel = this.calculateLevel(newXP);

      await updateFirestoreDoc("users", uid, {
        xp: newXP,
        level: newLevel,
        updatedAt: new Date().toISOString(),
      });

      if (newLevel > oldLevel) {
        await NotificationService.publishNotification({
          title: "🎉 Level Up!",
          message: `Congratulations! You reached Level ${newLevel}!`,
          type: "system",
          link: "/community",
        });
      }
    } catch (err) {
      console.warn("[XPService] Error awarding XP:", err);
    }
  }

  /** Reward daily login */
  static async checkDailyLogin(uid: string): Promise<void> {
    const profile = await userRepository.getProfile(uid);
    if (!profile) return;

    const today = new Date().toISOString().split("T")[0];
    const lastLogin = profile.lastLogin ? profile.lastLogin.split("T")[0] : "";

    if (today !== lastLogin) {
      await this.awardXP(uid, 50, "Daily Login Streak");
    }
  }
}
