import { subscribeToCollection, addFirestoreDoc, updateFirestoreDoc } from "@/lib/firebase";
import { NotificationService } from "./notification.service";
import type { Giveaway } from "@/models/gamification.model";

export class GiveawayService {
  /** Subscribe to active giveaways */
  static subscribeGiveaways(onUpdate: (giveaways: Giveaway[]) => void): () => void {
    const fallback: Giveaway[] = [
      {
        id: "gw1",
        title: "🎁 Discord Nitro 1-Month Giveaway",
        description: "Participate in tonight's voice salon to win 1-Month Nitro!",
        prize: "Discord Nitro Monthly",
        winnerCount: 2,
        startsAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 48 * 3600000).toISOString(),
        status: "active",
        participants: ["u1", "u2", "u3"],
        createdAt: new Date().toISOString(),
      },
    ];

    return subscribeToCollection<Giveaway>("giveaways", fallback, onUpdate);
  }

  /** Enter user into giveaway */
  static async enterGiveaway(
    giveawayId: string,
    uid: string,
    currentParticipants: string[] = [],
  ): Promise<void> {
    if (currentParticipants.includes(uid)) return;

    await updateFirestoreDoc("giveaways", giveawayId, {
      participants: [...currentParticipants, uid],
    });
  }

  /** Select random winners when giveaway ends */
  static async selectRandomWinners(giveaway: Giveaway): Promise<{ uid: string; name: string }[]> {
    if (!giveaway.participants || giveaway.participants.length === 0) return [];

    const shuffled = [...giveaway.participants].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, giveaway.winnerCount).map((uid) => ({
      uid,
      name: `Winner ${uid.substring(0, 5)}`,
    }));

    await updateFirestoreDoc("giveaways", giveaway.id, {
      winners: selected,
      status: "ended",
    });

    await NotificationService.publishNotification({
      title: "🎁 Giveaway Winner Selected!",
      message: `${giveaway.prize} winners have been chosen!`,
      type: "winner",
      link: "/community",
    });

    return selected;
  }
}
