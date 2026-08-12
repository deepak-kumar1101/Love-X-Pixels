import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";
import { Section } from "@/components/site/Section";
import { SectionHeading } from "@/components/site/SectionHeading";
import { subscribeToCollection, addFirestoreDoc } from "@/lib/firebase";
import { partners as placeholderPartners } from "@/content/placeholders";
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
  const [list, setList] = useState<Partner[]>([]);

  // Partner request form state
  const [partnerName, setPartnerName] = useState("");
  const [partnerContact, setPartnerContact] = useState("");
  const [partnerNote, setPartnerNote] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const unsub = subscribeToCollection<Partner>("partners", placeholderPartners, setList);
    return () => unsub();
  }, []);

  const handlePartnerRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = partnerName.trim();
    const contact = partnerContact.trim();
    const note = partnerNote.trim();
    if (!name || !contact) return;

    setIsSending(true);
    try {
      await addFirestoreDoc("partnerRequests", {
        communityName: name,
        contactHandle: contact,
        note,
        createdAt: new Date().toISOString(),
        status: "pending",
      });
      setSent(true);
      setPartnerName("");
      setPartnerContact("");
      setPartnerNote("");
      toast.success("Request sent! We'll be in touch soon.");
    } catch {
      toast.error("Failed to send request. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

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
          {sent ? (
            <div className="glass-strong mx-auto mt-10 flex max-w-2xl flex-col items-center gap-4 rounded-4xl p-10 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-500">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-foreground">Request Received!</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Thanks for reaching out. We review partnership requests weekly and will contact you
                via your Discord handle.
              </p>
              <button
                onClick={() => setSent(false)}
                className="rounded-full border border-border px-6 py-2 text-sm text-muted-foreground hover:bg-accent"
              >
                Send another request
              </button>
            </div>
          ) : (
            <form
              className="glass-strong mx-auto mt-10 grid max-w-2xl gap-4 rounded-4xl p-8 sm:grid-cols-2"
              onSubmit={handlePartnerRequest}
            >
              <div className="grid gap-2">
                <label htmlFor="partner-name" className="text-xs text-muted-foreground">
                  Community name
                </label>
                <input
                  id="partner-name"
                  required
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="e.g. Velvet Lounge"
                  className="rounded-2xl border border-border bg-card/80 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="partner-contact" className="text-xs text-muted-foreground">
                  Contact handle
                </label>
                <input
                  id="partner-contact"
                  required
                  value={partnerContact}
                  onChange={(e) => setPartnerContact(e.target.value)}
                  placeholder="@your_discord_handle"
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
                  value={partnerNote}
                  onChange={(e) => setPartnerNote(e.target.value)}
                  placeholder="Tell us about your community and ideas for a collaboration..."
                  className="resize-none rounded-2xl border border-border bg-card/80 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <button
                type="submit"
                disabled={isSending}
                className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform duration-300 hover:scale-[1.02] disabled:opacity-60 sm:col-span-2"
              >
                {isSending ? "Sending…" : "Send request"}
              </button>
            </form>
          )}
        </Reveal>
      </Section>
    </>
  );
}
