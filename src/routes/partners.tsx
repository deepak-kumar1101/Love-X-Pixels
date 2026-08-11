import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";
import { Section } from "@/components/site/Section";
import { SectionHeading } from "@/components/site/SectionHeading";
import { partners } from "@/content/placeholders";
import { subscribeToCollection } from "@/lib/firebase";
import type { Partner } from "@/types/content";

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: "Partners — LovePixels" },
      {
        name: "description",
        content:
          "Communities we share evenings with: design collectives, study rooms, music circles and photography clubs partnered with LovePixels.",
      },
      { property: "og:title", content: "Partners — LovePixels" },
      {
        property: "og:description",
        content: "Communities we share evenings with, chosen for temperature and taste.",
      },
    ],
  }),
  component: PartnersPage,
});

function PartnersPage() {
  const [list, setList] = useState<Partner[]>(partners);

  useEffect(() => {
    const unsub = subscribeToCollection<Partner>("partners", partners, setList);
    return () => unsub();
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="Partners"
        title="Company we keep"
        description="We partner slowly. Each community here shares our standards for moderation, warmth and craft."
      />

      <Section className="pt-0">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((partner, i) => (
            <Reveal key={partner.id} delay={i * 0.06}>
              <a
                href={partner.href ?? partner.discordUrl ?? "#"}
                target="_blank"
                rel="noreferrer"
                className="glass lift group flex h-full flex-col rounded-4xl p-8"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                  <div className="min-w-0">
                    <p className="eyebrow">{partner.category}</p>
                    <h3 className="mt-2 truncate font-serif text-xl font-bold">{partner.name}</h3>
                  </div>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary" />
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {partner.description}
                </p>
                {partner.memberCount ? (
                  <p className="mt-6 text-xs font-semibold text-rose-500">
                    {partner.memberCount} members
                  </p>
                ) : null}
              </a>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <SectionHeading
          eyebrow="Collaborate"
          title="Partner with LovePixels"
          description="We host two cross-community evenings a month. Tell us about your room and we'll find a date."
        />
        <Reveal delay={0.1}>
          {/* TODO(firebase): submit to a "partnerRequests" collection */}
          <form
            className="glass-strong mx-auto mt-10 grid max-w-2xl gap-4 rounded-4xl p-8 sm:grid-cols-2"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="grid gap-2">
              <label htmlFor="partner-name" className="text-xs text-muted-foreground">
                Community name
              </label>
              <input
                id="partner-name"
                className="rounded-2xl border border-border bg-card/80 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="partner-contact" className="text-xs text-muted-foreground">
                Contact handle
              </label>
              <input
                id="partner-contact"
                className="rounded-2xl border border-border bg-card/80 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <label htmlFor="partner-note" className="text-xs text-muted-foreground">
                What would you like to host?
              </label>
              <textarea
                id="partner-note"
                rows={4}
                className="resize-none rounded-2xl border border-border bg-card/80 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform duration-300 hover:scale-[1.02] sm:col-span-2"
            >
              Send request
            </button>
          </form>
        </Reveal>
      </Section>
    </>
  );
}
