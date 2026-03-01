-- 1. Función de validación de permisos (Refinada para tu JWT)
CREATE OR REPLACE FUNCTION public.check_permission(required_permission text)
RETURNS boolean 
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, temp
AS $$
BEGIN
  RETURN (
    COALESCE(
      (auth.jwt() -> 'app_metadata' -> 'authorization' -> 'permissions')::jsonb ? required_permission,
      false
    )
  );
END;
$$;

-- 2. Limpieza y endurecimiento de COTIZACIONES
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.cotizaciones;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.cotizaciones;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.cotizaciones;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.cotizaciones;

CREATE POLICY "quotes_select_policy" ON public.cotizaciones FOR SELECT TO authenticated USING (check_permission('quotes.view'));
CREATE POLICY "quotes_insert_policy" ON public.cotizaciones FOR INSERT TO authenticated WITH CHECK (check_permission('quotes.create'));
CREATE POLICY "quotes_update_policy" ON public.cotizaciones FOR UPDATE TO authenticated USING (check_permission('quotes.edit'));
CREATE POLICY "quotes_delete_policy" ON public.cotizaciones FOR DELETE TO authenticated USING (check_permission('quotes.delete'));

-- 3. Limpieza y endurecimiento de INVENTARIO (Hoteles y Servicios)
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.hoteles;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.servicios;

-- Hoteles
CREATE POLICY "hoteles_select_policy" ON public.hoteles FOR SELECT TO authenticated USING (check_permission('inventory.view'));
CREATE POLICY "hoteles_modify_policy" ON public.hoteles FOR ALL TO authenticated USING (check_permission('inventory.manage')) WITH CHECK (check_permission('inventory.manage'));

-- Servicios
CREATE POLICY "servicios_select_policy" ON public.servicios FOR SELECT TO authenticated USING (check_permission('inventory.view'));
CREATE POLICY "servicios_modify_policy" ON public.servicios FOR ALL TO authenticated USING (check_permission('inventory.manage')) WITH CHECK (check_permission('inventory.manage'));

-- 4. Endurecimiento de AUDITORIA
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.auditoria;
CREATE POLICY "audit_select_policy" ON public.auditoria FOR SELECT TO authenticated USING (check_permission('audit.view'));

-- 5. Endurecimiento de CLIENTES (Usando permisos de quotes por ahora)
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.clientes;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.clientes;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.clientes;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.clientes;

CREATE POLICY "clientes_select_policy" ON public.clientes FOR SELECT TO authenticated USING (check_permission('quotes.view'));
CREATE POLICY "clientes_write_policy" ON public.clientes FOR ALL TO authenticated USING (check_permission('quotes.edit'));
