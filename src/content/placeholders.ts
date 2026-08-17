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

import hero from "@/assets/hero.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import event1 from "@/assets/event-1.jpg";
import event2 from "@/assets/event-2.jpg";
import event3 from "@/assets/event-3.jpg";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";

/** TODO(firebase): collection "stats" */
export const communityStats: CommunityStat[] = [
  { id: "members", label: "Members", value: "3.5k+", caption: "and blooming" },
  { id: "online", label: "Online daily", value: "700", caption: "average" },
  { id: "events", label: "Events hosted", value: "100+", caption: "since 2025" },
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

export const payoutTiers: PayoutTier[] = [
  { id: "t1", rank: "Top Event Champion", amount: "₹2,500", perks: ["Custom Role", "Verified Badge", "Featured Wall"] },
  { id: "t2", rank: "Voice Salon Host", amount: "₹1,500", perks: ["Nitro Month", "VIP Channel Access"] },
  { id: "t3", rank: "Creative Contributor", amount: "₹1,000", perks: ["Gallery Spotlight", "Role Color"] },
];

export const payoutRecords: PayoutRecord[] = [];

export const payoutWinners: PayoutWinner[] = [];

export const payoutReviews: PayoutReview[] = [];

export const galleryItems: GalleryItem[] = [];

export const placeholders = {
  siteTitle: "LovePixels",
  siteDescription:
    "A soft, luxurious Discord community for creatives — salons, listening rooms, galleries and monthly creator payouts.",
  discordInviteUrl: "https://discord.gg/YFX2tfSZMj",
};
