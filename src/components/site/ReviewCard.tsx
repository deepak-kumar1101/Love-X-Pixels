import { Quote, Star } from "lucide-react";
import { motion } from "motion/react";

import type { PayoutReview } from "@/types/content";

export function ReviewCard({ review }: { review: PayoutReview }) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className="glass aurora-ring flex h-full flex-col rounded-4xl p-8"
    >
      <Quote className="h-6 w-6 text-primary/60" />
      <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">"{review.quote}"</p>

      <div className="mt-6 flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${
              i < review.rating ? "fill-primary text-primary" : "text-muted-foreground/40"
            }`}
          />
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3 border-t border-border/60 pt-6">
        {/* Image placeholder — swap for a Storage avatar URL later. */}
        <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-accent">
          {review.imageUrl ? (
            <img
              src={review.imageUrl}
              alt={review.name}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm text-accent-foreground">{review.name.charAt(0)}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm">{review.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {review.role ?? review.handle}
            {review.payoutLabel ? ` · ${review.payoutLabel}` : ""}
          </p>
        </div>
      </div>
    </motion.article>
  );
}
