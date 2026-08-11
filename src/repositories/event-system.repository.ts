import { BaseRepository } from "./base.repository";
import type {
  EventParticipant,
  EventNotification,
  WinnerAnnouncement,
  WinnerRecord,
  RewardClaim,
} from "@/models/event-system.model";

export class ParticipantRepository extends BaseRepository<EventParticipant> {
  constructor() {
    super("participants");
  }

  async getEventParticipants(eventId: string): Promise<EventParticipant[]> {
    return this.queryWhere("eventId", "==", eventId);
  }

  async isUserRegistered(eventId: string, discordId: string): Promise<boolean> {
    const records = await this.queryWhere("eventId", "==", eventId);
    return records.some((r) => r.discordId === discordId);
  }
}

export class EventNotificationRepository extends BaseRepository<EventNotification> {
  constructor() {
    super("eventNotifications");
  }

  async getSubscribedUsers(eventId: string): Promise<EventNotification[]> {
    return this.queryWhere("eventId", "==", eventId);
  }
}

export class WinnerAnnouncementRepository extends BaseRepository<WinnerAnnouncement> {
  constructor() {
    super("winnerAnnouncements");
  }

  async getActiveAnnouncements(): Promise<WinnerAnnouncement[]> {
    const all = await this.getAll([]);
    const now = new Date().toISOString();
    return all.filter((ann) => ann.status === "active" && ann.expiresAt > now);
  }
}

export class WinnerHistoryRepository extends BaseRepository<WinnerRecord> {
  constructor() {
    super("winnerHistory");
  }
}

export class RewardClaimRepository extends BaseRepository<RewardClaim> {
  constructor() {
    super("rewardClaims");
  }

  async getClaimsByStatus(status: RewardClaim["status"]): Promise<RewardClaim[]> {
    return this.queryWhere("status", "==", status);
  }
}

export const participantRepository = new ParticipantRepository();
export const eventNotificationRepository = new EventNotificationRepository();
export const winnerAnnouncementRepository = new WinnerAnnouncementRepository();
export const winnerHistoryRepository = new WinnerHistoryRepository();
export const rewardClaimRepository = new RewardClaimRepository();
