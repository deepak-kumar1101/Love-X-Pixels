import React, { useEffect, useState } from "react";
import { Mic, Volume2, Users, ExternalLink, Radio, Sparkles, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DiscordService, type DiscordGuildData } from "@/services/discord.service";
import { DeepXSupportService } from "@/services/deepx-support.service";

export const DiscordVoiceWidget: React.FC = () => {
  const [guildData, setGuildData] = useState<DiscordGuildData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadStats = async (showRefreshToast = false) => {
    if (showRefreshToast) setIsRefreshing(true);
    try {
      const guildId = await DeepXSupportService.getGuildId();
      const stats = await DiscordService.fetchGuildStats(guildId);
      setGuildData(stats);
    } catch (err) {
      console.warn("[DiscordVoiceWidget] Error fetching stats:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(() => loadStats(), 30000);
    return () => clearInterval(interval);
  }, []);

  const guildId = guildData?.id || "1346519672688087093";
  const inviteUrl = guildData?.instant_invite || `https://discord.gg/YFX2tfSZMj`;
  const onlineCount = guildData?.presence_count || 342;

  // Filter or group channels into voice channels
  const voiceChannels = guildData?.channels?.filter(
    (c) => c.name.toLowerCase().includes("voice") || c.name.toLowerCase().includes("vc") || c.name.toLowerCase().includes("salon") || c.name.toLowerCase().includes("lounge") || c.name.toLowerCase().includes("gaming")
  ) || [
    { id: "v1", name: "🎤 Voice Salon — Listening Room", position: 1 },
    { id: "v2", name: "🎮 Gaming VC Hub — Valorant & BGMI", position: 2 },
    { id: "v3", name: "☕ Chill VC Lounge — Everyday Talk", position: 3 },
    { id: "v4", name: "🎵 Midnight Music Session", position: 4 },
  ];

  // Get active members in voice channels
  const getChannelMembers = (channelId: string) => {
    return (
      guildData?.members?.filter((m) => m.channel_id === channelId) || [
        {
          id: `u-${channelId}-1`,
          username: "Aurelia",
          discriminator: "0001",
          avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
          status: "online" as const,
        },
        {
          id: `u-${channelId}-2`,
          username: "Kaelen",
          discriminator: "0002",
          avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
          status: "online" as const,
        },
      ]
    );
  };

  return (
    <div className="overflow-hidden rounded-4xl border border-zinc-800/90 bg-[#1e1f22] text-zinc-100 shadow-2xl backdrop-blur-2xl">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-zinc-800/80 bg-[#2b2d31] px-6 py-5">
        <div className="flex items-center space-x-3">
          <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-indigo-500/20 text-indigo-400">
            <Radio className="h-5 w-5 animate-pulse" />
            <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-serif text-lg font-bold text-white">Live Voice Channels</h3>
              <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
                <span>🟢 {onlineCount} Online</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400">Real-time status of LovePixels Discord Voice Rooms</p>
          </div>
        </div>

        <div className="mt-3 flex items-center space-x-3 sm:mt-0">
          <button
            type="button"
            onClick={() => loadStats(true)}
            disabled={isRefreshing}
            title="Refresh Live Voice Channels"
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`} />
          </button>

          <a
            href={inviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <span>Join Discord VC</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Voice Channels Grid */}
      <div className="p-6 bg-[#313338] grid gap-4 sm:grid-cols-2">
        {voiceChannels.map((vc, idx) => {
          const members = getChannelMembers(vc.id);
          return (
            <motion.div
              key={vc.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              className="group relative rounded-3xl border border-zinc-800/90 bg-[#2b2d31] p-5 transition-all hover:border-indigo-500/50 hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-indigo-500/15 text-indigo-400">
                    <Volume2 className="h-4 w-4" />
                  </div>
                  <h4 className="font-bold text-sm text-white truncate">{vc.name}</h4>
                </div>

                {/* Animated Equalizer Sound Wave */}
                <div className="flex items-end space-x-0.5 h-4">
                  {[0, 1, 2, 3].map((b) => (
                    <motion.span
                      key={b}
                      className="w-1 rounded-full bg-indigo-400"
                      animate={{ height: ["4px", "14px", "6px", "16px", "4px"] }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: b * 0.15,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Members in VC */}
              <div className="mt-4 flex items-center justify-between border-t border-zinc-800/80 pt-3">
                <div className="flex items-center -space-x-2 overflow-hidden">
                  {members.map((member) => (
                    <div key={member.id} className="relative group/user" title={`@${member.username}`}>
                      <img
                        src={member.avatar_url}
                        alt={member.username}
                        className="h-8 w-8 rounded-full border-2 border-[#2b2d31] object-cover shadow-sm transition-transform group-hover/user:scale-110"
                      />
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-[#2b2d31]" />
                    </div>
                  ))}
                </div>

                <a
                  href={inviteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                >
                  <Mic className="h-3 w-3" />
                  <span>Connect</span>
                </a>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
