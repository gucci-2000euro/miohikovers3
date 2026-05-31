-- ══════════════════════════════════════════════════════════════════════
-- HIKO — Sfide individuali (challenges + user_challenges)
-- ══════════════════════════════════════════════════════════════════════

-- ─── 1. Template delle sfide (visibili a tutti) ───────────────────────
DROP TABLE IF EXISTS user_challenges CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;

CREATE TABLE challenges (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          text        NOT NULL,
  descrizione   text,
  tipo          text        NOT NULL CHECK (tipo IN ('km', 'corse')),
  obiettivo     numeric     NOT NULL,
  difficolta    text        NOT NULL CHECK (difficolta IN ('easy', 'medium', 'hard')),
  punti         integer     NOT NULL DEFAULT 50,
  durata_giorni integer     NOT NULL DEFAULT 7,
  icona         text        NOT NULL DEFAULT '🏃',
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "challenges_public_read" ON challenges FOR SELECT USING (true);

-- ─── 2. Sfide accettate dall'utente ───────────────────────────────────
CREATE TABLE user_challenges (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id    uuid        NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  valore_attuale  numeric     NOT NULL DEFAULT 0,
  completata      boolean     NOT NULL DEFAULT false,
  scadenza        timestamptz NOT NULL,
  accepted_at     timestamptz NOT NULL DEFAULT now(),
  completata_at   timestamptz,
  UNIQUE (user_id, challenge_id)
);

ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "uc_select" ON user_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "uc_insert" ON user_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "uc_update" ON user_challenges FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "uc_delete" ON user_challenges FOR DELETE USING (auth.uid() = user_id);

-- ─── 3. Seed: 10 sfide predefinite ────────────────────────────────────
INSERT INTO challenges (nome, descrizione, tipo, obiettivo, difficolta, punti, durata_giorni, icona) VALUES
('Prima Corsa',          'Completa la tua prima corsa su Hiko.',                              'corse', 1,  'easy',   50,  30, '🎯'),
('5 km questa settimana','Corri almeno 5 km nell''arco di 7 giorni.',                         'km',    5,  'easy',   75,  7,  '🏃'),
('Tre corse settimanali','Completa 3 corse in una settimana.',                                'corse', 3,  'easy',   80,  7,  '📅'),
('10 km in 7 giorni',    'Copri 10 km totali entro una settimana.',                           'km',    10, 'medium', 150, 7,  '⚡'),
('Esploratore',          'Completa 5 corse sui percorsi Hiko di Milano.',                     'corse', 5,  'medium', 120, 30, '🗺️'),
('20 km al mese',        'Corri almeno 20 km nel corso del mese.',                            'km',    20, 'medium', 200, 30, '📈'),
('Dieci corse al mese',  'Completa 10 corse in un mese.',                                     'corse', 10, 'hard',   350, 30, '🔥'),
('42 km in un mese',     'Raggiungi quota 42 km — la distanza di una maratona in 30 giorni.', 'km',    42, 'hard',   500, 30, '🏅'),
('50 km al mese',        'Corri 50 km totali in un mese. Solo per i più tenaci.',             'km',    50, 'hard',   600, 30, '🚀'),
('Inarrestabile',        'Completa 20 corse in un mese. Una al giorno non si nega a nessuno.','corse', 20, 'hard',   800, 30, '💪');

-- ─── 4. Trigger: aggiorna progresso sfide dopo ogni corsa ─────────────
CREATE OR REPLACE FUNCTION update_challenge_progress_after_run()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Sfide tipo 'km'
  UPDATE user_challenges uc
  SET
    valore_attuale = LEAST(uc.valore_attuale + NEW.distanza_km, c.obiettivo),
    completata     = (uc.valore_attuale + NEW.distanza_km) >= c.obiettivo,
    completata_at  = CASE
                       WHEN NOT uc.completata AND (uc.valore_attuale + NEW.distanza_km) >= c.obiettivo
                       THEN now()
                       ELSE uc.completata_at
                     END
  FROM challenges c
  WHERE uc.challenge_id = c.id
    AND uc.user_id      = NEW.user_id
    AND uc.completata   = false
    AND uc.scadenza     > now()
    AND c.tipo          = 'km';

  -- Sfide tipo 'corse'
  UPDATE user_challenges uc
  SET
    valore_attuale = LEAST(uc.valore_attuale + 1, c.obiettivo),
    completata     = (uc.valore_attuale + 1) >= c.obiettivo,
    completata_at  = CASE
                       WHEN NOT uc.completata AND (uc.valore_attuale + 1) >= c.obiettivo
                       THEN now()
                       ELSE uc.completata_at
                     END
  FROM challenges c
  WHERE uc.challenge_id = c.id
    AND uc.user_id      = NEW.user_id
    AND uc.completata   = false
    AND uc.scadenza     > now()
    AND c.tipo          = 'corse';

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_challenge_progress ON runs;
CREATE TRIGGER trg_update_challenge_progress
  AFTER INSERT ON runs
  FOR EACH ROW EXECUTE FUNCTION update_challenge_progress_after_run();
