drop extension if exists "pg_net";

create sequence "public"."permissions_id_seq";

create sequence "public"."roles_id_seq";


  create table "public"."auditoria" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "tabla_nombre" text not null,
    "registro_id" bigint not null,
    "accion" text not null,
    "valores_anteriores" jsonb,
    "valores_nuevos" jsonb,
    "usuario_id" uuid,
    "ip_address" inet,
    "user_agent" text,
    "timestamp" timestamp with time zone default now()
      );


alter table "public"."auditoria" enable row level security;


  create table "public"."categoriasservicio" (
    "categoria_id" bigint generated always as identity not null,
    "nombre" text,
    "descripcion" text,
    "color" text default '#3b82f6'::text,
    "icono" text
      );


alter table "public"."categoriasservicio" enable row level security;


  create table "public"."clientes" (
    "cliente_id" bigint generated always as identity not null,
    "nombre_completo" text,
    "email" text,
    "telefono" text,
    "empresa" text,
    "fecha_creacion" timestamp without time zone default now(),
    "hoja_id" bigint,
    "tipo_cliente" text default 'particular'::text,
    "documento_identidad" text,
    "pais" text,
    "ciudad" text,
    "direccion" text,
    "otros_datos" jsonb default '{}'::jsonb,
    "notas_internas" text
      );


alter table "public"."clientes" enable row level security;


  create table "public"."componentespaquete" (
    "paquete_id" bigint not null,
    "servicio_id" bigint not null,
    "cantidad" integer
      );


alter table "public"."componentespaquete" enable row level security;


  create table "public"."configuracion_sistema" (
    "id" uuid not null default gen_random_uuid(),
    "tipo_cambio_oficial" numeric not null default 7.05,
    "porcentaje_impuesto_default" numeric not null default 16.00,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "porcentaje_comision_default" numeric not null default 10.00
      );


alter table "public"."configuracion_sistema" enable row level security;


  create table "public"."cotizaciones" (
    "cotizacion_id" bigint generated always as identity not null,
    "cliente_id" bigint,
    "fecha_creacion" timestamp without time zone default now(),
    "fecha_validez_hasta" date,
    "estado" text,
    "total_general" numeric(10,2),
    "moneda" text,
    "fuente_solicitud" text,
    "notas_para_cliente" text,
    "notas_internas_agencia" text,
    "cantidad_pax" integer default 1,
    "nombre_grupo" text,
    "porcentaje_impuesto" numeric default 16.00,
    "porcentaje_comision" numeric default 10.00,
    "tipo_cambio" numeric default 7.05,
    "id_cuenta_bancaria" uuid,
    "aprobado_por" uuid,
    "fecha_aprobacion" timestamp with time zone,
    "motivo_rechazo" text,
    "meta_origen" jsonb
      );


alter table "public"."cotizaciones" enable row level security;


  create table "public"."cuentas_bancarias" (
    "id" uuid not null default gen_random_uuid(),
    "banco" text not null,
    "numero_cuenta" text not null,
    "tipo_cuenta" text not null,
    "moneda" text not null,
    "titular" text not null,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "es_default" boolean default false
      );


alter table "public"."cuentas_bancarias" enable row level security;


  create table "public"."hojasdeprecios" (
    "hoja_id" bigint generated always as identity not null,
    "nombre" text,
    "es_default" boolean
      );


alter table "public"."hojasdeprecios" enable row level security;


  create table "public"."hoteles" (
    "hotel_id" bigint generated always as identity not null,
    "nombre" text,
    "categoria" text,
    "ubicacion_id" bigint,
    "info_desayuno" text,
    "incluye_impuestos" boolean
      );


alter table "public"."hoteles" enable row level security;


  create table "public"."itemscotizacion" (
    "item_id" bigint generated always as identity not null,
    "cotizacion_id" bigint,
    "servicio_id" bigint,
    "habitacion_id" bigint,
    "paquete_id" bigint,
    "descripcion_snapshot" text,
    "fecha_servicio_inicio" date,
    "fecha_servicio_fin" date,
    "cantidad" integer,
    "numero_pax" integer,
    "precio_unitario_snapshot" numeric(10,2),
    "subtotal_item" numeric(10,2),
    "fecha_servicio" date,
    "es_por_pax" boolean default true
      );


alter table "public"."itemscotizacion" enable row level security;


  create table "public"."paquetes" (
    "paquete_id" bigint generated always as identity not null,
    "nombre_paquete" text,
    "descripcion" text
      );


alter table "public"."paquetes" enable row level security;


  create table "public"."permissions" (
    "id" integer not null default nextval('public.permissions_id_seq'::regclass),
    "code" text not null,
    "description" text,
    "module" text not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."permissions" enable row level security;


  create table "public"."precioshabitacion" (
    "precio_hab_id" bigint generated always as identity not null,
    "hoja_id" bigint,
    "habitacion_id" bigint,
    "precio_por_noche" numeric,
    "temporada" text
      );


alter table "public"."precioshabitacion" enable row level security;


  create table "public"."preciosservicio" (
    "precio_id" bigint generated always as identity not null,
    "servicio_id" bigint,
    "min_pax" integer,
    "max_pax" integer,
    "precio_por_persona" numeric,
    "temporada" text,
    "valido_desde" date,
    "valido_hasta" date,
    "hoja_id" bigint
      );


alter table "public"."preciosservicio" enable row level security;


  create table "public"."profiles" (
    "profile_id" uuid not null,
    "updated_at" timestamp with time zone,
    "username" text,
    "full_name" text,
    "avatar_url" text,
    "website" text,
    "status" text not null default 'active'::text,
    "email" text
      );


alter table "public"."profiles" enable row level security;


  create table "public"."role_permissions" (
    "role_id" integer not null,
    "permission_id" integer not null
      );


alter table "public"."role_permissions" enable row level security;


  create table "public"."roles" (
    "id" integer not null default nextval('public.roles_id_seq'::regclass),
    "name" text not null,
    "description" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."roles" enable row level security;


  create table "public"."servicios" (
    "servicio_id" bigint generated always as identity not null,
    "nombre" text,
    "codigo" text,
    "descripcion" text,
    "duracion_texto" text,
    "ubicacion_id" bigint,
    "categoria_id" bigint
      );


alter table "public"."servicios" enable row level security;


  create table "public"."tiposhabitacion" (
    "habitacion_id" bigint generated always as identity not null,
    "hotel_id" bigint,
    "tipo" text,
    "precio_por_noche" numeric,
    "capacidad_personas" integer
      );


alter table "public"."tiposhabitacion" enable row level security;


  create table "public"."ubicaciones" (
    "ubicacion_id" bigint generated always as identity not null,
    "ciudad" text,
    "pais" text default 'Bolivia'::text,
    "codigo" text
      );


alter table "public"."ubicaciones" enable row level security;


  create table "public"."user_invites" (
    "id" uuid not null default gen_random_uuid(),
    "email" text not null,
    "role" text not null,
    "token" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone default now(),
    "expires_at" timestamp with time zone default (now() + '7 days'::interval),
    "created_by" uuid
      );


alter table "public"."user_invites" enable row level security;


  create table "public"."user_roles" (
    "user_id" uuid not null,
    "role_id" integer not null,
    "assigned_at" timestamp with time zone default now(),
    "assigned_by" uuid
      );


alter table "public"."user_roles" enable row level security;

alter sequence "public"."permissions_id_seq" owned by "public"."permissions"."id";

alter sequence "public"."roles_id_seq" owned by "public"."roles"."id";

CREATE UNIQUE INDEX auditoria_pkey ON public.auditoria USING btree (id);

CREATE UNIQUE INDEX categoriasservicio_pkey ON public.categoriasservicio USING btree (categoria_id);

CREATE UNIQUE INDEX clientes_email_key ON public.clientes USING btree (email);

CREATE UNIQUE INDEX clientes_pkey ON public.clientes USING btree (cliente_id);

CREATE UNIQUE INDEX componentespaquete_pkey ON public.componentespaquete USING btree (paquete_id, servicio_id);

CREATE UNIQUE INDEX configuracion_sistema_pkey ON public.configuracion_sistema USING btree (id);

CREATE UNIQUE INDEX cotizaciones_pkey ON public.cotizaciones USING btree (cotizacion_id);

CREATE UNIQUE INDEX cuentas_bancarias_pkey ON public.cuentas_bancarias USING btree (id);

CREATE UNIQUE INDEX hojasdeprecios_pkey ON public.hojasdeprecios USING btree (hoja_id);

CREATE UNIQUE INDEX hoteles_pkey ON public.hoteles USING btree (hotel_id);

CREATE INDEX idx_auditoria_usuario_id ON public.auditoria USING btree (usuario_id);

CREATE INDEX idx_clientes_hoja_id ON public.clientes USING btree (hoja_id);

CREATE INDEX idx_componentespaquete_servicio_id ON public.componentespaquete USING btree (servicio_id);

CREATE INDEX idx_cotizaciones_aprobado_por ON public.cotizaciones USING btree (aprobado_por);

CREATE INDEX idx_cotizaciones_cliente_id ON public.cotizaciones USING btree (cliente_id);

CREATE INDEX idx_cotizaciones_cuenta_bancaria ON public.cotizaciones USING btree (id_cuenta_bancaria);

CREATE INDEX idx_hoteles_ubicacion_id ON public.hoteles USING btree (ubicacion_id);

CREATE INDEX idx_itemscotizacion_cotizacion_id ON public.itemscotizacion USING btree (cotizacion_id);

CREATE INDEX idx_itemscotizacion_fecha_servicio ON public.itemscotizacion USING btree (fecha_servicio);

CREATE INDEX idx_itemscotizacion_habitacion_id ON public.itemscotizacion USING btree (habitacion_id);

CREATE INDEX idx_itemscotizacion_paquete_id ON public.itemscotizacion USING btree (paquete_id);

CREATE INDEX idx_itemscotizacion_servicio_id ON public.itemscotizacion USING btree (servicio_id);

CREATE INDEX idx_precioshabitacion_habitacion_id ON public.precioshabitacion USING btree (habitacion_id);

CREATE INDEX idx_precioshabitacion_hoja_id ON public.precioshabitacion USING btree (hoja_id);

CREATE INDEX idx_preciosservicio_hoja_id ON public.preciosservicio USING btree (hoja_id);

CREATE INDEX idx_preciosservicio_servicio_id ON public.preciosservicio USING btree (servicio_id);

CREATE INDEX idx_role_permissions_permission_id ON public.role_permissions USING btree (permission_id);

CREATE INDEX idx_servicios_categoria_id ON public.servicios USING btree (categoria_id);

CREATE INDEX idx_servicios_ubicacion_id ON public.servicios USING btree (ubicacion_id);

CREATE INDEX idx_tiposhabitacion_hotel_id ON public.tiposhabitacion USING btree (hotel_id);

CREATE INDEX idx_user_invites_created_by ON public.user_invites USING btree (created_by);

CREATE INDEX idx_user_invites_role ON public.user_invites USING btree (role);

CREATE INDEX idx_user_roles_assigned_by ON public.user_roles USING btree (assigned_by);

CREATE INDEX idx_user_roles_role_id ON public.user_roles USING btree (role_id);

CREATE UNIQUE INDEX itemscotizacion_pkey ON public.itemscotizacion USING btree (item_id);

CREATE UNIQUE INDEX paquetes_pkey ON public.paquetes USING btree (paquete_id);

CREATE UNIQUE INDEX permissions_code_key ON public.permissions USING btree (code);

CREATE UNIQUE INDEX permissions_pkey ON public.permissions USING btree (id);

CREATE UNIQUE INDEX precioshabitacion_pkey ON public.precioshabitacion USING btree (precio_hab_id);

CREATE UNIQUE INDEX preciosservicio_pkey ON public.preciosservicio USING btree (precio_id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (profile_id);

CREATE UNIQUE INDEX profiles_username_key ON public.profiles USING btree (username);

CREATE UNIQUE INDEX role_permissions_pkey ON public.role_permissions USING btree (role_id, permission_id);

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);

CREATE UNIQUE INDEX roles_pkey ON public.roles USING btree (id);

CREATE UNIQUE INDEX servicios_pkey ON public.servicios USING btree (servicio_id);

CREATE UNIQUE INDEX tiposhabitacion_pkey ON public.tiposhabitacion USING btree (habitacion_id);

CREATE UNIQUE INDEX ubicaciones_pkey ON public.ubicaciones USING btree (ubicacion_id);

CREATE UNIQUE INDEX user_invites_email_key ON public.user_invites USING btree (email);

CREATE UNIQUE INDEX user_invites_pkey ON public.user_invites USING btree (id);

CREATE UNIQUE INDEX user_roles_pkey ON public.user_roles USING btree (user_id, role_id);

alter table "public"."auditoria" add constraint "auditoria_pkey" PRIMARY KEY using index "auditoria_pkey";

alter table "public"."categoriasservicio" add constraint "categoriasservicio_pkey" PRIMARY KEY using index "categoriasservicio_pkey";

alter table "public"."clientes" add constraint "clientes_pkey" PRIMARY KEY using index "clientes_pkey";

alter table "public"."componentespaquete" add constraint "componentespaquete_pkey" PRIMARY KEY using index "componentespaquete_pkey";

alter table "public"."configuracion_sistema" add constraint "configuracion_sistema_pkey" PRIMARY KEY using index "configuracion_sistema_pkey";

alter table "public"."cotizaciones" add constraint "cotizaciones_pkey" PRIMARY KEY using index "cotizaciones_pkey";

alter table "public"."cuentas_bancarias" add constraint "cuentas_bancarias_pkey" PRIMARY KEY using index "cuentas_bancarias_pkey";

alter table "public"."hojasdeprecios" add constraint "hojasdeprecios_pkey" PRIMARY KEY using index "hojasdeprecios_pkey";

alter table "public"."hoteles" add constraint "hoteles_pkey" PRIMARY KEY using index "hoteles_pkey";

alter table "public"."itemscotizacion" add constraint "itemscotizacion_pkey" PRIMARY KEY using index "itemscotizacion_pkey";

alter table "public"."paquetes" add constraint "paquetes_pkey" PRIMARY KEY using index "paquetes_pkey";

alter table "public"."permissions" add constraint "permissions_pkey" PRIMARY KEY using index "permissions_pkey";

alter table "public"."precioshabitacion" add constraint "precioshabitacion_pkey" PRIMARY KEY using index "precioshabitacion_pkey";

alter table "public"."preciosservicio" add constraint "preciosservicio_pkey" PRIMARY KEY using index "preciosservicio_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."role_permissions" add constraint "role_permissions_pkey" PRIMARY KEY using index "role_permissions_pkey";

alter table "public"."roles" add constraint "roles_pkey" PRIMARY KEY using index "roles_pkey";

alter table "public"."servicios" add constraint "servicios_pkey" PRIMARY KEY using index "servicios_pkey";

alter table "public"."tiposhabitacion" add constraint "tiposhabitacion_pkey" PRIMARY KEY using index "tiposhabitacion_pkey";

alter table "public"."ubicaciones" add constraint "ubicaciones_pkey" PRIMARY KEY using index "ubicaciones_pkey";

alter table "public"."user_invites" add constraint "user_invites_pkey" PRIMARY KEY using index "user_invites_pkey";

alter table "public"."user_roles" add constraint "user_roles_pkey" PRIMARY KEY using index "user_roles_pkey";

alter table "public"."auditoria" add constraint "auditoria_accion_check" CHECK ((accion = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text]))) not valid;

alter table "public"."auditoria" validate constraint "auditoria_accion_check";

alter table "public"."auditoria" add constraint "auditoria_usuario_id_fkey" FOREIGN KEY (usuario_id) REFERENCES public.profiles(profile_id) not valid;

alter table "public"."auditoria" validate constraint "auditoria_usuario_id_fkey";

alter table "public"."clientes" add constraint "clientes_email_key" UNIQUE using index "clientes_email_key";

alter table "public"."clientes" add constraint "clientes_hoja_id_fkey" FOREIGN KEY (hoja_id) REFERENCES public.hojasdeprecios(hoja_id) not valid;

alter table "public"."clientes" validate constraint "clientes_hoja_id_fkey";

alter table "public"."clientes" add constraint "clientes_tipo_cliente_check" CHECK ((tipo_cliente = ANY (ARRAY['particular'::text, 'empresa'::text]))) not valid;

alter table "public"."clientes" validate constraint "clientes_tipo_cliente_check";

alter table "public"."componentespaquete" add constraint "componentespaquete_paquete_id_fkey" FOREIGN KEY (paquete_id) REFERENCES public.paquetes(paquete_id) not valid;

alter table "public"."componentespaquete" validate constraint "componentespaquete_paquete_id_fkey";

alter table "public"."componentespaquete" add constraint "componentespaquete_servicio_id_fkey" FOREIGN KEY (servicio_id) REFERENCES public.servicios(servicio_id) not valid;

alter table "public"."componentespaquete" validate constraint "componentespaquete_servicio_id_fkey";

alter table "public"."cotizaciones" add constraint "cotizaciones_aprobado_por_fkey" FOREIGN KEY (aprobado_por) REFERENCES auth.users(id) not valid;

alter table "public"."cotizaciones" validate constraint "cotizaciones_aprobado_por_fkey";

alter table "public"."cotizaciones" add constraint "cotizaciones_cliente_id_fkey" FOREIGN KEY (cliente_id) REFERENCES public.clientes(cliente_id) not valid;

alter table "public"."cotizaciones" validate constraint "cotizaciones_cliente_id_fkey";

alter table "public"."cotizaciones" add constraint "cotizaciones_id_cuenta_bancaria_fkey" FOREIGN KEY (id_cuenta_bancaria) REFERENCES public.cuentas_bancarias(id) not valid;

alter table "public"."cotizaciones" validate constraint "cotizaciones_id_cuenta_bancaria_fkey";

alter table "public"."hoteles" add constraint "hoteles_ubicacion_id_fkey" FOREIGN KEY (ubicacion_id) REFERENCES public.ubicaciones(ubicacion_id) not valid;

alter table "public"."hoteles" validate constraint "hoteles_ubicacion_id_fkey";

alter table "public"."itemscotizacion" add constraint "itemscotizacion_cotizacion_id_fkey" FOREIGN KEY (cotizacion_id) REFERENCES public.cotizaciones(cotizacion_id) ON DELETE CASCADE not valid;

alter table "public"."itemscotizacion" validate constraint "itemscotizacion_cotizacion_id_fkey";

alter table "public"."itemscotizacion" add constraint "itemscotizacion_habitacion_id_fkey" FOREIGN KEY (habitacion_id) REFERENCES public.tiposhabitacion(habitacion_id) not valid;

alter table "public"."itemscotizacion" validate constraint "itemscotizacion_habitacion_id_fkey";

alter table "public"."itemscotizacion" add constraint "itemscotizacion_paquete_id_fkey" FOREIGN KEY (paquete_id) REFERENCES public.paquetes(paquete_id) not valid;

alter table "public"."itemscotizacion" validate constraint "itemscotizacion_paquete_id_fkey";

alter table "public"."itemscotizacion" add constraint "itemscotizacion_servicio_id_fkey" FOREIGN KEY (servicio_id) REFERENCES public.servicios(servicio_id) not valid;

alter table "public"."itemscotizacion" validate constraint "itemscotizacion_servicio_id_fkey";

alter table "public"."permissions" add constraint "permissions_code_key" UNIQUE using index "permissions_code_key";

alter table "public"."precioshabitacion" add constraint "precioshabitacion_habitacion_id_fkey" FOREIGN KEY (habitacion_id) REFERENCES public.tiposhabitacion(habitacion_id) not valid;

alter table "public"."precioshabitacion" validate constraint "precioshabitacion_habitacion_id_fkey";

alter table "public"."precioshabitacion" add constraint "precioshabitacion_hoja_id_fkey" FOREIGN KEY (hoja_id) REFERENCES public.hojasdeprecios(hoja_id) not valid;

alter table "public"."precioshabitacion" validate constraint "precioshabitacion_hoja_id_fkey";

alter table "public"."preciosservicio" add constraint "preciosservicio_hoja_id_fkey" FOREIGN KEY (hoja_id) REFERENCES public.hojasdeprecios(hoja_id) not valid;

alter table "public"."preciosservicio" validate constraint "preciosservicio_hoja_id_fkey";

alter table "public"."preciosservicio" add constraint "preciosservicio_servicio_id_fkey" FOREIGN KEY (servicio_id) REFERENCES public.servicios(servicio_id) not valid;

alter table "public"."preciosservicio" validate constraint "preciosservicio_servicio_id_fkey";

alter table "public"."profiles" add constraint "profiles_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_profile_id_fkey";

alter table "public"."profiles" add constraint "profiles_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text]))) not valid;

alter table "public"."profiles" validate constraint "profiles_status_check";

alter table "public"."profiles" add constraint "profiles_username_key" UNIQUE using index "profiles_username_key";

alter table "public"."profiles" add constraint "username_length" CHECK ((char_length(username) >= 3)) not valid;

alter table "public"."profiles" validate constraint "username_length";

alter table "public"."role_permissions" add constraint "role_permissions_permission_id_fkey" FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE not valid;

alter table "public"."role_permissions" validate constraint "role_permissions_permission_id_fkey";

alter table "public"."role_permissions" add constraint "role_permissions_role_id_fkey" FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE not valid;

alter table "public"."role_permissions" validate constraint "role_permissions_role_id_fkey";

alter table "public"."roles" add constraint "roles_name_key" UNIQUE using index "roles_name_key";

alter table "public"."servicios" add constraint "servicios_categoria_id_fkey" FOREIGN KEY (categoria_id) REFERENCES public.categoriasservicio(categoria_id) not valid;

alter table "public"."servicios" validate constraint "servicios_categoria_id_fkey";

alter table "public"."servicios" add constraint "servicios_ubicacion_id_fkey" FOREIGN KEY (ubicacion_id) REFERENCES public.ubicaciones(ubicacion_id) not valid;

alter table "public"."servicios" validate constraint "servicios_ubicacion_id_fkey";

alter table "public"."tiposhabitacion" add constraint "tiposhabitacion_hotel_id_fkey" FOREIGN KEY (hotel_id) REFERENCES public.hoteles(hotel_id) not valid;

alter table "public"."tiposhabitacion" validate constraint "tiposhabitacion_hotel_id_fkey";

alter table "public"."user_invites" add constraint "user_invites_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."user_invites" validate constraint "user_invites_created_by_fkey";

alter table "public"."user_invites" add constraint "user_invites_email_key" UNIQUE using index "user_invites_email_key";

alter table "public"."user_invites" add constraint "user_invites_role_fkey" FOREIGN KEY (role) REFERENCES public.roles(name) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_invites" validate constraint "user_invites_role_fkey";

alter table "public"."user_roles" add constraint "user_roles_assigned_by_fkey" FOREIGN KEY (assigned_by) REFERENCES public.profiles(profile_id) not valid;

alter table "public"."user_roles" validate constraint "user_roles_assigned_by_fkey";

alter table "public"."user_roles" add constraint "user_roles_role_id_fkey" FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE not valid;

alter table "public"."user_roles" validate constraint "user_roles_role_id_fkey";

alter table "public"."user_roles" add constraint "user_roles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(profile_id) ON DELETE CASCADE not valid;

alter table "public"."user_roles" validate constraint "user_roles_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.assign_user_role(target_user_id uuid, target_role_name text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    new_role_id INT;
BEGIN
    -- 1. Verificar si soy admin (Seguridad extra además del RLS)
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access Denied: Only admins can assign roles';
    END IF;

    -- 2. Obtener ID del rol
    SELECT id INTO new_role_id FROM public.roles WHERE name = target_role_name;
    IF new_role_id IS NULL THEN
        RAISE EXCEPTION 'Role not found: %', target_role_name;
    END IF;

    -- 3. Transacción atómica
    -- Limpiar roles existentes (Asumiendo modelo de 1 rol principal)
    DELETE FROM public.user_roles WHERE user_id = target_user_id;

    -- Asignar nuevo
    INSERT INTO public.user_roles (user_id, role_id, assigned_by)
    VALUES (target_user_id, new_role_id, auth.uid());

    -- El trigger trg_sync_claims_user_roles se encargará de actualizar el JWT claim
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_auditar_cambios()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$begin
  if (TG_OP = 'DELETE') then
    insert into auditoria (tabla_nombre, registro_id, accion, valores_anteriores, usuario_id)
    values (TG_TABLE_NAME, old.ubicacion_id, 'DELETE', row_to_json(old), auth.uid());
    return old;
  elsif (TG_OP = 'UPDATE') then
    insert into auditoria (tabla_nombre, registro_id, accion, valores_anteriores, valores_nuevos, usuario_id)
    values (TG_TABLE_NAME, new.ubicacion_id, 'UPDATE', row_to_json(old), row_to_json(new), auth.uid());
    return new;
  elsif (TG_OP = 'INSERT') then
    insert into auditoria (tabla_nombre, registro_id, accion, valores_nuevos, usuario_id)
    values (TG_TABLE_NAME, new.ubicacion_id, 'INSERT', row_to_json(new), auth.uid());
    return new;
  end if;
  return null;
end;$function$
;

CREATE OR REPLACE FUNCTION public.fn_auditar_cambios_v2()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    pk_column TEXT;
    record_id BIGINT;
    delta_old JSONB;
    delta_new JSONB;
    full_old JSONB;
    full_new JSONB;
BEGIN
    -- Get Primary Key column name from Trigger Arguments
    IF TG_ARGV[0] IS NULL THEN
        RAISE EXCEPTION 'Audit Trigger requires PK column name as argument';
    END IF;
    pk_column := TG_ARGV[0];

    -- Convert records to JSONB
    IF TG_OP = 'DELETE' THEN
        full_old := to_jsonb(OLD);
        -- Extract ID dynamically
        EXECUTE format('SELECT ($1).%I', pk_column) USING OLD INTO record_id;
        
        INSERT INTO public.auditoria (tabla_nombre, registro_id, accion, valores_anteriores, usuario_id)
        VALUES (TG_TABLE_NAME, record_id, 'DELETE', full_old, auth.uid());
        RETURN OLD;

    ELSIF TG_OP = 'UPDATE' THEN
        full_old := to_jsonb(OLD);
        full_new := to_jsonb(NEW);
        
        -- Calculate Delta: What changed?
        -- We want to store: 
        -- valores_anteriores: Only keys that changed, with their OLD values
        -- valores_nuevos: Only keys that changed, with their NEW values
        
        -- Simple approach: Filter keys where values differ
        SELECT 
            jsonb_object_agg(key, value), -- Old values of changed keys
            jsonb_object_agg(key, full_new -> key) -- New values of changed keys
        INTO delta_old, delta_new
        FROM jsonb_each(full_old)
        WHERE full_new -> key IS DISTINCT FROM value;

        -- Only insert if there are actual changes
        IF delta_new IS NOT NULL THEN
             EXECUTE format('SELECT ($1).%I', pk_column) USING NEW INTO record_id;

             INSERT INTO public.auditoria (tabla_nombre, registro_id, accion, valores_anteriores, valores_nuevos, usuario_id)
             VALUES (TG_TABLE_NAME, record_id, 'UPDATE', delta_old, delta_new, auth.uid());
        END IF;
        
        RETURN NEW;

    ELSIF TG_OP = 'INSERT' THEN
        full_new := to_jsonb(NEW);
        EXECUTE format('SELECT ($1).%I', pk_column) USING NEW INTO record_id;

        -- For INSERT, we store the full new record because "everything is new"
        -- Optimization: You could choose to store NULL if you trust the source table exists.
        -- But storing full_new is safer for history reconstruction.
        INSERT INTO public.auditoria (tabla_nombre, registro_id, accion, valores_nuevos, usuario_id)
        VALUES (TG_TABLE_NAME, record_id, 'INSERT', full_new, auth.uid());
        
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_sync_user_claims(target_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    _role_name TEXT;
    _permissions TEXT[];
BEGIN
    -- 1. Obtener el Rol principal (Tomamos el último asignado o el de menor ID si hay varios)
    -- Simplificación: Asumimos rol único por usuario para el claim 'role'.
    SELECT r.name INTO _role_name
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = target_user_id
    LIMIT 1;

    -- Si no tiene rol, asignar 'guest' o null
    IF _role_name IS NULL THEN
        _role_name := 'guest';
    END IF;

    -- 2. Obtener Array de Permisos (Códigos)
    SELECT COALESCE(array_agg(DISTINCT p.code), ARRAY[]::TEXT[])
    INTO _permissions
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = target_user_id;

    -- 3. Actualizar auth.users (Metadata)
    -- Estructura: { "authorization": { "role": "admin", "permissions": ["a", "b"] } }
    UPDATE auth.users
    SET raw_app_meta_data = 
        jsonb_set(
            COALESCE(raw_app_meta_data, '{}'::jsonb),
            '{authorization}',
            jsonb_build_object(
                'role', _role_name,
                'permissions', _permissions
            )
        )
    WHERE id = target_user_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_invite_details(lookup_token uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    invite_data record;
BEGIN
    SELECT email, role 
    INTO invite_data
    FROM public.user_invites
    WHERE token = lookup_token
    AND expires_at > now();

    IF invite_data IS NULL THEN
        RETURN json_build_object('valid', false);
    ELSE
        RETURN json_build_object(
            'valid', true,
            'email', invite_data.email,
            'role', invite_data.role
        );
    END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user_unified()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  invite_record record;
  target_role_id int;
BEGIN
  -- A. Create Profile (Standard Insert - usually open or owned by self)
  INSERT INTO public.profiles (profile_id, full_name, avatar_url, email)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.email
  );

  -- B. Handle Role Assignment via Invitation (Using Privileged Helpers)
  
  -- 1. Search (Privileged)
  SELECT * INTO invite_record FROM public.system_find_invite_by_email(new.email);

  IF invite_record.email IS NOT NULL THEN
      -- Found: Resolve Role ID (Public table, usually readable, but lets be safe)
      SELECT id INTO target_role_id FROM public.roles WHERE name = invite_record.role;
      
      IF target_role_id IS NOT NULL THEN
          -- 2. Assign (Privileged)
          PERFORM public.system_assign_user_role(new.id, target_role_id);
      ELSE
          -- Fallback
          SELECT id INTO target_role_id FROM public.roles WHERE name = 'guest';
          IF target_role_id IS NOT NULL THEN
             PERFORM public.system_assign_user_role(new.id, target_role_id);
          END IF;
      END IF;
      
      -- 3. Delete (Privileged)
      PERFORM public.system_delete_invite(invite_record.id);
      
  ELSE
      -- No invitation: Assign Guest (Privileged)
      SELECT id INTO target_role_id FROM public.roles WHERE name = 'guest';
      
      IF target_role_id IS NOT NULL THEN
          PERFORM public.system_assign_user_role(new.id, target_role_id);
      END IF;
  END IF;

  RETURN new;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_price_sheet_default()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Si el nuevo registro o la actualización tiene es_default = true
  IF NEW.es_default = true THEN
    -- Poner es_default = false en todas las otras filas
    UPDATE public.hojasdeprecios
    SET es_default = false
    WHERE hoja_id <> NEW.hoja_id AND es_default = true;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check 'app_metadata' for authorization claims
  RETURN (auth.jwt() -> 'app_metadata' -> 'authorization' ->> 'role') = 'admin';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.jsonb_diff_val(val1 jsonb, val2 jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
DECLARE
  result JSONB;
  v RECORD;
BEGIN
  result = val1;
  FOR v IN SELECT * FROM jsonb_each(val2) LOOP
    IF result @> jsonb_build_object(v.key, v.value) THEN
      result = result - v.key;
    ELSIF result ? v.key THEN
      CONTINUE;
    ELSE
      result = result || jsonb_build_object(v.key, 'null');
    END IF;
  END LOOP;
  RETURN result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.remove_user_roles(target_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Verify Admin Access (Check DB directly, not JWT, to be sure)
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Only admins can remove roles.';
  END IF;

  DELETE FROM public.user_roles
  WHERE user_id = target_user_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.sync_profile_emails()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.profiles p
  SET email = u.email
  FROM auth.users u
  WHERE p.profile_id = u.id
  AND p.email IS NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.system_assign_user_role(target_user_id uuid, target_role_id integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_roles (user_id, role_id)
  VALUES (target_user_id, target_role_id);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.system_delete_invite(target_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.user_invites WHERE id = target_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.system_find_invite_by_email(lookup_email text)
 RETURNS TABLE(id uuid, email text, role text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY 
  SELECT i.id, i.email, i.role
  FROM public.user_invites i
  WHERE LOWER(TRIM(i.email)) = LOWER(TRIM(lookup_email));
END;
$function$
;

CREATE OR REPLACE FUNCTION public.toggle_user_status(target_user_id uuid, new_status text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Verify Admin Access
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Only admins can change user status.';
  END IF;

  UPDATE public.profiles
  SET status = new_status
  WHERE profile_id = target_user_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.trg_on_role_permission_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    target_role_id INT;
    u RECORD;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        target_role_id := OLD.role_id;
    ELSE
        target_role_id := NEW.role_id;
    END IF;

    -- Actualizar a todos los usuarios que tengan este rol
    FOR u IN SELECT user_id FROM public.user_roles WHERE role_id = target_role_id LOOP
        PERFORM public.fn_sync_user_claims(u.user_id);
    END LOOP;
    
    RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.trg_on_user_role_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        PERFORM public.fn_sync_user_claims(OLD.user_id);
        RETURN OLD;
    ELSE
        PERFORM public.fn_sync_user_claims(NEW.user_id);
        RETURN NEW;
    END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_role_permissions(target_role_id integer, new_permission_ids integer[])
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Verify Admin Access (Check DB directly)
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Only admins can manage permissions.';
  END IF;

  -- 1. Clear existing permissions for this role
  DELETE FROM public.role_permissions
  WHERE role_id = target_role_id;

  -- 2. Insert new permissions (if any)
  IF array_length(new_permission_ids, 1) > 0 THEN
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT target_role_id, unnest(new_permission_ids);
  END IF;
END;
$function$
;

grant delete on table "public"."auditoria" to "anon";

grant insert on table "public"."auditoria" to "anon";

grant references on table "public"."auditoria" to "anon";

grant select on table "public"."auditoria" to "anon";

grant trigger on table "public"."auditoria" to "anon";

grant truncate on table "public"."auditoria" to "anon";

grant update on table "public"."auditoria" to "anon";

grant delete on table "public"."auditoria" to "authenticated";

grant insert on table "public"."auditoria" to "authenticated";

grant references on table "public"."auditoria" to "authenticated";

grant select on table "public"."auditoria" to "authenticated";

grant trigger on table "public"."auditoria" to "authenticated";

grant truncate on table "public"."auditoria" to "authenticated";

grant update on table "public"."auditoria" to "authenticated";

grant delete on table "public"."auditoria" to "service_role";

grant insert on table "public"."auditoria" to "service_role";

grant references on table "public"."auditoria" to "service_role";

grant select on table "public"."auditoria" to "service_role";

grant trigger on table "public"."auditoria" to "service_role";

grant truncate on table "public"."auditoria" to "service_role";

grant update on table "public"."auditoria" to "service_role";

grant delete on table "public"."categoriasservicio" to "anon";

grant insert on table "public"."categoriasservicio" to "anon";

grant references on table "public"."categoriasservicio" to "anon";

grant select on table "public"."categoriasservicio" to "anon";

grant trigger on table "public"."categoriasservicio" to "anon";

grant truncate on table "public"."categoriasservicio" to "anon";

grant update on table "public"."categoriasservicio" to "anon";

grant delete on table "public"."categoriasservicio" to "authenticated";

grant insert on table "public"."categoriasservicio" to "authenticated";

grant references on table "public"."categoriasservicio" to "authenticated";

grant select on table "public"."categoriasservicio" to "authenticated";

grant trigger on table "public"."categoriasservicio" to "authenticated";

grant truncate on table "public"."categoriasservicio" to "authenticated";

grant update on table "public"."categoriasservicio" to "authenticated";

grant delete on table "public"."categoriasservicio" to "service_role";

grant insert on table "public"."categoriasservicio" to "service_role";

grant references on table "public"."categoriasservicio" to "service_role";

grant select on table "public"."categoriasservicio" to "service_role";

grant trigger on table "public"."categoriasservicio" to "service_role";

grant truncate on table "public"."categoriasservicio" to "service_role";

grant update on table "public"."categoriasservicio" to "service_role";

grant delete on table "public"."clientes" to "anon";

grant insert on table "public"."clientes" to "anon";

grant references on table "public"."clientes" to "anon";

grant select on table "public"."clientes" to "anon";

grant trigger on table "public"."clientes" to "anon";

grant truncate on table "public"."clientes" to "anon";

grant update on table "public"."clientes" to "anon";

grant delete on table "public"."clientes" to "authenticated";

grant insert on table "public"."clientes" to "authenticated";

grant references on table "public"."clientes" to "authenticated";

grant select on table "public"."clientes" to "authenticated";

grant trigger on table "public"."clientes" to "authenticated";

grant truncate on table "public"."clientes" to "authenticated";

grant update on table "public"."clientes" to "authenticated";

grant delete on table "public"."clientes" to "service_role";

grant insert on table "public"."clientes" to "service_role";

grant references on table "public"."clientes" to "service_role";

grant select on table "public"."clientes" to "service_role";

grant trigger on table "public"."clientes" to "service_role";

grant truncate on table "public"."clientes" to "service_role";

grant update on table "public"."clientes" to "service_role";

grant delete on table "public"."componentespaquete" to "anon";

grant insert on table "public"."componentespaquete" to "anon";

grant references on table "public"."componentespaquete" to "anon";

grant select on table "public"."componentespaquete" to "anon";

grant trigger on table "public"."componentespaquete" to "anon";

grant truncate on table "public"."componentespaquete" to "anon";

grant update on table "public"."componentespaquete" to "anon";

grant delete on table "public"."componentespaquete" to "authenticated";

grant insert on table "public"."componentespaquete" to "authenticated";

grant references on table "public"."componentespaquete" to "authenticated";

grant select on table "public"."componentespaquete" to "authenticated";

grant trigger on table "public"."componentespaquete" to "authenticated";

grant truncate on table "public"."componentespaquete" to "authenticated";

grant update on table "public"."componentespaquete" to "authenticated";

grant delete on table "public"."componentespaquete" to "service_role";

grant insert on table "public"."componentespaquete" to "service_role";

grant references on table "public"."componentespaquete" to "service_role";

grant select on table "public"."componentespaquete" to "service_role";

grant trigger on table "public"."componentespaquete" to "service_role";

grant truncate on table "public"."componentespaquete" to "service_role";

grant update on table "public"."componentespaquete" to "service_role";

grant delete on table "public"."configuracion_sistema" to "anon";

grant insert on table "public"."configuracion_sistema" to "anon";

grant references on table "public"."configuracion_sistema" to "anon";

grant select on table "public"."configuracion_sistema" to "anon";

grant trigger on table "public"."configuracion_sistema" to "anon";

grant truncate on table "public"."configuracion_sistema" to "anon";

grant update on table "public"."configuracion_sistema" to "anon";

grant delete on table "public"."configuracion_sistema" to "authenticated";

grant insert on table "public"."configuracion_sistema" to "authenticated";

grant references on table "public"."configuracion_sistema" to "authenticated";

grant select on table "public"."configuracion_sistema" to "authenticated";

grant trigger on table "public"."configuracion_sistema" to "authenticated";

grant truncate on table "public"."configuracion_sistema" to "authenticated";

grant update on table "public"."configuracion_sistema" to "authenticated";

grant delete on table "public"."configuracion_sistema" to "postgres";

grant insert on table "public"."configuracion_sistema" to "postgres";

grant references on table "public"."configuracion_sistema" to "postgres";

grant select on table "public"."configuracion_sistema" to "postgres";

grant trigger on table "public"."configuracion_sistema" to "postgres";

grant truncate on table "public"."configuracion_sistema" to "postgres";

grant update on table "public"."configuracion_sistema" to "postgres";

grant delete on table "public"."configuracion_sistema" to "service_role";

grant insert on table "public"."configuracion_sistema" to "service_role";

grant references on table "public"."configuracion_sistema" to "service_role";

grant select on table "public"."configuracion_sistema" to "service_role";

grant trigger on table "public"."configuracion_sistema" to "service_role";

grant truncate on table "public"."configuracion_sistema" to "service_role";

grant update on table "public"."configuracion_sistema" to "service_role";

grant delete on table "public"."cotizaciones" to "anon";

grant insert on table "public"."cotizaciones" to "anon";

grant references on table "public"."cotizaciones" to "anon";

grant select on table "public"."cotizaciones" to "anon";

grant trigger on table "public"."cotizaciones" to "anon";

grant truncate on table "public"."cotizaciones" to "anon";

grant update on table "public"."cotizaciones" to "anon";

grant delete on table "public"."cotizaciones" to "authenticated";

grant insert on table "public"."cotizaciones" to "authenticated";

grant references on table "public"."cotizaciones" to "authenticated";

grant select on table "public"."cotizaciones" to "authenticated";

grant trigger on table "public"."cotizaciones" to "authenticated";

grant truncate on table "public"."cotizaciones" to "authenticated";

grant update on table "public"."cotizaciones" to "authenticated";

grant delete on table "public"."cotizaciones" to "service_role";

grant insert on table "public"."cotizaciones" to "service_role";

grant references on table "public"."cotizaciones" to "service_role";

grant select on table "public"."cotizaciones" to "service_role";

grant trigger on table "public"."cotizaciones" to "service_role";

grant truncate on table "public"."cotizaciones" to "service_role";

grant update on table "public"."cotizaciones" to "service_role";

grant delete on table "public"."cuentas_bancarias" to "anon";

grant insert on table "public"."cuentas_bancarias" to "anon";

grant references on table "public"."cuentas_bancarias" to "anon";

grant select on table "public"."cuentas_bancarias" to "anon";

grant trigger on table "public"."cuentas_bancarias" to "anon";

grant truncate on table "public"."cuentas_bancarias" to "anon";

grant update on table "public"."cuentas_bancarias" to "anon";

grant delete on table "public"."cuentas_bancarias" to "authenticated";

grant insert on table "public"."cuentas_bancarias" to "authenticated";

grant references on table "public"."cuentas_bancarias" to "authenticated";

grant select on table "public"."cuentas_bancarias" to "authenticated";

grant trigger on table "public"."cuentas_bancarias" to "authenticated";

grant truncate on table "public"."cuentas_bancarias" to "authenticated";

grant update on table "public"."cuentas_bancarias" to "authenticated";

grant delete on table "public"."cuentas_bancarias" to "postgres";

grant insert on table "public"."cuentas_bancarias" to "postgres";

grant references on table "public"."cuentas_bancarias" to "postgres";

grant select on table "public"."cuentas_bancarias" to "postgres";

grant trigger on table "public"."cuentas_bancarias" to "postgres";

grant truncate on table "public"."cuentas_bancarias" to "postgres";

grant update on table "public"."cuentas_bancarias" to "postgres";

grant delete on table "public"."cuentas_bancarias" to "service_role";

grant insert on table "public"."cuentas_bancarias" to "service_role";

grant references on table "public"."cuentas_bancarias" to "service_role";

grant select on table "public"."cuentas_bancarias" to "service_role";

grant trigger on table "public"."cuentas_bancarias" to "service_role";

grant truncate on table "public"."cuentas_bancarias" to "service_role";

grant update on table "public"."cuentas_bancarias" to "service_role";

grant delete on table "public"."hojasdeprecios" to "anon";

grant insert on table "public"."hojasdeprecios" to "anon";

grant references on table "public"."hojasdeprecios" to "anon";

grant select on table "public"."hojasdeprecios" to "anon";

grant trigger on table "public"."hojasdeprecios" to "anon";

grant truncate on table "public"."hojasdeprecios" to "anon";

grant update on table "public"."hojasdeprecios" to "anon";

grant delete on table "public"."hojasdeprecios" to "authenticated";

grant insert on table "public"."hojasdeprecios" to "authenticated";

grant references on table "public"."hojasdeprecios" to "authenticated";

grant select on table "public"."hojasdeprecios" to "authenticated";

grant trigger on table "public"."hojasdeprecios" to "authenticated";

grant truncate on table "public"."hojasdeprecios" to "authenticated";

grant update on table "public"."hojasdeprecios" to "authenticated";

grant delete on table "public"."hojasdeprecios" to "service_role";

grant insert on table "public"."hojasdeprecios" to "service_role";

grant references on table "public"."hojasdeprecios" to "service_role";

grant select on table "public"."hojasdeprecios" to "service_role";

grant trigger on table "public"."hojasdeprecios" to "service_role";

grant truncate on table "public"."hojasdeprecios" to "service_role";

grant update on table "public"."hojasdeprecios" to "service_role";

grant delete on table "public"."hoteles" to "anon";

grant insert on table "public"."hoteles" to "anon";

grant references on table "public"."hoteles" to "anon";

grant select on table "public"."hoteles" to "anon";

grant trigger on table "public"."hoteles" to "anon";

grant truncate on table "public"."hoteles" to "anon";

grant update on table "public"."hoteles" to "anon";

grant delete on table "public"."hoteles" to "authenticated";

grant insert on table "public"."hoteles" to "authenticated";

grant references on table "public"."hoteles" to "authenticated";

grant select on table "public"."hoteles" to "authenticated";

grant trigger on table "public"."hoteles" to "authenticated";

grant truncate on table "public"."hoteles" to "authenticated";

grant update on table "public"."hoteles" to "authenticated";

grant delete on table "public"."hoteles" to "service_role";

grant insert on table "public"."hoteles" to "service_role";

grant references on table "public"."hoteles" to "service_role";

grant select on table "public"."hoteles" to "service_role";

grant trigger on table "public"."hoteles" to "service_role";

grant truncate on table "public"."hoteles" to "service_role";

grant update on table "public"."hoteles" to "service_role";

grant delete on table "public"."itemscotizacion" to "anon";

grant insert on table "public"."itemscotizacion" to "anon";

grant references on table "public"."itemscotizacion" to "anon";

grant select on table "public"."itemscotizacion" to "anon";

grant trigger on table "public"."itemscotizacion" to "anon";

grant truncate on table "public"."itemscotizacion" to "anon";

grant update on table "public"."itemscotizacion" to "anon";

grant delete on table "public"."itemscotizacion" to "authenticated";

grant insert on table "public"."itemscotizacion" to "authenticated";

grant references on table "public"."itemscotizacion" to "authenticated";

grant select on table "public"."itemscotizacion" to "authenticated";

grant trigger on table "public"."itemscotizacion" to "authenticated";

grant truncate on table "public"."itemscotizacion" to "authenticated";

grant update on table "public"."itemscotizacion" to "authenticated";

grant delete on table "public"."itemscotizacion" to "service_role";

grant insert on table "public"."itemscotizacion" to "service_role";

grant references on table "public"."itemscotizacion" to "service_role";

grant select on table "public"."itemscotizacion" to "service_role";

grant trigger on table "public"."itemscotizacion" to "service_role";

grant truncate on table "public"."itemscotizacion" to "service_role";

grant update on table "public"."itemscotizacion" to "service_role";

grant delete on table "public"."paquetes" to "anon";

grant insert on table "public"."paquetes" to "anon";

grant references on table "public"."paquetes" to "anon";

grant select on table "public"."paquetes" to "anon";

grant trigger on table "public"."paquetes" to "anon";

grant truncate on table "public"."paquetes" to "anon";

grant update on table "public"."paquetes" to "anon";

grant delete on table "public"."paquetes" to "authenticated";

grant insert on table "public"."paquetes" to "authenticated";

grant references on table "public"."paquetes" to "authenticated";

grant select on table "public"."paquetes" to "authenticated";

grant trigger on table "public"."paquetes" to "authenticated";

grant truncate on table "public"."paquetes" to "authenticated";

grant update on table "public"."paquetes" to "authenticated";

grant delete on table "public"."paquetes" to "service_role";

grant insert on table "public"."paquetes" to "service_role";

grant references on table "public"."paquetes" to "service_role";

grant select on table "public"."paquetes" to "service_role";

grant trigger on table "public"."paquetes" to "service_role";

grant truncate on table "public"."paquetes" to "service_role";

grant update on table "public"."paquetes" to "service_role";

grant delete on table "public"."permissions" to "anon";

grant insert on table "public"."permissions" to "anon";

grant references on table "public"."permissions" to "anon";

grant select on table "public"."permissions" to "anon";

grant trigger on table "public"."permissions" to "anon";

grant truncate on table "public"."permissions" to "anon";

grant update on table "public"."permissions" to "anon";

grant delete on table "public"."permissions" to "authenticated";

grant insert on table "public"."permissions" to "authenticated";

grant references on table "public"."permissions" to "authenticated";

grant select on table "public"."permissions" to "authenticated";

grant trigger on table "public"."permissions" to "authenticated";

grant truncate on table "public"."permissions" to "authenticated";

grant update on table "public"."permissions" to "authenticated";

grant delete on table "public"."permissions" to "service_role";

grant insert on table "public"."permissions" to "service_role";

grant references on table "public"."permissions" to "service_role";

grant select on table "public"."permissions" to "service_role";

grant trigger on table "public"."permissions" to "service_role";

grant truncate on table "public"."permissions" to "service_role";

grant update on table "public"."permissions" to "service_role";

grant delete on table "public"."precioshabitacion" to "anon";

grant insert on table "public"."precioshabitacion" to "anon";

grant references on table "public"."precioshabitacion" to "anon";

grant select on table "public"."precioshabitacion" to "anon";

grant trigger on table "public"."precioshabitacion" to "anon";

grant truncate on table "public"."precioshabitacion" to "anon";

grant update on table "public"."precioshabitacion" to "anon";

grant delete on table "public"."precioshabitacion" to "authenticated";

grant insert on table "public"."precioshabitacion" to "authenticated";

grant references on table "public"."precioshabitacion" to "authenticated";

grant select on table "public"."precioshabitacion" to "authenticated";

grant trigger on table "public"."precioshabitacion" to "authenticated";

grant truncate on table "public"."precioshabitacion" to "authenticated";

grant update on table "public"."precioshabitacion" to "authenticated";

grant delete on table "public"."precioshabitacion" to "service_role";

grant insert on table "public"."precioshabitacion" to "service_role";

grant references on table "public"."precioshabitacion" to "service_role";

grant select on table "public"."precioshabitacion" to "service_role";

grant trigger on table "public"."precioshabitacion" to "service_role";

grant truncate on table "public"."precioshabitacion" to "service_role";

grant update on table "public"."precioshabitacion" to "service_role";

grant delete on table "public"."preciosservicio" to "anon";

grant insert on table "public"."preciosservicio" to "anon";

grant references on table "public"."preciosservicio" to "anon";

grant select on table "public"."preciosservicio" to "anon";

grant trigger on table "public"."preciosservicio" to "anon";

grant truncate on table "public"."preciosservicio" to "anon";

grant update on table "public"."preciosservicio" to "anon";

grant delete on table "public"."preciosservicio" to "authenticated";

grant insert on table "public"."preciosservicio" to "authenticated";

grant references on table "public"."preciosservicio" to "authenticated";

grant select on table "public"."preciosservicio" to "authenticated";

grant trigger on table "public"."preciosservicio" to "authenticated";

grant truncate on table "public"."preciosservicio" to "authenticated";

grant update on table "public"."preciosservicio" to "authenticated";

grant delete on table "public"."preciosservicio" to "service_role";

grant insert on table "public"."preciosservicio" to "service_role";

grant references on table "public"."preciosservicio" to "service_role";

grant select on table "public"."preciosservicio" to "service_role";

grant trigger on table "public"."preciosservicio" to "service_role";

grant truncate on table "public"."preciosservicio" to "service_role";

grant update on table "public"."preciosservicio" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."role_permissions" to "anon";

grant insert on table "public"."role_permissions" to "anon";

grant references on table "public"."role_permissions" to "anon";

grant select on table "public"."role_permissions" to "anon";

grant trigger on table "public"."role_permissions" to "anon";

grant truncate on table "public"."role_permissions" to "anon";

grant update on table "public"."role_permissions" to "anon";

grant delete on table "public"."role_permissions" to "authenticated";

grant insert on table "public"."role_permissions" to "authenticated";

grant references on table "public"."role_permissions" to "authenticated";

grant select on table "public"."role_permissions" to "authenticated";

grant trigger on table "public"."role_permissions" to "authenticated";

grant truncate on table "public"."role_permissions" to "authenticated";

grant update on table "public"."role_permissions" to "authenticated";

grant delete on table "public"."role_permissions" to "service_role";

grant insert on table "public"."role_permissions" to "service_role";

grant references on table "public"."role_permissions" to "service_role";

grant select on table "public"."role_permissions" to "service_role";

grant trigger on table "public"."role_permissions" to "service_role";

grant truncate on table "public"."role_permissions" to "service_role";

grant update on table "public"."role_permissions" to "service_role";

grant delete on table "public"."roles" to "anon";

grant insert on table "public"."roles" to "anon";

grant references on table "public"."roles" to "anon";

grant select on table "public"."roles" to "anon";

grant trigger on table "public"."roles" to "anon";

grant truncate on table "public"."roles" to "anon";

grant update on table "public"."roles" to "anon";

grant delete on table "public"."roles" to "authenticated";

grant insert on table "public"."roles" to "authenticated";

grant references on table "public"."roles" to "authenticated";

grant select on table "public"."roles" to "authenticated";

grant trigger on table "public"."roles" to "authenticated";

grant truncate on table "public"."roles" to "authenticated";

grant update on table "public"."roles" to "authenticated";

grant delete on table "public"."roles" to "service_role";

grant insert on table "public"."roles" to "service_role";

grant references on table "public"."roles" to "service_role";

grant select on table "public"."roles" to "service_role";

grant trigger on table "public"."roles" to "service_role";

grant truncate on table "public"."roles" to "service_role";

grant update on table "public"."roles" to "service_role";

grant delete on table "public"."servicios" to "anon";

grant insert on table "public"."servicios" to "anon";

grant references on table "public"."servicios" to "anon";

grant select on table "public"."servicios" to "anon";

grant trigger on table "public"."servicios" to "anon";

grant truncate on table "public"."servicios" to "anon";

grant update on table "public"."servicios" to "anon";

grant delete on table "public"."servicios" to "authenticated";

grant insert on table "public"."servicios" to "authenticated";

grant references on table "public"."servicios" to "authenticated";

grant select on table "public"."servicios" to "authenticated";

grant trigger on table "public"."servicios" to "authenticated";

grant truncate on table "public"."servicios" to "authenticated";

grant update on table "public"."servicios" to "authenticated";

grant delete on table "public"."servicios" to "service_role";

grant insert on table "public"."servicios" to "service_role";

grant references on table "public"."servicios" to "service_role";

grant select on table "public"."servicios" to "service_role";

grant trigger on table "public"."servicios" to "service_role";

grant truncate on table "public"."servicios" to "service_role";

grant update on table "public"."servicios" to "service_role";

grant delete on table "public"."tiposhabitacion" to "anon";

grant insert on table "public"."tiposhabitacion" to "anon";

grant references on table "public"."tiposhabitacion" to "anon";

grant select on table "public"."tiposhabitacion" to "anon";

grant trigger on table "public"."tiposhabitacion" to "anon";

grant truncate on table "public"."tiposhabitacion" to "anon";

grant update on table "public"."tiposhabitacion" to "anon";

grant delete on table "public"."tiposhabitacion" to "authenticated";

grant insert on table "public"."tiposhabitacion" to "authenticated";

grant references on table "public"."tiposhabitacion" to "authenticated";

grant select on table "public"."tiposhabitacion" to "authenticated";

grant trigger on table "public"."tiposhabitacion" to "authenticated";

grant truncate on table "public"."tiposhabitacion" to "authenticated";

grant update on table "public"."tiposhabitacion" to "authenticated";

grant delete on table "public"."tiposhabitacion" to "service_role";

grant insert on table "public"."tiposhabitacion" to "service_role";

grant references on table "public"."tiposhabitacion" to "service_role";

grant select on table "public"."tiposhabitacion" to "service_role";

grant trigger on table "public"."tiposhabitacion" to "service_role";

grant truncate on table "public"."tiposhabitacion" to "service_role";

grant update on table "public"."tiposhabitacion" to "service_role";

grant delete on table "public"."ubicaciones" to "anon";

grant insert on table "public"."ubicaciones" to "anon";

grant references on table "public"."ubicaciones" to "anon";

grant select on table "public"."ubicaciones" to "anon";

grant trigger on table "public"."ubicaciones" to "anon";

grant truncate on table "public"."ubicaciones" to "anon";

grant update on table "public"."ubicaciones" to "anon";

grant delete on table "public"."ubicaciones" to "authenticated";

grant insert on table "public"."ubicaciones" to "authenticated";

grant references on table "public"."ubicaciones" to "authenticated";

grant select on table "public"."ubicaciones" to "authenticated";

grant trigger on table "public"."ubicaciones" to "authenticated";

grant truncate on table "public"."ubicaciones" to "authenticated";

grant update on table "public"."ubicaciones" to "authenticated";

grant delete on table "public"."ubicaciones" to "service_role";

grant insert on table "public"."ubicaciones" to "service_role";

grant references on table "public"."ubicaciones" to "service_role";

grant select on table "public"."ubicaciones" to "service_role";

grant trigger on table "public"."ubicaciones" to "service_role";

grant truncate on table "public"."ubicaciones" to "service_role";

grant update on table "public"."ubicaciones" to "service_role";

grant delete on table "public"."user_invites" to "anon";

grant insert on table "public"."user_invites" to "anon";

grant references on table "public"."user_invites" to "anon";

grant select on table "public"."user_invites" to "anon";

grant trigger on table "public"."user_invites" to "anon";

grant truncate on table "public"."user_invites" to "anon";

grant update on table "public"."user_invites" to "anon";

grant delete on table "public"."user_invites" to "authenticated";

grant insert on table "public"."user_invites" to "authenticated";

grant references on table "public"."user_invites" to "authenticated";

grant select on table "public"."user_invites" to "authenticated";

grant trigger on table "public"."user_invites" to "authenticated";

grant truncate on table "public"."user_invites" to "authenticated";

grant update on table "public"."user_invites" to "authenticated";

grant delete on table "public"."user_invites" to "service_role";

grant insert on table "public"."user_invites" to "service_role";

grant references on table "public"."user_invites" to "service_role";

grant select on table "public"."user_invites" to "service_role";

grant trigger on table "public"."user_invites" to "service_role";

grant truncate on table "public"."user_invites" to "service_role";

grant update on table "public"."user_invites" to "service_role";

grant delete on table "public"."user_roles" to "anon";

grant insert on table "public"."user_roles" to "anon";

grant references on table "public"."user_roles" to "anon";

grant select on table "public"."user_roles" to "anon";

grant trigger on table "public"."user_roles" to "anon";

grant truncate on table "public"."user_roles" to "anon";

grant update on table "public"."user_roles" to "anon";

grant delete on table "public"."user_roles" to "authenticated";

grant insert on table "public"."user_roles" to "authenticated";

grant references on table "public"."user_roles" to "authenticated";

grant select on table "public"."user_roles" to "authenticated";

grant trigger on table "public"."user_roles" to "authenticated";

grant truncate on table "public"."user_roles" to "authenticated";

grant update on table "public"."user_roles" to "authenticated";

grant delete on table "public"."user_roles" to "service_role";

grant insert on table "public"."user_roles" to "service_role";

grant references on table "public"."user_roles" to "service_role";

grant select on table "public"."user_roles" to "service_role";

grant trigger on table "public"."user_roles" to "service_role";

grant truncate on table "public"."user_roles" to "service_role";

grant update on table "public"."user_roles" to "service_role";


  create policy "Enable insert for authenticated users"
  on "public"."auditoria"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable read access for authenticated users"
  on "public"."auditoria"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Enable all for authenticated users"
  on "public"."categoriasservicio"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Enable delete for authenticated users"
  on "public"."clientes"
  as permissive
  for delete
  to authenticated
using (true);



  create policy "Enable insert for authenticated users"
  on "public"."clientes"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable read access for authenticated users"
  on "public"."clientes"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Enable update for authenticated users"
  on "public"."clientes"
  as permissive
  for update
  to authenticated
using (true);



  create policy "Enable all for authenticated users"
  on "public"."componentespaquete"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Enable insert access for authenticated users"
  on "public"."configuracion_sistema"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable read access for authenticated users"
  on "public"."configuracion_sistema"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Enable update access for authenticated users"
  on "public"."configuracion_sistema"
  as permissive
  for update
  to authenticated
using (true);



  create policy "Enable delete for authenticated users"
  on "public"."cotizaciones"
  as permissive
  for delete
  to authenticated
using (true);



  create policy "Enable insert for authenticated users"
  on "public"."cotizaciones"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable read access for authenticated users"
  on "public"."cotizaciones"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Enable update for authenticated users"
  on "public"."cotizaciones"
  as permissive
  for update
  to authenticated
using (true);



  create policy "policy_delete_cuentas_bancarias"
  on "public"."cuentas_bancarias"
  as permissive
  for delete
  to authenticated
using (true);



  create policy "policy_modify_cuentas_bancarias"
  on "public"."cuentas_bancarias"
  as permissive
  for update
  to authenticated
using (true);



  create policy "policy_read_cuentas_bancarias"
  on "public"."cuentas_bancarias"
  as permissive
  for select
  to authenticated
using (true);



  create policy "policy_write_cuentas_bancarias"
  on "public"."cuentas_bancarias"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable all for authenticated users"
  on "public"."hojasdeprecios"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Enable all for authenticated users"
  on "public"."hoteles"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Enable delete for authenticated users"
  on "public"."itemscotizacion"
  as permissive
  for delete
  to authenticated
using (true);



  create policy "Enable insert for authenticated users"
  on "public"."itemscotizacion"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable read access for authenticated users"
  on "public"."itemscotizacion"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Enable update for authenticated users"
  on "public"."itemscotizacion"
  as permissive
  for update
  to authenticated
using (true);



  create policy "Enable all for authenticated users"
  on "public"."paquetes"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Admins can delete permissions"
  on "public"."permissions"
  as permissive
  for delete
  to public
using (public.is_admin());



  create policy "Admins can insert permissions"
  on "public"."permissions"
  as permissive
  for insert
  to public
with check (public.is_admin());



  create policy "Admins can update permissions"
  on "public"."permissions"
  as permissive
  for update
  to public
using (public.is_admin());



  create policy "Auth users can read permissions"
  on "public"."permissions"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Enable all for authenticated users"
  on "public"."precioshabitacion"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Enable all for authenticated users"
  on "public"."preciosservicio"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Public profiles are viewable by everyone."
  on "public"."profiles"
  as permissive
  for select
  to public
using (true);



  create policy "Users can insert their own profile."
  on "public"."profiles"
  as permissive
  for insert
  to public
with check ((( SELECT auth.uid() AS uid) = profile_id));



  create policy "Users can update own profile."
  on "public"."profiles"
  as permissive
  for update
  to public
using ((( SELECT auth.uid() AS uid) = profile_id));



  create policy "Admins can delete role_permissions"
  on "public"."role_permissions"
  as permissive
  for delete
  to public
using (public.is_admin());



  create policy "Admins can insert role_permissions"
  on "public"."role_permissions"
  as permissive
  for insert
  to public
with check (public.is_admin());



  create policy "Admins can update role_permissions"
  on "public"."role_permissions"
  as permissive
  for update
  to public
using (public.is_admin());



  create policy "Auth users can read role_permissions"
  on "public"."role_permissions"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Admins can delete roles"
  on "public"."roles"
  as permissive
  for delete
  to public
using (public.is_admin());



  create policy "Admins can insert roles"
  on "public"."roles"
  as permissive
  for insert
  to public
with check (public.is_admin());



  create policy "Admins can update roles"
  on "public"."roles"
  as permissive
  for update
  to public
using (public.is_admin());



  create policy "Auth users can read roles"
  on "public"."roles"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Enable all for authenticated users"
  on "public"."servicios"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Enable all for authenticated users"
  on "public"."tiposhabitacion"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Actualizan los usuarios autenticados"
  on "public"."ubicaciones"
  as permissive
  for update
  to authenticated
using (true);



  create policy "Eliminan usuarios autenticados"
  on "public"."ubicaciones"
  as permissive
  for delete
  to authenticated
using (true);



  create policy "Enable insert for authenticated users only"
  on "public"."ubicaciones"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Enable read access for all users authenticated"
  on "public"."ubicaciones"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Admins can manage invites"
  on "public"."user_invites"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM (public.user_roles ur
     JOIN public.roles r ON ((ur.role_id = r.id)))
  WHERE ((ur.user_id = ( SELECT auth.uid() AS uid)) AND (r.name = 'admin'::text)))));



  create policy "Admins can delete user_roles"
  on "public"."user_roles"
  as permissive
  for delete
  to public
using (public.is_admin());



  create policy "Admins can insert user_roles"
  on "public"."user_roles"
  as permissive
  for insert
  to public
with check (public.is_admin());



  create policy "Admins can update user_roles"
  on "public"."user_roles"
  as permissive
  for update
  to public
using (public.is_admin());



  create policy "Auth users can read user_roles"
  on "public"."user_roles"
  as permissive
  for select
  to authenticated
using (true);


CREATE TRIGGER trg_audit_clientes AFTER INSERT OR DELETE OR UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.fn_auditar_cambios_v2('cliente_id');

CREATE TRIGGER trg_audit_cotizaciones AFTER INSERT OR DELETE OR UPDATE ON public.cotizaciones FOR EACH ROW EXECUTE FUNCTION public.fn_auditar_cambios_v2('cotizacion_id');

CREATE TRIGGER trigger_price_sheet_default BEFORE INSERT OR UPDATE ON public.hojasdeprecios FOR EACH ROW EXECUTE FUNCTION public.handle_price_sheet_default();

CREATE TRIGGER trg_audit_hoteles AFTER INSERT OR DELETE OR UPDATE ON public.hoteles FOR EACH ROW EXECUTE FUNCTION public.fn_auditar_cambios_v2('hotel_id');

CREATE TRIGGER trg_audit_itemscotizacion AFTER INSERT OR DELETE OR UPDATE ON public.itemscotizacion FOR EACH ROW EXECUTE FUNCTION public.fn_auditar_cambios_v2('item_id');

CREATE TRIGGER trg_audit_precioshabitacion AFTER INSERT OR DELETE OR UPDATE ON public.precioshabitacion FOR EACH ROW EXECUTE FUNCTION public.fn_auditar_cambios_v2('precio_hab_id');

CREATE TRIGGER trg_audit_preciosservicio AFTER INSERT OR DELETE OR UPDATE ON public.preciosservicio FOR EACH ROW EXECUTE FUNCTION public.fn_auditar_cambios_v2('precio_id');

CREATE TRIGGER trg_sync_claims_role_perms AFTER INSERT OR DELETE OR UPDATE ON public.role_permissions FOR EACH ROW EXECUTE FUNCTION public.trg_on_role_permission_change();

CREATE TRIGGER trg_audit_servicios AFTER INSERT OR DELETE OR UPDATE ON public.servicios FOR EACH ROW EXECUTE FUNCTION public.fn_auditar_cambios_v2('servicio_id');

CREATE TRIGGER trg_audit_ubicaciones AFTER INSERT OR DELETE OR UPDATE ON public.ubicaciones FOR EACH ROW EXECUTE FUNCTION public.fn_auditar_cambios_v2('ubicacion_id');

CREATE TRIGGER trg_sync_claims_user_roles AFTER INSERT OR DELETE OR UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.trg_on_user_role_change();

CREATE TRIGGER on_auth_user_created_unified AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_unified();


  create policy "Anyone can upload an avatar."
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'avatars'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Avatar images are publicly accessible."
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'avatars'::text));



  create policy "Users can delete their own avatars."
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'avatars'::text) AND (auth.uid() = owner)));



  create policy "Users can update their own avatars."
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'avatars'::text) AND (auth.uid() = owner)));



