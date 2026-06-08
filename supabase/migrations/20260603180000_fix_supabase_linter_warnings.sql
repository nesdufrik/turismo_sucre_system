-- Migration: Fix Supabase Linter Warnings (Security & Performance)
-- Reason: Fix 92 linter warnings related to mutable search paths, broad storage listing, security definer functions, and public schema exposure in GraphQL.
-- Created at: 2026-06-03

-- =========================================================================
-- 1. FIX MUTABLE SEARCH PATHS (function_search_path_mutable)
-- =========================================================================
ALTER FUNCTION public.generate_unique_quote_reference() SET search_path = public;
ALTER FUNCTION public.trg_populate_quote_reference() SET search_path = public;

-- =========================================================================
-- 2. RESTRICT STORAGE LISTING ON PUBLIC BUCKETS (public_bucket_allows_listing)
-- =========================================================================
-- Avatars: Only authenticated users can list/query metadata, but public URLs still work
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible." ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'avatars');

-- Company Assets: Only authenticated users can list/query metadata, but public URLs still work
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'company_assets');

-- =========================================================================
-- 3. HARDEN SECURITY DEFINER FUNCTIONS PRIVILEGES
--    (anon_security_definer_function_executable & authenticated_security_definer_function_executable)
-- =========================================================================
-- Revoke execution from PUBLIC for all SECURITY DEFINER functions (which includes anon and authenticated by default)
REVOKE EXECUTE ON FUNCTION public.assign_user_role(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_permission(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.fn_auditar_cambios() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.fn_auditar_cambios_v2() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.fn_notify_quote_review() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.fn_sync_user_claims(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.fn_trigger_send_invitation() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_audit_tables() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_invite_details(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_unified() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.remove_user_roles(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sync_profile_emails() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.system_assign_user_role(uuid, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.system_delete_invite(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.system_find_invite_by_email(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.toggle_user_status(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.trg_on_role_permission_change() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.trg_on_user_role_change() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_role_permissions(integer, integer[]) FROM PUBLIC;

-- Grant execution explicitly to required roles

-- Register page invitation details (must be executable by anon BEFORE login)
GRANT EXECUTE ON FUNCTION public.get_invite_details(uuid) TO anon, authenticated, service_role;

-- Policies and RLS helpers
GRANT EXECUTE ON FUNCTION public.check_permission(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

-- Admin Panel Dashboard Actions (RPCs called by auth users)
GRANT EXECUTE ON FUNCTION public.assign_user_role(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.remove_user_roles(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.toggle_user_status(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_audit_tables() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_role_permissions(integer, integer[]) TO authenticated, service_role;

-- Internal Administrative Functions (Called only by backend or service_role)
GRANT EXECUTE ON FUNCTION public.fn_sync_user_claims(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.sync_profile_emails() TO service_role;
GRANT EXECUTE ON FUNCTION public.system_assign_user_role(uuid, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.system_delete_invite(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.system_find_invite_by_email(text) TO service_role;

-- =========================================================================
-- 4. REMOVE PUBLIC SCHEMA ACCESS FROM ANON TO PREVENT GRAPHQL SCHEMA EXPOSURE
--    (pg_graphql_anon_table_exposed)
-- =========================================================================
REVOKE SELECT ON ALL TABLES IN SCHEMA public FROM anon;
