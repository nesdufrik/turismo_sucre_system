# 🚀 Roadmap de Evolución: Sistema de Turismo Sucre

Este documento detalla las mejoras y módulos pendientes para transformar el sistema actual en una plataforma integral de gestión de agencias de viajes (ERP/CRM).

---

## 1. Módulo de Documentación y Exportación (Crítico)
Para que el sistema sea útil en el día a día, debe generar documentos listos para el cliente.

*   **Generador de Cotizaciones PDF:**
    *   **Detalle:** Crear un diseño profesional que incluya logo, itinerario detallado, desglose de servicios y políticas de cancelación.
    *   **Visión Técnica:** Usar una **Edge Function de Supabase** con una librería como `browserless` o `puppeteer` para renderizar el PDF en el servidor. Esto asegura que el diseño sea idéntico para todos los usuarios.
*   **Vouchers de Servicio Automatizados:**
    *   **Detalle:** Documentos individuales para hoteles y transportes que se generan cuando la cotización pasa a `Sold`.
    *   **Lógica:** Cada `item_id` de la cotización debe poder emitir un voucher con un código QR único para validación.

## 2. Gestión de Operaciones y Reservas (Back-Office)
Pasar de "vender" a "gestionar la ejecución".

*   **Panel de Confirmación de Proveedores:**
    *   **Detalle:** Una vista donde el equipo de operaciones vea todos los servicios vendidos y pueda marcar el estado de la reserva con el proveedor (Pendiente, Solicitado, Confirmado, Pagado).
    *   **Arquitectura:** Crear una tabla `reservas_proveedor` vinculada a `itemscotizacion`.
*   **Calendario Dinámico (Master Calendar):**
    *   **Detalle:** Un calendario global donde se visualicen las entradas/salidas de pasajeros, tours diarios y disponibilidad de guías.
    *   **Técnica:** Integrar `FullCalendar` en el frontend, consumiendo una vista de Supabase que una cotizaciones aprobadas e items de servicio.

## 3. Inteligencia de Negocios (Analytics)
Transformar los datos en decisiones.

*   **Dashboard de Performance de Ventas:**
    *   **Métricas:** Tasa de conversión (Cotizado vs Vendido), Ingresos por Agente, Margen de Utilidad Promedio.
    *   **Visualización:** Gráficos de barras y pasteles usando `Tremor` o `Chart.js`.
*   **Análisis de Inventario:**
    *   **Detalle:** Reporte de los servicios más solicitados y los hoteles con mayor ocupación para negociar mejores contratos anuales.

## 4. Finanzas y Rentabilidad Real
Controlar el dinero más allá del precio de venta.

*   **Gestión de Pagos (Cuentas por Cobrar):**
    *   **Detalle:** Permitir registrar pagos parciales (adelantos) del cliente y vincularlos a la cotización.
    *   **Lógica:** Tabla `pagos_clientes` con historial de transacciones y saldo pendiente automatizado.
*   **Comparativa Costo vs. Venta:**
    *   **Detalle:** En la cotización, mostrar al agente el "Costo Neto" (lo que se paga al proveedor) vs el "Precio de Venta" para asegurar que nunca se venda por debajo del margen mínimo.

## 5. CRM Avanzado y Fidelización
Cuidar al cliente antes, durante y después del viaje.

*   **Timeline de Actividad del Cliente:**
    *   **Detalle:** Una vista tipo "feed" en la ficha del cliente que muestre cada interacción: cotizaciones, llamadas registradas, cambios de documentos, etc.
*   **Automatización Post-Venta (n8n):**
    *   **Flujo:** 2 días después de que un cliente termina su viaje, enviar automáticamente un correo/WhatsApp pidiendo feedback o una reseña en Google Maps.

## 6. Herramientas Administrativas y Auditoría
Mantenibilidad y seguridad.

*   **Visualizador de Auditoría (Audit Log UI):**
    *   **Detalle:** Interfaz para que los administradores vean quién cambió un precio, eliminó un servicio o modificó un rol.
    *   **Técnica:** Crear un componente genérico que consuma la tabla `auditoria` existente, filtrando por `registro_id`.
*   **Gestor de Configuración Global:**
    *   **Detalle:** Interfaz para cambiar el Tipo de Cambio, Porcentajes de IVA y Comisión por defecto sin tocar la base de datos.

---

## Sugerencia de Orden de Implementación:
1.  **Generación de PDF** (Valor inmediato para ventas).
2.  **Dashboard Financiero** (Control de márgenes y utilidad).
3.  **Control de Operaciones** (Gestión de reservas con proveedores).
4.  **CRM Avanzado** (Retención de clientes).
