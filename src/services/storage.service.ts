import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage, isFirebaseConfigured } from "@/lib/firebase/config";
import { parseFirebaseError } from "@/lib/firebase/error-handler";

export type StorageFolder =
  "hero" | "gallery" | "staff" | "partners" | "events" | "winners" | "reviews" | "avatars";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export class StorageService {
  /** Upload image file to Firebase Storage with folder enforcement and validation */
  static uploadImage(
    folder: StorageFolder,
    file: File,
    onProgress?: (progressPercent: number) => void,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      // Validations
      if (!file.type.startsWith("image/")) {
        return reject({
          code: "INVALID_FILE_TYPE",
          message: "Only image files (JPEG, PNG, WebP, GIF) are allowed.",
        });
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return reject({
          code: "FILE_TOO_LARGE",
          message: "Image size must not exceed 10MB.",
        });
      }

      if (!storage || !isFirebaseConfigured) {
        console.warn("[Demo Storage] Firebase storage offline, returning placeholder blob URL.");
        const fakeUrl = URL.createObjectURL(file);
        if (onProgress) onProgress(100);
        return resolve(fakeUrl);
      }

      try {
        const uniqueFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`;
        const storageRef = ref(storage, `${folder}/${uniqueFileName}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) onProgress(Math.round(progress));
          },
          (error) => {
            reject(parseFirebaseError(error));
          },
          async () => {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          },
        );
      } catch (err) {
        reject(parseFirebaseError(err));
      }
    });
  }
}
