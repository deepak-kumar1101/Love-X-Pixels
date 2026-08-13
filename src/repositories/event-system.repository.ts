import { BaseRepository } from "./base.repository";
import { getCollectionItems, loadLocalItems } from "@/lib/firebase";
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
    const local = getCollectionItems<EventParticipant>("participants", []);
    const remote = await this.getAll([]);
    const map = new Map<string, EventParticipant>();
    local.forEach((item) => map.set(item.id, item));
    remote.forEach((item) => map.set(item.id, item));
    return Array.from(map.values()).filter((r) => r.eventId === eventId);
  }

  async isUserRegistered(eventId: string, discordId: string): Promise<boolean> {
    const local = getCollectionItems<EventParticipant>("participants", []);
    const storedLocal = loadLocalItems<EventParticipant>("participants");
    const remote = await this.getAll([]);
    const deterministicId = `${eventId}_${discordId}`;

    const combined = [...local, ...storedLocal, ...remote];
    return combined.some(
      (r) =>
        r.id === deterministicId ||
        (r.eventId === eventId && (r.discordId === discordId || (r as any).uid === discordId))
    );
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
