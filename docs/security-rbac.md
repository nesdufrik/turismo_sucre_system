# Sistema de Seguridad y RBAC (Role-Based Access Control)

Este documento describe la arquitectura de seguridad implementada en el Sistema de Gestión Turística "Turismo Sucre", basada en **Defensa en Profundidad**.

## 1. Arquitectura General

El sistema utiliza un modelo de permisos granulares inyectados directamente en el **JWT (JSON Web Token)** de Supabase. La seguridad se aplica en dos capas:

1.  **Capa de Base de Datos (RLS)**: El "candado" final. Ninguna operación SQL se ejecuta si el token del usuario no contiene el permiso requerido.
2.  **Capa de Interfaz (Frontend)**: La "experiencia de usuario". Oculta botones, vistas y datos sensibles para evitar errores de acceso y proteger el secreto comercial.

---

## 2. Capa de Base de Datos (PostgreSQL)

### Función `check_permission`
Se implementó una función centralizada en el esquema `public` que lee los permisos del usuario directamente desde los claims de Supabase Auth:

```sql
SELECT check_permission('quotes.delete'); -- Devuelve true o false
```

### Políticas RLS
Todas las tablas críticas tienen activado **Row Level Security**. Las políticas se definen siguiendo este patrón:

```sql
CREATE POLICY "quotes_delete_policy" 
ON public.cotizaciones 
FOR DELETE 
TO authenticated 
USING (
  check_permission('quotes.delete') OR (creado_por = auth.uid())
);
```

---

## 3. Capa de Aplicación (Vue 3)

### Sincronización de Permisos
El `authStore` (Pinia) extrae automáticamente los permisos del usuario cuando se inicia sesión:
- **Fuente de verdad**: `user.app_metadata.authorization.permissions`.
- **Sincronización**: Al ser parte del JWT, si los permisos cambian en el backend, el usuario debe refrescar su sesión para obtener la nueva "llave".

### Uso en Componentes (UI)
Se dispone del componente global `<HasPermission>` para proteger fragmentos de la interfaz:

```vue
<!-- Ocultar botón -->
<HasPermission name="inventory.manage">
  <Button>Nuevo Servicio</Button>
</HasPermission>

<!-- Mostrar contenido alternativo (fallback) -->
<HasPermission name="prices.view_cost">
  <span>$ 100.00</span>
  <template #no-access>***</template>
</HasPermission>
```

---

## 4. Guía: Cómo añadir un nuevo Permiso

Si necesitas añadir una nueva funcionalidad (ej: `vehiculos.manage`):

### Paso 1: Base de Datos
1.  Inserta el nuevo código en la tabla `public.permissions`.
2.  Crea una nueva migración en `supabase/migrations/` para aplicar el RLS a la tabla correspondiente:
    ```sql
    CREATE POLICY "vehiculos_manage_policy" ON public.vehiculos 
    FOR ALL TO authenticated USING (check_permission('vehiculos.manage'));
    ```

### Paso 2: Supabase Auth
Asigna el nuevo permiso al Rol correspondiente a través de la interfaz de administración de roles (o mediante SQL en la tabla `role_permissions`). El sistema de triggers de Supabase debe actualizar los `app_metadata` de los usuarios afectados.

### Paso 3: Frontend
Utiliza el permiso en el código:
```typescript
const { can } = usePermission();
if (can('vehiculos.manage')) { ... }
```

---

## 5. Roles del Sistema

| Rol | Propósito | Permisos Clave |
| :--- | :--- | :--- |
| **admin** | Gestión total | Todos los permisos (`users.manage`, `audit.view`, etc.) |
| **operations** | Gestión operativa | `inventory.manage`, `quotes.approve`, `prices.view_cost` |
| **agent** | Ventas y creación | `quotes.create`, `quotes.view`, `quotes.edit` (propias) |

## 6. Mantenimiento de Migraciones

Cada cambio en la estructura de seguridad **DEBE** ir acompañado de un archivo de migración en `supabase/migrations/`. 
Formato recomendado: `YYYYMMDDHHMMSS_descripcion_breve.sql`.

---
*Documentación generada el 15 de enero de 2026.*
