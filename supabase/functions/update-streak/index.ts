import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { userId, userTimezone } = await req.json();
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  const { data, error } = await supabase.rpc('update_streak_atomic', {
    p_user_id: userId,
    p_timezone: userTimezone ?? 'UTC',
  });

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  // Broadcast per aggiornamento UI istantaneo
  await supabase.channel(`streak:${userId}`).send({
    type: 'broadcast',
    event: 'streak_updated',
    payload: data,
  });

  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
});

/*
  SQL function (da eseguire in migration):

  CREATE OR REPLACE FUNCTION update_streak_atomic(p_user_id uuid, p_timezone text)
  RETURNS jsonb LANGUAGE plpgsql AS $$
  DECLARE
    v_streak streaks%ROWTYPE;
    v_today date := (now() AT TIME ZONE p_timezone)::date;
    v_result jsonb;
  BEGIN
    SELECT * INTO v_streak FROM streaks WHERE user_id = p_user_id FOR UPDATE;

    IF NOT FOUND THEN
      INSERT INTO streaks (user_id, current_length, longest_length, last_day_local)
      VALUES (p_user_id, 1, 1, v_today)
      RETURNING * INTO v_streak;
      RETURN row_to_json(v_streak)::jsonb;
    END IF;

    IF v_streak.last_day_local = v_today THEN
      -- Già conteggiata oggi
      RETURN row_to_json(v_streak)::jsonb;
    END IF;

    IF v_streak.last_day_local = v_today - 1 THEN
      -- Giorno consecutivo
      v_streak.current_length := v_streak.current_length + 1;
    ELSIF v_today - v_streak.last_day_local = 2 AND v_streak.freezes_available > 0 THEN
      -- Freeze automatico
      v_streak.freezes_available := v_streak.freezes_available - 1;
      v_streak.freeze_used_on := v_streak.last_day_local + 1;
      v_streak.current_length := v_streak.current_length + 1;
    ELSE
      -- Reset
      v_streak.current_length := 1;
    END IF;

    v_streak.last_day_local := v_today;
    v_streak.longest_length := GREATEST(v_streak.longest_length, v_streak.current_length);
    v_streak.updated_at := now();

    UPDATE streaks SET
      current_length = v_streak.current_length,
      longest_length = v_streak.longest_length,
      last_day_local = v_streak.last_day_local,
      freezes_available = v_streak.freezes_available,
      freeze_used_on = v_streak.freeze_used_on,
      updated_at = v_streak.updated_at
    WHERE user_id = p_user_id;

    RETURN row_to_json(v_streak)::jsonb;
  END;
  $$;
*/
