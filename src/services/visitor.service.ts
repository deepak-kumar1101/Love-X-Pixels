import { visitorRepository } from "@/repositories/visitor.repository";

export class VisitorService {
  private static lastLoggedPath: string | null = null;

  static trackVisit(path: string, uid?: string): void {
    if (typeof window === "undefined") return;
    if (this.lastLoggedPath === path) return; // Prevent duplicate logs for same path in single view

    this.lastLoggedPath = path;

    const userAgent = window.navigator.userAgent || "";
    const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
    const isTablet = /iPad|Tablet/i.test(userAgent);
    const device = isTablet ? "tablet" : isMobile ? "mobile" : "desktop";

    let browser = "Unknown";
    if (userAgent.includes("Chrome")) browser = "Chrome";
    else if (userAgent.includes("Safari")) browser = "Safari";
    else if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Edg")) browser = "Edge";

    visitorRepository
      .logVisit({
        pagePath: path,
        referrer: document.referrer || "direct",
        browser,
        device,
        timestamp: new Date().toISOString(),
        uid,
      })
      .catch((err) => {
        console.warn("[VisitorService] Failed to record visitor log silently:", err);
      });
  }
}
