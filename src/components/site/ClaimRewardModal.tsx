import React, { useState } from "react";
import { X, CheckCircle, Ticket } from "lucide-react";
import { toast } from "sonner";
import type { WinnerAnnouncement } from "@/models/event-system.model";
import { addFirestoreDoc, loadLocalItems, saveLocalItems } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

interface ClaimRewardModalProps {
  announcement: WinnerAnnouncement | null;
  isOpen: boolean;
  onClose: () => void;
  onClaimCompleted?: (announcementId: string) => void;
}

export const ClaimRewardModal: React.FC<ClaimRewardModalProps> = ({
  announcement,
  isOpen,
  onClose,
  onClaimCompleted,
}) => {
  const { user, userProfile } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "PayPal" | "Crypto" | "Bank">("UPI");
  const [accountDetails, setAccountDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen || !announcement) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      await addFirestoreDoc("rewardClaims", {
        eventId: announcement.eventId,
        announcementId: announcement.id,
        winnerName: announcement.winnerName,
        discordId: announcement.winnerDiscordId,
        winnerDiscordUserId: announcement.winnerDiscordId,
        eventName: announcement.eventName,
        prize: announcement.prizeWon,
        reason: "Reward Claim Ticket",
        paymentMethod,
        accountDetails,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      // Save claimed announcement ID to local store so popup is permanently hidden for this announcement
      const claimedList = loadLocalItems<string>("claimed_announcements") || [];
      if (!claimedList.includes(announcement.id)) {
        saveLocalItems("claimed_announcements", [...claimedList, announcement.id]);
      }
      if (onClaimCompleted) {
        onClaimCompleted(announcement.id);
      }

      setIsSubmitted(true);
      toast.success("🎉 Reward claim ticket submitted successfully!");
    } catch (err) {
      console.warn("Failed to submit claim ticket:", err);
      toast.error("Failed to submit claim ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    setIsSubmitted(false);
    setAccountDetails("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/65 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-3xl border border-rose-200/50 bg-background/95 p-6 shadow-2xl backdrop-blur-xl dark:border-rose-900/40 dark:bg-zinc-900/95 sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-foreground cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {isSubmitted ? (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="mt-4 font-serif text-2xl font-bold text-foreground">
              Reward Claim Ticket Submitted!
            </h3>
            <p className="mt-2 text-xs text-muted-foreground">
              Your claim ticket for{" "}
              <span className="font-semibold text-foreground">{announcement.prizeWon}</span> has
              been prefilled and sent to LovePixels Staff. Payout will be processed shortly.
            </p>
            <button
              onClick={handleFinish}
              className="mt-6 rounded-xl bg-rose-500 px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:opacity-90 cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-500">
                <Ticket className="h-7 w-7" />
              </div>
              <h3 className="mt-3 font-serif text-2xl font-bold text-foreground">
                Claim Event Reward Ticket
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Ticket details are prefilled automatically for winner verification.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs">
              <div className="rounded-2xl border border-rose-200/50 bg-card p-4 space-y-2 dark:border-rose-900/40">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Winner Name:</span>
                  <span className="font-bold text-foreground">{announcement.winnerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discord ID:</span>
                  <span className="font-mono text-foreground">{announcement.winnerDiscordId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Winning Event:</span>
                  <span className="font-bold text-foreground">{announcement.eventName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prize Amount:</span>
                  <span className="font-serif font-bold text-rose-500">
                    {announcement.prizeWon}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground">
                  Preferred Payout Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
                  className="mt-1 w-full rounded-xl border border-input bg-background/50 px-3.5 py-2.5 text-xs text-foreground outline-hidden focus:border-rose-400"
                >
                  <option value="UPI">UPI (India)</option>
                  <option value="PayPal">PayPal (International)</option>
                  <option value="Crypto">Crypto (USDT / LTC)</option>
                  <option value="Bank">Direct Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-foreground">
                  Payment Address / Account Details
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. user@upi or paypal.me/user"
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-input bg-background/50 px-3.5 py-2.5 text-xs text-foreground outline-hidden focus:border-rose-400"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 py-3 text-xs font-bold text-white shadow-md hover:opacity-95 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Submitting Claim..." : "Submit Reward Claim Ticket"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
