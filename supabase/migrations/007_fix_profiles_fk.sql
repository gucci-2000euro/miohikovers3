-- ══════════════════════════════════════════════════════════════════════
-- HIKO — Fix colonna profiles.nome e FK posts->profiles
-- ══════════════════════════════════════════════════════════════════════

-- ─── 1. Rinomina username -> nome (la tabella esisteva già con questo nome) ──
ALTER TABLE profiles RENAME COLUMN username TO nome;

-- ─── 2. Backfill nome per utenti già esistenti ────────────────────────────
UPDATE profiles p
SET nome = COALESCE(
  (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = p.id),
  split_part((SELECT email FROM auth.users WHERE id = p.id), '@', 1)
)
WHERE nome IS NULL OR nome = '';

-- ─── 3. Crea profili mancanti per utenti senza profilo ───────────────────
INSERT INTO profiles (id, nome)
SELECT u.id, COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1))
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;

-- ─── 4. Cambia FK posts: auth.users -> profiles ──────────────────────────
-- Questo permette a PostgREST di risolvere posts->profiles automaticamente.
-- La catena di delete rimane: auth.users ->cascade-> profiles ->cascade-> posts
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;
ALTER TABLE posts ADD CONSTRAINT posts_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
