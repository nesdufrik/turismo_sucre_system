-- Habilitar la extensión pg_net para peticiones HTTP
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Función para invocar la Edge Function de invitación
CREATE OR REPLACE FUNCTION public.fn_trigger_send_invitation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_id bigint;
  payload jsonb;
  -- URL de la función (ajustable según el entorno, usaremos la interna de docker para local)
  function_url text := 'http://host.docker.internal:54321/functions/v1/send-invitation';
BEGIN
    payload := jsonb_build_object(
        'record', row_to_json(NEW)
    );

    -- Realizar la petición HTTP asíncrona
    SELECT net.http_post(
        url := function_url,
        body := payload,
        headers := jsonb_build_object(
            'Content-Type', 'application/json'
        )
    ) INTO request_id;

    RETURN NEW;
END;
$$;

-- Trigger para ejecutar la función después de un insert en user_invites
DROP TRIGGER IF EXISTS tr_on_user_invite_created ON public.user_invites;
CREATE TRIGGER tr_on_user_invite_created
    AFTER INSERT ON public.user_invites
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_trigger_send_invitation();

COMMENT ON FUNCTION public.fn_trigger_send_invitation() IS 'Invoca la Edge Function send-invitation automáticamente al crear una invitación.';
