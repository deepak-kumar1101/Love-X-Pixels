import React, { useEffect, useState } from "react";
import { Trophy, Sparkles, Gift, ArrowRight } from "lucide-react";
import type { WinnerAnnouncement } from "@/models/event-system.model";

interface WinnerAnnouncementCardProps {
  announcement: WinnerAnnouncement;
  onClaimClick?: (announcement: WinnerAnnouncement) => void;
}

export const WinnerAnnouncementCard: React.FC<WinnerAnnouncementCardProps> = ({
  announcement,
  onClaimClick,
}) => {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-amber-300/60 bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-purple-500/15 p-6 shadow-xl backdrop-blur-xl dark:border-amber-500/40">
      {/* Animated Sparkle Particles */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute left-1/4 top-2 h-2 w-2 animate-ping rounded-full bg-amber-400 opacity-75" />
          <div className="absolute right-1/3 top-4 h-2 w-2 animate-ping rounded-full bg-rose-400 opacity-75" />
          <div className="absolute right-10 bottom-4 h-2 w-2 animate-ping rounded-full bg-purple-400 opacity-75" />
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            {announcement.avatar ? (
              <img
                src={announcement.avatar}
                alt={announcement.winnerName}
                className="h-16 w-16 rounded-full border-2 border-amber-400 object-cover shadow-md"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-rose-500 font-serif text-2xl font-bold text-white shadow-md">
                🏆
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-amber-400 text-black shadow-xs">
              <Trophy className="h-3.5 w-3.5 fill-current" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center space-x-1.5 rounded-full bg-amber-400/20 px-3 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>🏆 Official Event Winner</span>
            </div>
            <h3 className="mt-1 font-serif text-xl font-bold text-foreground">
              Congratulations {announcement.winnerName}!
            </h3>
            <p className="text-xs text-muted-foreground">
              Won <span className="font-semibold text-rose-500">{announcement.prizeWon}</span> in{" "}
              <span className="font-semibold text-foreground">{announcement.eventName}</span>
            </p>
          </div>
        </div>

        {onClaimClick && (
          <button
            onClick={() => onClaimClick(announcement)}
            className="inline-flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 px-5 py-3 text-xs font-bold text-white shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <Gift className="h-4 w-4" />
            <span>Claim Reward Ticket</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
