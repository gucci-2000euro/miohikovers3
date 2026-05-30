-- ══════════════════════════════════════════════════════════════════════
-- HIKO — Fix nomi utente generati automaticamente (runner_xxx)
-- ══════════════════════════════════════════════════════════════════════

-- 1. Aggiorna handle_new_user: usa email prefix come fallback
--    invece di NULL o nomi generati.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, nome)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(trim(NEW.raw_user_meta_data->>'name'), ''),
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 2. Correggi profili esistenti con nome runner_xxx (8 hex chars = primo
--    segmento UUID, pattern inequivocabile dei nomi auto-generati).
UPDATE profiles p
SET    nome = split_part(u.email, '@', 1)
FROM   auth.users u
WHERE  p.id  = u.id
  AND  p.nome ~ '^runner_[a-f0-9]{8}$';
