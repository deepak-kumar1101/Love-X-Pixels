# 🚀 LovePixels — AI Replication & Implementation Guide

This guide provides step-by-step instructions and prompts to recreate the entire LovePixels platform using an AI coding assistant (like Antigravity / Gemini / Claude).

---

## Step 1: Project Setup & Package Installation

### Prompt to AI:
> "Initialize a new TanStack Start + React 19 project using Vite. Install `@supabase/supabase-js`, `lucide-react`, `framer-motion`, `sonner`, `clsx`, `tailwind-merge`, and `@tanstack/react-router`. Set up absolute path aliases `@/` pointing to `src/`."

---

## Step 2: Styling & Design System Setup

### Prompt to AI:
> "Create `src/styles.css` with a sleek glassmorphic dark design system. Use `#0a0a0f` as the primary background color, `#f43f5e` as the primary rose pink accent, and glassmorphic card utilities (`backdrop-blur-xl`, `border border-white/10`, `bg-white/5`). Build a `Background.tsx` component that toggles between Deep Midnight Obsidian and Soft Velvet Pink themes."

---

## Step 3: Real-Time Sync & Database Architecture

### Prompt to AI:
> "Create `src/lib/supabase.ts` with Supabase client initialization. Build `src/lib/firebase.ts` containing a local reactive store engine using `BroadcastChannel` and `localStorage` fallback. Implement `subscribeToCollection`, `addFirestoreDoc`, `updateFirestoreDoc`, and `deleteFirestoreDoc` so mutations update all connected components in real time."

---

## Step 4: Core Data Models & Repositories

### Prompt to AI:
> "Define TypeScript interfaces in `src/models/event-system.model.ts` and `src/types/content.ts` for `ExtendedCommunityEvent`, `StaffMember` (with `@handle` and custom `role`), `WinnerAnnouncement`, `RewardClaim`, `PayoutWinner`, and `PayoutReview`. Build repository files under `src/repositories/`."

---

## Step 5: Public Pages & Components

### Prompt to AI:
> "Build the public presentational components and routes:
> 1. `Navbar.tsx`: Fixed glassmorphic navbar with Discord login button and theme toggle.
> 2. `events.tsx`: Live event grid, 24h active `WinnerAnnouncementCard`, `EventCard` with max slot counters, and `ClaimRewardModal`.
> 3. `staff.tsx`: Staff roster grouped by hierarchy ranks with Discord presence indicators and handles displayed under names.
> 4. `payouts.tsx`: Verified payout proof receipts grid and verified public reviews.
> 5. `gallery.tsx`: Salon image showcase with lightbox modal."

---

## Step 6: 12-Module Admin CMS & Automation Engine

### Prompt to AI:
> "Build `src/routes/admin.tsx` containing a 12-tab CMS Suite (Overview, Homepage, Staff, Events, Claims, Partners, Gallery, Payouts, Reviews, Announcements, Settings, Audit). Include custom modal forms for each tab, Sonner toast notifications, delete confirmation modal, `CustomImageUploader` with canvas image compression, and an automated event timer in `EventAutomationService` that picks random winners when event `endsAt` is reached."

---

## Step 7: QA & Build Verification Checklist

Before launching, execute the following commands:
1. `npm run format` — Formats all code with Prettier.
2. `npm run lint` — Validates TypeScript & ESLint with zero errors.
3. `npm run build` — Compiles production client & server bundles.
