import { subscribeToCollection, addFirestoreDoc } from "@/lib/firebase";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "event" | "winner" | "review" | "announcement" | "partner" | "system";
  link?: string;
  timestamp: string;
  read?: boolean;
}

export class NotificationService {
  /** Subscribe to realtime notifications */
  static subscribeNotifications(onUpdate: (notifications: AppNotification[]) => void): () => void {
    if (typeof window !== "undefined" && window.localStorage.getItem("lovepixels_notifications_cleared") === "true") {
      onUpdate([]);
    }
    return subscribeToCollection<AppNotification>("notifications", [], onUpdate);
  }

  /** Clear all local notifications */
  static clearNotifications(): void {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("lovepixels_db_notifications", JSON.stringify([]));
        window.localStorage.setItem("lovepixels_notifications_cleared", "true");
      }
    } catch {
      // Ignore
    }
  }

  /** Dismiss a single notification by ID */
  static dismissNotification(id: string): void {
    try {
      if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem("lovepixels_db_notifications");
        if (stored) {
          const parsed = JSON.parse(stored) as AppNotification[];
          const filtered = parsed.filter((n) => n.id !== id);
          window.localStorage.setItem("lovepixels_db_notifications", JSON.stringify(filtered));
        }
      }
    } catch {
      // Ignore
    }
  }

  /** Publish notification to community */
  static async publishNotification(
    notification: Omit<AppNotification, "id" | "timestamp">,
  ): Promise<void> {
    await addFirestoreDoc("notifications", {
      ...notification,
      timestamp: new Date().toISOString(),
      read: false,
    });
  }
}
