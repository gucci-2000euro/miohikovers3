import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

export interface Challenge {
  id: string;
  nome: string;
  descrizione: string | null;
  tipo: 'km' | 'corse';
  obiettivo: number;
  difficolta: 'easy' | 'medium' | 'hard';
  punti: number;
  durata_giorni: number;
  icona: string;
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  valore_attuale: number;
  completata: boolean;
  scadenza: string;
  accepted_at: string;
  completata_at: string | null;
  challenge: Challenge;
}

export function useChallenges() {
  return useQuery<Challenge[]>({
    queryKey: ['challenges'],
    queryFn: async () => {
      const { data } = await supabase
        .from('challenges')
        .select('*')
        .order('difficolta')
        .order('punti');
      return (data ?? []) as Challenge[];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useUserChallenges() {
  const user = useAuthStore(s => s.user);
  return useQuery<UserChallenge[]>({
    queryKey: ['user-challenges', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_challenges')
        .select('*, challenge:challenges(*)')
        .eq('user_id', user!.id)
        .order('accepted_at', { ascending: false });
      return (data ?? []) as UserChallenge[];
    },
    enabled: !!user,
    staleTime: 30_000,
  });
}

export function useAcceptChallenge() {
  const queryClient = useQueryClient();
  const user = useAuthStore(s => s.user);

  return useMutation({
    mutationFn: async (challenge: Challenge) => {
      if (!user) throw new Error('Non autenticato');
      const scadenza = new Date();
      scadenza.setDate(scadenza.getDate() + challenge.durata_giorni);
      const { error } = await supabase.from('user_challenges').insert({
        user_id: user.id,
        challenge_id: challenge.id,
        scadenza: scadenza.toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-challenges'] });
    },
  });
}
