-- streaks
CREATE TABLE streaks (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_length integer NOT NULL DEFAULT 0,
  longest_length integer NOT NULL DEFAULT 0,
  last_day_local date,
  freezes_available integer NOT NULL DEFAULT 0 CHECK (freezes_available <= 3),
  freeze_used_on date,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- badges (catalogo)
CREATE TABLE badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  nome text NOT NULL,
  descrizione text,
  tipo text NOT NULL CHECK (tipo IN ('permanente', 'temporaneo')),
  scadenza_giorni integer,
  icona_url text NOT NULL,
  xp_reward integer NOT NULL DEFAULT 0,
  categoria text NOT NULL CHECK (categoria IN ('streak', 'sfida', 'community', 'percorso', 'ruolo'))
);

-- user_badges
CREATE TABLE user_badges (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at timestamptz NOT NULL DEFAULT now(),
  scade_at timestamptz,
  PRIMARY KEY (user_id, badge_id)
);

-- xp_history
CREATE TABLE xp_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  source text NOT NULL CHECK (source IN ('run', 'sfida', 'streak_milestone', 'badge', 'community_challenge')),
  riferimento_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- engagement_events
CREATE TABLE engagement_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('run_completed', 'route_shared', 'challenge_accepted', 'reaction_given', 'message_sent')),
  community_id uuid REFERENCES communities(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON engagement_events(user_id, created_at DESC);
CREATE INDEX ON engagement_events(community_id, created_at DESC);

-- leaderboard_snapshots
CREATE TABLE leaderboard_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  periodo text NOT NULL CHECK (periodo IN ('weekly', 'monthly')),
  snapshot_data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- community_heatmaps
CREATE TABLE community_heatmaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  route_id uuid,
  punto geography(POINT, 4326) NOT NULL,
  peso numeric NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON community_heatmaps USING GIST(punto);

-- notification_preferences
CREATE TABLE notification_preferences (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  channel_id uuid REFERENCES community_channels(id) ON DELETE CASCADE,
  livello text NOT NULL DEFAULT 'tutte' CHECK (livello IN ('tutte', 'menzioni', 'silenzioso')),
  streak_reminder boolean NOT NULL DEFAULT true,
  classifica_update boolean NOT NULL DEFAULT true,
  sfida_scadenza boolean NOT NULL DEFAULT true,
  PRIMARY KEY (user_id, community_id)
);

-- Materialized view leaderboard settimanale
CREATE MATERIALIZED VIEW leaderboard_weekly AS
SELECT
  user_id,
  SUM(distanza_effettiva) AS km_totali,
  RANK() OVER (ORDER BY SUM(distanza_effettiva) DESC) AS posizione
FROM runs
WHERE created_at > NOW() - INTERVAL '7 days'
  AND completata = true
GROUP BY user_id;

CREATE UNIQUE INDEX ON leaderboard_weekly(user_id);

SELECT cron.schedule(
  'refresh-leaderboard',
  '*/5 * * * *',
  'REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_weekly'
);

-- ─── RLS ─────────────────────────────────────────────────────────

ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_streak_read" ON streaks
  FOR SELECT USING (auth.uid() = user_id);
