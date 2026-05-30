-- ══════════════════════════════════════════════════════════════════════
-- HIKO — Fix ricorsione infinita nelle RLS policy
-- Incolla nel Supabase SQL Editor e clicca Run
-- ══════════════════════════════════════════════════════════════════════

-- ─── 1. Funzioni SECURITY DEFINER (bypassano RLS, evitano la ricorsione) ─

CREATE OR REPLACE FUNCTION is_community_member(cid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM community_members
    WHERE community_id = cid
      AND user_id = auth.uid()
      AND stato = 'attivo'
  );
$$;

CREATE OR REPLACE FUNCTION is_community_moderator(cid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM community_members
    WHERE community_id = cid
      AND user_id = auth.uid()
      AND ruolo IN ('admin', 'moderatore')
      AND stato = 'attivo'
  );
$$;

-- ─── 2. Drop tutte le policy esistenti ────────────────────────────────────

DROP POLICY IF EXISTS "communities_select"  ON communities;
DROP POLICY IF EXISTS "communities_insert"  ON communities;
DROP POLICY IF EXISTS "communities_update"  ON communities;

DROP POLICY IF EXISTS "channels_select"     ON community_channels;

DROP POLICY IF EXISTS "members_select"      ON community_members;
DROP POLICY IF EXISTS "members_insert"      ON community_members;
DROP POLICY IF EXISTS "members_delete"      ON community_members;

DROP POLICY IF EXISTS "messages_select"     ON community_messages;
DROP POLICY IF EXISTS "messages_insert"     ON community_messages;
DROP POLICY IF EXISTS "messages_delete"     ON community_messages;

DROP POLICY IF EXISTS "reactions_select"    ON community_reactions;
DROP POLICY IF EXISTS "reactions_insert"    ON community_reactions;

DROP POLICY IF EXISTS "challenges_select"   ON community_challenges;
DROP POLICY IF EXISTS "challenges_insert"   ON community_challenges;

DROP POLICY IF EXISTS "progress_select"     ON community_challenge_progress;
DROP POLICY IF EXISTS "progress_insert"     ON community_challenge_progress;
DROP POLICY IF EXISTS "progress_update"     ON community_challenge_progress;

DROP POLICY IF EXISTS "queue_select"        ON moderation_queue;

-- ─── 3. Ricrea le policy senza ricorsione ─────────────────────────────────

-- communities: nessuna referenza diretta a community_members
CREATE POLICY "communities_select" ON communities FOR SELECT USING (
  tipo = 'aperta'
  OR fondatore_id = auth.uid()
  OR is_community_member(id)          -- SECURITY DEFINER: bypassa RLS
);
CREATE POLICY "communities_insert" ON communities FOR INSERT
  WITH CHECK (auth.uid() = fondatore_id);
CREATE POLICY "communities_update" ON communities FOR UPDATE
  USING (fondatore_id = auth.uid());

-- community_channels: usa is_community_member invece di query diretta
CREATE POLICY "channels_select" ON community_channels FOR SELECT USING (
  EXISTS (SELECT 1 FROM communities WHERE id = community_channels.community_id AND tipo = 'aperta')
  OR is_community_member(community_id)
);

-- community_members: nessuna referenza a communities o a se stessa
CREATE POLICY "members_select" ON community_members FOR SELECT USING (
  user_id = auth.uid()
  OR is_community_moderator(community_id)
);
CREATE POLICY "members_insert" ON community_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "members_delete" ON community_members FOR DELETE
  USING (auth.uid() = user_id);

-- community_messages: usa is_community_member via canale
CREATE POLICY "messages_select" ON community_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM community_channels cc
    WHERE cc.id = community_messages.channel_id
      AND is_community_member(cc.community_id)
  )
);
CREATE POLICY "messages_insert" ON community_messages FOR INSERT WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM community_channels cc
    WHERE cc.id = channel_id
      AND is_community_member(cc.community_id)
  )
);
CREATE POLICY "messages_delete" ON community_messages FOR DELETE USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM community_channels cc
    WHERE cc.id = community_messages.channel_id
      AND is_community_moderator(cc.community_id)
  )
);

-- community_reactions
CREATE POLICY "reactions_select" ON community_reactions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM community_messages cm
    JOIN community_channels cc ON cm.channel_id = cc.id
    WHERE cm.id = community_reactions.message_id
      AND is_community_member(cc.community_id)
  )
);
CREATE POLICY "reactions_insert" ON community_reactions FOR INSERT WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM community_messages cm
    JOIN community_channels cc ON cm.channel_id = cc.id
    WHERE cm.id = message_id
      AND is_community_member(cc.community_id)
  )
);

-- community_challenges
CREATE POLICY "challenges_select" ON community_challenges FOR SELECT USING (
  EXISTS (SELECT 1 FROM communities WHERE id = community_challenges.community_id AND tipo = 'aperta')
  OR is_community_member(community_id)
);
CREATE POLICY "challenges_insert" ON community_challenges FOR INSERT
  WITH CHECK (is_community_moderator(community_id));

-- community_challenge_progress
CREATE POLICY "progress_select" ON community_challenge_progress FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "progress_insert" ON community_challenge_progress FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "progress_update" ON community_challenge_progress FOR UPDATE
  USING (user_id = auth.uid());

-- moderation_queue
CREATE POLICY "queue_select" ON moderation_queue FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM community_messages cm
    JOIN community_channels cc ON cm.channel_id = cc.id
    WHERE cm.id = moderation_queue.message_id
      AND is_community_moderator(cc.community_id)
  )
);
