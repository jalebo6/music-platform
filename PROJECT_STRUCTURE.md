# 📁 Music Platform - Project Structure

Complete file structure of the Music Platform MVP.

---

## 📂 Directory Tree

```
music-platform/
│
├── 📄 Configuration Files
│   ├── .env.example              # Environment template
│   ├── .env.local                # Local environment (DO NOT COMMIT)
│   ├── .gitignore                # Git ignore rules
│   ├── next.config.js            # Next.js configuration
│   ├── next-env.d.ts             # Next.js TypeScript definitions (auto-generated)
│   ├── package.json              # Dependencies & scripts
│   ├── package-lock.json         # Locked dependency versions
│   ├── postcss.config.js         # PostCSS + Tailwind config
│   ├── tailwind.config.ts        # Tailwind CSS configuration
│   └── tsconfig.json             # TypeScript configuration
│
├── 📘 Documentation
│   ├── README.md                 # Main project documentation
│   ├── SETUP_INSTRUCTIONS.md     # Detailed setup guide
│   ├── DEPLOYMENT_CHECKLIST.md   # Step-by-step deployment
│   ├── APP_FLOW.md               # User journeys & app flow
│   └── PROJECT_STRUCTURE.md      # This file!
│
├── 🗄️ Database
│   ├── supabase_schema.sql       # Complete database schema (RUN FIRST!)
│   └── supabase_seed.sql         # Seed data (20 songs, 8 albums)
│
├── 📱 Application (Next.js App Router)
│   ├── app/
│   │   ├── layout.tsx            # Root layout (Navigation + global styles)
│   │   ├── page.tsx              # Home/Feed page
│   │   ├── globals.css           # Global Tailwind styles
│   │   │
│   │   ├── discover/
│   │   │   └── page.tsx          # Discover page (search, trending, genres)
│   │   │
│   │   ├── share/
│   │   │   └── page.tsx          # Share creation page
│   │   │
│   │   └── profile/
│   │       └── [id]/
│   │           └── page.tsx      # Dynamic user profile page
│   │
│   ├── components/
│   │   ├── Navigation.tsx        # Header/nav component
│   │   └── ShareCard.tsx         # Share display with comments
│   │
│   └── lib/
│       └── supabase.ts           # Supabase client + TypeScript types
│
└── 📁 docs/
    ├── COMPETITIVE_ANALYSIS.md   # Market research
    ├── GROWTH_STRATEGY.md        # Growth plan
    ├── PRODUCT_SPEC.md           # Product specifications
    ├── README.md                 # Original README
    ├── ROADMAP.md                # Product roadmap
    └── VISION.md                 # Project vision
```

---

## 📄 File Descriptions

### Configuration Files

#### `.env.example`
Template for environment variables. Copy to `.env.local` and fill in Supabase keys.

#### `.env.local` (DO NOT COMMIT!)
Contains sensitive API keys:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

#### `.gitignore`
Prevents committing:
- `node_modules/`
- `.next/`
- `.env*.local`
- Build artifacts

#### `next.config.js`
Next.js configuration:
- Image remote patterns for Google avatars

#### `package.json`
Dependencies:
- `next` - Next.js framework
- `react` & `react-dom` - React library
- `@supabase/supabase-js` - Supabase client
- `tailwindcss` - CSS framework
- `typescript` - TypeScript support

Scripts:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

#### `postcss.config.js`
PostCSS configuration for Tailwind CSS processing.

#### `tailwind.config.ts`
Tailwind CSS configuration:
- Content paths for purging
- Custom theme extensions
- Color variables

#### `tsconfig.json`
TypeScript configuration:
- Strict mode enabled
- Path aliases: `@/*` → `./*`
- Next.js plugin enabled

---

### Documentation Files

#### `README.md`
Main project documentation:
- Quick start guide
- Features list
- Tech stack
- Deployment instructions
- Testing checklist

#### `SETUP_INSTRUCTIONS.md`
Detailed step-by-step setup guide:
1. Push to GitHub
2. Configure Supabase
3. Get API keys
4. Configure Google OAuth
5. Deploy to Vercel
6. Seed database

#### `DEPLOYMENT_CHECKLIST.md`
Checkbox-style deployment guide:
- Pre-deployment tasks
- Supabase configuration
- Vercel deployment
- Testing steps
- Post-deployment tasks

#### `APP_FLOW.md`
Visual guide to app flow:
- Site map
- User journeys
- Page breakdowns
- Component interactions
- Data flow examples

#### `PROJECT_STRUCTURE.md`
This file! Complete project structure documentation.

---

### Database Files

#### `supabase_schema.sql` (CRITICAL!)
Complete database schema:
- **Tables**: users, shares, comments, follows, upvotes
- **RLS Policies**: Row-level security for all tables
- **Indexes**: For query performance
- **Triggers**: Auto user creation, upvote count updates
- **Functions**: handle_new_user(), update_comment_upvotes()

**Must run this before the app will work!**

#### `supabase_seed.sql`
Seed data for testing:
- 8 album shares (Pink Floyd, Daft Punk, etc.)
- 10 song shares (Radiohead, Jack Johnson, etc.)
- Thoughtful reviews for each

**Replace USER_UUID_1 and USER_UUID_2 before running!**

---

### Application Files

#### `app/layout.tsx`
Root layout component:
- Imports global CSS
- Renders Navigation component
- Wraps all pages with container
- Sets metadata (title, description)

#### `app/page.tsx`
Home/Feed page:
- Landing page for non-signed-in users
- Feed of all shares for signed-in users
- Real-time updates via Supabase
- "Share Music" button
- Uses ShareCard component

#### `app/globals.css`
Global styles:
- Tailwind directives (@tailwind base, components, utilities)
- CSS custom properties (--background, --foreground)
- Dark mode support

#### `app/discover/page.tsx`
Discover page:
- Search bar (filter shares by song/artist)
- Genre filter buttons
- Trending shares (left column)
- Popular users (right sidebar)
- Follow user functionality

#### `app/share/page.tsx`
Share creation page:
- Form with fields: title, artist, album, thought, tags
- Client-side validation
- Supabase insert on submit
- Redirects to feed after creation

#### `app/profile/[id]/page.tsx`
Dynamic user profile page:
- Shows user info (avatar, name, bio, share count)
- Edit bio (if own profile)
- Follow button (if other's profile)
- List of all user's shares
- Empty state with CTA

#### `components/Navigation.tsx`
Header/nav component:
- Logo/brand link to home
- Nav links: Feed, Discover, Share
- Profile icon with avatar
- Sign in/out button
- Listens to auth state changes

#### `components/ShareCard.tsx`
Complex share display component:
- User avatar + name (links to profile)
- Time ago display
- Song/album info
- User's thought
- Tags display
- Comments toggle button
- Comments section:
  - Comment input (if signed in)
  - Comment list (sorted by upvotes)
  - Upvote buttons
  - Delete own comment

#### `lib/supabase.ts`
Supabase client setup:
- Creates Supabase client instance
- Exports `supabase` for use across app
- TypeScript database types (Database interface)
- Type safety for all Supabase queries

---

## 🎯 Key Components

### ShareCard Component
**Most complex component in the app**

Features:
- Displays share content
- Expandable comments section
- Comment input with real-time posting
- Upvote/downvote with optimistic updates
- Delete own comments
- Time ago formatting

State:
- `comments` - List of comments
- `newComment` - Comment input value
- `showComments` - Toggle comments visibility
- `user` - Current signed-in user

---

## 📊 Data Flow

### Pages → Supabase
All pages query Supabase directly (no API routes needed):

```
Page Component
  ↓
useState/useEffect
  ↓
supabase.from('table').select()
  ↓
RLS checks authentication
  ↓
Returns data
  ↓
setState(data)
  ↓
Render UI
```

### Forms → Database
Form submissions go through Supabase client:

```
User fills form
  ↓
onSubmit handler
  ↓
supabase.from('table').insert()
  ↓
RLS validates user
  ↓
Insert succeeds/fails
  ↓
Navigate or show error
```

---

## 🎨 Styling System

### Tailwind CSS Classes Used
- **Layout**: `container`, `mx-auto`, `px-4`, `max-w-6xl`
- **Flexbox**: `flex`, `space-x-*`, `space-y-*`, `justify-*`, `items-*`
- **Grid**: `grid`, `grid-cols-*`, `gap-*`
- **Colors**: `bg-*`, `text-*`, `border-*`
- **Spacing**: `p-*`, `m-*`, `py-*`, `px-*`
- **Typography**: `text-*`, `font-*`, `leading-*`
- **Borders**: `rounded-*`, `border-*`
- **Shadows**: `shadow-*`
- **Transitions**: `transition`, `hover:*`
- **Dark mode**: `dark:*`

### Color Palette
```
Primary: Blue
  - bg-blue-500 (buttons)
  - text-blue-500 (links)
  - hover:bg-blue-600

Background:
  - bg-white (light mode cards)
  - bg-gray-50 (light mode page)
  - dark:bg-gray-800 (dark mode cards)
  - dark:bg-gray-900 (dark mode page)

Text:
  - text-gray-900 (primary text)
  - text-gray-600 (secondary text)
  - text-gray-500 (muted text)
  - dark:text-white
  - dark:text-gray-300

Tags/Pills:
  - bg-blue-100 (light)
  - text-blue-800 (dark text)
```

---

## 🔧 Scripts

```bash
# Development
npm run dev          # Start dev server (localhost:3000)

# Production
npm run build        # Build for production
npm start            # Start production server

# Linting
npm run lint         # Run ESLint (Next.js built-in)
```

---

## 📦 Dependencies

### Production
- `next` (15.5.12) - Next.js framework
- `react` (19.0.0) - React library
- `react-dom` (19.0.0) - React DOM
- `@supabase/supabase-js` (2.48.1) - Supabase client
- `@supabase/auth-helpers-nextjs` (0.15.0) - Auth helpers (deprecated but works)

### Development
- `typescript` (5.7.3) - TypeScript
- `@types/node` (22.14.1) - Node types
- `@types/react` (19.0.11) - React types
- `@types/react-dom` (19.0.3) - React DOM types
- `tailwindcss` (4.1.1) - Tailwind CSS
- `@tailwindcss/postcss` (4.1.1) - Tailwind PostCSS plugin
- `postcss` (8.5.2) - PostCSS
- `autoprefixer` (10.4.21) - Autoprefixer

---

## 🚀 Build Output

After running `npm run build`:

```
Route (app)                              Size  First Load JS
┌ ○ /                                 2.43 kB         163 kB
├ ○ /_not-found                         994 B         103 kB
├ ○ /discover                         2.78 kB         164 kB
├ ƒ /profile/[id]                      2.8 kB         164 kB
└ ○ /share                            1.51 kB         154 kB
+ First Load JS shared by all           102 kB
```

**Legend:**
- `○` Static - Pre-rendered at build time
- `ƒ` Dynamic - Server-rendered on demand

---

## 🔒 Security Files

### `.env.local` (NEVER COMMIT!)
Contains:
- Supabase URL (public)
- Supabase anon key (public but restricted)

### `.gitignore`
Prevents committing:
- `.env*.local` files
- `node_modules/`
- Build artifacts
- OS files (.DS_Store)

---

## 📈 Stats

- **Total Files**: ~25 (excluding node_modules, .git, .next)
- **Total Lines of Code**: ~4,000
- **Components**: 2 (Navigation, ShareCard)
- **Pages**: 4 (Feed, Discover, Share, Profile)
- **Database Tables**: 5
- **Database Functions**: 2
- **Database Triggers**: 2
- **TypeScript**: 100% coverage
- **Build Time**: ~2 seconds
- **Production Bundle**: ~163 KB First Load JS

---

## 🎯 Next Steps

1. **Push to GitHub** - `git push origin app/mvp-build`
2. **Configure Supabase** - Run schema SQL
3. **Deploy to Vercel** - Import project + add env vars
4. **Test** - Follow testing checklist
5. **Invite Beta Testers** - Jacob & Harrison

See `DEPLOYMENT_CHECKLIST.md` for detailed steps!

---

**Questions?** All files are well-commented. Read the code!

**Ready to ship!** 🚀
