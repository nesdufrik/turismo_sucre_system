-- Migración para agregar tiene_tour_conductor y costo_tour_conductor a cotizaciones

-- 1. Agregar columnas a la tabla cotizaciones
ALTER TABLE public.cotizaciones 
ADD COLUMN IF NOT EXISTS tiene_tour_conductor boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS costo_tour_conductor numeric NOT NULL DEFAULT 0.00;

-- 2. Recrear/actualizar la vista v_cotizaciones_detalles para incluir las nuevas columnas
DROP VIEW IF EXISTS public.v_cotizaciones_detalles;

CREATE OR REPLACE VIEW public.v_cotizaciones_detalles 
WITH (security_invoker = true)
AS
SELECT 
    q.cotizacion_id,
    q.codigo_referencia,
    q.fecha_creacion,
    q.fecha_validez_hasta,
    q.estado,
    q.total_general,
    q.moneda,
    q.nombre_grupo,
    q.cantidad_pax,
    q.cantidad_pax_ninos,
    q.porcentaje_pago_ninos,
    q.tiene_tour_conductor,
    q.costo_tour_conductor,
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

COMMENT ON VIEW public.v_cotizaciones_detalles IS 'Vista optimizada para listados y búsquedas de cotizaciones con datos de cliente integrados, código de referencia, pax niños y Tour Conductor.';
