export interface UserGamification {
  uid: string;
  xp: number;
  level: number;
  xpRequired: number;
  rankTitle: string;
  badges: string[];
  achievements: string[];
  lastLoginDate?: string;
  loginStreak: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "xp" | "events" | "reviews" | "social" | "special";
  unlockedAt?: string;
  progress?: number;
}

export interface Giveaway {
  id: string;
  title: string;
  description: string;
  prize: string;
  imageUrl?: string;
  winnerCount: number;
  startsAt: string;
  endsAt: string;
  status: "active" | "ended" | "upcoming";
  participants: string[]; // uids
  winners?: { uid: string; name: string }[];
  createdAt: string;
}

export interface CommunitySeason {
  id: string;
  number: number;
  title: string;
  description: string;
  bannerUrl?: string;
  startsAt: string;
  endsAt: string;
  xpMultiplier: number;
  status: "active" | "ended" | "upcoming";
}

export interface UserBookmark {
  id: string;
  uid: string;
  targetCollection: "events" | "gallery" | "partners" | "announcements";
  targetId: string;
  createdAt: string;
}
