# Plan de Implementación: Hojas de Precios en Cotizaciones

Este plan divide la incorporación de hojas de precios seleccionables en entregas pequeñas, verificables y reversibles. No se plantea como una implementación única.

## Objetivo

Permitir que una cotización utilice una hoja de precios personalizada como capa de sobrescritura sobre la hoja base:

```text
Hoja seleccionada
        |
        | si no existe un precio aplicable
        v
Hoja base (es_default = true)
        |
        | si tampoco existe precio
        v
Precio manual o aviso de ausencia
```

El precio que finalmente se agrega a la cotización continúa guardándose como snapshot. Los cambios posteriores en las hojas de precios no deben modificar cotizaciones ya construidas.

## Decisiones De Alcance

- `hojasdeprecios.es_default` representa la hoja base global.
- Las hojas personalizadas solo necesitan contener los precios que cambian.
- La hoja efectiva se guarda en `cotizaciones.hoja_id`.
- La hoja del cliente se utiliza como sugerencia inicial, no como fuente permanente.
- Seleccionar otra hoja para una cotización no modifica `clientes.hoja_id`.
- El fallback se mantiene para servicios, habitaciones y componentes de paquetes.
- La hoja se puede cambiar mientras la cotización no tenga artículos.
- Después de agregar el primer artículo, la hoja queda bloqueada.
- No se agregará filtro por hoja en `v_cotizaciones_detalles` ni en el listado por ahora.
- No se implementará todavía una jerarquía de hojas con `parent_hoja_id`.
- No se almacenará todavía la procedencia del precio por artículo; queda en backlog.

## Entregas

| Estado | Documento | Resultado |
|---|---|---|
| Completada | [01 - Persistencia](./01-persist-quote-price-sheet.md) | Cada cotización tiene una hoja efectiva persistida |
| Completada | [02 - Selector](./02-quote-price-sheet-selector.md) | El usuario puede elegir la hoja durante la creación |
| Completada | [03 - Fallback explícito](./03-explicit-price-fallback.md) | La interfaz comunica si usa hoja seleccionada o base |
| Completada | [04 - Bloqueo](./04-lock-price-sheet-after-items.md) | No se mezclan hojas accidentalmente después de agregar artículos |
| Pendiente | [05 - Integridad](./05-pricing-integrity.md) | Se reducen resultados ambiguos y estados inválidos |
| Pendiente | [06 - Despliegue y documentación](./06-rollout-and-user-docs.md) | La funcionalidad queda lista para desplegar y documentada |

## Orden De Ejecución

1. Completar la Tarea 01 y validar migración, backfill y compatibilidad con inserciones sin `hoja_id`.
2. Completar la Tarea 02 y validar selección, persistencia y recarga de la cotización.
3. Completar la Tarea 03 y validar override, fallback y ausencia total de precio.
4. Completar la Tarea 04 y validar el bloqueo tanto en UI como en base de datos.
5. Ejecutar la Tarea 05 como endurecimiento posterior al MVP.
6. Completar la Tarea 06 antes de desplegar a producción.

Las Tareas 01–04 forman el MVP funcional. La Tarea 05 puede posponerse sin impedir el uso básico, pero sus hallazgos deben quedar registrados. La Tarea 06 es obligatoria antes del cierre.

## Convenciones De Trabajo

- Cada tarea debe implementarse en un cambio separado cuando sea posible.
- No iniciar una tarea dependiente si la anterior no cumple sus criterios de aceptación.
- Completar la verificación de cada tarea antes de comenzar la siguiente.
- No modificar archivos de usuario o automatizaciones externas que no estén dentro del alcance documentado.
- Si una migración requiere corregir datos existentes, detenerse y registrar los casos ambiguos antes de agregar restricciones.

## Verificación Global

```bash
pnpm build
```

Las migraciones deben revisarse primero en un entorno no productivo. No se debe aplicar una migración destructiva para resolver duplicados sin respaldo y sin una consulta de auditoría previa.

## Fuera De Alcance Inicial

- Filtros por hoja en el listado de cotizaciones.
- Recotización automática de artículos ya guardados.
- Historial de versiones de una hoja de precios.
- Herencia entre varias hojas personalizadas.
- Procedencia histórica completa de cada precio dentro de un paquete.
