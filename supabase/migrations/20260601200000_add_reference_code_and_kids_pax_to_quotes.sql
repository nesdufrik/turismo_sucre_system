-- Migración para agregar codigo_referencia, cantidad_pax_ninos y porcentaje_pago_ninos a cotizaciones

-- 1. Agregar columnas a la tabla cotizaciones
ALTER TABLE public.cotizaciones 
ADD COLUMN IF NOT EXISTS codigo_referencia text,
ADD COLUMN IF NOT EXISTS cantidad_pax_ninos integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS porcentaje_pago_ninos numeric NOT NULL DEFAULT 50.0;

-- 2. Función para generar código de referencia único
CREATE OR REPLACE FUNCTION public.generate_unique_quote_reference()
RETURNS text AS $$
DECLARE
  chars text[] := '{A,B,C,D,E,F,G,H,J,K,L,M,N,P,Q,R,S,T,U,V,W,X,Y,Z,2,3,4,5,6,7,8,9}'; -- Excluye 0, 1, O, I para evitar confusiones
  result text;
  i integer;
  exists_code boolean;
BEGIN
  LOOP
    result := 'COT-';
    FOR i IN 1..6 LOOP
      result := result || chars[1 + floor(random() * array_length(chars, 1))::integer];
    END LOOP;
    
    SELECT EXISTS(SELECT 1 FROM public.cotizaciones WHERE codigo_referencia = result) INTO exists_code;
    IF NOT exists_code THEN
      RETURN result;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger para autogenerar el código de referencia en inserciones
CREATE OR REPLACE FUNCTION public.trg_populate_quote_reference()
RETURNS trigger AS $$
BEGIN
  IF NEW.codigo_referencia IS NULL THEN
    NEW.codigo_referencia := public.generate_unique_quote_reference();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_quote_reference ON public.cotizaciones;
CREATE TRIGGER set_quote_reference
BEFORE INSERT ON public.cotizaciones
FOR EACH ROW
EXECUTE FUNCTION public.trg_populate_quote_reference();

-- 4. Rellenar códigos para cotizaciones existentes
UPDATE public.cotizaciones 
SET codigo_referencia = public.generate_unique_quote_reference()
WHERE codigo_referencia IS NULL;

-- 5. Hacer codigo_referencia NOT NULL y UNIQUE
ALTER TABLE public.cotizaciones ALTER COLUMN codigo_referencia SET NOT NULL;

-- Agregar restricción de unicidad si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cotizaciones_codigo_referencia_key'
  ) THEN
    ALTER TABLE public.cotizaciones ADD CONSTRAINT cotizaciones_codigo_referencia_key UNIQUE (codigo_referencia);
  END IF;
END;
$$;

-- 6. Recrear/actualizar la vista v_cotizaciones_detalles para incluir las nuevas columnas
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

COMMENT ON VIEW public.v_cotizaciones_detalles IS 'Vista optimizada para listados y búsquedas de cotizaciones con datos de cliente integrados, código de referencia y pax niños.';
