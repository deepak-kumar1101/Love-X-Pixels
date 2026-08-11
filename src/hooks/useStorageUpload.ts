import { useState } from "react";
import { StorageService, type StorageFolder } from "@/services/storage.service";
import type { AppError } from "@/lib/firebase/error-handler";

export function useStorageUpload() {
  const [progress, setProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<AppError | null>(null);

  const upload = async (folder: StorageFolder, file: File): Promise<string> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      const url = await StorageService.uploadImage(folder, file, (p) => setProgress(p));
      setIsUploading(false);
      return url;
    } catch (err) {
      const parsed = err as AppError;
      setError(parsed);
      setIsUploading(false);
      throw parsed;
    }
  };

  return { upload, progress, isUploading, error };
}
