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
  X,
  AlertTriangle,
  LayoutDashboard,
  Menu,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from "recharts";
import { Toaster, toast } from "sonner";

import {
  subscribeToCollection,
  addFirestoreDoc,
  updateFirestoreDoc,
  deleteFirestoreDoc,
} from "@/lib/firebase";
import { CustomImageUploader } from "@/components/ui/CustomImageUploader";
import {
  placeholders,
  staffMembers,
  communityEvents,
  partners as placeholderPartners,
  payoutWinners,
  payoutReviews,
  galleryItems,
} from "@/content/placeholders";
import { useAuth } from "@/hooks/useAuth";
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

function toLocalDateTimeInputString(isoString?: string): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function fromLocalDateTimeInputString(localInputVal: string): string {
  if (!localInputVal) return "";
  const d = new Date(localInputVal);
  if (isNaN(d.getTime())) return "";
  return d.toISOString();
}

function generateTimeLabel(startsAtIso?: string, endsAtIso?: string): string {
  if (!startsAtIso) return "8:00 PM IST";
  const start = new Date(startsAtIso);
  if (isNaN(start.getTime())) return "8:00 PM IST";

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  if (endsAtIso) {
    const end = new Date(endsAtIso);
    if (!isNaN(end.getTime())) {
      return `${formatTime(start)} – ${formatTime(end)} IST`;
    }
  }
  return `${formatTime(start)} IST`;
}

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
});

export function AdminDashboard() {
  const { userProfile, loading: authLoading, logout } = useAuth();
  const isAuthenticated =
    userProfile?.roles?.some((r) => ["Owner", "Admin", "CoOwner"].includes(r)) ?? false;
  const [authError] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Collections State
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [eventsList, setEventsList] = useState<ExtendedCommunityEvent[]>([]);
  const [rewardClaimsList, setRewardClaimsList] = useState<RewardClaim[]>([]);
  const [partnersList, setPartnersList] = useState<Partner[]>([]);
  const [winnersList, setWinnersList] = useState<PayoutWinner[]>([]);
  const [reviewsList, setReviewsList] = useState<PayoutReview[]>([]);
  const [galleryList, setGalleryList] = useState<GalleryItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<{
    collection: string;
    id: string;
    name: string;
  } | null>(null);

  // CMS Modal Form States
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<ExtendedCommunityEvent> | null>(null);

  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [editingPayout, setEditingPayout] = useState<Partial<PayoutWinner> | null>(null);

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Partial<StaffMember> | null>(null);

  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState<Partial<GalleryItem> | null>(null);

  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partial<Partner> | null>(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Partial<PayoutReview> | null>(null);

  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Partial<Announcement> | null>(
    null,
  );

  const tabLabels = useMemo<Record<string, string>>(() => ({
    overview: "Dashboard",
    homepage: "Homepage Customizer",
    events: "Community Events",
    payouts: "Winners & Proofs",
    claims: "Reward Claims",
    staff: "Staff Roster",
    gallery: "Media Gallery",
    partners: "Affiliate Partners",
    reviews: "Member Reviews",
    announcements: "Announcements",
    settings: "Global Settings",
    audit: "Audit Logs",
  }), []);

  const chartData = useMemo(() => [
    { date: "07-30", amount: 1000 },
    { date: "07-31", amount: 2000 },
    { date: "08-01", amount: 1500 },
    { date: "08-02", amount: 3000 },
    { date: "08-03", amount: 2500 },
    { date: "08-04", amount: 4000 },
    { date: "08-05", amount: 3500 },
    { date: "08-06", amount: 5000 },
    { date: "08-07", amount: 4500 },
    { date: "08-08", amount: 6000 },
    { date: "08-09", amount: 5500 },
    { date: "08-10", amount: 7000 },
    { date: "08-11", amount: 6500 },
    { date: "08-12", amount: 8000 },
  ], []);

  // Settings
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
    discordGuildId: "1346519672688087093",
    ticketWebhookUrl: "",
  });

  useEffect(() => {
    const unsubStaff = subscribeToCollection<StaffMember>("staff", staffMembers, setStaffList);
    const unsubEvents = subscribeToCollection<ExtendedCommunityEvent>(
      "events",
      communityEvents as ExtendedCommunityEvent[],
      (list) => {
        setEventsList(EventAutomationService.processEventStatuses(list) as ExtendedCommunityEvent[]);
      },
    );
    const unsubClaims = subscribeToCollection<RewardClaim>("rewardClaims", [], setRewardClaimsList);
    const unsubPartners = subscribeToCollection<Partner>("partners", placeholderPartners, setPartnersList);
    const unsubWinners = subscribeToCollection<PayoutWinner>("payouts", payoutWinners, setWinnersList);
    const unsubReviews = subscribeToCollection<PayoutReview>("reviews", payoutReviews, setReviewsList);
    const unsubGallery = subscribeToCollection<GalleryItem>("gallery", galleryItems, setGalleryList);
    const unsubAnnounce = subscribeToCollection<Announcement>(
      "announcements",
      [],
      setAnnouncements,
    );
    const unsubVisitors = subscribeToCollection<VisitorLog>("visitorLogs", [], setVisitorLogs);
    const unsubAudit = subscribeToCollection<AuditLog>("auditLogs", [], setAuditLogs);

    // Hydrate settings from Supabase on mount
    const unsubSettings = subscribeToCollection<Record<string, unknown>>(
      "settings",
      [],
      (rows) => {
        const globalRow = rows.find((r) => r["id"] === "global") || rows[0];
        if (globalRow) {
          setSettings((prev) => ({ ...prev, ...globalRow }));
        }
      },
    );

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
      unsubSettings();
    };
  }, []);

  // Automated Winner Check Timer
  useEffect(() => {
    if (!eventsList || eventsList.length === 0) return;
    const interval = setInterval(async () => {
      const msgs = await EventAutomationService.checkAndTriggerAutomatedWinners(eventsList);
      msgs.forEach((msg) => toast.success(msg));
    }, 10000);
    return () => clearInterval(interval);
  }, [eventsList]);

  // Auth is handled by Supabase — no manual login handler needed.

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

  // Delete Action Trigger
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteFirestoreDoc(deleteTarget.collection, deleteTarget.id);
      logAuditAction(`Deleted ${deleteTarget.name}`, deleteTarget.collection, deleteTarget.id);
      toast.success(`Deleted ${deleteTarget.name} successfully!`);
    } catch (err) {
      toast.error("Failed to delete record.");
    } finally {
      setDeleteTarget(null);
    }
  };

  // Save Handlers for Modals
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent?.title) return;

    try {
      const now = new Date();
      const startsAt = editingEvent.startsAt || now.toISOString();
      const durationHours = Number(editingEvent.durationHours) || 24;
      const durationMs = durationHours * 3600 * 1000;

      const calculatedEndsAt =
        editingEvent.endsAt || new Date(new Date(startsAt).getTime() + durationMs).toISOString();

      const durationLabel = `${durationHours} Hour${durationHours === 1 ? "" : "s"}`;
      const isEnded = new Date(calculatedEndsAt).getTime() <= now.getTime();
      const status = isEnded ? "past" : "live";

      const payload = {
        title: editingEvent.title,
        description: editingEvent.description || "",
        startsAt,
        endsAt: calculatedEndsAt,
        durationHours,
        durationLabel,
        autoSelectWinner: true,
        winnerSelectionStatus: editingEvent.winnerSelectionStatus || "PENDING",
        timeLabel: durationLabel,
        host: editingEvent.host || "Aurelia",
        reward: editingEvent.reward || "",
        maxSlots: editingEvent.maxSlots || 50,
        registeredCount: editingEvent.registeredCount || 0,
        remainingSlots: (editingEvent.maxSlots || 50) - (editingEvent.registeredCount || 0),
        difficulty: editingEvent.difficulty || "Medium",
        rules: editingEvent.rules || ["Follow server guidelines"],
        bannerUrl: editingEvent.bannerUrl || "",
        registrationOpen: !isEnded && editingEvent.registrationOpen !== false,
        status: editingEvent.winnerName ? "past" : status,
        updatedAt: now.toISOString(),
      };

      if (editingEvent.id) {
        await updateFirestoreDoc("events", editingEvent.id, payload);
        toast.success(`Updated Event: ${editingEvent.title}`);
      } else {
        await addFirestoreDoc("events", { ...payload, createdAt: now.toISOString() });
        toast.success(`Created Event: ${editingEvent.title} (${durationLabel})`);
      }
      setIsEventModalOpen(false);
      setEditingEvent(null);
    } catch (err) {
      toast.error("Failed to save event.");
    }
  };

  const handleSavePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayout?.name) return;

    try {
      const payload = {
        name: editingPayout.name,
        handle: editingPayout.handle || `@${editingPayout.name.toLowerCase().replace(/\s+/g, "_")}`,
        amount: editingPayout.amount || "₹1,000",
        reason: editingPayout.reason || "Event Winner",
        paidAt: editingPayout.paidAt || new Date().toISOString().split("T")[0],
        proofImageUrl: editingPayout.proofImageUrl || "",
        updatedAt: new Date().toISOString(),
      };

      if (editingPayout.id) {
        await updateFirestoreDoc("payouts", editingPayout.id, payload);
        toast.success(`Updated Payout for ${editingPayout.name}`);
      } else {
        await addFirestoreDoc("payouts", { ...payload, createdAt: new Date().toISOString() });
        toast.success(`Added Verified Payout for ${editingPayout.name}`);
      }
      setIsPayoutModalOpen(false);
      setEditingPayout(null);
    } catch (err) {
      toast.error("Failed to save payout record.");
    }
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff?.name) return;

    try {
      const handleVal = editingStaff.handle
        ? editingStaff.handle.startsWith("@")
          ? editingStaff.handle
          : `@${editingStaff.handle}`
        : "";

      const payload = {
        name: editingStaff.name,
        handle: handleVal,
        role: editingStaff.role || "",
        bio: editingStaff.bio || "",
        rank: editingStaff.rank || "moderator",
        presence: editingStaff.presence || "online",
        avatarUrl: editingStaff.avatarUrl || "",
      };

      if (editingStaff.id) {
        await updateFirestoreDoc("staff", editingStaff.id, payload);
        toast.success(`Updated Staff Member: ${editingStaff.name}`);
      } else {
        await addFirestoreDoc("staff", payload);
        toast.success(`Added Staff Member: ${editingStaff.name}`);
      }
      setIsStaffModalOpen(false);
      setEditingStaff(null);
    } catch (err) {
      toast.error("Failed to save staff record.");
    }
  };

  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGallery?.src) return;

    try {
      const payload = {
        src: editingGallery.src,
        alt: editingGallery.alt || "Gallery Item",
        caption: editingGallery.caption || "",
        category: editingGallery.category || "Community",
        span: editingGallery.span || "col-span-1",
      };

      if (editingGallery.id) {
        await updateFirestoreDoc("gallery", editingGallery.id, payload);
        toast.success("Updated Gallery Item");
      } else {
        await addFirestoreDoc("gallery", { ...payload, createdAt: new Date().toISOString() });
        toast.success("Added Gallery Item");
      }
      setIsGalleryModalOpen(false);
      setEditingGallery(null);
    } catch (err) {
      toast.error("Failed to save gallery item.");
    }
  };

  const handleSavePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartner?.name) return;

    try {
      const payload = {
        name: editingPartner.name,
        category: editingPartner.category || "Community",
        description: editingPartner.description || "",
        memberCount: editingPartner.memberCount || 500,
        logoUrl: editingPartner.logoUrl || "",
        href: editingPartner.href || "#",
      };

      if (editingPartner.id) {
        await updateFirestoreDoc("partners", editingPartner.id, payload);
        toast.success(`Updated Partner: ${editingPartner.name}`);
      } else {
        await addFirestoreDoc("partners", payload);
        toast.success(`Added Partner: ${editingPartner.name}`);
      }
      setIsPartnerModalOpen(false);
      setEditingPartner(null);
    } catch (err) {
      toast.error("Failed to save partner.");
    }
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview?.name) return;

    try {
      const payload = {
        name: editingReview.name,
        handle: editingReview.handle || `@${editingReview.name.toLowerCase().replace(/\s+/g, "_")}`,
        quote: editingReview.quote || "",
        rating: editingReview.rating || 5,
        approved: editingReview.approved !== false,
        isVerified: editingReview.isVerified !== false,
        imageUrl: editingReview.imageUrl || "",
      };

      if (editingReview.id) {
        await updateFirestoreDoc("reviews", editingReview.id, payload);
        toast.success(`Updated Review for ${editingReview.name}`);
      } else {
        await addFirestoreDoc("reviews", { ...payload, createdAt: new Date().toISOString() });
        toast.success(`Added Review for ${editingReview.name}`);
      }
      setIsReviewModalOpen(false);
      setEditingReview(null);
    } catch (err) {
      toast.error("Failed to save review.");
    }
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement?.title) return;

    try {
      const payload = {
        title: editingAnnouncement.title,
        description: editingAnnouncement.description || "",
        type: editingAnnouncement.type || "banner",
        priority: editingAnnouncement.priority || "high",
        visible: editingAnnouncement.visible !== false,
        targetAudience: editingAnnouncement.targetAudience || "all",
        startDate: editingAnnouncement.startDate || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (editingAnnouncement.id) {
        await updateFirestoreDoc("announcements", editingAnnouncement.id, payload);
        toast.success(`Updated Announcement: ${editingAnnouncement.title}`);
      } else {
        await addFirestoreDoc("announcements", { ...payload, createdAt: new Date().toISOString() });
        toast.success(`Created Announcement: ${editingAnnouncement.title}`);
      }
      setIsAnnouncementModalOpen(false);
      setEditingAnnouncement(null);
    } catch (err) {
      toast.error("Failed to save announcement.");
    }
  };

  // Show loading while Supabase resolves the session
  if (authLoading) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center p-4">
        <Toaster theme="dark" position="top-right" />
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 animate-spin items-center justify-center rounded-2xl bg-rose-500/15 text-rose-500">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Verifying access…</p>
        </div>
      </div>
    );
  }

  // Not logged in or not an admin/owner role
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center p-4">
        <Toaster theme="dark" position="top-right" />
        <div className="w-full max-w-md overflow-hidden rounded-3xl border border-rose-500/30 bg-card p-8 shadow-2xl backdrop-blur-xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-500 shadow-inner">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="mt-4 font-serif text-2xl font-bold text-foreground">Access Denied</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {!userProfile
              ? "You must be logged in with Discord to access the admin panel."
              : "Your account does not have Owner or Admin permissions."}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Log in via Discord using an account with the <strong>Owner</strong> or{" "}
            <strong>Admin</strong> role assigned in Supabase.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#030307] text-foreground">
      <Toaster theme="dark" position="top-right" />

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-rose-500/40 bg-card p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center space-x-3 text-rose-500">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="font-serif text-lg font-bold text-foreground">Confirm Deletion</h3>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-bold text-foreground">"{deleteTarget.name}"</span>? This action
              cannot be undone.
            </p>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="rounded-xl bg-rose-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-600"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BACKDROP OVERLAY */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-xs"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#07070b] border-r border-white/10 p-6 flex flex-col justify-between shrink-0 h-screen transition-transform duration-300 md:static md:translate-x-0 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-6 overflow-y-auto pr-1">
          {/* Logo / Header */}
          <div className="flex items-center justify-between pb-5 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 text-lg shadow-sm shadow-rose-500/20">
                ❤️
              </div>
              <div>
                <h2 className="font-serif text-sm font-bold text-white">LovePixels</h2>
                <p className="text-[10px] text-rose-500 uppercase tracking-widest font-bold">Admin Console</p>
              </div>
            </div>
            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-1 text-zinc-400 hover:text-white md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {[
              { id: "overview", label: "Dashboard", icon: LayoutDashboard },
              { id: "homepage", label: "Homepage", icon: Sparkles },
              { id: "events", label: "Events", icon: Calendar },
              { id: "payouts", label: "Winners & Proofs", icon: Trophy },
              { id: "claims", label: "Reward Claims", icon: Gift },
              { id: "staff", label: "Staff Roster", icon: Users },
              { id: "gallery", label: "Gallery", icon: ImageIcon },
              { id: "partners", label: "Partners", icon: HeartHandshake },
              { id: "reviews", label: "Reviews", icon: MessageSquare },
              { id: "announcements", label: "Announcements", icon: BellRing },
              { id: "settings", label: "Settings", icon: Sliders },
              { id: "audit", label: "Audit Logs", icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as typeof activeTab);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-rose-500/20 to-pink-500/5 text-rose-400 border-l-2 border-rose-500 shadow-sm"
                      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Operations */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <button
            onClick={() => BackupService.exportSystemBackup()}
            className="flex w-full items-center justify-center space-x-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-white/10 hover:text-white"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Backup</span>
          </button>
          <button
            onClick={() => logout()}
            className="flex w-full items-center justify-center space-x-2 rounded-xl bg-rose-500/10 border border-rose-500/25 px-3 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-500/20"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto bg-[#030307]">
        {/* Top Header */}
        <header className="flex justify-between items-center px-4 sm:px-8 py-4 sm:py-5 border-b border-white/10 bg-[#05050b]/90 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white md:hidden"
              aria-label="Open sidebar navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-[9px] text-rose-500 uppercase tracking-widest font-bold">Console Panel</p>
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-white capitalize">
                {tabLabels[activeTab] || activeTab}
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 bg-[#0d0d15] border border-white/10 px-3 sm:px-4 py-2 rounded-2xl shadow-xs">
            <ShieldCheck className="h-4 w-4 text-rose-500 animate-pulse shrink-0" />
            <span className="text-xs font-semibold text-zinc-200 max-w-[120px] sm:max-w-none truncate">
              {userProfile?.displayName || userProfile?.email}
            </span>
          </div>
        </header>

        {/* Page Inner Content */}
        <div className="p-4 sm:p-8 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    label: "Active Events",
                    val: eventsList.length,
                    icon: Calendar,
                    color: "text-rose-500",
                    bg: "bg-rose-500/10",
                  },
                  {
                    label: "Verified Winners",
                    val: winnersList.length,
                    icon: Trophy,
                    color: "text-amber-500",
                    bg: "bg-amber-500/10",
                  },
                  {
                    label: "Staff Roster",
                    val: staffList.length,
                    icon: Users,
                    color: "text-indigo-500",
                    bg: "bg-indigo-500/10",
                  },
                  {
                    label: "Pending Claims",
                    val: rewardClaimsList.filter((c) => c.status === "pending").length,
                    icon: Gift,
                    color: "text-emerald-500",
                    bg: "bg-emerald-500/10",
                  },
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className="rounded-3xl border border-white/10 bg-[#0c0c12] p-5 sm:p-6 flex justify-between items-center relative overflow-hidden backdrop-blur-xl">
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{stat.label}</span>
                        <p className="font-serif text-3xl font-bold text-white">{stat.val}</p>
                      </div>
                      <div className={`h-11 w-11 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} shrink-0`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* TWO COLUMN WORKSPACE */}
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                {/* Chart Panel */}
                <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-[#0c0c12] p-5 sm:p-6 backdrop-blur-xl space-y-4">
                  <div>
                    <span className="text-[10px] text-rose-500 uppercase tracking-widest font-bold">Analytics</span>
                    <h4 className="font-serif text-lg font-bold text-white">Rewards distributed over time</h4>
                  </div>
                  <div className="h-[250px] sm:h-[300px] w-full pr-2 sm:pr-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                        <ChartTooltip
                          contentStyle={{
                            background: "#0c0c12",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: "16px",
                            fontSize: "12px",
                            color: "#fff",
                          }}
                        />
                        <Area type="monotone" dataKey="amount" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent Activity Panel */}
                <div className="rounded-3xl border border-white/10 bg-[#0c0c12] p-5 sm:p-6 backdrop-blur-xl space-y-4">
                  <div>
                    <span className="text-[10px] text-rose-500 uppercase tracking-widest font-bold">Activity Feed</span>
                    <h4 className="font-serif text-lg font-bold text-white">Recent actions</h4>
                  </div>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    {auditLogs.slice(0, 5).map((log, idx) => (
                      <div key={idx} className="flex items-center justify-between border-b border-white/10 pb-3 last:border-0 last:pb-0">
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-white line-clamp-1">{log.action}</p>
                          <p className="text-[10px] text-zinc-400">{new Date(log.timestamp).toLocaleDateString()}</p>
                        </div>
                        <span className="rounded bg-rose-500/10 px-2.5 py-0.5 text-[9px] font-bold text-rose-500 uppercase tracking-wider shrink-0">
                          {log.targetCollection}
                        </span>
                      </div>
                    ))}
                    {auditLogs.length === 0 && (
                      <p className="text-xs text-zinc-400 text-center py-6">No recent actions recorded.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

      {/* TAB 2: EVENTS CMS */}
      {activeTab === "events" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-foreground">Community Events CMS</h3>
            <button
              onClick={() => {
                setEditingEvent({
                  title: "",
                  description: "",
                  startsAt: new Date().toISOString(),
                  timeLabel: "8:00 PM IST",
                  host: "Aurelia",
                  reward: "₹1,000",
                  maxSlots: 50,
                  difficulty: "Medium",
                  rules: ["Follow server guidelines"],
                  registrationOpen: true,
                });
                setIsEventModalOpen(true);
              }}
              className="inline-flex items-center space-x-1.5 rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white hover:bg-rose-600"
            >
              <Plus className="h-4 w-4" />
              <span>Create Event</span>
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {eventsList.map((evt) => (
              <div
                key={evt.id}
                className="rounded-2xl border border-border/60 bg-card p-5 space-y-3"
              >
                {evt.bannerUrl && (
                  <img
                    src={evt.bannerUrl}
                    alt={evt.title}
                    className="h-32 w-full rounded-xl object-cover border border-border/40"
                  />
                )}
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-base font-bold text-foreground">{evt.title}</h4>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => {
                        setEditingEvent(evt);
                        setIsEventModalOpen(true);
                      }}
                      className="p-1 text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteTarget({ collection: "events", id: evt.id, name: evt.title })
                      }
                      className="p-1 text-muted-foreground hover:text-rose-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{evt.description}</p>
                <div className="flex flex-col space-y-1 text-xs font-semibold text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>
                      Prize: <strong className="text-rose-500">{evt.reward}</strong>
                    </span>
                    <span>
                      Slots: {evt.registeredCount}/{evt.maxSlots}
                    </span>
                  </div>
                  {evt.endsAt && (
                    <p className="text-[11px] text-muted-foreground">
                      Ends:{" "}
                      <span className="font-mono text-foreground">
                        {new Date(evt.endsAt).toLocaleString()}
                      </span>
                    </p>
                  )}
                  {evt.winnerName && (
                    <p className="text-[11px] font-bold text-emerald-400">
                      🏆 Winner: {evt.winnerName}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      evt.status === "live"
                        ? "bg-emerald-500/15 text-emerald-500"
                        : evt.status === "past" || evt.winnerName
                          ? "bg-muted text-muted-foreground"
                          : "bg-rose-500/15 text-rose-500"
                    }`}
                  >
                    {evt.winnerName ? "COMPLETED" : (evt.status || "UPCOMING").toUpperCase()}
                  </span>

                  <button
                    onClick={async () => {
                      if (!confirm(`Draw a random winner for "${evt.title}" right now?`)) return;
                      const ann = await EventLifecycleService.selectRandomWinner(evt);
                      if (ann) {
                        toast.success(
                          `🏆 Winner Drawn: ${ann.winnerName}! Announcement & claim ticket generated.`,
                        );
                      } else {
                        toast.error("No registered participants found for this event yet.");
                      }
                    }}
                    className="inline-flex items-center space-x-1 rounded-xl bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-[11px] font-bold text-amber-400 hover:bg-amber-500/25"
                  >
                    <Gift className="h-3.5 w-3.5" />
                    <span>Pick Winner Now</span>
                  </button>
                </div>
              </div>
            ))}
            {eventsList.length === 0 && (
              <p className="text-xs text-muted-foreground col-span-3">
                No events found. Click Create Event to add one.
              </p>
            )}
          </div>
        </div>
      )}

      {/* EVENT MODAL DIALOG */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setIsEventModalOpen(false)}
          />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-foreground">
                {editingEvent?.id ? "Edit Event" : "Create Community Event"}
              </h3>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEvent} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground">Event Title</label>
                <input
                  type="text"
                  value={editingEvent?.title || ""}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  required
                  placeholder="e.g. Midnight Valorant Tournament #1"
                  className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground">Description</label>
                <textarea
                  value={editingEvent?.description || ""}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Event description, rules, or details..."
                  className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground">
                  Event Duration (Auto-Calculates End Time)
                </label>
                <select
                  value={editingEvent?.durationHours || 24}
                  onChange={(e) => {
                    const hours = Number(e.target.value);
                    const startIso = editingEvent?.startsAt || new Date().toISOString();
                    const endIso = new Date(new Date(startIso).getTime() + hours * 3600 * 1000).toISOString();
                    setEditingEvent({
                      ...editingEvent,
                      durationHours: hours,
                      durationLabel: `${hours} Hour${hours === 1 ? "" : "s"}`,
                      endsAt: endIso,
                    });
                  }}
                  className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground"
                >
                  <option value={1}>1 Hour</option>
                  <option value={6}>6 Hours</option>
                  <option value={12}>12 Hours</option>
                  <option value={24}>24 Hours (Default)</option>
                  <option value={48}>48 Hours (2 Days)</option>
                  <option value={72}>72 Hours (3 Days)</option>
                  <option value={168}>7 Days (1 Week)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground">
                    Event Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={toLocalDateTimeInputString(editingEvent?.startsAt)}
                    onChange={(e) => {
                      const iso = fromLocalDateTimeInputString(e.target.value);
                      const hours = editingEvent?.durationHours || 24;
                      const endIso = new Date(new Date(iso).getTime() + hours * 3600 * 1000).toISOString();
                      setEditingEvent({
                        ...editingEvent,
                        startsAt: iso,
                        endsAt: endIso,
                      });
                    }}
                    className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground">
                    Event End Time (Auto-Calculated)
                  </label>
                  <input
                    type="datetime-local"
                    value={toLocalDateTimeInputString(editingEvent?.endsAt)}
                    onChange={(e) => {
                      const iso = fromLocalDateTimeInputString(e.target.value);
                      setEditingEvent({
                        ...editingEvent,
                        endsAt: iso,
                      });
                    }}
                    className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3">
                <input
                  type="checkbox"
                  id="autoSelectWinner"
                  checked={editingEvent?.autoSelectWinner !== false}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, autoSelectWinner: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-rose-500 text-rose-500 focus:ring-rose-500"
                />
                <label
                  htmlFor="autoSelectWinner"
                  className="text-xs text-foreground font-semibold cursor-pointer"
                >
                  ⚡ Auto-Pick & Announce Winner when Event Ends
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground">Reward Detail</label>
                  <input
                    type="text"
                    value={editingEvent?.reward ?? ""}
                    onChange={(e) => setEditingEvent({ ...editingEvent, reward: e.target.value })}
                    placeholder="e.g. ₹1,000 + Champion Role / Discord VIP"
                    className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground">
                    Max Participant Slots
                  </label>
                  <input
                    type="number"
                    value={editingEvent?.maxSlots || 50}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, maxSlots: Number(e.target.value) })
                    }
                    className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground"
                  />
                </div>
              </div>
              <CustomImageUploader
                bucket="events"
                folderPath="banners"
                currentImageUrl={editingEvent?.bannerUrl}
                onUploadSuccess={(url) => setEditingEvent({ ...editingEvent, bannerUrl: url })}
                label="Event Banner Image"
              />
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white hover:bg-rose-600"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: PAYOUTS & WINNERS CMS */}
      {activeTab === "payouts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-foreground">
              Verified Winners & Payout Proof CMS
            </h3>
            <button
              onClick={() => {
                setEditingPayout({
                  name: "",
                  handle: "",
                  amount: "₹1,000",
                  reason: "Event Winner",
                  paidAt: new Date().toISOString().split("T")[0],
                  proofImageUrl: "",
                });
                setIsPayoutModalOpen(true);
              }}
              className="inline-flex items-center space-x-1.5 rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white hover:bg-rose-600"
            >
              <Plus className="h-4 w-4" />
              <span>Add Verified Winner & Proof</span>
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {winnersList.map((w) => (
              <div key={w.id} className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-foreground text-sm">{w.name}</h4>
                    <p className="text-[11px] text-muted-foreground">{w.handle}</p>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => {
                        setEditingPayout(w);
                        setIsPayoutModalOpen(true);
                      }}
                      className="p-1 text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteTarget({ collection: "payouts", id: w.id, name: w.name })
                      }
                      className="p-1 text-muted-foreground hover:text-rose-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="text-xs space-y-1">
                  <p>
                    <span className="text-muted-foreground">Prize:</span>{" "}
                    <span className="font-bold text-rose-500">{w.amount}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Reason:</span>{" "}
                    <span className="font-semibold text-foreground">{w.reason}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Date:</span>{" "}
                    <span className="font-semibold text-foreground">{w.paidAt}</span>
                  </p>
                </div>
                {w.proofImageUrl && (
                  <img
                    src={w.proofImageUrl}
                    alt="Proof"
                    className="h-20 w-full rounded-xl object-cover border border-border/40"
                  />
                )}
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

      {/* PAYOUT MODAL DIALOG */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setIsPayoutModalOpen(false)}
          />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-foreground">
                {editingPayout?.id ? "Edit Winner Record" : "Add Verified Winner & Proof"}
              </h3>
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSavePayout} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground">Winner Name</label>
                  <input
                    type="text"
                    value={editingPayout?.name || ""}
                    onChange={(e) => setEditingPayout({ ...editingPayout, name: e.target.value })}
                    required
                    className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground">Discord Handle</label>
                  <input
                    type="text"
                    value={editingPayout?.handle || ""}
                    onChange={(e) => setEditingPayout({ ...editingPayout, handle: e.target.value })}
                    placeholder="@username"
                    className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground">Prize Amount</label>
                  <input
                    type="text"
                    value={editingPayout?.amount || "₹1,000"}
                    onChange={(e) => setEditingPayout({ ...editingPayout, amount: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground">Payment Date</label>
                  <input
                    type="date"
                    value={editingPayout?.paidAt || new Date().toISOString().split("T")[0]}
                    onChange={(e) => setEditingPayout({ ...editingPayout, paidAt: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground">
                  Event Name / Reason
                </label>
                <input
                  type="text"
                  value={editingPayout?.reason || "Event Winner"}
                  onChange={(e) => setEditingPayout({ ...editingPayout, reason: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground"
                />
              </div>
              <CustomImageUploader
                bucket="proofs"
                folderPath="receipts"
                currentImageUrl={editingPayout?.proofImageUrl}
                onUploadSuccess={(url) =>
                  setEditingPayout({ ...editingPayout, proofImageUrl: url })
                }
                label="Transaction Proof Screenshot"
              />
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white hover:bg-rose-600"
                >
                  Save Winner & Proof
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: STAFF CMS */}
      {activeTab === "staff" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-foreground">Staff Roster CMS</h3>
            <button
              onClick={() => {
                setEditingStaff({
                  name: "",
                  handle: "",
                  role: "",
                  rank: "moderator",
                  presence: "online",
                  bio: "",
                  avatarUrl: "",
                });
                setIsStaffModalOpen(true);
              }}
              className="inline-flex items-center space-x-1.5 rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white hover:bg-rose-600"
            >
              <Plus className="h-4 w-4" />
              <span>Add Staff Member</span>
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {staffList.map((s) => (
              <div key={s.id} className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={
                        s.avatarUrl ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                      }
                      alt={s.name}
                      className="h-10 w-10 rounded-full object-cover border border-border"
                    />
                    <div>
                      <h4 className="font-bold text-foreground text-sm">{s.name}</h4>
                      {s.handle && (
                        <p className="text-[11px] font-mono font-semibold text-rose-500/90">
                          {s.handle.startsWith("@") ? s.handle : `@${s.handle}`}
                        </p>
                      )}
                      <p className="text-[11px] text-muted-foreground">
                        {s.role || "No Role"} ({s.rank})
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => {
                        setEditingStaff(s);
                        setIsStaffModalOpen(true);
                      }}
                      className="p-1 text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteTarget({ collection: "staff", id: s.id, name: s.name })
                      }
                      className="p-1 text-muted-foreground hover:text-rose-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {s.bio && <p className="text-xs text-muted-foreground line-clamp-2">{s.bio}</p>}
              </div>
            ))}
            {staffList.length === 0 && (
              <p className="text-xs text-muted-foreground col-span-3">No staff members found.</p>
            )}
          </div>
        </div>
      )}

      {/* STAFF MODAL DIALOG */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setIsStaffModalOpen(false)}
          />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-foreground">
                {editingStaff?.id ? "Edit Staff Member" : "Add Staff Member"}
              </h3>
              <button
                onClick={() => setIsStaffModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveStaff} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground">Full Name</label>
                  <input
                    type="text"
                    value={editingStaff?.name || ""}
                    onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                    required
                    placeholder="e.g. Nyx"
                    className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground">
                    Username / Handle
                  </label>
                  <input
                    type="text"
                    value={editingStaff?.handle || ""}
                    onChange={(e) => setEditingStaff({ ...editingStaff, handle: e.target.value })}
                    placeholder="e.g. @nyx_str"
                    className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground">
                    Custom Role / Title
                  </label>
                  <input
                    type="text"
                    value={editingStaff?.role || ""}
                    onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value })}
                    placeholder="e.g. Founder & Lead Curator"
                    className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground">Rank Category</label>
                  <select
                    value={editingStaff?.rank || "moderator"}
                    onChange={(e) =>
                      setEditingStaff({
                        ...editingStaff,
                        rank: e.target.value as StaffMember["rank"],
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground"
                  >
                    <option value="owner">Owner</option>
                    <option value="co-owner">Co-Owner</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                    <option value="helper">Helper</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground">Status / Presence</label>
                <select
                  value={editingStaff?.presence || "online"}
                  onChange={(e) =>
                    setEditingStaff({
                      ...editingStaff,
                      presence: e.target.value as StaffMember["presence"],
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground"
                >
                  <option value="online">Online</option>
                  <option value="idle">Idle</option>
                  <option value="dnd">Do Not Disturb</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground">Bio / Description</label>
                <textarea
                  value={editingStaff?.bio || ""}
                  onChange={(e) => setEditingStaff({ ...editingStaff, bio: e.target.value })}
                  rows={2}
                  placeholder="Short bio describing staff duties..."
                  className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground placeholder:text-muted-foreground/60"
                />
              </div>

              <CustomImageUploader
                bucket="staff"
                folderPath="avatars"
                currentImageUrl={editingStaff?.avatarUrl}
                onUploadSuccess={(url) => setEditingStaff({ ...editingStaff, avatarUrl: url })}
                label="Staff Avatar Image"
              />

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white hover:bg-rose-600"
                >
                  Save Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 5: GALLERY CMS */}
      {activeTab === "gallery" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-foreground">Media Gallery CMS</h3>
            <button
              onClick={() => {
                setEditingGallery({
                  src: "",
                  caption: "",
                  category: "Community",
                  span: "col-span-1",
                });
                setIsGalleryModalOpen(true);
              }}
              className="inline-flex items-center space-x-1.5 rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white hover:bg-rose-600"
            >
              <Plus className="h-4 w-4" />
              <span>Upload Gallery Image</span>
            </button>
          </div>

          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {galleryList.map((g) => (
              <div
                key={g.id}
                className="relative aspect-video rounded-2xl overflow-hidden border border-border group"
              >
                <img
                  src={g.src}
                  alt={g.caption || "Gallery"}
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() =>
                    setDeleteTarget({
                      collection: "gallery",
                      id: g.id,
                      name: g.caption || "Gallery Item",
                    })
                  }
                  className="absolute top-2 right-2 rounded-lg bg-black/70 p-1.5 text-white hover:bg-rose-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {galleryList.length === 0 && (
              <p className="text-xs text-muted-foreground col-span-4">No gallery items found.</p>
            )}
          </div>
        </div>
      )}

      {/* GALLERY MODAL DIALOG */}
      {isGalleryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setIsGalleryModalOpen(false)}
          />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-foreground">
                Upload Media Gallery Image
              </h3>
              <button
                onClick={() => setIsGalleryModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveGallery} className="mt-4 space-y-4">
              <CustomImageUploader
                bucket="gallery"
                folderPath="photos"
                currentImageUrl={editingGallery?.src}
                onUploadSuccess={(url) => setEditingGallery({ ...editingGallery, src: url })}
                label="Gallery Image File"
              />
              <div>
                <label className="block text-xs font-bold text-foreground">Alt Text (for accessibility)</label>
                <input
                  type="text"
                  value={editingGallery?.alt || ""}
                  onChange={(e) =>
                    setEditingGallery({ ...editingGallery, alt: e.target.value })
                  }
                  placeholder="Describe the image"
                  className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground">Caption</label>
                <input
                  type="text"
                  value={editingGallery?.caption || ""}
                  onChange={(e) =>
                    setEditingGallery({ ...editingGallery, caption: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGalleryModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white hover:bg-rose-600"
                >
                  Save to Gallery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* TAB 6: REWARD CLAIMS MANAGER */}
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
                className="rounded-2xl border border-border/60 bg-card p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-foreground text-sm">{claim.winnerName}</h4>
                    <p className="text-[11px] text-muted-foreground">{claim.discordId}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                      claim.status === "completed"
                        ? "bg-emerald-500/15 text-emerald-500"
                        : claim.status === "processing"
                          ? "bg-amber-500/15 text-amber-500"
                          : "bg-rose-500/15 text-rose-500"
                    }`}
                  >
                    {claim.status.toUpperCase()}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <p>
                    <span className="text-muted-foreground">Event:</span>{" "}
                    <span className="font-semibold text-foreground">{claim.eventName}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Prize:</span>{" "}
                    <span className="font-serif font-bold text-rose-500">{claim.prize}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Payment Method:</span>{" "}
                    <span className="font-semibold text-foreground">{claim.paymentMethod}</span>
                  </p>
                  {claim.accountDetails && (
                    <p>
                      <span className="text-muted-foreground">Account Details:</span>{" "}
                      <span className="font-mono text-foreground bg-accent/40 px-2 py-0.5 rounded">
                        {claim.accountDetails}
                      </span>
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border/40">
                  <button
                    onClick={async () => {
                      await updateFirestoreDoc("rewardClaims", claim.id, {
                        status: "completed",
                        updatedAt: new Date().toISOString(),
                      });
                      await addFirestoreDoc("payouts", {
                        name: claim.winnerName,
                        handle: claim.discordId,
                        amount: claim.prize,
                        reason: claim.eventName,
                        paidAt: new Date().toISOString().split("T")[0],
                        proofImageUrl: claim.proofImageUrl || "",
                        createdAt: new Date().toISOString(),
                      });
                      logAuditAction(
                        `Completed Payout Claim for ${claim.winnerName}`,
                        "rewardClaims",
                        claim.id,
                      );
                      toast.success(`Completed payout claim for ${claim.winnerName}!`);
                    }}
                    className="rounded-xl bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-600"
                  >
                    Process & Complete Payout
                  </button>
                </div>
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

      {/* TAB 7: PARTNERS CMS */}
      {activeTab === "partners" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-foreground">Affiliate Partners CMS</h3>
            <button
              onClick={() => {
                setEditingPartner({
                  name: "",
                  category: "Community",
                  description: "",
                  memberCount: 500,
                  logoUrl: "",
                  href: "#",
                });
                setIsPartnerModalOpen(true);
              }}
              className="inline-flex items-center space-x-1.5 rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white hover:bg-rose-600"
            >
              <Plus className="h-4 w-4" />
              <span>Add Partner</span>
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {partnersList.map((p) => (
              <div key={p.id} className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {p.logoUrl ? (
                      <img
                        src={p.logoUrl}
                        alt={p.name}
                        className="h-10 w-10 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-rose-500/15 font-bold text-rose-500 text-xs">
                        {p.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-foreground text-sm">{p.name}</h4>
                      <p className="text-[11px] text-muted-foreground">
                        {p.category} • {p.memberCount} members
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => {
                        setEditingPartner(p);
                        setIsPartnerModalOpen(true);
                      }}
                      className="p-1 text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteTarget({ collection: "partners", id: p.id, name: p.name })
                      }
                      className="p-1 text-muted-foreground hover:text-rose-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
              </div>
            ))}
            {partnersList.length === 0 && (
              <p className="text-xs text-muted-foreground col-span-3">No partners found.</p>
            )}
          </div>
        </div>
      )}

      {/* PARTNER MODAL DIALOG */}
      {isPartnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setIsPartnerModalOpen(false)}
          />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-foreground">
                {editingPartner?.id ? "Edit Partner" : "Add Partner"}
              </h3>
              <button
                onClick={() => setIsPartnerModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSavePartner} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground">Partner Name</label>
                  <input
                    type="text"
                    value={editingPartner?.name || ""}
                    onChange={(e) => setEditingPartner({ ...editingPartner, name: e.target.value })}
                    required
                    className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground">Category</label>
                  <input
                    type="text"
                    value={editingPartner?.category || "Community"}
                    onChange={(e) =>
                      setEditingPartner({ ...editingPartner, category: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground">Description</label>
                <textarea
                  value={editingPartner?.description || ""}
                  onChange={(e) =>
                    setEditingPartner({ ...editingPartner, description: e.target.value })
                  }
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground">Member Count</label>
                  <input
                    type="number"
                    value={editingPartner?.memberCount || 500}
                    onChange={(e) =>
                      setEditingPartner({ ...editingPartner, memberCount: Number(e.target.value) })
                    }
                    className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground">
                    Website / Discord URL
                  </label>
                  <input
                    type="text"
                    value={editingPartner?.href || "#"}
                    onChange={(e) => setEditingPartner({ ...editingPartner, href: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground"
                  />
                </div>
              </div>
              <CustomImageUploader
                bucket="partners"
                folderPath="logos"
                currentImageUrl={editingPartner?.logoUrl}
                onUploadSuccess={(url) => setEditingPartner({ ...editingPartner, logoUrl: url })}
                label="Partner Logo Image"
              />
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPartnerModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white hover:bg-rose-600"
                >
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 8: REVIEWS MODERATION CMS */}
      {activeTab === "reviews" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-foreground">
              Reviews Moderation Queue
            </h3>
            <button
              onClick={() => {
                setEditingReview({
                  name: "",
                  handle: "",
                  quote: "",
                  rating: 5,
                  approved: true,
                  isVerified: true,
                  imageUrl: "",
                });
                setIsReviewModalOpen(true);
              }}
              className="inline-flex items-center space-x-1.5 rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white hover:bg-rose-600"
            >
              <Plus className="h-4 w-4" />
              <span>Add Member Review</span>
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reviewsList.map((r) => (
              <div key={r.id} className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={
                        r.imageUrl ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                      }
                      alt={r.name}
                      className="h-10 w-10 rounded-full object-cover border border-border"
                    />
                    <div>
                      <h4 className="font-bold text-foreground text-sm">{r.name}</h4>
                      <p className="text-[11px] text-muted-foreground">{r.handle}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => {
                        setEditingReview(r);
                        setIsReviewModalOpen(true);
                      }}
                      className="p-1 text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteTarget({ collection: "reviews", id: r.id, name: r.name })
                      }
                      className="p-1 text-muted-foreground hover:text-rose-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground italic">"{r.quote}"</p>
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <span className="text-xs text-amber-400 font-bold">
                    {"★".repeat(r.rating || 5)}
                  </span>
                  <button
                    onClick={async () => {
                      await updateFirestoreDoc("reviews", r.id, { approved: !r.approved });
                      toast.success(`Toggled approval for ${r.name}`);
                    }}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${r.approved !== false ? "bg-emerald-500/15 text-emerald-500" : "bg-rose-500/15 text-rose-500"}`}
                  >
                    {r.approved !== false ? "APPROVED" : "PENDING"}
                  </button>
                </div>
              </div>
            ))}
            {reviewsList.length === 0 && (
              <p className="text-xs text-muted-foreground col-span-3">No member reviews found.</p>
            )}
          </div>
        </div>
      )}

      {/* REVIEW MODAL DIALOG */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setIsReviewModalOpen(false)}
          />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-foreground">
                {editingReview?.id ? "Edit Review" : "Add Member Review"}
              </h3>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveReview} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground">Member Name</label>
                  <input
                    type="text"
                    value={editingReview?.name || ""}
                    onChange={(e) => setEditingReview({ ...editingReview, name: e.target.value })}
                    required
                    className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground">Discord Handle</label>
                  <input
                    type="text"
                    value={editingReview?.handle || ""}
                    onChange={(e) => setEditingReview({ ...editingReview, handle: e.target.value })}
                    placeholder="@handle"
                    className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground">Review Quote</label>
                <textarea
                  value={editingReview?.quote || ""}
                  onChange={(e) => setEditingReview({ ...editingReview, quote: e.target.value })}
                  rows={3}
                  required
                  className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground"
                />
              </div>
              <CustomImageUploader
                bucket="gallery"
                folderPath="reviews"
                currentImageUrl={editingReview?.imageUrl}
                onUploadSuccess={(url) => setEditingReview({ ...editingReview, imageUrl: url })}
                label="Reviewer Avatar Image"
              />
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white hover:bg-rose-600"
                >
                  Save Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 9: ANNOUNCEMENTS SYSTEM CMS */}
      {activeTab === "announcements" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-foreground">Announcement System</h3>
            <button
              onClick={() => {
                setEditingAnnouncement({
                  title: "",
                  description: "",
                  type: "banner",
                  priority: "high",
                  visible: true,
                  targetAudience: "all",
                });
                setIsAnnouncementModalOpen(true);
              }}
              className="inline-flex items-center space-x-1.5 rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white hover:bg-rose-600"
            >
              <Plus className="h-4 w-4" />
              <span>Create Announcement</span>
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {announcements.map((anc) => (
              <div
                key={anc.id}
                className="rounded-2xl border border-border/60 bg-card p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-base font-bold text-foreground">{anc.title}</h4>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => {
                        setEditingAnnouncement(anc);
                        setIsAnnouncementModalOpen(true);
                      }}
                      className="p-1 text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteTarget({
                          collection: "announcements",
                          id: anc.id,
                          name: anc.title,
                        })
                      }
                      className="p-1 text-muted-foreground hover:text-rose-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{anc.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <span className="text-[11px] font-bold text-rose-500 uppercase">
                    {anc.type} • {anc.priority}
                  </span>
                  <button
                    onClick={async () => {
                      await updateFirestoreDoc("announcements", anc.id, { visible: !anc.visible });
                      toast.success(`Toggled visibility for ${anc.title}`);
                    }}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${anc.visible !== false ? "bg-emerald-500/15 text-emerald-500" : "bg-muted text-muted-foreground"}`}
                  >
                    {anc.visible !== false ? "VISIBLE" : "HIDDEN"}
                  </button>
                </div>
              </div>
            ))}
            {announcements.length === 0 && (
              <p className="text-xs text-muted-foreground col-span-2">No announcements found.</p>
            )}
          </div>
        </div>
      )}

      {/* ANNOUNCEMENT MODAL DIALOG */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => setIsAnnouncementModalOpen(false)}
          />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-foreground">
                {editingAnnouncement?.id ? "Edit Announcement" : "Create Announcement"}
              </h3>
              <button
                onClick={() => setIsAnnouncementModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveAnnouncement} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground">
                  Announcement Title
                </label>
                <input
                  type="text"
                  value={editingAnnouncement?.title || ""}
                  onChange={(e) =>
                    setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })
                  }
                  required
                  className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground">Description</label>
                <textarea
                  value={editingAnnouncement?.description || ""}
                  onChange={(e) =>
                    setEditingAnnouncement({ ...editingAnnouncement, description: e.target.value })
                  }
                  rows={3}
                  required
                  className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground">Type</label>
                  <select
                    value={editingAnnouncement?.type || "banner"}
                    onChange={(e) =>
                      setEditingAnnouncement({
                        ...editingAnnouncement,
                        type: e.target.value as Announcement["type"],
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground"
                  >
                    <option value="banner">Banner</option>
                    <option value="popup">Popup</option>
                    <option value="ribbon">Ribbon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground">Priority</label>
                  <select
                    value={editingAnnouncement?.priority || "high"}
                    onChange={(e) =>
                      setEditingAnnouncement({
                        ...editingAnnouncement,
                        priority: e.target.value as Announcement["priority"],
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground"
                  >
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAnnouncementModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white hover:bg-rose-600"
                >
                  Save Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 10: HOMEPAGE CMS */}
      {activeTab === "homepage" && (
        <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-xs space-y-6">
          <h3 className="font-serif text-xl font-bold text-foreground">
            Homepage & Hero Customizer
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-foreground">Hero Title</label>
              <input
                type="text"
                value={settings.heroTitle}
                onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground">Community Notice</label>
              <input
                type="text"
                value={settings.communityNotice}
                onChange={(e) => setSettings({ ...settings, communityNotice: e.target.value })}
                className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground">Live Member Count</label>
              <input
                type="number"
                value={settings.liveMemberCount}
                onChange={(e) =>
                  setSettings({ ...settings, liveMemberCount: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground">Active Voice Count</label>
              <input
                type="number"
                value={settings.activeVcCount}
                onChange={(e) =>
                  setSettings({ ...settings, activeVcCount: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-xl border border-border bg-accent/30 px-3 py-2 text-xs font-semibold text-foreground"
              />
            </div>
          </div>
          <button
            onClick={async () => {
              await updateFirestoreDoc("settings", "global", settings);
              logAuditAction("Updated Homepage CMS", "settings", "global");
              toast.success("Saved Homepage Customizer Settings!");
            }}
            className="rounded-xl bg-rose-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-rose-600"
          >
            Save Homepage Settings
          </button>
        </div>
      )}

      {/* TAB 11: GLOBAL SETTINGS & FEATURE TOGGLES */}
      {activeTab === "settings" && (
        <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-xs space-y-6">
          <h3 className="font-serif text-xl font-bold text-foreground">
            Global Settings & Feature Toggles
          </h3>
          <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-5 space-y-2">
            <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider">
              Deep X Support Guild Integration
            </h4>
            <p className="text-xs text-muted-foreground">
              Configure the Discord Server Guild ID where support tickets are created for event winners.
            </p>
            <div className="pt-2">
              <label className="block text-xs font-bold text-foreground">Discord Guild ID</label>
              <input
                type="text"
                value={settings.discordGuildId || "1346519672688087093"}
                onChange={(e) => setSettings({ ...settings, discordGuildId: e.target.value })}
                placeholder="e.g. 1346519672688087093"
                className="mt-1 w-full max-w-md rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground"
              />
            </div>
            <button
              onClick={async () => {
                if (typeof window !== "undefined") {
                  window.localStorage.setItem("lovepixels_discord_guild_id", settings.discordGuildId || "");
                }
                await updateFirestoreDoc("settings", "global", settings);
                logAuditAction("Updated Deep X Guild Settings", "settings", "global");
                toast.success("Saved Guild ID Settings!");
              }}
              className="mt-2 inline-flex items-center rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400"
            >
              Save Guild ID Setting
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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
                desc: "Allow community submissions to gallery",
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
                      toast.success(`Updated ${item.label}`);
                    }}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                      currentVal ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
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

      {/* TAB 12: AUDIT & VISITOR ANALYTICS LOGS */}
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
                  exportToCSV("visitor_logs", visitorLogs as unknown as Record<string, unknown>[])
                }
                className="inline-flex items-center space-x-1 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Visitor CSV</span>
              </button>
            </div>
          </div>

          <div className="glass overflow-hidden rounded-3xl p-4">
            <h4 className="font-serif text-base font-bold text-foreground mb-3">
              Recent Audit Actions
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/40 text-muted-foreground">
                    <th className="py-2">Action</th>
                    <th className="py-2">Target</th>
                    <th className="py-2">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.slice(0, 10).map((log, idx) => (
                    <tr key={idx} className="border-b border-border/20 text-foreground">
                      <td className="py-2.5 font-semibold">{log.action}</td>
                      <td className="py-2.5 text-muted-foreground">{log.targetCollection}</td>
                      <td className="py-2.5 text-muted-foreground">{log.timestamp}</td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-4 text-muted-foreground text-center">
                        No audit logs recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
        </div>
      </main>
    </div>
  );
}
