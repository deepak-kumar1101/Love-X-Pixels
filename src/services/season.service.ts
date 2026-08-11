import { subscribeToCollection } from "@/lib/firebase";
import type { CommunitySeason } from "@/models/gamification.model";

export class SeasonService {
  /** Subscribe to active community seasons */
  static subscribeSeasons(onUpdate: (seasons: CommunitySeason[]) => void): () => void {
    const fallback: CommunitySeason[] = [
      {
        id: "s1",
        number: 1,
        title: "Season 1: Bloom & Echoes",
        description:
          "Cozy voice salons, creator showcases, and 1.5x XP bonus across all community events!",
        startsAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        xpMultiplier: 1.5,
        status: "active",
      },
    ];

    return subscribeToCollection<CommunitySeason>("seasons", fallback, onUpdate);
  }
}
