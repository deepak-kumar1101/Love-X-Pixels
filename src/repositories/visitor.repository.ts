import { BaseRepository } from "./base.repository";
import type { VisitorLog, AuditLog } from "@/models/analytics.model";

export class VisitorRepository extends BaseRepository<VisitorLog> {
  constructor() {
    super("visitorLogs");
  }

  async logVisit(visit: Omit<VisitorLog, "id">): Promise<string> {
    const payload = {
      path: (visit as any).pagePath || (visit as any).path || "/",
      referrer: visit.referrer || "direct",
      timestamp: visit.timestamp || new Date().toISOString(),
      uid: visit.uid || null,
    };
    return this.add(payload as any);
  }
}

export class AuditRepository extends BaseRepository<AuditLog> {
  constructor() {
    super("auditLogs");
  }

  async logAction(audit: Omit<AuditLog, "id">): Promise<string> {
    return this.add(audit);
  }
}

export const visitorRepository = new VisitorRepository();
export const auditRepository = new AuditRepository();
