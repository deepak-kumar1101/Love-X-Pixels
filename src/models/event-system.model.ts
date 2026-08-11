import type { CommunityEvent } from "@/types/content";

export interface ExtendedCommunityEvent extends CommunityEvent {
  maxSlots?: number;
  registeredCount?: number;
  remainingSlots?: number;
  difficulty?: "Easy" | "Medium" | "Hard" | "Expert";
  rules?: string[];
  isPinned?: boolean;
  isFeatured?: boolean;
  registrationOpen?: boolean;
  winnerId?: string;
  winnerName?: string;
  winnerAvatar?: string;
}

export interface EventParticipant {
  id: string;
  eventId: string;
  discordId: string;
  username: string;
  displayName: string;
  avatar?: string;
  joinedAt: string;
  status: "registered" | "attended" | "winner" | "disqualified";
}

export interface EventNotification {
  id: string;
  eventId: string;
  userId: string;
  userEmail: string;
  subscribedAt: string;
}

export interface WinnerAnnouncement {
  id: string;
  eventId: string;
  winnerDiscordId: string;
  winnerName: string;
  avatar?: string;
  eventName: string;
  prizeWon: string;
  congratulationsMsg: string;
  createdAt: string;
  expiresAt: string; // 24h expiry
  status: "active" | "expired" | "archived";
}

export interface WinnerRecord {
  id: string;
  eventId: string;
  winnerDiscordId: string;
  winnerName: string;
  avatar?: string;
  prize: string;
  wonAt: string;
  duration?: string;
  participantsCount?: number;
}

export interface RewardClaim {
  id: string;
  eventId: string;
  winnerName: string;
  discordId: string;
  eventName: string;
  prize: string;
  reason: string;
  status: "pending" | "completed" | "rejected";
  paymentMethod?: "UPI" | "PayPal" | "Crypto" | "Bank";
  paymentDate?: string;
  proofImageUrl?: string;
  adminNote?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EventAnalytics {
  eventId: string;
  totalParticipants: number;
  participationRate: number; // % of capacity
  completionRate: number;
  registrationTimeline: { date: string; count: number }[];
}
