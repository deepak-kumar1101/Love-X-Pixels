/**
 * PLACEHOLDER CONTENT — display copy only.
 *
 * There is no data layer here: these are static presentation constants used to
 * render the UI. Replace each export with a Firebase (Firestore) read that
 * returns the same typed shape from `src/types/content.ts`.
 *
 * Example future wiring:
 *   const staff = await getDocs(collection(db, "staff"));
 */
import type {
  CommunityEvent,
  CommunityPillar,
  CommunityStat,
  GalleryItem,
  Partner,
  PayoutRecord,
  PayoutReview,
  PayoutTier,
  PayoutWinner,
  StaffMember,
} from "@/types/content";



/** TODO(firebase): collection "stats" */
export const communityStats: CommunityStat[] = [
  { id: "members", label: "Members", value: "24.8k", caption: "and blooming" },
  { id: "online", label: "Online daily", value: "3.2k", caption: "average" },
  { id: "events", label: "Events hosted", value: "740", caption: "since 2021" },
  { id: "payouts", label: "Rewarded", value: "₹8.4L", caption: "to creators" },
];

/** TODO(firebase): collection "pillars" */
export const communityPillars: CommunityPillar[] = [
  {
    id: "soft",
    title: "Soft by design",
    description:
      "A calm, moderated space with warm rules and zero tolerance for noise. Come as you are, stay as long as you like.",
    icon: "flower",
  },
  {
    id: "creative",
    title: "Creative circles",
    description:
      "Weekly salons for artists, photographers and writers — critique that feels like a compliment with directions.",
    icon: "sparkles",
  },
  {
    id: "nights",
    title: "Slow nights",
    description:
      "Listening rooms, film clubs and 2 AM conversations. The kind of company that makes a quiet evening feel curated.",
    icon: "moon",
  },
  {
    id: "care",
    title: "Care first",
    description:
      "A staff team trained in mediation, always reachable, always kind. Safety is the luxury we protect most.",
    icon: "heart",
  },
  {
    id: "rewards",
    title: "Rewarded presence",
    description:
      "Contribution is noticed here. Hosts, moderators and creators receive monthly payouts and perks.",
    icon: "gem",
  },
  {
    id: "rituals",
    title: "Little rituals",
    description:
      "Morning check-ins, gratitude threads and seasonal galleries that turn a server into a home.",
    icon: "star",
  },
];

export const staffMembers: StaffMember[] = [];
export const communityEvents: CommunityEvent[] = [];
export const partners: Partner[] = [];
export const payoutTiers: PayoutTier[] = [];
export const payoutRecords: PayoutRecord[] = [];
export const payoutWinners: PayoutWinner[] = [];
export const payoutReviews: PayoutReview[] = [];
export const galleryItems: GalleryItem[] = [];

export const placeholders = {
  siteTitle: "LovePixels",
  siteDescription:
    "A soft, luxurious Discord community for creatives — salons, listening rooms, galleries and monthly creator payouts.",
  discordInviteUrl: "https://discord.gg",
};
