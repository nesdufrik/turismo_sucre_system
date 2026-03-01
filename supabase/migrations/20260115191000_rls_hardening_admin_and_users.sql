-- 1. Endurecer CONFIGURACION_SISTEMA
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.configuracion_sistema;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.configuracion_sistema;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.configuracion_sistema;

CREATE POLICY "config_select_policy" ON public.configuracion_sistema FOR SELECT TO authenticated USING (true);
CREATE POLICY "config_all_policy" ON public.configuracion_sistema FOR ALL TO authenticated USING (check_permission('users.manage'));

-- 2. Endurecer CUENTAS_BANCARIAS
DROP POLICY IF EXISTS "policy_read_cuentas_bancarias" ON public.cuentas_bancarias;
DROP POLICY IF EXISTS "policy_write_cuentas_bancarias" ON public.cuentas_bancarias;
DROP POLICY IF EXISTS "policy_modify_cuentas_bancarias" ON public.cuentas_bancarias;
DROP POLICY IF EXISTS "policy_delete_cuentas_bancarias" ON public.cuentas_bancarias;

CREATE POLICY "bank_select_policy" ON public.cuentas_bancarias FOR SELECT TO authenticated USING (true);
CREATE POLICY "bank_all_policy" ON public.cuentas_bancarias FOR ALL TO authenticated USING (check_permission('users.manage'));

-- 3. Endurecer PROFILES
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT TO authenticated USING (check_permission('users.view') OR (auth.uid() = profile_id));
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL TO authenticated USING (check_permission('users.manage'));

-- 4. Endurecer ROLES y PERMISSIONS (Tablas de sistema)
DROP POLICY IF EXISTS "Auth users can read roles" ON public.roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.roles;

CREATE POLICY "roles_select_policy" ON public.roles FOR SELECT TO authenticated USING (check_permission('users.view'));
CREATE POLICY "roles_all_policy" ON public.roles FOR ALL TO authenticated USING (check_permission('users.manage'));

DROP POLICY IF EXISTS "Auth users can read permissions" ON public.permissions;
DROP POLICY IF EXISTS "Admins can insert permissions" ON public.permissions;
DROP POLICY IF EXISTS "Admins can update permissions" ON public.permissions;
DROP POLICY IF EXISTS "Admins can delete permissions" ON public.permissions;

CREATE POLICY "permissions_select_policy" ON public.permissions FOR SELECT TO authenticated USING (check_permission('users.view'));
CREATE POLICY "permissions_all_policy" ON public.permissions FOR ALL TO authenticated USING (check_permission('users.manage'));

-- 5. Endurecer USER_ROLES (Crucial para seguridad)
DROP POLICY IF EXISTS "Auth users can read user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete user_roles" ON public.user_roles;

CREATE POLICY "user_roles_select_policy" ON public.user_roles FOR SELECT TO authenticated USING (check_permission('users.view'));
CREATE POLICY "user_roles_all_policy" ON public.user_roles FOR ALL TO authenticated USING (check_permission('users.manage'));
