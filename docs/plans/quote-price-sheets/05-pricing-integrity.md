# Tarea 05: Integridad Del Motor De Precios

## Objetivo

Reducir resultados ambiguos y evitar estados inválidos en hojas base y tablas de precios. Esta tarea es endurecimiento posterior al MVP.

## Dependencias

- Tareas 01–04 completadas.
- Respaldo de la base de datos.
- Auditoría previa de duplicados y solapamientos.

## Resultado De Auditoría

Auditoría ejecutada el 8 de septiembre de 2026 sobre la base conectada:

- Existe una sola hoja base: `TARIFARIO TURISMO SUCRE` (`hoja_id = 2`).
- No existen hojas de precios duplicadas como base.
- `preciosservicio` no tiene nulos en hoja, servicio, rango pax o precio.
- `preciosservicio` no tiene rangos pax invertidos ni fechas inválidas.
- `precioshabitacion` no tiene nulos, precios negativos ni habitaciones duplicadas por hoja.
- Existen siete pares de precios de servicios que se solapan:
  - `Transfer Aeropuerto de Alcantari`, precios `43/608`, rango `11–15`, importes distintos.
  - `Transfer Aeropuerto de Alcantari`, precios `44/45`, rangos `16–24` y `24–100`; el pax 24 coincide por los límites inclusivos actuales.
  - `Tarabuco FD + Almuerzo`, precios `138/643`, rango `4–5`, importes distintos.
  - `Transfer In o Out Terminal La Paz sin guia`, precios `770/771`, rango `11–15`, mismo importe.
  - `Cena en Hotel` de la hoja `Claudia Rivera Fremen`, precio `822` (`4–21`) junto a `847` (`6–10`), `848` (`11–15`) y `849` (`16–21`).

Los registros anteriores no se eliminan ni fusionan automáticamente porque algunos pueden representar correcciones comerciales y otros pueden ser redundancias con el mismo importe. La búsqueda ahora tiene orden determinista y los nuevos solapamientos quedan bloqueados.

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

La migración aplicada en esta entrega implementa el endurecimiento compatible con los datos actuales:

- Índice único para impedir más de una hoja base.
- Trigger que impide eliminar o desactivar la única hoja base.
- Columnas obligatorias y checks de rangos/precios válidos.
- Unicidad `hoja_id + habitacion_id` para precios de habitaciones.
- Índice compuesto `hoja_id + servicio_id`.
- Trigger que rechaza nuevos rangos solapados y cambios de rango que creen solapamientos.
- Orden determinista en la búsqueda de precios de servicios.

La exclusion constraint PostgreSQL para todo el histórico queda diferida hasta decidir cómo resolver los siete pares identificados.

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

La tarea termina cuando los conflictos existentes están documentados, las restricciones aplicadas no rompen datos válidos y las búsquedas ambiguas tienen una prioridad determinista. La resolución comercial de los siete pares queda como seguimiento explícito.
