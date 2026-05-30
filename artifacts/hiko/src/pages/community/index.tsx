import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { CommunityCard } from '@/components/community/CommunityCard';
import type { Community } from '@/types/index';
import { Search, Plus, Loader2 } from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function CommunityList() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const user = useAuthStore(s => s.user);
  const requireAuth = useAuthStore(s => s.requireAuth);
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState<Community['tipo'] | ''>('');
  const [filterLivello, setFilterLivello] = useState<Community['livello_runner'] | ''>('');

  const { data: communities = [], isLoading } = useQuery<Community[]>({
    queryKey: ['communities', search, filterTipo, filterLivello],
    queryFn: async () => {
      let q = supabase.from('communities').select('*').order('membri_count', { ascending: false });
      if (search) q = q.ilike('nome', `%${search}%`);
      if (filterTipo) q = q.eq('tipo', filterTipo);
      if (filterLivello) q = q.eq('livello_runner', filterLivello);
      const { data } = await q.limit(30);
      return (data ?? []) as Community[];
    },
    staleTime: 0,
  });

  // Realtime: aggiorna membri_count nella lista senza navigare
  useEffect(() => {
    const ch = supabase
      .channel('communities-list-live')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'communities' },
        (payload) => {
          const updated = payload.new as Community;
          queryClient.setQueryData<Community[]>(
            ['communities', search, filterTipo, filterLivello],
            (old) => old?.map(c => c.id === updated.id ? { ...c, membri_count: updated.membri_count } : c) ?? []
          );
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [search, filterTipo, filterLivello, queryClient]);

  const handleJoin = (community: Community) => {
    requireAuth('Accedi per unirti a una community.', () => {
      setLocation(`/community/${community.id}`);
    });
  };

  return (
    <div className="min-h-screen bg-hiko-deep text-white pb-24">
      <div className="sticky top-0 z-20 bg-hiko-deep/90 backdrop-blur-md px-6 py-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Logo size={28} />
            <h1 className="text-2xl font-bold">Community</h1>
          </div>
          <button
            onClick={() => requireAuth('Accedi per creare una community.', () => setLocation('/community/create'))}
            className="bg-hiko-primary text-hiko-deep p-2 rounded-xl"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cerca community..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-hiko-primary/50"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {(['', 'aperta', 'approvazione'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilterTipo(t)}
              className={`shrink-0 text-xs px-3 py-1 rounded-lg transition-colors ${filterTipo === t ? 'bg-hiko-primary text-hiko-deep font-bold' : 'bg-white/10 text-white/60'}`}
            >
              {t === '' ? 'Tutte' : t === 'aperta' ? 'Aperte' : 'Su richiesta'}
            </button>
          ))}
          {(['', 'principiante', 'intermedio', 'avanzato'] as const).map(l => (
            <button
              key={l}
              onClick={() => setFilterLivello(l)}
              className={`shrink-0 text-xs px-3 py-1 rounded-lg transition-colors capitalize ${filterLivello === l ? 'bg-hiko-primary text-hiko-deep font-bold' : 'bg-white/10 text-white/60'}`}
            >
              {l === '' ? 'Livello' : l}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={32} className="text-hiko-primary animate-spin" />
          </div>
        ) : communities.length === 0 ? (
          <div className="text-center py-16 text-white/40">
            <p className="text-lg">Nessuna community trovata</p>
            {user && <p className="text-sm mt-1">Crea la prima!</p>}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {communities.map(c => (
              <CommunityCard
                key={c.id}
                community={c}
                onJoin={() => handleJoin(c)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
