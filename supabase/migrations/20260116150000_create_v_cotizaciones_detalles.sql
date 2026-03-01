-- VISTA COMPLETA PARA COTIZACIONES
-- Aplanamos los datos para evitar errores de PostgREST y facilitar el Realtime

CREATE OR REPLACE VIEW public.v_cotizaciones_detalles 
WITH (security_invoker = true)
AS
SELECT 
    q.cotizacion_id,
    q.fecha_creacion,
    q.fecha_validez_hasta,
    q.estado,
    q.total_general,
    q.moneda,
    q.nombre_grupo,
    q.cantidad_pax,
    q.creado_por,
    q.fuente_solicitud,
    q.id_cuenta_bancaria,
    q.porcentaje_impuesto,
    q.porcentaje_comision,
    q.tipo_cambio,
    q.cliente_id,
    c.nombre_completo AS cliente_nombre,
    c.email AS cliente_email,
    c.telefono AS cliente_telefono,
    c.empresa AS cliente_empresa,
    c.documento_identidad AS cliente_documento
FROM public.cotizaciones q
LEFT JOIN public.clientes c ON q.cliente_id = c.cliente_id;

COMMENT ON VIEW public.v_cotizaciones_detalles IS 'Vista optimizada para listados y búsquedas de cotizaciones con datos de cliente integrados.';
