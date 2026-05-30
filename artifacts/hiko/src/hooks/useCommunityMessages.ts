import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useCommunityStore } from '@/store/useCommunityStore';
import type { CommunityMessage } from '@/types/index';

export function useCommunityMessages(channelId: string | null) {
  const { setMessages, addMessage, updateMessage, removeMessage } = useCommunityStore();

  useEffect(() => {
    if (!channelId) return;

    // Carica gli ultimi 50 messaggi
    supabase
      .from('community_messages')
      .select('*')
      .eq('channel_id', channelId)
      .eq('eliminato', false)
      .order('created_at', { ascending: true })
      .limit(50)
      .then(({ data }) => setMessages((data as CommunityMessage[]) ?? []));

    // Realtime subscription
    const channel = supabase
      .channel(`messages:${channelId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_messages', filter: `channel_id=eq.${channelId}` },
        (payload) => addMessage(payload.new as CommunityMessage),
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
