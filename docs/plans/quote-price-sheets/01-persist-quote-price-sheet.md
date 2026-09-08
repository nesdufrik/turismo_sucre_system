# Tarea 01: Persistir La Hoja En La Cotización

## Objetivo

Agregar una referencia propia de hoja de precios a `cotizaciones`, de modo que la cotización conserve la tarifa elegida aunque el cliente cambie posteriormente de hoja.

## Dependencias

- Ninguna.
- Requiere confirmar que exista exactamente una hoja base antes de aplicar la migración.

## Situación Actual

- `clientes.hoja_id` contiene la tarifa habitual del cliente.
- `QuoteEditor.vue` deriva `currentHojaId` desde el cliente seleccionado.
- `QuoteService.findServicePrice` y `findRoomPrice` ya hacen fallback a la hoja marcada como `es_default`.
- `cotizaciones` no tiene actualmente `hoja_id`.
- Las inserciones existentes pueden provenir del editor o de procesos externos y no necesariamente envían una hoja.

## Diseño De Base De Datos

Crear una migración con estos pasos, en este orden:

1. Agregar `cotizaciones.hoja_id` como columna nullable inicialmente.
2. Crear la clave foránea hacia `hojasdeprecios(hoja_id)` con comportamiento restrictivo al eliminar.
3. Crear un índice sobre `cotizaciones(hoja_id)`.
4. Crear un trigger `BEFORE INSERT` que resuelva la hoja en este orden:
   - `NEW.hoja_id`, si fue enviada explícitamente.
   - `clientes.hoja_id`, si la cotización tiene cliente y el cliente tiene hoja.
   - La hoja con `es_default = true`.
5. Lanzar una excepción clara si no existe una hoja base.
6. Rellenar cotizaciones existentes con la hoja del cliente y, como segundo paso, con la hoja base.
7. Revisar las filas que todavía tengan `hoja_id IS NULL`.
8. Convertir la columna a `NOT NULL` solo después de resolver todas las filas.

El trigger solo debe resolver la hoja durante la inserción. Cambiar posteriormente el cliente no debe cambiar automáticamente la hoja de una cotización.

## Compatibilidad

- Una integración externa que no envíe `hoja_id` debe seguir funcionando mediante el trigger.
- Una integración que envíe una hoja válida debe conservar esa selección.
- Una hoja inexistente debe ser rechazada por la clave foránea.
- Una cotización sin cliente debe poder crearse usando la hoja base.
- La vista `v_cotizaciones_detalles` no necesita ser modificada porque no se requiere filtrar ni mostrar por hoja en el listado.

## Archivos Previstos

- `supabase/migrations/<timestamp>_add_price_sheet_to_quotes.sql`
- `src/types/database.types.ts`, regenerado después de aplicar la migración.

## Verificación

Antes de aplicar la migración:

```sql
select hoja_id, nombre, es_default
from public.hojasdeprecios
order by es_default desc, hoja_id;

select count(*)
from public.hojasdeprecios
where es_default is true;
```

Después de aplicar el backfill:

```sql
select count(*)
from public.cotizaciones
where hoja_id is null;

select count(*)
from public.cotizaciones q
left join public.hojasdeprecios h on h.hoja_id = q.hoja_id
where h.hoja_id is null;
```

Ejecutar también:

```bash
pnpm build
```

## Criterios De Aceptación

- Cada cotización existente tiene una hoja válida.
- Una inserción sin hoja explícita recibe la hoja del cliente o la hoja base.
- Una inserción con hoja explícita conserva esa hoja.
- La ausencia de hoja base produce un error entendible y no una cotización incompleta.
- La eliminación de una hoja referenciada por una cotización no destruye la referencia histórica.
- El listado de cotizaciones continúa funcionando sin cambios en su vista.

## Riesgos

- El backfill no puede reconstruir la hoja histórica original si el cliente cambió de hoja en el pasado.
- Marcar la columna como `NOT NULL` antes de resolver inserciones externas puede romper automatizaciones.
- Una hoja base renombrada conserva el vínculo, pero su nombre visible cambia para futuras consultas.

## Salida De La Tarea

La siguiente tarea puede comenzar cuando la columna exista, las cotizaciones antiguas estén resueltas, la compatibilidad de inserción esté probada y los tipos TypeScript hayan sido regenerados.
