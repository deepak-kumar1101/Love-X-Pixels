import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  Calendar,
  Users,
  ImageIcon,
  Trophy,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  communityEvents,
  staffMembers,
  galleryItems,
  payoutWinners,
  payoutReviews,
} from "@/content/placeholders";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredEvents = communityEvents.filter(
    (e) =>
      e.title.toLowerCase().includes(query.toLowerCase()) ||
      e.description.toLowerCase().includes(query.toLowerCase()),
  );

  const filteredStaff = staffMembers.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.role.toLowerCase().includes(query.toLowerCase()),
  );

  const filteredGallery = galleryItems.filter((g) =>
    (g.caption || g.alt).toLowerCase().includes(query.toLowerCase()),
  );

  const filteredWinners = payoutWinners.filter(
    (w) =>
      w.name.toLowerCase().includes(query.toLowerCase()) ||
      w.reason.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-2xl rounded-3xl border border-rose-200/50 bg-background/95 p-6 shadow-2xl backdrop-blur-xl dark:border-rose-900/40 dark:bg-zinc-900/95">
        <div className="flex items-center space-x-3 border-b border-border/50 pb-4">
          <Search className="h-5 w-5 text-rose-500" />
          <input
            type="text"
            autoFocus
            placeholder="Search events, staff, gallery, winners, reviews..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-base text-foreground outline-hidden placeholder:text-muted-foreground"
          />
          <button
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 max-h-96 overflow-y-auto space-y-4 pr-1">
          {query.trim() === "" ? (
            <p className="text-center text-xs text-muted-foreground py-6">
              Type to search across LovePixels events, staff roster, payouts, gallery, and reviews.
            </p>
          ) : (
            <>
              {filteredEvents.length > 0 && (
                <div>
                  <h4 className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-rose-500">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Events ({filteredEvents.length})</span>
                  </h4>
                  <div className="mt-2 space-y-1">
                    {filteredEvents.map((evt) => (
                      <Link
                        key={evt.id}
                        to="/events"
                        onClick={onClose}
                        className="flex items-center justify-between rounded-xl p-2.5 text-xs text-foreground hover:bg-rose-500/10"
                      >
                        <span className="font-semibold">{evt.title}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {filteredStaff.length > 0 && (
                <div>
                  <h4 className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-purple-500">
                    <Users className="h-3.5 w-3.5" />
                    <span>Staff Team ({filteredStaff.length})</span>
                  </h4>
                  <div className="mt-2 space-y-1">
                    {filteredStaff.map((st) => (
                      <Link
                        key={st.id}
                        to="/staff"
                        onClick={onClose}
                        className="flex items-center justify-between rounded-xl p-2.5 text-xs text-foreground hover:bg-purple-500/10"
                      >
                        <span className="font-semibold">
                          {st.name} ({st.role})
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {filteredWinners.length > 0 && (
                <div>
                  <h4 className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-500">
                    <Trophy className="h-3.5 w-3.5" />
                    <span>Winners ({filteredWinners.length})</span>
                  </h4>
                  <div className="mt-2 space-y-1">
                    {filteredWinners.map((win) => (
                      <Link
                        key={win.id}
                        to="/payouts"
                        onClick={onClose}
                        className="flex items-center justify-between rounded-xl p-2.5 text-xs text-foreground hover:bg-amber-500/10"
                      >
                        <span className="font-semibold">
                          {win.name} - {win.amount}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
