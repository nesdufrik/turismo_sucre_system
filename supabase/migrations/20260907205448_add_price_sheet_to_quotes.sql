-- Persist the effective price sheet on each quote.
-- Custom sheets override the default sheet only for prices they define.

ALTER TABLE public.cotizaciones
ADD COLUMN IF NOT EXISTS hoja_id bigint;

CREATE INDEX IF NOT EXISTS idx_cotizaciones_hoja_id
ON public.cotizaciones (hoja_id);

DO $$
DECLARE
  default_sheet_count integer;
BEGIN
  SELECT count(*)
  INTO default_sheet_count
  FROM public.hojasdeprecios
  WHERE es_default IS TRUE;

  IF default_sheet_count <> 1 THEN
    RAISE EXCEPTION
      'La migración requiere exactamente una hoja de precios por defecto; se encontraron %',
      default_sheet_count;
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'cotizaciones_hoja_id_fkey'
      AND conrelid = 'public.cotizaciones'::regclass
  ) THEN
    ALTER TABLE public.cotizaciones
    ADD CONSTRAINT cotizaciones_hoja_id_fkey
    FOREIGN KEY (hoja_id)
    REFERENCES public.hojasdeprecios (hoja_id)
    ON DELETE RESTRICT;
  END IF;
END;
$$;

-- Backfill historical quotes from the client's current sheet, falling back to the base sheet.
UPDATE public.cotizaciones AS q
SET hoja_id = COALESCE(
  (
    SELECT c.hoja_id
    FROM public.clientes AS c
    WHERE c.cliente_id = q.cliente_id
  ),
  (
    SELECT h.hoja_id
    FROM public.hojasdeprecios AS h
    WHERE h.es_default IS TRUE
    ORDER BY h.hoja_id
    LIMIT 1
  )
)
WHERE q.hoja_id IS NULL;

CREATE OR REPLACE FUNCTION public.resolve_quote_price_sheet()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  resolved_sheet_id bigint;
BEGIN
  -- An explicit sheet always wins over the client's default.
  IF NEW.hoja_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.cliente_id IS NOT NULL THEN
    SELECT c.hoja_id
    INTO resolved_sheet_id
    FROM public.clientes AS c
    WHERE c.cliente_id = NEW.cliente_id;
  END IF;

  IF resolved_sheet_id IS NULL THEN
    SELECT h.hoja_id
    INTO resolved_sheet_id
    FROM public.hojasdeprecios AS h
    WHERE h.es_default IS TRUE
    ORDER BY h.hoja_id
    LIMIT 1;
  END IF;

  IF resolved_sheet_id IS NULL THEN
    RAISE EXCEPTION
      'No existe una hoja de precios por defecto para la cotización';
  END IF;

  NEW.hoja_id := resolved_sheet_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_quote_price_sheet ON public.cotizaciones;

CREATE TRIGGER set_quote_price_sheet
BEFORE INSERT ON public.cotizaciones
FOR EACH ROW
EXECUTE FUNCTION public.resolve_quote_price_sheet();

REVOKE ALL ON FUNCTION public.resolve_quote_price_sheet() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_quote_price_sheet() TO authenticated, service_role;

ALTER TABLE public.cotizaciones
ALTER COLUMN hoja_id SET NOT NULL;

COMMENT ON COLUMN public.cotizaciones.hoja_id IS
'Hoja efectiva de la cotización; sus precios sobrescriben la hoja por defecto y los faltantes hacen fallback a ella.';
