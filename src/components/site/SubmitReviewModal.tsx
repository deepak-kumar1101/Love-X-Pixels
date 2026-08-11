import React, { useState } from "react";
import { Star, X, Send, CheckCircle2 } from "lucide-react";
import { addFirestoreDoc } from "@/lib/firebase";

interface SubmitReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubmitReviewModal: React.FC<SubmitReviewModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [role, setRole] = useState("Community Member");
  const [payoutLabel, setPayoutLabel] = useState("₹500 Winner");
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !quote.trim()) return;

    setIsSubmitting(true);
    try {
      await addFirestoreDoc("reviews", {
        name: name.trim(),
        handle: handle.trim() ? (handle.startsWith("@") ? handle : `@${handle}`) : "@member",
        role: role.trim() || "Community Member",
        payoutLabel: payoutLabel.trim() || "Event Winner",
        quote: quote.trim(),
        rating,
        approved: false, // Requires admin approval
        createdAt: new Date().toISOString(),
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
        setName("");
        setQuote("");
      }, 2200);
    } catch (err) {
      console.error("Error submitting review:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-lg rounded-3xl border border-rose-200/50 bg-background/95 p-6 shadow-2xl backdrop-blur-xl dark:border-rose-900/40 dark:bg-zinc-900/95 sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/15 text-rose-500">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="mt-4 font-serif text-2xl font-bold text-foreground">
              Review Submitted!
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Thank you for sharing your feedback! Your review has been sent to our moderators for
              verification.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-left">
              <h3 className="font-serif text-2xl font-bold tracking-tight text-foreground">
                Submit Member Review
              </h3>
              <p className="text-xs text-muted-foreground">
                Share your experience receiving rewards or participating in LovePixels events.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground">Rating</label>
              <div className="mt-1 flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        (hoverRating || rating) >= star
                          ? "fill-amber-400 text-amber-400"
                          : "text-rose-200 dark:text-rose-900"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aurelia"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm text-foreground shadow-xs outline-hidden focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Discord Handle
                </label>
                <input
                  type="text"
                  placeholder="@username"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm text-foreground shadow-xs outline-hidden focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Community Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. Salons Regular"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm text-foreground shadow-xs outline-hidden focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Prize / Reward Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. ₹1,000 Event Prize"
                  value={payoutLabel}
                  onChange={(e) => setPayoutLabel(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm text-foreground shadow-xs outline-hidden focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground">
                Your Review / Experience *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Tell us how your experience was with LovePixels payouts or events..."
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                className="mt-1 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm text-foreground shadow-xs outline-hidden focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-2.5 font-medium text-white shadow-md transition-all hover:opacity-90 active:scale-98 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>{isSubmitting ? "Submitting..." : "Submit for Approval"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
