import { useEffect, useRef } from "react";

export function Background() {
  const lightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;

    const updatePosition = () => {
      if (lightRef.current) {
        lightRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      }
      ticking = false;
    };

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!ticking) {
        requestAnimationFrame(updatePosition);
        ticking = true;
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Light Mode Soft Rose Theme Mesh */}
      <div className="absolute inset-0 dark:hidden bg-gradient-to-br from-rose-50/80 via-background to-pink-50/50">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-rose-200/40 blur-3xl opacity-70 animate-pulse" />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-pink-300/30 blur-3xl opacity-60" />
      </div>

      {/* Dark Mode Deep Midnight Obsidian Vynex Mesh */}
      <div className="hidden dark:block absolute inset-0 bg-[#08060a]">
        {/* Radial Mesh gradient */}
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(60% 50% at 20% 20%, rgba(220,38,38,0.35), transparent 60%)," +
              "radial-gradient(50% 45% at 80% 30%, rgba(139,0,0,0.35), transparent 60%)," +
              "radial-gradient(55% 50% at 50% 90%, rgba(239,68,68,0.28), transparent 60%)",
          }}
        />

        {/* Aurora blobs */}
        <div
          className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full blur-3xl opacity-60"
          style={{
            background: "radial-gradient(circle, #b91c1c, transparent 60%)",
            animation: "aurora 18s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full blur-3xl opacity-50"
          style={{
            background: "radial-gradient(circle, #ef4444, transparent 60%)",
            animation: "aurora 22s ease-in-out infinite reverse",
          }}
        />
        <div
          className="absolute bottom-0 left-1/3 h-[480px] w-[480px] rounded-full blur-3xl opacity-40"
          style={{
            background: "radial-gradient(circle, #7f1d1d, transparent 60%)",
            animation: "aurora 26s ease-in-out infinite",
          }}
        />

        {/* Floating particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <span
              key={i}
              className="absolute block h-[3px] w-[3px] rounded-full bg-white/40"
              style={{
                top: `${(i * 137) % 100}%`,
                left: `${(i * 91) % 100}%`,
                animation: `pulse-glow ${2.5 + (i % 4)}s ease-in-out infinite`,
                animationDelay: `${(i % 5) * 0.5}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
