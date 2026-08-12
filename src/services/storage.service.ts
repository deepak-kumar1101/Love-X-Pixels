import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type StorageFolder =
  "hero" | "gallery" | "staff" | "partners" | "events" | "winners" | "reviews" | "avatars";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export class StorageService {
  /** Upload image file to Supabase Storage with folder enforcement and validation */
  static async uploadImage(
    folder: StorageFolder,
    file: File,
    onProgress?: (progressPercent: number) => void,
  ): Promise<string> {
    if (!file.type.startsWith("image/")) {
      throw { code: "INVALID_FILE_TYPE", message: "Only image files (JPEG, PNG, WebP, GIF) are allowed." };
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw { code: "FILE_TOO_LARGE", message: "Image size must not exceed 10MB." };
    }

    // Fallback: return a local blob URL if Supabase is not configured (dev/demo mode)
    if (!isSupabaseConfigured) {
      console.warn("[Demo Storage] Supabase not configured — returning local preview URL.");
      if (onProgress) onProgress(100);
      return URL.createObjectURL(file);
    }

    if (onProgress) onProgress(20);

    const uniqueFileName = `${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`;

    const { error } = await supabase.storage
      .from("media")
      .upload(uniqueFileName, file, { upsert: true });

    if (error) {
      throw { code: "UPLOAD_FAILED", message: error.message };
    }

    if (onProgress) onProgress(100);

    const { data } = supabase.storage.from("media").getPublicUrl(uniqueFileName);
    return data.publicUrl;
  }

  /** Delete a file from Supabase Storage by its public URL */
  static async deleteImage(publicUrl: string): Promise<void> {
    if (!publicUrl || !isSupabaseConfigured) return;

    try {
      // Extract the storage path from the public URL
      // Supabase public URLs look like: .../storage/v1/object/public/<bucket>/<path>
      const marker = "/object/public/media/";
      const idx = publicUrl.indexOf(marker);
      if (idx === -1) return;

      const storagePath = decodeURIComponent(publicUrl.slice(idx + marker.length).split("?")[0]);
      const { error } = await supabase.storage.from("media").remove([storagePath]);
      if (error) {
        console.warn("[StorageService] Delete notice:", error.message);
      }
    } catch (err) {
      console.warn("[StorageService] Storage file deletion skipped:", err);
    }
  }
}
