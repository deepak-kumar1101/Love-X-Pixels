# LovePixels • Premium Online Community & Creative Circle Platform

LovePixels is a production-grade, luxury aesthetic online community platform designed for Discord communities, voice salons, creative showcases, and monthly reward payouts.

---

## 🌟 Technology Stack & Architecture

- **Frontend Core**: React 19, TypeScript, TanStack Start, TanStack Router, Vite, Tailwind CSS v4, Motion (Framer Motion).
- **Backend & Database**: Firebase Authentication, Cloud Firestore (Real-time listener architecture), Firebase Storage, Firebase Analytics, Firebase App Check (ReCAPTCHA V3).
- **Architecture Pattern**: Clean Architecture with strict separation into Repositories, Services, Contexts, Hooks, Models, Utilities, and Security Guards.

```
src/
├── components/          # Reusable UI components & interactive modals
│   ├── motion/          # Glassmorphic motion wrappers (Magnetic, Parallax, FloatingCard)
│   └── site/            # Domain components (Navbar, Footer, ServerPreview, LoginModal, GlobalSearchModal, NotificationDrawer)
├── contexts/            # React Contexts (AuthContext, RBACContext)
├── hooks/               # Custom React Hooks (useAuth, useRBAC, useVisitorTracker, useStorageUpload)
├── lib/                 # Utilities (firebase/config, error-handler, image-optimizer, csv-exporter, cache, logger, seo)
├── middleware/          # Security Guards (RouteGuard)
├── models/              # TypeScript Domain Interfaces (user, rbac, gamification, announcement, settings, analytics)
├── repositories/        # Repository Pattern Layer (base.repository, user.repository, visitor.repository, bookmark.repository)
├── routes/              # TanStack Start File-Based Routes (index, community, staff, events, partners, payouts, gallery, admin)
└── services/            # Business Logic Layer (auth, rbac, storage, visitor, discord, event-automation, media, xp, giveaway, season, backup)
```

---

## 🔒 Role-Based Access Control (RBAC) Hierarchy

1. **Owner**: System administrator with full read/write access to settings, users, and global configuration.
2. **CoOwner**: Full access except system-critical settings.
3. **Admin**: Manages Events, Gallery, Staff Roster, Payout Winners, Partners, and Announcements.
4. **Moderator**: Manages Review moderation queue (`Pending`, `Approved`, `Rejected`), User flags, and Announcements.
5. **Staff**: Read-only access to control metrics.
6. **Verified / Member**: Authenticated community member access (Review submission, Giveaway entries, XP progression).
7. **Guest**: Public read-only access.

---

## 🗄️ Cloud Firestore Collections Schema

- `/users/{uid}`: `UserProfile` (uid, displayName, email, roles, xp, level, badges, isVerified, isBanned).
- `/staff/{docId}`: `StaffMember` (name, role, bio, rank, presence, handle, avatarUrl).
- `/events/{docId}`: `CommunityEvent` (title, description, startsAt, endsAt, reward, host, status, capacity).
- `/partners/{docId}`: `Partner` (name, category, description, memberCount, logoUrl).
- `/payouts/{docId}`: `PayoutWinner` (name, handle, amount, reason, paidAt, proofImageUrl).
- `/reviews/{docId}`: `PayoutReview` (name, handle, quote, rating, approved, isPinned, likes).
- `/gallery/{docId}`: `GalleryItem` (src, alt, caption, category, span).
- `/announcements/{docId}`: `Announcement` (title, description, type, priority, visible, targetAudience).
- `/settings/global`: `SystemSettings` (maintenanceMode, websiteVisibility, heroTitle, heroTagline).
- `/visitorLogs/{docId}`: `VisitorLog` (pagePath, browser, device, timestamp).
- `/auditLogs/{docId}`: `AuditLog` (actorUid, actorName, action, targetCollection, timestamp).

---

## 📁 Firebase Storage Folder Hierarchy

- `hero/`: Homepage hero imagery and video assets.
- `gallery/`: Community gallery media uploads.
- `staff/`: Staff avatar images.
- `partners/`: Partner logos and banners.
- `events/`: Event promotional banners.
- `winners/`: Winner payout proof screenshots.
- `reviews/`: Member review attachments.
- `avatars/`: Member profile avatars.

---

## 🔑 Environment Variables (.env)

| Key                                 | Description                    | Example                      |
| :---------------------------------- | :----------------------------- | :--------------------------- |
| `VITE_FIREBASE_API_KEY`             | Firebase Web API Key           | `AIzaSy...`                  |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Firebase Auth Domain           | `lovepixels.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID`          | Cloud Firestore Project ID     | `lovepixels`                 |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Storage Bucket Domain          | `lovepixels.appspot.com`     |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Cloud Messaging Sender ID      | `123456789`                  |
| `VITE_FIREBASE_APP_ID`              | Firebase App ID                | `1:123456789:web:...`        |
| `VITE_ADMIN_EMAIL`                  | Automatic Admin Detection Mail | `admin@lovepixels.com`       |
| `VITE_DISCORD_GUILD_ID`             | Discord Server Guild ID        | `123456789012345678`         |

---

## 🚀 Deployment Instructions

### Vercel Deployment

1. Import repository to Vercel.
2. Add Environment Variables from table above.
3. Build Command: `npm run build`
4. Output Directory: `.output` (or standard Vite output directory).

### Firebase App Hosting Deployment

```bash
npx -y firebase-tools@latest deploy --only hosting,firestore,storage
```

---

## 🛠️ Verification & Build Commands

```bash
# Code Formatting
npm run format

# ESLint Type & Syntax Audit
npm run lint

# Production Client & SSR Build
npm run build
```
