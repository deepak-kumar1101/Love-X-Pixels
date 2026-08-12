import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Sparkles,
  Send,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

// ─── Webhook ──────────────────────────────────────────────────────────────────
const WEBHOOK_URL =
  "https://discord.com/api/webhooks/1507366537533722745/ZTgTXz6gvGvj9t2gfQVR00tYuWdw_idCdu0ORs81E-Ga7xH_A0p5qGFfsDX-lRLJ6tE2";

// ─── Roles available ──────────────────────────────────────────────────────────
const ROLES = [
  { value: "moderator", label: "🛡️ Moderator", color: "from-blue-500/20 to-indigo-500/10" },
  { value: "helper", label: "🌸 Helper", color: "from-pink-500/20 to-rose-500/10" },
  { value: "event-host", label: "🎉 Event Host", color: "from-amber-500/20 to-orange-500/10" },
  { value: "curator", label: "🎨 Gallery Curator", color: "from-violet-500/20 to-purple-500/10" },
  { value: "community-manager", label: "💬 Community Manager", color: "from-emerald-500/20 to-green-500/10" },
];

// ─── Floating sticker decoration ─────────────────────────────────────────────
const STICKERS = ["✨", "🌸", "💫", "🎀", "🌷", "⭐", "🦋", "🩷"];

interface Props {
  discordHandle: string;
  onClose: () => void;
}

// ─── Magnetic Button ──────────────────────────────────────────────────────────
function MagneticButton({
  children,
  onClick,
  disabled,
  type = "button",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current || disabled) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setPos({ x: (e.clientX - cx) * 0.35, y: (e.clientY - cy) * 0.35 });
  }, [disabled]);

  const handleLeave = useCallback(() => setPos({ x: 0, y: 0 }), []);

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.button>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export function StaffApplicationModal({ discordHandle, onClose }: Props) {
  const [role, setRole] = useState("");
  const [previousServer, setPreviousServer] = useState("");
  const [hadPreviousRole, setHadPreviousRole] = useState<"yes" | "no" | "">("");
  const [about, setAbout] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [roleOpen, setRoleOpen] = useState(false);
  const [floatingStickers] = useState(() =>
    Array.from({ length: 8 }, (_, i) => ({
      emoji: STICKERS[i],
      x: Math.random() * 90 + 5,
      y: Math.random() * 90 + 5,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 3,
      size: 14 + Math.random() * 10,
    }))
  );

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const selectedRole = ROLES.find((r) => r.value === role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !hadPreviousRole) return;

    setStatus("loading");
    setErrorMsg("");

    const embed = {
      title: "📋 New Staff Application",
      color: 0xff5e7d,
      fields: [
        { name: "Discord Handle", value: `\`${discordHandle}\``, inline: true },
        { name: "Role Applied For", value: selectedRole?.label ?? role, inline: true },
        {
          name: "Previous Experience",
          value:
            hadPreviousRole === "yes"
              ? `✅ Yes — ${previousServer || "not specified"}`
              : "❌ No previous experience",
          inline: false,
        },
        ...(about.trim()
          ? [{ name: "About Themselves", value: about.trim(), inline: false }]
          : []),
      ],
      footer: { text: "LovePixels Staff Applications" },
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embeds: [embed] }),
      });

      if (!res.ok) throw new Error(`Webhook error ${res.status}`);
      setStatus("success");
    } catch (err) {
      console.error("[StaffApplication] Webhook error:", err);
      setErrorMsg("Failed to send application. Please try again.");
      setStatus("error");
    }
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      >
        {/* Modal */}
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.88, y: 32 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 32 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl"
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(40px) saturate(200%)",
            boxShadow:
              "0 32px 80px -20px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.18), 0 0 0 1px rgba(239,68,68,0.1)",
          }}
        >
          {/* Floating stickers */}
          {floatingStickers.map((s, i) => (
            <motion.span
              key={i}
              className="pointer-events-none absolute select-none"
              style={{ left: `${s.x}%`, top: `${s.y}%`, fontSize: s.size, opacity: 0.18 }}
              animate={{ y: [0, -8, 0], rotate: [-5, 5, -5] }}
              transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
            >
              {s.emoji}
            </motion.span>
          ))}

          {/* Glow orb */}
          <div
            className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full opacity-20 blur-3xl"
            style={{ background: "radial-gradient(circle, #ff5e7d, transparent)" }}
          />
          <div
            className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full opacity-15 blur-3xl"
            style={{ background: "radial-gradient(circle, #f472b6, transparent)" }}
          />

          <div className="relative z-10 p-7 sm:p-9">
            {/* Header */}
            <div className="mb-7 flex items-start justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: [0, 15, -10, 15, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="text-2xl"
                  >
                    ✨
                  </motion.span>
                  <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-0.5 text-xs font-semibold text-rose-400">
                    Staff Application
                  </span>
                </div>
                <h2 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
                  Join the Team
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Applying as{" "}
                  <span className="font-semibold text-rose-400">{discordHandle}</span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border/60 bg-card/60 text-muted-foreground transition-colors hover:border-rose-500/40 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Success State */}
            {status === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 py-8 text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.6, repeat: 3 }}
                  className="text-6xl"
                >
                  🎉
                </motion.div>
                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Application Sent!</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    We'll review your application and reach out via Discord. Thank you! 🌸
                  </p>
                </div>
                <MagneticButton
                  onClick={onClose}
                  className="mt-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-8 py-3 text-sm font-semibold text-white"
                >
                  Close
                </MagneticButton>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Role Selector */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Role you're applying for <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setRoleOpen((p) => !p)}
                      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/50 px-4 py-3.5 text-sm transition-all hover:border-rose-500/40 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                      style={{ backdropFilter: "blur(12px)" }}
                    >
                      <span className={role ? "text-foreground" : "text-muted-foreground"}>
                        {selectedRole?.label ?? "Select a role…"}
                      </span>
                      <motion.span animate={{ rotate: roleOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </motion.span>
                    </button>

                    <AnimatePresence>
                      {roleOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.97 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full z-20 mt-1.5 w-full overflow-hidden rounded-2xl border border-border/60 shadow-xl"
                          style={{
                            background: "rgba(20,14,18,0.95)",
                            backdropFilter: "blur(32px)",
                          }}
                        >
                          {ROLES.map((r) => (
                            <button
                              key={r.value}
                              type="button"
                              onClick={() => { setRole(r.value); setRoleOpen(false); }}
                              className={`flex w-full items-center gap-3 bg-gradient-to-r px-4 py-3 text-left text-sm transition-colors hover:bg-white/5 ${r.color} ${role === r.value ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                            >
                              {r.label}
                              {role === r.value && (
                                <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-rose-400" />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Previous Experience */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Have you held this role in another server? <span className="text-rose-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(["yes", "no"] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setHadPreviousRole(opt)}
                        className={`rounded-2xl border py-3 text-sm font-semibold transition-all ${
                          hadPreviousRole === opt
                            ? "border-rose-500/60 bg-rose-500/15 text-rose-400"
                            : "border-border/60 bg-card/40 text-muted-foreground hover:border-rose-500/30 hover:bg-rose-500/5"
                        }`}
                      >
                        {opt === "yes" ? "✅ Yes" : "❌ No"}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence>
                    {hadPreviousRole === "yes" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2.5 overflow-hidden"
                      >
                        <input
                          type="text"
                          placeholder="Which server(s)? (e.g. Pixel Café, NightOwls)"
                          value={previousServer}
                          onChange={(e) => setPreviousServer(e.target.value)}
                          className="w-full rounded-2xl border border-border/60 bg-card/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-rose-500/40 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                          style={{ backdropFilter: "blur(12px)" }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* About */}
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Tell us about yourself
                    <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-normal normal-case tracking-normal text-muted-foreground">
                      optional
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Why do you want to join? What makes you a great fit? 🌸"
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    maxLength={500}
                    className="w-full resize-none rounded-2xl border border-border/60 bg-card/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-rose-500/40 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                    style={{ backdropFilter: "blur(12px)" }}
                  />
                  <p className="mt-1 text-right text-[11px] text-muted-foreground/60">
                    {about.length}/500
                  </p>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {status === "error" && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 rounded-xl bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-400"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {errorMsg}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Sticker row */}
                <div className="flex justify-center gap-2 py-1 text-lg opacity-40">
                  {["🌸", "✨", "🎀", "💫", "🌷"].map((s, i) => (
                    <motion.span
                      key={i}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                    >
                      {s}
                    </motion.span>
                  ))}
                </div>

                {/* Submit */}
                <MagneticButton
                  type="submit"
                  disabled={!role || !hadPreviousRole || status === "loading"}
                  className={`group relative w-full overflow-hidden rounded-full py-4 text-sm font-semibold text-white transition-all ${
                    !role || !hadPreviousRole
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer"
                  }`}
                  style={{
                    background: "linear-gradient(135deg, #ff5e7d 0%, #e11d48 50%, #be185d 100%)",
                    boxShadow: "0 8px 32px -8px rgba(225,29,72,0.6)",
                  }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2.5">
                    {status === "loading" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending Application…
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Submit Application
                        <Sparkles className="h-4 w-4" />
                      </>
                    )}
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-white/10"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.5 }}
                  />
                </MagneticButton>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
