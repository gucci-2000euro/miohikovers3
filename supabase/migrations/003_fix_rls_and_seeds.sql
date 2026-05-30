-- ─── 1. Rendi fondatore_id nullable per community di sistema ─────
ALTER TABLE communities ALTER COLUMN fondatore_id DROP NOT NULL;

-- ─── 2. Aggiorna il trigger per gestire fondatore_id NULL ────────
CREATE OR REPLACE FUNCTION create_default_channels()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO community_channels (community_id, nome, tipo, solo_admin)
  VALUES
    (NEW.id, 'Generale', 'generale', false),
    (NEW.id, 'Annunci', 'annunci', true),
    (NEW.id, 'Percorsi', 'percorsi', false),
    (NEW.id, 'Sfide', 'sfide', false);

  IF NEW.fondatore_id IS NOT NULL THEN
    INSERT INTO community_members (community_id, user_id, ruolo, stato)
    VALUES (NEW.id, NEW.fondatore_id, 'admin', 'attivo');
    UPDATE communities SET membri_count = 1 WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 3. Policy INSERT per communities (mancava) ──────────────────
CREATE POLICY "authenticated_insert_communities" ON communities
  FOR INSERT WITH CHECK (auth.uid() = fondatore_id);

-- ─── 4. Policy UPDATE per communities (fondatore/admin) ─────────
CREATE POLICY "founder_update_community" ON communities
  FOR UPDATE USING (fondatore_id = auth.uid());

-- ─── 5. Policy SELECT per community_channels ────────────────────
CREATE POLICY "read_channels_open_or_member" ON community_channels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM communities
      WHERE id = community_channels.community_id AND tipo = 'aperta'
    )
    OR EXISTS (
      SELECT 1 FROM community_members
      WHERE community_id = community_channels.community_id
        AND user_id = auth.uid()
        AND stato = 'attivo'
    )
  );

-- ─── 6. Policy SELECT/INSERT per community_members ───────────────
CREATE POLICY "read_members_open_or_member" ON community_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM communities
      WHERE id = community_members.community_id AND tipo = 'aperta'
    )
    OR EXISTS (
      SELECT 1 FROM community_members cm2
      WHERE cm2.community_id = community_members.community_id
        AND cm2.user_id = auth.uid()
        AND cm2.stato = 'attivo'
    )
  );

CREATE POLICY "authenticated_join_community" ON community_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "member_leave_community" ON community_members
  FOR DELETE USING (auth.uid() = user_id);

-- ─── 7. Policy per community_reactions ──────────────────────────
CREATE POLICY "members_read_reactions" ON community_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM community_messages cm
      JOIN community_channels cc ON cm.channel_id = cc.id
      JOIN community_members memb ON memb.community_id = cc.community_id
      WHERE cm.id = community_reactions.message_id
        AND memb.user_id = auth.uid()
        AND memb.stato = 'attivo'
    )
  );

CREATE POLICY "members_insert_reactions" ON community_reactions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM community_messages cm
      JOIN community_channels cc ON cm.channel_id = cc.id
      JOIN community_members memb ON memb.community_id = cc.community_id
      WHERE cm.id = message_id
        AND memb.user_id = auth.uid()
        AND memb.stato = 'attivo'
    )
  );

-- ─── 8. Community di default (sistema, fondatore_id = NULL) ─────
INSERT INTO communities (nome, descrizione, tipo, fondatore_id, citta, livello_runner, badge_ufficiale)
VALUES
  ('Corridori Milano',
   'La community ufficiale dei runner milanesi. Tutti i livelli benvenuti!',
   'aperta', NULL, 'Milano', NULL, true),

  ('Roma Running Club',
   'Corriamo insieme per le strade della Capitale, dall''Appia al Tevere.',
   'aperta', NULL, 'Roma', NULL, true),

  ('5K Beginners Italia',
   'Community per chi inizia a correre e vuole arrivare ai primi 5 km. Nessun giudizio, solo supporto!',
   'aperta', NULL, NULL, 'principiante', true),

  ('Trail Running Alpi',
   'Appassionati di trail e montagna in tutto il nord Italia. Sentieri, dislivelli e panorami.',
   'aperta', NULL, NULL, 'avanzato', true),

  ('Runner Firenze',
   'Gruppo di corridori fiorentini. Passeggiate e corse nel cuore della Toscana.',
   'aperta', NULL, 'Firenze', NULL, false),

  ('Napoli Corre',
   'Community partenopea dedicata alla corsa urbana e costiera.',
   'aperta', NULL, 'Napoli', NULL, false);
