# 🗄️ LovePixels — Database Schemas & Data Models

## 1. Supabase PostgreSQL Tables & Mapping

Every collection in the application maps directly to a PostgreSQL table in Supabase via camelCase-to-snake_case transformation:

| Firestore Collection Name | Supabase Table Name | Primary Key | Description |
| :--- | :--- | :--- | :--- |
| `staff` | `staff` | `id` (text/uuid) | Staff team roster, handles, ranks, and custom roles |
| `events` | `events` | `id` (text/uuid) | Community events, schedules, rewards, slots & winner details |
| `payouts` | `payouts` | `id` (text/uuid) | Verified winner payout receipts and proof screenshots |
| `gallery` | `gallery` | `id` (text/uuid) | Creative showcase artwork, categories & lightbox images |
| `partners` | `partners` | `id` (text/uuid) | Official community partners, perks & invite links |
| `reviews` | `reviews` | `id` (text/uuid) | Verified member reviews, quotes & star ratings |
| `announcements` | `announcements` | `id` (text/uuid) | Global banner announcements and notices |
| `rewardClaims` | `reward_claims` | `id` (text/uuid) | Automated reward claim tickets for event winners |
| `winnerAnnouncements` | `winner_announcements` | `id` (text/uuid) | 24-hour active winner celebration banners |
| `visitorLogs` | `visitor_logs` | `id` (text/uuid) | Analytics visitor tracking logs |
| `auditLogs` | `audit_logs` | `id` (text/uuid) | Administrative CMS mutation audit records |
| `settings` | `settings` | `id` (text/uuid) | Site-wide maintenance, visibility & customizer flags |
| `profiles` | `profiles` | `id` (text/uuid) | Discord authenticated user profiles & roles |

---

## 2. Core TypeScript Interfaces & Contracts

### 2.1 Community Event Model (`src/models/event-system.model.ts`)
```typescript
export interface ExtendedCommunityEvent {
  id: string;
  title: string;
  description: string;
  startsAt: string;             // ISO date string
  endsAt?: string;              // Target end time for auto winner draw
  timeLabel: string;            // e.g. "5:15 PM – 7:15 PM IST"
  host: string;
  reward: string;               // e.g. "₹2,000 + Champion Role"
  maxSlots?: number;            // Default 50
  registeredCount?: number;     // Current registered count
  remainingSlots?: number;      // Available slots
  difficulty?: "Easy" | "Medium" | "Hard" | "Expert";
  rules?: string[];
  bannerUrl?: string;
  registrationOpen?: boolean;
  autoSelectWinner?: boolean;   // Enable automated winner draw on endsAt
  autoSelectedWinnerDone?: boolean;
  status: "upcoming" | "live" | "past";
  winnerId?: string;
  winnerName?: string;
  winnerAvatar?: string;
}
```

### 2.2 Staff Member Model (`src/types/content.ts`)
```typescript
export type StaffRank = "owner" | "co-owner" | "admin" | "moderator" | "helper";
export type StaffPresence = "online" | "idle" | "dnd" | "offline";

export interface StaffMember {
  id: string;
  name: string;
  handle?: string;              // e.g. "@nyx_str"
  role: string;                 // Open custom role, e.g. "Founder & Lead Curator"
  bio: string;
  avatarUrl?: string;
  rank: StaffRank;
  presence?: StaffPresence;
  tags?: string[];
}
```

### 2.3 Winner Announcement Model (`src/models/event-system.model.ts`)
```typescript
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
  expiresAt: string;             // ISO string, 24-hour expiry window
  status: "active" | "expired" | "archived";
}
```

### 2.4 Reward Claim Ticket Model (`src/models/event-system.model.ts`)
```typescript
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
```

### 2.5 Verified Payout Proof & Review Models (`src/types/content.ts`)
```typescript
export interface PayoutWinner {
  id: string;
  name: string;
  handle: string;
  amount: string;
  reason: string;
  paidAt: string;
  proofImageUrl?: string;
}

export interface PayoutReview {
  id: string;
  name: string;
  handle: string;
  quote: string;
  rating: number;
  approved?: boolean;
  isVerified?: boolean;
  imageUrl?: string;
  createdAt?: string;
}
```
