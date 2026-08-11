import type { CommunityEvent } from "@/types/content";

export class EventAutomationService {
  /** Automatically calculate current status of an event based on start/end timestamps */
  static calculateEventStatus(
    event: CommunityEvent,
    now: Date = new Date(),
  ): "upcoming" | "live" | "past" {
    if (!event.startsAt) return event.status || "upcoming";

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
  static processEventStatuses(events: CommunityEvent[]): CommunityEvent[] {
    const now = new Date();
    return events.map((event) => ({
      ...event,
      status: this.calculateEventStatus(event, now),
    }));
  }
}
