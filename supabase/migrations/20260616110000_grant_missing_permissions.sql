-- Migration: Grant Missing Permissions for authenticated and service_role
-- Created at: 2026-06-16

-- 1. Grant table and view privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notificaciones TO authenticated, service_role;
GRANT SELECT ON public.v_cotizaciones_detalles TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.liquidaciones TO authenticated, service_role;
GRANT SELECT ON public.v_liquidaciones_detalles TO authenticated, service_role;

-- 2. Grant sequence usage (required for identity columns / autoincrementing IDs like liquidacion_id)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

-- 3. Configure default privileges for future tables, sequences, and functions created by postgres in schema public
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO authenticated, service_role;
