-- Prevent changing the effective price sheet after quote items exist.

CREATE OR REPLACE FUNCTION public.fn_prevent_quote_price_sheet_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.hoja_id IS DISTINCT FROM OLD.hoja_id
     AND EXISTS (
       SELECT 1
       FROM public.itemscotizacion AS item
       WHERE item.cotizacion_id = OLD.cotizacion_id
     ) THEN
    RAISE EXCEPTION
      'No se puede cambiar la hoja de precios mientras la cotización tenga artículos. Elimine los artículos o cree una nueva cotización.'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_quote_price_sheet_change ON public.cotizaciones;

CREATE TRIGGER trg_prevent_quote_price_sheet_change
BEFORE UPDATE ON public.cotizaciones
FOR EACH ROW
EXECUTE FUNCTION public.fn_prevent_quote_price_sheet_change();

REVOKE ALL ON FUNCTION public.fn_prevent_quote_price_sheet_change() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_prevent_quote_price_sheet_change() TO authenticated, service_role;

COMMENT ON FUNCTION public.fn_prevent_quote_price_sheet_change() IS
'Prevents changing a quote price sheet while the quote has items.';
