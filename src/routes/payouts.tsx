import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Trophy,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  MessageSquarePlus,
  Gift,
  Star,
  Award,
  Zap,
  Eye,
} from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";
import { Section } from "@/components/site/Section";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SubmitReviewModal } from "@/components/site/SubmitReviewModal";
import { LightboxModal } from "@/components/site/LightboxModal";
import { ClaimRewardModal } from "@/components/site/ClaimRewardModal";
import { payoutReviews, payoutWinners } from "@/content/placeholders";
import { subscribeToCollection } from "@/lib/firebase";
import type { PayoutWinner, PayoutReview } from "@/types/content";
import type { WinnerAnnouncement } from "@/models/event-system.model";

export const Route = createFileRoute("/payouts")({
  head: () => ({
    meta: [
      { title: "Rewards Delivered — LovePixels" },
      {
        name: "description",
        content:
          "Celebrating LovePixels event winners with 100% verified payout proof, real recipient reviews, and transparent reward delivery.",
      },
      { property: "og:title", content: "Rewards Delivered — LovePixels" },
      {
        property: "og:description",
        content: "Transparent payout proof and celebration of LovePixels community event winners.",
      },
    ],
  }),
  component: PayoutsPage,
});

export function PayoutsPage() {
  const [winners, setWinners] = useState<PayoutWinner[]>([]);
  const [reviews, setReviews] = useState<PayoutReview[]>([]);
  const [announcements, setAnnouncements] = useState<WinnerAnnouncement[]>([]);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<WinnerAnnouncement | null>(null);
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  useEffect(() => {
    const unsubWinners = subscribeToCollection<PayoutWinner>("payouts", [], setWinners);
    const unsubReviews = subscribeToCollection<PayoutReview>("reviews", [], (all) => {
      const approved = all.filter((r) => r.approved !== false);
      setReviews(approved);
    });
    const unsubAnnouncements = subscribeToCollection<WinnerAnnouncement>(
      "winnerAnnouncements",
      [],
      (all) => {
        const active = all.filter((a) => a.status === "active");
        setAnnouncements(active);
      },
    );

    return () => {
      unsubWinners();
      unsubReviews();
      unsubAnnouncements();
    };
  }, []);

  const latestAnnouncement = announcements.length > 0 ? announcements[0] : null;
  const latestWinner = winners.length > 0 ? winners[0] : null;

  return (
    <>
      <SubmitReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} />
      <ClaimRewardModal
        announcement={selectedClaim}
        isOpen={isClaimOpen}
        onClose={() => setIsClaimOpen(false)}
      />
      <LightboxModal
        src={lightboxSrc}
        title="Verified Payout Transaction Proof"
        onClose={() => setLightboxSrc(null)}
      />

      {/* 1. HERO SECTION */}
      <PageHeader
        eyebrow="Rewards Delivered"
        title="Every winner. Verified & celebrated."
        description="LovePixels believes true community recognition means prompt, transparent reward payouts. Explore verified transaction proofs, recent event champions, and recipient reviews."
      />

      {/* 2. TRUST STATISTICS GRID */}
      <Section className="pt-0">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Total Rewards Paid",
              value: "₹25,000+",
              icon: Trophy,
              color: "text-amber-500",
            },
            { label: "Verified Winners", value: "48+", icon: Award, color: "text-rose-500" },
            {
              label: "Successful Payouts",
              value: "100%",
              icon: ShieldCheck,
              color: "text-emerald-500",
            },
            { label: "Events Rewarded", value: "34+", icon: Zap, color: "text-purple-500" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Reveal key={stat.label} delay={i * 0.06}>
                <div className="glass flex items-center space-x-4 rounded-3xl p-6 transition-all hover:scale-102">
                  <div
                    className={`grid h-12 w-12 place-items-center rounded-2xl bg-card shadow-xs ${stat.color}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-serif text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* 3. LATEST FEATURED WINNER HERO CARD */}
      {(latestAnnouncement || latestWinner) && (
        <Section className="pt-0">
          <SectionHeading align="left" eyebrow="Spotlight" title="Latest Event Champion" />
          <Reveal delay={0.1}>
            <div className="relative mt-6 overflow-hidden rounded-4xl border border-amber-300/50 bg-gradient-to-br from-amber-500/15 via-rose-500/15 to-purple-500/15 p-8 shadow-xl backdrop-blur-xl dark:border-amber-500/40 md:p-10">
              <div className="absolute top-4 right-4 flex items-center space-x-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-300 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Recently Announced</span>
              </div>

              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center space-x-5">
                  <div className="relative">
                    <div className="grid h-20 w-20 place-items-center rounded-full border-2 border-amber-400 bg-gradient-to-br from-amber-400 to-rose-500 font-serif text-3xl font-bold text-white shadow-lg">
                      🏆
                    </div>
                    <div className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-amber-400 text-black shadow-xs">
                      <Trophy className="h-4 w-4 fill-current" />
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">
                      {latestAnnouncement ? latestAnnouncement.eventName : latestWinner?.reason}
                    </span>
                    <h3 className="font-serif text-3xl font-bold text-foreground">
                      {latestAnnouncement ? latestAnnouncement.winnerName : latestWinner?.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {latestAnnouncement
                        ? latestAnnouncement.winnerDiscordId
                        : latestWinner?.handle}
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-border/60 bg-card/80 p-6 backdrop-blur-md md:min-w-64">
                  <p className="text-xs text-muted-foreground">Prize Reward</p>
                  <p className="font-serif text-3xl font-bold text-gradient-rose">
                    {latestAnnouncement ? latestAnnouncement.prizeWon : latestWinner?.amount}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Awarded:{" "}
                    {latestAnnouncement
                      ? new Date(latestAnnouncement.createdAt).toLocaleDateString()
                      : latestWinner?.paidAt}
                  </p>

                  {latestAnnouncement && (
                    <button
                      onClick={() => {
                        setSelectedClaim(latestAnnouncement);
                        setIsClaimOpen(true);
                      }}
                      className="mt-4 flex w-full items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:scale-102 active:scale-98"
                    >
                      <Gift className="h-4 w-4" />
                      <span>Claim Reward Ticket</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </Section>
      )}

      {/* 4. ADMIN CONGRATULATIONS BANNER */}
      <Section className="pt-0">
        <Reveal delay={0.15}>
          <div className="relative overflow-hidden rounded-3xl border border-rose-200/60 bg-card/90 p-8 shadow-lg backdrop-blur-xl dark:border-rose-900/40">
            <div className="flex items-start space-x-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rose-500/15 text-rose-500">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-serif text-xl font-bold text-foreground">
                  Admin Message to All Winners
                </h4>
                <p className="mt-2 font-serif text-base italic leading-relaxed text-muted-foreground">
                  "Congratulations! Thank you for bringing your energy, creativity, and presence to
                  LovePixels. Every reward paid is a token of our appreciation for making this
                  community vibrant. We hope to see you again in future events!"
                </p>
                <p className="mt-3 text-xs font-bold text-foreground">
                  — LovePixels Staff & Admin Team
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* 5. PREVIOUS WINNERS & PAYOUT PROOF GRID */}
      <Section className="pt-0">
        <SectionHeading
          align="left"
          eyebrow="Hall of Fame"
          title="Verified Winners & Payout Proofs"
          description="Every payout is backed by transparent transaction receipts and verified badges."
        />

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {winners.map((winner, i) => (
            <Reveal key={winner.id} delay={i * 0.06}>
              <div className="glass group relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 transition-all hover:-translate-y-1">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="grid h-12 w-12 place-items-center rounded-full bg-accent font-serif text-lg font-bold text-accent-foreground">
                        {winner.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">{winner.name}</h4>
                        <p className="text-xs text-muted-foreground">{winner.handle}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Verified</span>
                    </span>
                  </div>

                  <div className="mt-4 rounded-2xl border border-border/50 bg-card/60 p-4">
                    <p className="text-xs text-muted-foreground">Event / Reason:</p>
                    <p className="font-semibold text-foreground text-sm">{winner.reason}</p>
                    <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2">
                      <span className="text-xs text-muted-foreground">Prize Amount:</span>
                      <span className="font-serif text-lg font-bold text-rose-500">
                        {winner.amount}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Paid: {winner.paidAt}</span>
                  {winner.proofImageUrl && (
                    <button
                      onClick={() => setLightboxSrc(winner.proofImageUrl || null)}
                      className="inline-flex items-center space-x-1 rounded-xl bg-accent/80 px-3 py-1.5 font-semibold text-foreground hover:bg-rose-500 hover:text-white transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View Proof</span>
                    </button>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 6. VERIFIED WINNER REVIEWS */}
      <Section className="pt-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeading
            align="left"
            eyebrow="Recipient Feedback"
            title="Verified Winner Reviews"
            description="Real feedback from community members who received their rewards."
          />
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="inline-flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-2.5 text-xs font-semibold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            <MessageSquarePlus className="h-4 w-4" />
            <span>Write Member Review</span>
          </button>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {reviews.map((review, i) => (
            <Reveal key={review.id} delay={i * 0.08}>
              <div className="glass flex h-full flex-col justify-between rounded-3xl p-6">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-rose-500/15 font-bold text-rose-500">
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-sm">{review.name}</h4>
                        <p className="text-[11px] text-muted-foreground">{review.handle}</p>
                      </div>
                    </div>
                    <div className="flex text-amber-400">
                      {[...Array(review.rating || 5)].map((_, idx) => (
                        <Star key={idx} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                  </div>

                  <p className="mt-4 text-xs italic leading-relaxed text-muted-foreground">
                    "{review.quote}"
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-[11px]">
                  <span className="inline-flex items-center space-x-1 font-bold text-emerald-500">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Verified Recipient</span>
                  </span>
                  <span className="text-muted-foreground">Verified</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
