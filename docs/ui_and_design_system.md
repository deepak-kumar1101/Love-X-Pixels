# 🎨 LovePixels — UI Layouts & Design System Blueprint

## 1. Aesthetics & Theme Tokens

LovePixels features a rich, glassmorphic aesthetic built with Tailwind CSS v4 and custom CSS design tokens:

### Color Palette Tokens (`src/styles.css`):
- **Deep Midnight Obsidian (Default Background)**: `#0a0a0f` / `hsl(240, 20%, 4%)`
- **Soft Velvet Rose / Pink Accent**: `#f43f5e` / `hsl(346, 84%, 61%)`
- **Crimson Highlight**: `#fb7185`
- **Card Glassmorphism**: `rgba(255, 255, 255, 0.03)` with `backdrop-blur-xl` and `border: 1px solid rgba(255, 255, 255, 0.08)`
- **Theme Switcher**: Supports seamless switching between **Deep Midnight Obsidian** and **Soft Pink Glass** via `Background.tsx`.

---

## 2. Public Page Breakdown & Components

### 2.1 Navigation Bar (`src/components/site/Navbar.tsx`)
- Glassmorphic fixed header with logo, navigation links (`Home`, `Events`, `Payouts`, `Staff`, `Gallery`, `Partners`, `Community`), Global Search modal trigger, Theme Switcher toggle, and Discord OAuth Login button.

### 2.2 Home Landing Page (`src/routes/index.tsx`)
- **Landing Hero (`LandingHero.tsx`)**: Dynamic title, tagline, server join stats, primary CTA buttons ("Join Discord", "Explore Events").
- **Live Winners Ribbon (`WinnersRibbon.tsx`)**: Animated marquee ticker showcasing recent payout proofs.
- **Server Preview (`ServerPreview.tsx`)**: Interactive Discord voice channel simulation & active member counts.

### 2.3 Events Page (`src/routes/events.tsx`)
- **Active 24h Winner Announcement Card (`WinnerAnnouncementCard.tsx`)**: Shows active winner's Discord avatar, handle, event title, prize, congratulations message, and direct **"Claim Reward / Ticket"** button.
- **Event Filter Tabs**: `All`, `Live`, `Upcoming`, `Past`.
- **Event Card Grid (`EventCard.tsx`)**: Displays banner, start time, end time, max slots counter progress bar, prize reward badge, and **Participate Now** button.
- **Event Details Modal (`EventDetailsModal.tsx`)**: Complete event rules, difficulty rating, host info, and slot registration.
- **Claim Reward Ticket Modal (`ClaimRewardModal.tsx`)**: Prefilled ticket modal for winners to submit payment method (UPI, PayPal, Crypto, Bank) and payout details.

### 2.4 Payouts & Proofs Page (`src/routes/payouts.tsx`)
- **Payout Winner Card Grid (`WinnerCard.tsx`)**: Displays winner handle, prize amount, date paid, reason, and modal lightbox preview for receipt screenshots.
- **Submit Verified Review Modal (`SubmitReviewModal.tsx`)**: Allows winners to write public 5-star feedback.

### 2.5 Staff Hierarchy Roster (`src/routes/staff.tsx`)
- Grouped by hierarchy tiers (`Owners`, `Co-Owners`, `Admins`, `Moderators`, `Helpers`).
- **Staff Card (`StaffCard.tsx`)**: Renders avatar with Discord live presence status dot (Online = Emerald, Idle = Amber, DND = Crimson, Offline = Gray), Full Name, `@handle` underneath in crimson monospace text, custom role title, and bio.

### 2.6 Salons & Gallery Page (`src/routes/gallery.tsx`)
- Filterable gallery grid (`All`, `Salons`, `Art`, `Community`).
- **Lightbox Modal (`LightboxModal.tsx`)**: Fullscreen image inspection modal with caption and artist credit.
