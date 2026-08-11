import { Sparkles } from "lucide-react";

import type { PayoutWinner } from "@/types/content";

/** Infinite marquee ribbon of recent winners. Pure presentation. */
export function WinnersRibbon({ winners }: { winners: PayoutWinner[] }) {
  const loop = [...winners, ...winners];

  return (
    <div className="glass relative overflow-hidden rounded-full py-3">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />
      <div className="marquee flex w-max items-center gap-8 px-6">
        {loop.map((w, i) => (
          <span
            key={`${w.id}-${i}`}
            className="flex shrink-0 items-center gap-2 text-sm whitespace-nowrap"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium">{w.name}</span>
            <span className="text-muted-foreground">received</span>
            <span className="text-gradient-rose font-display text-base">{w.amount}</span>
            <span className="text-muted-foreground">· {w.reason}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
