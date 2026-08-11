import { ref, deleteObject } from "firebase/storage";
import { storage, isFirebaseConfigured } from "@/lib/firebase/config";
import { StorageService, type StorageFolder } from "./storage.service";
import { compressImage } from "@/lib/image-optimizer";

export class MediaService {
  /**
   * Compress image and upload to specified Firebase Storage folder
   */
  static async uploadCompressedImage(
    folder: StorageFolder,
    file: File,
    onProgress?: (progressPercent: number) => void,
  ): Promise<string> {
    // Compress image prior to uploading
    const compressed = await compressImage(file, {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.82,
    });

    return StorageService.uploadImage(folder, compressed, onProgress);
  }

  /**
   * Delete storage file by download URL or path to prevent orphan files
   */
  static async deleteStorageFile(fileUrlOrPath: string): Promise<void> {
    if (!fileUrlOrPath || !storage || !isFirebaseConfigured) return;

    try {
      // Extract storage ref path from download URL if needed
      let storagePath = fileUrlOrPath;
      if (fileUrlOrPath.startsWith("http")) {
        const decoded = decodeURIComponent(fileUrlOrPath);
        const parts = decoded.split("/o/");
        if (parts.length > 1) {
          storagePath = parts[1].split("?")[0];
        }
      }

      const fileRef = ref(storage, storagePath);
      await deleteObject(fileRef);
    } catch (err) {
      console.warn("[MediaService] Notice: Storage file deletion skipped or file not found:", err);
    }
  }
}
