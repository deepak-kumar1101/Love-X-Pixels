/**
 * Content contracts for LovePixels.
 *
 * These interfaces describe the shape of every dynamic section on the site.
 * A future Firebase integration only needs to return objects of these shapes
 * (e.g. from Firestore collections) and pass them into the presentational
 * components — no component internals need to change.
 */

export interface CommunityStat {
  id: string;
  label: string;
  value: string;
  caption?: string;
}

export interface CommunityPillar {
  id: string;
  title: string;
  description: string;
  icon: "sparkles" | "heart" | "moon" | "flower" | "star" | "gem";
}

/** Staff hierarchy tiers, ordered from highest to lowest authority. */
export type StaffRank = "owner" | "co-owner" | "admin" | "moderator" | "helper";

/** Discord-style presence. Map a Firebase presence field onto these values. */
export type StaffPresence = "online" | "idle" | "dnd" | "offline";

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  /** Absolute or imported avatar URL. Empty string renders the monogram fallback. */
  avatarUrl?: string;
  tags?: string[];
  /** Which category card group this member is rendered under. */
  rank: StaffRank;
  /** Live presence indicator. Defaults to "offline" when omitted. */
  presence?: StaffPresence;
  /** Optional handle shown under the name, e.g. "@aurelia". */
  handle?: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  /** ISO date string for start. */
  startsAt: string;
  /** ISO date string for end. */
  endsAt?: string;
  /** Human-readable time window, e.g. "8:00 PM – 10:00 PM IST". */
  timeLabel: string;
  host: string;
  status: "upcoming" | "live" | "past";
  /** Banner image URL (imported asset or remote URL). */
  bannerUrl?: string;
  /** Reward copy, e.g. "₹2,000 + Rose role". */
  reward?: string;
  /** Participant count placeholder. */
  participants?: number;
  /** Optional cap used to render the participation bar. */
  capacity?: number;
  /** Short names/handles for the participant avatar stack. */
  participantNames?: string[];
  /** Detailed rules for event modal. */
  rules?: string[];
  /** External Discord/Form registration URL. */
  registrationUrl?: string;
}

export interface Partner {
  id: string;
  name: string;
  category: string;
  description: string;
  memberCount?: string;
  href?: string;
  logoUrl?: string;
  discordUrl?: string;
}

export interface PayoutTier {
  id: string;
  name: string;
  amount: string;
  cadence: string;
  perks: string[];
  highlighted?: boolean;
}

export interface PayoutRecord {
  id: string;
  recipient: string;
  amount: string;
  /** ISO date string. */
  issuedAt: string;
  status: "paid" | "processing" | "scheduled";
  proofImageUrl?: string;
}

/** A recently paid member, shown in the winners ribbon and cards. */
export interface PayoutWinner {
  id: string;
  name: string;
  handle?: string;
  amount: string;
  reason: string;
  /** ISO date string. */
  paidAt: string;
  /** Optional image; when omitted a monogram placeholder renders. */
  imageUrl?: string;
  proofImageUrl?: string;
}

/** A member testimonial about the payout process. */
export interface PayoutReview {
  id: string;
  name: string;
  handle?: string;
  role?: string;
  quote: string;
  /** 1–5. */
  rating: number;
  /** Optional avatar; when omitted a monogram placeholder renders. */
  imageUrl?: string;
  payoutLabel?: string;
  approved?: boolean;
  createdAt?: string;
}

export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  category?: "events" | "vc" | "funny" | "moments" | "announcements";
  span?: "tall" | "wide" | "normal";
}

export interface SiteSettings {
  heroTagline: string;
  communityNotice?: string;
  liveMemberCount: number;
  activeVcCount: number;
  discordInviteUrl: string;
}

/** Generic async source signature a Firebase layer can implement later. */
export type ContentSource<T> = () => Promise<T[]>;
/** Interactive server preview contracts. */
export type PreviewChannelKind =
  "text" | "voice" | "media" | "events" | "giveaways" | "confession" | "gaming";

export interface PreviewChannel {
  id: string;
  name: string;
  kind: PreviewChannelKind;
  topic: string;
}

export interface PreviewMessage {
  id: string;
  author: string;
  time: string;
  body: string;
}

export interface PreviewVoiceRoom {
  id: string;
  name: string;
  listeners: number;
  speakers: string[];
  mood: string;
}

export interface PreviewMedia {
  id: string;
  src: string;
  alt: string;
  author: string;
}

export interface PreviewGiveaway {
  id: string;
  prize: string;
  entries: number;
  endsInLabel: string;
  host: string;
}

export interface PreviewParty {
  id: string;
  game: string;
  slots: string;
  note: string;
  host: string;
}
