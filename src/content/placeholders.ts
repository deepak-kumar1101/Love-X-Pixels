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

import gallery1 from "@/assets/gallery-1.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import hero from "@/assets/hero.jpg";
import event1 from "@/assets/event-1.jpg";
import event2 from "@/assets/event-2.jpg";
import event3 from "@/assets/event-3.jpg";

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

/** TODO(firebase): collection "staff" */
export const staffMembers: StaffMember[] = [
  {
    id: "1",
    name: "Aurelia",
    role: "Founder",
    bio: "Built LovePixels around one idea: the internet can still feel gentle.",
    tags: ["Vision", "Community"],
    rank: "owner",
    presence: "online",
    handle: "@aurelia",
  },
  {
    id: "2",
    name: "Ren",
    role: "Head of Moderation",
    bio: "Keeps the atmosphere soft and the boundaries firm. Sleeps rarely.",
    tags: ["Safety", "Mediation"],
    rank: "co-owner",
    presence: "dnd",
    handle: "@ren",
  },
  {
    id: "3",
    name: "Mira",
    role: "Events Curator",
    bio: "Designs every listening room, film night and seasonal salon.",
    tags: ["Events", "Hosting"],
    rank: "admin",
    presence: "online",
    handle: "@mira",
  },
  {
    id: "4",
    name: "Kaia",
    role: "Creative Director",
    bio: "Guards the palette, the type and the gallery standard.",
    tags: ["Design", "Gallery"],
    rank: "admin",
    presence: "idle",
    handle: "@kaia",
  },
  {
    id: "5",
    name: "Sol",
    role: "Partnerships",
    bio: "Finds communities that share our temperature and our taste.",
    tags: ["Partners"],
    rank: "moderator",
    presence: "online",
    handle: "@sol",
  },
  {
    id: "6",
    name: "Noor",
    role: "Payouts Lead",
    bio: "Makes sure every contribution is counted and every payout lands.",
    tags: ["Payouts", "Ops"],
    rank: "moderator",
    presence: "offline",
    handle: "@noor",
  },
  {
    id: "7",
    name: "Elin",
    role: "Night Moderator",
    bio: "Holds the late shift so the quiet hours stay just as safe.",
    tags: ["Safety", "Night shift"],
    rank: "moderator",
    presence: "idle",
    handle: "@elin",
  },
  {
    id: "8",
    name: "Juno",
    role: "Welcome Helper",
    bio: "First hello in the server. Remembers every new name.",
    tags: ["Onboarding"],
    rank: "helper",
    presence: "online",
    handle: "@juno",
  },
  {
    id: "9",
    name: "Peri",
    role: "Media Helper",
    bio: "Sorts the gallery drops and keeps the media channel tidy.",
    tags: ["Media"],
    rank: "helper",
    presence: "online",
    handle: "@peri",
  },
  {
    id: "10",
    name: "Ada",
    role: "Events Helper",
    bio: "Runs reminders, seating and the after-event thread.",
    tags: ["Events"],
    rank: "helper",
    presence: "offline",
    handle: "@ada",
  },
];

/** TODO(firebase): collection "events" */
export const communityEvents: CommunityEvent[] = [
  {
    id: "e1",
    title: "Rose Hour — Listening Room",
    description: "A slow shared playlist night. Bring one song and one story.",
    startsAt: "2026-08-15",
    timeLabel: "9:00 PM – 11:00 PM IST",
    host: "Mira",
    status: "live",
    bannerUrl: event1,
    reward: "₹2,000 + Rose Hour role",
    participants: 184,
    capacity: 250,
    participantNames: ["Mira", "Kaia", "Juno", "Sol", "Elin"],
  },
  {
    id: "e2",
    title: "Petal Frames — Photo Salon",
    description: "Monthly portfolio review for the photography circle.",
    startsAt: "2026-08-22",
    timeLabel: "8:30 PM – 10:00 PM IST",
    host: "Kaia",
    status: "upcoming",
    bannerUrl: event2,
    reward: "₹1,500 + Gallery feature",
    participants: 96,
    capacity: 150,
    participantNames: ["Kaia", "Peri", "Ada", "Noor"],
  },
  {
    id: "e3",
    title: "Midnight Film Club",
    description: "Synchronised watch party followed by an open floor.",
    startsAt: "2026-08-29",
    timeLabel: "11:00 PM – 2:00 AM IST",
    host: "Ren",
    status: "upcoming",
    bannerUrl: event3,
    reward: "₹1,000 + Night Owl role",
    participants: 63,
    capacity: 120,
    participantNames: ["Ren", "Elin", "Juno"],
  },
  {
    id: "e4",
    title: "Summer Gallery Opening",
    description: "The seasonal member exhibition, curated and voted.",
    startsAt: "2026-07-30",
    timeLabel: "9:00 PM – 12:00 AM IST",
    host: "Aurelia",
    status: "past",
    bannerUrl: gallery4,
    reward: "₹4,000 prize pool",
    participants: 312,
    capacity: 312,
    participantNames: ["Aurelia", "Mira", "Kaia", "Sol"],
  },
];

/** TODO(firebase): collection "partners" */
export const partners: Partner[] = [
  {
    id: "p1",
    name: "Velour",
    category: "Design collective",
    description: "A studio circle for type lovers and slow branding.",
    memberCount: "9.1k",
  },
  {
    id: "p2",
    name: "Almond Hours",
    category: "Study & focus",
    description: "Pomodoro rooms, quiet cams and gentle accountability.",
    memberCount: "14.6k",
  },
  {
    id: "p3",
    name: "Solstice",
    category: "Music",
    description: "Ambient sets and vinyl nights every weekend.",
    memberCount: "6.4k",
  },
  {
    id: "p4",
    name: "Petalworks",
    category: "Illustration",
    description: "Soft-brush artists trading studies and commissions.",
    memberCount: "11.2k",
  },
  {
    id: "p5",
    name: "Linen Club",
    category: "Lifestyle",
    description: "Home, ritual and slow-living conversation.",
    memberCount: "7.8k",
  },
  {
    id: "p6",
    name: "Aperture Rose",
    category: "Photography",
    description: "Film photography critiques and monthly prompts.",
    memberCount: "5.3k",
  },
];

/** TODO(firebase): collection "payoutTiers" */
export const payoutTiers: PayoutTier[] = [
  {
    id: "t1",
    name: "Contributor",
    amount: "₹1,500",
    cadence: "per month",
    perks: ["Gallery feature slot", "Contributor role", "Early event access"],
  },
  {
    id: "t2",
    name: "Host",
    amount: "₹4,000",
    cadence: "per month",
    perks: [
      "Everything in Contributor",
      "Event hosting stipend",
      "Custom role colour",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    id: "t3",
    name: "Curator",
    amount: "₹9,000",
    cadence: "per month",
    perks: [
      "Everything in Host",
      "Seasonal gallery curation",
      "Partner introductions",
      "Revenue share on collabs",
    ],
  },
];

/** TODO(firebase): collection "payouts" (scoped per user) */
export const payoutRecords: PayoutRecord[] = [
  { id: "r1", recipient: "Mira", amount: "₹4,000", issuedAt: "2026-08-01", status: "paid" },
  { id: "r2", recipient: "Kaia", amount: "₹9,000", issuedAt: "2026-08-01", status: "paid" },
  { id: "r3", recipient: "Noor", amount: "₹1,500", issuedAt: "2026-08-05", status: "processing" },
  { id: "r4", recipient: "Sol", amount: "₹4,000", issuedAt: "2026-09-01", status: "scheduled" },
];

/** TODO(firebase): collection "payoutWinners" */
export const payoutWinners: PayoutWinner[] = [
  {
    id: "w1",
    name: "Mira",
    handle: "@mira",
    amount: "₹4,000",
    reason: "Hosted 6 listening rooms",
    paidAt: "2026-08-01",
  },
  {
    id: "w2",
    name: "Kaia",
    handle: "@kaia",
    amount: "₹9,000",
    reason: "Curated the summer gallery",
    paidAt: "2026-08-01",
  },
  {
    id: "w3",
    name: "Juno",
    handle: "@juno",
    amount: "₹1,500",
    reason: "Welcomed 400 new members",
    paidAt: "2026-07-28",
  },
  {
    id: "w4",
    name: "Peri",
    handle: "@peri",
    amount: "₹1,500",
    reason: "Media channel curation",
    paidAt: "2026-07-25",
  },
  {
    id: "w5",
    name: "Elin",
    handle: "@elin",
    amount: "₹2,500",
    reason: "Night shift moderation",
    paidAt: "2026-07-20",
  },
  {
    id: "w6",
    name: "Sol",
    handle: "@sol",
    amount: "₹4,000",
    reason: "Brought 3 partner servers",
    paidAt: "2026-07-18",
  },
];

/** TODO(firebase): collection "payoutReviews" (moderated before publish) */
export const payoutReviews: PayoutReview[] = [
  {
    id: "rev1",
    name: "Mira",
    handle: "@mira",
    role: "Events Curator",
    quote:
      "Payout landed the same evening it was announced. No forms, no chasing — just a note saying thank you.",
    rating: 5,
    payoutLabel: "₹4,000 · August",
  },
  {
    id: "rev2",
    name: "Peri",
    handle: "@peri",
    role: "Media Helper",
    quote:
      "Everything is published in the ledger, so you always know what was paid and why. That transparency is rare.",
    rating: 5,
    payoutLabel: "₹1,500 · July",
  },
  {
    id: "rev3",
    name: "Juno",
    handle: "@juno",
    role: "Welcome Helper",
    quote:
      "I joined to make friends and ended up getting paid for the hours I already loved spending here.",
    rating: 4,
    payoutLabel: "₹1,500 · July",
  },
];

/** TODO(firebase): storage bucket "gallery" + collection metadata */
export const galleryItems: GalleryItem[] = [
  {
    id: "g1",
    src: gallery1,
    alt: "Pink stationery flat lay with rose petals",
    caption: "Letters night",
    span: "tall",
  },
  { id: "g2", src: hero, alt: "Flowing rose silk gradient", caption: "Rose hour", span: "wide" },
  { id: "g3", src: gallery3, alt: "Glass orb resting on pink clouds", caption: "Soft focus" },
  {
    id: "g4",
    src: gallery4,
    alt: "Blush peonies on cream marble",
    caption: "Summer opening",
    span: "wide",
  },
];

export const placeholders = {
  siteTitle: "LovePixels",
  siteDescription:
    "A soft, luxurious Discord community for creatives — salons, listening rooms, galleries and monthly creator payouts.",
  discordInviteUrl: "https://discord.gg",
};
