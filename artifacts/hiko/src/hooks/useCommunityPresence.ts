import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { UserPresence } from '@/types/index';

export function useCommunityPresence(communityId: string | null, currentUserId: string | null) {
  const [runners, setRunners] = useState<UserPresence[]>([]);

  useEffect(() => {
    if (!communityId) return;

    const channel = supabase.channel(`presence:community:${communityId}`, {
      config: { presence: { key: currentUserId ?? 'anon' } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<UserPresence>();
        const active: UserPresence[] = Object.values(state).flat().filter(
          (p) => p.condivisione !== 'nessuno' && p.community_id === communityId,
        );
        setRunners(active);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [communityId, currentUserId]);

  const trackPresence = (pos: { lat: number; lng: number }, stato: 'corsa' | 'idle', condivisione: UserPresence['condivisione']) => {
    if (!communityId || !currentUserId) return;
    const channel = supabase.channel(`presence:community:${communityId}`);
    channel.track({
      user_id: currentUserId,
      community_id: communityId,
      lat: pos.lat,
      lng: pos.lng,
      stato,
      condivisione,
      last_seen: new Date().toISOString(),
    } satisfies UserPresence);
  };

  return { runners, trackPresence };
}
