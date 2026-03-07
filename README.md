# Music Platform

Letterboxd for music. Share albums, discover new music, connect with listeners.

🌐 **Live:** https://music-platform-two-phi.vercel.app

---

## 🚀 Getting Started

### Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

### Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://fhdthidolwyetbghopbp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>
NEXT_PUBLIC_SITE_URL=https://your-vercel-url.vercel.app
```

Get keys from: https://supabase.com/dashboard/project/fhdthidolwyetbghopbp/settings/api

---

## ✨ Features

- **Authentication** - Google OAuth via Supabase
- **Profiles** - User profiles with avatar, bio
- **Share** - Share albums with thoughts
- **Feed** - Real-time activity feed
- **Discovery** - Search albums, artists, users
- **Social** - Comments, upvotes, follows

---

## 📦 Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)
- **Hosting:** Vercel
- **Database:** PostgreSQL with Row Level Security

---

## 📚 Strategic Docs

- `docs/VISION.md` — Product vision & thesis
- `docs/ROADMAP.md` — Build phases & timeline
- `docs/PRODUCT_SPEC.md` — Feature specification
- `docs/GROWTH_STRATEGY.md` — Growth playbook
- `docs/COMPETITIVE_ANALYSIS.md` — Market analysis

---

## 🔧 Deployment

Vercel auto-deploys from `main` branch. To deploy:

```bash
git push origin main
```

Update Supabase auth URLs after deployment:
https://supabase.com/dashboard/project/fhdthidolwyetbghopbp/auth/url-configuration

---

**Built by Jacob Lebowitz · jalebo6@gmail.com**
