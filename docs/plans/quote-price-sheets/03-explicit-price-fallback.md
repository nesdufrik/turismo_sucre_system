# Tarea 03: Fallback Explícito Y Origen Visible

## Objetivo

Mantener el modelo de hojas como overlays y hacer visible si un precio proviene de la hoja seleccionada, de la hoja base o de ninguna hoja.

## Dependencias

- [Tarea 02](./02-quote-price-sheet-selector.md) completada.

## Regla De Resolución

Para servicios y habitaciones, el orden debe ser:

1. Buscar una coincidencia aplicable en `hoja_id` de la cotización.
2. Si no existe, buscar la misma coincidencia en la hoja `es_default = true`.
3. Si tampoco existe, devolver ausencia de precio.

La coincidencia debe respetar las reglas actuales de rango de pasajeros, fecha de vigencia y entidad consultada. La hoja base no debe reemplazar un precio explícitamente encontrado en la hoja seleccionada.

## Contrato Recomendado

Cambiar las funciones de búsqueda para devolver un resultado tipado en lugar del registro aislado:

```ts
interface ResolvedPrice<T> {
  record: T | null
  requestedSheetId: number
  appliedSheetId: number | null
  usedFallback: boolean
}
```

Reglas del resultado:

- Precio encontrado en la hoja seleccionada: `usedFallback = false` y `appliedSheetId = requestedSheetId`.
- Precio encontrado en la hoja base: `usedFallback = true` y `appliedSheetId = defaultSheetId`.
- Precio no encontrado: `record = null` y `appliedSheetId = null`.
- Si la hoja solicitada ya es la base, nunca se marca fallback.

Aplicar el contrato a:

- `QuoteService.findServicePrice`.
- `QuoteService.findRoomPrice`.
- El cálculo de componentes en `PackageSelector.vue`.

## Cambios En Selectores

### Servicios

- Guardar el resultado completo de resolución.
- Mostrar `Precio de la hoja seleccionada` cuando `usedFallback` sea falso.
- Mostrar `Precio heredado de la hoja base` cuando `usedFallback` sea verdadero.
- Mostrar `Sin precio en hoja seleccionada ni base` cuando no exista `record`.

### Hoteles

- Aplicar la misma indicación al precio por noche.
- Mantener el prorrateo actual sin alterar su fórmula.

### Paquetes

- Resolver cada componente independientemente.
- Indicar en el detalle de cálculo si el componente proviene de la hoja seleccionada o de la base.
- Si algunos componentes usan override y otros fallback, conservar ambos resultados.
- Si ningún componente tiene precio, mantener la posibilidad de ajuste manual según el comportamiento actual.

## Precio Manual

El precio manual continúa teniendo prioridad en el selector después de la sugerencia automática. La interfaz debe distinguir:

- Precio calculado desde hoja seleccionada.
- Precio calculado desde hoja base.
- Precio manual/override.
- Sin precio disponible.

No se debe guardar automáticamente un nuevo precio en ninguna hoja cuando el usuario use un precio manual dentro de una cotización.

## Archivos Previstos

- `src/modules/quotes/QuoteService.ts`
- `src/modules/quotes/components/selectors/ServiceSelector.vue`
- `src/modules/quotes/components/selectors/HotelSelector.vue`
- `src/modules/quotes/components/selectors/PackageSelector.vue`

## Criterios De Aceptación

- Un precio existente en la hoja seleccionada tiene prioridad.
- La ausencia de override utiliza la hoja base.
- La ausencia en ambas hojas se muestra claramente.
- Un paquete puede tener componentes resueltos desde hojas distintas.
- El precio manual no modifica hojas de precios.
- El precio final agregado continúa guardándose en `precio_unitario_snapshot`.
- Los totales no cambian salvo por la fuente correcta del precio.

## Verificación

```bash
pnpm build
```

Revisión funcional adicional: crear una hoja que modifique solo un servicio, generar una cotización con esa hoja y agregar un servicio modificado, uno no modificado y un hotel sin precio en la hoja personalizada.

## Riesgos

- Cambiar el tipo de retorno puede romper consumidores no detectados; buscar todos los usos antes de editar.
- El fallback actual consulta la hoja base por cada búsqueda; si el flujo muestra problemas de rendimiento, optimizar después de validar el comportamiento.
- Un `.limit(1)` sin orden determinista puede devolver un rango ambiguo; el endurecimiento correspondiente se trata en la Tarea 05.

## Salida De La Tarea

La Tarea 04 puede comenzar cuando el usuario vea el origen lógico del precio y se haya confirmado el comportamiento de override, fallback y ausencia total.
