-- Añadir columna aplica_comision con valor por defecto TRUE
ALTER TABLE public.itemscotizacion 
ADD COLUMN aplica_comision BOOLEAN DEFAULT TRUE;

-- Migrar los datos: Copiamos lo que probaste en 'es_por_pax' a la nueva columna
-- Así no pierdes la configuración que acabas de testear
UPDATE public.itemscotizacion 
SET aplica_comision = es_por_pax;

-- Comentario explicativo
COMMENT ON COLUMN public.itemscotizacion.aplica_comision IS 'Indica si este item suma a la base imponible para el cálculo de la comisión de agencia';
