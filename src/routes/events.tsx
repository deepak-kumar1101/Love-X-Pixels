import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { EventCard } from "@/components/site/EventCard";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";
import { Section } from "@/components/site/Section";
import { SectionHeading } from "@/components/site/SectionHeading";
import { WinnerAnnouncementCard } from "@/components/site/WinnerAnnouncementCard";
import { EventDetailsModal } from "@/components/site/EventDetailsModal";
import { ClaimRewardModal } from "@/components/site/ClaimRewardModal";

import { subscribeToCollection } from "@/lib/firebase";
import { communityEvents } from "@/content/placeholders";
import { useAuth } from "@/hooks/useAuth";
import { EventLifecycleService } from "@/services/event-lifecycle.service";
import type { ExtendedCommunityEvent, WinnerAnnouncement } from "@/models/event-system.model";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — LovePixels" },
      {
        name: "description",
        content:
          "Listening rooms, photo salons, film clubs and seasonal openings — the curated LovePixels event calendar.",
      },
      { property: "og:title", content: "Events — LovePixels" },
      {
        property: "og:description",
        content: "Listening rooms, salons, film clubs and seasonal gallery openings.",
      },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const { user } = useAuth();
  const [eventsList, setEventsList] = useState<ExtendedCommunityEvent[]>([]);
  const [announcements, setAnnouncements] = useState<WinnerAnnouncement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "live" | "upcoming" | "past">("all");

  const [selectedEvent, setSelectedEvent] = useState<ExtendedCommunityEvent | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<WinnerAnnouncement | null>(null);
  const [isClaimOpen, setIsClaimOpen] = useState(false);

  useEffect(() => {
    const unsubEvents = subscribeToCollection<ExtendedCommunityEvent>(
      "events",
      communityEvents as ExtendedCommunityEvent[],
      (list) => {
        setEventsList(list);
        setIsLoading(false);
      },
    );
    const unsubAnnounce = subscribeToCollection<WinnerAnnouncement>(
      "winnerAnnouncements",
      [],
      (list) => {
        const now = new Date().toISOString();
        const active = list.filter((a) => a.status === "active" && a.expiresAt > now);
        setAnnouncements(active);
      },
    );

    return () => {
      unsubEvents();
      unsubAnnounce();
    };
  }, []);

  const handleParticipate = async (event: ExtendedCommunityEvent) => {
    if (!user) {
      toast.error("Discord login required! Please click Sign In with Discord first.");
      return;
    }
    const result = await EventLifecycleService.registerParticipant(event, user);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.info(result.message);
    }
  };

  const handleNotify = async (event: ExtendedCommunityEvent) => {
    if (!user) {
      toast.error("Please sign in with Discord to subscribe to event notifications.");
      return;
    }
    await EventLifecycleService.subscribeEventNotification(event.id, {
      uid: user.id,
      email: user.email,
    });
    toast.success("🔔 Subscribed! You will be notified when this event goes live.");
  };

  // Classify events based on duration and server end times
  const now = Date.now();
  const classifiedEvents = eventsList.map((e) => {
    const startTime = e.startsAt ? new Date(e.startsAt).getTime() : now;
    const durationMs = (e.durationHours || 24) * 3600 * 1000;
    const endTime = e.endsAt ? new Date(e.endsAt).getTime() : startTime + durationMs;

    let status: ExtendedCommunityEvent["status"] = e.status;
    if (e.winnerName || e.winnerSelected || now >= endTime) {
      status = "past";
    } else if (now >= startTime && now < endTime) {
      status = "live";
    } else if (now < startTime) {
      status = "upcoming";
    }
    return { ...e, status };
  });

  const filteredEvents = classifiedEvents.filter((e) => {
    if (activeTab === "all") return true;
    return e.status === activeTab;
  });

  const current = classifiedEvents.find((e) => e.status === "live");
  const upcoming = classifiedEvents.filter((e) => e.status === "upcoming");
  const past = classifiedEvents.filter((e) => e.status === "past" || e.status === "completed");

  return (
    <>
      <EventDetailsModal
        event={selectedEvent}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onParticipate={handleParticipate}
        onNotify={handleNotify}
      />
      <ClaimRewardModal
        announcement={selectedClaim}
        isOpen={isClaimOpen}
        onClose={() => setIsClaimOpen(false)}
      />

      <PageHeader
        eyebrow="Calendar & Events"
        title="Evenings worth clearing your night for"
        description="LovePixels hosts regular listening rooms, salons, gaming nights, and prize events. Capped participant slots ensure intimate community vibes."
      />

      {/* Active Winner Celebration Announcements */}
      {announcements.length > 0 && (
        <Section className="pt-0 pb-6">
          <div className="space-y-4">
            {announcements.map((ann) => (
              <WinnerAnnouncementCard
                key={ann.id}
                announcement={ann}
                onClaimClick={(claim) => {
                  setSelectedClaim(claim);
                  setIsClaimOpen(true);
                }}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Filter Tabs */}
      <Section className="pt-0">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {[
            { id: "all", label: `All Events (${classifiedEvents.length})` },
            { id: "live", label: `🔥 Live Now (${current ? 1 : 0})` },
            { id: "upcoming", label: `Upcoming (${upcoming.length})` },
            { id: "past", label: `Past Archive (${past.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`rounded-full px-5 py-2 text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-rose-500 text-white shadow-md"
                  : "border border-border/60 bg-card/60 text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Section>

      {/* Live Featured Event */}
      {current && (activeTab === "all" || activeTab === "live") ? (
        <Section className="pt-0">
          <SectionHeading align="left" eyebrow="Happening now" title="Current Live Event" />
          <Reveal>
            <div className="mt-8">
              <EventCard
                event={current}
                featured
                onParticipate={handleParticipate}
                onViewDetails={(e) => {
                  setSelectedEvent(e);
                  setIsDetailsOpen(true);
                }}
              />
            </div>
          </Reveal>
        </Section>
      ) : null}

      {/* Filtered Events Grid */}
      <Section className="pt-0">
        <SectionHeading
          align="left"
          eyebrow="Schedule"
          title={
            activeTab === "all"
              ? "Community Event Roster"
              : activeTab === "upcoming"
                ? "Upcoming Community Events"
                : activeTab === "past"
                  ? "Past Events Archive"
                  : "Live Community Events"
          }
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {filteredEvents.map((event, i) => (
            <Reveal key={event.id} delay={i * 0.08}>
              <EventCard
                event={event}
                onParticipate={handleParticipate}
                onNotify={handleNotify}
                onViewDetails={(e) => {
                  setSelectedEvent(e);
                  setIsDetailsOpen(true);
                }}
              />
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
