import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { useEffect, useState } from "react";
import { LandingHero } from "@/components/site/LandingHero";
import { WinnersMarquee } from "@/components/site/WinnersMarquee";
import { FloatingCard } from "@/components/motion/FloatingCard";
import { Magnetic } from "@/components/motion/Magnetic";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/site/Reveal";
import { Section } from "@/components/site/Section";
import { SectionHeading } from "@/components/site/SectionHeading";
import {
  communityPillars,
  communityStats,
  galleryItems,
  payoutWinners,
} from "@/content/placeholders";
import { subscribeToCollection } from "@/lib/firebase";
import type { PayoutWinner } from "@/types/content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LovePixels — A soft, luxurious Discord community" },
      {
        name: "description",
        content:
          "A gently moderated Discord community for creatives: quiet nights, curated events, seasonal galleries and monthly creator payouts.",
      },
      { property: "og:title", content: "LovePixels — A soft, luxurious Discord community" },
      {
        property: "og:description",
        content: "Quiet nights, creative circles and rewarded presence.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [winners, setWinners] = useState<PayoutWinner[]>([]);

  useEffect(() => {
    const unsub = subscribeToCollection<PayoutWinner>("payouts", [], setWinners);
    return () => unsub();
  }, []);

  return (
    <>
      <LandingHero />
      <WinnersMarquee winners={winners} />

      <div id="discover" />

      <Section>
        <Reveal>
          <FloatingCard className="glass-strong rounded-4xl p-8 sm:p-10" amplitude={6}>
            <p className="eyebrow">Right now</p>
            <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
              {communityStats.map((stat) => (
                <div key={stat.id} className="min-w-0">
                  <p className="font-display text-3xl text-gradient-rose sm:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 truncate text-sm text-foreground">{stat.label}</p>
                  {stat.caption ? (
                    <p className="text-xs text-muted-foreground">{stat.caption}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </FloatingCard>
        </Reveal>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Why people stay"
          title="Built like a lounge, not a lobby"
          description="Every room is designed, moderated and cared for. No noise, no clout, no chaos — just a beautiful place to spend an evening."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {communityPillars.slice(0, 3).map((pillar, i) => (
            <Reveal key={pillar.id} delay={i * 0.08}>
              <article className="glass lift h-full rounded-4xl p-8">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent text-accent-foreground">
                  <span className="font-display text-lg">{String(i + 1).padStart(2, "0")}</span>
                </span>
                <h3 className="mt-6 text-xl">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {pillar.description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <SectionHeading
            align="left"
            eyebrow="Seasonal gallery"
            title="Members make it beautiful"
            description="Each season closes with a curated exhibition of member work — photography, illustration, writing and film stills."
          />
          <Reveal delay={0.1}>
            <div className="grid grid-cols-2 gap-4">
              {galleryItems.slice(0, 4).map((item, i) => (
                <Parallax key={item.id} distance={i % 2 === 0 ? 44 : 20}>
                  <div className="overflow-hidden rounded-3xl border border-border/70">
                    <img
                      src={item.src}
                      alt={item.alt}
                      loading="lazy"
                      className="h-44 w-full object-cover transition-transform duration-700 hover:scale-105 sm:h-56"
                    />
                  </div>
                </Parallax>
              ))}
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.15}>
          <div className="mt-10">
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-transform duration-300 hover:translate-x-1"
            >
              View the full gallery <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </Section>

      <Section>
        <Reveal>
          <div className="glass-strong relative overflow-hidden rounded-4xl px-8 py-16 text-center sm:px-16">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-petal/60 blur-[100px]"
            />
            <div className="relative">
              <h2 className="text-3xl text-balance sm:text-4xl md:text-5xl">
                The door is open, quietly
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Invitations are reviewed by hand so the room stays the way it feels today.
              </p>
              <Magnetic className="mt-9">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground shadow-[var(--shadow-soft)] transition-transform duration-300 hover:scale-[1.03]"
                >
                  Request an invite <ArrowRight className="h-4 w-4" />
                </a>
              </Magnetic>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
