# Product Specification (In Progress)

This document outlines the detailed product design for Music Platform MVP.

## Core Principle

**Every feature must answer: "Does this increase time spent, referrals, engagement, or LTV?"**

If not, it doesn't ship. Period.

---

## MVP Feature Set

### 1. User Profiles & Authentication

**Goal:** Quick signup, identity, taste summary visible to others

**Features:**
- Signup via Google/Apple (no email/password friction)
- Minimal profile setup (name, avatar, bio, favorite genres)
- Public profile showing:
  - Last 50 songs/albums shared
  - Recent activity (what they're discussing)
  - Follower count
  - "Notable Commenter" badge (if applicable)
  - Links to external music profiles (optional: Spotify, Apple Music, SoundCloud)

**Why this works:**
- Low friction = more signups
- Public profiles = incentive to curate taste
- Taste visibility = discovery mechanism

---

### 2. Share a Song/Album/Artist

**Goal:** Core behavior that drives everything — sharing music they love

**Features:**
- One-click share from Spotify/Apple Music (if integrated) or manual entry
- Required: Minimum 1-2 sentence written thought (no empty shares)
- Optional: Image, link, timestamp (when you discovered it)
- Tags: Genre, mood, occasion, etc. (user-generated, discoverable)
- Visibility options: Public feed, friends only, or specific person
- Timestamp of share (enables time-based discovery: "What are people sharing today?")

**Why this works:**
- Written thoughts > likes (forces engagement, not just passivity)
- Tags enable discovery without algorithm (humans curate discovery)
- Options for sharing privately or with groups (safe for all moods/tastes)

---

### 3. Comments & Discussion

**Goal:** Core behavior that creates community and time-on-app

**Features:**
- Comments on any share (threaded)
- Upvote best comments (community curation, not algorithm)
- Downvote to reduce visibility (community moderation)
- Ban user/delete comment with mod tools (small team, aggressive moderation)
- "Notable Commenter" badge (earn through quality, verified musicians, critics, super-fans)
- No hearts/likes on individual comments (focus on quality discussion, not vanity metrics)

**Why this works:**
- Upvotes incentivize thoughtful comments over hot takes
- Badges incentivize super-users to build reputation
- Public moderation signals community health

---

### 4. Follow & Feed

**Goal:** Personalized discovery through friends + curated sources

**Features:**
- Follow individual users
- Follow genres (gets trending shares in that genre)
- Follow artists (if they have official profiles)
- Home feed: Mix of followed users + trending + recommendations
- Feed algorithm (simple rules first):
  - Recent shares from followed users (newest first)
  - High-engagement shares (trending, recent upvotes)
  - Algorithmic picks (simple similarity, data science to refine over time)
  - NEVER bury quality content for engagement bait

**Why this works:**
- Following friends creates network effects
- Genre following enables discovery without algorithm
- Artist following creates direct channel for musicians
- Simple algorithm at first; complex only when data demands it

---

### 5. Discover Page

**Goal:** Serendipitous discovery without requiring followers

**Features:**
- Trending by genre / region / mood
- "What's hot this week" (community consensus, not algorithm)
- Featured lists/playlists (curated by team or top commenters)
- New artists with official profiles
- Random discovery (shuffle button: "Surprise me")
- Search (by song, artist, user, tag)

**Why this works:**
- Genre/mood discovery = permission to explore
- Lists = curation layer (humans trusted more than algorithms)
- Search = low-friction pathway

---

### 6. User Settings & Privacy

**Goal:** Control over data and experience

**Features:**
- Privacy settings (public/friends-only/private)
- Notification preferences (digest, real-time, off)
- Block user
- Report content (automated + manual review)
- Export/delete account data (GDPR)
- No "dark patterns" or aggressive notifications

**Why this works:**
- User control = trust
- Privacy = safe space (people share weird music, niche tastes)

---

### 7. Moderation & Community Health

**Goal:** Safe, wholesome community

**Features:**
- Automated: Spam detection, link filtering, profanity flagging
- Manual: Small mod team reviews flagged content, bans users
- Ban list: Public (users see who got banned and why)
- Community guidelines: Clear, enforced, public
- Zero tolerance: Harassment, hate speech, bots, fake engagement

**Why this works:**
- Clear rules = safe community
- Public bans = signal that bad behavior has consequences
- Small team = consistency and relationships with users

---

## What We DON'T Build (MVP)

- ❌ Algorithm (use simple rules + trending + human curation)
- ❌ AI recommendations (not yet; future iteration)
- ❌ Bots or automation
- ❌ Ads (revenue comes from partnerships, not ads)
- ❌ Premium features (everything is free at launch)
- ❌ Social graph analysis (don't need it yet)
- ❌ Prediction markets (future exploration)
- ❌ Betting (future exploration)

**Why:** Less is more. Every feature creates maintenance burden and potential for toxicity. Focus on core behaviors first.

---

## User Journeys

### First-Time User

```
Sign up (Google) 
→ Set profile (name, avatar, genres)
→ Follow 3-5 friends or artists
→ Browse discover page
→ Share one song with thoughts
→ Read/upvote comments
→ Come back next day
```

**Success metric:** User shares at least 1 song in first session.

### Regular User (Weekly)

```
Open app
→ Check feed for friends' recent shares
→ Upvote/comment on 1-2 shares
→ Browse discover by mood
→ Share 1 new discovery
→ Chat with friend about a song
```

**Success metric:** Weekly active users increase, referrals grow.

### Engaged User (Daily)

```
Morning: Check feed (15 min)
→ Afternoon: Share discovery (5 min)
→ Evening: Read/comment (10 min)
→ Total: 30 min/day
→ Shares 3-5 songs/week
→ Invites friends (referral loop starts)
```

**Success metric:** Daily active users, referral coefficient, LTV.

---

## Key Behavioral Mechanics

### The Share Loop

1. User discovers music (Spotify, radio, friend recommendation)
2. User logs into app, shares with written thought
3. Friends see share, upvote, comment
4. Original sharer sees engagement, feels good
5. Friends invite other friends to see the discussion
6. New user sees active community, joins
7. Repeat

### The Discovery Loop

1. User opens feed, sees friends' shares
2. Discovers a song they've never heard
3. Adds to listening queue or playlist
4. Comes back to discuss it
5. Makes more friends based on taste similarity
6. Shares discoveries with friends
7. More users = more discovery fuel

### The Engagement Loop

1. User comments on a share (thoughtfully)
2. Gets upvotes, replies, connection
3. Feels part of community
4. Becomes "Notable Commenter"
5. Reputation incentivizes more quality engagement
6. Other users follow them
7. They bring their followers into discussions
8. Virtuous cycle

---

## Analytics & Measurement

**We obsess over these metrics:**

**Engagement:**
- Time spent on app (target: 30+ min/day for power users)
- Shares per user per week
- Comments per user per week
- Upvotes given per user
- Return rate (how many come back)

**Growth:**
- DAU / MAU
- Referrals sent per user
- Referral conversion rate
- Viral coefficient (if each user brings 1.2, we grow exponentially)
- Signup source (organic vs. referral vs. ambassador vs. paid)

**Retention:**
- D1, D7, D30 retention
- Cohort analysis (which user segments stick around?)
- Churn rate (why do people leave?)
- LTV vs. CAC

**Monetization (Phase 2+):**
- Partnership revenue per user
- Event revenue per user
- Premium conversion (if applicable)
- ARPU (average revenue per user)

**Community Health:**
- Moderation incidents per 1K users (should decrease)
- User satisfaction (NPS surveys)
- Report accuracy (are reports legitimate?)
- Ban effectiveness (does banning reduce bad behavior?)

---

## Technical Constraints (Not Detailed Yet)

- **No AI-generated content** — 100% human
- **No bot-accessible APIs** — Require human interaction
- **Data privacy by default** — Only store what we need
- **Security-first payment processing** — Use Stripe/Square for payments, don't store CC data
- **Mobile-first design** — App first, web second

---

## Open Product Questions

1. **Spotify/Apple integration:** Do we embed player, or just link? (Phase 2 decision)
2. **Algorithm depth:** When do we move beyond trending + human curation?
3. **Artist profiles:** Do we allow musicians to join, or curator-only initially?
4. **Geographic discovery:** Global or start with one region?
5. **Private groups:** Do friends create private communities for deeper conversations?
6. **Live features:** Chat during album drops, artist announcements?
7. **Content moderation:** Community-voted or team-driven?

---

## Next Steps

1. Review this spec with co-founder
2. Design wireframes for key screens (share, feed, discover, profile)
3. Gather user feedback from early adopters
4. Refine based on feedback
5. Build MVP (estimate: 6-8 weeks with 2-3 engineers)
