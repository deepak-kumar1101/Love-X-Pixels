import { StorageService, type StorageFolder } from "./storage.service";
import { compressImage } from "@/lib/image-optimizer";

export class MediaService {
  /**
   * Compress image and upload to the specified Supabase Storage folder
   */
  static async uploadCompressedImage(
    folder: StorageFolder,
    file: File,
    onProgress?: (progressPercent: number) => void,
  ): Promise<string> {
    const compressed = await compressImage(file, {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.82,
    });

    return StorageService.uploadImage(folder, compressed, onProgress);
  }

  /**
   * Delete a storage file by its public URL, preventing orphan files
   */
  static async deleteStorageFile(fileUrl: string): Promise<void> {
    return StorageService.deleteImage(fileUrl);
  }
}
