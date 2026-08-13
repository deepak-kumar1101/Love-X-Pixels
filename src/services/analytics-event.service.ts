import { visitorRepository } from "@/repositories/visitor.repository";

export type EventType =
  | "discord_join_click"
  | "event_register"
  | "review_submit"
  | "gallery_view"
  | "winner_view"
  | "page_view";

export class AnalyticsEventService {
  /** Log custom engagement event */
  static async trackEvent(eventType: EventType, metadata?: Record<string, unknown>): Promise<void> {
    try {
      await visitorRepository.logVisit({
        pagePath: typeof window !== "undefined" ? window.location.pathname : "/",
        referrer: eventType,
        timestamp: new Date().toISOString(),
        ...metadata,
      });
    } catch (err) {
      console.warn("[AnalyticsEventService] Error recording event:", err);
    }
  }
}
