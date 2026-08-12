import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

/**
 * Luxury first-paint veil. Purely visual: it dismisses on window load
 * (or after a short ceiling) — it never gates data.
 */
export function LoadingScreen({ minDuration = 1200 }: { minDuration?: number }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = window.setTimeout(() => setVisible(false), minDuration);
    return () => window.clearTimeout(id);
  }, [minDuration]);

  useEffect(() => {
    if (visible) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="veil"
          exit={{ opacity: 0, filter: "blur(12px)" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] grid place-items-center bg-background"
        >
          <div
            aria-hidden
            className="absolute top-1/2 left-1/2 h-[28rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-petal/50 blur-[120px]"
          />
          <div className="relative flex flex-col items-center">
            {/* CSS entrance so the veil is visible before hydration completes. */}
            <span className="glass-strong grid h-16 w-16 place-items-center rounded-[1.5rem]">
              <motion.svg
                viewBox="0 0 24 24"
                className="h-7 w-7 fill-current text-primary"
                aria-hidden
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <path d="M12 21s-7.5-4.6-9.3-9A5.3 5.3 0 0 1 12 6.6 5.3 5.3 0 0 1 21.3 12c-1.8 4.4-9.3 9-9.3 9Z" />
              </motion.svg>
            </span>

            <p className="mt-6 font-display text-2xl tracking-tight">LovePixels</p>

            <div className="mt-5 h-px w-40 overflow-hidden bg-border">
              <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="h-full w-1/2 bg-primary"
              />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
