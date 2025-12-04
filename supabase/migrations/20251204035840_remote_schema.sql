


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."fn_auditar_cambios"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
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
end;$$;


ALTER FUNCTION "public"."fn_auditar_cambios"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  insert into public.profiles (profile_id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."auditoria" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "tabla_nombre" "text" NOT NULL,
    "registro_id" bigint NOT NULL,
    "accion" "text" NOT NULL,
    "valores_anteriores" "jsonb",
    "valores_nuevos" "jsonb",
    "usuario_id" "uuid",
    "ip_address" "inet",
    "user_agent" "text",
    "timestamp" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "auditoria_accion_check" CHECK (("accion" = ANY (ARRAY['INSERT'::"text", 'UPDATE'::"text", 'DELETE'::"text"])))
);


ALTER TABLE "public"."auditoria" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categoriasservicio" (
    "categoria_id" bigint NOT NULL,
    "nombre" "text"
);


ALTER TABLE "public"."categoriasservicio" OWNER TO "postgres";


ALTER TABLE "public"."categoriasservicio" ALTER COLUMN "categoria_id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."categoriasservicio_categoria_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."clientes" (
    "cliente_id" bigint NOT NULL,
    "nombre_completo" "text",
    "email" "text",
    "telefono" "text",
    "empresa" "text",
    "fecha_creacion" timestamp without time zone DEFAULT "now"(),
    "hoja_id" bigint
);


ALTER TABLE "public"."clientes" OWNER TO "postgres";


ALTER TABLE "public"."clientes" ALTER COLUMN "cliente_id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."clientes_cliente_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."componentespaquete" (
    "paquete_id" bigint,
    "servicio_id" bigint,
    "cantidad" integer
);


ALTER TABLE "public"."componentespaquete" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cotizaciones" (
    "cotizacion_id" bigint NOT NULL,
    "cliente_id" bigint,
    "fecha_creacion" timestamp without time zone DEFAULT "now"(),
    "fecha_validez_hasta" "date",
    "estado" "text",
    "total_general" numeric(10,2),
    "moneda" "text",
    "fuente_solicitud" "text",
    "notas_para_cliente" "text",
    "notas_internas_agencia" "text"
);


ALTER TABLE "public"."cotizaciones" OWNER TO "postgres";


ALTER TABLE "public"."cotizaciones" ALTER COLUMN "cotizacion_id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."cotizaciones_cotizacion_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."hojasdeprecios" (
    "hoja_id" bigint NOT NULL,
    "nombre" "text",
    "es_default" boolean
);


ALTER TABLE "public"."hojasdeprecios" OWNER TO "postgres";


ALTER TABLE "public"."hojasdeprecios" ALTER COLUMN "hoja_id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."hojasdeprecios_hoja_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."hoteles" (
    "hotel_id" bigint NOT NULL,
    "nombre" "text",
    "categoria" "text",
    "ubicacion_id" bigint,
    "info_desayuno" "text",
    "incluye_impuestos" boolean
);


ALTER TABLE "public"."hoteles" OWNER TO "postgres";


ALTER TABLE "public"."hoteles" ALTER COLUMN "hotel_id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."hoteles_hotel_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."itemscotizacion" (
    "item_id" bigint NOT NULL,
    "cotizacion_id" bigint,
    "servicio_id" bigint,
    "habitacion_id" bigint,
    "paquete_id" bigint,
    "descripcion_snapshot" "text",
    "fecha_servicio_inicio" "date",
    "fecha_servicio_fin" "date",
    "cantidad" integer,
    "numero_pax" integer,
    "precio_unitario_snapshot" numeric(10,2),
    "subtotal_item" numeric(10,2)
);


ALTER TABLE "public"."itemscotizacion" OWNER TO "postgres";


ALTER TABLE "public"."itemscotizacion" ALTER COLUMN "item_id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."itemscotizacion_item_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."paquetes" (
    "paquete_id" bigint NOT NULL,
    "nombre_paquete" "text",
    "descripcion" "text"
);


ALTER TABLE "public"."paquetes" OWNER TO "postgres";


ALTER TABLE "public"."paquetes" ALTER COLUMN "paquete_id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."paquetes_paquete_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."precioshabitacion" (
    "precio_hab_id" bigint NOT NULL,
    "hoja_id" bigint,
    "habitacion_id" bigint,
    "precio_por_noche" numeric,
    "temporada" "text"
);


ALTER TABLE "public"."precioshabitacion" OWNER TO "postgres";


ALTER TABLE "public"."precioshabitacion" ALTER COLUMN "precio_hab_id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."precioshabitacion_precio_hab_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."preciosservicio" (
    "precio_id" bigint NOT NULL,
    "servicio_id" bigint,
    "min_pax" integer,
    "max_pax" integer,
    "precio_por_persona" numeric,
    "temporada" "text",
    "valido_desde" "date",
    "valido_hasta" "date",
    "hoja_id" bigint
);


ALTER TABLE "public"."preciosservicio" OWNER TO "postgres";


ALTER TABLE "public"."preciosservicio" ALTER COLUMN "precio_id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."preciosservicio_precio_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "profile_id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone,
    "username" "text",
    "full_name" "text",
    "avatar_url" "text",
    "website" "text",
    CONSTRAINT "username_length" CHECK (("char_length"("username") >= 3))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."servicios" (
    "servicio_id" bigint NOT NULL,
    "nombre" "text",
    "codigo" "text",
    "descripcion" "text",
    "duracion_texto" "text",
    "ubicacion_id" bigint,
    "categoria_id" bigint
);


ALTER TABLE "public"."servicios" OWNER TO "postgres";


ALTER TABLE "public"."servicios" ALTER COLUMN "servicio_id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."servicios_servicio_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."tiposhabitacion" (
    "habitacion_id" bigint NOT NULL,
    "hotel_id" bigint,
    "tipo" "text",
    "precio_por_noche" numeric,
    "capacidad_personas" integer
);


ALTER TABLE "public"."tiposhabitacion" OWNER TO "postgres";


ALTER TABLE "public"."tiposhabitacion" ALTER COLUMN "habitacion_id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."tiposhabitacion_habitacion_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."ubicaciones" (
    "ubicacion_id" bigint NOT NULL,
    "ciudad" "text"
);


ALTER TABLE "public"."ubicaciones" OWNER TO "postgres";


ALTER TABLE "public"."ubicaciones" ALTER COLUMN "ubicacion_id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."ubicaciones_ubicacion_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."auditoria"
    ADD CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categoriasservicio"
    ADD CONSTRAINT "categoriasservicio_pkey" PRIMARY KEY ("categoria_id");



ALTER TABLE ONLY "public"."clientes"
    ADD CONSTRAINT "clientes_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."clientes"
    ADD CONSTRAINT "clientes_pkey" PRIMARY KEY ("cliente_id");



ALTER TABLE ONLY "public"."cotizaciones"
    ADD CONSTRAINT "cotizaciones_pkey" PRIMARY KEY ("cotizacion_id");



ALTER TABLE ONLY "public"."hojasdeprecios"
    ADD CONSTRAINT "hojasdeprecios_pkey" PRIMARY KEY ("hoja_id");



ALTER TABLE ONLY "public"."hoteles"
    ADD CONSTRAINT "hoteles_pkey" PRIMARY KEY ("hotel_id");



ALTER TABLE ONLY "public"."itemscotizacion"
    ADD CONSTRAINT "itemscotizacion_pkey" PRIMARY KEY ("item_id");



ALTER TABLE ONLY "public"."paquetes"
    ADD CONSTRAINT "paquetes_pkey" PRIMARY KEY ("paquete_id");



ALTER TABLE ONLY "public"."precioshabitacion"
    ADD CONSTRAINT "precioshabitacion_pkey" PRIMARY KEY ("precio_hab_id");



ALTER TABLE ONLY "public"."preciosservicio"
    ADD CONSTRAINT "preciosservicio_pkey" PRIMARY KEY ("precio_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("profile_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."servicios"
    ADD CONSTRAINT "servicios_pkey" PRIMARY KEY ("servicio_id");



ALTER TABLE ONLY "public"."tiposhabitacion"
    ADD CONSTRAINT "tiposhabitacion_pkey" PRIMARY KEY ("habitacion_id");



ALTER TABLE ONLY "public"."ubicaciones"
    ADD CONSTRAINT "ubicaciones_pkey" PRIMARY KEY ("ubicacion_id");



CREATE OR REPLACE TRIGGER "trg_auditoria_ubicaciones" AFTER INSERT OR DELETE OR UPDATE ON "public"."ubicaciones" FOR EACH ROW EXECUTE FUNCTION "public"."fn_auditar_cambios"();



ALTER TABLE ONLY "public"."auditoria"
    ADD CONSTRAINT "auditoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."profiles"("profile_id");



ALTER TABLE ONLY "public"."clientes"
    ADD CONSTRAINT "clientes_hoja_id_fkey" FOREIGN KEY ("hoja_id") REFERENCES "public"."hojasdeprecios"("hoja_id");



ALTER TABLE ONLY "public"."componentespaquete"
    ADD CONSTRAINT "componentespaquete_paquete_id_fkey" FOREIGN KEY ("paquete_id") REFERENCES "public"."paquetes"("paquete_id");



ALTER TABLE ONLY "public"."componentespaquete"
    ADD CONSTRAINT "componentespaquete_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "public"."servicios"("servicio_id");



ALTER TABLE ONLY "public"."cotizaciones"
    ADD CONSTRAINT "cotizaciones_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("cliente_id");



ALTER TABLE ONLY "public"."hoteles"
    ADD CONSTRAINT "hoteles_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "public"."ubicaciones"("ubicacion_id");



ALTER TABLE ONLY "public"."itemscotizacion"
    ADD CONSTRAINT "itemscotizacion_cotizacion_id_fkey" FOREIGN KEY ("cotizacion_id") REFERENCES "public"."cotizaciones"("cotizacion_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."itemscotizacion"
    ADD CONSTRAINT "itemscotizacion_habitacion_id_fkey" FOREIGN KEY ("habitacion_id") REFERENCES "public"."tiposhabitacion"("habitacion_id");



ALTER TABLE ONLY "public"."itemscotizacion"
    ADD CONSTRAINT "itemscotizacion_paquete_id_fkey" FOREIGN KEY ("paquete_id") REFERENCES "public"."paquetes"("paquete_id");



ALTER TABLE ONLY "public"."itemscotizacion"
    ADD CONSTRAINT "itemscotizacion_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "public"."servicios"("servicio_id");



ALTER TABLE ONLY "public"."precioshabitacion"
    ADD CONSTRAINT "precioshabitacion_habitacion_id_fkey" FOREIGN KEY ("habitacion_id") REFERENCES "public"."tiposhabitacion"("habitacion_id");



ALTER TABLE ONLY "public"."precioshabitacion"
    ADD CONSTRAINT "precioshabitacion_hoja_id_fkey" FOREIGN KEY ("hoja_id") REFERENCES "public"."hojasdeprecios"("hoja_id");



ALTER TABLE ONLY "public"."preciosservicio"
    ADD CONSTRAINT "preciosservicio_hoja_id_fkey" FOREIGN KEY ("hoja_id") REFERENCES "public"."hojasdeprecios"("hoja_id");



ALTER TABLE ONLY "public"."preciosservicio"
    ADD CONSTRAINT "preciosservicio_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "public"."servicios"("servicio_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."servicios"
    ADD CONSTRAINT "servicios_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "public"."categoriasservicio"("categoria_id");



ALTER TABLE ONLY "public"."servicios"
    ADD CONSTRAINT "servicios_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "public"."ubicaciones"("ubicacion_id");



ALTER TABLE ONLY "public"."tiposhabitacion"
    ADD CONSTRAINT "tiposhabitacion_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "public"."hoteles"("hotel_id");



CREATE POLICY "Actualizan los usuarios autenticados" ON "public"."ubicaciones" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Eliminan usuarios autenticados" ON "public"."ubicaciones" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."ubicaciones" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable read access for all users authenticated" ON "public"."ubicaciones" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Public profiles are viewable by everyone." ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Users can insert their own profile." ON "public"."profiles" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "profile_id"));



CREATE POLICY "Users can update own profile." ON "public"."profiles" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "profile_id"));



ALTER TABLE "public"."auditoria" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."categoriasservicio" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clientes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."componentespaquete" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cotizaciones" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hojasdeprecios" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hoteles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."itemscotizacion" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."paquetes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."precioshabitacion" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."preciosservicio" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."servicios" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tiposhabitacion" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ubicaciones" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."fn_auditar_cambios"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_auditar_cambios"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_auditar_cambios"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";


















GRANT ALL ON TABLE "public"."auditoria" TO "anon";
GRANT ALL ON TABLE "public"."auditoria" TO "authenticated";
GRANT ALL ON TABLE "public"."auditoria" TO "service_role";



GRANT ALL ON TABLE "public"."categoriasservicio" TO "anon";
GRANT ALL ON TABLE "public"."categoriasservicio" TO "authenticated";
GRANT ALL ON TABLE "public"."categoriasservicio" TO "service_role";



GRANT ALL ON SEQUENCE "public"."categoriasservicio_categoria_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."categoriasservicio_categoria_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."categoriasservicio_categoria_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."clientes" TO "anon";
GRANT ALL ON TABLE "public"."clientes" TO "authenticated";
GRANT ALL ON TABLE "public"."clientes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."clientes_cliente_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."clientes_cliente_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."clientes_cliente_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."componentespaquete" TO "anon";
GRANT ALL ON TABLE "public"."componentespaquete" TO "authenticated";
GRANT ALL ON TABLE "public"."componentespaquete" TO "service_role";



GRANT ALL ON TABLE "public"."cotizaciones" TO "anon";
GRANT ALL ON TABLE "public"."cotizaciones" TO "authenticated";
GRANT ALL ON TABLE "public"."cotizaciones" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cotizaciones_cotizacion_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cotizaciones_cotizacion_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cotizaciones_cotizacion_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."hojasdeprecios" TO "anon";
GRANT ALL ON TABLE "public"."hojasdeprecios" TO "authenticated";
GRANT ALL ON TABLE "public"."hojasdeprecios" TO "service_role";



GRANT ALL ON SEQUENCE "public"."hojasdeprecios_hoja_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."hojasdeprecios_hoja_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."hojasdeprecios_hoja_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."hoteles" TO "anon";
GRANT ALL ON TABLE "public"."hoteles" TO "authenticated";
GRANT ALL ON TABLE "public"."hoteles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."hoteles_hotel_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."hoteles_hotel_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."hoteles_hotel_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."itemscotizacion" TO "anon";
GRANT ALL ON TABLE "public"."itemscotizacion" TO "authenticated";
GRANT ALL ON TABLE "public"."itemscotizacion" TO "service_role";



GRANT ALL ON SEQUENCE "public"."itemscotizacion_item_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."itemscotizacion_item_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."itemscotizacion_item_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."paquetes" TO "anon";
GRANT ALL ON TABLE "public"."paquetes" TO "authenticated";
GRANT ALL ON TABLE "public"."paquetes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."paquetes_paquete_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."paquetes_paquete_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."paquetes_paquete_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."precioshabitacion" TO "anon";
GRANT ALL ON TABLE "public"."precioshabitacion" TO "authenticated";
GRANT ALL ON TABLE "public"."precioshabitacion" TO "service_role";



GRANT ALL ON SEQUENCE "public"."precioshabitacion_precio_hab_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."precioshabitacion_precio_hab_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."precioshabitacion_precio_hab_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."preciosservicio" TO "anon";
GRANT ALL ON TABLE "public"."preciosservicio" TO "authenticated";
GRANT ALL ON TABLE "public"."preciosservicio" TO "service_role";



GRANT ALL ON SEQUENCE "public"."preciosservicio_precio_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."preciosservicio_precio_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."preciosservicio_precio_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."servicios" TO "anon";
GRANT ALL ON TABLE "public"."servicios" TO "authenticated";
GRANT ALL ON TABLE "public"."servicios" TO "service_role";



GRANT ALL ON SEQUENCE "public"."servicios_servicio_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."servicios_servicio_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."servicios_servicio_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."tiposhabitacion" TO "anon";
GRANT ALL ON TABLE "public"."tiposhabitacion" TO "authenticated";
GRANT ALL ON TABLE "public"."tiposhabitacion" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tiposhabitacion_habitacion_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tiposhabitacion_habitacion_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tiposhabitacion_habitacion_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."ubicaciones" TO "anon";
GRANT ALL ON TABLE "public"."ubicaciones" TO "authenticated";
GRANT ALL ON TABLE "public"."ubicaciones" TO "service_role";



GRANT ALL ON SEQUENCE "public"."ubicaciones_ubicacion_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."ubicaciones_ubicacion_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."ubicaciones_ubicacion_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "Anyone can upload an avatar."
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((bucket_id = 'avatars'::text));



  create policy "Avatar images are publicly accessible."
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'avatars'::text));



