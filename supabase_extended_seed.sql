-- Seed data for albums and artists
-- Run this after supabase_extended_schema.sql

-- Insert Artists
INSERT INTO public.artists (id, name, image_url, genres, bio, followers_count) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Daft Punk', 'https://i.scdn.co/image/ab6761610000e5eb0367495104bb6ea55d2c9923', ARRAY['Electronic', 'House', 'Dance'], 'French electronic music duo formed in 1993, known for their iconic robot helmets and groundbreaking dance music.', 0),
  ('22222222-2222-2222-2222-222222222222', 'Pink Floyd', 'https://i.scdn.co/image/ab6761610000e5eb7e47b60f45a37c1a2ec8aa0b', ARRAY['Progressive Rock', 'Psychedelic Rock'], 'Legendary British rock band known for philosophical lyrics, sonic experimentation, and elaborate live shows.', 0),
  ('33333333-3333-3333-3333-333333333333', 'Radiohead', 'https://i.scdn.co/image/ab6761610000e5eba03696716c9ee605006047fd', ARRAY['Alternative Rock', 'Art Rock', 'Electronic'], 'English rock band known for their experimental approach and influence on alternative music.', 0),
  ('44444444-4444-4444-4444-444444444444', 'Fleetwood Mac', 'https://i.scdn.co/image/ab6761610000e5eb8a0e7e7e7c6e9e5f9f8f9f8f', ARRAY['Rock', 'Pop Rock', 'Soft Rock'], 'British-American rock band, one of the best-selling groups of all time.', 0),
  ('55555555-5555-5555-5555-555555555555', 'The Beatles', 'https://i.scdn.co/image/ab6761610000e5ebe9348cc01ff5d55971b22433', ARRAY['Rock', 'Pop', 'Psychedelic Rock'], 'The most influential band in the history of popular music.', 0),
  ('66666666-6666-6666-6666-666666666666', 'Kendrick Lamar', 'https://i.scdn.co/image/ab6761610000e5eb437b9e2a82505b3d93ff1022', ARRAY['Hip Hop', 'Rap', 'West Coast Hip Hop'], 'Pulitzer Prize-winning rapper known for complex lyricism and social commentary.', 0)
ON CONFLICT (id) DO NOTHING;

-- Insert Albums
INSERT INTO public.albums (id, title, artist_id, cover_url, release_year, genres, album_type, ratings_count, reviews_count, average_rating, tracklist) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Discovery',
    '11111111-1111-1111-1111-111111111111',
    'https://i.scdn.co/image/ab67616d0000b273926f4e7a61db8c0b50999abd',
    2001,
    ARRAY['Electronic', 'House', 'Disco'],
    'album',
    0, 0, 0,
    '[
      {"number": 1, "title": "One More Time", "duration": "5:20"},
      {"number": 2, "title": "Aerodynamic", "duration": "3:27"},
      {"number": 3, "title": "Digital Love", "duration": "4:58"},
      {"number": 4, "title": "Harder, Better, Faster, Stronger", "duration": "3:44"},
      {"number": 5, "title": "Crescendolls", "duration": "3:31"},
      {"number": 6, "title": "Nightvision", "duration": "1:44"},
      {"number": 7, "title": "Superheroes", "duration": "3:57"},
      {"number": 8, "title": "High Life", "duration": "3:22"},
      {"number": 9, "title": "Something About Us", "duration": "3:51"},
      {"number": 10, "title": "Voyager", "duration": "3:47"},
      {"number": 11, "title": "Veridis Quo", "duration": "5:44"},
      {"number": 12, "title": "Short Circuit", "duration": "3:26"},
      {"number": 13, "title": "Face to Face", "duration": "4:00"},
      {"number": 14, "title": "Too Long", "duration": "10:00"}
    ]'::jsonb
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'The Dark Side of the Moon',
    '22222222-2222-2222-2222-222222222222',
    'https://i.scdn.co/image/ab67616d0000b273ea7caaff71dea1051d49b2fe',
    1973,
    ARRAY['Progressive Rock', 'Psychedelic Rock'],
    'album',
    0, 0, 0,
    '[
      {"number": 1, "title": "Speak to Me", "duration": "1:07"},
      {"number": 2, "title": "Breathe (In the Air)", "duration": "2:50"},
      {"number": 3, "title": "On the Run", "duration": "3:33"},
      {"number": 4, "title": "Time", "duration": "6:53"},
      {"number": 5, "title": "The Great Gig in the Sky", "duration": "4:48"},
      {"number": 6, "title": "Money", "duration": "6:22"},
      {"number": 7, "title": "Us and Them", "duration": "7:49"},
      {"number": 8, "title": "Any Colour You Like", "duration": "3:26"},
      {"number": 9, "title": "Brain Damage", "duration": "3:50"},
      {"number": 10, "title": "Eclipse", "duration": "2:06"}
    ]'::jsonb
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'OK Computer',
    '33333333-3333-3333-3333-333333333333',
    'https://i.scdn.co/image/ab67616d0000b273c8b444df094279e70d0ed856',
    1997,
    ARRAY['Alternative Rock', 'Art Rock'],
    'album',
    0, 0, 0,
    '[
      {"number": 1, "title": "Airbag", "duration": "4:44"},
      {"number": 2, "title": "Paranoid Android", "duration": "6:23"},
      {"number": 3, "title": "Subterranean Homesick Alien", "duration": "4:27"},
      {"number": 4, "title": "Exit Music (For a Film)", "duration": "4:24"},
      {"number": 5, "title": "Let Down", "duration": "4:59"},
      {"number": 6, "title": "Karma Police", "duration": "4:21"},
      {"number": 7, "title": "Fitter Happier", "duration": "1:57"},
      {"number": 8, "title": "Electioneering", "duration": "3:50"},
      {"number": 9, "title": "Climbing Up the Walls", "duration": "4:45"},
      {"number": 10, "title": "No Surprises", "duration": "3:48"},
      {"number": 11, "title": "Lucky", "duration": "4:19"},
      {"number": 12, "title": "The Tourist", "duration": "5:24"}
    ]'::jsonb
  ),
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'Rumours',
    '44444444-4444-4444-4444-444444444444',
    'https://i.scdn.co/image/ab67616d0000b273e52a59a28efa4773dd2bfe1b',
    1977,
    ARRAY['Rock', 'Pop Rock', 'Soft Rock'],
    'album',
    0, 0, 0,
    '[
      {"number": 1, "title": "Second Hand News", "duration": "2:56"},
      {"number": 2, "title": "Dreams", "duration": "4:17"},
      {"number": 3, "title": "Never Going Back Again", "duration": "2:14"},
      {"number": 4, "title": "Don''t Stop", "duration": "3:13"},
      {"number": 5, "title": "Go Your Own Way", "duration": "3:38"},
      {"number": 6, "title": "Songbird", "duration": "3:21"},
      {"number": 7, "title": "The Chain", "duration": "4:30"},
      {"number": 8, "title": "You Make Loving Fun", "duration": "3:36"},
      {"number": 9, "title": "I Don''t Want to Know", "duration": "3:15"},
      {"number": 10, "title": "Oh Daddy", "duration": "3:56"},
      {"number": 11, "title": "Gold Dust Woman", "duration": "4:54"}
    ]'::jsonb
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'Abbey Road',
    '55555555-5555-5555-5555-555555555555',
    'https://i.scdn.co/image/ab67616d0000b273dc30583ba717007b00cceb25',
    1969,
    ARRAY['Rock', 'Pop', 'Psychedelic Rock'],
    'album',
    0, 0, 0,
    '[
      {"number": 1, "title": "Come Together", "duration": "4:20"},
      {"number": 2, "title": "Something", "duration": "3:03"},
      {"number": 3, "title": "Maxwell''s Silver Hammer", "duration": "3:27"},
      {"number": 4, "title": "Oh! Darling", "duration": "3:26"},
      {"number": 5, "title": "Octopus''s Garden", "duration": "2:51"},
      {"number": 6, "title": "I Want You (She''s So Heavy)", "duration": "7:47"},
      {"number": 7, "title": "Here Comes the Sun", "duration": "3:05"},
      {"number": 8, "title": "Because", "duration": "2:45"},
      {"number": 9, "title": "You Never Give Me Your Money", "duration": "4:02"},
      {"number": 10, "title": "Sun King", "duration": "2:26"},
      {"number": 11, "title": "Mean Mr. Mustard", "duration": "1:06"},
      {"number": 12, "title": "Polythene Pam", "duration": "1:12"},
      {"number": 13, "title": "She Came in Through the Bathroom Window", "duration": "1:57"},
      {"number": 14, "title": "Golden Slumbers", "duration": "1:31"},
      {"number": 15, "title": "Carry That Weight", "duration": "1:36"},
      {"number": 16, "title": "The End", "duration": "2:19"}
    ]'::jsonb
  ),
  (
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'good kid, m.A.A.d city',
    '66666666-6666-6666-6666-666666666666',
    'https://i.scdn.co/image/ab67616d0000b273d58e537cea05c2156792c53d',
    2012,
    ARRAY['Hip Hop', 'Rap', 'West Coast Hip Hop'],
    'album',
    0, 0, 0,
    '[
      {"number": 1, "title": "Sherane a.k.a Master Splinter''s Daughter", "duration": "4:33"},
      {"number": 2, "title": "Bitch, Don''t Kill My Vibe", "duration": "5:10"},
      {"number": 3, "title": "Backseat Freestyle", "duration": "3:32"},
      {"number": 4, "title": "The Art of Peer Pressure", "duration": "5:22"},
      {"number": 5, "title": "Money Trees", "duration": "6:26"},
      {"number": 6, "title": "Poetic Justice", "duration": "5:00"},
      {"number": 7, "title": "good kid", "duration": "3:34"},
      {"number": 8, "title": "m.A.A.d city", "duration": "5:50"},
      {"number": 9, "title": "Swimming Pools (Drank)", "duration": "5:13"},
      {"number": 10, "title": "Sing About Me, I''m Dying of Thirst", "duration": "12:03"},
      {"number": 11, "title": "The Recipe", "duration": "5:47"},
      {"number": 12, "title": "Compton", "duration": "4:08"}
    ]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- Insert Album Recommendations (similar albums)
INSERT INTO public.album_recommendations (album_id, recommended_album_id, score) VALUES
  -- Discovery similar albums
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 0.75),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 0.65),
  -- Dark Side similar albums
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 0.75),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 0.80),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 0.70),
  -- OK Computer similar albums
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 0.80),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 0.65),
  -- Rumours similar albums
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 0.85),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 0.60),
  -- Abbey Road similar albums
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 0.85),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 0.70),
  -- good kid m.A.A.d city similar albums
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 0.55)
ON CONFLICT (album_id, recommended_album_id) DO NOTHING;
