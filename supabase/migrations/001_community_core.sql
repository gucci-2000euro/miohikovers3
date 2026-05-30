-- communities
CREATE TABLE communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL CHECK (char_length(nome) <= 50),
  descrizione text CHECK (char_length(descrizione) <= 300),
  tipo text NOT NULL CHECK (tipo IN ('aperta', 'approvazione', 'privata')),
  fondatore_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  immagine_url text,
  citta text,
  livello_runner text CHECK (livello_runner IN ('principiante', 'intermedio', 'avanzato')),
  membri_count integer NOT NULL DEFAULT 0,
  badge_ufficiale boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- community_members
CREATE TABLE community_members (
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ruolo text NOT NULL DEFAULT 'membro' CHECK (ruolo IN ('admin', 'moderatore', 'membro')),
  stato text NOT NULL DEFAULT 'attivo' CHECK (stato IN ('attivo', 'bannato', 'silenziato', 'in_attesa')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (community_id, user_id)
);

-- community_channels (4 canali fissi per community)
CREATE TABLE community_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  nome text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('generale', 'annunci', 'percorsi', 'sfide')),
  solo_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (community_id, tipo)
);

-- community_messages
CREATE TABLE community_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES community_channels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contenuto text NOT NULL CHECK (char_length(contenuto) <= 1000),
  tipo text NOT NULL DEFAULT 'testo' CHECK (tipo IN ('testo', 'percorso', 'sfida', 'run')),
  riferimento_id uuid,
  thread_parent_id uuid REFERENCES community_messages(id) ON DELETE SET NULL,
  moderazione_stato text NOT NULL DEFAULT 'approvato' CHECK (moderazione_stato IN ('approvato', 'segnalato', 'bloccato', 'pending')),
  eliminato boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON community_messages(channel_id, created_at DESC);
CREATE INDEX ON community_messages(thread_parent_id);

-- community_reactions (max 6 emoji diverse per messaggio)
CREATE TABLE community_reactions (
  message_id uuid NOT NULL REFERENCES community_messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, user_id, emoji)
);

-- community_challenges
CREATE TABLE community_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  nome text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('collettiva', 'competitiva')),
  route_id uuid,
  obiettivo_tipo text NOT NULL CHECK (obiettivo_tipo IN ('km', 'tempo', 'corse')),
  obiettivo_valore numeric NOT NULL,
  punti integer NOT NULL DEFAULT 0,
  scadenza timestamptz NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- community_challenge_progress
CREATE TABLE community_challenge_progress (
  challenge_id uuid NOT NULL REFERENCES community_challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  valore_attuale numeric NOT NULL DEFAULT 0,
  completata boolean NOT NULL DEFAULT false,
  data_completamento timestamptz,
  PRIMARY KEY (challenge_id, user_id)
);

-- community_join_requests
CREATE TABLE community_join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  risposte_json jsonb,
  stato text NOT NULL DEFAULT 'in_attesa' CHECK (stato IN ('in_attesa', 'approvata', 'rifiutata')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (community_id, user_id)
);

-- community_invites
CREATE TABLE community_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  creato_da uuid NOT NULL REFERENCES auth.users(id),
  usato_da uuid REFERENCES auth.users(id),
  scadenza timestamptz,
  tipo text NOT NULL DEFAULT 'link' CHECK (tipo IN ('link', 'nominativo')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- moderation_queue
CREATE TABLE moderation_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES community_messages(id) ON DELETE CASCADE,
  segnalazioni_count integer NOT NULL DEFAULT 0,
  ai_raccomandazione text CHECK (ai_raccomandazione IN ('approved', 'flagged', 'blocked')),
  ai_summary text,
  ai_confidence numeric,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  azione_finale text CHECK (azione_finale IN ('approved', 'flagged', 'blocked')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── RLS ─────────────────────────────────────────────────────────

ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_open_communities" ON communities
  FOR SELECT USING (tipo = 'aperta' OR fondatore_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM community_members
      WHERE community_id = communities.id AND user_id = auth.uid() AND stato = 'attivo'
    )
  );

CREATE POLICY "members_read_messages" ON community_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM community_channels cc
      JOIN community_members cm ON cm.community_id = cc.community_id
      WHERE cc.id = community_messages.channel_id
        AND cm.user_id = auth.uid()
        AND cm.stato = 'attivo'
    )
  );

CREATE POLICY "members_insert_messages" ON community_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM community_channels cc
      JOIN community_members cm ON cm.community_id = cc.community_id
      WHERE cc.id = channel_id
        AND cm.user_id = auth.uid()
        AND cm.stato = 'attivo'
    )
  );

CREATE POLICY "moderators_delete_messages" ON community_messages
  FOR DELETE USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM community_channels cc
      JOIN community_members cm ON cm.community_id = cc.community_id
      WHERE cc.id = community_messages.channel_id
        AND cm.user_id = auth.uid()
        AND cm.ruolo IN ('admin', 'moderatore')
    )
  );

CREATE POLICY "moderators_read_queue" ON moderation_queue
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM community_messages cm
      JOIN community_channels cc ON cm.channel_id = cc.id
      JOIN community_members memb ON memb.community_id = cc.community_id
      WHERE cm.id = moderation_queue.message_id
        AND memb.user_id = auth.uid()
        AND memb.ruolo IN ('admin', 'moderatore')
    )
  );

-- ─── Trigger: auto-creazione canali + fondatore admin ────────────

CREATE OR REPLACE FUNCTION create_default_channels()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO community_channels (community_id, nome, tipo, solo_admin)
  VALUES
    (NEW.id, 'Generale', 'generale', false),
    (NEW.id, 'Annunci', 'annunci', true),
    (NEW.id, 'Percorsi', 'percorsi', false),
    (NEW.id, 'Sfide', 'sfide', false);

  INSERT INTO community_members (community_id, user_id, ruolo, stato)
  VALUES (NEW.id, NEW.fondatore_id, 'admin', 'attivo');

  UPDATE communities SET membri_count = 1 WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER after_community_insert
  AFTER INSERT ON communities
  FOR EACH ROW EXECUTE FUNCTION create_default_channels();
