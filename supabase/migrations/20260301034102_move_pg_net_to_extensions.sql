-- Drop pg_net from public schema and recreate it in the extensions schema
-- Resolves the "Extension in Public" warning from Supabase Advisor
DROP EXTENSION IF EXISTS pg_net CASCADE;
CREATE EXTENSION pg_net SCHEMA extensions;
