import React, { useEffect } from "react";
import { X, Download } from "lucide-react";
import { toast } from "sonner";

interface LightboxModalProps {
  src: string | null;
  title?: string;
  caption?: string;
  onClose: () => void;
}

export const downloadImage = async (url: string, filename?: string) => {
  try {
    const name = filename || `lovepixels-image-${Date.now()}.jpg`;
    if (url.startsWith("data:") || url.startsWith("blob:")) {
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    }
    toast.success("📥 Image download started!");
  } catch (err) {
    console.warn("Direct blob download fallback:", err);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "lovepixels-image.jpg";
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("📥 Image opening for download!");
  }
};

export const LightboxModal: React.FC<LightboxModalProps> = ({ src, title, caption, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!src) return null;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadImage(src, caption ? `${caption.toLowerCase().replace(/[^a-z0-9]/g, "-")}.jpg` : undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl border border-white/20 bg-black/40 shadow-2xl backdrop-blur-2xl">
        {/* Top Control Buttons: Download & Close */}
        <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            title="Download Image"
            className="flex items-center gap-1.5 rounded-full bg-black/60 px-4 py-2 text-xs font-semibold text-white/90 backdrop-blur-md transition-all hover:bg-rose-500 hover:text-white cursor-pointer shadow-lg"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Close"
            className="rounded-full bg-black/60 p-2 text-white/80 backdrop-blur-md transition-all hover:bg-rose-500 hover:text-white cursor-pointer shadow-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center">
          <img
            src={src}
            alt={title || "Gallery item"}
            className="max-h-[75vh] w-auto object-contain"
          />
          {(title || caption) && (
            <div className="w-full bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 text-center text-white">
              {title && <h4 className="font-serif text-lg font-bold">{title}</h4>}
              {caption && <p className="mt-1 text-xs text-white/70">{caption}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
