# Plan de Trabajo: Sistema de Cotizaciones Turismo Sucre

Este documento detalla el plan de implementación y la estructura del proyecto basado en la arquitectura definida y el esquema de base de datos existente.

## Fases de Desarrollo

### Fase 1: Configuración y Base (Completado)
- [x] Generar tipos de TypeScript desde Supabase.
- [x] Configurar Layouts y Auth.
- [x] Implementar RBAC Real (Permisos desde DB).

### Fase 2: Maestros y Configuración (Completado)
- [x] CRUD de Ubicaciones, Categorías, Hojas de Precios.
- [x] **Nuevo:** Módulo de Auditoría (Logs de cambios).

### Fase 3: Inventario y Precios (Completado - Refactorizado)
- [x] Gestión de Servicios, Hoteles y Paquetes.
- [x] Gestión de Precios complejos (por pax, temporada).
- [x] *Refactor:* Esquemas Zod extraídos y Confirmación Global.

### Fase 4: CRM (Completado - Refactorizado)
- [x] Gestión de Clientes (Personas/Empresas).
- [x] *Refactor:* Validación robusta con Zod Discriminated Unions.

### Fase 5: Núcleo de Cotizaciones (Completado - Refactorizado)
- [x] CRUD Cotizaciones e Items.
- [x] Generación de PDF.
- [x] Flujo de Estados (Borrador -> Vendido).
- [x] Extraer lógica de cálculo de precios a `domain/PriceCalculator.ts`.

### Fase 6: Refactorización y UI/UX (Completado)
- [x] Sistema Global de Confirmación (`useConfirm`).
- [x] Unificación de estilos de Badges en Auditoría.
- [x] Integración de visualización de origen (n8n/JSON) estructurada.
- [x] Mejora de componentes de búsqueda (`SearchableSelect`).
- [x] Optimización de lógica financiera y prorrateo de hoteles.

### Fase 7: Testing y Entrega (En Progreso)

- [x] Pruebas E2E de flujos críticos (Email -> Quote -> PDF).

- [x] Revisión final de modo oscuro y accesibilidad.

- [ ] Documentación final de usuario.
