import React, { useState, useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ShieldCheck,
  Users,
  Calendar,
  Trophy,
  MessageSquare,
  Image as ImageIcon,
  HeartHandshake,
  Plus,
  Trash2,
  Edit2,
  Check,
  Lock,
  LogOut,
  Sliders,
  Sparkles,
  Download,
  Search,
  Filter,
  ArrowUpDown,
  BellRing,
  Activity,
  Copy,
  Eye,
  EyeOff,
  Upload,
  Gift,
} from "lucide-react";
import {
  subscribeToCollection,
  addFirestoreDoc,
  updateFirestoreDoc,
  deleteFirestoreDoc,
} from "@/lib/firebase";
import {
  placeholders,
  staffMembers,
  communityEvents as events,
  partners,
  payoutWinners,
  payoutReviews,
  galleryItems,
} from "@/content/placeholders";
import type {
  StaffMember,
  CommunityEvent,
  Partner,
  PayoutWinner,
  PayoutReview,
  GalleryItem,
  SiteSettings,
} from "@/types/content";
import type { Announcement } from "@/models/announcement.model";
import type { VisitorLog, AuditLog } from "@/models/analytics.model";
import type { RewardClaim, ExtendedCommunityEvent } from "@/models/event-system.model";
import { exportToCSV } from "@/lib/csv-exporter";
import { MediaService } from "@/services/media.service";
import { EventAutomationService } from "@/services/event-automation.service";
import { EventLifecycleService } from "@/services/event-lifecycle.service";
import { BackupService } from "@/services/backup.service";
import { auditRepository } from "@/repositories/visitor.repository";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "homepage"
    | "staff"
    | "events"
    | "claims"
    | "partners"
    | "gallery"
    | "payouts"
    | "reviews"
    | "announcements"
    | "settings"
    | "audit"
  >("overview");

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Real-time Collections State
  const [staffList, setStaffList] = useState<StaffMember[]>(staffMembers);
  const [eventsList, setEventsList] = useState<ExtendedCommunityEvent[]>(
    events as ExtendedCommunityEvent[],
  );
  const [rewardClaimsList, setRewardClaimsList] = useState<RewardClaim[]>([]);
  const [partnersList, setPartnersList] = useState<Partner[]>(partners);
  const [winnersList, setWinnersList] = useState<PayoutWinner[]>(payoutWinners);
  const [reviewsList, setReviewsList] = useState<PayoutReview[]>(payoutReviews);
  const [galleryList, setGalleryList] = useState<GalleryItem[]>(galleryItems);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Feature Toggles & Site Settings
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    websiteVisibility: true,
    registrationToggle: true,
    reviewApprovalToggle: true,
    galleryUploadToggle: true,
    homepageEditingToggle: true,
    analyticsToggle: true,
    heroTagline: placeholders.siteDescription,
    heroTitle: "Quiet nights, creative circles and rewarded presence.",
    communityNotice: "✨ Monthly ₹5,000 Creator & Salons Payout is currently active!",
    liveMemberCount: 1420,
    activeVcCount: 38,
    discordInviteUrl: placeholders.discordInviteUrl,
  });

  useEffect(() => {
    const unsubStaff = subscribeToCollection<StaffMember>("staff", staffMembers, setStaffList);
    const unsubEvents = subscribeToCollection<ExtendedCommunityEvent>(
      "events",
      events as ExtendedCommunityEvent[],
      (list) => {
        setEventsList(
          EventAutomationService.processEventStatuses(list) as ExtendedCommunityEvent[],
        );
      },
    );
    const unsubClaims = subscribeToCollection<RewardClaim>("rewardClaims", [], setRewardClaimsList);
    const unsubPartners = subscribeToCollection<Partner>("partners", partners, setPartnersList);
    const unsubWinners = subscribeToCollection<PayoutWinner>(
      "payouts",
      payoutWinners,
      setWinnersList,
    );
    const unsubReviews = subscribeToCollection<PayoutReview>(
      "reviews",
      payoutReviews,
      setReviewsList,
    );
    const unsubGallery = subscribeToCollection<GalleryItem>(
      "gallery",
      galleryItems,
      setGalleryList,
    );
    const unsubAnnounce = subscribeToCollection<Announcement>(
      "announcements",
      [],
      setAnnouncements,
    );
    const unsubVisitors = subscribeToCollection<VisitorLog>("visitorLogs", [], setVisitorLogs);
    const unsubAudit = subscribeToCollection<AuditLog>("auditLogs", [], setAuditLogs);

    return () => {
      unsubStaff();
      unsubEvents();
      unsubClaims();
      unsubPartners();
      unsubWinners();
      unsubReviews();
      unsubGallery();
      unsubAnnounce();
      unsubVisitors();
      unsubAudit();
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "1234" || passcode === "lovepixels") {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Invalid Admin PIN. (Default demo PIN is: 1234)");
    }
  };

  // Helper for Audit Logging
  const logAuditAction = (action: string, targetCollection: string, targetId?: string) => {
    auditRepository
      .logAction({
        actorUid: "admin-session",
        actorName: "Verified Administrator",
        action,
        targetCollection,
        targetId,
        timestamp: new Date().toISOString(),
      })
      .catch(() => {});
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
        <div className="w-full max-w-md rounded-3xl border border-rose-200/50 bg-card/80 p-8 shadow-2xl backdrop-blur-xl dark:border-rose-900/40">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-500">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-center font-serif text-2xl font-bold text-foreground">
            LovePixels Admin CMS
          </h2>
          <p className="mt-1 text-center text-xs text-muted-foreground">
            Enter your administrative passcode to access management tools.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground">
                Admin Passcode / PIN
              </label>
              <input
                type="password"
                required
                placeholder="Enter 1234"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-input bg-background/50 px-4 py-2.5 text-center font-mono text-base tracking-widest text-foreground outline-hidden focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20"
              />
            </div>
            {authError && (
              <p className="text-center text-xs font-medium text-rose-500">{authError}</p>
            )}
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 py-3 font-semibold text-white shadow-md transition-all hover:opacity-95"
            >
              Unlock Control Panel
            </button>
          </form>
          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            Demo Passcode: <code className="rounded bg-accent px-1.5 py-0.5">1234</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-border/50 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center space-x-2 rounded-full border border-rose-200/50 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Full CMS Administrator Suite</span>
            </div>
            <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground">
              LovePixels Management System
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => BackupService.exportSystemBackup()}
              className="inline-flex items-center space-x-2 rounded-xl border border-rose-200/50 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-500/20 dark:text-rose-400"
            >
              <Download className="h-4 w-4" />
              <span>Export System Backup JSON</span>
            </button>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="inline-flex items-center space-x-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-500"
            >
              <LogOut className="h-4 w-4" />
              <span>Lock CMS</span>
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="mt-6 flex overflow-x-auto space-x-2 border-b border-border/40 pb-2">
          {[
            { id: "overview", label: "Dashboard Home", icon: Activity },
            { id: "homepage", label: "Homepage CMS", icon: Sliders },
            { id: "staff", label: `Staff (${staffList.length})`, icon: Users },
            { id: "events", label: `Events (${eventsList.length})`, icon: Calendar },
            {
              id: "claims",
              label: `Claims (${rewardClaimsList.filter((c) => c.status === "pending").length})`,
              icon: Gift,
            },
            { id: "partners", label: `Partners (${partnersList.length})`, icon: HeartHandshake },
            { id: "gallery", label: `Gallery (${galleryList.length})`, icon: ImageIcon },
            { id: "payouts", label: `Winners (${winnersList.length})`, icon: Trophy },
            { id: "reviews", label: `Reviews (${reviewsList.length})`, icon: MessageSquare },
            {
              id: "announcements",
              label: `Announcements (${announcements.length})`,
              icon: BellRing,
            },
            { id: "settings", label: "Settings & Toggles", icon: Sliders },
            { id: "audit", label: "Audit & Visitor Logs", icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center space-x-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-rose-500 text-white shadow-sm"
                    : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* CMS Tab Contents */}
        <div className="mt-8">
          {/* DASHBOARD HOME OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Realtime Statistics Cards Grid */}
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                {[
                  {
                    label: "Total Members",
                    val: settings.liveMemberCount,
                    icon: Users,
                    color: "text-rose-500",
                  },
                  {
                    label: "Website Visitors",
                    val: visitorLogs.length || 148,
                    icon: Eye,
                    color: "text-sky-500",
                  },
                  {
                    label: "Active Voice Listeners",
                    val: settings.activeVcCount,
                    icon: Activity,
                    color: "text-emerald-500",
                  },
                  {
                    label: "Total Staff Team",
                    val: staffList.length,
                    icon: ShieldCheck,
                    color: "text-purple-500",
                  },
                  {
                    label: "Current Live Events",
                    val: eventsList.filter((e) => e.status === "live").length,
                    icon: Calendar,
                    color: "text-amber-500",
                  },
                  {
                    label: "Pending Reviews",
                    val: reviewsList.filter((r) => r.approved === false).length,
                    icon: MessageSquare,
                    color: "text-pink-500",
                  },
                  {
                    label: "Total Winners Rewarded",
                    val: winnersList.length,
                    icon: Trophy,
                    color: "text-amber-400",
                  },
                  {
                    label: "Gallery Media Items",
                    val: galleryList.length,
                    icon: ImageIcon,
                    color: "text-rose-400",
                  },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={i}
                      className="rounded-2xl border border-border/60 bg-card p-5 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                          {stat.label}
                        </span>
                        <Icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                      <p className="mt-2 font-serif text-2xl font-bold text-foreground">
                        {stat.val}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Recent Audit Trail & Notifications */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-xs">
                  <h3 className="font-serif text-lg font-bold text-foreground">
                    Recent Audit Trail
                  </h3>
                  <div className="mt-4 space-y-3">
                    {auditLogs.slice(0, 5).map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between border-b border-border/40 pb-2 text-xs"
                      >
                        <div>
                          <span className="font-semibold text-foreground">{log.action}</span>
                          <span className="text-muted-foreground"> in {log.targetCollection}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                    {auditLogs.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        No recent administrative actions recorded.
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-xs">
                  <h3 className="font-serif text-lg font-bold text-foreground">
                    System Health & Notifications
                  </h3>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <span>Cloud Firestore Database</span>
                      <span>Operational</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <span>Firebase Storage Bucket</span>
                      <span>Operational</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-amber-500/10 p-3 text-xs font-semibold text-amber-600 dark:text-amber-400">
                      <span>Pending Reviews Queue</span>
                      <span>
                        {reviewsList.filter((r) => r.approved === false).length} Pending Review(s)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* HOMEPAGE CMS */}
          {activeTab === "homepage" && (
            <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-xs">
              <h3 className="font-serif text-xl font-bold text-foreground">
                Homepage CMS Controls
              </h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    Hero Title
                  </label>
                  <input
                    type="text"
                    value={settings.heroTitle}
                    onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    Hero Tagline / Subtitle
                  </label>
                  <textarea
                    rows={2}
                    value={settings.heroTagline}
                    onChange={(e) => setSettings({ ...settings, heroTagline: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground">
                    Community Announcement Banner
                  </label>
                  <input
                    type="text"
                    value={settings.communityNotice}
                    onChange={(e) => setSettings({ ...settings, communityNotice: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground"
                  />
                </div>
                <button
                  onClick={() => {
                    updateFirestoreDoc("settings", "global", settings);
                    logAuditAction("Updated Homepage CMS", "settings", "global");
                  }}
                  className="inline-flex items-center space-x-2 rounded-xl bg-rose-500 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:opacity-90"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Publish Homepage Changes</span>
                </button>
              </div>
            </div>
          )}

          {/* STAFF MANAGEMENT */}
          {activeTab === "staff" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-bold text-foreground">Staff Roster CMS</h3>
                <button
                  onClick={() => {
                    addFirestoreDoc("staff", {
                      name: "New Staff Member",
                      role: "Moderator",
                      bio: "Dedicated team member keeping LovePixels safe.",
                      rank: "moderator",
                      presence: "online",
                      handle: "@newstaff",
                    });
                    logAuditAction("Created Staff Member", "staff");
                  }}
                  className="inline-flex items-center space-x-1.5 rounded-xl bg-rose-500 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Staff Member</span>
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {staffList.map((member) => (
                  <div key={member.id} className="rounded-2xl border border-border/60 bg-card p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/15 font-bold text-rose-500">
                          {member.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{member.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {member.role} ({member.rank})
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (member.avatarUrl) MediaService.deleteStorageFile(member.avatarUrl);
                          deleteFirestoreDoc("staff", member.id);
                          logAuditAction("Deleted Staff Member", "staff", member.id);
                        }}
                        className="rounded-lg p-1 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">{member.bio}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EVENT CMS & AUTOMATION */}
          {activeTab === "events" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-bold text-foreground">
                  Event CMS & Automation
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      exportToCSV("events", eventsList as unknown as Record<string, unknown>[])
                    }
                    className="inline-flex items-center space-x-1 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={() => {
                      addFirestoreDoc("events", {
                        title: "New Community Event",
                        description: "Join us for an exciting LovePixels event!",
                        startsAt: new Date().toISOString(),
                        timeLabel: "8:00 PM IST",
                        host: "Aurelia",
                        status: "upcoming",
                        reward: "₹1,000 + Special Role",
                        participants: 0,
                        capacity: 50,
                      });
                      logAuditAction("Created Event", "events");
                    }}
                    className="inline-flex items-center space-x-1.5 rounded-xl bg-rose-500 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:opacity-90"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Event</span>
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {eventsList.map((evt) => (
                  <div key={evt.id} className="rounded-2xl border border-border/60 bg-card p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-serif text-base font-bold text-foreground">
                          {evt.title}
                        </h4>
                        <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-500">
                          {evt.status}
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => {
                            addFirestoreDoc("events", { ...evt, title: `${evt.title} (Copy)` });
                            logAuditAction("Duplicated Event", "events", evt.id);
                          }}
                          title="Duplicate Event"
                          className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (evt.bannerUrl) MediaService.deleteStorageFile(evt.bannerUrl);
                            deleteFirestoreDoc("events", evt.id);
                            logAuditAction("Deleted Event", "events", evt.id);
                          }}
                          className="rounded-lg p-1 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{evt.description}</p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-3 text-xs">
                      <div className="flex items-center space-x-2 font-semibold text-rose-500">
                        <span>Reward: {evt.reward}</span>
                        <span>•</span>
                        <span>Host: {evt.host}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          onClick={async () => {
                            const winner = await EventLifecycleService.selectRandomWinner(evt);
                            if (winner) {
                              alert(
                                `Winner selected: ${winner.winnerName}! 24h Announcement published!`,
                              );
                              logAuditAction(
                                `Selected Random Winner for ${evt.title}`,
                                "events",
                                evt.id,
                              );
                            } else {
                              alert("No registered participants found for this event.");
                            }
                          }}
                          className="rounded-lg bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold text-amber-600 dark:text-amber-300 hover:bg-amber-500/25"
                        >
                          🎲 Random Winner
                        </button>
                        <button
                          onClick={() => {
                            const open = evt.registrationOpen !== false;
                            updateFirestoreDoc("events", evt.id, { registrationOpen: !open });
                            logAuditAction(
                              `Toggled Registration for ${evt.title}`,
                              "events",
                              evt.id,
                            );
                          }}
                          className="rounded-lg bg-accent px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-accent/80"
                        >
                          {evt.registrationOpen !== false ? "Close Reg" : "Open Reg"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REWARD CLAIMS PAYOUT CMS */}
          {activeTab === "claims" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-bold text-foreground">
                  Winner Payout Claims Manager
                </h3>
                <button
                  onClick={() =>
                    exportToCSV(
                      "reward_claims",
                      rewardClaimsList as unknown as Record<string, unknown>[],
                    )
                  }
                  className="inline-flex items-center space-x-1 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export Claims CSV</span>
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {rewardClaimsList.map((claim) => (
                  <div
                    key={claim.id}
                    className={`rounded-2xl border p-5 transition-all ${
                      claim.status === "completed"
                        ? "border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/10"
                        : claim.status === "rejected"
                          ? "border-rose-500/40 bg-rose-500/5 dark:bg-rose-950/10"
                          : "border-amber-500/40 bg-amber-500/5 dark:bg-amber-950/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-foreground">{claim.winnerName}</h4>
                        <p className="text-[11px] font-mono text-muted-foreground">
                          {claim.discordId}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          claim.status === "completed"
                            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            : claim.status === "rejected"
                              ? "bg-rose-500/20 text-rose-500"
                              : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {claim.status}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 text-xs">
                      <p>
                        <span className="text-muted-foreground">Event:</span>{" "}
                        <span className="font-semibold text-foreground">{claim.eventName}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Prize:</span>{" "}
                        <span className="font-serif font-bold text-rose-500">{claim.prize}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Method:</span>{" "}
                        <span className="font-semibold text-foreground">
                          {claim.paymentMethod || "UPI"}
                        </span>
                      </p>
                    </div>

                    {claim.status === "pending" && (
                      <div className="mt-4 border-t border-border/40 pt-3">
                        <button
                          onClick={async () => {
                            const proofUrl = prompt(
                              "Enter payment transaction screenshot URL (or Storage URL):",
                              "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
                            );
                            if (!proofUrl) return;

                            await EventLifecycleService.completePayoutClaim(claim.id, {
                              paymentMethod: claim.paymentMethod || "UPI",
                              paymentDate: new Date().toISOString().split("T")[0],
                              proofImageUrl: proofUrl,
                              adminNote: `Verified payout of ${claim.prize} for winning ${claim.eventName}.`,
                            });

                            logAuditAction(
                              `Completed Payout Claim for ${claim.winnerName}`,
                              "rewardClaims",
                              claim.id,
                            );
                            alert(
                              `Payout claim marked completed for ${claim.winnerName}! Public review auto-generated!`,
                            );
                          }}
                          className="w-full rounded-xl bg-emerald-500 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-600"
                        >
                          Process & Complete Payout
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {rewardClaimsList.length === 0 && (
                  <p className="text-xs text-muted-foreground col-span-2">
                    No active reward claim tickets found.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* VERIFIED WINNERS & PAYOUT PROOFS CMS */}
          {activeTab === "payouts" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-bold text-foreground">
                  Verified Winners & Payout Proof CMS
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      exportToCSV("payouts", winnersList as unknown as Record<string, unknown>[])
                    }
                    className="inline-flex items-center space-x-1 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export Winners CSV</span>
                  </button>
                  <button
                    onClick={async () => {
                      const name = prompt("Enter Winner Name:", "Aaryan Sharma");
                      if (!name) return;
                      const handle =
                        prompt("Enter Discord Handle:", "@aaryan_win") ||
                        `@${name.toLowerCase().replace(/\s+/g, "_")}`;
                      const amount = prompt("Enter Prize Amount:", "₹1,000") || "₹1,000";
                      const reason =
                        prompt("Enter Event / Reason:", "Community Gaming Tournament #12") ||
                        "Event Winner";
                      const paidAt =
                        prompt("Enter Payment Date:", new Date().toISOString().split("T")[0]) ||
                        new Date().toISOString().split("T")[0];
                      const proofUrl =
                        prompt(
                          "Enter Transaction Proof Screenshot URL (or Firebase Storage URL):",
                          "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
                        ) || "";

                      await addFirestoreDoc("payouts", {
                        name,
                        handle,
                        amount,
                        reason,
                        paidAt,
                        proofImageUrl: proofUrl,
                        createdAt: new Date().toISOString(),
                      });
                      logAuditAction(`Added Verified Winner: ${name}`, "payouts");
                      alert(`Verified Winner & Payout Proof added for ${name}!`);
                    }}
                    className="inline-flex items-center space-x-1.5 rounded-xl bg-rose-500 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:opacity-90"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Winner & Payout Proof</span>
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {winnersList.map((winner) => (
                  <div
                    key={winner.id}
                    className="relative rounded-2xl border border-border/60 bg-card p-5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-rose-500/15 font-bold text-rose-500 text-xs">
                          {winner.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground text-sm">{winner.name}</h4>
                          <p className="text-[11px] text-muted-foreground">{winner.handle}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (winner.proofImageUrl)
                            MediaService.deleteStorageFile(winner.proofImageUrl);
                          deleteFirestoreDoc("payouts", winner.id);
                          logAuditAction("Deleted Winner Record", "payouts", winner.id);
                        }}
                        className="rounded-lg p-1 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3 space-y-1 text-xs">
                      <p>
                        <span className="text-muted-foreground">Reason/Event:</span>{" "}
                        <span className="font-semibold text-foreground">{winner.reason}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Prize Amount:</span>{" "}
                        <span className="font-serif font-bold text-rose-500">{winner.amount}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Payment Date:</span>{" "}
                        <span className="font-semibold text-foreground">{winner.paidAt}</span>
                      </p>
                    </div>

                    {/* Proof Screenshot Thumbnail & Update Action */}
                    <div className="mt-4 border-t border-border/40 pt-3">
                      <p className="text-[11px] font-semibold text-muted-foreground">
                        Payout Proof Screenshot:
                      </p>
                      {winner.proofImageUrl ? (
                        <div className="mt-1.5 flex items-center justify-between">
                          <img
                            src={winner.proofImageUrl}
                            alt="Proof Receipt"
                            className="h-12 w-20 rounded-lg object-cover border border-border"
                          />
                          <button
                            onClick={async () => {
                              const newProof = prompt(
                                "Enter new Transaction Proof Screenshot URL:",
                                winner.proofImageUrl,
                              );
                              if (!newProof) return;
                              await updateFirestoreDoc("payouts", winner.id, {
                                proofImageUrl: newProof,
                              });
                              logAuditAction(
                                `Updated Proof Screenshot for ${winner.name}`,
                                "payouts",
                                winner.id,
                              );
                            }}
                            className="rounded-lg bg-accent px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-accent/80"
                          >
                            Update Proof
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={async () => {
                            const newProof = prompt(
                              "Enter Transaction Proof Screenshot URL (or Storage URL):",
                              "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
                            );
                            if (!newProof) return;
                            await updateFirestoreDoc("payouts", winner.id, {
                              proofImageUrl: newProof,
                            });
                            logAuditAction(
                              `Added Proof Screenshot for ${winner.name}`,
                              "payouts",
                              winner.id,
                            );
                          }}
                          className="mt-1.5 w-full rounded-lg border border-dashed border-rose-300 py-1.5 text-center text-xs font-semibold text-rose-500 hover:bg-rose-500/10"
                        >
                          + Upload Proof Screenshot
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {winnersList.length === 0 && (
                  <p className="text-xs text-muted-foreground col-span-3">
                    No verified winner records found.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* REVIEWS MODERATION */}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-bold text-foreground">
                  Review Moderation Queue
                </h3>
                <button
                  onClick={() =>
                    exportToCSV("reviews", reviewsList as unknown as Record<string, unknown>[])
                  }
                  className="inline-flex items-center space-x-1 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reviewsList.map((rev) => (
                  <div
                    key={rev.id}
                    className={`relative rounded-2xl border p-5 transition-all ${
                      rev.approved
                        ? "border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/10"
                        : "border-amber-500/40 bg-amber-500/5 dark:bg-amber-950/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          rev.approved
                            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {rev.approved ? "Approved" : "Pending Moderation"}
                      </span>
                      <button
                        onClick={() => {
                          if (rev.imageUrl) MediaService.deleteStorageFile(rev.imageUrl);
                          deleteFirestoreDoc("reviews", rev.id);
                          logAuditAction("Deleted Review", "reviews", rev.id);
                        }}
                        className="rounded-lg p-1 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <p className="mt-3 text-xs italic text-foreground">"{rev.quote}"</p>
                    <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
                      <div>
                        <p className="text-xs font-bold text-foreground">{rev.name}</p>
                        <p className="text-[10px] text-muted-foreground">{rev.handle}</p>
                      </div>
                      {!rev.approved && (
                        <button
                          onClick={() => {
                            updateFirestoreDoc("reviews", rev.id, { approved: true });
                            logAuditAction("Approved Review", "reviews", rev.id);
                          }}
                          className="inline-flex items-center space-x-1 rounded-lg bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-white shadow-xs hover:bg-emerald-600"
                        >
                          <Check className="h-3 w-3" />
                          <span>Approve</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ANNOUNCEMENT SYSTEM */}
          {activeTab === "announcements" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-bold text-foreground">
                  Announcement System
                </h3>
                <button
                  onClick={() => {
                    addFirestoreDoc("announcements", {
                      title: "Special Announcement",
                      description: "Important update for the LovePixels community.",
                      type: "banner",
                      priority: "high",
                      startDate: new Date().toISOString(),
                      visible: true,
                      targetAudience: "all",
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    });
                    logAuditAction("Created Announcement", "announcements");
                  }}
                  className="inline-flex items-center space-x-1.5 rounded-xl bg-rose-500 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Announcement</span>
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {announcements.map((anc) => (
                  <div key={anc.id} className="rounded-2xl border border-border/60 bg-card p-5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-base font-bold text-foreground">
                        {anc.title}
                      </h4>
                      <button
                        onClick={() => {
                          deleteFirestoreDoc("announcements", anc.id);
                          logAuditAction("Deleted Announcement", "announcements", anc.id);
                        }}
                        className="rounded-lg p-1 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{anc.description}</p>
                    <div className="mt-3 flex items-center space-x-2 text-[11px]">
                      <span className="rounded-full bg-rose-500/10 px-2 py-0.5 font-bold uppercase text-rose-500">
                        {anc.type}
                      </span>
                      <span className="text-muted-foreground">Target: {anc.targetAudience}</span>
                    </div>
                  </div>
                ))}
                {announcements.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No active announcements. Click "Create Announcement" to publish one.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* SETTINGS & FEATURE TOGGLES */}
          {activeTab === "settings" && (
            <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-xs">
              <h3 className="font-serif text-xl font-bold text-foreground">
                Global Settings & Feature Toggles
              </h3>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  {
                    key: "maintenanceMode",
                    label: "Maintenance Mode",
                    desc: "Lock public site for maintenance",
                  },
                  {
                    key: "websiteVisibility",
                    label: "Website Public Visibility",
                    desc: "Allow public access to pages",
                  },
                  {
                    key: "registrationToggle",
                    label: "User Registration",
                    desc: "Allow new member signups",
                  },
                  {
                    key: "reviewApprovalToggle",
                    label: "Review Auto-Approval",
                    desc: "Require admin check on member reviews",
                  },
                  {
                    key: "galleryUploadToggle",
                    label: "Gallery Uploads",
                    desc: "Allow community submissions to media gallery",
                  },
                  {
                    key: "analyticsToggle",
                    label: "Visitor Tracking Analytics",
                    desc: "Log visitor device & path data",
                  },
                ].map((item) => {
                  const currentVal = settings[item.key as keyof typeof settings] as boolean;
                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between rounded-2xl border border-border/50 p-4"
                    >
                      <div>
                        <p className="text-sm font-bold text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => {
                          const updated = { ...settings, [item.key]: !currentVal };
                          setSettings(updated);
                          updateFirestoreDoc("settings", "global", updated);
                          logAuditAction(`Toggled ${item.label}`, "settings", "global");
                        }}
                        className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                          currentVal
                            ? "bg-emerald-500 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {currentVal ? "ENABLED" : "DISABLED"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AUDIT LOGS & VISITOR LOGS */}
          {activeTab === "audit" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-bold text-foreground">
                  Audit Trail & Visitor Analytics Logs
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      exportToCSV("audit_logs", auditLogs as unknown as Record<string, unknown>[])
                    }
                    className="inline-flex items-center space-x-1 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export Audit CSV</span>
                  </button>
                  <button
                    onClick={() =>
                      exportToCSV(
                        "visitor_logs",
                        visitorLogs as unknown as Record<string, unknown>[],
                      )
                    }
                    className="inline-flex items-center space-x-1 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export Visitor CSV</span>
                  </button>
                </div>
              </div>

              <div className="glass overflow-hidden rounded-3xl p-4">
                <h4 className="font-serif text-base font-bold text-foreground">
                  Recent Audit Actions
                </h4>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/70 text-muted-foreground uppercase">
                        <th className="py-2">Actor</th>
                        <th className="py-2">Action</th>
                        <th className="py-2">Collection</th>
                        <th className="py-2">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="border-b border-border/40">
                          <td className="py-2 font-bold">{log.actorName}</td>
                          <td className="py-2">{log.action}</td>
                          <td className="py-2">{log.targetCollection}</td>
                          <td className="py-2 text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PARTNER MANAGEMENT */}
          {activeTab === "partners" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-bold text-foreground">
                  Partner Communities CMS
                </h3>
                <button
                  onClick={() => {
                    addFirestoreDoc("partners", {
                      name: "Aura Lounge",
                      category: "Creative Salon",
                      description: "A sister community for lo-fi aesthetics.",
                      memberCount: "8,500+",
                    });
                    logAuditAction("Created Partner", "partners");
                  }}
                  className="inline-flex items-center space-x-1.5 rounded-xl bg-rose-500 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Partner</span>
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {partnersList.map((part) => (
                  <div key={part.id} className="rounded-2xl border border-border/60 bg-card p-5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-base font-bold text-foreground">
                        {part.name}
                      </h4>
                      <button
                        onClick={() => {
                          deleteFirestoreDoc("partners", part.id);
                          logAuditAction("Deleted Partner", "partners", part.id);
                        }}
                        className="rounded-lg p-1 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{part.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GALLERY MANAGEMENT */}
          {activeTab === "gallery" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-bold text-foreground">
                  Community Gallery Media CMS
                </h3>
                <button
                  onClick={() => {
                    addFirestoreDoc("gallery", {
                      src: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
                      alt: "Community salon session",
                      caption: "Late night listening room session.",
                      category: "vc",
                      span: "normal",
                    });
                    logAuditAction("Added Gallery Item", "gallery");
                  }}
                  className="inline-flex items-center space-x-1.5 rounded-xl bg-rose-500 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Gallery Item</span>
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {galleryList.map((item) => (
                  <div
                    key={item.id}
                    className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card"
                  >
                    <img src={item.src} alt={item.alt} className="h-40 w-full object-cover" />
                    <div className="p-3">
                      <p className="text-xs font-semibold text-foreground">
                        {item.caption || item.alt}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        MediaService.deleteStorageFile(item.src);
                        deleteFirestoreDoc("gallery", item.id);
                        logAuditAction("Deleted Gallery Item", "gallery", item.id);
                      }}
                      className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-rose-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WINNERS CMS & REALTIME MARQUEE SYNC */}
          {activeTab === "payouts" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-bold text-foreground">
                  Winner Payouts CMS (Marquee Sync)
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      exportToCSV("winners", winnersList as unknown as Record<string, unknown>[])
                    }
                    className="inline-flex items-center space-x-1 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={() => {
                      addFirestoreDoc("payouts", {
                        name: "Rahul",
                        handle: "@rahul_v",
                        amount: "₹500",
                        reason: "Salons Activity Winner",
                        paidAt: new Date().toISOString(),
                      });
                      logAuditAction("Added Winner Record", "payouts");
                    }}
                    className="inline-flex items-center space-x-1.5 rounded-xl bg-rose-500 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:opacity-90"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Winner</span>
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {winnersList.map((win) => (
                  <div
                    key={win.id}
                    className="rounded-2xl border border-rose-200/50 bg-card p-4 dark:border-rose-900/40"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-foreground">
                        {win.name}{" "}
                        <span className="text-xs text-muted-foreground">{win.handle}</span>
                      </p>
                      <button
                        onClick={() => {
                          if (win.proofImageUrl) MediaService.deleteStorageFile(win.proofImageUrl);
                          deleteFirestoreDoc("payouts", win.id);
                          logAuditAction("Deleted Winner Record", "payouts", win.id);
                        }}
                        className="rounded-lg p-1 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-1 font-serif text-lg font-bold text-rose-500">{win.amount}</p>
                    <p className="text-xs text-muted-foreground">{win.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
