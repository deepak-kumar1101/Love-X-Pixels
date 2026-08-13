export interface VisitorLog {
  id: string;
  pagePath: string;
  referrer: string;
  device: "desktop" | "mobile" | "tablet";
  country?: string;
  timestamp: string;
  ip?: string;
  uid?: string;
}


export interface AuditLog {
  id: string;
  actorUid: string;
  actorName: string;
  action: string;
  targetCollection: string;
  targetId?: string;
  details?: Record<string, unknown>;
  timestamp: string;
}
