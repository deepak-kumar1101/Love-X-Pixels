import React, { useEffect, useState } from "react";
import { Bell, X, Check, Trophy, Calendar, Sparkles, HeartHandshake } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { NotificationService, type AppNotification } from "@/services/notification.service";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const unsub = NotificationService.subscribeNotifications(setNotifications);
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm border-l border-rose-200/50 bg-background/95 p-6 shadow-2xl backdrop-blur-xl dark:border-rose-900/40 dark:bg-zinc-900/95">
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-rose-500" />
          <h3 className="font-serif text-lg font-bold text-foreground">Community Alerts</h3>
        </div>
        <div className="flex items-center space-x-2">
          {notifications.length > 0 && (
            <button
              onClick={() => setNotifications([])}
              className="text-xs text-muted-foreground hover:text-rose-500"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-3 max-h-[calc(100vh-120px)] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-xs">
            <Bell className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-2 font-medium">No new notifications</p>
            <p className="mt-1 text-[11px] text-muted-foreground/70">You're all caught up for today!</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className="rounded-2xl border border-border/60 bg-card p-4 transition-all hover:border-rose-400/40"
            >
              <div className="flex items-start justify-between">
                <h4 className="text-xs font-bold text-foreground">{notif.title}</h4>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(notif.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{notif.message}</p>
              {notif.link && (
                <Link
                  to={notif.link}
                  onClick={onClose}
                  className="mt-2.5 inline-block text-[11px] font-semibold text-rose-500 hover:underline"
                >
                  View Details →
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
