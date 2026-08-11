import { BadgeCheck } from "lucide-react";
import { motion } from "motion/react";

import type { PayoutWinner } from "@/types/content";

export function WinnerCard({ winner }: { winner: PayoutWinner }) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className="glass aurora-ring pointer-glow relative flex h-full flex-col items-center overflow-hidden rounded-4xl p-8 text-center"
    >
      {/* Image placeholder — replace `imageUrl` with a Storage URL later. */}
      <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-accent ring-1 ring-primary/25">
        {winner.imageUrl ? (
          <img
            src={winner.imageUrl}
            alt={winner.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="font-display text-2xl text-accent-foreground">
            {winner.name.charAt(0)}
          </span>
        )}
      </div>
      <h3 className="mt-5 flex items-center gap-1.5 text-lg">
        {winner.name}
        <BadgeCheck className="h-4 w-4 text-primary" />
      </h3>
      {winner.handle ? <p className="text-xs text-muted-foreground">{winner.handle}</p> : null}
      <p className="text-gradient-rose mt-4 font-display text-3xl">{winner.amount}</p>
      <p className="mt-2 text-sm text-muted-foreground">{winner.reason}</p>
      <p className="mt-5 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
        Paid{" "}
        {new Date(winner.paidAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </p>
    </motion.article>
  );
}
