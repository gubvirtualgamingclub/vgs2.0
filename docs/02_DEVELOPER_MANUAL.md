# VGS 2.0 - Developer & Technical Manual

**Version:** 4.0.0  
**Last Updated:** December 12, 2025  
**For:** Developers, DevOps, & System Architects

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Setup & Installation](#setup--installation)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [Deployment](#deployment)
6. [Technical Implementation](#technical-implementation)
7. [Project Report & Budget](#project-report--budget)

---

## 🚀 Project Overview

VGS 2.0 is a modern, Next.js-based web platform for the Varsity Gaming Society. It features a high-performance frontend, real-time database integration via Supabase, and a custom admin panel for content management.

**Tech Stack:**

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Icons:** Heroicons, React Icons
- **Key Libraries:** `framer-motion` (animations), `@dnd-kit` (drag & drop), `react-hook-form`.

---

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 18.17+
- npm or pnpm
- Git

### 1. Clone & Install

```bash
git clone <repo-url>
cd VGS-2-0
npm install
```

### 2. Environment Configuration

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# Optional: Service role for server-side admin scripts
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

### 3. Database Setup

1. Create a Supabase project.
2. Go to SQL Editor.
3. Run the contents of `database/01_schema.sql` to create tables.
4. Run `database/02_seeds.sql` to seed initial data.

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`. Admin panel at `/admin`.

---

## 🏗️ Architecture

### Directory Structure

```
VGS-2-0/
├── app/                  # Next.js App Router
│   ├── (public)/         # Public facing pages
│   └── admin/            # Protected admin routes
├── components/           # React components
│   ├── ui/               # Reusable UI elements
│   └── ...feature        # Feature-specific components
├── lib/                  # Utilities & Logic
│   ├── supabase.ts       # Client init
│   └── supabase-queries.ts # DB operations
├── database/             # SQL Schema & Seeds
└── public/               # Static assets
```

### Authentication Flow

- **Client-side:** `lib/supabase.ts` initializes client.
- **Protection:** `middleware.ts` (or per-page checks) verifies session.
- **RLS:** Row Level Security in Postgres ensures data privacy (Admins have full access, Public has read-only for published).

---

## 🗄️ Database Schema

Refer to `database/01_schema.sql` for the authoritative schema.

**Core Tables:**

- `activities`: Events and workshops.
- `tournaments`: Competitive events.
- `games`: Supported game titles.
- `sponsors`: Partners and collaborators.
- `committee_members`: Profiles.
- `registration_forms`: Dynamic form configs.
- `registration_submissions`: Form data.

**Key Relationships:**

- `activities` <-> `sponsors` (Many-to-Many via `activity_sponsors`)
- `committees` -> `committee_members` (One-to-Many)

---

## 🌐 Deployment

**Recommended: Vercel**

1. Connect GitHub repo to Vercel.
2. Configure Environment Variables (`NEXT_PUBLIC_...`).
3. Deploy.

**Alternative: VPS/Docker**

- Build: `npm run build`
- Start: `npm start`
- Ensure Node.js 18+ environment.

---

## 💡 Technical Implementation Details

### Drag & Drop (Committee)

Implemented using `@dnd-kit/core` and `@dnd-kit/sortable`.

- **Sensors:** Pointer (constrained 8px) and Keyboard.
- **Persistence:** Updates `order_index` in DB on drag end.

### Registration Forms

- **Dynamic Fields:** Stored as JSONB in `registration_forms`.
- **Google Sheets Integration:**
  - Uses a Google Apps Script Web App as middleware.
  - Script endpoint URL stored in form config.
  - Form submissions sent via POST to Script URL.

### Email System

- **Backend:** Next.js Server Actions / API Routes.
- **Transport:** Nodemailer (SMTP).
- **Templates:** Stored in database, parsed with simple string replacement (`{{name}}`).

---

## 📊 Project Report & Budget

**Development Overview:**

- **Model:** AI-Assisted Solo Development.
- **Timeline:** Q4 2025.

**Cost Analysis (Year 1):**

- **Hosting:** $0 (Vercel Free Tier).
- **Database:** $0 (Supabase Free Tier).
- **Domain:** ~$15/year.
- **Maintenance:** Local dev time.
- **Estimated Total:** < $50/year for standard operation.

**Scalability:**

- Can scale to Pro plans (Vercel/Supabase) ~ $50/mo if traffic exceeds free limits.

**Contact:**

- VGS Development Team / Technical Lead.
