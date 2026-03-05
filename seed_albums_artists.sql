-- Seed Albums, Artists, and Songs
-- Run this AFTER supabase_extended_schema.sql

-- Insert Artists
INSERT INTO public.artists (id, name, image_url, bio) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Pink Floyd', 'https://i.scdn.co/image/ab67616d0000b273ea7caaff71dea1051d49b2fe', 'Legendary British rock band known for progressive and psychedelic music.'),
  ('a2222222-2222-2222-2222-222222222222', 'Daft Punk', 'https://i.scdn.co/image/ab67616d0000b273d5238e5281c921c1175dbb46', 'Influential French electronic music duo.'),
  ('a3333333-3333-3333-3333-333333333333', 'Playboi Carti', 'https://i.scdn.co/image/ab67616d0000b273c4b577e4ac87c4e5aa7b6a8c', 'American rapper and style icon.'),
  ('a4444444-4444-4444-4444-444444444444', 'Tyler, the Creator', 'https://i.scdn.co/image/ab67616d0000b273e2e352d89826aef6dbd5ff8f', 'American rapper, producer, and fashion designer.'),
  ('a5555555-5555-5555-5555-555555555555', 'Frank Ocean', 'https://i.scdn.co/image/ab67616d0000b2737e7a8ba9d5b0d7e0a7b8c8e9', 'Innovative R&B singer and songwriter.'),
  ('a6666666-6666-6666-6666-666666666666', 'Lil Uzi Vert', 'https://i.scdn.co/image/ab67616d0000b273a4b577e4ac87c4e5aa7b6a8d', 'American rapper known for emo and trap fusion.'),
  ('a7777777-7777-7777-7777-777777777777', 'Dire Straits', 'https://i.scdn.co/image/ab67616d0000b273ba7e7e7e7e7e7e7e7e7e7e7e', 'British rock band led by Mark Knopfler.'),
  ('a8888888-8888-8888-8888-888888888888', 'Radiohead', 'https://i.scdn.co/image/ab67616d0000b2737e7a8ba9d5b0d7e0a7b8c8e8', 'British rock band known for experimental music.'),
  ('a9999999-9999-9999-9999-999999999999', 'Jack Johnson', 'https://i.scdn.co/image/ab67616d0000b2737e7a8ba9d5b0d7e0a7b8c8e7', 'American singer-songwriter and surfer.'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Kendrick Lamar', 'https://i.scdn.co/image/ab67616d0000b273891baaa5e2f9f861e4ba59b0', 'Pulitzer Prize-winning rapper and storyteller.'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'The Beatles', 'https://i.scdn.co/image/ab67616d0000b273dc30583ba717007b00cceb25', 'The most influential band in music history.'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Fleetwood Mac', 'https://i.scdn.co/image/ab67616d0000b273e52a59a28efa4773dd2bfe1b', 'Iconic rock band known for Rumours album.')
ON CONFLICT (name) DO NOTHING;

-- Insert Albums
INSERT INTO public.albums (id, title, artist, artist_id, cover_url, release_date, genre) VALUES
  ('b1111111-1111-1111-1111-111111111111', 'The Dark Side of the Moon', 'Pink Floyd', 'a1111111-1111-1111-1111-111111111111', 'https://i.scdn.co/image/ab67616d0000b273ea7caaff71dea1051d49b2fe', '1973-03-01', 'Progressive Rock'),
  ('b2222222-2222-2222-2222-222222222222', 'Alive 2007', 'Daft Punk', 'a2222222-2222-2222-2222-222222222222', 'https://i.scdn.co/image/ab67616d0000b273d5238e5281c921c1175dbb46', '2007-11-19', 'Electronic'),
  ('b3333333-3333-3333-3333-333333333333', 'Homework', 'Daft Punk', 'a2222222-2222-2222-2222-222222222222', 'https://i.scdn.co/image/ab67616d0000b273c4b577e4ac87c4e5aa7b6a8c', '1997-01-20', 'House'),
  ('b4444444-4444-4444-4444-444444444444', 'Whole Lotta Red', 'Playboi Carti', 'a3333333-3333-3333-3333-333333333333', 'https://i.scdn.co/image/ab67616d0000b273c4b577e4ac87c4e5aa7b6a8d', '2020-12-25', 'Trap'),
  ('b5555555-5555-5555-5555-555555555555', 'Flower Boy', 'Tyler, the Creator', 'a4444444-4444-4444-4444-444444444444', 'https://i.scdn.co/image/ab67616d0000b273e2e352d89826aef6dbd5ff8f', '2017-07-21', 'Hip Hop'),
  ('b6666666-6666-6666-6666-666666666666', 'Blonde', 'Frank Ocean', 'a5555555-5555-5555-5555-555555555555', 'https://i.scdn.co/image/ab67616d0000b2737e7a8ba9d5b0d7e0a7b8c8e9', '2016-08-20', 'R&B'),
  ('b7777777-7777-7777-7777-777777777777', 'Luv Is Rage 2', 'Lil Uzi Vert', 'a6666666-6666-6666-6666-666666666666', 'https://i.scdn.co/image/ab67616d0000b273a4b577e4ac87c4e5aa7b6a8d', '2017-08-25', 'Trap'),
  ('b8888888-8888-8888-8888-888888888888', 'Brothers in Arms', 'Dire Straits', 'a7777777-7777-7777-7777-777777777777', 'https://i.scdn.co/image/ab67616d0000b273ba7e7e7e7e7e7e7e7e7e7e7e', '1985-05-13', 'Rock'),
  ('b9999999-9999-9999-9999-999999999999', 'OK Computer', 'Radiohead', 'a8888888-8888-8888-8888-888888888888', 'https://i.scdn.co/image/ab67616d0000b2737e7a8ba9d5b0d7e0a7b8c8e8', '1997-05-21', 'Alternative Rock'),
  ('baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'In Between Dreams', 'Jack Johnson', 'a9999999-9999-9999-9999-999999999999', 'https://i.scdn.co/image/ab67616d0000b2737e7a8ba9d5b0d7e0a7b8c8e7', '2005-03-01', 'Acoustic'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'good kid, m.A.A.d city', 'Kendrick Lamar', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://i.scdn.co/image/ab67616d0000b273891baaa5e2f9f861e4ba59b0', '2012-10-22', 'Hip Hop'),
  ('bccccccc-cccc-cccc-cccc-cccccccccccc', 'Abbey Road', 'The Beatles', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'https://i.scdn.co/image/ab67616d0000b273dc30583ba717007b00cceb25', '1969-09-26', 'Rock'),
  ('bddddddd-dddd-dddd-dddd-dddddddddddd', 'Rumours', 'Fleetwood Mac', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'https://i.scdn.co/image/ab67616d0000b273e52a59a28efa4773dd2bfe1b', '1977-02-04', 'Rock'),
  ('beeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'To Pimp a Butterfly', 'Kendrick Lamar', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://i.scdn.co/image/ab67616d0000b273cdb645498cd3d8a2db4d05e1', '2015-03-15', 'Hip Hop'),
  ('bffffff-ffff-ffff-ffff-ffffffffffff', 'Random Access Memories', 'Daft Punk', 'a2222222-2222-2222-2222-222222222222', 'https://i.scdn.co/image/ab67616d0000b2737e7a8ba9d5b0d7e0a7b8c8e6', '2013-05-17', 'Electronic'),
  ('b0000000-0000-0000-0000-000000000000', 'Die Lit', 'Playboi Carti', 'a3333333-3333-3333-3333-333333333333', 'https://i.scdn.co/image/ab67616d0000b273c4b577e4ac87c4e5aa7b6a8e', '2018-05-11', 'Trap')
ON CONFLICT DO NOTHING;

-- Insert Songs
INSERT INTO public.songs (id, title, artist, artist_id, album_id, duration) VALUES
  ('s1111111-1111-1111-1111-111111111111', 'Time', 'Pink Floyd', 'a1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 413),
  ('s2222222-2222-2222-2222-222222222222', 'Money', 'Pink Floyd', 'a1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 382),
  ('s3333333-3333-3333-3333-333333333333', 'Robot Rock / Oh Yeah', 'Daft Punk', 'a2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 453),
  ('s4444444-4444-4444-4444-444444444444', 'Around the World', 'Daft Punk', 'a2222222-2222-2222-2222-222222222222', 'b3333333-3333-3333-3333-333333333333', 429),
  ('s5555555-5555-5555-5555-555555555555', 'Sky', 'Playboi Carti', 'a3333333-3333-3333-3333-333333333333', 'b4444444-4444-4444-4444-444444444444', 193),
  ('s6666666-6666-6666-6666-666666666666', 'See You Again', 'Tyler, the Creator', 'a4444444-4444-4444-4444-444444444444', 'b5555555-5555-5555-5555-555555555555', 180),
  ('s7777777-7777-7777-7777-777777777777', 'Nights', 'Frank Ocean', 'a5555555-5555-5555-5555-555555555555', 'b6666666-6666-6666-6666-666666666666', 307),
  ('s8888888-8888-8888-8888-888888888888', 'XO Tour Llif3', 'Lil Uzi Vert', 'a6666666-6666-6666-6666-666666666666', 'b7777777-7777-7777-7777-777777777777', 182),
  ('s9999999-9999-9999-9999-999999999999', 'Paranoid Android', 'Radiohead', 'a8888888-8888-8888-8888-888888888888', 'b9999999-9999-9999-9999-999999999999', 383),
  ('saaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Banana Pancakes', 'Jack Johnson', 'a9999999-9999-9999-9999-999999999999', 'baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 191),
  ('sbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Swimming Pools (Drank)', 'Kendrick Lamar', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 313),
  ('scccccc-cccc-cccc-cccc-cccccccccccc', 'Come Together', 'The Beatles', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bccccccc-cccc-cccc-cccc-cccccccccccc', 259),
  ('sddddd-dddd-dddd-dddd-dddddddddddd', 'Dreams', 'Fleetwood Mac', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'bddddddd-dddd-dddd-dddd-dddddddddddd', 257),
  ('seeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Alright', 'Kendrick Lamar', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'beeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 219),
  ('sfffff-ffff-ffff-ffff-ffffffffffff', 'Get Lucky', 'Daft Punk', 'a2222222-2222-2222-2222-222222222222', 'bffffff-ffff-ffff-ffff-ffffffffffff', 368),
  ('s0000000-0000-0000-0000-000000000000', 'Shoota', 'Playboi Carti', 'a3333333-3333-3333-3333-333333333333', 'b0000000-0000-0000-0000-000000000000', 183)
ON CONFLICT DO NOTHING;
