# Lists & Profile Tabs Feature - Setup Guide

## Overview
This document explains the new Lists feature and enhanced Profile tabs that have been added to the music platform.

## Features Added

### 1. Lists Feature
Users can now create curated lists of albums (like "Best Indie Albums", "Sad Albums", etc.).

**What you can do:**
- Create lists with titles and descriptions
- Search and add albums to lists
- View lists with album grids
- Like and comment on lists
- Delete your own lists

### 2. Enhanced Profile Tabs
The profile page now has 6 tabs instead of 2:

1. **Diary** - Chronological listening log with dates, ratings, and reviews
2. **Albums** - Grid view of all albums user has logged
3. **Reviews** - All reviews user has written
4. **Lists** - User's created lists
5. **Listen Later** - Albums saved for later
6. **Activity** - Timeline of likes, comments, logs, and list creation

## Database Setup

### Step 1: Run the Migration
Run the migration SQL file to create all necessary tables:

```bash
# Connect to your Supabase database or use Supabase SQL Editor
psql -h your-db-host -U your-user -d your-db -f supabase_migration_lists_logs.sql
```

Or in Supabase Dashboard:
1. Go to SQL Editor
2. Copy contents of `supabase_migration_lists_logs.sql`
3. Execute

This creates:
- `albums` table
- `lists` table
- `list_items` table
- `listening_logs` table
- `list_likes` table
- `list_comments` table
- `activity_log` table

### Step 2: Seed Sample Albums
Populate the database with sample albums so users can create lists:

```bash
psql -h your-db-host -U your-user -d your-db -f seed_albums.sql
```

Or in Supabase Dashboard:
1. Go to SQL Editor
2. Copy contents of `seed_albums.sql`
3. Execute

This adds 50 classic albums across various genres.

## New Routes

### Lists Routes
- `/lists/new` - Create a new list
- `/lists/[id]` - View a specific list

### Profile Route (Enhanced)
- `/profile/[id]` - Enhanced with 6 tabs

## Usage Guide

### Creating a List

1. Go to your profile
2. Click "Create List" button
3. Enter a title and optional description
4. Search for albums using the search box
5. Click albums to add them to your list
6. Click "Create List" to save

### Viewing a List

- Click on any list to see:
  - Album grid
  - Author information
  - Like count and like button
  - Comments section
  - Delete button (if you're the owner)

### Using Profile Tabs

**Diary Tab:**
- Shows all albums you've logged with dates
- Displays ratings and review snippets
- Most recent entries first

**Albums Tab:**
- Grid view of all albums you've shared/logged
- Quick visual overview

**Reviews Tab:**
- All your written reviews
- Shows album cover, rating, and full review text

**Lists Tab:**
- All lists you've created
- Click to view or edit

**Listen Later Tab:**
- Albums you've saved to listen to later
- Grid view like Albums tab

**Activity Tab:**
- Timeline of all your actions:
  - Album logs
  - List creation
  - Likes
  - Comments

## Database Schema Reference

### albums
```sql
id          UUID PRIMARY KEY
title       TEXT NOT NULL
artist      TEXT NOT NULL
cover_url   TEXT
spotify_id  TEXT
created_at  TIMESTAMP
UNIQUE(title, artist)
```

### lists
```sql
id          UUID PRIMARY KEY
user_id     UUID REFERENCES users(id)
title       TEXT NOT NULL
description TEXT
created_at  TIMESTAMP
```

### list_items
```sql
id          UUID PRIMARY KEY
list_id     UUID REFERENCES lists(id)
album_id    UUID REFERENCES albums(id)
item_order  INTEGER
created_at  TIMESTAMP
```

### listening_logs
```sql
id          UUID PRIMARY KEY
user_id     UUID REFERENCES users(id)
album_id    UUID REFERENCES albums(id)
date_logged TIMESTAMP
rating      INTEGER (1-5)
review      TEXT
listen_later BOOLEAN
created_at  TIMESTAMP
```

### list_likes
```sql
id          UUID PRIMARY KEY
list_id     UUID REFERENCES lists(id)
user_id     UUID REFERENCES users(id)
created_at  TIMESTAMP
UNIQUE(list_id, user_id)
```

### list_comments
```sql
id          UUID PRIMARY KEY
list_id     UUID REFERENCES lists(id)
user_id     UUID REFERENCES users(id)
text        TEXT NOT NULL
created_at  TIMESTAMP
```

### activity_log
```sql
id            UUID PRIMARY KEY
user_id       UUID REFERENCES users(id)
activity_type TEXT NOT NULL
target_type   TEXT
target_id     UUID
metadata      JSONB
created_at    TIMESTAMP
```

## API Queries Used

The feature uses Supabase's client-side queries:

**Fetch user's lists:**
```typescript
const { data } = await supabase
  .from("lists")
  .select("*")
  .eq("user_id", userId)
  .order("created_at", { ascending: false });
```

**Fetch list with items:**
```typescript
const { data } = await supabase
  .from("list_items")
  .select(`
    id,
    item_order,
    albums (
      id,
      title,
      artist,
      cover_url
    )
  `)
  .eq("list_id", listId)
  .order("item_order", { ascending: true });
```

**Create a list:**
```typescript
const { data } = await supabase
  .from("lists")
  .insert({
    user_id: user.id,
    title: "My List",
    description: "Description"
  })
  .select()
  .single();
```

## Testing Checklist

- [ ] Run migration SQL
- [ ] Seed sample albums
- [ ] Create a new list
- [ ] Add albums to list
- [ ] View list page
- [ ] Like a list
- [ ] Comment on a list
- [ ] View profile Diary tab
- [ ] View profile Albums tab
- [ ] View profile Reviews tab
- [ ] View profile Lists tab
- [ ] View profile Listen Later tab
- [ ] View profile Activity tab
- [ ] Delete a list (if owner)
- [ ] Test mobile responsiveness

## Troubleshooting

### "No albums found when searching"
- Make sure you ran the `seed_albums.sql` script
- Check that the `albums` table exists and has data

### "Profile tabs not loading"
- Check browser console for errors
- Verify all tables were created with migration
- Check RLS policies are enabled

### "Can't create list"
- Verify user is authenticated
- Check that `lists` and `list_items` tables exist
- Check browser console for specific errors

## Next Steps / Future Enhancements

- [ ] Add album cover images (Spotify API integration)
- [ ] Drag-and-drop reordering of albums in lists
- [ ] List visibility settings (public/private)
- [ ] Featured lists on homepage
- [ ] List of the week
- [ ] Search lists by name or description
- [ ] Share lists on social media
- [ ] Export list as text/image
- [ ] Collaborative lists

## Files Modified/Created

### New Files
- `app/lists/new/page.tsx` - Create list form
- `app/lists/[id]/page.tsx` - View list page
- `supabase_migration_lists_logs.sql` - Database migration
- `seed_albums.sql` - Sample album data
- `LISTS_FEATURE_SETUP.md` - This file

### Modified Files
- `app/profile/[id]/page.tsx` - Enhanced with 6 tabs and diary functionality

### Unchanged Files (but compatible)
- `app/globals.css` - Already had album-grid and album-cover classes
- `components/Navigation.tsx` - Navigation works with new routes
- `lib/supabase.ts` - Supabase client
- `supabase_schema.sql` - Original schema (still valid)

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check Supabase logs for database errors
3. Verify all SQL scripts ran successfully
4. Ensure RLS policies are enabled
5. Test with a clean browser session (clear cache)

---

Built with ❤️ for music lovers everywhere.
