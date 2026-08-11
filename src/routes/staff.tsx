import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";
import { Section } from "@/components/site/Section";
import { SectionHeading } from "@/components/site/SectionHeading";
import { StaffCard } from "@/components/site/StaffCard";
import { staffMembers } from "@/content/placeholders";
import { subscribeToCollection, addFirestoreDoc } from "@/lib/firebase";
import type { StaffRank, StaffMember } from "@/types/content";

export const Route = createFileRoute("/staff")({
  head: () => ({
    meta: [
      { title: "Staff — LovePixels" },
      {
        name: "description",
        content:
          "Meet the LovePixels team: founders, moderators, curators and the people who keep the community soft and safe.",
      },
      { property: "og:title", content: "Staff — LovePixels" },
      {
        property: "og:description",
        content: "The people who keep LovePixels soft, safe and beautifully run.",
      },
    ],
  }),
  component: StaffPage,
});

/** Display order and copy for each staff category. */
const rankGroups: { rank: StaffRank; title: string; description: string; columns: string }[] = [
  {
    rank: "owner",
    title: "Owner",
    description: "The founding voice of LovePixels.",
    columns: "sm:mx-auto sm:max-w-sm",
  },
  {
    rank: "co-owner",
    title: "Co Owner",
    description: "Shares the final word on everything that shapes the room.",
    columns: "sm:mx-auto sm:max-w-sm",
  },
  {
    rank: "admin",
    title: "Admins",
    description: "Own the calendar, the gallery and the standard we hold.",
    columns: "sm:grid-cols-2 lg:grid-cols-2 lg:mx-auto lg:max-w-3xl",
  },
  {
    rank: "moderator",
    title: "Moderators",
    description: "On shift across every timezone, keeping the tone soft.",
    columns: "sm:grid-cols-2 lg:grid-cols-3",
  },
  {
    rank: "helper",
    title: "Helpers",
    description: "First hellos, quick answers and a hand with everything else.",
    columns: "sm:grid-cols-2 lg:grid-cols-3",
  },
];

function StaffPage() {
  const [list, setList] = useState<StaffMember[]>([]);
  const [applicantHandle, setApplicantHandle] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const unsub = subscribeToCollection<StaffMember>("staff", [], setList);
    return () => unsub();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantHandle.trim()) return;
    try {
      await addFirestoreDoc("staffApplications", {
        handle: applicantHandle.trim(),
        createdAt: new Date().toISOString(),
      });
      setSubmitted(true);
      setApplicantHandle("");
    } catch (err) {
      console.error("Error submitting application:", err);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="The team"
        title="Hosts, not moderators"
        description="A small team of people who answer quickly, listen carefully and treat the community like a room they live in too."
      />

      {rankGroups.map((group) => {
        const members = list.filter((m) => m.rank === group.rank);
        if (!members.length) return null;

        return (
          <Section key={group.rank} className="py-10 md:py-14">
            <SectionHeading
              align="left"
              eyebrow="Team tier"
              title={group.title}
              description={group.description}
            />
            <div className={`mt-10 grid gap-6 ${group.columns}`}>
              {members.map((member, i) => (
                <Reveal key={member.id} delay={i * 0.06} className="h-full">
                  <StaffCard member={member} />
                </Reveal>
              ))}
            </div>
          </Section>
        );
      })}

      <Section className="pt-0">
        <Reveal>
          <div className="glass-strong grid gap-6 rounded-4xl px-8 py-12 text-center sm:px-14">
            <h2 className="font-serif text-3xl text-balance sm:text-4xl">
              Applications Open Each Season
            </h2>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted-foreground">
              We look for patience before experience. If that sounds like you, leave your Discord
              handle and we'll reach out when the next round opens.
            </p>

            {submitted ? (
              <div className="rounded-full bg-rose-500/15 py-3 text-sm font-semibold text-rose-500">
                ✨ Application received! Thank you for offering your help.
              </div>
            ) : (
              <form
                className="mx-auto grid w-full max-w-md grid-cols-[minmax(0,1fr)_auto] gap-2"
                onSubmit={handleApply}
              >
                <label htmlFor="staff-handle" className="sr-only">
                  Discord handle
                </label>
                <input
                  id="staff-handle"
                  required
                  placeholder="@your_discord_handle"
                  value={applicantHandle}
                  onChange={(e) => setApplicantHandle(e.target.value)}
                  className="min-w-0 rounded-full border border-border bg-card/80 px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-400"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-3 text-sm font-medium text-white transition-transform duration-300 hover:scale-[1.03]"
                >
                  Apply
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </Section>
    </>
  );
}
