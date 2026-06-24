-- Migración para crear la vista consolidada de auditoría operativa (justificaciones de negocio)
-- Reúne la información de reapertura de cotizaciones y modificaciones/anulaciones de pagos de liquidaciones.

CREATE OR REPLACE VIEW public.v_auditoria_operativa 
WITH (security_invoker = true)
AS
SELECT 
    'reapertura_cotizacion'::text AS tipo_evento,
    rc.reapertura_id AS evento_id,
    rc.cotizacion_id AS registro_id,
    q.codigo_referencia AS referencia,
    rc.justificacion,
    rc.creado_por AS usuario_id,
    p.full_name AS usuario_nombre,
    p.email AS usuario_email,
    rc.fecha_reapertura AS fecha,
    jsonb_build_object(
        'monto_anterior', rc.monto_anterior,
        'estado_pago_anterior', rc.estado_pago_anterior
    ) AS detalles
FROM public.reaperturas_cotizaciones rc
LEFT JOIN public.cotizaciones q ON rc.cotizacion_id = q.cotizacion_id
LEFT JOIN public.profiles p ON rc.creado_por = p.profile_id

UNION ALL

SELECT 
    CASE 
        WHEN ml.tipo_modificacion = 'revert_payment' THEN 'anulacion_pago'::text
        ELSE 'modificacion_pago'::text
    END AS tipo_evento,
    ml.modificacion_id AS evento_id,
    l.cotizacion_id AS registro_id,
    q.codigo_referencia AS referencia,
    ml.justificacion,
    ml.creado_por AS usuario_id,
    p.full_name AS usuario_nombre,
    p.email AS usuario_email,
    ml.fecha_modificacion AS fecha,
    jsonb_build_object(
        'tipo_modificacion', ml.tipo_modificacion,
        'valores_anteriores', ml.valores_anteriores,
        'valores_nuevos', ml.valores_nuevos
    ) AS detalles
FROM public.modificaciones_liquidaciones ml
LEFT JOIN public.liquidaciones l ON ml.liquidacion_id = l.liquidacion_id
LEFT JOIN public.cotizaciones q ON l.cotizacion_id = q.cotizacion_id
LEFT JOIN public.profiles p ON ml.creado_por = p.profile_id;

COMMENT ON VIEW public.v_auditoria_operativa IS 'Vista consolidada de eventos y justificaciones de auditoría operativa (reaperturas y edición de pagos).';
