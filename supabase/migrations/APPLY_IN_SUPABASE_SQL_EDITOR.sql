-- ══════════════════════════════════════════════════════════════════════
-- HIKO — Migrazione completa community + challenges
-- ➜ Vai su Supabase Dashboard → SQL Editor → incolla tutto → Run
-- ══════════════════════════════════════════════════════════════════════

-- ─── 1. communities ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS communities (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          text        NOT NULL CHECK (char_length(nome) <= 50),
  descrizione   text        CHECK (char_length(descrizione) <= 300),
  tipo          text        NOT NULL CHECK (tipo IN ('aperta','approvazione','privata')),
  fondatore_id  uuid        REFERENCES auth.users(id) ON DELETE SET NULL,  -- NULL = community di sistema
  immagine_url  text,
  citta         text,
  livello_runner text       CHECK (livello_runner IN ('principiante','intermedio','avanzato')),
  membri_count  integer     NOT NULL DEFAULT 0,
  badge_ufficiale boolean   NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ─── 2. community_members ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_members (
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ruolo        text NOT NULL DEFAULT 'membro'  CHECK (ruolo IN ('admin','moderatore','membro')),
  stato        text NOT NULL DEFAULT 'attivo'  CHECK (stato IN ('attivo','bannato','silenziato','in_attesa')),
  joined_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (community_id, user_id)
);

-- ─── 3. community_channels ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_channels (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid        NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  nome         text        NOT NULL,
  tipo         text        NOT NULL CHECK (tipo IN ('generale','annunci','percorsi','sfide')),
  solo_admin   boolean     NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (community_id, tipo)
);

-- ─── 4. community_messages ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_messages (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id       uuid        NOT NULL REFERENCES community_channels(id) ON DELETE CASCADE,
  user_id          uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contenuto        text        NOT NULL CHECK (char_length(contenuto) <= 1000),
  tipo             text        NOT NULL DEFAULT 'testo' CHECK (tipo IN ('testo','percorso','sfida','run')),
  riferimento_id   uuid,
  thread_parent_id uuid        REFERENCES community_messages(id) ON DELETE SET NULL,
  moderazione_stato text       NOT NULL DEFAULT 'approvato'
                               CHECK (moderazione_stato IN ('approvato','segnalato','bloccato','pending')),
  eliminato        boolean     NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_community_msg_channel ON community_messages(channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_msg_thread  ON community_messages(thread_parent_id);

-- ─── 5. community_reactions ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_reactions (
  message_id uuid        NOT NULL REFERENCES community_messages(id) ON DELETE CASCADE,
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji      text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, user_id, emoji)
);

-- ─── 6. community_challenges ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_challenges (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id     uuid        NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  nome             text        NOT NULL,
  descrizione      text,
  tipo             text        NOT NULL CHECK (tipo IN ('collettiva','competitiva')),
  route_id         uuid,
  obiettivo_tipo   text        NOT NULL CHECK (obiettivo_tipo IN ('km','tempo','corse')),
  obiettivo_valore numeric     NOT NULL,
  punti            integer     NOT NULL DEFAULT 0,
  scadenza         timestamptz NOT NULL,
  created_by       uuid        REFERENCES auth.users(id),  -- NULL = sfida di sistema
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ─── 7. community_challenge_progress ──────────────────────────────────
CREATE TABLE IF NOT EXISTS community_challenge_progress (
  challenge_id        uuid        NOT NULL REFERENCES community_challenges(id) ON DELETE CASCADE,
  user_id             uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  valore_attuale      numeric     NOT NULL DEFAULT 0,
  completata          boolean     NOT NULL DEFAULT false,
  data_completamento  timestamptz,
  PRIMARY KEY (challenge_id, user_id)
);

-- ─── 8. community_join_requests ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_join_requests (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid        NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  risposte_json jsonb,
  stato        text        NOT NULL DEFAULT 'in_attesa'
                           CHECK (stato IN ('in_attesa','approvata','rifiutata')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (community_id, user_id)
);

-- ─── 9. community_invites ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_invites (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  token        text        NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  community_id uuid        NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  creato_da    uuid        NOT NULL REFERENCES auth.users(id),
  usato_da     uuid        REFERENCES auth.users(id),
  scadenza     timestamptz,
  tipo         text        NOT NULL DEFAULT 'link' CHECK (tipo IN ('link','nominativo')),
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ─── 10. moderation_queue ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS moderation_queue (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id         uuid        NOT NULL REFERENCES community_messages(id) ON DELETE CASCADE,
  segnalazioni_count integer     NOT NULL DEFAULT 0,
  ai_raccomandazione text        CHECK (ai_raccomandazione IN ('approved','flagged','blocked')),
  ai_summary         text,
  ai_confidence      numeric,
  reviewed_by        uuid        REFERENCES auth.users(id),
  reviewed_at        timestamptz,
  azione_finale      text        CHECK (azione_finale IN ('approved','flagged','blocked')),
  created_at         timestamptz NOT NULL DEFAULT now()
);

-- ════════════════════════════════════════════════════════════════════════
-- RLS
-- ════════════════════════════════════════════════════════════════════════
ALTER TABLE communities              ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members        ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_channels       ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_messages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reactions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_challenges     ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_join_requests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_invites        ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_queue         ENABLE ROW LEVEL SECURITY;

-- communities
CREATE POLICY "communities_select" ON communities FOR SELECT USING (
  tipo = 'aperta'
  OR fondatore_id = auth.uid()
  OR EXISTS (SELECT 1 FROM community_members WHERE community_id = communities.id AND user_id = auth.uid() AND stato = 'attivo')
);
CREATE POLICY "communities_insert" ON communities FOR INSERT WITH CHECK (auth.uid() = fondatore_id);
CREATE POLICY "communities_update" ON communities FOR UPDATE USING (fondatore_id = auth.uid());

-- community_channels
CREATE POLICY "channels_select" ON community_channels FOR SELECT USING (
  EXISTS (SELECT 1 FROM communities WHERE id = community_channels.community_id AND tipo = 'aperta')
  OR EXISTS (SELECT 1 FROM community_members WHERE community_id = community_channels.community_id AND user_id = auth.uid() AND stato = 'attivo')
);

-- community_members
CREATE POLICY "members_select" ON community_members FOR SELECT USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM communities WHERE id = community_members.community_id AND tipo = 'aperta')
  OR EXISTS (SELECT 1 FROM community_members cm2 WHERE cm2.community_id = community_members.community_id AND cm2.user_id = auth.uid() AND cm2.stato = 'attivo')
);
CREATE POLICY "members_insert" ON community_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "members_delete" ON community_members FOR DELETE USING (auth.uid() = user_id);

-- community_messages
CREATE POLICY "messages_select" ON community_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM community_channels cc
    JOIN community_members cm ON cm.community_id = cc.community_id
    WHERE cc.id = community_messages.channel_id AND cm.user_id = auth.uid() AND cm.stato = 'attivo'
  )
);
CREATE POLICY "messages_insert" ON community_messages FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM community_channels cc
    JOIN community_members cm ON cm.community_id = cc.community_id
    WHERE cc.id = channel_id AND cm.user_id = auth.uid() AND cm.stato = 'attivo'
  )
);
CREATE POLICY "messages_delete" ON community_messages FOR DELETE USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM community_channels cc
    JOIN community_members cm ON cm.community_id = cc.community_id
    WHERE cc.id = community_messages.channel_id AND cm.user_id = auth.uid() AND cm.ruolo IN ('admin','moderatore')
  )
);

-- community_reactions
CREATE POLICY "reactions_select" ON community_reactions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM community_messages cm
    JOIN community_channels cc ON cm.channel_id = cc.id
    JOIN community_members memb ON memb.community_id = cc.community_id
    WHERE cm.id = community_reactions.message_id AND memb.user_id = auth.uid() AND memb.stato = 'attivo'
  )
);
CREATE POLICY "reactions_insert" ON community_reactions FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM community_messages cm
    JOIN community_channels cc ON cm.channel_id = cc.id
    JOIN community_members memb ON memb.community_id = cc.community_id
    WHERE cm.id = message_id AND memb.user_id = auth.uid() AND memb.stato = 'attivo'
  )
);

-- community_challenges
CREATE POLICY "challenges_select" ON community_challenges FOR SELECT USING (
  EXISTS (SELECT 1 FROM communities WHERE id = community_challenges.community_id AND tipo = 'aperta')
  OR EXISTS (SELECT 1 FROM community_members WHERE community_id = community_challenges.community_id AND user_id = auth.uid() AND stato = 'attivo')
);
CREATE POLICY "challenges_insert" ON community_challenges FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM community_members WHERE community_id = community_challenges.community_id AND user_id = auth.uid() AND ruolo IN ('admin','moderatore'))
);

-- community_challenge_progress
CREATE POLICY "progress_select" ON community_challenge_progress FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "progress_insert" ON community_challenge_progress FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "progress_update" ON community_challenge_progress FOR UPDATE USING (user_id = auth.uid());

-- moderation_queue
CREATE POLICY "queue_select" ON moderation_queue FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM community_messages cm
    JOIN community_channels cc ON cm.channel_id = cc.id
    JOIN community_members memb ON memb.community_id = cc.community_id
    WHERE cm.id = moderation_queue.message_id AND memb.user_id = auth.uid() AND memb.ruolo IN ('admin','moderatore')
  )
);

-- ════════════════════════════════════════════════════════════════════════
-- TRIGGER: crea canali di default + aggiunge fondatore come admin
-- ════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION create_default_channels()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO community_channels (community_id, nome, tipo, solo_admin) VALUES
    (NEW.id, 'Generale',  'generale',  false),
    (NEW.id, 'Annunci',   'annunci',   true),
    (NEW.id, 'Percorsi',  'percorsi',  false),
    (NEW.id, 'Sfide',     'sfide',     false);

  IF NEW.fondatore_id IS NOT NULL THEN
    INSERT INTO community_members (community_id, user_id, ruolo, stato)
    VALUES (NEW.id, NEW.fondatore_id, 'admin', 'attivo');
    UPDATE communities SET membri_count = 1 WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER after_community_insert
  AFTER INSERT ON communities
  FOR EACH ROW EXECUTE FUNCTION create_default_channels();

-- ════════════════════════════════════════════════════════════════════════
-- SEED: community di default (fondatore_id = NULL = sistema)
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO communities (id, nome, descrizione, tipo, fondatore_id, citta, livello_runner, badge_ufficiale) VALUES
  ('11111111-1111-1111-1111-111111111101',
   'Corridori Milano',
   'La community ufficiale dei runner milanesi. Tutti i livelli benvenuti!',
   'aperta', NULL, 'Milano', NULL, true),

  ('11111111-1111-1111-1111-111111111102',
   'Roma Running Club',
   'Corriamo per le strade della Capitale, dall''Appia al Tevere.',
   'aperta', NULL, 'Roma', NULL, true),

  ('11111111-1111-1111-1111-111111111103',
   '5K Beginners Italia',
   'Per chi inizia. Nessun giudizio, solo supporto e incoraggiamento!',
   'aperta', NULL, NULL, 'principiante', true),

  ('11111111-1111-1111-1111-111111111104',
   'Trail Running Alpi',
   'Appassionati di trail e montagna nel nord Italia. Sentieri e panorami.',
   'aperta', NULL, NULL, 'avanzato', true),

  ('11111111-1111-1111-1111-111111111105',
   'Runner Firenze',
   'Corridori fiorentini tra Arno, Boboli e le colline toscane.',
   'aperta', NULL, 'Firenze', NULL, false),

  ('11111111-1111-1111-1111-111111111106',
   'Napoli Corre',
   'Community partenopea per la corsa urbana e costiera.',
   'aperta', NULL, 'Napoli', NULL, false)
ON CONFLICT (id) DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════
-- SEED: sfide di community
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO community_challenges
  (community_id, nome, descrizione, tipo, obiettivo_tipo, obiettivo_valore, punti, scadenza, created_by)
VALUES
  -- Corridori Milano
  ('11111111-1111-1111-1111-111111111101',
   'Corri 4 km questa settimana',
   'Completa almeno 4 km in una singola corsa entro domenica. Ogni passo conta!',
   'collettiva', 'km', 4, 150, NOW() + INTERVAL '7 days', NULL),

  ('11111111-1111-1111-1111-111111111101',
   '3 corse in 7 giorni',
   'La costanza batte il talento. Fai 3 uscite questa settimana, qualunque distanza.',
   'collettiva', 'corse', 3, 200, NOW() + INTERVAL '7 days', NULL),

  ('11111111-1111-1111-1111-111111111101',
   'Sfida dei 10 km',
   'Chi accumula 10 km totali entro fine mese? Classifica finale.',
   'competitiva', 'km', 10, 500, NOW() + INTERVAL '30 days', NULL),

  ('11111111-1111-1111-1111-111111111101',
   '30 minuti non stop',
   'Corri 30 minuti consecutivi senza fermarti. Il ritmo non conta, conta non mollare.',
   'collettiva', 'tempo', 30, 300, NOW() + INTERVAL '14 days', NULL),

  -- Roma Running Club
  ('11111111-1111-1111-1111-111111111102',
   'Giro dei Fori 5 km',
   'Il percorso classico: 5 km tra i Fori Imperiali e il Colosseo.',
   'competitiva', 'km', 5, 250, NOW() + INTERVAL '10 days', NULL),

  ('11111111-1111-1111-1111-111111111102',
   'Alba sul Tevere',
   'Fai una corsa prima delle 8:00 di mattina. Il Tevere al mattino è magico.',
   'collettiva', 'corse', 1, 180, NOW() + INTERVAL '7 days', NULL),

  -- 5K Beginners Italia
  ('11111111-1111-1111-1111-111111111103',
   'Prima volta ai 5K',
   'Il traguardo più importante: correre 5 km senza fermarti. Ce la fai!',
   'collettiva', 'km', 5, 400, NOW() + INTERVAL '30 days', NULL),

  ('11111111-1111-1111-1111-111111111103',
   'Corri 2 km senza sosta',
   'Punto di partenza ideale per chi inizia. Solo 2 km, senza fermarsi mai.',
   'collettiva', 'km', 2, 100, NOW() + INTERVAL '14 days', NULL),

  -- Trail Running Alpi
  ('11111111-1111-1111-1111-111111111104',
   'Dislivello 500m',
   'Accumula 500 metri di dislivello positivo in una sola uscita. Sfida tecnica!',
   'competitiva', 'tempo', 500, 600, NOW() + INTERVAL '21 days', NULL),

  ('11111111-1111-1111-1111-111111111104',
   'Trail da 8 km',
   'Percorso fuoristrada di almeno 8 km. Niente asfalto, solo natura.',
   'competitiva', 'km', 8, 450, NOW() + INTERVAL '14 days', NULL),

  -- Runner Firenze
  ('11111111-1111-1111-1111-111111111105',
   'Lungarno Challenge',
   'Corri 6 km lungo l''Arno, il percorso preferito dei fiorentini.',
   'collettiva', 'km', 6, 200, NOW() + INTERVAL '7 days', NULL),

  -- Napoli Corre
  ('11111111-1111-1111-1111-111111111106',
   'Lungomare Caracciolo',
   'Il percorso più bello di Napoli: 4 km con vista sul Vesuvio.',
   'collettiva', 'km', 4, 175, NOW() + INTERVAL '7 days', NULL)

ON CONFLICT DO NOTHING;
