import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, useRef, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Background } from "@/components/site/Background";
import { PageTransition } from "@/components/site/PageTransition";
import { LoadingScreen } from "@/components/site/LoadingScreen";
import { WinnerCelebrationModal } from "@/components/site/WinnerCelebrationModal";
import { ClaimRewardModal } from "@/components/site/ClaimRewardModal";
import { AuthProvider } from "@/contexts/AuthContext";
import { RBACProvider } from "@/contexts/RBACContext";
import { useAuth } from "@/hooks/useAuth";
import { useVisitorTracker } from "@/hooks/useVisitorTracker";
import { subscribeToCollection, loadLocalItems } from "@/lib/firebase";
import { EventLifecycleService } from "@/services/event-lifecycle.service";
import type { WinnerAnnouncement, RewardClaim, ExtendedCommunityEvent, EventParticipant } from "@/models/event-system.model";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "LovePixels — A soft, luxurious Discord community" },
      {
        name: "description",
        content:
          "LovePixels is a gently moderated Discord community for creatives — salons, listening rooms, galleries and monthly creator payouts.",
      },
      { name: "author", content: "LovePixels" },
      { property: "og:title", content: "LovePixels — A soft, luxurious Discord community" },
      {
        property: "og:description",
        content: "Quiet nights, creative circles and rewarded presence.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@LovePixels" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600&family=Quicksand:wght@400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootContent() {
  useVisitorTracker();
  const { user, userProfile } = useAuth();
  const routerState = useRouterState();
  const pathname = routerState?.location?.pathname ?? "";
  const isAdminPath = pathname.startsWith("/admin");

  const [announcements, setAnnouncements] = useState<WinnerAnnouncement[]>([]);
  const [claims, setClaims] = useState<RewardClaim[]>([]);
  const [selectedClaimAnnouncement, setSelectedClaimAnnouncement] = useState<WinnerAnnouncement | null>(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isWinnerPopupClosed, setIsWinnerPopupClosed] = useState(false);

  const [eventsList, setEventsList] = useState<ExtendedCommunityEvent[]>([]);
  const eventsRef = useRef<ExtendedCommunityEvent[]>([]);

  useEffect(() => {
    const unsubEvents = subscribeToCollection<ExtendedCommunityEvent>("events", [], (list) => {
      eventsRef.current = list;
      setEventsList(list);
      EventLifecycleService.checkAndFinalizeEvents(list);
    });
    const unsubAnnounce = subscribeToCollection<WinnerAnnouncement>("winnerAnnouncements", [], (list) => {
      setAnnouncements(list);
    });
    const unsubClaims = subscribeToCollection<RewardClaim>("rewardClaims", [], (list) => {
      setClaims(list);
    });

    const timer = setInterval(() => {
      if (eventsRef.current.length > 0) {
        EventLifecycleService.checkAndFinalizeEvents(eventsRef.current);
      }
    }, 5000);

    return () => {
      unsubEvents();
      unsubAnnounce();
      unsubClaims();
      clearInterval(timer);
    };
  }, []);

  const [claimedAnnouncementIds, setClaimedAnnouncementIds] = useState<string[]>(() =>
    loadLocalItems<string>("claimed_announcements") || []
  );

  // Active Winner Announcement Popup logic
  // Displays on website reload and enter UNLESS the reward has already been claimed!
  const activeAnnouncement = announcements.find((ann) => {
    if (ann.status !== "active") return false;
    if (ann.expiresAt && new Date().toISOString() >= ann.expiresAt) return false;
    if (claimedAnnouncementIds.includes(ann.id)) return false;

    // Check if reward claim ticket exists in rewardClaims collection
    const hasClaimed = claims.some(
      (c) =>
        c.eventId === ann.eventId ||
        (c as any).announcementId === ann.id ||
        (c.winnerName === ann.winnerName && c.status === "completed")
    );
    if (hasClaimed) return false;

    return true;
  });

  return (
    <>
      <Background />
      <LoadingScreen />
      {!isAdminPath && <Navbar />}

      {/* Automatic Winner Celebration Popup on load/reload */}
      <WinnerCelebrationModal
        isOpen={!!activeAnnouncement && !isWinnerPopupClosed}
        announcement={activeAnnouncement || null}
        onClose={() => setIsWinnerPopupClosed(true)}
        onClaimTicket={(ann) => {
          setSelectedClaimAnnouncement(ann);
          setIsClaimModalOpen(true);
        }}
      />

      {/* Claim Reward Ticket Flow */}
      <ClaimRewardModal
        announcement={selectedClaimAnnouncement}
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        onClaimCompleted={(claimedId) => {
          setClaimedAnnouncementIds((prev) => [...prev, claimedId]);
          setIsWinnerPopupClosed(true);
        }}
      />

      <main className="min-h-screen">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      {!isAdminPath && <Footer />}
    </>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RBACProvider>
          <RootContent />
        </RBACProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
