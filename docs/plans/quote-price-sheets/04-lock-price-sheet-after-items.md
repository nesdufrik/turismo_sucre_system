# Tarea 04: Bloquear La Hoja Después Del Primer Artículo

## Objetivo

Evitar que una cotización combine accidentalmente artículos nuevos calculados con una hoja distinta a la utilizada para los artículos anteriores.

## Dependencias

- [Tarea 01](./01-persist-quote-price-sheet.md).
- [Tarea 02](./02-quote-price-sheet-selector.md).
- [Tarea 03](./03-explicit-price-fallback.md) recomendada, aunque el bloqueo no depende del contrato visual de precios.

## Regla Funcional

- Sin artículos: el usuario puede cambiar la hoja.
- Con uno o más artículos: la hoja queda bloqueada.
- Si se eliminan todos los artículos: el cambio vuelve a estar permitido.
- Cambiar la hoja nunca recalcula ni modifica snapshots existentes.
- El bloqueo debe existir en UI y en base de datos.

## Implementación En Frontend

### Comunicación De Cantidad

Agregar un evento desde `QuoteItemsList.vue` hacia `QuoteEditor.vue`:

```ts
(e: 'items-count', count: number): void
```

Emitirlo después de:

- Cargar los artículos.
- Agregar un artículo.
- Editar un artículo.
- Eliminar un artículo.

En `QuoteEditor.vue` mantener:

- `itemsLoaded`, inicialmente falso para cotizaciones existentes.
- `itemsCount`, inicialmente cero.
- `priceSheetLocked = quoteId && (!itemsLoaded || itemsCount > 0)`.

Mientras los artículos de una cotización existente no hayan cargado, el selector debe permanecer bloqueado para evitar una edición durante una condición de carrera visual.

Mostrar junto al campo bloqueado:

`La hoja no puede cambiarse mientras la cotización tenga artículos.`

Al eliminar el último artículo, actualizar el estado y volver a habilitar el campo.

## Protección En Base De Datos

Crear una migración con un trigger `BEFORE UPDATE ON public.cotizaciones`:

- Si `NEW.hoja_id` y `OLD.hoja_id` son iguales, permitir.
- Si no cambian, permitir cualquier otra actualización normal.
- Si cambian y existe al menos un registro en `itemscotizacion` para la cotización, lanzar una excepción controlada.
- Si cambian y no existen artículos, permitir.

El mensaje de error debe explicar que primero deben eliminarse los artículos o usarse una nueva cotización. La aplicación debe mostrarlo sin reemplazarlo por un mensaje genérico.

## Archivos Previstos

- `supabase/migrations/<timestamp>_lock_quote_price_sheet.sql`
- `src/modules/quotes/components/QuoteEditor.vue`
- `src/modules/quotes/components/QuoteItemsList.vue`
- `src/modules/quotes/QuoteService.ts`, solo si se requiere una consulta de cantidad o un mensaje de error normalizado.

## Criterios De Aceptación

- Una cotización vacía permite cambiar de hoja.
- Una cotización con un artículo deshabilita el selector.
- El selector continúa deshabilitado mientras se cargan artículos existentes.
- Eliminar el último artículo vuelve a habilitarlo.
- Un `UPDATE` directo contra Supabase no puede cambiar la hoja si hay artículos.
- La eliminación de artículos no altera los snapshots que ya existían.
- No se ejecuta una recotización automática.

## Verificación

```bash
pnpm build
```

Revisión funcional:

1. Crear una cotización y cambiar varias veces la hoja antes de agregar artículos.
2. Agregar un servicio y comprobar el bloqueo.
3. Intentar cambiar la hoja desde la interfaz.
4. Intentar cambiarla con una actualización directa autorizada.
5. Eliminar el artículo y comprobar que el cambio vuelve a estar disponible.
6. Confirmar que un usuario sin permiso de edición no puede alterar la hoja.

## Riesgos

- La UI puede quedar habilitada brevemente si no espera la carga de artículos.
- Un trigger basado solo en una consulta de existencia puede requerir revisión adicional si se detectan actualizaciones concurrentes.
- Permitir desbloqueo después de eliminar todos los artículos es correcto para snapshots vacíos, pero debe comunicarse al usuario.

## Salida De La Tarea

El MVP queda funcional cuando la hoja se persiste, se resuelven overrides/fallbacks y el bloqueo funciona tanto desde la interfaz como desde la base de datos.
