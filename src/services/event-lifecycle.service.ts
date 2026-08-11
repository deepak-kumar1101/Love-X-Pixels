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

    const isAlready = await participantRepository.isUserRegistered(event.id, discordId);
    if (isAlready) {
      return { success: false, message: "You are already registered for this event!" };
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
    await XPService.awardXP(user.uid, 150, `Registered for event: ${event.title}`);

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

  /** Random Winner Selection Algorithm */
  static async selectRandomWinner(
    event: ExtendedCommunityEvent,
  ): Promise<WinnerAnnouncement | null> {
    const participants = await participantRepository.getEventParticipants(event.id);
    if (!participants || participants.length === 0) {
      console.warn("[EventLifecycleService] No registered participants to select winner from.");
      return null;
    }

    // Random selection
    const randomIndex = Math.floor(Math.random() * participants.length);
    const winner = participants[randomIndex];

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 3600000).toISOString(); // 24 hours expiry

    const announcementData: Omit<WinnerAnnouncement, "id"> = {
      eventId: event.id,
      winnerDiscordId: winner.discordId,
      winnerName: winner.displayName || winner.username,
      avatar: winner.avatar,
      eventName: event.title,
      prizeWon: event.reward || "₹1,000 + Champion Role",
      congratulationsMsg: `🏆 Congratulations ${winner.displayName}! You won ${event.reward || "the prize"} in ${event.title}!`,
      createdAt: now.toISOString(),
      expiresAt,
      status: "active",
    };

    const annId = await winnerAnnouncementRepository.add(announcementData);

    // Record in Winner History
    await winnerHistoryRepository.add({
      eventId: event.id,
      winnerDiscordId: winner.discordId,
      winnerName: winner.displayName || winner.username,
      avatar: winner.avatar,
      prize: event.reward || "Prize Winner",
      wonAt: now.toISOString(),
      participantsCount: participants.length,
    });

    // Update event status
    await updateFirestoreDoc("events", event.id, {
      status: "completed",
      winnerId: winner.discordId,
      winnerName: winner.displayName || winner.username,
      winnerAvatar: winner.avatar,
    });

    // Create automatic reward claim entry
    await rewardClaimRepository.add({
      eventId: event.id,
      winnerName: winner.displayName || winner.username,
      discordId: winner.discordId,
      eventName: event.title,
      prize: event.reward || "Prize Reward",
      reason: "Reward Claim",
      status: "pending",
      createdAt: now.toISOString(),
    });

    // Broadcast community notification
    await NotificationService.publishNotification({
      title: "🏆 Winner Announced!",
      message: `${winner.displayName} won ${event.reward || "the event"} in ${event.title}!`,
      type: "winner",
      link: "/payouts",
    });

    return { id: annId, ...announcementData };
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
