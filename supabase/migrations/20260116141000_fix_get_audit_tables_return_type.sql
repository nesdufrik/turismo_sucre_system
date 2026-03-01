-- CORRECCIÓN DE FUNCIÓN RPC PARA OBTENER TABLAS AUDITADAS
-- Cambiamos RETURNS TABLE por RETURNS SETOF text para obtener un array de strings directo en el frontend.

CREATE OR REPLACE FUNCTION public.get_audit_tables()
RETURNS SETOF text 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT a.tabla_nombre::text
    FROM public.auditoria a
    WHERE a.tabla_nombre IS NOT NULL
    ORDER BY a.tabla_nombre;
END;
$$;

-- Mantener permisos
GRANT EXECUTE ON FUNCTION public.get_audit_tables() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_audit_tables() TO service_role;
