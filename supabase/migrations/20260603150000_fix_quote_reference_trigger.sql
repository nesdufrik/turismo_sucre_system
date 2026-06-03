-- Migración para corregir el trigger de generación de códigos de referencia de cotizaciones
-- Corrige el comportamiento cuando el frontend envía una cadena vacía en lugar de nulo.

-- 1. Actualizar la función del trigger para verificar nulo o vacío
CREATE OR REPLACE FUNCTION public.trg_populate_quote_reference()
RETURNS trigger AS $$
BEGIN
  IF NEW.codigo_referencia IS NULL OR NEW.codigo_referencia = '' THEN
    NEW.codigo_referencia := public.generate_unique_quote_reference();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Backfill para corregir cualquier cotización que haya quedado con código en blanco
UPDATE public.cotizaciones 
SET codigo_referencia = public.generate_unique_quote_reference()
WHERE codigo_referencia = '';
