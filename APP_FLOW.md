# 🎵 Music Platform - App Flow & User Journeys

Visual guide to how the Music Platform MVP works.

---

## 🗺️ Site Map

```
┌─────────────────────────────────────────────────────────────┐
│                      🏠 Landing / Feed                       │
│  - If not signed in: Welcome + "Sign in with Google" button │
│  - If signed in: Chronological feed of all shares           │
├─────────────────────────────────────────────────────────────┤
│                    Navigation (Always Visible)               │
│  [MusicPlatform] | Feed | Discover | Share | [Profile] 🔵   │
└─────────────────────────────────────────────────────────────┘
          │              │           │          │
          │              │           │          └──────────┐
          │              │           │                     │
          ▼              ▼           ▼                     ▼
    ┌─────────┐  ┌─────────────┐  ┌────────┐  ┌──────────────────┐
    │  Feed   │  │   Discover  │  │ Share  │  │ Profile Page     │
    │  Page   │  │    Page     │  │  Page  │  │ /profile/[id]    │
    └─────────┘  └─────────────┘  └────────┘  └──────────────────┘
```

---

## 👤 User Journey 1: New User First Visit

```
1. Land on homepage (not signed in)
   └─> See welcome message: "Music Platform - Letterboxd for music"
   └─> Big "Sign in with Google" button

2. Click "Sign in with Google"
   └─> Redirect to Google OAuth
   └─> User authorizes with Google account

3. Redirect back to app
   └─> Supabase creates user account automatically
   └─> User profile created with:
       - Name (from Google)
       - Avatar (from Google)
       - Email (from Google)
       - Bio: empty (can edit later)

4. Now viewing feed as signed-in user
   └─> See "Share Music" button in top-right
   └─> See navigation with all pages
   └─> See profile icon (clickable)
```

---

## 🎵 User Journey 2: Share Music

```
1. Click "Share Music" button (or navigate to /share)

2. Fill out share form:
   ├─ Song/Album Title* (required)
   ├─ Artist* (required)
   ├─ Album (optional)
   ├─ Your Thoughts* (required, textarea)
   └─ Tags (optional, comma-separated)

3. Click "Share" button
   └─> Creates new share in database
   └─> Redirect to feed

4. See your share in the feed immediately
   └─> Shows at top (newest first)
   └─> Displays with your profile picture
   └─> Tags shown as blue pills
   └─> "Show Comments" button visible
```

---

## 💬 User Journey 3: Comment & Upvote

```
1. View feed with shares

2. Click "Show Comments" on any share
   └─> Expands to show:
       - Comment input box (if signed in)
       - Existing comments (sorted by upvotes)

3. Type comment and press Enter or click "Post"
   └─> Comment appears immediately
   └─> Shows your profile pic + name + "just now"

4. See other comments with upvote button (↑)
   └─> Click upvote button
       - First click: upvote count +1
       - Second click: removes upvote (count -1)
       - Only one upvote per user per comment

5. Delete your own comments
   └─> "Delete" button only appears on your comments
   └─> Click to remove comment
```

---

## 🔍 User Journey 4: Discover Music

```
1. Navigate to Discover page

2. See three main sections:
   ├─ Search bar at top
   ├─ Genre filter buttons
   └─ Trending shares (left)
   └─ Popular Users (right sidebar)

3. Search for music:
   └─> Type song or artist name
   └─> Press Enter or click "Search"
   └─> Results filter to matches

4. Filter by genre:
   └─> Click genre button (rock, hip-hop, etc.)
   └─> Feed filters to shares with that tag
   └─> Genre button highlights in blue

5. Follow users:
   └─> See "Popular Users" in sidebar
   └─> Click "Follow" button
   └─> Button changes to "Following"
   └─> (Future: personalized feed based on follows)

6. Click "All" to reset filters
```

---

## 👤 User Journey 5: View & Edit Profile

```
1. Click profile icon in navigation
   └─> Goes to /profile/[your-id]

2. View your profile:
   ├─ Avatar (from Google)
   ├─ Name (from Google)
   ├─ Bio (editable)
   ├─ Share count
   └─ All your shares below

3. Edit profile:
   └─> Click "Edit Profile" button
   └─> Bio becomes editable textarea
   └─> Type new bio
   └─> Click "Save"
   └─> Bio updates instantly

4. View others' profiles:
   └─> Click any user's name or avatar
   └─> See their profile + shares
   └─> "Follow" button instead of "Edit Profile"
```

---

## 🔄 Real-Time Features

The app uses Supabase Realtime for live updates:

```
📡 Real-Time Updates:
├─ New shares appear in feed without refresh
├─ New comments appear immediately
├─ Upvote counts update in real-time
└─ Profile changes sync across sessions

💾 Database Triggers:
├─ User profile auto-created on Google sign-in
└─ Comment upvote counts auto-update on upvote/downvote
```

---

## 🎨 Page-by-Page Breakdown

### 1. Feed Page (`/`)
**Purpose:** Home page, main feed of all shares  
**Components:**
- Navigation header
- "Share Music" button (top-right, if signed in)
- List of ShareCard components
- Each card shows:
  - User avatar + name (clickable → profile)
  - Time ago ("2h ago", "just now")
  - Song/album title + artist
  - User's thoughts
  - Tags (blue pills)
  - "Show/Hide Comments" button
  - Comments section (expandable)

**States:**
- Not signed in: Welcome screen + Google sign-in button
- Signed in, no shares: "Be the first to share!" message
- Signed in, with shares: Feed view

---

### 2. Discover Page (`/discover`)
**Purpose:** Explore trending music, search, filter by genre  
**Layout:**
- Search bar + Search button (top)
- Genre filter buttons (All, rock, hip-hop, etc.)
- Two columns:
  - Left (2/3): Trending shares or search results
  - Right (1/3): Popular Users sidebar

**Features:**
- Search songs/artists (filters shares)
- Filter by genre (filters by tags)
- Follow users from sidebar
- Click "All" to reset

---

### 3. Share Page (`/share`)
**Purpose:** Create new share (song or album)  
**Form Fields:**
- Song/Album Title* (required)
- Artist* (required)
- Album (optional)
- Your Thoughts* (required, textarea, 6 rows)
- Tags (optional, comma-separated)

**Actions:**
- "Share" button (blue, primary)
- "Cancel" button (gray, returns to feed)

**Validation:**
- Title, Artist, Thoughts are required
- Tags automatically split by commas
- On submit: redirects to feed

---

### 4. Profile Page (`/profile/[id]`)
**Purpose:** User profile with bio and all shares  
**Sections:**
- Header card:
  - Avatar (large, 96x96)
  - Name
  - Bio (editable if own profile)
  - Share count
  - "Edit Profile" or "Follow" button
- Shares section:
  - "Your Shares" or "[Name]'s Shares"
  - List of ShareCard components
  - Empty state: "No shares yet" + "Share Your First Song" button

**Edit Mode:**
- Click "Edit Profile"
- Bio becomes textarea
- "Save" button appears
- Click "Save" to update

---

## 🎯 Key Interactions

### ShareCard Component (Most Complex)
```
ShareCard
├─ Header
│  ├─ Avatar (clickable → profile)
│  ├─ Name (clickable → profile)
│  └─ Time ago
├─ Content
│  ├─ Title + Artist + Album
│  ├─ Thought text
│  └─ Tags (blue pills)
├─ Comments Toggle
│  └─ "Show/Hide Comments (count)"
└─ Comments Section (when expanded)
   ├─ Comment Input (if signed in)
   │  ├─ Text input
   │  └─ "Post" button
   └─ Comment List (sorted by upvotes desc)
      └─ Each comment:
         ├─ Avatar + Name + Time ago
         ├─ Comment text
         ├─ Upvote button (↑ count)
         └─ Delete button (if own comment)
```

---

## 🔐 Authentication Flow

```
Google OAuth Flow:
1. User clicks "Sign in with Google"
2. Redirect to Google OAuth consent screen
3. User approves (email, profile access)
4. Google redirects back with code
5. Supabase exchanges code for session token
6. Database trigger creates user profile automatically
7. User lands on feed as signed-in user

Session Management:
- Session stored in cookie (httpOnly)
- Persists across page reloads
- "Sign Out" button clears session
- Protected routes redirect to home if not signed in
```

---

## 📊 Data Flow Examples

### Creating a Share:
```
User fills form → Click "Share"
  ↓
Next.js API route (server-side)
  ↓
Supabase client inserts to "shares" table
  ↓
RLS policy checks: user_id matches auth.uid()
  ↓
Insert succeeds → Returns share ID
  ↓
Redirect to feed
  ↓
Feed queries shares (newest first)
  ↓
New share appears at top
```

### Upvoting a Comment:
```
User clicks upvote button (↑)
  ↓
Check if already upvoted (query upvotes table)
  ↓
If yes: DELETE upvote
If no: INSERT upvote
  ↓
Database trigger fires (update_comment_upvotes)
  ↓
Comment upvote count auto-updates
  ↓
UI re-fetches comments
  ↓
New upvote count displays
```

### Following a User:
```
User clicks "Follow" button
  ↓
Check if already following (query follows table)
  ↓
If yes: DELETE follow (unfollow)
If no: INSERT follow
  ↓
Button text updates ("Following" / "Follow")
  ↓
(Future: Feed filters to followed users)
```

---

## 🎨 UI/UX Details

### Color Scheme:
- **Primary**: Blue (#3B82F6) - buttons, links, active states
- **Background**: White / Dark gray (#0A0A0A)
- **Text**: Gray 900 / White
- **Accents**: Gray 50-700 for borders, cards

### Typography:
- **Headings**: Bold, large (text-3xl, text-2xl)
- **Body**: Regular (text-base)
- **Meta**: Small, muted (text-sm, text-gray-500)

### Spacing:
- Cards: p-6, rounded-lg, shadow-md
- Sections: space-y-6 (1.5rem vertical gap)
- Container: max-w-6xl, mx-auto, px-4

### Responsive:
- Mobile-first design
- Grid layout on large screens (3 columns on Discover)
- Stacks vertically on mobile
- Touch-friendly targets (py-2, px-4 minimum)

---

## 🚀 Performance

- **Static Generation**: Pages pre-rendered at build time where possible
- **Client-Side Rendering**: Dynamic data fetched on client (Supabase queries)
- **Image Optimization**: Next.js Image component for avatars
- **Code Splitting**: Automatic route-based code splitting
- **Caching**: Supabase client caches auth session

---

## 🔒 Security

- **RLS Policies**: Database-level security
- **Auth Required**: Protected routes check session
- **Own Data Only**: Users can only delete own comments/shares
- **CSRF Protection**: Built into Next.js + Supabase
- **Environment Variables**: API keys in .env.local (not committed)

---

## 📱 Responsive Breakpoints

```
Mobile: < 640px
  - Single column layout
  - Navigation stacks
  - Full-width cards

Tablet: 640px - 1024px
  - Two-column on Discover
  - Sidebar shows

Desktop: > 1024px
  - Three-column on Discover
  - Max width: 1152px (max-w-6xl)
  - Centered content
```

---

**Questions?** Refer to the code in each component for implementation details.

**Next:** Follow `DEPLOYMENT_CHECKLIST.md` to deploy!
