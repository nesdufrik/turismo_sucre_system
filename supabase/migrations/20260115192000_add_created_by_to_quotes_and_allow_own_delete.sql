-- 1. Añadir columna creado_por a cotizaciones
ALTER TABLE public.cotizaciones 
ADD COLUMN creado_por uuid REFERENCES auth.users(id) DEFAULT auth.uid();

-- 2. Actualizar política de inserción para asegurar que se registre el creador
DROP POLICY IF EXISTS "quotes_insert_policy" ON public.cotizaciones;
CREATE POLICY "quotes_insert_policy" ON public.cotizaciones 
FOR INSERT TO authenticated 
WITH CHECK (
  check_permission('quotes.create') AND (creado_por = auth.uid())
);

-- 3. Actualizar política de borrado
-- Permite borrar si tienes el permiso global OR si eres el dueño de la cotización
DROP POLICY IF EXISTS "quotes_delete_policy" ON public.cotizaciones;
CREATE POLICY "quotes_delete_policy" ON public.cotizaciones 
FOR DELETE TO authenticated 
USING (
  check_permission('quotes.delete') OR (creado_por = auth.uid())
);
