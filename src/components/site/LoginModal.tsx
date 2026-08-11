import React, { useState } from "react";
import { X, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import { userRepository } from "@/repositories/user.repository";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "admin@lovepixels.com";

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { signInWithDiscord } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handlePostAuth = async (userEmail: string, uid: string) => {
    const isCustomAdminMail =
      userEmail.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim() ||
      userEmail.toLowerCase().trim().startsWith("admin");

    if (isCustomAdminMail) {
      await userRepository.updateRoles(uid, ["Owner", "Admin", "Member"]).catch(() => {});
      onClose();
      navigate({ to: "/admin" });
    } else {
      onClose();
    }
  };

  const handleDiscordAuth = async () => {
    setError("");
    setIsLoading(true);
    try {
      const user = await signInWithDiscord();
      await handlePostAuth(user.email || "", user.uid);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String(err.message)
          : "Discord authentication was cancelled or failed.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Glassmorphic Modal Dialog */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-indigo-500/30 bg-background/95 p-6 shadow-2xl backdrop-blur-xl dark:border-indigo-500/40 dark:bg-zinc-900/95 sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Discord Header */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-500 shadow-xs">
            <svg className="h-9 w-9 fill-current" viewBox="0 0 127.14 96.36">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a74.58,74.58,0,0,0,64.3,0c.87.69,1.76,1.37,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14c3-27.38-5.12-51.11-18.93-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.87,53,48.73,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91,65.69,84.69,65.69Z" />
            </svg>
          </div>

          <h2 className="mt-4 font-serif text-2xl font-bold text-foreground">
            Sign in with Discord
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Authenticate using your Discord account to join events, claim rewards, and participate
            in community activities.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-center text-xs text-rose-500">
            {error}
          </div>
        )}

        {/* Main Discord Auth Action */}
        <div className="mt-8 space-y-4">
          <button
            type="button"
            onClick={handleDiscordAuth}
            disabled={isLoading}
            className="flex w-full items-center justify-center space-x-3 rounded-2xl bg-[#5865F2] px-5 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#4752C4] hover:shadow-indigo-500/25 active:scale-95 disabled:opacity-50"
          >
            <svg className="h-5 w-5 fill-current" viewBox="0 0 127.14 96.36">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a74.58,74.58,0,0,0,64.3,0c.87.69,1.76,1.37,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14c3-27.38-5.12-51.11-18.93-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.87,53,48.73,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91,65.69,84.69,65.69Z" />
            </svg>
            <span>{isLoading ? "Authenticating Discord..." : "Continue with Discord"}</span>
          </button>
        </div>

        {/* Feature Badges */}
        <div className="mt-8 grid grid-cols-2 gap-3 border-t border-border/40 pt-4 text-center">
          <div className="flex items-center justify-center space-x-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
            <span>Official Discord OAuth</span>
          </div>
          <div className="flex items-center justify-center space-x-1.5 text-[11px] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-rose-400" />
            <span>Instant Role Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
};
