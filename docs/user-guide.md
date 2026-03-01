# Guía Detallada de Usuario: Sistema de Cotizaciones Turismo Sucre

Bienvenido al manual operativo del sistema. Esta guía está diseñada para que cualquier integrante del equipo, desde Agentes de Viajes hasta personal de Operaciones, pueda dominar la herramienta.

---

## 1. Conceptos Fundamentales
Antes de empezar, es vital entender dos pilares del sistema:
1.  **Hojas de Precios:** El sistema no tiene un "precio único". Los costos dependen de qué hoja tiene asignada el cliente (ej. Tarifas Netas para Agencias vs. Tarifas para Pasajeros Directos).
2.  **Prorrateo de Hoteles:** A diferencia de un tour, una habitación tiene un costo fijo. El sistema divide automáticamente ese costo entre el número de pasajeros de la cotización para mostrar un precio unitario coherente.

---

## 2. Gestión de Clientes (CRM)
El primer paso de cualquier venta es el registro correcto del cliente.

### Crear o Buscar un Cliente
*   Usa el buscador global para encontrar clientes por nombre o NIT.
*   **Particular:** Registro simple con datos de contacto.
*   **Empresa/Agencia:** Permite gestionar múltiples contactos y es donde usualmente asignarás hojas de precios especiales.

> [!TIP]
> **Imagen Sugerida:** Captura del formulario de cliente resaltando el campo "Hoja de Precios".
> `[IMAGEN: CRM_CLIENT_SHEET]`

---

## 3. El Editor de Cotizaciones
El editor es el corazón del sistema. Se divide en tres áreas: Cabecera, Itinerario y Visor de Origen.

### A. Creación de la Cabecera
Al iniciar una cotización, rellena los datos generales. El número de **Pasajeros (Pax)** es el dato más importante, ya que recalcula los totales de cada item en tiempo real.

> `[IMAGEN: QUOTE_EDITOR_HEADER]`

### B. Uso del Visor de Origen (Automation)
Si una cotización llega desde un canal automático (n8n), verás un botón azul: **"Ver Solicitud Original"**.
*   Al abrirlo, verás el correo estructurado: Remitente, Asunto y el Mensaje completo.
*   Esto te permite copiar y pegar nombres de hoteles o servicios solicitados sin cambiar de pestaña.

> `[IMAGEN: QUOTE_SOURCE_VIEWER_OPEN]`

### C. Construcción del Itinerario
Aquí agregarás los componentes del viaje mediante tres selectores especializados:

#### 1. Selector de Hoteles
*   **Búsqueda:** Escribe el nombre del hotel y el sistema te mostrará los tipos de habitación disponibles.
*   **Noches:** Selecciona Check-In y Check-Out; el sistema calculará las noches automáticamente.
*   **Cálculo:** Verás un recuadro gris que explica cómo se llega al precio por pax. 
    *   *(Precio Habitación x Cant. Habitaciones) / Total Pax = Unitario*.

> `[IMAGEN: HOTEL_SELECTOR_PRORRATING_PREVIEW]`

#### 2. Selector de Servicios / Tours
*   Ideal para traslados, guías o entradas.
*   El sistema busca el precio exacto en la Hoja de Precios según la fecha y el rango de pasajeros (pax).

#### 3. Selector de Paquetes
*   Permite añadir un grupo de servicios pre-configurados. 
*   El sistema desglosa los costos de cada componente internamente para darte el total sugerido.

---

## 4. El Ciclo de Aprobación
El sistema garantiza que ninguna cotización con errores de precio salga de la agencia.

1.  **Estado "Borrador" (Draft):** Puedes editar todo libremente.
    *   `[IMAGEN: STATUS_BADGE_DRAFT]`
2.  **Estado "En Revisión" (In_Review):** El agente solicita la revisión. Los campos se bloquean para el agente.
    *   `[IMAGEN: BUTTON_REQUEST_REVIEW]`
3.  **Acción del Supervisor (Admin/Ops):**
    *   **Aprobar:** Habilita la generación de PDF.
    *   **Rechazar:** Abre un diálogo para escribir el motivo (ej. "Precio de hotel desactualizado"). El agente recibirá una notificación visual roja con este mensaje.
4.  **Estado "Vendida" (Sold):** Una vez aceptada por el cliente, se marca como vendida para congelar los datos permanentemente.

---

## 5. Generación del Documento PDF
El botón **"Generar PDF"** crea un documento profesional con:
*   Logotipo de la empresa.
*   Resumen financiero (Subtotal, IVA, Comisión).
*   Notas personalizadas para el cliente.
*   Cuentas bancarias configuradas en el sistema.

> [!IMPORTANT]
> Revisa siempre las "Notas para el Cliente" antes de exportar, ya que son la cara visible de tu propuesta.

---

## Solución de Problemas Comunes
*   **"No encuentro un hotel en la lista":** Verifica en el módulo de Inventario que el hotel esté creado y tenga habitaciones asociadas.
*   **"El precio me sale en 0":** Esto sucede cuando no hay una tarifa cargada para la fecha seleccionada o para ese número de pasajeros en la Hoja de Precios del cliente. Puedes usar el "Override" (Precio Manual) para forzar un costo.
*   **"No veo los botones de Aprobar":** Asegúrate de haber cerrado sesión e iniciado con un usuario de rol 'admin' u 'operations'.