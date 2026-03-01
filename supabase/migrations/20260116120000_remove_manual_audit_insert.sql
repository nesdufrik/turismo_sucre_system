-- ELIMINACIÓN DE POLÍTICA DE INSERCIÓN MANUAL EN AUDITORÍA
-- La auditoría se realiza mediante triggers con SECURITY DEFINER, 
-- por lo que permitir INSERT manual a los usuarios es un riesgo innecesario.

DROP POLICY IF EXISTS "audit_insert_policy" ON public.auditoria;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.auditoria;

-- Solo permitimos ver los logs a quienes tengan el permiso adecuado
-- El INSERT ya no es necesario como política RLS.
