# Guía Detallada de Usuario: Sistema de Cotizaciones Turismo Sucre

Bienvenido al manual operativo del sistema. Esta guía está diseñada para que cualquier integrante del equipo, desde Agentes de Viajes hasta personal de Operaciones, pueda dominar la herramienta.

---

## 1. Conceptos Fundamentales
Antes de empezar, es vital entender dos pilares del sistema:
1.  **Hoja Base:** Es la tarifa general marcada como "Por Defecto". Contiene los precios de referencia para servicios y habitaciones.
2.  **Hojas Personalizadas:** Son capas de cambios para una temporada, gestión, agencia o situación especial. Solo deben contener los servicios cuyos precios cambian; los demás se buscan automáticamente en la hoja base.
3.  **Hoja de la Cotización:** Cada cotización puede utilizar una hoja distinta a la habitual del cliente. El cliente propone una hoja inicial, pero cambiarla en la cotización no modifica los datos del cliente.
4.  **Prorrateo de Hoteles:** A diferencia de un tour, una habitación tiene un costo fijo. El sistema divide automáticamente ese costo entre el número de pasajeros de la cotización para mostrar un precio unitario coherente.

### Buenas Prácticas Para Hojas Personalizadas

*   No copies todos los servicios de la hoja base si sus precios no cambian.
*   Para una misma hoja, servicio, cantidad de pasajeros y periodo no debe existir más de una tarifa aplicable.
*   No crees rangos que se superpongan. Los límites son inclusivos: `16–24` y `24–100` coinciden en 24 pasajeros.
*   Si dos registros tienen el mismo rango, conserva solo uno, aunque actualmente tengan el mismo precio.
*   Si necesitas cambiar un precio, modifica el registro correcto en la hoja personalizada en lugar de duplicar el registro de la hoja base.

---

## 2. Gestión de Clientes (CRM)
El primer paso de cualquier venta es el registro correcto del cliente.

### Crear o Buscar un Cliente
*   Usa el buscador global para encontrar clientes por nombre o NIT.
*   **Particular:** Registro simple con datos de contacto.
*   **Empresa/Agencia:** Permite gestionar múltiples contactos y es donde usualmente asignarás una hoja de precios habitual.
*   La hoja asignada al cliente se utilizará como sugerencia inicial al crear cotizaciones.

> [!TIP]
> **Imagen Sugerida:** Captura del formulario de cliente resaltando el campo "Hoja de Precios".
> `[IMAGEN: CRM_CLIENT_SHEET]`

---

## 3. El Editor de Cotizaciones
El editor es el corazón del sistema. Se divide en tres áreas: Cabecera, Itinerario y Visor de Origen.

### A. Creación de la Cabecera
Al iniciar una cotización, rellena los datos generales. El número de **Pasajeros (Pax)** es el dato más importante, ya que recalcula los totales de cada item en tiempo real.

> `[IMAGEN: QUOTE_EDITOR_HEADER]`

### B. Selección De Hoja Para La Cotización

En **Hoja de Precios para esta Cotización** verás la hoja propuesta por el cliente y todas las hojas disponibles.

*   La hoja marcada como **Base** es la tarifa general del sistema.
*   Puedes seleccionar una hoja personalizada para una temporada, gestión o acuerdo específico.
*   Esta selección solo afecta la cotización actual y no modifica la hoja asignada al cliente.
*   Si la hoja personalizada no contiene un precio, el sistema buscará el precio en la hoja base.
*   Después de agregar el primer artículo, el selector queda bloqueado para evitar mezclar tarifas. Si eliminas todos los artículos, vuelve a habilitarse.

> `[IMAGEN: QUOTE_PRICE_SHEET_SELECTOR]`

### C. Uso del Visor de Origen (Automation)
Si una cotización llega desde un canal automático (n8n), verás un botón azul: **"Ver Solicitud Original"**.
*   Al abrirlo, verás el correo estructurado: Remitente, Asunto y el Mensaje completo.
*   Esto te permite copiar y pegar nombres de hoteles o servicios solicitados sin cambiar de pestaña.

> `[IMAGEN: QUOTE_SOURCE_VIEWER_OPEN]`

### D. Construcción del Itinerario
Aquí agregarás los componentes del viaje mediante tres selectores especializados:

#### 1. Selector de Hoteles
*   **Búsqueda:** Escribe el nombre del hotel y el sistema te mostrará los tipos de habitación disponibles.
*   **Noches:** Selecciona Check-In y Check-Out; el sistema calculará las noches automáticamente.
*   **Cálculo:** Verás un recuadro gris que explica cómo se llega al precio por pax. 
    *   *(Precio Habitación x Cant. Habitaciones) / Total Pax = Unitario*.
*   El sistema indicará si el precio proviene de la hoja seleccionada o si fue heredado de la hoja base.

> `[IMAGEN: HOTEL_SELECTOR_PRORRATING_PREVIEW]`

#### 2. Selector de Servicios / Tours
*   Ideal para traslados, guías o entradas.
*   El sistema busca el precio exacto en la hoja seleccionada según la fecha y el rango de pasajeros (pax).
*   Si no existe un precio personalizado aplicable, mostrará que el importe fue heredado de la hoja base.
*   Si no existe precio en ninguna de las dos hojas, puedes utilizar el **Precio Manual / Override**.

#### 3. Selector de Paquetes
*   Permite añadir un grupo de servicios pre-configurados. 
*   El sistema desglosa los costos de cada componente internamente para darte el total sugerido.
*   Cada componente puede indicar si utiliza la hoja seleccionada o la hoja base.

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
*   **"Veo Precio heredado de la hoja base":** La hoja personalizada no contiene un precio aplicable. Es el comportamiento esperado; solo debes cargar un precio en esa hoja si quieres sobrescribir la tarifa base.
*   **"Sin precio en hoja seleccionada ni base":** No existe una tarifa aplicable para ese servicio, fecha o cantidad de pasajeros. Revisa los rangos o utiliza el "Precio Manual / Override" si corresponde.
*   **"El precio me sale en 0":** Verifica que exista una tarifa válida para la fecha y el rango de pasajeros. El sistema ya bloquea nuevos rangos inválidos o superpuestos.
*   **"No puedo cambiar la hoja":** La cotización ya tiene artículos. Elimina todos los artículos antes de cambiar la hoja o crea una nueva cotización.
*   **"No veo los botones de Aprobar":** Asegúrate de haber cerrado sesión e iniciado con un usuario de rol 'admin' u 'operations'.
