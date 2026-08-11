import { userRepository } from "@/repositories/user.repository";
import { placeholders } from "@/content/placeholders";

export class BackupService {
  /** Create complete JSON snapshot backup of website collections */
  static async exportSystemBackup(): Promise<void> {
    const backupData = {
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      content: {
        staff: placeholders.staffMembers,
        events: placeholders.communityEvents,
        partners: placeholders.partners,
        winners: placeholders.payoutWinners,
        reviews: placeholders.payoutReviews,
        gallery: placeholders.galleryItems,
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
