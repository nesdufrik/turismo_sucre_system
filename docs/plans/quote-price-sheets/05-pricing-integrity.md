# Tarea 05: Integridad Del Motor De Precios

## Objetivo

Reducir resultados ambiguos y evitar estados inválidos en hojas base y tablas de precios. Esta tarea es endurecimiento posterior al MVP.

## Dependencias

- Tareas 01–04 completadas.
- Respaldo de la base de datos.
- Auditoría previa de duplicados y solapamientos.

## Regla De Ejecución

Esta tarea debe dividirse internamente en dos entregas:

1. Auditoría y reporte de datos conflictivos.
2. Limpieza aprobada y aplicación de restricciones.

No agregar restricciones que puedan borrar o elegir datos automáticamente sin una decisión documentada para cada conflicto.

## 05-A: Auditoría

Revisar:

- Más de una hoja con `es_default = true`.
- Ausencia de hoja base.
- Filas duplicadas en `precioshabitacion` para la misma combinación `hoja_id + habitacion_id`.
- Filas con `min_pax` o `max_pax` nulos en `preciosservicio`.
- Filas con `min_pax > max_pax`.
- Rangos de pasajeros solapados para el mismo servicio y hoja.
- Periodos `valido_desde > valido_hasta`.
- Precios de un mismo servicio y hoja aplicables simultáneamente para el mismo pax y fecha.
- Registros sin hoja o sin entidad relacionada.

Guardar el resultado de la auditoría como evidencia del despliegue. Si hay conflictos, resolverlos antes de pasar a 05-B.

## 05-B: Restricciones Y Resolución Determinista

Después de limpiar los datos:

- Crear un índice único parcial que permita como máximo una hoja `es_default = true`.
- Proteger la eliminación o desactivación de la única hoja base, estableciendo otra primero.
- Evaluar `NOT NULL` para `hoja_id`, `habitacion_id`, `servicio_id`, rangos y precios donde el modelo lo permita.
- Agregar unicidad para `precioshabitacion(hoja_id, habitacion_id)` si el modelo no requiere temporadas para habitaciones.
- Definir un orden explícito en `findServicePrice` antes de usar `.limit(1)`.
- Definir una política para rangos de pasajeros y fechas solapados.
- Rechazar nuevos rangos inválidos o ambiguos mediante restricciones, trigger o validación de servicio.

Si se requiere una restricción de exclusión PostgreSQL para rangos, evaluar previamente la extensión `btree_gist`, la representación de rangos abiertos y el tratamiento de límites inclusivos. No aplicarla sin comprobar que respeta la semántica actual de fechas y pax.

## Archivos Previstos

- `supabase/migrations/<timestamp>_audit_price_sheet_integrity.sql`
- `supabase/migrations/<timestamp>_enforce_price_sheet_integrity.sql`
- `src/modules/inventory/InventoryService.ts`, si la validación se expone en el formulario.
- `src/modules/quotes/QuoteService.ts`, para orden determinista de búsqueda.

## Criterios De Aceptación

- Existe como máximo una hoja base.
- El sistema no queda sin hoja base por una operación normal.
- Una habitación no tiene dos precios indistinguibles dentro de una hoja.
- Las búsquedas de servicios no dependen del orden accidental de PostgreSQL.
- Los rangos inválidos no pueden registrarse nuevamente.
- Los conflictos históricos quedan resueltos o documentados antes de activar restricciones.

## Verificación

```bash
pnpm build
```

Ejecutar los asesores de seguridad y rendimiento de Supabase después de aplicar las migraciones. Probar creación, edición y eliminación de hojas y precios con los permisos existentes.

## Riesgos

- Las hojas actuales pueden tener duplicados legítimos según una lógica de temporadas que no esté modelada explícitamente.
- Una restricción demasiado estricta puede impedir tarifas válidas para diferentes fechas.
- Cambiar el orden de resolución puede alterar cotizaciones nuevas, aunque no debe cambiar snapshots históricos.

## Salida De La Tarea

La tarea termina cuando los conflictos existentes tienen una decisión, las restricciones no rompen datos válidos y las búsquedas ambiguas tienen una prioridad determinista.
