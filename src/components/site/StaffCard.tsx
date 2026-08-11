import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import type { PointerEvent as ReactPointerEvent } from "react";

import type { StaffMember, StaffPresence } from "@/types/content";

const presenceCopy: Record<StaffPresence, { label: string; dot: string; ring: string }> = {
  online: { label: "Online", dot: "bg-status-online", ring: "bg-status-online/35" },
  idle: { label: "Idle", dot: "bg-status-idle", ring: "bg-status-idle/35" },
  dnd: { label: "Do not disturb", dot: "bg-status-dnd", ring: "bg-status-dnd/35" },
  offline: { label: "Offline", dot: "bg-status-offline", ring: "bg-status-offline/30" },
};

/**
 * Presentational only. Pass a Firebase-loaded StaffMember into this card later —
 * no internals need to change.
 */
export function StaffCard({ member }: { member: StaffMember }) {
  const presence = presenceCopy[member.presence ?? "offline"];

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [7, -7]), { stiffness: 180, damping: 18 });
  const rotateY = useSpring(useTransform(px, [0, 1], [-9, 9]), { stiffness: 180, damping: 18 });
  const glowX = useMotionTemplate`${useTransform(px, (v) => v * 100)}%`;
  const glowY = useMotionTemplate`${useTransform(py, (v) => v * 100)}%`;

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
  }

  function handlePointerLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <motion.div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1100,
        // consumed by the pointer-glow utility
        ["--glow-x" as string]: glowX,
        ["--glow-y" as string]: glowY,
      }}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className="aurora-ring pointer-glow glass h-full rounded-4xl"
    >
      <article className="relative z-10 flex h-full flex-col p-8 text-center">
        <div className="relative mx-auto">
          <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-full border border-border/80 bg-accent shadow-[0_18px_40px_-22px_oklch(0.65_0.18_8_/_0.7)]">
            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                alt={member.name}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-display text-3xl text-accent-foreground">
                {member.name.charAt(0)}
              </span>
            )}
          </div>
          <span
            className="absolute right-0.5 bottom-0.5 grid h-6 w-6 place-items-center rounded-full bg-card"
            title={presence.label}
          >
            <span className="sr-only">{presence.label}</span>
            {member.presence === "online" ? (
              <span
                aria-hidden
                className={`absolute h-4 w-4 animate-ping rounded-full ${presence.ring}`}
              />
            ) : null}
            <span aria-hidden className={`h-3 w-3 rounded-full ${presence.dot}`} />
          </span>
        </div>

        <h3 className="mt-6 text-xl font-bold text-foreground">{member.name}</h3>
        {member.handle ? (
          <p className="mt-0.5 text-xs font-mono font-semibold tracking-wide text-rose-500/90">
            {member.handle.startsWith("@") ? member.handle : `@${member.handle}`}
          </p>
        ) : null}
        <p className="mt-2 text-sm font-medium text-primary">{member.role}</p>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{member.bio}</p>

        {member.tags?.length ? (
          <ul className="mt-auto flex flex-wrap justify-center gap-2 pt-6">
            {member.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-border/70 bg-card/70 px-3 py-1 text-xs text-muted-foreground"
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
      </article>
    </motion.div>
  );
}
