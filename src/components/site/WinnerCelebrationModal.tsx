import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Sparkles, X, Ticket, ArrowRight, Gift } from "lucide-react";
import type { WinnerAnnouncement } from "@/models/event-system.model";

interface WinnerCelebrationModalProps {
  isOpen: boolean;
  announcement: WinnerAnnouncement | null;
  onClose: () => void;
  onClaimTicket: (announcement: WinnerAnnouncement) => void;
}

export const WinnerCelebrationModal: React.FC<WinnerCelebrationModalProps> = ({
  isOpen,
  announcement,
  onClose,
  onClaimTicket,
}) => {
  if (!isOpen || !announcement) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 30 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg overflow-hidden rounded-4xl border border-amber-400/50 bg-gradient-to-b from-amber-500/15 via-rose-500/10 to-zinc-950 p-8 shadow-2xl backdrop-blur-2xl dark:border-amber-400/40 dark:bg-zinc-950/95 sm:p-10"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full p-2 text-muted-foreground transition-colors hover:bg-rose-500/15 hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Decorative Sparkle Orbs */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -left-24 h-60 w-60 rounded-full bg-amber-400/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -right-24 h-60 w-60 rounded-full bg-rose-500/20 blur-3xl"
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Winner Badge Icon */}
            <div className="relative mb-4">
              <div className="grid h-20 w-20 place-items-center rounded-full border-2 border-amber-400 bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shadow-xl shadow-amber-500/20">
                {announcement.avatar ? (
                  <img
                    src={announcement.avatar}
                    alt={announcement.winnerName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <Trophy className="h-10 w-10 text-white" />
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-amber-400 text-black shadow-md">
                <Sparkles className="h-4.5 w-4.5 fill-current" />
              </span>
            </div>

            {/* Winner Badge Pill */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/15 px-3.5 py-1 text-xs font-bold text-amber-500 dark:text-amber-300">
              <Trophy className="h-3.5 w-3.5" />
              <span>OFFICIAL EVENT WINNER</span>
            </span>

            {/* Title */}
            <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Congratulations, {announcement.winnerName}! 🎉
            </h2>

            {/* Event & Prize Callout */}
            <div className="mt-5 w-full rounded-3xl border border-amber-400/30 bg-card/80 p-5 backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                You Won in {announcement.eventName}
              </p>
              <p className="mt-1 font-serif text-3xl font-extrabold text-gradient-rose">
                {announcement.prizeWon}
              </p>
            </div>

            {/* Warm Greeting & Instructions */}
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Thank you for participating in LovePixels! Your reward is ready to be claimed. Please submit your reward claim ticket below so staff can process your payout.
            </p>

            {/* Create Ticket / Claim Reward Button */}
            <button
              onClick={() => {
                onClaimTicket(announcement);
                onClose();
              }}
              className="group mt-7 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-rose-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-98"
            >
              <Ticket className="h-4.5 w-4.5" />
              <span>Create Ticket / Claim Reward</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
