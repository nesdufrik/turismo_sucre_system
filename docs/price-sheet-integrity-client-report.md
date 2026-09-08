# Informe De Auditoría De Hojas De Precios

**Sistema:** Turismo Sucre
**Fecha de auditoría:** 8 de septiembre de 2026
**Propósito:** Resolver ambigüedades de tarifas antes de continuar cargando precios personalizados.

## Resumen Ejecutivo

Las hojas de precios funcionan como capas de precios. Para una misma hoja, servicio, cantidad de pasajeros y fecha debe existir una sola tarifa aplicable.

Se detectaron **7 conflictos históricos** en precios de servicios. Algunos tienen el mismo importe y otros tienen importes diferentes. En ambos casos representan un problema porque más de un registro puede responder a la misma cotización.

Estos registros deben ser corregidos por una persona responsable del negocio, ya que el sistema no puede decidir por sí solo cuál precio es comercialmente correcto.

## Conflictos Detectados

| Hoja | Servicio | Registros involucrados | Conflicto |
|---|---|---|---|
| Tarifario Turismo Sucre | Tarabuco FD + Almuerzo | `138` y `643` | Ambos aplican a `4–5 pax`, pero tienen precios `63.50` y `61.00`. |
| Tarifario Turismo Sucre | Transfer Aeropuerto de Alcantari | `43` y `608` | Ambos aplican a `11–15 pax`, pero tienen precios `14.00` y `13.00`. |
| Tarifario Turismo Sucre | Transfer Aeropuerto de Alcantari | `44` y `45` | Los rangos `16–24` y `24–100` se superponen en `24 pax`. |
| Tarifario Turismo Sucre | Transfer In o Out Terminal La Paz sin guia | `770` y `771` | Ambos aplican a `11–15 pax` con el mismo precio `8.40`; uno es redundante. |
| Claudia Rivera Fremen | Cena en Hotel | `822` y `847` | El rango `4–21` contiene el rango `6–10`; ambos cuestan `25.00`. |
| Claudia Rivera Fremen | Cena en Hotel | `822` y `848` | El rango `4–21` contiene el rango `11–15`; ambos cuestan `25.00`. |
| Claudia Rivera Fremen | Cena en Hotel | `822` y `849` | El rango `4–21` contiene el rango `16–21`; ambos cuestan `25.00`. |

## Por Qué Debe Evitarse

El sistema busca precios usando estas condiciones:

- La hoja de precios.
- El servicio.
- `min_pax <= pasajeros`.
- `max_pax >= pasajeros`.
- La fecha de vigencia.

Por tanto, los límites son inclusivos. Si existen dos registros que cumplen esas condiciones, ambos son candidatos para la misma cotización.

Esto puede provocar:

- Una cotización con un precio distinto al esperado por el cliente.
- Diferencias entre cotizaciones para el mismo servicio y cantidad de pasajeros.
- Cambios de precio al editar, importar o reordenar registros.
- Dificultad para explicar el precio aplicado en una auditoría.
- Tarifas personalizadas que dejan de comportarse como sobrescrituras parciales.

Un registro repetido con el mismo precio también debe evitarse. Aunque hoy produzca el mismo total, puede generar una diferencia futura si alguien modifica solo uno de los duplicados.

## Cómo Resolverlos

La persona responsable debe tomar una decisión comercial para cada caso:

1. **Mismo rango con precios diferentes:** conservar el precio vigente y eliminar o corregir el registro alternativo.
2. **Rangos que comparten un límite:** separar los rangos sin intersección. Por ejemplo, elegir entre `16–23` y `24–100`, o `16–24` y `25–100`.
3. **Rango general junto a subrangos:** conservar el rango general si todos los subrangos tendrán el mismo precio, o eliminarlo y conservar únicamente los subrangos si se necesitan tarifas distintas.
4. **Duplicados con el mismo precio:** conservar un solo registro.

## Regla Para Hojas Personalizadas

Una hoja personalizada no debe copiar todos los precios de la hoja base. Debe contener únicamente los servicios cuyos precios cambian.

Ejemplo correcto:

```text
Hoja base:
  Servicio A, 1–10 pax: 50
  Servicio B, 1–10 pax: 80

Hoja temporada:
  Servicio A, 1–10 pax: 60

Resultado:
  Servicio A usa 60 desde la hoja temporada.
  Servicio B usa 80 desde la hoja base.
```

En la hoja personalizada debe existir como máximo una tarifa aplicable para cada combinación de servicio, pasajeros y fecha.

## Protecciones Implementadas

Después de la auditoría, el sistema quedó protegido para operaciones normales:

- No permite más de una hoja base.
- No permite eliminar o desactivar la única hoja base.
- No permite rangos de pasajeros inválidos.
- No permite fechas de vigencia invertidas.
- No permite precios negativos.
- No permite duplicar el precio de una habitación dentro de la misma hoja.
- No permite registrar nuevos rangos de servicio que se solapen con otro existente.
- La búsqueda de precios tiene un orden determinista mientras existan conflictos históricos.

## ¿Volverán A Generarse Estos Conflictos?

**En el uso normal de la aplicación, no deberían generarse nuevos conflictos del mismo tipo.** La base de datos rechaza las nuevas inserciones o cambios de rango que se solapen, incluso si provienen de una operación directa autorizada mediante la API.

Sin embargo:

- Los 7 conflictos históricos no se eliminan automáticamente.
- Un usuario administrador debe resolverlos según la decisión comercial correspondiente.
- El sistema permite modificar el importe de un registro histórico sin cambiar su rango; eso no crea un nuevo solapamiento, pero tampoco resuelve uno existente.
- Un propietario de la base de datos que desactive triggers o ejecute una migración especial podría saltarse estas protecciones.
- La exclusión absoluta de los conflictos históricos queda pendiente hasta que el cliente confirme qué registros conservar.

Una vez corregidos los 7 casos, el sistema podrá mantener la regla de una sola tarifa aplicable por servicio, pasajeros y fecha sin depender de correcciones manuales recurrentes.
