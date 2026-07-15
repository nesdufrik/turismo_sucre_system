-- Migration: add mostrar_tipo_cambio column to cotizaciones
ALTER TABLE public.cotizaciones 
ADD COLUMN mostrar_tipo_cambio BOOLEAN NOT NULL DEFAULT true;

-- Drop and recreate the view to include the new column
DROP VIEW IF EXISTS public.v_cotizaciones_detalles;

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
    q.mostrar_tipo_cambio,
    c.nombre_completo AS cliente_nombre,
    c.email AS cliente_email,
    c.telefono AS cliente_telefono,
    c.empresa AS cliente_empresa,
    c.documento_identidad AS cliente_documento
FROM public.cotizaciones q
LEFT JOIN public.clientes c ON q.cliente_id = c.cliente_id;
