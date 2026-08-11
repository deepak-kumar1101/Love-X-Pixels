import React from "react";
import { X, CalendarDays, Clock, Gift, Users, ShieldAlert, CheckCircle, Bell } from "lucide-react";
import type { ExtendedCommunityEvent } from "@/models/event-system.model";

interface EventDetailsModalProps {
  event: ExtendedCommunityEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onParticipate?: (event: ExtendedCommunityEvent) => void;
  onNotify?: (event: ExtendedCommunityEvent) => void;
  isRegistered?: boolean;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  isOpen,
  onClose,
  onParticipate,
  onNotify,
  isRegistered = false,
}) => {
  if (!isOpen || !event) return null;

  const maxSlots = event.maxSlots || event.capacity || 50;
  const registeredCount = event.registeredCount || event.participants || 0;
  const remainingSlots = Math.max(0, maxSlots - registeredCount);
  const isFull = remainingSlots <= 0;
  const isLive = event.status === "live";
  const isPast = event.status === "past" || event.status === "completed";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/65 backdrop-blur-md" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-rose-200/50 bg-background/95 p-6 shadow-2xl backdrop-blur-xl dark:border-rose-900/40 dark:bg-zinc-900/95 sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Banner */}
        <div className="relative h-48 w-full overflow-hidden rounded-2xl">
          {event.bannerUrl ? (
            <img src={event.bannerUrl} alt={event.title} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-rose-500/20 via-purple-500/20 to-pink-500/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          <div className="absolute top-4 left-4 flex gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                isLive ? "bg-rose-500 text-white" : "bg-black/60 text-white backdrop-blur-md"
              }`}
            >
              {event.status}
            </span>
            {event.difficulty && (
              <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                Difficulty: {event.difficulty}
              </span>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div className="mt-4">
          <h2 className="font-serif text-2xl font-bold text-foreground">{event.title}</h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{event.description}</p>
        </div>

        {/* Rules & Details Grid */}
        <div className="mt-6 grid gap-4 rounded-2xl border border-border/60 bg-card p-4 text-xs sm:grid-cols-2">
          <div>
            <p className="font-semibold text-foreground">Host:</p>
            <p className="text-muted-foreground">{event.host}</p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Reward / Prize:</p>
            <p className="font-serif font-bold text-rose-500">{event.reward || "₹1,000"}</p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Slots Capacity:</p>
            <p className="text-muted-foreground">
              {registeredCount} / {maxSlots} Registered ({remainingSlots} Remaining)
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Start Time:</p>
            <p className="text-muted-foreground">{new Date(event.startsAt).toLocaleString()}</p>
          </div>
        </div>

        {/* Rules */}
        {event.rules && event.rules.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-bold text-foreground">Event Rules:</h4>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground list-disc pl-4">
              {event.rules.map((rule, idx) => (
                <li key={idx}>{rule}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Slot Progress Bar */}
        <div className="mt-6 space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Slots Availability</span>
            <span className={isFull ? "text-rose-500 font-bold" : "text-emerald-500 font-bold"}>
              {isFull ? "EVENT FULL" : `${remainingSlots} Slots Open`}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full transition-all ${isFull ? "bg-rose-500" : "bg-gradient-to-r from-rose-500 to-pink-500"}`}
              style={{ width: `${Math.min(100, Math.round((registeredCount / maxSlots) * 100))}%` }}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-border/50 pt-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-accent"
          >
            Close
          </button>

          {isRegistered ? (
            <div className="inline-flex items-center space-x-1.5 rounded-xl bg-emerald-500/15 px-4 py-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              <span>Registered Participant</span>
            </div>
          ) : isPast ? (
            <span className="rounded-xl bg-muted px-4 py-2.5 text-xs font-semibold text-muted-foreground">
              Event Concluded
            </span>
          ) : isFull ? (
            <span className="inline-flex items-center space-x-1 rounded-xl bg-rose-500/15 px-4 py-2.5 text-xs font-bold text-rose-500">
              <ShieldAlert className="h-4 w-4" />
              <span>Event Full</span>
            </span>
          ) : isLive && onParticipate ? (
            <button
              onClick={() => onParticipate(event)}
              className="rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95"
            >
              Participate Now
            </button>
          ) : onNotify ? (
            <button
              onClick={() => onNotify(event)}
              className="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-purple-500 to-rose-500 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95"
            >
              <Bell className="h-4 w-4" />
              <span>Notify Me</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
