import { addFirestoreDoc, getCollectionItems, loadLocalItems } from "@/lib/firebase";

export interface DeepXTicketPayload {
  guildId?: string;
  eventId: string;
  eventName: string;
  winnerDiscordId: string;
  authenticatedUserId: string; // Authenticated Discord User ID
  winnerUsername: string;
  prize: string;
  claimType: "Event Reward";
  timestamp: string;
}

export class DeepXSupportService {
  /** Retrieve configurable Discord Guild ID from Admin settings or environment variables */
  static async getGuildId(): Promise<string> {
    try {
      if (typeof window !== "undefined") {
        const direct = window.localStorage.getItem("lovepixels_discord_guild_id");
        if (direct && direct.trim()) return direct.trim();
      }

      const settings = loadLocalItems<Record<string, unknown>>("settings");
      const match = settings.find((s) => s.id === "global" || s.id === "general" || s.discordGuildId);
      if (match?.discordGuildId && typeof match.discordGuildId === "string" && match.discordGuildId.trim()) {
        return match.discordGuildId.trim();
      }
    } catch {
      // Fallback
    }

    return (
      (import.meta.env.VITE_DISCORD_GUILD_ID as string) ||
      "1346519672688087093" // Official LovePixels Discord Server ID
    );
  }

  /** Retrieve static Reward Claim Webhook URL */
  static async getWebhookUrl(): Promise<string> {
    return "https://discord.com/api/webhooks/1507366541833011260/_Xid1TfGFFtkDp20RKNj8nbRNshsCitUw-DBh9zlzUBZvRC6FlUnwLrnr52LVprbsQSO";
  }

  /** Check if a claim ticket already exists for eventId + userId */
  static async hasExistingTicket(eventId: string, userId: string): Promise<boolean> {
    const claims = getCollectionItems<Record<string, unknown>>("rewardClaims", []);
    return claims.some(
      (c) =>
        c.eventId === eventId &&
        c.ticketSent === true &&
        (c.discordId === userId || c.winnerDiscordId === userId || (c as any).userId === userId)
    );
  }

  /** Dispatch Deep X Support Ticket creation via webhook / API shim */
  static async createRewardTicket(
    payload: DeepXTicketPayload
  ): Promise<{ success: boolean; message: string; ticketId?: string }> {
    const { eventId, winnerDiscordId, authenticatedUserId } = payload;

    // Strict Security Verification: authenticatedUserId === winnerDiscordId
    if (!authenticatedUserId || authenticatedUserId !== winnerDiscordId) {
      return {
        success: false,
        message: "Unauthorized: Your Discord User ID does not match the winner record.",
      };
    }

    // Check duplicate claim ticket creation (only block if ticket was ALREADY sent to Discord)
    const alreadyExists = await this.hasExistingTicket(eventId, winnerDiscordId);
    if (alreadyExists) {
      return {
        success: false,
        message: "Your reward claim ticket has already been created.",
      };
    }

    const guildId = payload.guildId || (await this.getGuildId());
    const WEBHOOK_URL = await this.getWebhookUrl();

    const ticketData = {
      guildId,
      eventId: payload.eventId,
      eventName: payload.eventName,
      winnerDiscordId: payload.winnerDiscordId,
      winnerName: payload.winnerUsername,
      discordId: payload.winnerDiscordId,
      prize: payload.prize,
      claimType: payload.claimType,
      reason: `Claim Reward: ${payload.eventName}`,
      status: "pending" as const,
      ticketSent: true,
      createdAt: payload.timestamp || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save ticket into rewardClaims collection for Admin Panel support tracking
    const ticketId = await addFirestoreDoc("rewardClaims", ticketData);

    // Send payload to Deep X Support Discord Bot Webhook with 3-way CORS fallback
    await this.sendDiscordWebhook(WEBHOOK_URL, {
      content: `🎫 **NEW REWARD CLAIM TICKET**\n**Event:** ${payload.eventName}\n**Winner:** @${payload.winnerUsername} (\`${payload.winnerDiscordId}\`)\n**Prize:** ${payload.prize}\n**Guild ID:** \`${guildId}\``,
      embeds: [
        {
          title: "🎫 DEEP X SUPPORT — REWARD CLAIM TICKET",
          color: 0xf59e0b,
          fields: [
            { name: "Guild ID", value: String(guildId), inline: true },
            { name: "Claim Type", value: String(payload.claimType), inline: true },
            { name: "Winner Discord ID", value: String(payload.winnerDiscordId), inline: false },
            { name: "Winner Username", value: String(payload.winnerUsername), inline: true },
            { name: "Event Title", value: String(payload.eventName), inline: true },
            { name: "Reward / Prize", value: String(payload.prize), inline: true },
            { name: "Event ID", value: String(payload.eventId), inline: false },
          ],
          footer: { text: "LovePixels Deep X Support Integration" },
          timestamp: payload.timestamp || new Date().toISOString(),
        },
      ],
    });

    return {
      success: true,
      message: "🎫 Reward claim support ticket created in Discord server!",
      ticketId,
    };
  }

  /** Robust 3-way Fallback Webhook Dispatcher (Fetch -> sendBeacon -> no-cors fetch) */
  static async sendDiscordWebhook(webhookUrl: string, bodyObj: object): Promise<boolean> {
    if (!webhookUrl || !webhookUrl.startsWith("http")) return false;
    const bodyStr = JSON.stringify(bodyObj);

    // Method 1: Standard Fetch with CORS
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: bodyStr,
      });
      if (res.ok || res.status === 204) return true;
    } catch (err) {
      console.warn("[DeepXSupportService] Fetch notice, switching to sendBeacon/no-cors:", err);
    }

    // Method 2: sendBeacon (Bypasses CORS preflight completely)
    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([bodyStr], { type: "application/json" });
        const sent = navigator.sendBeacon(webhookUrl, blob);
        if (sent) return true;
      }
    } catch {
      // Silent
    }

    // Method 3: no-cors Fetch fallback
    try {
      await fetch(webhookUrl, {
        method: "POST",
        mode: "no-cors",
        body: bodyStr,
      });
      return true;
    } catch {
      return false;
    }
  }
}
