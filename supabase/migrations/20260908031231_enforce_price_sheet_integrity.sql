-- Harden price sheet integrity without rewriting ambiguous historical service prices.
-- Audit result: existing service price rows contain seven overlapping pairs.
-- They remain for now and are documented in the implementation plan.

-- There is exactly one base sheet today. Keep that invariant at the database level.
CREATE UNIQUE INDEX IF NOT EXISTS uq_hojasdeprecios_single_default
ON public.hojasdeprecios ((es_default))
WHERE es_default IS TRUE;

-- Do not allow the system to end up without a base sheet.
CREATE OR REPLACE FUNCTION public.fn_prevent_removing_last_price_sheet_default()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  removing_default boolean := false;
BEGIN
  IF OLD.es_default IS TRUE THEN
    IF TG_OP = 'DELETE' THEN
      removing_default := true;
    ELSIF TG_OP = 'UPDATE' AND NEW.es_default IS DISTINCT FROM TRUE THEN
      removing_default := true;
    END IF;
  END IF;

  IF removing_default AND NOT EXISTS (
    SELECT 1
    FROM public.hojasdeprecios AS h
    WHERE h.es_default IS TRUE
      AND h.hoja_id <> OLD.hoja_id
  ) THEN
    RAISE EXCEPTION
      'No se puede eliminar o desactivar la única hoja de precios por defecto';
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_removing_last_price_sheet_default
ON public.hojasdeprecios;

CREATE TRIGGER trg_prevent_removing_last_price_sheet_default
BEFORE DELETE OR UPDATE OF es_default ON public.hojasdeprecios
FOR EACH ROW
EXECUTE FUNCTION public.fn_prevent_removing_last_price_sheet_default();

REVOKE ALL ON FUNCTION public.fn_prevent_removing_last_price_sheet_default() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_prevent_removing_last_price_sheet_default() TO authenticated, service_role;

-- Existing data contains no nulls or invalid values in these columns.
ALTER TABLE public.preciosservicio
  ALTER COLUMN hoja_id SET NOT NULL,
  ALTER COLUMN servicio_id SET NOT NULL,
  ALTER COLUMN min_pax SET NOT NULL,
  ALTER COLUMN max_pax SET NOT NULL,
  ALTER COLUMN precio_por_persona SET NOT NULL;

ALTER TABLE public.precioshabitacion
  ALTER COLUMN hoja_id SET NOT NULL,
  ALTER COLUMN habitacion_id SET NOT NULL,
  ALTER COLUMN precio_por_noche SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'preciosservicio_min_pax_positive'
      AND conrelid = 'public.preciosservicio'::regclass
  ) THEN
    ALTER TABLE public.preciosservicio
    ADD CONSTRAINT preciosservicio_min_pax_positive CHECK (min_pax > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'preciosservicio_max_pax_order'
      AND conrelid = 'public.preciosservicio'::regclass
  ) THEN
    ALTER TABLE public.preciosservicio
    ADD CONSTRAINT preciosservicio_max_pax_order CHECK (max_pax >= min_pax);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'preciosservicio_price_nonnegative'
      AND conrelid = 'public.preciosservicio'::regclass
  ) THEN
    ALTER TABLE public.preciosservicio
    ADD CONSTRAINT preciosservicio_price_nonnegative CHECK (precio_por_persona >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'preciosservicio_validity_range'
      AND conrelid = 'public.preciosservicio'::regclass
  ) THEN
    ALTER TABLE public.preciosservicio
    ADD CONSTRAINT preciosservicio_validity_range
    CHECK (
      valido_desde IS NULL
      OR valido_hasta IS NULL
      OR valido_desde <= valido_hasta
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'precioshabitacion_price_nonnegative'
      AND conrelid = 'public.precioshabitacion'::regclass
  ) THEN
    ALTER TABLE public.precioshabitacion
    ADD CONSTRAINT precioshabitacion_price_nonnegative CHECK (precio_por_noche >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'precioshabitacion_hoja_habitacion_key'
      AND conrelid = 'public.precioshabitacion'::regclass
  ) THEN
    ALTER TABLE public.precioshabitacion
    ADD CONSTRAINT precioshabitacion_hoja_habitacion_key UNIQUE (hoja_id, habitacion_id);
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_preciosservicio_hoja_servicio
ON public.preciosservicio (hoja_id, servicio_id);

-- Reject new or changed service ranges that overlap an existing range.
-- Existing conflicts remain editable by changing their range or deleting the row.
CREATE OR REPLACE FUNCTION public.fn_validate_service_price_overlap()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
     AND NEW.hoja_id IS NOT DISTINCT FROM OLD.hoja_id
     AND NEW.servicio_id IS NOT DISTINCT FROM OLD.servicio_id
     AND NEW.min_pax IS NOT DISTINCT FROM OLD.min_pax
     AND NEW.max_pax IS NOT DISTINCT FROM OLD.max_pax
     AND NEW.valido_desde IS NOT DISTINCT FROM OLD.valido_desde
     AND NEW.valido_hasta IS NOT DISTINCT FROM OLD.valido_hasta THEN
    RETURN NEW;
  END IF;

  IF NEW.hoja_id IS NULL
     OR NEW.servicio_id IS NULL
     OR NEW.min_pax IS NULL
     OR NEW.max_pax IS NULL THEN
    RETURN NEW;
  END IF;

  -- Serialize checks for the same sheet/service pair to avoid concurrent duplicates.
  PERFORM pg_advisory_xact_lock(
    hashtextextended(NEW.hoja_id::text || ':' || NEW.servicio_id::text, 0)
  );

  IF EXISTS (
    SELECT 1
    FROM public.preciosservicio AS existing
    WHERE existing.precio_id <> COALESCE(NEW.precio_id, -1)
      AND existing.hoja_id = NEW.hoja_id
      AND existing.servicio_id = NEW.servicio_id
      AND int4range(existing.min_pax, existing.max_pax, '[]')
          && int4range(NEW.min_pax, NEW.max_pax, '[]')
      AND daterange(
        COALESCE(existing.valido_desde, '-infinity'::date),
        COALESCE(existing.valido_hasta, 'infinity'::date),
        '[]'
      ) && daterange(
        COALESCE(NEW.valido_desde, '-infinity'::date),
        COALESCE(NEW.valido_hasta, 'infinity'::date),
        '[]'
      )
  ) THEN
    RAISE EXCEPTION
      'El rango de precio del servicio se solapa con otra tarifa de la misma hoja y servicio';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_service_price_overlap
ON public.preciosservicio;

CREATE TRIGGER trg_validate_service_price_overlap
BEFORE INSERT OR UPDATE ON public.preciosservicio
FOR EACH ROW
EXECUTE FUNCTION public.fn_validate_service_price_overlap();

REVOKE ALL ON FUNCTION public.fn_validate_service_price_overlap() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_validate_service_price_overlap() TO authenticated, service_role;

COMMENT ON FUNCTION public.fn_validate_service_price_overlap() IS
'Rejects new or range-changing service prices that overlap within the same sheet and service.';
