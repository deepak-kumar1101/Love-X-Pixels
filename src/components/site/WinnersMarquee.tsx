import React from "react";
import { Trophy, Sparkles } from "lucide-react";
import type { PayoutWinner } from "@/types/content";

interface WinnersMarqueeProps {
  winners: PayoutWinner[];
}

export const WinnersMarquee: React.FC<WinnersMarqueeProps> = ({ winners }) => {
  if (!winners || winners.length === 0) return null;

  // Duplicate items to ensure smooth seamless infinite loop
  const displayItems = [...winners, ...winners, ...winners];

  return (
    <div className="relative w-full overflow-hidden border-y border-rose-200/40 bg-gradient-to-r from-rose-500/10 via-pink-500/5 to-rose-500/10 py-2.5 backdrop-blur-md">
      <div className="absolute left-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none" />

      <div className="flex w-max marquee space-x-8 text-xs font-medium tracking-wide">
        {displayItems.map((winner, idx) => (
          <div
            key={`${winner.id}-${idx}`}
            className="inline-flex items-center space-x-2 rounded-full border border-rose-200/50 bg-white/70 px-3.5 py-1 shadow-xs transition-transform hover:scale-105 dark:border-rose-900/40 dark:bg-rose-950/40"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Trophy className="h-3 w-3" />
            </span>
            <span className="font-semibold text-foreground">{winner.name}</span>
            {winner.handle && <span className="text-muted-foreground">{winner.handle}</span>}
            <span className="font-serif font-bold text-rose-600 dark:text-rose-400">
              won {winner.amount}
            </span>
            <span className="text-[10px] opacity-60">({winner.reason})</span>
            <Sparkles className="h-3 w-3 text-amber-400" />
          </div>
        ))}
      </div>
    </div>
  );
};
