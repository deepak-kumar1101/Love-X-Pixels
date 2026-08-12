import { userRepository } from "@/repositories/user.repository";
import {
  staffMembers,
  communityEvents,
  partners,
  payoutWinners,
  payoutReviews,
  galleryItems,
} from "@/content/placeholders";

export class BackupService {
  /** Create complete JSON snapshot backup of website collections */
  static async exportSystemBackup(): Promise<void> {
    const backupData = {
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      content: {
        staff: staffMembers,
        events: communityEvents,
        partners: partners,
        winners: payoutWinners,
        reviews: payoutReviews,
        gallery: galleryItems,
      },
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `lovepixels_backup_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
