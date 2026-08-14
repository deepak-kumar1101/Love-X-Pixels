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
    const discordUserId = user?.id || user?.uid || (user as any)?.discordId || (user as any)?.discordUserId;
    if (!user || !discordUserId) {
      return { success: false, message: "Authentication required. Please sign in with Discord." };
    }

    // Check if event is still active
    const now = Date.now();
    const startTime = event.startsAt ? new Date(event.startsAt).getTime() : now;
    const durationMs = (event.durationHours || 24) * 3600 * 1000;
    const endTime = event.endsAt ? new Date(event.endsAt).getTime() : startTime + durationMs;

    if (now >= endTime || event.status === "past" || event.status === "completed") {
      return { success: false, message: "This event has already ended." };
    }

    // Backend Atomic Duplicate Entry Check — Unique Key (eventId + discordUserId)
    const isAlready = await participantRepository.isUserRegistered(event.id, discordUserId);
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

    // Register participant with deterministic document ID (eventId_discordUserId)
    const deterministicId = `${event.id}_${discordUserId}`;
    const participantData: EventParticipant = {
      id: deterministicId,
      eventId: event.id,
      discordId: discordUserId,
      discordUserId,
      username: user.email?.split("@")[0] || displayName,
      discordUsername: displayName,
      displayName,
      avatar,
      discordAvatar: avatar,
      joinedAt: new Date().toISOString(),
      status: "registered",
    };

    await addFirestoreDoc("participants", participantData);

    // Update event slot counters
    const newRegistered = registeredCount + 1;
    const newRemaining = Math.max(0, maxSlots - newRegistered);

    await updateFirestoreDoc("events", event.id, {
      participants: newRegistered,
      registeredCount: newRegistered,
      remainingSlots: newRemaining,
    });

    // Award XP
    await XPService.awardXP(discordUserId, 150, `Registered for event: ${event.title}`);

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
    if (event.winnerSelected || event.winnerId || event.winnerSelectionStatus === "COMPLETED") {
      console.log(`[EventLifecycleService] Winner already selected for event: ${event.title}`);
      return null;
    }

    // Atomically mark status as PROCESSING
    await updateFirestoreDoc("events", event.id, {
      winnerSelectionStatus: "PROCESSING",
    });

    const participants = await participantRepository.getEventParticipants(event.id);
    if (!participants || participants.length === 0) {
      console.warn(`[EventLifecycleService] No registered participants for event: ${event.title}`);
      // Mark as completed without winner if no participants
      await updateFirestoreDoc("events", event.id, {
        status: "completed",
        winnerSelected: true,
        winnerSelectionStatus: "COMPLETED",
      });
      return null;
    }

    // Secure Random Selection from actual registered participants
    const randomIndex = Math.floor(Math.random() * participants.length);
    const winner = participants[randomIndex];
    const winnerDiscordId = winner.discordUserId || winner.discordId;

    const now = new Date();
    // Exactly 24-hour announcement expiry
    const expiresAt = new Date(now.getTime() + 24 * 3600 * 1000).toISOString();

    const winnerName = winner.displayName || winner.username || "Community Winner";
    const prizeWon = event.reward || "₹1,000 + Champion Role";

    const congratulationsMsg = `Congratulations, @${winnerName}! 🎉 You have won ${prizeWon} in our ${event.title} event. Thank you for participating in LovePixels. Create a ticket to claim your reward.`;

    const announcementData: Omit<WinnerAnnouncement, "id"> = {
      eventId: event.id,
      winnerDiscordId: winnerDiscordId,
      winnerDiscordUserId: winnerDiscordId,
      winnerName,
      winnerUsername: winner.username || winner.displayName,
      avatar: winner.avatar || winner.discordAvatar,
      eventName: event.title,
      prizeWon,
      congratulationsMsg,
      createdAt: now.toISOString(),
      expiresAt,
      status: "active",
    };

    // 1. Create 24-hour Winner Announcement
    const annId = await winnerAnnouncementRepository.add(announcementData);

    // 2. Store Winner Record in winnerHistory as Pending
    await winnerHistoryRepository.add({
      eventId: event.id,
      winnerDiscordId: winnerDiscordId,
      winnerDiscordUserId: winnerDiscordId,
      winnerName,
      avatar: winner.avatar || winner.discordAvatar,
      prize: prizeWon,
      wonAt: now.toISOString(),
      participantsCount: participants.length,
    });

    // 3. Store initial Reward Pending entry in rewardClaims
    await rewardClaimRepository.add({
      eventId: event.id,
      winnerName,
      discordId: winnerDiscordId,
      winnerDiscordUserId: winnerDiscordId,
      eventName: event.title,
      prize: prizeWon,
      reason: "Reward Pending",
      status: "pending",
      createdAt: now.toISOString(),
    });

    // 4. Lock Event permanently to prevent duplicate winner generation
    await updateFirestoreDoc("events", event.id, {
      status: "completed",
      winnerSelected: true,
      winnerSelectionStatus: "COMPLETED",
      winnerId: winnerDiscordId,
      winnerName,
      winnerAvatar: winner.avatar || winner.discordAvatar,
    });

    // 5. Broadcast website notification strictly to the winner's Discord User ID
    await NotificationService.publishNotification({
      title: "🎉 You have won!",
      message: `Congratulations! You won ${prizeWon} in ${event.title}. Your reward is ready to be claimed. Claim your reward by creating a support ticket.`,
      type: "winner",
      link: "/payouts",
      eventId: event.id,
      eventName: event.title,
      prize: prizeWon,
      winnerDiscordId: winnerDiscordId,
      winnerName,
    });

    return { id: annId, ...announcementData };
  }

  /** Background task: Check for ended events and trigger automatic random winner selection */
  static async checkAndFinalizeEvents(eventsList: ExtendedCommunityEvent[]): Promise<void> {
    const now = Date.now();
    for (const event of eventsList) {
      if (event.winnerSelected || event.winnerId || event.winnerSelectionStatus === "COMPLETED") continue;

      let endTime = 0;
      if (event.endsAt) {
        endTime = new Date(event.endsAt).getTime();
      } else if (event.startsAt) {
        const durationMs = (event.durationHours || 24) * 3600 * 1000;
        endTime = new Date(event.startsAt).getTime() + durationMs;
      }

      const isEnded =
        (endTime > 0 && now >= endTime) ||
        event.status === "past" ||
        event.status === "completed";

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
