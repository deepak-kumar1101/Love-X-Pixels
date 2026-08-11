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
    const fallback: AppNotification[] = [
      {
        id: "1",
        title: "🏆 Payout Winner Announced",
        message: "Rahul won ₹500 in monthly Salons event!",
        type: "winner",
        link: "/payouts",
        timestamp: new Date().toISOString(),
      },
      {
        id: "2",
        title: "✨ Live Salon Event Started",
        message: "Join voice salon for tonight's listening room.",
        type: "event",
        link: "/events",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
    ];

    return subscribeToCollection<AppNotification>("notifications", fallback, onUpdate);
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
