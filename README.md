# TECHMED AIS Brainstorming

> **Think Smart. Perform Elite.**

A production-grade **Progressive Web App** that helps Nigerian university candidates prepare for **Post-UTME** examinations through a full Computer-Based-Test (CBT) experience — real past questions, streaks, leaderboards, ranks, and a complete admin panel with CSV bulk upload.

Installable on Android & iOS home screens, works offline, dark-mode first.

---

## ✨ Features

- **Multi-step registration** — personal details → academic profile → subject selection → avatar/nickname.
- **Personalized dashboard** — streak badge, total points, rank progress, quick stats, subject performance, daily challenge, activity heatmap, recent history & leaderboard preview.
- **Full CBT exam engine**
  - Modes: **Practice** (instant answers + explanations), **Exam** (results at the end), **One Subject**, **Custom Mix**.
  - Configurable question count, timed/untimed/custom timer, difficulty, and question source (all years / specific year / my university / all universities).
  - Question palette, flagging, pause/resume, auto-submit on timeout, prev/next navigation.
  - Animated results screen with grade, per-subject breakdown, full answer review, and a **shareable score card** (image export).
- **Gamification** — points (correct/hard/perfect/first-of-day/streak), six ranks (Rookie → TECHMED Legend), streak system with **freeze tokens** and milestone badges.
- **Leaderboards** — Global, University, Weekly (resets Monday) & Monthly, with podium, crowns and your live rank.
- **Admin panel** — overview analytics, question CRUD with filters, **CSV bulk upload** (drag-&-drop, client-side parsing, row validation, preview, template download), user management (roles, suspend/activate, profiles & history), and content management (subjects, announcements, universities).
- **PWA** — installable, offline question caching, install prompt, and Web-Push notifications (streak reminders).
- **Security** — NextAuth v5 sessions, bcrypt password hashing, Zod validation everywhere, role-checked admin routes (middleware + server), rate-limited auth/registration, server-authoritative exam scoring.

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Database | PostgreSQL via **Supabase** |
| ORM | Prisma |
| Auth | NextAuth.js v5 (Credentials + JWT) |
| Styling | Tailwind CSS + shadcn/ui (Radix) |
| State | Zustand (persisted exam state) |
| Validation | Zod |
| CSV | Papa Parse |
| PWA | next-pwa (Workbox) + web-push |
| Charts/Share | Recharts, html-to-image |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on 22)
- A free [Supabase](https://supabase.com) project (PostgreSQL)

### 2. Install
```bash
npm install
```

### 3. Configure environment
Copy the example and fill in your values:
```bash
cp .env.example .env
```

Key variables (see `.env.example` for the full list):

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase **pooled** connection string (port 6543, `?pgbouncer=true`) — used at runtime |
| `DIRECT_URL` | Supabase **direct** connection string (port 5432) — used by Prisma migrations |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` in dev |
| `NEXT_PUBLIC_SUPABASE_URL` / `..._ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | for avatar uploads to Supabase Storage |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | for push notifications — `npx web-push generate-vapid-keys` |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | seeded admin login |

> **Where to find the Supabase strings:** Project → **Settings → Database → Connection string**. Use the *Transaction* pooler URL for `DATABASE_URL` and the *Session*/direct URL for `DIRECT_URL`.

### 4. Set up the database
```bash
npm run db:push      # push the Prisma schema to Supabase
npm run db:seed      # seed subjects, sample questions, admin & demo student
```

### 5. Run
```bash
npm run dev
```
Open <http://localhost:3000>.

**Seeded accounts**
- Admin: `admin@techmed.ng` / `Admin@12345` (or your `SEED_ADMIN_*` values)
- Student: `student@techmed.ng` / `Student@123`

---

## 📦 Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | `prisma generate` + production build (also generates the service worker) |
| `npm run start` | Run the production build |
| `npm run db:push` | Sync the Prisma schema to the database |
| `npm run db:migrate` | Create & apply a dev migration |
| `npm run db:seed` | Seed reference data + sample questions |
| `npm run db:studio` | Open Prisma Studio |
| `npm run lint` | ESLint |

---

## 📥 Bulk Question Upload (CSV)

Admin → **Bulk Upload**. Download the template, then upload a CSV with this header:

```
subject, university, year, question, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty
```

- `subject` must match an existing subject **name or code** (case-insensitive).
- `correct_answer` ∈ `A | B | C | D`.
- `difficulty` ∈ `EASY | MEDIUM | HARD`.

Rows are parsed and validated client-side (Papa Parse); invalid rows are highlighted in the preview and skipped. Only valid rows are inserted.

---

## 🗂️ Project Structure

```
app/
  (auth)/            login & multi-step register (auth layout)
  (app)/             authenticated shell (top bar + bottom nav)
    dashboard/       personalized dashboard
    exam/            setup · play · results/[id]
    leaderboard/     4-scope leaderboard
    profile/         profile, badges, history, push opt-in
    admin/           overview · questions · questions/bulk · users · content
  api/               REST routes (auth, register, questions, exam, leaderboard,
                     history, heatmap, profile, push, admin/*)
  offline/           PWA offline fallback
components/
  ui/                shadcn/ui primitives + searchable combobox
  brand/ shared/ layout/ dashboard/ exam/ leaderboard/ profile/ admin/
lib/                 prisma, auth, validations (Zod), gamification, scoring,
                     services (session/stats), supabase, push, rate-limit, utils
prisma/              schema.prisma + seed.ts
store/               Zustand exam store (persisted)
types/               shared TypeScript types
worker/              custom service-worker push handlers (merged by next-pwa)
public/              manifest.json, icons, logo
```

---

## 🔔 Push Notifications

1. Generate VAPID keys: `npx web-push generate-vapid-keys`
2. Set `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` in `.env`.
3. Users enable reminders from **Profile → Daily streak reminders**.

The service worker (`worker/index.js`, merged into the generated `sw.js`) handles `push` and `notificationclick`.

> The PWA service worker is **disabled in development** and active in production builds. Run `npm run build && npm run start` to test PWA/offline behaviour.

---

## 🚢 Deployment (Vercel + Supabase)

1. Push the repo to GitHub and import it into Vercel.
2. Add all environment variables from `.env.example` in the Vercel dashboard.
3. Ensure `DATABASE_URL` uses the Supabase **pooler** URL (serverless-friendly).
4. Run `npm run db:push` (or `db:migrate deploy`) against your production DB once.
5. Deploy. The `build` script runs `prisma generate` automatically.

---

## 🎨 Brand

- **Navy** `#0A1628` · **Blue** `#0066CC` · **Cyan** `#00D4FF`
- Logo: the **TMS** shield monogram (vector recreation in `components/brand/logo.tsx`; raster icons in `public/icons`).
- Tagline: *Think Smart. Perform Elite.*

---

Built with ❤️ for Nigerian candidates. © TECHMED AIS Brainstorming.
