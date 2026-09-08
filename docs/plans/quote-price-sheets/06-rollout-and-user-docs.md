# Tarea 06: Despliegue Y Documentación

## Objetivo

Preparar el despliegue y documentar el comportamiento operativo de las hojas personalizadas para agentes y operaciones.

## Dependencias

- Tareas 01–04 para el MVP.
- Tarea 05 si sus restricciones se incluyen en el mismo despliegue.

## Verificación De Entrega

Ejecutar la validación de compilación antes del despliegue:

```bash
pnpm build
```

Revisar también:

- Tipos generados de Supabase.
- Políticas RLS para `cotizaciones`, `hojasdeprecios` y tablas de precios.
- Roles `agent`, `operations` y `admin`.
- Inserciones de cotizaciones procedentes de la aplicación.
- Inserciones externas o de servicio que no envíen `hoja_id`.
- Realtime y notificaciones de cotizaciones, sin cambios de contrato en el listado.

## Despliegue

1. Crear respaldo y registrar el resultado de la auditoría de datos.
2. Aplicar la migración de persistencia.
3. Regenerar tipos TypeScript.
4. Desplegar el frontend que conoce `hoja_id`.
5. Aplicar el bloqueo y, si corresponde, las restricciones de integridad.
6. Confirmar el acceso y los permisos con un usuario de cada rol.
7. Monitorear errores de inserción, fallback y permisos.

No aplicar migraciones destructivas en producción sin respaldo. El rollback de una columna con referencias históricas debe planificarse como migración separada; no se debe eliminar `hoja_id` automáticamente ante un fallo del frontend.

## Documentación De Usuario

Actualizar `docs/user-guide.md` para explicar:

- Que una hoja personalizada contiene solo cambios de precio.
- Que la hoja base completa automáticamente los servicios no sobrescritos.
- Que la hoja del cliente es una sugerencia inicial.
- Que seleccionar una hoja para una cotización no modifica al cliente.
- Que el origen del precio puede ser la hoja seleccionada o la base.
- Que la hoja queda bloqueada después de agregar artículos.
- Qué significa `Sin precio en hoja seleccionada ni base`.

Actualizar `README.md` para describir el modelo de overlays y no solo la asignación de tarifas por cliente.

## Criterios De Aceptación

- `pnpm build` termina correctamente.
- La migración fue revisada en un entorno no productivo.
- Los roles autorizados pueden usar la funcionalidad.
- Los usuarios sin permiso no pueden cambiar la hoja ni modificar precios protegidos.
- La guía de usuario refleja el fallback y el bloqueo.
- No se agregaron filtros por hoja al listado.

## Salida De La Tarea

La funcionalidad puede considerarse lista para producción cuando el MVP esté integrado, los riesgos abiertos estén registrados y la documentación operativa esté actualizada.
