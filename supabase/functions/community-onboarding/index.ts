import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const HIKO_BOT_ID = '00000000-0000-0000-0000-000000000001';

serve(async (req) => {
  const { userId, communityId, userName } = await req.json();
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  // Recupera info community e numero membro
  const { data: community } = await supabase
    .from('communities')
    .select('nome, membri_count')
    .eq('id', communityId)
    .single();

  if (!community) return new Response('Community not found', { status: 404 });

  // Trova il canale Generale
  const { data: channel } = await supabase
    .from('community_channels')
    .select('id')
    .eq('community_id', communityId)
    .eq('tipo', 'generale')
    .single();

  if (!channel) return new Response('Channel not found', { status: 404 });

  // Messaggio di benvenuto
  const welcomeText = `Benvenuto/a ${userName}! 👋 Sei il membro ${community.membri_count} della community ${community.nome}. Inizia dalla prima sfida attiva oppure esplora i percorsi consigliati.`;

  await supabase.from('community_messages').insert({
    channel_id: channel.id,
    user_id: HIKO_BOT_ID,
    contenuto: welcomeText,
    tipo: 'testo',
  });

  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
});
