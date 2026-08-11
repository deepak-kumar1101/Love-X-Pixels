export type AnnouncementType = "popup" | "banner" | "ribbon" | "toast" | "maintenance";

export interface Announcement {
  id: string;
  title: string;
  description: string;
  type: AnnouncementType;
  priority: "low" | "medium" | "high" | "urgent";
  startDate: string;
  endDate?: string;
  visible: boolean;
  targetAudience: "all" | "members" | "guests";
  createdAt: string;
  updatedAt: string;
}
