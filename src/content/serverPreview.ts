import gallery1 from "@/assets/gallery-1.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import hero from "@/assets/hero.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import type {
  PreviewChannel,
  PreviewGiveaway,
  PreviewMedia,
  PreviewMessage,
  PreviewParty,
  PreviewVoiceRoom,
} from "@/types/content";

/** TODO(firebase): collection "previewChannels" */
export const previewChannels: PreviewChannel[] = [
  { id: "general", name: "general", kind: "text", topic: "Everyday talk, softly moderated." },
  { id: "vc-lounge", name: "vc-lounge", kind: "voice", topic: "Always-on voice rooms." },
  { id: "media", name: "media", kind: "media", topic: "Photos, frames and film stills." },
  { id: "events", name: "events", kind: "events", topic: "What's next in the room." },
  { id: "giveaways", name: "giveaways", kind: "giveaways", topic: "Small gifts, often." },
  { id: "confession", name: "confession", kind: "confession", topic: "Anonymous, kind, unedited." },
  { id: "gaming", name: "gaming", kind: "gaming", topic: "Parties looking for one more." },
];

/** TODO(firebase): collection "previewMessages" scoped by channelId */
export const previewMessages: PreviewMessage[] = [
  {
    id: "m1",
    author: "Mira",
    time: "20:14",
    body: "the sunset outside my window is doing something unreasonable today",
  },
  { id: "m2", author: "Sol", time: "20:15", body: "post it post it post it" },
  {
    id: "m3",
    author: "Kaia",
    time: "20:16",
    body: "listening room in 40 mins — bring one song that ruins you",
  },
  { id: "m4", author: "Noor", time: "20:18", body: "i have three. is that allowed" },
  { id: "m5", author: "Mira", time: "20:19", body: "it's encouraged 🩷" },
];

/** TODO(firebase): collection "previewVoiceRooms" */
export const previewVoiceRooms: PreviewVoiceRoom[] = [
  {
    id: "v1",
    name: "Late Lounge",
    listeners: 12,
    speakers: ["Mira", "Sol", "Kaia"],
    mood: "low-light talk",
  },
  { id: "v2", name: "Focus Room", listeners: 7, speakers: ["Noor"], mood: "silent co-working" },
  {
    id: "v3",
    name: "Listening Room",
    listeners: 21,
    speakers: ["Kaia", "Ari"],
    mood: "one song each",
  },
];

/** TODO(firebase): storage bucket "previewMedia" */
export const previewMedia: PreviewMedia[] = [
  { id: "p1", src: gallery1, alt: "Pink stationery flat lay", author: "Mira" },
  { id: "p2", src: hero, alt: "Rose silk gradient", author: "Sol" },
  { id: "p3", src: gallery3, alt: "Glass orb on pink clouds", author: "Kaia" },
  { id: "p4", src: hero2, alt: "Soft blush light study", author: "Noor" },
  { id: "p5", src: gallery4, alt: "Blush peonies on marble", author: "Ari" },
  { id: "p6", src: hero3, alt: "Petal gradient haze", author: "Mira" },
];

/** TODO(firebase): collection "previewGiveaways" */
export const previewGiveaways: PreviewGiveaway[] = [
  {
    id: "gw1",
    prize: "Nitro — 1 month",
    entries: 148,
    endsInLabel: "ends in 2 days",
    host: "Kaia",
  },
  { id: "gw2", prize: "Custom profile art", entries: 92, endsInLabel: "ends tonight", host: "Sol" },
];

/** TODO(firebase): collection "previewParties" */
export const previewParties: PreviewParty[] = [
  { id: "pa1", game: "Valorant", slots: "3/5", note: "chill unrated, no rage", host: "Ari" },
  {
    id: "pa2",
    game: "Stardew Valley",
    slots: "2/4",
    note: "year 3 farm, cozy hours",
    host: "Mira",
  },
  { id: "pa3", game: "Chess", slots: "1/2", note: "5 min blitz, all levels", host: "Noor" },
];

/** TODO(firebase): document "previewCountdown" — ISO date of the next event */
export const previewCountdown = {
  title: "Rose Hour — Listening Room",
  host: "Kaia",
  /** Rolling placeholder target so the countdown always reads as upcoming. */
  targetOffsetMs: 1000 * 60 * 60 * 52 + 1000 * 60 * 34,
};

/** TODO(firebase): collection "previewConfessions" */
export const previewConfessions = [
  {
    id: "c1",
    body: "I joined six months ago and never said hi. Today I finally did and three people welcomed me by name.",
  },
  { id: "c2", body: "This is the only server I open before my messages." },
  { id: "c3", body: "I make playlists for people here who will never know they're about them." },
];
