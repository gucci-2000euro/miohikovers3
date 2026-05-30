import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CATEGORY_MESSAGES: Record<string, string> = {
  HATE:      'Linguaggio discriminatorio non tollerato in questa community.',
  INSULT:    'Insulti personali non sono permessi in questa community.',
  BLASPHEMY: 'Espressioni blasfeme non sono appropriate in questa community.',
  THREAT:    'Minacce dirette non sono tollerate.',
  BODY:      'Commenti negativi sul corpo altrui non sono benvenuti.',
  ELITISM:   'Hiko è una community aperta a tutti i livelli di corsa.',
  SPAM:      'Contenuto ripetitivo o spam non è permesso.',
  SEXUAL:    'Contenuti o avances sessuali non sono consentiti.',
  DRUG:      'Riferimenti a sostanze illegali non sono permessi.',
};

// Versione ridotta per l'edge function — le corrispondenze ambigue vanno all'AI
const BLACKLIST: { term: string; category: string; action: 'block' | 'flag' }[] = [
  { term: 'negro',           category: 'HATE',      action: 'block' },
  { term: 'negri',           category: 'HATE',      action: 'block' },
  { term: 'frocio',          category: 'HATE',      action: 'block' },
  { term: 'nigger',          category: 'HATE',      action: 'block' },
  { term: 'faggot',          category: 'HATE',      action: 'block' },
  { term: 'chink',           category: 'HATE',      action: 'block' },
  { term: 'vaffanculo',      category: 'INSULT',    action: 'block' },
  { term: 'coglione',        category: 'INSULT',    action: 'block' },
  { term: 'stronzo',         category: 'INSULT',    action: 'block' },
  { term: 'bastardo',        category: 'INSULT',    action: 'block' },
  { term: 'porco dio',       category: 'BLASPHEMY', action: 'block' },
  { term: 'porcoddio',       category: 'BLASPHEMY', action: 'block' },
  { term: 'porca madonna',   category: 'BLASPHEMY', action: 'block' },
  { term: 'ti ammazzo',      category: 'THREAT',    action: 'block' },
  { term: 'ti spacco',       category: 'THREAT',    action: 'block' },
  { term: 'ucciditi',        category: 'THREAT',    action: 'block' },
  { term: 'muori',           category: 'THREAT',    action: 'block' },
  { term: 'puttana',         category: 'SEXUAL',    action: 'block' },
  { term: 'troia',           category: 'SEXUAL',    action: 'block' },
  { term: 'scopami',         category: 'SEXUAL',    action: 'block' },
  { term: 'ti stupro',       category: 'SEXUAL',    action: 'block' },
  { term: 'ciccione',        category: 'BODY',      action: 'flag' },
  { term: 'sei grasso',      category: 'BODY',      action: 'flag' },
  { term: 'non sei un runner', category: 'ELITISM', action: 'flag' },
  { term: 'principianti fuori', category: 'ELITISM', action: 'flag' },
];

function normalize(text: string): string {
  const leetMap: Record<string, string> = { '0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','@':'a','$':'s' };
  return text.toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .split('').map(c => leetMap[c] ?? c).join('')
    .replace(/(.)\1{2,}/g, '$1$1')
    .replace(/[^a-z0-9 ]/g, '');
}

function checkBlacklist(text: string) {
  const norm = normalize(text);
  for (const entry of BLACKLIST) {
    if (norm.includes(normalize(entry.term))) {
      return { decision: entry.action === 'block' ? 'blocked' : 'flagged', category: entry.category, confidence: 1.0 };
    }
  }
  return null;
}

async function callOpenAIModeration(text: string, apiKey: string) {
  const res = await fetch('https://api.openai.com/v1/moderations', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: text, model: 'omni-moderation-latest' }),
  });
  const data = await res.json();
  const result = data.results?.[0];
  if (!result) return null;
  if (result.flagged) {
    const cats = result.categories as Record<string, boolean>;
    const category = Object.entries(cats).find(([, v]) => v)?.[0] ?? 'SPAM';
    const score = Math.max(...Object.values(result.category_scores as Record<string, number>));
    return { decision: score >= 0.9 ? 'blocked' : 'flagged', category: category.toUpperCase(), confidence: score };
  }
  return { decision: 'approved', category: null, confidence: 1 - Math.max(...Object.values(result.category_scores as Record<string, number>)) };
}

async function callGroq(text: string, context: string[], apiKey: string) {
  const systemPrompt = `Sei un moderatore per Hiko, community sportiva italiana di running.
Categorie: HATE (odio/discriminazione), INSULT (insulti), BLASPHEMY (bestemmie), THREAT (minacce), BODY (body shaming), ELITISM (elitismo running), DRUG, SEXUAL, SPAM.
IMPORTANTE: il gergo scherzoso tra runner ("dai muoviti!", "sei lentissimo oggi lol") in contesto amichevole NON è ELITISM. Valuta sempre il tono e il contesto.
Esempi approvati: "dai muoviti!", "sei lentissimo oggi lol", "forza campione!", "mannaggia che salita!".
Esempi ELITISM: "non sei un runner vero", "principianti fuori", "quella non conta come corsa".
Esempi BLASPHEMY: bestemmie esplicite contro divinità o figure religiose.
Rispondi SOLO con JSON: {"decision":"approved"|"flagged"|"blocked","confidence":0.0-1.0,"reason":"string","category":"HATE"|"INSULT"|"BLASPHEMY"|"THREAT"|"BODY"|"ELITISM"|"DRUG"|"SEXUAL"|"SPAM"|null}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...context.slice(-10).map(c => ({ role: 'user', content: c })),
    { role: 'user', content: `Messaggio da valutare: "${text}"` },
  ];

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages, response_format: { type: 'json_object' } }),
  });
  const data = await res.json();
  return JSON.parse(data.choices?.[0]?.message?.content ?? '{}');
}

async function callClaude(text: string, context: string[], apiKey: string) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system: 'Sei un moderatore per Hiko, community di running. Rispondi SOLO con JSON valido: {"decision":"approved"|"flagged"|"blocked","confidence":0.0-1.0,"reason":"string","category":"HATE"|"INSULT"|"BLASPHEMY"|"THREAT"|"BODY"|"ELITISM"|"DRUG"|"SEXUAL"|"SPAM"|null}',
      messages: [{ role: 'user', content: `Contesto: ${context.slice(-5).join(' | ')}\nMessaggio: "${text}"` }],
    }),
  });
  const data = await res.json();
  return JSON.parse(data.content?.[0]?.text ?? '{}');
}

serve(async (req) => {
  const { messageId, channelId, text } = await req.json();
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  // Step 1: Blacklist locale
  const blacklistResult = checkBlacklist(text);
  if (blacklistResult && blacklistResult.decision === 'blocked') {
    await applyDecision(supabase, messageId, blacklistResult.decision as 'blocked', blacklistResult.category, 1.0, 'blacklist');
    return new Response(JSON.stringify({ ...blacklistResult, reason: CATEGORY_MESSAGES[blacklistResult.category] ?? 'Contenuto non consentito.' }), { headers: { 'Content-Type': 'application/json' } });
  }

  // Fetch context (last 10 messages in channel)
  const { data: contextMessages } = await supabase
    .from('community_messages')
    .select('contenuto')
    .eq('channel_id', channelId)
    .eq('eliminato', false)
    .order('created_at', { ascending: false })
    .limit(10);
  const context = (contextMessages ?? []).map((m: { contenuto: string }) => m.contenuto).reverse();

  // Step 2: OpenAI Omni-Moderation (free)
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (openaiKey) {
    const omniResult = await callOpenAIModeration(text, openaiKey);
    if (omniResult && omniResult.confidence >= 0.75) {
      await applyDecision(supabase, messageId, omniResult.decision as 'approved' | 'flagged' | 'blocked', omniResult.category, omniResult.confidence, 'openai');
      return new Response(JSON.stringify(omniResult), { headers: { 'Content-Type': 'application/json' } });
    }
  }

  // Step 3: Groq llama-3.1-8b (free tier)
  const groqKey = Deno.env.get('GROQ_API_KEY');
  if (groqKey) {
    const groqResult = await callGroq(text, context, groqKey);
    if (groqResult.confidence >= 0.75) {
      await applyDecision(supabase, messageId, groqResult.decision, groqResult.category, groqResult.confidence, 'groq');
      return new Response(JSON.stringify(groqResult), { headers: { 'Content-Type': 'application/json' } });
    }

    // Step 4: Claude Haiku escalation
    const claudeKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (claudeKey) {
      const claudeResult = await callClaude(text, context, claudeKey);
      if (claudeResult.confidence >= 0.6) {
        await applyDecision(supabase, messageId, claudeResult.decision, claudeResult.category, claudeResult.confidence, 'claude');
        return new Response(JSON.stringify(claudeResult), { headers: { 'Content-Type': 'application/json' } });
      }
    }
  }

  // Human review queue
  await supabase.from('moderation_queue').upsert({ message_id: messageId, ai_raccomandazione: 'flagged', ai_confidence: 0, ai_summary: 'Confidence too low — requires human review.' });
  return new Response(JSON.stringify({ decision: 'pending', confidence: 0, reason: 'In revisione manuale.', category: null }), { headers: { 'Content-Type': 'application/json' } });
});

async function applyDecision(supabase: ReturnType<typeof createClient>, messageId: string, decision: 'approved' | 'flagged' | 'blocked', category: string | null, confidence: number, source: string) {
  if (decision !== 'approved') {
    await supabase.from('community_messages').update({ moderazione_stato: decision === 'blocked' ? 'bloccato' : 'segnalato' }).eq('id', messageId);
    await supabase.from('moderation_queue').upsert({
      message_id: messageId,
      ai_raccomandazione: decision,
      ai_confidence: confidence,
      ai_summary: `[${source}] ${category ?? 'N/A'} — confidence: ${(confidence * 100).toFixed(0)}%`,
    });
  }
}
