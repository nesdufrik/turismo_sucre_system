-- CREACIÓN DE FUNCIÓN RPC PARA OBTENER TABLAS AUDITADAS
-- Esta función devuelve los nombres únicos de las tablas que tienen registros de auditoría.

CREATE OR REPLACE FUNCTION public.get_audit_tables()
RETURNS TABLE (tabla_nombre text) 
LANGUAGE plpgsql
SECURITY DEFINER -- Para que pueda leer la tabla auditoría sin depender del RLS de SELECT del usuario
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT a.tabla_nombre
    FROM public.auditoria a
    WHERE a.tabla_nombre IS NOT NULL
    ORDER BY a.tabla_nombre;
END;
$$;

-- Permisos de ejecución
GRANT EXECUTE ON FUNCTION public.get_audit_tables() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_audit_tables() TO service_role;

COMMENT ON FUNCTION public.get_audit_tables() IS 'Devuelve una lista única de los nombres de tablas que tienen registros en la tabla de auditoría.';
