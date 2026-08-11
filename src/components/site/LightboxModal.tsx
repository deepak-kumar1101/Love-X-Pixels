import React, { useEffect } from "react";
import { X, ZoomIn } from "lucide-react";

interface LightboxModalProps {
  src: string | null;
  title?: string;
  caption?: string;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({ src, title, caption, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!src) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl border border-white/20 bg-black/40 shadow-2xl backdrop-blur-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full bg-black/60 p-2 text-white/80 transition-all hover:bg-rose-500 hover:text-white"
        >
          <X className="h-6 w-6" />
        </button>

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
