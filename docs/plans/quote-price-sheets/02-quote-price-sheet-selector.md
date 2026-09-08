# Tarea 02: Selector De Hoja En El Editor

## Objetivo

Permitir que el usuario seleccione la hoja efectiva al crear una cotización y conservar la selección al guardar, redirigir a edición y recargar la pantalla.

## Dependencias

- [Tarea 01](./01-persist-quote-price-sheet.md) completada.

## Comportamiento Funcional

1. Al crear una cotización, cargar las hojas disponibles.
2. Si el usuario selecciona un cliente con hoja asignada, proponer esa hoja.
3. Si el cliente no tiene hoja, proponer la hoja base.
4. Permitir seleccionar otra hoja sin modificar el registro del cliente.
5. Enviar `hoja_id` al crear la cotización.
6. En una cotización existente, cargar siempre `quote.hoja_id`.
7. No volver a derivar la hoja desde el cliente cuando se abre una cotización existente.
8. Mostrar la hoja base con una marca visual, pero sin ocultar las hojas personalizadas.

## Implementación Frontend

### `QuoteEditor.vue`

- Cargar `SettingsService.getPriceSheets()` junto con clientes y cuentas bancarias.
- Agregar `hoja_id` al estado inicial del formulario.
- Usar `hoja_id` como fuente de `currentHojaId` o reemplazar esa ref por un valor computado del formulario.
- Al seleccionar cliente, actualizar la hoja solo como sugerencia de creación.
- Al cargar una cotización, asignar `quote.hoja_id` explícitamente.
- Pasar el `hoja_id` persistido a `QuoteItemsList`.
- Mantener separado el objeto completo del cliente de la hoja elegida.

### `quote.schema.ts`

- Agregar `hoja_id` como número entero positivo requerido en el formulario final.
- Normalizar el valor proveniente del componente `Select` si llega como string.
- Mantener los mensajes de validación en español.

### Servicio

Reutilizar `SettingsService.getPriceSheets()` para no duplicar el acceso a `hojasdeprecios`. No agregar un segundo método equivalente en `QuoteService` salvo que una necesidad posterior lo justifique.

## Experiencia De Usuario

- Etiqueta recomendada: `Hoja de Precios para esta Cotización`.
- Texto de ayuda: `Los precios personalizados tienen prioridad; los faltantes se buscan en la hoja base.`
- La selección debe estar cerca de los datos financieros y antes de agregar artículos.
- No mostrar una opción vacía en el flujo normal; siempre debe existir una hoja efectiva.
- La deshabilitación después de agregar artículos se implementa en la Tarea 04.

## Archivos Previstos

- `src/modules/quotes/components/QuoteEditor.vue`
- `src/modules/quotes/schemas/quote.schema.ts`
- `src/modules/settings/SettingsService.ts`, solo si se requiere ajustar tipos o filtrado.

## Criterios De Aceptación

- La hoja del cliente aparece seleccionada al iniciar una cotización.
- Si el cliente no tiene hoja, aparece la hoja base.
- El usuario puede elegir una hoja personalizada.
- Cambiar la hoja no modifica `clientes.hoja_id`.
- `createQuote` recibe el `hoja_id` elegido.
- La cotización redirige a edición conservando la misma hoja.
- Recargar una cotización existente conserva `quote.hoja_id` aunque se haya modificado la hoja del cliente.
- Los selectores de servicios, hoteles y paquetes reciben la hoja almacenada.
- No se modifica el listado ni su vista.

## Verificación

```bash
pnpm build
```

Revisión funcional mínima:

1. Crear una cotización para un cliente con hoja personalizada.
2. Cambiarla a otra hoja.
3. Guardar y confirmar que la cotización conserva la segunda hoja.
4. Abrir el cliente y confirmar que su `hoja_id` no cambió.
5. Cambiar la hoja del cliente y confirmar que la cotización ya guardada no cambia.

## Riesgos

- Si el selector entrega strings y el esquema espera números, la cotización puede fallar antes de insertarse.
- Si se mantiene `currentHojaId` derivado del cliente, la selección manual se perderá al cambiar cliente o recargar.
- Si la hoja base se elimina desde configuración, el editor debe mostrar un error de datos y no inventar un valor.

## Salida De La Tarea

La Tarea 03 puede comenzar cuando una cotización pueda seleccionar y persistir una hoja diferente a la del cliente, y los tres selectores reciban el valor persistido.
