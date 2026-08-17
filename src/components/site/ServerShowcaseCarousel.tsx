import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Download,
  Play,
  Pause,
  Sparkles,
  Users,
  Radio,
  Image as ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LightboxModal, downloadImage } from "@/components/site/LightboxModal";

// Asset imports for server showcase images
import hero from "@/assets/hero.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import event1 from "@/assets/event-1.jpg";
import event2 from "@/assets/event-2.jpg";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery3 from "@/assets/gallery-3.jpg";

export interface ServerShowcaseSlide {
  id: string;
  title: string;
  category: string;
  description: string;
  src: string;
  alt: string;
  tag?: string;
  stats?: string;
}

export const defaultShowcaseSlides: ServerShowcaseSlide[] = [
  {
    id: "slide-1",
    title: "Atmospheric Voice Lounges",
    category: "Voice Salons",
    tag: "Live 24/7",
    stats: "700 Daily Online",
    description:
      "Step into high-fidelity, low-light voice salons curated for late night talks, music sharing, and cozy background ambience.",
    src: hero,
    alt: "LovePixels Voice Lounge Preview",
  },
  {
    id: "slide-2",
    title: "Community Events & Movie Nights",
    category: "Events & Festivals",
    tag: "Weekly Host",
    stats: "100+ Events",
    description:
      "From competitive gaming tournaments to weekend film screenings and listening rooms — there is always a seat reserved for you.",
    src: event1,
    alt: "Community Event Showcase",
  },
  {
    id: "slide-3",
    title: "Member Art & Creative Circles",
    category: "Creative Showcase",
    tag: "Curated Monthly",
    stats: "800+ Works Shared",
    description:
      "A dedicated sanctuary for digital artists, photographers, writers, and designers to share their work with gentle feedback.",
    src: gallery1,
    alt: "Creative Circle Exhibition",
  },
  {
    id: "slide-4",
    title: "Seasonal Festivals & Celebrations",
    category: "Server Rituals",
    tag: "Exclusive Perks",
    stats: "1.5x XP Boost Active",
    description:
      "Celebrate seasonal transitions with custom server roles, special badges, leaderboard prizes, and creator rewards.",
    src: event2,
    alt: "Seasonal Gathering Showcase",
  },
  {
    id: "slide-5",
    title: "Cozy Study & Deep Work Rooms",
    category: "Productivity",
    tag: "Pomodoro Timers",
    stats: "Focus & Chill",
    description:
      "Silent co-working lounges with soft ambient timers designed for study sessions, coding sessions, and focused writing.",
    src: hero2,
    alt: "Study Room Preview",
  },
  {
    id: "slide-6",
    title: "Late Lounge & Listening Salons",
    category: "Music & Vibes",
    tag: "High Quality Audio",
    stats: "2 AM Salons",
    description:
      "Experience handpicked playlists and community listening sessions with studio-grade audio bitrate and custom music bots.",
    src: hero3,
    alt: "Listening Salon Preview",
  },
  {
    id: "slide-7",
    title: "Memorable Server Highlights",
    category: "Community Memories",
    tag: "Digital Archive",
    stats: "3.5k+ Members",
    description:
      "Explore highlights, inside jokes, and unforgettable moments captured by our members since our founding.",
    src: gallery3,
    alt: "Server Highlights Archive",
  },
];

interface ServerShowcaseCarouselProps {
  slides?: ServerShowcaseSlide[];
}

export const ServerShowcaseCarousel: React.FC<ServerShowcaseCarouselProps> = ({
  slides = defaultShowcaseSlides,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [direction, setDirection] = useState(1);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxCaption, setLightboxCaption] = useState<string | undefined>();
  const [lightboxTitle, setLightboxTitle] = useState<string | undefined>();

  const activeSlide = slides[currentIndex] || slides[0];

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const handleSelect = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Autoplay functionality
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [isPlaying, handleNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.96,
    }),
  };

  return (
    <>
      <LightboxModal
        src={lightboxSrc}
        title={lightboxTitle}
        caption={lightboxCaption}
        onClose={() => setLightboxSrc(null)}
      />

      <div className="relative overflow-hidden rounded-4xl border border-rose-500/20 bg-card/60 p-4 shadow-2xl backdrop-blur-2xl sm:p-6 lg:p-8">
        {/* Top Control Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-4">
          <div className="flex items-center space-x-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-rose-500/15 text-rose-500">
              <ImageIcon className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold text-foreground">
                  Server Showcase Carousel
                </span>
                <span className="rounded-full bg-rose-500/15 px-2.5 py-0.5 text-xs font-bold text-rose-500">
                  {currentIndex + 1} / {slides.length}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                High-resolution snapshot gallery of LovePixels channels and community life
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? "Pause Autoplay" : "Start Autoplay"}
              className="flex items-center gap-1.5 rounded-full border border-border/60 bg-accent/60 px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:bg-rose-500 hover:text-white cursor-pointer"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Autoplay</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrev}
              title="Previous Slide"
              className="grid h-9 w-9 place-items-center rounded-full border border-border/60 bg-accent/60 text-foreground transition-all hover:bg-rose-500 hover:text-white cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              title="Next Slide"
              className="grid h-9 w-9 place-items-center rounded-full border border-border/60 bg-accent/60 text-foreground transition-all hover:bg-rose-500 hover:text-white cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Main Slide Card Container */}
        <div className="relative min-h-[360px] w-full overflow-hidden rounded-3xl border border-border/60 sm:min-h-[440px] md:min-h-[500px]">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={activeSlide.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 h-full w-full"
            >
              <img
                src={activeSlide.src}
                alt={activeSlide.alt}
                className="h-full w-full object-cover"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              {/* Action Buttons: Expand & Download */}
              <div className="absolute right-4 top-4 z-20 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() =>
                    downloadImage(
                      activeSlide.src,
                      `${activeSlide.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.jpg`
                    )
                  }
                  title="Download Image"
                  className="flex items-center space-x-1.5 rounded-full bg-black/60 px-3.5 py-2 text-xs font-semibold text-white/90 backdrop-blur-md transition-all hover:bg-rose-500 hover:text-white cursor-pointer shadow-lg"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLightboxSrc(activeSlide.src);
                    setLightboxTitle(activeSlide.title);
                    setLightboxCaption(activeSlide.description);
                  }}
                  title="Fullscreen View"
                  className="flex items-center space-x-1.5 rounded-full bg-black/60 px-3.5 py-2 text-xs font-semibold text-white/90 backdrop-blur-md transition-all hover:bg-rose-500 hover:text-white cursor-pointer shadow-lg"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Expand</span>
                </button>
              </div>

              {/* Content Overlay */}
              <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 md:p-10 text-white z-10">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center space-x-1 rounded-full bg-rose-500/80 px-3 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-md">
                    <Sparkles className="h-3 w-3" />
                    <span>{activeSlide.category}</span>
                  </span>
                  {activeSlide.tag && (
                    <span className="inline-flex items-center space-x-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-md">
                      <Radio className="h-3 w-3" />
                      <span>{activeSlide.tag}</span>
                    </span>
                  )}
                  {activeSlide.stats && (
                    <span className="inline-flex items-center space-x-1 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur-md">
                      <Users className="h-3 w-3" />
                      <span>{activeSlide.stats}</span>
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-2xl font-bold sm:text-3xl md:text-4xl text-white drop-shadow-md">
                  {activeSlide.title}
                </h3>
                <p className="mt-2 max-w-2xl text-xs sm:text-sm text-white/80 leading-relaxed drop-shadow-sm">
                  {activeSlide.description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Thumbnail Navigation Strip */}
        <div className="mt-4 flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-none">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => handleSelect(idx)}
              className={`group relative h-16 w-24 shrink-0 overflow-hidden rounded-2xl border-2 transition-all cursor-pointer ${
                currentIndex === idx
                  ? "border-rose-500 scale-105 shadow-md shadow-rose-500/20"
                  : "border-transparent opacity-60 hover:opacity-100 hover:border-rose-500/40"
              }`}
            >
              <img src={slide.src} alt={slide.title} className="h-full w-full object-cover" />
              <div
                className={`absolute inset-0 transition-opacity ${
                  currentIndex === idx ? "bg-black/10" : "bg-black/40 group-hover:bg-black/20"
                }`}
              />
              <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[9px] font-bold text-white">
                0{idx + 1}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
