# 🔗 LinkVault

A modern, AI-powered SaaS bookmark manager built with Next.js 15, Supabase, and TypeScript.

Save links, auto-fetch metadata, organize with collections, AI-powered tagging, and share beautiful public pages.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38bdf8)

---

## ✨ Features

- **Google OAuth + Email Auth** — Sign in with Google or email/password
- **Smart Link Saving** — Paste a URL, auto-fetch title, description, favicon & og:image
- **AI Auto-Tagging** — Optional Google Gemini integration for automatic categorization
- **Collections** — Organize links into folders, set public or private
- **Favorites** — Quick-access to your most important links
- **Full-Text Search** — Search across titles, descriptions, URLs, tags, and notes
- **Public Collections** — Share beautiful read-only collection pages with anyone
- **Realtime Updates** — New links appear instantly across browser tabs
- **Dark Mode** — Premium dark theme by default
- **Responsive** — Full mobile support with collapsible sidebar
- **Row Level Security** — Your data is private and secure

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** installed
- **npm** installed
- A free **Supabase** account

---

### Step 1: Clone & Install

```bash
cd LinkVault/linkvault
npm install
```

---

### Step 2: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and click **"Start your project"**
2. Sign in with GitHub (or create an account)
3. Click **"New Project"**
4. Fill in:
   - **Name**: `linkvault` (or any name you like)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Pick the closest to you
5. Click **"Create new project"** and wait ~2 minutes for it to set up

---

### Step 3: Get Your Supabase Keys

1. In your Supabase project, go to **Settings** → **API** (in the left sidebar)
2. You'll see:
   - **Project URL** — Copy this (looks like `https://abcdefg.supabase.co`)
   - **anon public key** — Copy this (it's a long string starting with `eyJ...`)

---

### Step 4: Set Up Google OAuth

#### In Google Cloud Console:

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Go to **APIs & Services** → **Credentials**
4. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
5. If asked, configure the **OAuth consent screen** first:
   - User Type: **External**
   - Fill in app name & email
   - Add scopes: `email`, `profile`, `openid`
   - Save
6. Back to Credentials → New OAuth Client ID:
   - Application type: **Web application**
   - Name: `LinkVault`
   - **Authorized redirect URIs**: Add your Supabase callback URL:
     ```text
     https://vzgoclbgmcldldkfbutg.supabase.co/auth/v1/callback
     ```
     (Replace `YOUR-PROJECT-ID` with your actual Supabase project ID)
7. Click **Create** and copy the **Client ID** and **Client Secret**

#### In Supabase Dashboard:

1. Go to **Authentication** → **Providers**
2. Find **Google** and enable it
3. Paste your Google **Client ID** and **Client Secret**
4. Save

---

### Step 5: Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy the **entire contents** of `supabase/schema.sql` and paste it
4. Click **"Run"** (the green play button)
5. You should see: "Success. No rows returned" — this is correct!

This creates all tables (profiles, links, tags, link_tags, collections, collection_links) with full Row Level Security policies, a storage bucket for avatars, realtime subscriptions, and an auto-profile trigger.

---

### Step 6: Create Your .env.local File

Create a file called `.env.local` in the `linkvault` project root:

```env
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google OAuth — These go in Supabase Dashboard, NOT here
# (see Step 4 above)

# Optional - for AI auto-tagging (leave empty to disable)
GEMINI_API_KEY=

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Replace the Supabase values with your actual keys from Step 3.

---

### Step 7: Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the LinkVault landing page! 🎉

---

## 🤖 AI Auto-Tagging (Optional)

The AI tagging feature uses **Google Gemini** and is **disabled by default**. The app works 100% without it.

To enable:

1. Go to [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Click **"Create API Key"** (free!)
3. Copy the key
4. Add it to your `.env.local`:
   ```env
   GEMINI_API_KEY=your-gemini-api-key-here
   ```
5. Restart the dev server

When enabled, you'll see a ✨ "AI Suggest" button when saving links that automatically suggests relevant tags.

---

## 🌍 Deploy to Vercel

1. Push your code to GitHub
2. Go to [https://vercel.com](https://vercel.com) and import your repo
3. Add your environment variables in Vercel's project settings
4. Update `NEXT_PUBLIC_APP_URL` to your Vercel domain
5. In Supabase → Authentication → URL Configuration:
   - Add your Vercel domain to **Redirect URLs**: `https://your-app.vercel.app/auth/callback`
6. In Google Cloud Console → OAuth credentials:
   - Add Vercel callback to **Authorized redirect URIs**: `https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback`
7. Deploy! 🚀

---

## 📁 Project Structure

```
linkvault/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── layout.tsx                  # Root layout (providers)
│   │   ├── login/page.tsx              # Login page
│   │   ├── signup/page.tsx             # Signup page
│   │   ├── auth/callback/route.ts      # OAuth callback
│   │   ├── dashboard/
│   │   │   ├── layout.tsx              # Dashboard layout (sidebar + topbar)
│   │   │   ├── page.tsx                # Dashboard home
│   │   │   ├── links/page.tsx          # All links
│   │   │   ├── collections/
│   │   │   │   ├── page.tsx            # All collections
│   │   │   │   └── [id]/page.tsx       # Single collection
│   │   │   ├── favorites/page.tsx      # Favorited links
│   │   │   ├── explore/page.tsx        # Public collections
│   │   │   └── profile/page.tsx        # User profile
│   │   ├── explore/[id]/page.tsx       # Public collection view
│   │   └── api/
│   │       ├── metadata/route.ts       # URL metadata fetcher
│   │       └── ai/tags/route.ts        # AI tag suggestions
│   ├── components/                     # UI components
│   ├── hooks/                          # TanStack Query hooks
│   ├── lib/                            # Utilities, Supabase clients, types
│   └── providers/                      # React providers
├── supabase/schema.sql                 # Full database schema + RLS
├── .env.example                        # Environment variable template
└── README.md                           # This file
```

---

## 🔮 Future Features

This codebase is designed to be easily extendable:

- **Stripe Payments** — Add premium tiers with more storage/features
- **Chrome Extension** — Save links from any webpage with one click
- **AI Summarizer** — Generate summaries of saved links
- **Team Workspaces** — Collaborative collections for teams
- **Import/Export** — Import bookmarks from Chrome, Firefox, Pocket
- **Link Health Check** — Detect broken links automatically

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 15 (App Router) | Full-stack React framework |
| TypeScript | Type safety |
| Tailwind CSS 4 | Styling |
| shadcn/ui | UI components |
| Supabase | Auth, PostgreSQL, Realtime, Storage |
| @supabase/ssr | Server-side auth (modern approach) |
| TanStack Query v5 | Data fetching & caching |
| Zod | Schema validation |
| Framer Motion | Animations |
| Sonner | Toast notifications |
| Lucide React | Icons |
| next-themes | Dark/light mode |

---

## 📄 License

MIT — free to use, modify, and distribute.
