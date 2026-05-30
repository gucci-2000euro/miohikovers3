import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { userId, communityId, lat, lng, livelloRunner } = await req.json();
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  const difficultyMap: Record<string, string[]> = {
    principiante: ['easy'],
    intermedio: ['easy', 'medium'],
    avanzato: ['medium', 'hard'],
  };
  const difficulties = difficultyMap[livelloRunner] ?? ['easy', 'medium', 'hard'];

  // Percorsi entro 5km dalla posizione utente, difficoltà coerente,
  // con almeno 2 corse da membri community nell'ultimo mese
  const { data: routes } = await supabase.rpc('suggest_community_routes', {
    p_community_id: communityId,
    p_lat: lat,
    p_lng: lng,
    p_radius_km: 5,
    p_difficulties: difficulties,
    p_limit: 3,
  });

  return new Response(JSON.stringify(routes ?? []), { headers: { 'Content-Type': 'application/json' } });
});
