-- Migration: Optimize RLS policies for Notifications table (InitPlan)
-- Reason: Performance improvement by reducing auth.uid() evaluations
-- Created at: 2026-01-18

BEGIN;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notificaciones;
CREATE POLICY "Users can view their own notifications"
ON public.notificaciones
FOR SELECT
TO authenticated
USING (usuario_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update their own notifications (mark as read)" ON public.notificaciones;
CREATE POLICY "Users can update their own notifications (mark as read)"
ON public.notificaciones
FOR UPDATE
TO authenticated
USING (usuario_id = (SELECT auth.uid()))
WITH CHECK (usuario_id = (SELECT auth.uid()));

COMMIT;
