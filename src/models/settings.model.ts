export interface SystemSettings {
  id: string;
  maintenanceMode: boolean;
  websiteVisibility: boolean;
  registrationToggle: boolean;
  reviewApprovalToggle: boolean;
  galleryUploadToggle: boolean;
  homepageEditingToggle: boolean;
  analyticsToggle: boolean;
  discordInviteUrl: string;
  heroTagline: string;
  heroTitle: string;
  heroVideoUrl?: string;
  updatedAt: string;
}
