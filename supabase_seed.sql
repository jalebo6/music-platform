-- Seed Data for Music Platform MVP

-- Note: You'll need to create auth users first through Google OAuth
-- Then manually insert their UUIDs here for the seed data

-- Example seed shares (replace USER_UUID_1 and USER_UUID_2 with actual user IDs after they sign up)

-- Albums
INSERT INTO public.shares (user_id, title, artist, album, thought, tags) VALUES
('USER_UUID_1', 'Dark Side of the Moon', 'Pink Floyd', 'Dark Side of the Moon', 'A timeless masterpiece that explores the human condition through psychedelic soundscapes. Every track flows seamlessly into the next.', ARRAY['progressive rock', 'classic', 'psychedelic']),
('USER_UUID_1', 'Alive 2007', 'Daft Punk', 'Alive 2007', 'The best live electronic performance ever recorded. The energy and production are unmatched.', ARRAY['electronic', 'live', 'house']),
('USER_UUID_2', 'Homework', 'Daft Punk', 'Homework', 'Where it all began for Daft Punk. Raw, funky, and ahead of its time. This album defined French house.', ARRAY['house', 'electronic', '90s']),
('USER_UUID_2', 'Whole Lotta Red', 'Playboi Carti', 'Whole Lotta Red', 'Polarizing but genius. The punk energy mixed with trap production creates something totally unique.', ARRAY['trap', 'experimental', 'rage']),
('USER_UUID_1', 'Flower Boy', 'Tyler, the Creator', 'Flower Boy', 'Tyler''s breakthrough into beautiful, introspective production. The orchestration and songwriting matured so much here.', ARRAY['hip-hop', 'alternative', 'production']),
('USER_UUID_2', 'Blond', 'Frank Ocean', 'Blond', 'A vulnerable, sparse, and gorgeous album. Frank''s vocals and the minimalist production create such an intimate experience.', ARRAY['r&b', 'alternative', 'experimental']),
('USER_UUID_1', 'Luv Is Rage 2', 'Lil Uzi Vert', 'Luv Is Rage 2', 'Uzi at his peak. The melodies, energy, and production created a whole new wave in hip-hop.', ARRAY['trap', 'melodic rap', 'emo rap']),
('USER_UUID_2', 'Brothers in Arms', 'Dire Straits', 'Brothers in Arms', 'Mark Knopfler''s guitar work is legendary. The title track gives me chills every time.', ARRAY['rock', 'classic', '80s']);

-- Songs
INSERT INTO public.shares (user_id, title, artist, album, thought, tags) VALUES
('USER_UUID_1', 'Creep', 'Radiohead', NULL, 'The ultimate outsider anthem. Radiohead may have grown tired of it, but this song is perfect in its raw emotion.', ARRAY['alternative rock', '90s', 'grunge']),
('USER_UUID_2', 'One Last Breath', 'Creed', NULL, 'Say what you want about Creed, but this song has incredible vocals and emotional weight. Underrated.', ARRAY['rock', 'post-grunge', '2000s']),
('USER_UUID_1', 'Iris', 'The Goo Goo Dolls', NULL, 'One of the most beautiful rock ballads ever written. The guitar tone and melody are unforgettable.', ARRAY['alternative rock', 'ballad', '90s']),
('USER_UUID_2', 'Upside Down', 'Jack Johnson', NULL, 'Pure chill vibes. Jack Johnson captures summer nostalgia perfectly with this track.', ARRAY['acoustic', 'surf rock', 'chill']),
('USER_UUID_1', 'Horny', 'San Pacho', NULL, 'This track is an absolute banger. The bassline and groove make it impossible not to move.', ARRAY['house', 'tech house', 'club']),
('USER_UUID_2', 'Knockin'' on Heaven''s Door', 'Bob Dylan', NULL, 'A timeless classic. Dylan''s simplicity and storytelling make this song endlessly replayable.', ARRAY['folk', 'classic rock', 'dylan']),
('USER_UUID_1', 'Aria', 'Argy, Omnya', NULL, 'Ethereal and hypnotic. The vocals combined with the progressive build create such a unique atmosphere.', ARRAY['progressive house', 'melodic techno', 'electronic']),
('USER_UUID_2', 'Good Looking', 'UKI Waterhouse', NULL, 'The bass drops in this track are insane. Such a vibe for late-night drives.', ARRAY['house', 'deep house', 'uk']),
('USER_UUID_1', 'Duvet', 'Boa', NULL, 'The Serial Experiments Lain opening. Hauntingly beautiful and nostalgic. Takes me back every time.', ARRAY['j-rock', 'alternative', 'anime']),
('USER_UUID_2', 'Banana Pancakes', 'Jack Johnson', NULL, 'The perfect lazy Sunday morning song. Simple, warm, and comforting.', ARRAY['acoustic', 'folk', 'chill']);
