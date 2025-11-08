-- Word of the Day Feature - Database Setup
-- Run this in your Supabase SQL Editor

-- 1. Create word_of_the_day table
CREATE TABLE IF NOT EXISTS word_of_the_day (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  word TEXT NOT NULL,
  pronunciation TEXT,
  part_of_speech TEXT,
  definition TEXT NOT NULL,
  example_sentence TEXT,
  fun_fact TEXT,
  synonyms TEXT[], -- Array of synonyms
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create index for faster date lookups
CREATE INDEX IF NOT EXISTS idx_word_of_day_date ON word_of_the_day(date);

-- Enable Row Level Security
ALTER TABLE word_of_the_day ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view words
CREATE POLICY "Authenticated users can view words" ON word_of_the_day
  FOR SELECT USING (auth.role() = 'authenticated');

-- Insert some initial words of the day
INSERT INTO word_of_the_day (date, word, pronunciation, part_of_speech, definition, example_sentence, fun_fact, synonyms) VALUES
  ('2025-11-03', 'Eloquent', 'EL-uh-kwent', 'adjective', 'Fluent or persuasive in speaking or writing; marked by forceful and expressive language.', 'The speaker delivered an eloquent address that moved the entire audience.', 'The word "eloquent" comes from the Latin "eloquens," meaning "speaking out."', ARRAY['articulate', 'expressive', 'persuasive', 'silver-tongued']),

  ('2025-11-04', 'Serendipity', 'ser-en-DIP-i-tee', 'noun', 'The occurrence of events by chance in a happy or beneficial way; a pleasant surprise.', 'Finding that vintage book at the flea market was pure serendipity.', 'The word was coined by Horace Walpole in 1754, inspired by the Persian fairy tale "The Three Princes of Serendip."', ARRAY['luck', 'fortune', 'coincidence', 'fluke']),

  ('2025-11-05', 'Resilient', 'rih-ZIL-yent', 'adjective', 'Able to recover quickly from difficulties; flexible and adaptable to change.', 'Despite facing many challenges, she remained resilient and optimistic.', 'The word shares roots with "resilience," from Latin "resilire" meaning "to rebound or recoil."', ARRAY['strong', 'tough', 'adaptable', 'flexible']),

  ('2025-11-06', 'Ephemeral', 'ih-FEM-er-ul', 'adjective', 'Lasting for a very short time; transient and fleeting.', 'The beauty of cherry blossoms is ephemeral, lasting only a few weeks each spring.', 'Mayflies are sometimes called "ephemeroptera" because they live for just one day!', ARRAY['temporary', 'fleeting', 'transient', 'short-lived']),

  ('2025-11-07', 'Ameliorate', 'uh-MEEL-yuh-rayt', 'verb', 'To make something better or less severe; to improve a situation.', 'The new policies helped ameliorate working conditions in the factory.', 'Unlike "improve," ameliorate specifically means making something bad into something better.', ARRAY['improve', 'enhance', 'better', 'upgrade']),

  ('2025-11-08', 'Quintessential', 'kwin-tuh-SEN-shul', 'adjective', 'Representing the most perfect or typical example of something; the essence of a quality.', 'Paris is the quintessential romantic city for many travelers.', 'The prefix "quint-" means five, referring to the ancient belief in a fifth element beyond earth, air, fire, and water.', ARRAY['perfect', 'ideal', 'classic', 'archetypal']),

  ('2025-11-09', 'Persevere', 'pur-suh-VEER', 'verb', 'To continue despite difficulty or delay in achieving success; to persist steadfastly.', 'If you persevere in your studies, you will eventually master the language.', 'Thomas Edison famously said, "Genius is one percent inspiration and ninety-nine percent perspiration."', ARRAY['persist', 'endure', 'continue', 'carry on']),

  ('2025-11-10', 'Ubiquitous', 'yoo-BIK-wi-tus', 'adjective', 'Present, appearing, or found everywhere at the same time; omnipresent.', 'Smartphones have become ubiquitous in modern society.', 'The word comes from Latin "ubique" meaning "everywhere."', ARRAY['omnipresent', 'pervasive', 'universal', 'widespread']),

  ('2025-11-11', 'Magnanimous', 'mag-NAN-uh-mus', 'adjective', 'Very generous or forgiving, especially toward a rival or less powerful person.', 'The champion was magnanimous in victory, praising his opponent graciously.', 'The word literally means "great-souled" in Latin (magnus = great, animus = soul).', ARRAY['generous', 'noble', 'charitable', 'benevolent']),

  ('2025-11-12', 'Vivacious', 'vih-VAY-shus', 'adjective', 'Attractively lively and animated; full of energy and enthusiasm.', 'Her vivacious personality made her the life of every party.', 'The root "viv-" means "alive," which also appears in words like "vivid" and "survive."', ARRAY['lively', 'spirited', 'animated', 'energetic']),

  ('2025-11-13', 'Meticulous', 'muh-TIK-yuh-lus', 'adjective', 'Showing great attention to detail; very careful and precise.', 'The architect was meticulous in planning every aspect of the building design.', 'Interestingly, "meticulous" originally meant "fearful" before evolving to mean "careful."', ARRAY['careful', 'precise', 'thorough', 'fastidious']),

  ('2025-11-14', 'Enigma', 'ih-NIG-muh', 'noun', 'A person or thing that is mysterious, puzzling, or difficult to understand.', 'The ancient manuscript remains an enigma to historians.', 'The Enigma machine was a famous cipher device used in World War II.', ARRAY['mystery', 'puzzle', 'riddle', 'conundrum']),

  ('2025-11-15', 'Benevolent', 'buh-NEV-uh-lunt', 'adjective', 'Well-meaning and kindly; showing goodwill and generosity.', 'The benevolent donor funded scholarships for underprivileged students.', 'The word combines "bene" (good) and "volent" (wishing), literally meaning "wishing good."', ARRAY['kind', 'generous', 'charitable', 'compassionate']),

  ('2025-11-16', 'Cacophony', 'kuh-KOF-uh-nee', 'noun', 'A harsh, discordant mixture of sounds; an unpleasant noise.', 'The morning rush hour created a cacophony of car horns and sirens.', 'The opposite of cacophony is "euphony," which means pleasant-sounding.', ARRAY['noise', 'discord', 'dissonance', 'clamor']),

  ('2025-11-17', 'Zeal', 'zeel', 'noun', 'Great energy or enthusiasm in pursuit of a cause or objective; fervent dedication.', 'She approached her volunteer work with remarkable zeal and commitment.', 'A person who shows zeal is called a "zealot," though this term now often has negative connotations.', ARRAY['enthusiasm', 'passion', 'fervor', 'dedication']),

  ('2025-11-18', 'Pragmatic', 'prag-MAT-ik', 'adjective', 'Dealing with things sensibly and realistically based on practical considerations.', 'Taking a pragmatic approach, they focused on solutions that could be implemented immediately.', 'The word comes from Greek "pragma," meaning "deed" or "act."', ARRAY['practical', 'realistic', 'sensible', 'down-to-earth']),

  ('2025-11-19', 'Audacious', 'aw-DAY-shus', 'adjective', 'Showing a willingness to take bold risks; daring and confident.', 'The entrepreneur had an audacious plan to revolutionize the industry.', 'Being audacious can be positive (bold) or negative (rude), depending on context!', ARRAY['bold', 'daring', 'brave', 'fearless']),

  ('2025-11-20', 'Luminous', 'LOO-muh-nus', 'adjective', 'Full of light; bright or shining; also intellectually or spiritually enlightening.', 'The moon cast a luminous glow across the midnight sky.', 'Things that produce their own light (like fireflies) are "bioluminescent."', ARRAY['bright', 'radiant', 'glowing', 'brilliant']),

  ('2025-11-21', 'Gratitude', 'GRAT-i-tood', 'noun', 'The quality of being thankful; readiness to show appreciation and return kindness.', 'She expressed her gratitude with a heartfelt thank-you note.', 'Studies show that practicing gratitude can improve mental health and happiness!', ARRAY['thankfulness', 'appreciation', 'gratefulness', 'recognition']),

  ('2025-11-22', 'Harmony', 'HAR-muh-nee', 'noun', 'Agreement or concord; a pleasing combination of elements; peaceful coexistence.', 'The community lived in harmony, respecting each other''s differences.', 'In music, harmony refers to notes played together that sound pleasant to the ear.', ARRAY['agreement', 'unity', 'peace', 'accord']),

  ('2025-11-23', 'Innovative', 'IN-uh-vay-tiv', 'adjective', 'Introducing new ideas or methods; creative and original in thinking.', 'The company''s innovative approach transformed the entire market.', 'The root "nov-" means "new," as in "novel," "novelty," and "renovate."', ARRAY['creative', 'original', 'inventive', 'pioneering']),

  ('2025-11-24', 'Contemplate', 'KON-tem-playt', 'verb', 'To think about something deeply and carefully; to consider or meditate on.', 'She sat by the window to contemplate her next career move.', 'The word originally meant "to mark out a space for observation," from temple (sacred space).', ARRAY['consider', 'ponder', 'reflect', 'meditate']),

  ('2025-11-25', 'Euphoria', 'yoo-FOR-ee-uh', 'noun', 'A feeling or state of intense excitement and happiness; extreme joy.', 'Winning the championship filled the team with euphoria.', 'The word combines "eu-" (good) and "pherein" (to bear), literally meaning "bearing well."', ARRAY['joy', 'elation', 'bliss', 'ecstasy']),

  ('2025-11-26', 'Articulate', 'ar-TIK-yuh-layt', 'verb/adjective', 'To express thoughts clearly and effectively; having or showing clear expression.', 'He could articulate his vision in a way that everyone understood.', 'Your skeleton has "articulated joints" where bones connect and move!', ARRAY['express', 'communicate', 'enunciate', 'pronounce']),

  ('2025-11-27', 'Tenacity', 'tuh-NAS-i-tee', 'noun', 'The quality of being determined and persistent; not giving up easily.', 'Her tenacity in learning English paid off when she became fluent.', 'The word is related to "tenacious," which describes something that holds fast, like a tenacious grip.', ARRAY['persistence', 'determination', 'perseverance', 'resolve']),

  ('2025-11-28', 'Eloquence', 'EL-uh-kwens', 'noun', 'Fluent or persuasive speaking or writing; the art of effective expression.', 'The poet''s eloquence moved hearts and changed minds.', 'Ancient Greeks and Romans studied "rhetoric," the art of persuasive eloquence.', ARRAY['fluency', 'articulateness', 'expressiveness', 'persuasiveness']),

  ('2025-11-29', 'Venture', 'VEN-chur', 'verb/noun', 'To dare to go or do something risky; a risky or daring journey or undertaking.', 'She decided to venture into entrepreneurship despite the uncertainties.', 'The word "adventure" comes from "venture," meaning "that which happens by chance."', ARRAY['dare', 'risk', 'undertaking', 'enterprise']),

  ('2025-11-30', 'Wisdom', 'WIZ-dum', 'noun', 'The quality of having experience, knowledge, and good judgment; the soundness of action.', 'Age and experience brought him great wisdom about life.', 'In many cultures, the owl is a symbol of wisdom and knowledge.', ARRAY['insight', 'knowledge', 'judgment', 'sagacity']),

  ('2025-12-01', 'Aspire', 'uh-SPIRE', 'verb', 'To direct one''s hopes or ambitions toward achieving something; to have a strong desire.', 'She aspired to become a fluent English speaker within a year.', 'The word comes from Latin "aspirare," literally meaning "to breathe upon" or "to reach upward."', ARRAY['aim', 'strive', 'seek', 'desire']),

  ('2025-12-02', 'Curiosity', 'kyur-ee-OS-i-tee', 'noun', 'A strong desire to know or learn something; inquisitiveness.', 'His curiosity about different cultures led him to travel the world.', 'Einstein said, "I have no special talents. I am only passionately curious."', ARRAY['inquisitiveness', 'interest', 'wonder', 'questioning']);

-- Display success message
SELECT 'Word of the Day table created successfully! ' || COUNT(*) || ' words inserted.' as status
FROM word_of_the_day;

-- Show sample of inserted data
SELECT date, word, definition FROM word_of_the_day ORDER BY date LIMIT 5;
