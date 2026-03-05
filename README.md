# Music Platform MVP

A Letterboxd-style platform for music. Share songs and albums with your thoughts, discover new music, and connect with other music lovers.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account
- Vercel account (for deployment)

### 1. Database Setup

1. Go to your Supabase project: https://supabase.com/dashboard/project/fhdthidolwyetbghopbp
2. Navigate to the SQL Editor
3. Run the `supabase_schema.sql` file to create all tables and policies
4. After creating test users (see step 3), run `supabase_seed.sql` to populate seed data

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://fhdthidolwyetbghopbp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

To get your Supabase keys:
1. Go to Project Settings > API in your Supabase dashboard
2. Copy the `URL` and `anon` key

### 3. Configure Google OAuth

1. In Supabase dashboard, go to Authentication > Providers
2. Enable Google provider
3. Add authorized redirect URIs:
   - `http://localhost:3000` (for development)
   - Your Vercel deployment URL (for production)

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Features

### Core MVP Features (Implemented)
1. ✅ **Authentication** - Google sign-in via Supabase
2. ✅ **User Profiles** - Name, avatar, bio, edit capabilities
3. ✅ **Share Song/Album** - Title, artist, album, written thoughts, tags
4. ✅ **Feed** - Chronological feed of all shares with real-time updates
5. ✅ **Comments** - Threaded comments with upvoting, delete own comments
6. ✅ **Follow System** - Follow users and genres
7. ✅ **Discover Page** - Trending by genre, search songs/artists/users

### Seed Data Included
- 8 album shares (Dark Side of the Moon, Alive 2007, Homework, etc.)
- 10 song shares (Creep, Iris, Banana Pancakes, etc.)

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub:
```bash
git add .
git commit -m "Initial MVP build"
git push origin app/mvp-build
```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Import your GitHub repository
4. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

Vercel will auto-deploy on every push to the branch.

### Update Supabase Auth Redirect

After deployment, add your Vercel URL to Supabase:
1. Go to Authentication > URL Configuration
2. Add your Vercel URL to Site URL and Redirect URLs

## 🧪 Testing

### Beta Testers
Invite these users to test:
- Jacob Lebowitz: jalebo6@gmail.com
- Harrison Lieber: harrisonlieber@yahoo.com

### Test Flow
1. Sign in with Google
2. Edit profile (add bio)
3. Share a song with thoughts
4. Browse feed
5. Comment on shares
6. Upvote comments
7. Follow other users
8. Use Discover page to search and filter
9. Test on mobile (responsive design)

## 📊 Database Schema

### Tables
- `users` - User profiles (synced with Supabase auth)
- `shares` - Songs/albums shared by users
- `comments` - Comments on shares
- `follows` - User following users or genres
- `upvotes` - Upvotes on comments (one per user per comment)

### Key Features
- Row Level Security (RLS) enabled on all tables
- Automatic user profile creation on signup
- Automatic upvote count updates via triggers
- Real-time subscriptions support

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Hosting**: Vercel (frontend), Supabase (backend)
- **Auth**: Google OAuth via Supabase

## 📝 TODO / Phase 2 Improvements

- Spotify/Apple Music API integration for album artwork
- Notifications for comments/follows
- Direct messaging between users
- User taste profiles with favorite genres/artists
- Playlists/collections feature
- Activity feed with follow-based filtering
- Email notifications for new followers/comments

## 🔒 Security

- Environment variables for all secrets
- Row Level Security (RLS) policies on all database tables
- Authenticated routes protected
- Users can only delete their own comments/shares
- CORS configured for Supabase

## 📄 License

Private - All Rights Reserved

---

**Built with ❤️ by Jacob Lebowitz**

For issues or questions, contact: jalebo6@gmail.com
