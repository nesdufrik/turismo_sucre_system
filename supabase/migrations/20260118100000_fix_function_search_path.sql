-- Migration: Fix mutable search_path for notifications function
-- Reason: Security hardening for SECURITY DEFINER functions (Supabase Advisor)
-- Created at: 2026-01-18

ALTER FUNCTION public.fn_notify_quote_review() 
SET search_path = public;
