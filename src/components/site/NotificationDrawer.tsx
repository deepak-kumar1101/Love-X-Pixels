import React, { useEffect, useState } from "react";
import { Bell, X, Check, Trophy, Calendar, Sparkles, HeartHandshake, Ticket, Gift, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { NotificationService, type AppNotification } from "@/services/notification.service";
import { DeepXSupportService } from "@/services/deepx-support.service";
import { useAuth } from "@/hooks/useAuth";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { user, userProfile } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = NotificationService.subscribeNotifications(setNotifications);
    return () => unsub();
  }, []);

  const handleClearAll = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    NotificationService.clearNotifications();
    setNotifications([]);
    toast.success("Cleared notifications!");
  };

  const handleCloseDrawer = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onClose();
  };

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    NotificationService.dismissNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClaimRewardTicket = async (notif: AppNotification) => {
    const authenticatedDiscordUserId = user?.id || user?.uid || userProfile?.discordId;
    if (!authenticatedDiscordUserId) {
      toast.error("Please sign in with Discord to claim event rewards.");
      return;
    }

    const winnerDiscordId = (notif as any).winnerDiscordId || authenticatedDiscordUserId;
    if (authenticatedDiscordUserId !== winnerDiscordId) {
      toast.error("Unauthorized: You are not the winner of this event.");
      return;
    }

    const winnerUsername = (notif as any).winnerName || userProfile?.displayName || userProfile?.username || user?.email?.split("@")[0] || "Winner";
    const eventId = (notif as any).eventId || `event_${Date.now()}`;
    const eventName = (notif as any).eventName || (notif.message.includes("in ") ? notif.message.split("in ")[1]?.split(".")[0] : notif.title) || "Community Event";
    const prize = (notif as any).prize || (notif.message.includes("won ") ? notif.message.split("won ")[1]?.split(" in")[0] : "₹1,000") || "Community Reward";

    setClaimingId(notif.id);
    try {
      const res = await DeepXSupportService.createRewardTicket({
        eventId,
        eventName,
        winnerDiscordId,
        authenticatedUserId: authenticatedDiscordUserId,
        winnerUsername,
        prize,
        claimType: "Event Reward",
        timestamp: new Date().toISOString(),
      });

      if (res.success) {
        toast.success(res.message);
      } else {
        toast.info(res.message);
      }
    } catch (err) {
      console.error("[NotificationDrawer] Error creating ticket:", err);
      toast.error("Failed to create support ticket. Please try again.");
    } finally {
      setClaimingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay for closing drawer when clicking outside */}
      <div
        onClick={onClose}
        onPointerDown={onClose}
        className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 z-[9999] w-full max-w-sm border-l border-rose-200/50 bg-background/95 p-6 shadow-2xl backdrop-blur-xl dark:border-rose-900/40 dark:bg-zinc-900/95 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-border/50 pb-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-rose-500" />
              <h3 className="font-serif text-lg font-bold text-foreground">Community Alerts</h3>
            </div>
            <div className="flex items-center space-x-3">
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  onPointerDown={handleClearAll}
                  className="text-xs font-bold text-rose-500 hover:text-rose-600 cursor-pointer transition-colors px-2 py-1 rounded-md bg-rose-500/10 hover:bg-rose-500/20"
                >
                  Clear All
                </button>
              )}
              <button
                type="button"
                onClick={handleCloseDrawer}
                onPointerDown={handleCloseDrawer}
                className="rounded-full p-2 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer transition-colors"
                aria-label="Close Notification Drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-3 max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground text-xs">
                <Bell className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 font-medium">No new notifications</p>
                <p className="mt-1 text-[11px] text-muted-foreground/70">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isWinnerNotif =
                  notif.type === "winner" ||
                  notif.title.toLowerCase().includes("won") ||
                  notif.message.toLowerCase().includes("won");

                return (
                  <div
                    key={notif.id}
                    className={`relative rounded-2xl border p-4 transition-all ${
                      isWinnerNotif
                        ? "border-amber-400/60 bg-amber-500/10 dark:border-amber-500/40"
                        : "border-border/60 bg-card hover:border-rose-400/40"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => handleDismiss(notif.id, e)}
                      className="absolute top-3 right-3 text-muted-foreground/60 hover:text-foreground p-1 rounded-full cursor-pointer"
                      title="Dismiss notification"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>

                    <div className="flex items-start justify-between pr-5">
                      <div className="flex items-center space-x-1.5">
                        {isWinnerNotif && <Trophy className="h-4 w-4 text-amber-400 shrink-0" />}
                        <h4 className="text-xs font-bold text-foreground">{notif.title}</h4>
                      </div>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground/70">
                      {new Date(notif.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{notif.message}</p>

                    {/* Claim Your Reward Action Button inside Winner Notification */}
                    {isWinnerNotif ? (
                      <button
                        type="button"
                        disabled={claimingId === notif.id}
                        onClick={() => handleClaimRewardTicket(notif)}
                        className="mt-3 inline-flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:scale-[1.02] active:scale-98 disabled:opacity-50 cursor-pointer"
                      >
                        <Ticket className="h-3.5 w-3.5" />
                        <span>{claimingId === notif.id ? "Creating Ticket..." : "Claim Your Reward"}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    ) : notif.link ? (
                      <Link
                        to={notif.link}
                        onClick={onClose}
                        className="mt-2.5 inline-block text-[11px] font-semibold text-rose-500 hover:underline"
                      >
                        View Details →
                      </Link>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
};
