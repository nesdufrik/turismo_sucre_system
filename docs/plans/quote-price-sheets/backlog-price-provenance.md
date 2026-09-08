# Backlog: Procedencia Histórica Del Precio

## Motivo

Actualmente `itemscotizacion` conserva el monto aplicado mediante `precio_unitario_snapshot`, pero no conserva explícitamente si ese monto salió de la hoja seleccionada, de la hoja base o de un override manual.

Para el funcionamiento actual esto es suficiente: el total queda congelado. Sin embargo, una auditoría futura podría necesitar reconstruir con precisión el origen de cada precio.

## Fuera Del MVP

No implementar esta funcionalidad como parte de las Tareas 01–06. El modelo de fallback y el snapshot deben estabilizarse primero.

## Información Potencial

Para artículos simples se podría guardar:

- Tipo de origen: `selected`, `base` o `manual`.
- `hoja_precio_origen_id`.
- Identificador del registro de precio utilizado.
- Nombre de la hoja al momento de aplicar el precio, si se requiere conservarlo aunque la hoja sea renombrada.

Un único `precio_origen_id` no puede tener una FK tradicional porque servicios y habitaciones usan tablas de precio diferentes. El diseño debe evitar una relación polimórfica sin validación o separar referencias por tipo.

## Paquetes

Un paquete puede tener componentes con distintos orígenes. Para conservar esa información habría que elegir una de estas alternativas:

- Guardar los detalles de resolución en un snapshot JSONB del artículo.
- Crear una tabla de componentes snapshot relacionada con `itemscotizacion`.
- Expandir el paquete a artículos individuales en la cotización.

La opción debe evaluarse con el formato del PDF, los reportes y los requisitos de auditoría antes de implementarse.

## Posible Entrega Futura

1. Definir un modelo de procedencia para servicios, habitaciones y paquetes.
2. Agregar migración y tipos.
3. Hacer que `ResolvedPrice` produzca los datos persistibles.
4. Guardar la procedencia junto al snapshot, sin recalcular históricos.
5. Mostrar el origen solo a usuarios con permiso de precios o auditoría.
6. Documentar los casos de reconstrucción histórica.

## Criterios Para Activarlo

- Existe una necesidad operativa concreta de auditar el origen.
- El esquema de paquetes está definido.
- El PDF y los reportes tienen una decisión sobre qué origen mostrar.
- Se cuenta con una estrategia para nombres o eliminaciones de hojas.
- El costo de mantenimiento está justificado frente al snapshot de precio existente.
