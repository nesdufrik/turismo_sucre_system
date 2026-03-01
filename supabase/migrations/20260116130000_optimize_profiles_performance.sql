-- OPTIMIZACIÓN DE RENDIMIENTO: INITPLAN PARA PROFILES
-- Se envuelve auth.uid() en una subconsulta para evitar re-evaluaciones por cada fila.

DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;

CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT TO authenticated 
  USING ((SELECT check_permission('users.view')) OR ((SELECT auth.uid()) = profile_id));

CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE TO authenticated 
  USING ((SELECT check_permission('users.manage')) OR ((SELECT auth.uid()) = profile_id))
  WITH CHECK ((SELECT check_permission('users.manage')) OR ((SELECT auth.uid()) = profile_id));
