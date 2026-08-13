import { AnimatePresence, motion } from "motion/react";
import {
  Gamepad2,
  Gift,
  Hash,
  Image as ImageIcon,
  CalendarDays,
  Mic,
  MessageCircleHeart,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  previewChannels,
  previewConfessions,
  previewCountdown,
  previewGiveaways,
  previewMedia,
  previewMessages,
  previewParties,
  previewVoiceRooms,
} from "@/content/serverPreview";
import type { PreviewChannelKind } from "@/types/content";
import { toast } from "sonner";
import { addFirestoreDoc } from "@/lib/firebase";

const channelIcons: Record<PreviewChannelKind, typeof Hash> = {
  text: Hash,
  voice: Mic,
  media: ImageIcon,
  events: CalendarDays,
  giveaways: Gift,
  confession: MessageCircleHeart,
  gaming: Gamepad2,
};

const panelMotion = {
  initial: { opacity: 0, y: 16, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -12, filter: "blur(8px)" },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
};

function Stagger({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function GeneralPanel() {
  const [messages, setMessages] = useState(previewMessages);
  const [inputText, setInputText] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const newMessage = {
      id: "msg-" + Date.now(),
      author: "You (Visitor)",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      body: inputText.trim(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputText("");
  };

  return (
    <div className="grid gap-4">
      {messages.map((m, i) => (
        <Stagger key={m.id} index={i}>
          <div className="flex min-w-0 gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-rose-500/15 font-display text-sm font-semibold text-rose-500">
              {m.author[0]}
            </span>
            <div className="min-w-0">
              <p className="flex flex-wrap items-baseline gap-2">
                <span className="text-sm font-medium">{m.author}</span>
                <span className="text-[0.68rem] text-muted-foreground">{m.time}</span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{m.body}</p>
            </div>
          </div>
        </Stagger>
      ))}
      <form onSubmit={handleSend} className="mt-2 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Say something kind to the community..."
          className="flex-1 rounded-full border border-rose-200/60 bg-white/70 px-5 py-2.5 text-sm text-foreground shadow-xs outline-hidden focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 dark:border-rose-900/40 dark:bg-zinc-900/70"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="rounded-full bg-rose-500 px-5 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}

function VoicePanel() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {previewVoiceRooms.map((room, i) => (
        <Stagger key={room.id} index={i}>
          <article className="glass lift h-full rounded-3xl p-6">
            <div className="flex items-center justify-between gap-3">
              <h4 className="truncate text-base">{room.name}</h4>
              <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" /> {room.listeners}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{room.mood}</p>
            <div className="mt-5 flex items-center gap-2">
              {room.speakers.map((s) => (
                <span
                  key={s}
                  className="grid h-9 w-9 place-items-center rounded-full bg-petal font-display text-sm text-on-media"
                >
                  {s[0]}
                </span>
              ))}
              <span className="ml-auto flex items-end gap-[3px]">
                {[0, 1, 2, 3].map((b) => (
                  <motion.span
                    key={b}
                    className="w-[3px] rounded-full bg-primary"
                    animate={{ height: [6, 16, 9, 18, 7] }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      delay: b * 0.16,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </span>
            </div>
          </article>
        </Stagger>
      ))}
    </div>
  );
}

function MediaPanel() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {previewMedia.map((item, i) => (
        <Stagger key={item.id} index={i}>
          <figure className="group relative aspect-square overflow-hidden rounded-3xl border border-border/70">
            <img
              src={item.src}
              alt={item.alt}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.08]"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/85 to-transparent px-4 py-3 text-xs opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              by {item.author}
            </figcaption>
          </figure>
        </Stagger>
      ))}
    </div>
  );
}

function useCountdown(offsetMs: number) {
  const [now, setNow] = useState<number | null>(null);
  const [target] = useState(() => Date.now() + offsetMs);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return useMemo(() => {
    if (now === null) return null;
    const diff = Math.max(0, target - now);
    const s = Math.floor(diff / 1000);
    return {
      days: Math.floor(s / 86400),
      hours: Math.floor((s % 86400) / 3600),
      minutes: Math.floor((s % 3600) / 60),
      seconds: s % 60,
    };
  }, [now, target]);
}

function EventsPanel() {
  const left = useCountdown(previewCountdown.targetOffsetMs);
  const units = [
    { label: "days", value: left?.days },
    { label: "hours", value: left?.hours },
    { label: "mins", value: left?.minutes },
    { label: "secs", value: left?.seconds },
  ];

  return (
    <div className="grid gap-6">
      <Stagger index={0}>
        <div className="glass-strong rounded-3xl px-6 py-8 text-center">
          <p className="eyebrow">Next up</p>
          <h4 className="mt-3 text-2xl">{previewCountdown.title}</h4>
          <p className="mt-1 text-xs text-muted-foreground">Hosted by {previewCountdown.host}</p>
          <div className="mt-7 grid grid-cols-4 gap-3">
            {units.map((u) => (
              <div key={u.label} className="rounded-2xl bg-card/70 px-2 py-4">
                <p className="font-display text-2xl text-gradient-rose tabular-nums sm:text-3xl">
                  {u.value === undefined ? "—" : String(u.value).padStart(2, "0")}
                </p>
                <p className="mt-1 text-[0.62rem] tracking-widest uppercase text-muted-foreground">
                  {u.label}
                </p>
              </div>
            ))}
          </div>
          {/* RSVP writes to "eventRsvps" collection */}
          <button
            type="button"
            onClick={async () => {
              try {
                await addFirestoreDoc("eventRsvps", {
                  eventTitle: previewCountdown.title,
                  host: previewCountdown.host,
                  createdAt: new Date().toISOString(),
                });
                toast.success("🔔 Reminder set! You will be notified when this event starts.");
              } catch {
                toast.error("Failed to set reminder. Please try again.");
              }
            }}
            className="mt-7 rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground transition-transform duration-300 hover:scale-[1.03]"
          >
            Remind me
          </button>
        </div>
      </Stagger>
    </div>
  );
}

function GiveawaysPanel() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {previewGiveaways.map((g, i) => (
        <Stagger key={g.id} index={i}>
          <article className="glass lift h-full rounded-3xl p-6">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-accent text-accent-foreground">
              <Gift className="h-5 w-5" />
            </span>
            <h4 className="mt-5 text-lg">{g.prize}</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              {g.entries} entries · {g.endsInLabel} · by {g.host}
            </p>
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, g.entries / 2)}%` }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </article>
        </Stagger>
      ))}
    </div>
  );
}

function ConfessionPanel() {
  return (
    <div className="grid gap-4">
      {previewConfessions.map((c, i) => (
        <Stagger key={c.id} index={i}>
          <blockquote className="glass rounded-3xl p-6 text-sm leading-relaxed text-muted-foreground">
            <span className="eyebrow block">anonymous</span>
            <p className="mt-3">“{c.body}”</p>
          </blockquote>
        </Stagger>
      ))}
    </div>
  );
}

function GamingPanel() {
  return (
    <div className="grid gap-4">
      {previewParties.map((p, i) => (
        <Stagger key={p.id} index={i}>
          <article className="glass lift grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-3xl p-6">
            <div className="min-w-0">
              <h4 className="truncate text-base">{p.game}</h4>
              <p className="mt-1 text-xs text-muted-foreground">
                {p.note} · hosted by {p.host}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-primary/12 px-4 py-2 text-xs text-primary">
              {p.slots}
            </span>
          </article>
        </Stagger>
      ))}
    </div>
  );
}

function Panel({ kind }: { kind: PreviewChannelKind }) {
  switch (kind) {
    case "voice":
      return <VoicePanel />;
    case "media":
      return <MediaPanel />;
    case "events":
      return <EventsPanel />;
    case "giveaways":
      return <GiveawaysPanel />;
    case "confession":
      return <ConfessionPanel />;
    case "gaming":
      return <GamingPanel />;
    default:
      return <GeneralPanel />;
  }
}

export function ServerPreview() {
  const [activeId, setActiveId] = useState(previewChannels[0]!.id);
  const active = previewChannels.find((c) => c.id === activeId) ?? previewChannels[0]!;
  const ActiveIcon = channelIcons[active.kind];

  return (
    <div className="glass-strong overflow-hidden rounded-4xl">
      <div className="grid gap-0 md:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="border-b border-border/70 p-5 md:border-r md:border-b-0">
          <p className="eyebrow px-2">Server channels</p>
          <ul className="mt-4 grid gap-1">
            {previewChannels.map((channel) => {
              const Icon = channelIcons[channel.kind];
              const isActive = channel.id === activeId;
              return (
                <li key={channel.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(channel.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={`relative flex w-full min-w-0 items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left text-sm transition-colors duration-300 ${
                      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isActive ? (
                      <motion.span
                        layoutId="channel-pill"
                        className="absolute inset-0 rounded-2xl bg-accent/70"
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      />
                    ) : null}
                    <Icon className="relative h-4 w-4 shrink-0" />
                    <span className="relative truncate">{channel.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="min-w-0 p-6 sm:p-8">
          <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border/70 pb-5">
            <div className="flex min-w-0 items-center gap-2.5">
              <ActiveIcon className="h-4 w-4 shrink-0 text-primary" />
              <h3 className="truncate text-lg">{active.name}</h3>
            </div>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">{active.topic}</p>
          </header>

          <div className="mt-7 min-h-[22rem]">
            <AnimatePresence mode="wait">
              <motion.div key={active.id} {...panelMotion}>
                <Panel kind={active.kind} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
