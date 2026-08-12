import type { CommunityEvent } from "@/types/content";
import type { ExtendedCommunityEvent } from "@/models/event-system.model";
import { EventLifecycleService } from "./event-lifecycle.service";
import { updateFirestoreDoc } from "@/lib/firebase";

export class EventAutomationService {
  /** Automatically calculate current status of an event based on start/end timestamps */
  static calculateEventStatus(
    event: CommunityEvent,
    now: Date = new Date(),
  ): ExtendedCommunityEvent["status"] {
    if (!event.startsAt) return (event.status as ExtendedCommunityEvent["status"]) || "upcoming";

    const startTime = new Date(event.startsAt).getTime();
    const endTime = event.endsAt
      ? new Date(event.endsAt).getTime()
      : startTime + 3 * 60 * 60 * 1000; // Default 3h event window

    const currentTime = now.getTime();

    if (currentTime >= startTime && currentTime <= endTime) {
      return "live";
    } else if (currentTime < startTime) {
      return "upcoming";
    } else {
      return "past";
    }
  }

  /** Process array of events and apply automated status calculations */
  static processEventStatuses(events: ExtendedCommunityEvent[]): ExtendedCommunityEvent[] {
    const now = new Date();
    return events.map((event) => ({
      ...event,
      status: this.calculateEventStatus(event, now),
    }));
  }

  /**
   * Automatically check events whose end time has passed and have autoSelectWinner enabled.
   * Automatically picks a random winner and announces them.
   */
  static async checkAndTriggerAutomatedWinners(
    events: ExtendedCommunityEvent[],
  ): Promise<string[]> {
    const announcementsTriggered: string[] = [];
    const now = Date.now();

    for (const evt of events) {
      if (
        evt.autoSelectWinner === true &&
        evt.autoSelectedWinnerDone !== true &&
        evt.endsAt &&
        new Date(evt.endsAt).getTime() <= now
      ) {
        try {
          // Mark as processed to prevent infinite trigger loop
          await updateFirestoreDoc("events", evt.id, {
            autoSelectedWinnerDone: true,
          });

          // Select winner automatically
          const result = await EventLifecycleService.selectRandomWinner(evt);
          if (result) {
            announcementsTriggered.push(
              `🏆 Auto-Selected Winner for "${evt.title}": ${result.winnerName}`,
            );
          }
        } catch (err) {
          console.warn(`[EventAutomation] Auto winner selection failed for ${evt.id}:`, err);
        }
      }
    }

    return announcementsTriggered;
  }
}
