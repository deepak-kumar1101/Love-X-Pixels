import {
  CalendarDays,
  Clock,
  Gift,
  Users,
  Bell,
  Eye,
  CheckCircle,
  ShieldAlert,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

import type { ExtendedCommunityEvent } from "@/models/event-system.model";

/**
 * Live Countdown Timer — derived from server-based endsAt / durationHours.
 */
function useCountdown(event: ExtendedCommunityEvent) {
  const [parts, setParts] = useState<{ d: string; h: string; m: string; s: string } | null>(null);

  useEffect(() => {
    const pad = (n: number) => String(Math.max(0, n)).padStart(2, "0");
    const tick = () => {
      const now = Date.now();
      let targetTime = 0;

      if (event.endsAt) {
        targetTime = new Date(event.endsAt).getTime();
      } else if (event.startsAt) {
        const durationMs = (event.durationHours || 24) * 3600 * 1000;
        targetTime = new Date(event.startsAt).getTime() + durationMs;
      }

      if (targetTime === 0) {
        setParts({ d: "00", h: "00", m: "00", s: "00" });
        return;
      }

      const diff = targetTime - now;
      const clamped = Math.max(0, diff);
      setParts({
        d: pad(Math.floor(clamped / 86400000)),
        h: pad(Math.floor((clamped / 3600000) % 24)),
        m: pad(Math.floor((clamped / 60000) % 60)),
        s: pad(Math.floor((clamped / 1000) % 60)),
      });
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [event.startsAt, event.endsAt, event.durationHours]);

  return parts;
}

function CountdownUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="glass-strong min-w-14 rounded-2xl px-3 py-2 text-center">
      <p className="font-display text-xl leading-none tabular-nums">{value}</p>
      <p className="mt-1 text-[0.6rem] tracking-widest text-muted-foreground uppercase">{label}</p>
    </div>
  );
}

function Countdown({ event, ended }: { event: ExtendedCommunityEvent; ended?: boolean }) {
  const parts = useCountdown(event);
  if (ended) {
    return (
      <div className="flex items-center gap-2">
        <CountdownUnit value="00" label="hrs" />
        <CountdownUnit value="00" label="min" />
        <CountdownUnit value="00" label="sec" />
        <span className="ml-2 text-xs font-bold text-rose-500 uppercase tracking-wider">ENDED</span>
      </div>
    );
  }
  const p = parts ?? { d: "--", h: "--", m: "--", s: "--" };
  return (
    <div className="flex gap-2">
      {Number(p.d) > 0 && <CountdownUnit value={p.d} label="days" />}
      <CountdownUnit value={p.h} label="hrs" />
      <CountdownUnit value={p.m} label="min" />
      <CountdownUnit value={p.s} label="sec" />
    </div>
  );
}

function ParticipantStack({ names }: { names: string[] }) {
  return (
    <div className="flex -space-x-2">
      {names.slice(0, 5).map((name) => (
        <span
          key={name}
          title={name}
          className="grid h-8 w-8 place-items-center rounded-full border border-background/80 bg-accent text-[0.7rem] font-medium text-accent-foreground"
        >
          {name.charAt(0)}
        </span>
      ))}
    </div>
  );
}

function formatDate(iso?: string) {
  if (!iso) return "Date TBD";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function EventCard({
  event,
  featured = false,
  onParticipate,
  onNotify,
  onViewDetails,
  isRegistered = false,
}: {
  event: ExtendedCommunityEvent;
  featured?: boolean;
  onParticipate?: (event: ExtendedCommunityEvent) => void;
  onNotify?: (event: ExtendedCommunityEvent) => void;
  onViewDetails?: (event: ExtendedCommunityEvent) => void;
  isRegistered?: boolean;
}) {
  const now = Date.now();
  const startTime = event.startsAt ? new Date(event.startsAt).getTime() : now;
  const durationMs = (event.durationHours || 24) * 3600 * 1000;
  const endTime = event.endsAt ? new Date(event.endsAt).getTime() : startTime + durationMs;

  const past = event.status === "past" || event.status === "completed" || now >= endTime;
  const isLive = !past && (event.status === "live" || now >= startTime);

  const maxSlots = event.maxSlots || event.capacity || 50;
  const registeredCount = event.registeredCount || event.participants || 0;
  const remainingSlots = Math.max(0, maxSlots - registeredCount);
  const isFull = remainingSlots <= 0;

  const pct = Math.min(100, Math.round((registeredCount / maxSlots) * 100));

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className={`group aurora-ring flex h-full flex-col overflow-hidden rounded-4xl ${
        featured ? "glass-strong ring-1 ring-primary/25" : "glass"
      } ${past ? "opacity-90" : ""}`}
    >
      <div className="relative h-44 overflow-hidden md:h-52">
        {event.bannerUrl ? (
          <img
            src={event.bannerUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-accent" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent" />
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <span
            className={`glass-strong rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
              past
                ? "bg-rose-500/20 text-rose-400"
                : isLive
                  ? "bg-emerald-500/20 text-emerald-400 font-bold"
                  : "text-foreground"
            }`}
          >
            {past ? (
              "ENDED"
            ) : isLive ? (
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                LIVE NOW
              </span>
            ) : (
              "UPCOMING"
            )}
          </span>
          {event.reward ? (
            <span className="glass-strong flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
              <Gift className="h-3.5 w-3.5 text-primary" />
              {event.reward}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 p-7 md:p-8">
        <div>
          <h3 className={featured ? "font-display text-2xl md:text-3xl" : "text-xl font-bold"}>
            {event.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{event.description}</p>
        </div>

        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" /> {formatDate(event.startsAt)}
          </li>
          <li className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />{" "}
            {event.durationLabel || `${event.durationHours || 24} Hours`}
          </li>
          <li className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> Hosted by {event.host}
          </li>
        </ul>

        <div className="mt-auto grid gap-5">
          <Countdown event={event} ended={past} />

          <div className="grid gap-2.5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {event.participantNames?.length ? (
                  <ParticipantStack names={event.participantNames} />
                ) : null}
                <p className="text-xs text-muted-foreground">
                  {registeredCount} / {maxSlots} slots filled
                </p>
              </div>
              <p
                className={`text-xs font-bold ${isFull ? "text-rose-500" : "text-muted-foreground"}`}
              >
                {isFull ? "EVENT FULL" : `${remainingSlots} left`}
              </p>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${pct}%` }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 1.1, ease: "easeOut" }}
                className={`h-full rounded-full ${isFull ? "bg-rose-500" : "bg-primary"}`}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            {isRegistered ? (
              <div className="flex flex-1 items-center justify-center space-x-1.5 rounded-xl bg-emerald-500/15 py-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-4 w-4" />
                <span>Registered</span>
              </div>
            ) : past ? (
              <div className="flex flex-1 items-center justify-center rounded-xl bg-muted py-2.5 text-xs font-medium text-muted-foreground">
                Participation Closed (Ended)
              </div>
            ) : isFull ? (
              <div className="flex flex-1 items-center justify-center space-x-1 rounded-xl bg-rose-500/15 py-2.5 text-xs font-bold text-rose-500">
                <ShieldAlert className="h-4 w-4" />
                <span>Event Full</span>
              </div>
            ) : isLive && onParticipate ? (
              <button
                onClick={() => onParticipate(event)}
                className="flex-1 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95"
              >
                Participate Now
              </button>
            ) : onNotify ? (
              <button
                onClick={() => onNotify(event)}
                className="flex flex-1 items-center justify-center space-x-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-rose-500 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95"
              >
                <Bell className="h-4 w-4" />
                <span>Notify Me</span>
              </button>
            ) : null}

            {onViewDetails && (
              <button
                onClick={() => onViewDetails(event)}
                className="inline-flex items-center space-x-1 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-semibold text-foreground hover:bg-accent"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Details</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
