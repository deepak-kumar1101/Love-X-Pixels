import React, { useState, useRef, useCallback } from "react";
import {
  UploadCloud,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { compressImage } from "@/lib/image-optimizer";
import { uploadStorageFile } from "@/lib/supabase";

interface CustomImageUploaderProps {
  bucket?: string;
  folderPath?: string;
  onUploadSuccess: (url: string) => void;
  onMultipleSuccess?: (urls: string[]) => void;
  allowMultiple?: boolean;
  maxSizeMB?: number;
  currentImageUrl?: string;
  label?: string;
}

export const CustomImageUploader: React.FC<CustomImageUploaderProps> = ({
  bucket = "gallery",
  folderPath = "uploads",
  onUploadSuccess,
  onMultipleSuccess,
  allowMultiple = false,
  maxSizeMB = 10,
  currentImageUrl,
  label = "Upload Image",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>(
    currentImageUrl ? [currentImageUrl] : [],
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    async (files: File[]) => {
      setErrorMsg(null);
      setIsSuccess(false);

      const validFiles: File[] = [];
      const newPreviews: string[] = [];

      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          setErrorMsg("Only image files (JPG, PNG, WebP, GIF) are allowed.");
          return;
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
          setErrorMsg(`File size exceeds maximum limit of ${maxSizeMB}MB.`);
          return;
        }

        validFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }

      if (validFiles.length === 0) return;

      setSelectedFiles(allowMultiple ? [...selectedFiles, ...validFiles] : validFiles);
      setPreviewUrls(allowMultiple ? [...previewUrls, ...newPreviews] : newPreviews);

      // Automatically compress and upload
      await uploadFiles(validFiles);
    },
    [allowMultiple, maxSizeMB, previewUrls, selectedFiles],
  );

  const uploadFiles = async (filesToUpload: File[]) => {
    setIsUploading(true);
    setUploadProgress(10);
    setErrorMsg(null);

    try {
      const uploadedUrls: string[] = [];
      const stepProgress = 80 / filesToUpload.length;

      for (let i = 0; i < filesToUpload.length; i++) {
        const rawFile = filesToUpload[i];

        // 1. Compress image via Canvas
        setUploadProgress(15 + i * stepProgress * 0.3);
        const compressedFile = await compressImage(rawFile, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.85,
          format: "jpeg",
        });

        // 2. Upload to Supabase Storage
        setUploadProgress(15 + i * stepProgress * 0.7);
        const filename = `${folderPath}/${Date.now()}_${i}_${rawFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const publicUrl = await uploadStorageFile(bucket, filename, compressedFile);

        uploadedUrls.push(publicUrl);
        setUploadProgress(15 + (i + 1) * stepProgress);
      }

      setUploadProgress(100);
      setIsSuccess(true);

      if (allowMultiple && onMultipleSuccess) {
        onMultipleSuccess(uploadedUrls);
      } else if (uploadedUrls.length > 0) {
        onUploadSuccess(uploadedUrls[0]);
      }
    } catch (err: unknown) {
      console.warn("[CustomImageUploader] Error uploading file:", err);
      setErrorMsg(
        err && typeof err === "object" && "message" in err
          ? String(err.message)
          : "Failed to upload image. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      processFiles(allowMultiple ? droppedFiles : [droppedFiles[0]]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      processFiles(allowMultiple ? selected : [selected[0]]);
    }
  };

  const removePreview = (index: number) => {
    const updatedPreviews = [...previewUrls];
    updatedPreviews.splice(index, 1);
    setPreviewUrls(updatedPreviews);

    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);

    setIsSuccess(false);
    setErrorMsg(null);
  };

  return (
    <div className="w-full space-y-3">
      {label && <label className="block text-xs font-bold text-foreground">{label}</label>}

      {/* Drag & Drop Glassmorphic Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ${
          isDragging
            ? "border-rose-500 bg-rose-500/10 scale-[1.01]"
            : "border-border/60 bg-card/60 hover:border-rose-500/50 hover:bg-accent/40"
        } ${isUploading ? "pointer-events-none opacity-80" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={allowMultiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center p-6 text-center">
          {/* Animated Icon */}
          <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-500 shadow-inner">
            <UploadCloud
              className={`h-7 w-7 transition-transform duration-300 ${isUploading ? "animate-bounce" : "group-hover:scale-110"}`}
            />
            <span className="absolute -inset-1 animate-ping rounded-2xl bg-rose-500/20 opacity-30" />
          </div>

          <p className="text-sm font-semibold text-foreground">
            <span className="text-rose-500 underline underline-offset-2">Click to browse</span> or
            drag & drop files here
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Supports JPG, PNG, WebP, GIF (Max {maxSizeMB}MB). Images are auto-compressed.
          </p>
        </div>

        {/* Live Upload Progress Bar */}
        {isUploading && (
          <div className="absolute inset-x-0 bottom-0 bg-card/90 p-3 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span className="flex items-center space-x-1.5">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-rose-500" />
                <span>Compressing & Uploading...</span>
              </span>
              <span className="font-serif font-bold text-rose-500">
                {Math.round(uploadProgress)}%
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Success Notification */}
      {isSuccess && (
        <div className="flex items-center space-x-2 rounded-xl bg-emerald-500/15 p-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
          <span>Image compressed & uploaded successfully!</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMsg && (
        <div className="flex items-center space-x-2 rounded-xl bg-rose-500/15 p-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Image Previews & Thumbnails */}
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-2.5 pt-1 sm:grid-cols-4 md:grid-cols-5">
          {previewUrls.map((url, idx) => (
            <div
              key={idx}
              className="group relative aspect-video overflow-hidden rounded-xl border border-border bg-card"
            >
              <img
                src={url}
                alt={`Preview ${idx + 1}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removePreview(idx);
                }}
                className="absolute top-1 right-1 grid h-5 w-5 place-items-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-rose-500"
                title="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
