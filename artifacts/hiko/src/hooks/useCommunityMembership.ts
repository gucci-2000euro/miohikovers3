import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { CommunityMember } from '@/types/index';

export function membershipKey(communityId: string, userId: string) {
  return ['membership', communityId, userId];
}

export function useCommunityMembership(communityId: string | null, userId: string | null) {
  const { data, isLoading } = useQuery({
    queryKey: membershipKey(communityId ?? '', userId ?? ''),
    queryFn: async () => {
      const { data } = await supabase
        .from('community_members')
        .select('ruolo, stato')
        .eq('community_id', communityId!)
        .eq('user_id', userId!)
        .maybeSingle();
      return data ?? null;
    },
    enabled: !!communityId && !!userId,
    staleTime: 30_000,
  });

  const active = data?.stato === 'attivo';
  return {
    isMember: active,
    role: active ? (data?.ruolo as CommunityMember['ruolo']) : null,
    isLoading,
  };
}
