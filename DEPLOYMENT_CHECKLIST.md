# 🚀 Deployment Checklist

Use this checklist to deploy the Music Platform MVP step-by-step.

---

## Pre-Deployment

- [ ] **Step 1: Push to GitHub**
  ```bash
  cd /Users/jacoblebowitz/.openclaw/workspace/music-platform
  git push origin app/mvp-build
  ```
  (If prompted, use GitHub Personal Access Token from https://github.com/settings/tokens)

---

## Supabase Configuration

- [ ] **Step 2: Run Database Schema**
  - Go to: https://supabase.com/dashboard/project/fhdthidolwyetbghopbp/sql/new
  - Copy entire `supabase_schema.sql` file
  - Paste and click **Run**
  - Verify all tables created (users, shares, comments, follows, upvotes)

- [ ] **Step 3: Get API Keys**
  - Go to: https://supabase.com/dashboard/project/fhdthidolwyetbghopbp/settings/api
  - Copy **URL** and **anon public** key
  - Update `.env.local` with real values

- [ ] **Step 4: Configure Google OAuth**
  - Go to: https://supabase.com/dashboard/project/fhdthidolwyetbghopbp/auth/providers
  - Enable **Google** provider
  - Add redirect URLs:
    - `http://localhost:3000/**`
    - (Will add Vercel URL after deployment)

---

## Deployment

- [ ] **Step 5: Deploy to Vercel**
  - Go to: https://vercel.com/dashboard
  - Click **Add New** → **Project**
  - Import `jalebo6/music-platform` from GitHub
  - Set branch to: `app/mvp-build`
  - Add environment variables:
    ```
    NEXT_PUBLIC_SUPABASE_URL=https://fhdthidolwyetbghopbp.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>
    ```
  - Click **Deploy**
  - Save the deployed URL (e.g., `https://music-platform-xyz.vercel.app`)

- [ ] **Step 6: Update Supabase Redirect**
  - Go to: https://supabase.com/dashboard/project/fhdthidolwyetbghopbp/auth/url-configuration
  - Set **Site URL** to your Vercel URL
  - Add to **Redirect URLs**: `https://your-vercel-url.vercel.app/**`

---

## Testing

- [ ] **Step 7: Create Test Users**
  - Visit your deployed URL
  - Sign in with: jalebo6@gmail.com (Google OAuth)
  - Edit profile, add a bio
  - Sign in with: harrisonlieber@yahoo.com (Google OAuth)
  - Edit profile, add a bio

- [ ] **Step 8: Seed Database**
  - Note both user IDs from profile URLs
  - Edit `supabase_seed.sql`:
    - Replace `USER_UUID_1` with Jacob's ID
    - Replace `USER_UUID_2` with Harrison's ID
  - Run seed SQL in Supabase SQL Editor

- [ ] **Step 9: Test All Features**
  - [ ] Sign in/out works
  - [ ] Profile editing works
  - [ ] Share a song
  - [ ] Comment on a share
  - [ ] Upvote a comment
  - [ ] Delete own comment
  - [ ] Follow another user
  - [ ] Search for music
  - [ ] Filter by genre
  - [ ] View other user's profile
  - [ ] Test on mobile device

---

## Post-Deployment

- [ ] **Step 10: Invite Beta Testers**
  - Send deployed URL to:
    - Jacob Lebowitz: jalebo6@gmail.com
    - Harrison Lieber: harrisonlieber@yahoo.com

- [ ] **Step 11: Monitor for Issues**
  - Check Vercel logs: https://vercel.com/dashboard
  - Check Supabase logs: https://supabase.com/dashboard/project/fhdthidolwyetbghopbp/logs/explorer

---

## 🎉 Success!

When all boxes are checked, the Music Platform MVP is live and ready for use!

**Deployed URL:** _________________________

**Ready for beta testing:** [ ] YES

**Next Phase:** Gather feedback and plan Phase 2 features

---

**Estimated Time:** 30-45 minutes

**Last Updated:** March 4, 2026 @ 21:42 EST
