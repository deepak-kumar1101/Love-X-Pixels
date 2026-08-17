import { createFileRoute } from "@tanstack/react-router";
import { Flower2, Gem, Heart, Moon, Sparkles, Star } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";
import { Section } from "@/components/site/Section";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ServerPreview } from "@/components/site/ServerPreview";
import { DiscordVoiceWidget } from "@/components/site/DiscordVoiceWidget";
import { ServerShowcaseCarousel } from "@/components/site/ServerShowcaseCarousel";
import { communityPillars, communityStats } from "@/content/placeholders";
import type { CommunityPillar } from "@/types/content";

const icons = {
  sparkles: Sparkles,
  heart: Heart,
  moon: Moon,
  flower: Flower2,
  star: Star,
  gem: Gem,
} as const;

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community — LovePixels" },
      {
        name: "description",
        content:
          "Inside the LovePixels community: soft moderation, creative circles, slow nights and rituals that make a server feel like home.",
      },
      { property: "og:title", content: "Community — LovePixels" },
      {
        property: "og:description",
        content: "Soft moderation, creative circles and rituals that make a server feel like home.",
      },
    ],
  }),
  component: CommunityPage,
});

function PillarCard({ pillar, index }: { pillar: CommunityPillar; index: number }) {
  const Icon = icons[pillar.icon];
  return (
    <Reveal delay={index * 0.06}>
      <article className="glass lift h-full rounded-4xl p-8">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent text-accent-foreground">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="mt-6 text-xl">{pillar.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{pillar.description}</p>
      </article>
    </Reveal>
  );
}

function CommunityPage() {
  return (
    <>
      <PageHeader
        eyebrow="The community"
        title="A room that knows your name"
        description="LovePixels is small on purpose. Everything from the channel list to the welcome note is designed to make arriving feel effortless."
      />

      <Section className="pt-0">
        <Reveal>
          <div className="glass-strong grid gap-8 rounded-4xl px-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
            {communityStats.map((stat) => (
              <div key={stat.id} className="min-w-0 text-center sm:text-left">
                <p className="font-display text-4xl text-gradient-rose">{stat.value}</p>
                <p className="mt-1 text-sm">{stat.label}</p>
                {stat.caption ? (
                  <p className="text-xs text-muted-foreground">{stat.caption}</p>
                ) : null}
              </div>
            ))}
          </div>
        </Reveal>
      </Section>

      <Section className="pt-0">
        <SectionHeading
          eyebrow="Our pillars"
          title="Six promises we keep"
          description="These are the standards our staff hold every single day — the reason the atmosphere stays soft even as the room grows."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {communityPillars.map((pillar, i) => (
            <PillarCard key={pillar.id} pillar={pillar} index={i} />
          ))}
        </div>
      </Section>

      <Section id="server-showcase" className="pt-0">
        <SectionHeading
          eyebrow="Server Showcase"
          title="LovePixels Image Showcase"
          description="A visual journey through our active voice lounges, creative circles, seasonal celebrations, and cozy community moments."
        />
        <Reveal className="mt-14">
          <ServerShowcaseCarousel />
        </Reveal>
      </Section>

      <Section id="server-preview" className="pt-0">
        <SectionHeading
          eyebrow="Server preview"
          title="Walk the channels before you join"
          description="Pick a channel on the left and watch the room change on the right — a live-feeling look at how LovePixels actually reads day to day."
        />
        <Reveal className="mt-14">
          <ServerPreview />
        </Reveal>
      </Section>

      <Section className="pt-0">
        <SectionHeading
          eyebrow="A day here"
          title="Gentle rhythm, all day long"
          description="Nothing demanding. Just familiar moments you can drop into whenever you like."
        />
        <ol className="relative mt-14 grid gap-5 md:grid-cols-4">
          {[
            {
              time: "08:00",
              title: "Morning check-in",
              text: "A thread for intentions and coffee.",
            },
            { time: "14:00", title: "Focus rooms", text: "Silent co-working with soft timers." },
            { time: "21:00", title: "Salons", text: "Critique, listening rooms and film clubs." },
            { time: "01:00", title: "Late lounge", text: "Low-light conversation until sleep." },
          ].map((item, i) => (
            <li key={item.time}>
              <Reveal delay={i * 0.08}>
                <div className="glass h-full rounded-4xl p-7">
                  <p className="eyebrow">{item.time}</p>
                  <h3 className="mt-4 text-lg">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </Section>

      {/* LIVE VOICE SALONS & ACTIVE VC ROOMS SECTION */}
      <Section id="voice-widget" className="pt-0">
        <SectionHeading
          eyebrow="Live Voice Salons"
          title="Active Voice Channels & VC Rooms"
          description="See live speakers, active voice lounges, and member presence on LovePixels. Connect directly to join."
        />
        <Reveal className="mt-14">
          <DiscordVoiceWidget />
        </Reveal>
      </Section>
    </>
  );
}
