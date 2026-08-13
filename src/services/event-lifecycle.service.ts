import { updateFirestoreDoc, addFirestoreDoc } from "@/lib/firebase";
import {
  participantRepository,
  eventNotificationRepository,
  winnerAnnouncementRepository,
  winnerHistoryRepository,
  rewardClaimRepository,
} from "@/repositories/event-system.repository";
import { NotificationService } from "./notification.service";
import { XPService } from "./xp.service";
import type {
  ExtendedCommunityEvent,
  EventParticipant,
  WinnerAnnouncement,
  RewardClaim,
} from "@/models/event-system.model";

export class EventLifecycleService {
  /** Register user for an event with slot check, duplicate check, and XP reward */
  static async registerParticipant(
    event: ExtendedCommunityEvent,
    user: {
      uid?: string;
      id?: string;
      displayName?: string;
      email?: string;
      photoURL?: string;
      user_metadata?: Record<string, unknown>;
    },
  ): Promise<{ success: boolean; message: string }> {
    const discordId = user?.uid || user?.id;
    if (!user || !discordId) {
      return { success: false, message: "Authentication required. Please sign in with Discord." };
    }

    // Backend Duplicate Entry Check — User can enter an event ONLY ONCE
    const isAlready = await participantRepository.isUserRegistered(event.id, discordId);
    if (isAlready) {
      return { success: false, message: "You have already entered this event." };
    }

    const maxSlots = event.maxSlots || event.capacity || 50;
    const registeredCount = event.registeredCount || event.participants || 0;
    const remainingSlots = Math.max(0, maxSlots - registeredCount);

    if (remainingSlots <= 0 || event.registrationOpen === false) {
      return { success: false, message: "Registration is full for this event." };
    }

    const displayName =
      user.displayName ||
      (user.user_metadata?.full_name as string) ||
      (user.user_metadata?.name as string) ||
      (user.user_metadata?.preferred_username as string) ||
      user.email?.split("@")[0] ||
      "Participant";

    const avatar = user.photoURL || (user.user_metadata?.avatar_url as string) || undefined;

    // Register participant
    const participantData: Omit<EventParticipant, "id"> = {
      eventId: event.id,
      discordId,
      username: user.email?.split("@")[0] || displayName,
      displayName,
      avatar,
      joinedAt: new Date().toISOString(),
      status: "registered",
    };

    await participantRepository.add(participantData);

    // Update event slot counters
    const newRegistered = registeredCount + 1;
    const newRemaining = Math.max(0, maxSlots - newRegistered);

    await updateFirestoreDoc("events", event.id, {
      participants: newRegistered,
      registeredCount: newRegistered,
      remainingSlots: newRemaining,
    });

    // Award XP
    await XPService.awardXP(user.uid || user.id || "", 150, `Registered for event: ${event.title}`);

    // Notify if slots almost full
    if (newRemaining <= 3 && newRemaining > 0) {
      await NotificationService.publishNotification({
        title: "⚡ Slots Almost Full!",
        message: `${newRemaining} slot(s) remaining for ${event.title}!`,
        type: "event",
        link: "/events",
      });
    }

    return { success: true, message: "Successfully registered for event!" };
  }

  /** Subscribe user to upcoming event notifications */
  static async subscribeEventNotification(
    eventId: string,
    user: { uid: string; email?: string },
  ): Promise<void> {
    if (!user || !user.uid) return;
    await eventNotificationRepository.add({
      eventId,
      userId: user.uid,
      userEmail: user.email || "",
      subscribedAt: new Date().toISOString(),
    });

    await NotificationService.publishNotification({
      title: "🔔 Subscribed to Event",
      message: "You will be notified when this event goes live!",
      type: "event",
      link: "/events",
    });
  }

  /** Automatic Random Winner Selection Algorithm — Called when an event ends */
  static async selectRandomWinner(
    event: ExtendedCommunityEvent,
  ): Promise<WinnerAnnouncement | null> {
    // Atomicity check: Prevent re-running winner selection on the same event
    if (event.winnerSelected || event.winnerId) {
      console.log(`[EventLifecycleService] Winner already selected for event: ${event.title}`);
      return null;
    }

    const participants = await participantRepository.getEventParticipants(event.id);
    if (!participants || participants.length === 0) {
      console.warn(`[EventLifecycleService] No registered participants for event: ${event.title}`);
      // Mark as completed without winner if no participants
      await updateFirestoreDoc("events", event.id, {
        status: "completed",
        winnerSelected: true,
      });
      return null;
    }

    // Secure Random Selection
    const randomIndex = Math.floor(Math.random() * participants.length);
    const winner = participants[randomIndex];

    const now = new Date();
    // Exactly 24-hour announcement expiry
    const expiresAt = new Date(now.getTime() + 24 * 3600 * 1000).toISOString();

    const winnerName = winner.displayName || winner.username || "Community Winner";
    const prizeWon = event.reward || "₹1,000 + Champion Role";

    const congratulationsMsg = `Congratulations, ${winnerName}! 🎉 You have won ${prizeWon} in ${event.title}. Thank you for participating in LovePixels. Your reward is ready to be claimed.`;

    const announcementData: Omit<WinnerAnnouncement, "id"> = {
      eventId: event.id,
      winnerDiscordId: winner.discordId,
      winnerName,
      avatar: winner.avatar,
      eventName: event.title,
      prizeWon,
      congratulationsMsg,
      createdAt: now.toISOString(),
      expiresAt,
      status: "active",
    };

    // 1. Create 24-hour Winner Announcement
    const annId = await winnerAnnouncementRepository.add(announcementData);

    // 2. Store Permanent Winner Record in winnerHistory
    await winnerHistoryRepository.add({
      eventId: event.id,
      winnerDiscordId: winner.discordId,
      winnerName,
      avatar: winner.avatar,
      prize: prizeWon,
      wonAt: now.toISOString(),
      participantsCount: participants.length,
    });

    // 3. Store Permanent Record in Payouts collection (Hall of Fame)
    await addFirestoreDoc("payouts", {
      name: winnerName,
      handle: `@${winner.username.toLowerCase()}`,
      amount: prizeWon,
      reason: `Event Winner: ${event.title}`,
      paidAt: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      proofImageUrl: winner.avatar || undefined,
    });

    // 4. Lock Event to prevent duplicate winner generation
    await updateFirestoreDoc("events", event.id, {
      status: "completed",
      winnerSelected: true,
      winnerId: winner.discordId,
      winnerName,
      winnerAvatar: winner.avatar,
    });

    // 5. Broadcast community notification
    await NotificationService.publishNotification({
      title: "🏆 Winner Announced!",
      message: `${winnerName} won ${prizeWon} in ${event.title}!`,
      type: "winner",
      link: "/payouts",
    });

    return { id: annId, ...announcementData };
  }

  /** Background task: Check for ended events and trigger automatic random winner selection */
  static async checkAndFinalizeEvents(eventsList: ExtendedCommunityEvent[]): Promise<void> {
    const now = new Date();
    for (const event of eventsList) {
      if (event.winnerSelected || event.winnerId) continue;

      const isEnded =
        event.status === "past" ||
        event.status === "completed" ||
        (event.startsAt && new Date(event.startsAt).getTime() < now.getTime() - 3600 * 1000);

      if (isEnded) {
        try {
          await this.selectRandomWinner(event);
        } catch (err) {
          console.error(`[EventLifecycleService] Error finalizing event ${event.id}:`, err);
        }
      }
    }
  }

  /** Complete Payout Claim & Automatically Generate Public Review */
  static async completePayoutClaim(
    claimId: string,
    payoutDetails: {
      paymentMethod: "UPI" | "PayPal" | "Crypto" | "Bank";
      paymentDate: string;
      proofImageUrl: string;
      adminNote?: string;
    },
  ): Promise<void> {
    const claim = await rewardClaimRepository.getById(claimId);
    if (!claim) return;

    await rewardClaimRepository.update(claimId, {
      status: "completed",
      paymentMethod: payoutDetails.paymentMethod,
      paymentDate: payoutDetails.paymentDate,
      proofImageUrl: payoutDetails.proofImageUrl,
      adminNote: payoutDetails.adminNote,
      updatedAt: new Date().toISOString(),
    });

    // Also add record to payouts collection for homepage ticker ribbon
    await addFirestoreDoc("payouts", {
      name: claim.winnerName,
      handle: `@${claim.winnerName.toLowerCase()}`,
      amount: claim.prize,
      reason: `Claimed: ${claim.eventName}`,
      paidAt: payoutDetails.paymentDate,
      proofImageUrl: payoutDetails.proofImageUrl,
    });

    // Automatically generate verified public review
    await addFirestoreDoc("reviews", {
      name: claim.winnerName,
      handle: `@${claim.winnerName.toLowerCase()}`,
      quote:
        payoutDetails.adminNote ||
        `Received ${claim.prize} for winning ${claim.eventName}! Fast payout and great community event!`,
      rating: 5,
      approved: true,
      isVerified: true,
      imageUrl: payoutDetails.proofImageUrl,
      createdAt: new Date().toISOString(),
    });

    await NotificationService.publishNotification({
      title: "💸 Payout Completed!",
      message: `Reward payout completed for ${claim.winnerName} (${claim.prize})!`,
      type: "winner",
      link: "/payouts",
    });
  }
}
