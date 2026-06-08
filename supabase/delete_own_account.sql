-- Ejecuta en Supabase → SQL Editor (una vez por proyecto)
-- Permite que usuarios autenticados eliminen su propia cuenta desde la app.

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;

  -- Las tablas public.* tienen ON DELETE CASCADE desde auth.users
  DELETE FROM auth.users WHERE id = uid;
END;
$$;

ALTER FUNCTION public.delete_own_account() OWNER TO postgres;

REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO service_role;

-- Recarga el esquema de PostgREST para que la app encuentre la función RPC
NOTIFY pgrst, 'reload schema';
