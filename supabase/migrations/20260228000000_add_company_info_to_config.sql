-- Migration: Add company info to configuracion_sistema and create storage bucket

-- Agregar columnas a la tabla configuracion_sistema
ALTER TABLE public.configuracion_sistema
ADD COLUMN empresa_nombre text,
ADD COLUMN empresa_descripcion text,
ADD COLUMN empresa_direccion text,
ADD COLUMN empresa_telefonos text,
ADD COLUMN empresa_fax text,
ADD COLUMN empresa_celular text,
ADD COLUMN empresa_correo text,
ADD COLUMN empresa_ciudad text,
ADD COLUMN empresa_pais text,
ADD COLUMN empresa_logo_url text;

-- Insertar un bucket llamado 'company_assets' para los logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('company_assets', 'company_assets', true)
ON CONFLICT (id) DO NOTHING;

-- Crear políticas de seguridad para el bucket 'company_assets'
-- Cualquiera puede leer (ya que es público para usar en generacion de PDF)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'company_assets' );

-- Solo administradores autenticados pueden subir/modificar los logos
CREATE POLICY "Admin Insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'company_assets' AND
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  )
);

CREATE POLICY "Admin Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'company_assets' AND
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  )
);

CREATE POLICY "Admin Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'company_assets' AND
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  )
);
