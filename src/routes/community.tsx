import { createFileRoute } from "@tanstack/react-router";
import { Flower2, Gem, Heart, Moon, Sparkles, Star } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";
import { Section } from "@/components/site/Section";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ServerPreview } from "@/components/site/ServerPreview";
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

      {/* GAMIFICATION, LEADERBOARDS & GIVEAWAYS SECTION */}
      <Section className="pt-0">
        <SectionHeading
          eyebrow="Community Progression"
          title="XP Leaderboard & Giveaways"
          description="Earn XP through active voice presence, reviews, and event participation to level up and win exclusive perks."
        />

        {/* Season Banner */}
        <Reveal delay={0.05} className="mt-10">
          <div className="rounded-3xl border border-rose-200/50 bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-purple-500/10 p-6 backdrop-blur-md dark:border-rose-900/40">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="inline-flex items-center space-x-1.5 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-500">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Season 1 Active (1.5x XP Boost)</span>
                </span>
                <h3 className="mt-2 font-serif text-xl font-bold text-foreground">
                  Season 1: Bloom & Echoes
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Participate in voice salons and community events to earn 1.5x bonus XP until the
                  end of the month!
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Leaderboards Grid */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* Top XP Leaderboard */}
          <Reveal delay={0.1}>
            <div className="glass rounded-4xl p-6">
              <h3 className="font-serif text-lg font-bold text-foreground">🏆 Top XP Leaders</h3>
              <div className="mt-4 space-y-3">
                {[
                  { rank: 1, name: "Aurelia", level: 24, xp: "5,840 XP", badge: "Owner" },
                  { rank: 2, name: "Rahul", level: 19, xp: "4,210 XP", badge: "VIP" },
                  { rank: 3, name: "Aryan", level: 16, xp: "3,650 XP", badge: "Booster" },
                  { rank: 4, name: "Kaelen", level: 14, xp: "2,980 XP", badge: "Admin" },
                  { rank: 5, name: "Seraphina", level: 12, xp: "2,410 XP", badge: "Verified" },
                ].map((user) => (
                  <div
                    key={user.rank}
                    className="flex items-center justify-between border-b border-border/40 pb-2.5 text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/15 font-bold text-rose-500">
                        #{user.rank}
                      </span>
                      <div>
                        <span className="font-bold text-foreground">{user.name}</span>
                        <span className="ml-2 rounded bg-accent px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {user.badge}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-rose-500">Lvl {user.level}</p>
                      <p className="text-[10px] text-muted-foreground">{user.xp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Active Giveaways */}
          <Reveal delay={0.15}>
            <div className="glass rounded-4xl p-6">
              <h3 className="font-serif text-lg font-bold text-foreground">
                🎁 Active Community Giveaways
              </h3>
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-rose-200/50 bg-card p-4 dark:border-rose-900/40">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-foreground">Discord Nitro 1-Month</h4>
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-500 uppercase">
                      Active
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Join voice salon and participate in events to enter. 2 Winners will be chosen
                    automatically!
                  </p>
                  <button
                    onClick={() =>
                      toast.success("🎉 You have entered the Discord Nitro Giveaway! Good luck!")
                    }
                    className="mt-3 w-full rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 py-2 text-xs font-semibold text-white shadow-xs hover:opacity-90"
                  >
                    Enter Giveaway
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
