import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useCommunityStore } from '@/store/useCommunityStore';
import type { CommunityMessage, CommunityMessageWithProfile, MessageProfile } from '@/types/index';

async function fetchProfiles(userIds: string[]): Promise<Map<string, MessageProfile>> {
  if (userIds.length === 0) return new Map();
  const { data } = await supabase
    .from('profiles')
    .select('id, nome, avatar_url')
    .in('id', userIds);
  return new Map((data ?? []).map(p => [p.id, p as MessageProfile]));
}

async function enrichMessages(messages: CommunityMessage[]): Promise<CommunityMessageWithProfile[]> {
  const ids = [...new Set(messages.map(m => m.user_id))];
  const profileMap = await fetchProfiles(ids);
  return messages.map(m => ({ ...m, profiles: profileMap.get(m.user_id) ?? null }));
}

export function useCommunityMessages(channelId: string | null) {
  const { setMessages, addMessage, updateMessage, removeMessage } = useCommunityStore();
  const profileCache = useRef<Map<string, MessageProfile>>(new Map());

  useEffect(() => {
    if (!channelId) return;

    supabase
      .from('community_messages')
      .select('*')
      .eq('channel_id', channelId)
      .eq('eliminato', false)
      .order('created_at', { ascending: true })
      .limit(50)
      .then(async ({ data }) => {
        const msgs = (data ?? []) as CommunityMessage[];
        const enriched = await enrichMessages(msgs);
        // popola cache con i profili appena scaricati
        enriched.forEach(m => { if (m.profiles) profileCache.current.set(m.user_id, m.profiles); });
        setMessages(enriched);
      });

    const channel = supabase
      .channel(`messages:${channelId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_messages', filter: `channel_id=eq.${channelId}` },
        async (payload) => {
          const msg = payload.new as CommunityMessage;
          let profile = profileCache.current.get(msg.user_id) ?? null;
          if (!profile) {
            const { data } = await supabase
              .from('profiles')
              .select('id, nome, avatar_url')
              .eq('id', msg.user_id)
              .maybeSingle();
            if (data) {
              profile = data as MessageProfile;
              profileCache.current.set(msg.user_id, profile);
            }
          }
          addMessage({ ...msg, profiles: profile });
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'community_messages', filter: `channel_id=eq.${channelId}` },
        (payload) => {
          const msg = payload.new as CommunityMessage;
          if (msg.eliminato) removeMessage(msg.id);
          else updateMessage(msg.id, msg);
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [channelId, setMessages, addMessage, updateMessage, removeMessage]);
}
