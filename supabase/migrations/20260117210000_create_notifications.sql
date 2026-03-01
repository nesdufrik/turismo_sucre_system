-- Migration: Create Notifications Table and Triggers for Quotation Reviews
-- Created at: 2026-01-17

-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS public.notificaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    link TEXT,
    leida BOOLEAN DEFAULT false,
    tipo TEXT DEFAULT 'info', -- 'info', 'warning', 'success', 'error'
    metadata JSONB DEFAULT '{}'::jsonb,
    fecha_creacion TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Users can view their own notifications"
ON public.notificaciones
FOR SELECT
TO authenticated
USING (usuario_id = auth.uid());

CREATE POLICY "Users can update their own notifications (mark as read)"
ON public.notificaciones
FOR UPDATE
TO authenticated
USING (usuario_id = auth.uid())
WITH CHECK (usuario_id = auth.uid());

-- 4. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notificaciones;

-- 5. Trigger function to notify operations/admins when a quote is sent to review
CREATE OR REPLACE FUNCTION public.fn_notify_quote_review()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id UUID;
    v_titulo TEXT;
    v_mensaje TEXT;
BEGIN
    -- Only act if status changed to 'In_Review'
    IF (NEW.estado = 'In_Review' AND (OLD.estado IS NULL OR OLD.estado <> 'In_Review')) THEN
        v_titulo := 'Nueva Cotización para Revisión';
        v_mensaje := 'La cotización #' || NEW.cotizacion_id || ' (' || COALESCE(NEW.nombre_grupo, 'Sin nombre') || ') ha sido enviada a revisión.';

        -- Insert notifications for all users with 'operations' or 'admin' role
        -- We get users from user_roles table joined with roles
        INSERT INTO public.notificaciones (usuario_id, titulo, mensaje, link, tipo, metadata)
        SELECT 
            ur.user_id, 
            v_titulo, 
            v_mensaje, 
            '/quotes/' || NEW.cotizacion_id, 
            'info',
            jsonb_build_object('quote_id', NEW.cotizacion_id, 'event', 'quote_review_requested')
        FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE r.name IN ('admin', 'operations')
        -- Don't notify the person who made the change (optional, but usually better)
        AND ur.user_id <> auth.uid();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create trigger on cotizaciones table
DROP TRIGGER IF EXISTS tr_notify_quote_review ON public.cotizaciones;
CREATE TRIGGER tr_notify_quote_review
AFTER UPDATE ON public.cotizaciones
FOR EACH ROW
EXECUTE FUNCTION public.fn_notify_quote_review();

-- 7. Ensure cotizaciones table is in realtime publication as well
-- Note: It might already be there, but let's be safe.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'cotizaciones'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.cotizaciones;
    END IF;
END $$;
