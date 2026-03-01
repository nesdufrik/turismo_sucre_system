-- MIGRACIÓN DE CORRECCIÓN: SEGURIDAD Y RENDIMIENTO (RLS Y ÍNDICES)

-- ==========================================
-- 1. OPTIMIZACIÓN DE ÍNDICES (Performance Info)
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_cotizaciones_creado_por ON public.cotizaciones(creado_por);

-- ==========================================
-- 2. BLINDAJE DE SEGURIDAD (Security Warnings: always_true)
-- ==========================================

-- AUDITORIA
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.auditoria;
DROP POLICY IF EXISTS "audit_insert_policy" ON public.auditoria;
CREATE POLICY "audit_insert_policy" ON public.auditoria FOR INSERT TO authenticated WITH CHECK (true);

-- UBICACIONES
DROP POLICY IF EXISTS "Actualizan los usuarios autenticados" ON public.ubicaciones;
DROP POLICY IF EXISTS "Eliminan usuarios autenticados" ON public.ubicaciones;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.ubicaciones;
DROP POLICY IF EXISTS "Enable read access for all users authenticated" ON public.ubicaciones;
DROP POLICY IF EXISTS "ubicaciones_select_policy" ON public.ubicaciones;
DROP POLICY IF EXISTS "ubicaciones_modify_policy" ON public.ubicaciones;

CREATE POLICY "ubicaciones_select_policy" ON public.ubicaciones FOR SELECT TO authenticated USING (true);
CREATE POLICY "ubicaciones_insert_policy" ON public.ubicaciones FOR INSERT TO authenticated WITH CHECK ((SELECT check_permission('inventory.manage')));
CREATE POLICY "ubicaciones_update_policy" ON public.ubicaciones FOR UPDATE TO authenticated USING ((SELECT check_permission('inventory.manage')));
CREATE POLICY "ubicaciones_delete_policy" ON public.ubicaciones FOR DELETE TO authenticated USING ((SELECT check_permission('inventory.manage')));

-- CATEGORIAS SERVICIO
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.categoriasservicio;
DROP POLICY IF EXISTS "categoriasservicio_select_policy" ON public.categoriasservicio;
DROP POLICY IF EXISTS "categoriasservicio_modify_policy" ON public.categoriasservicio;

CREATE POLICY "categoriasservicio_select_policy" ON public.categoriasservicio FOR SELECT TO authenticated USING (true);
CREATE POLICY "categoriasservicio_insert_policy" ON public.categoriasservicio FOR INSERT TO authenticated WITH CHECK ((SELECT check_permission('inventory.manage')));
CREATE POLICY "categoriasservicio_update_policy" ON public.categoriasservicio FOR UPDATE TO authenticated USING ((SELECT check_permission('inventory.manage')));
CREATE POLICY "categoriasservicio_delete_policy" ON public.categoriasservicio FOR DELETE TO authenticated USING ((SELECT check_permission('inventory.manage')));

-- PAQUETES
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.paquetes;
DROP POLICY IF EXISTS "paquetes_select_policy" ON public.paquetes;
DROP POLICY IF EXISTS "paquetes_modify_policy" ON public.paquetes;

CREATE POLICY "paquetes_select_policy" ON public.paquetes FOR SELECT TO authenticated USING (true);
CREATE POLICY "paquetes_insert_policy" ON public.paquetes FOR INSERT TO authenticated WITH CHECK ((SELECT check_permission('inventory.manage')));
CREATE POLICY "paquetes_update_policy" ON public.paquetes FOR UPDATE TO authenticated USING ((SELECT check_permission('inventory.manage')));
CREATE POLICY "paquetes_delete_policy" ON public.paquetes FOR DELETE TO authenticated USING ((SELECT check_permission('inventory.manage')));

-- COMPONENTES PAQUETE
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.componentespaquete;
DROP POLICY IF EXISTS "componentespaquete_select_policy" ON public.componentespaquete;
DROP POLICY IF EXISTS "componentespaquete_modify_policy" ON public.componentespaquete;

CREATE POLICY "componentespaquete_select_policy" ON public.componentespaquete FOR SELECT TO authenticated USING (true);
CREATE POLICY "componentespaquete_insert_policy" ON public.componentespaquete FOR INSERT TO authenticated WITH CHECK ((SELECT check_permission('inventory.manage')));
CREATE POLICY "componentespaquete_update_policy" ON public.componentespaquete FOR UPDATE TO authenticated USING ((SELECT check_permission('inventory.manage')));
CREATE POLICY "componentespaquete_delete_policy" ON public.componentespaquete FOR DELETE TO authenticated USING ((SELECT check_permission('inventory.manage')));

-- HOJAS DE PRECIOS
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.hojasdeprecios;
DROP POLICY IF EXISTS "hojasdeprecios_select_policy" ON public.hojasdeprecios;
DROP POLICY IF EXISTS "hojasdeprecios_modify_policy" ON public.hojasdeprecios;

CREATE POLICY "hojasdeprecios_select_policy" ON public.hojasdeprecios FOR SELECT TO authenticated USING (true);
CREATE POLICY "hojasdeprecios_insert_policy" ON public.hojasdeprecios FOR INSERT TO authenticated WITH CHECK ((SELECT check_permission('inventory.manage')));
CREATE POLICY "hojasdeprecios_update_policy" ON public.hojasdeprecios FOR UPDATE TO authenticated USING ((SELECT check_permission('inventory.manage')));
CREATE POLICY "hojasdeprecios_delete_policy" ON public.hojasdeprecios FOR DELETE TO authenticated USING ((SELECT check_permission('inventory.manage')));

-- TIPOS HABITACION
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.tiposhabitacion;
DROP POLICY IF EXISTS "tiposhabitacion_select_policy" ON public.tiposhabitacion;
DROP POLICY IF EXISTS "tiposhabitacion_modify_policy" ON public.tiposhabitacion;

CREATE POLICY "tiposhabitacion_select_policy" ON public.tiposhabitacion FOR SELECT TO authenticated USING (true);
CREATE POLICY "tiposhabitacion_insert_policy" ON public.tiposhabitacion FOR INSERT TO authenticated WITH CHECK ((SELECT check_permission('inventory.manage')));
CREATE POLICY "tiposhabitacion_update_policy" ON public.tiposhabitacion FOR UPDATE TO authenticated USING ((SELECT check_permission('inventory.manage')));
CREATE POLICY "tiposhabitacion_delete_policy" ON public.tiposhabitacion FOR DELETE TO authenticated USING ((SELECT check_permission('inventory.manage')));

-- PRECIOS HABITACION
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.precioshabitacion;
DROP POLICY IF EXISTS "precioshabitacion_select_policy" ON public.precioshabitacion;
DROP POLICY IF EXISTS "precioshabitacion_modify_policy" ON public.precioshabitacion;

CREATE POLICY "precioshabitacion_select_policy" ON public.precioshabitacion FOR SELECT TO authenticated USING ((SELECT check_permission('inventory.view')));
CREATE POLICY "precioshabitacion_insert_policy" ON public.precioshabitacion FOR INSERT TO authenticated WITH CHECK ((SELECT check_permission('inventory.manage')));
CREATE POLICY "precioshabitacion_update_policy" ON public.precioshabitacion FOR UPDATE TO authenticated USING ((SELECT check_permission('inventory.manage')));
CREATE POLICY "precioshabitacion_delete_policy" ON public.precioshabitacion FOR DELETE TO authenticated USING ((SELECT check_permission('inventory.manage')));

-- PRECIOS SERVICIO
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.preciosservicio;
DROP POLICY IF EXISTS "preciosservicio_select_policy" ON public.preciosservicio;
DROP POLICY IF EXISTS "preciosservicio_modify_policy" ON public.preciosservicio;

CREATE POLICY "preciosservicio_select_policy" ON public.preciosservicio FOR SELECT TO authenticated USING ((SELECT check_permission('inventory.view')));
CREATE POLICY "preciosservicio_insert_policy" ON public.preciosservicio FOR INSERT TO authenticated WITH CHECK ((SELECT check_permission('inventory.manage')));
CREATE POLICY "preciosservicio_update_policy" ON public.preciosservicio FOR UPDATE TO authenticated USING ((SELECT check_permission('inventory.manage')));
CREATE POLICY "preciosservicio_delete_policy" ON public.preciosservicio FOR DELETE TO authenticated USING ((SELECT check_permission('inventory.manage')));

-- ITEMS COTIZACION
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.itemscotizacion;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.itemscotizacion;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.itemscotizacion;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.itemscotizacion;
DROP POLICY IF EXISTS "itemscotizacion_select_policy" ON public.itemscotizacion;
DROP POLICY IF EXISTS "itemscotizacion_modify_policy" ON public.itemscotizacion;

CREATE POLICY "itemscotizacion_select_policy" ON public.itemscotizacion FOR SELECT TO authenticated USING ((SELECT check_permission('quotes.view')));
CREATE POLICY "itemscotizacion_insert_policy" ON public.itemscotizacion FOR INSERT TO authenticated WITH CHECK ((SELECT check_permission('quotes.edit')));
CREATE POLICY "itemscotizacion_update_policy" ON public.itemscotizacion FOR UPDATE TO authenticated USING ((SELECT check_permission('quotes.edit')));
CREATE POLICY "itemscotizacion_delete_policy" ON public.itemscotizacion FOR DELETE TO authenticated USING ((SELECT check_permission('quotes.edit')));

-- ==========================================
-- 3. ELIMINACIÓN DE REDUNDANCIAS (Performance Warnings: multiple_permissive_policies)
-- ==========================================

-- CLIENTES
DROP POLICY IF EXISTS "clientes_select_policy" ON public.clientes;
DROP POLICY IF EXISTS "clientes_write_policy" ON public.clientes;
DROP POLICY IF EXISTS "clientes_modify_policy" ON public.clientes;
CREATE POLICY "clientes_select_policy" ON public.clientes FOR SELECT TO authenticated USING ((SELECT check_permission('quotes.view')));
CREATE POLICY "clientes_insert_policy" ON public.clientes FOR INSERT TO authenticated WITH CHECK ((SELECT check_permission('quotes.edit')));
CREATE POLICY "clientes_update_policy" ON public.clientes FOR UPDATE TO authenticated USING ((SELECT check_permission('quotes.edit')));
CREATE POLICY "clientes_delete_policy" ON public.clientes FOR DELETE TO authenticated USING ((SELECT check_permission('quotes.edit')));

-- CONFIGURACION SISTEMA
DROP POLICY IF EXISTS "config_select_policy" ON public.configuracion_sistema;
DROP POLICY IF EXISTS "config_all_policy" ON public.configuracion_sistema;
DROP POLICY IF EXISTS "config_modify_policy" ON public.configuracion_sistema;
CREATE POLICY "config_select_policy" ON public.configuracion_sistema FOR SELECT TO authenticated USING (true);
CREATE POLICY "config_insert_policy" ON public.configuracion_sistema FOR INSERT TO authenticated WITH CHECK ((SELECT check_permission('users.manage')));
CREATE POLICY "config_update_policy" ON public.configuracion_sistema FOR UPDATE TO authenticated USING ((SELECT check_permission('users.manage')));
CREATE POLICY "config_delete_policy" ON public.configuracion_sistema FOR DELETE TO authenticated USING ((SELECT check_permission('users.manage')));

-- CUENTAS BANCARIAS
DROP POLICY IF EXISTS "bank_select_policy" ON public.cuentas_bancarias;
DROP POLICY IF EXISTS "bank_all_policy" ON public.cuentas_bancarias;
DROP POLICY IF EXISTS "bank_modify_policy" ON public.cuentas_bancarias;
CREATE POLICY "bank_select_policy" ON public.cuentas_bancarias FOR SELECT TO authenticated USING (true);
CREATE POLICY "bank_insert_policy" ON public.cuentas_bancarias FOR INSERT TO authenticated WITH CHECK ((SELECT check_permission('users.manage')));
CREATE POLICY "bank_update_policy" ON public.cuentas_bancarias FOR UPDATE TO authenticated USING ((SELECT check_permission('users.manage')));
CREATE POLICY "bank_delete_policy" ON public.cuentas_bancarias FOR DELETE TO authenticated USING ((SELECT check_permission('users.manage')));

-- HOTELES
DROP POLICY IF EXISTS "hoteles_select_policy" ON public.hoteles;
DROP POLICY IF EXISTS "hoteles_modify_policy" ON public.hoteles;
CREATE POLICY "hoteles_select_policy" ON public.hoteles FOR SELECT TO authenticated USING (true);
CREATE POLICY "hoteles_insert_policy" ON public.hoteles FOR INSERT TO authenticated WITH CHECK ((SELECT check_permission('inventory.manage')));
CREATE POLICY "hoteles_update_policy" ON public.hoteles FOR UPDATE TO authenticated USING ((SELECT check_permission('inventory.manage')));
CREATE POLICY "hoteles_delete_policy" ON public.hoteles FOR DELETE TO authenticated USING ((SELECT check_permission('inventory.manage')));

-- SERVICIOS
DROP POLICY IF EXISTS "servicios_select_policy" ON public.servicios;
DROP POLICY IF EXISTS "servicios_modify_policy" ON public.servicios;
CREATE POLICY "servicios_select_policy" ON public.servicios FOR SELECT TO authenticated USING (true);
CREATE POLICY "servicios_insert_policy" ON public.servicios FOR INSERT TO authenticated WITH CHECK ((SELECT check_permission('inventory.manage')));
CREATE POLICY "servicios_update_policy" ON public.servicios FOR UPDATE TO authenticated USING ((SELECT check_permission('inventory.manage')));
CREATE POLICY "servicios_delete_policy" ON public.servicios FOR DELETE TO authenticated USING ((SELECT check_permission('inventory.manage')));

-- PERMISSIONS
DROP POLICY IF EXISTS "permissions_select_policy" ON public.permissions;
DROP POLICY IF EXISTS "permissions_all_policy" ON public.permissions;
DROP POLICY IF EXISTS "permissions_modify_policy" ON public.permissions;
CREATE POLICY "permissions_select_policy" ON public.permissions FOR SELECT TO authenticated USING ((SELECT check_permission('users.view')));
CREATE POLICY "permissions_insert_policy" ON public.permissions FOR INSERT TO authenticated WITH CHECK ((SELECT check_permission('users.manage')));
CREATE POLICY "permissions_update_policy" ON public.permissions FOR UPDATE TO authenticated USING ((SELECT check_permission('users.manage')));
CREATE POLICY "permissions_delete_policy" ON public.permissions FOR DELETE TO authenticated USING ((SELECT check_permission('users.manage')));

-- ROLES
DROP POLICY IF EXISTS "roles_select_policy" ON public.roles;
DROP POLICY IF EXISTS "roles_all_policy" ON public.roles;
DROP POLICY IF EXISTS "roles_modify_policy" ON public.roles;
CREATE POLICY "roles_select_policy" ON public.roles FOR SELECT TO authenticated USING ((SELECT check_permission('users.view')));
CREATE POLICY "roles_insert_policy" ON public.roles FOR INSERT TO authenticated WITH CHECK ((SELECT check_permission('users.manage')));
CREATE POLICY "roles_update_policy" ON public.roles FOR UPDATE TO authenticated USING ((SELECT check_permission('users.manage')));
CREATE POLICY "roles_delete_policy" ON public.roles FOR DELETE TO authenticated USING ((SELECT check_permission('users.manage')));

-- USER_ROLES
DROP POLICY IF EXISTS "user_roles_select_policy" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_all_policy" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_modify_policy" ON public.user_roles;
CREATE POLICY "user_roles_select_policy" ON public.user_roles FOR SELECT TO authenticated USING ((SELECT check_permission('users.view')));
CREATE POLICY "user_roles_insert_policy" ON public.user_roles FOR INSERT TO authenticated WITH CHECK ((SELECT check_permission('users.manage')));
CREATE POLICY "user_roles_update_policy" ON public.user_roles FOR UPDATE TO authenticated USING ((SELECT check_permission('users.manage')));
CREATE POLICY "user_roles_delete_policy" ON public.user_roles FOR DELETE TO authenticated USING ((SELECT check_permission('users.manage')));

-- PROFILES
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_write_policy" ON public.profiles;

CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT TO authenticated 
  USING ((SELECT check_permission('users.view')) OR (auth.uid() = profile_id));

CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE TO authenticated 
  USING ((SELECT check_permission('users.manage')) OR (auth.uid() = profile_id))
  WITH CHECK ((SELECT check_permission('users.manage')) OR (auth.uid() = profile_id));

CREATE POLICY "profiles_insert_policy" ON public.profiles FOR INSERT TO authenticated 
  WITH CHECK ((SELECT check_permission('users.manage')));

CREATE POLICY "profiles_delete_policy" ON public.profiles FOR DELETE TO authenticated 
  USING ((SELECT check_permission('users.manage')));

-- ==========================================
-- 4. OPTIMIZACIÓN RLS EXISTENTE (Auth RLS Initialization Plan)
-- ==========================================

-- COTIZACIONES
DROP POLICY IF EXISTS "quotes_select_policy" ON public.cotizaciones;
DROP POLICY IF EXISTS "quotes_update_policy" ON public.cotizaciones;
DROP POLICY IF EXISTS "quotes_insert_policy" ON public.cotizaciones;
DROP POLICY IF EXISTS "quotes_delete_policy" ON public.cotizaciones;

CREATE POLICY "quotes_select_policy" ON public.cotizaciones FOR SELECT TO authenticated 
  USING ((SELECT check_permission('quotes.view')));

CREATE POLICY "quotes_update_policy" ON public.cotizaciones FOR UPDATE TO authenticated 
  USING ((SELECT check_permission('quotes.edit')));

CREATE POLICY "quotes_insert_policy" ON public.cotizaciones FOR INSERT TO authenticated 
  WITH CHECK ((SELECT check_permission('quotes.create')) AND (creado_por = (SELECT auth.uid())));

CREATE POLICY "quotes_delete_policy" ON public.cotizaciones FOR DELETE TO authenticated 
  USING ((SELECT check_permission('quotes.delete')) OR (creado_por = (SELECT auth.uid())));