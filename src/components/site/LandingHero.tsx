import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

import heroImage from "@/assets/hero.jpg";
import heroImage2 from "@/assets/hero-2.jpg";
import heroImage3 from "@/assets/hero-3.jpg";

import { Magnetic } from "@/components/motion/Magnetic";

/** TODO(firebase): slides + invite URL can later come from remote config. */
export type HeroSlide = { id: string; src: string; alt: string };

const defaultSlides: HeroSlide[] = [
  { id: "dawn", src: heroImage, alt: "Soft pink dawn light over a quiet landscape" },
  { id: "still", src: heroImage2, alt: "Blush clouds mirrored in still water at golden hour" },
  { id: "petals", src: heroImage3, alt: "Cherry blossom petals drifting through warm haze" },
];

// Deterministic so SSR and client render identically.
const particles = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 37) % 100,
  top: (i * 61) % 100,
  size: 3 + ((i * 7) % 6),
  delay: (i % 11) * 0.9,
  duration: 14 + ((i * 5) % 12),
  drift: ((i % 5) - 2) * 18,
}));

export function LandingHero({
  slides = defaultSlides,
  discordUrl = "https://discord.gg/YFX2tfSZMj",
}: {
  slides?: HeroSlide[];
  discordUrl?: string;
}) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), 8000);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const active = slides[index] ?? slides[0]!;

  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 pt-32 pb-24 sm:px-8">
      {/* Background slider with very slow zoom */}
      <div aria-hidden className="absolute inset-0">
        <AnimatePresence mode="sync">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, scale: reduce ? 1 : 1.02 }}
            animate={{ opacity: 1, scale: reduce ? 1 : 1.18 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 2.2, ease: "easeInOut" },
              scale: { duration: 26, ease: "linear" },
            }}
            className="absolute inset-0"
          >
            <img
              src={active.src}
              alt=""
              width={1920}
              height={1088}
              className="h-full w-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Soft blur overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/55 via-background/35 to-background" />
        <div className="absolute -top-32 left-1/2 h-[34rem] w-[52rem] -translate-x-1/2 rounded-full bg-petal/50 blur-[140px]" />
        <div className="absolute -bottom-40 right-[-10%] h-[30rem] w-[38rem] rounded-full bg-blush/60 blur-[130px]" />
      </div>

      {/* Floating particles */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((p, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-card/80 shadow-[var(--shadow-soft)]"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
            }}
            initial={{ opacity: 0 }}
            animate={
              reduce ? { opacity: 0.45 } : { opacity: [0, 0.7, 0], y: [0, -120], x: [0, p.drift] }
            }
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Centered content */}
      <div className="relative flex w-full max-w-3xl flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="glass-strong grid h-20 w-20 place-items-center rounded-[2rem]"
        >
          <svg viewBox="0 0 24 24" className="h-9 w-9 fill-current text-primary" aria-hidden>
            <path d="M12 21s-7.5-4.6-9.3-9A5.3 5.3 0 0 1 12 6.6 5.3 5.3 0 0 1 21.3 12c-1.8 4.4-9.3 9-9.3 9Z" />
          </svg>
          <span className="sr-only">LovePixels</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 text-5xl leading-[1.02] text-balance sm:text-7xl md:text-8xl"
        >
          <span className="text-gradient-rose">LovePixels</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-xl text-base leading-relaxed text-on-media-muted sm:text-xl"
        >
          Where strangers become memories.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          {/* TODO(firebase): invite URL from remote config */}
          <Magnetic>
            <a
              href={discordUrl}
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground shadow-[var(--shadow-soft)] transition-transform duration-300 hover:scale-[1.03]"
            >
              Join Discord
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </Magnetic>
          <Magnetic>
            <Link
              to="/community"
              className="glass inline-flex items-center rounded-full px-8 py-4 text-sm font-medium text-foreground transition-transform duration-300 hover:scale-[1.03]"
            >
              Explore Community
            </Link>
          </Magnetic>
        </motion.div>

        {/* Slide indicators */}
        <div className="mt-12 flex items-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Show slide ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === index ? "w-10 bg-primary" : "w-4 bg-primary/30 hover:bg-primary/60"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Animated scroll indicator */}
      <motion.a
        href="#discover"
        aria-label="Scroll to discover more"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.span
          animate={reduce ? {} : { y: [0, 10, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="glass flex h-14 w-9 items-start justify-center rounded-full p-2"
        >
          <motion.span
            animate={reduce ? {} : { y: [0, 16, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="h-2 w-2 rounded-full bg-primary"
          />
        </motion.span>
        <ChevronDown className="mx-auto mt-2 h-4 w-4 text-muted-foreground" />
      </motion.a>
    </section>
  );
}
