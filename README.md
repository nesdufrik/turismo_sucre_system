# Turismo Sucre - Sistema de Cotizaciones Inteligente

Sistema avanzado de gestión de cotizaciones turísticas diseñado para optimizar el flujo de trabajo entre agentes de viajes y el departamento de operaciones. Este sistema integra automatización (n8n), gestión financiera precisa y un robusto control de acceso (RBAC).

## 🚀 Funcionalidades Principales

### 💎 Gestión de Cotizaciones (Core)

- **Motor Financiero:** Lógica de cálculo centralizada que maneja impuestos (IVA), comisiones de agencia y múltiples monedas (USD/BOB).
- **Prorrateo Inteligente:** Cálculo automático de precios por persona para habitaciones de hotel basado en ocupación y número total de pasajeros.
- **Itinerarios Dinámicos:** Selector avanzado de hoteles, servicios y paquetes turísticos con búsqueda asíncrona.
- **Flujo de Aprobación:** Ciclo de vida controlado (`Borrador` -> `En Revisión` -> `Aprobada/Rechazada` -> `Vendida`). Capacidad de edición para administradores y operadores en cotizaciones aprobadas.
- **Generación de PDF Avanzada:** Exportación profesional de propuestas comerciales y reportes de inventario usando `jsPDF` y gráficos de `Chart.js`. Incluye cabeceras dinámicas basadas en el perfil de la agencia y códigos de servicio.
- **Comunicación Integrada:** Funcionalidad de 'Responder a Solicitante' con edición en texto enriquecido (Rich Text), vista previa HTML y envío de correos condicionado a permisos (`quotes.send`).

### 🤖 Integración y Automatización

- **Human-in-the-Loop:** Visor integrado para consultar la solicitud original (correo/JSON) que inició la cotización mediante automatizaciones de n8n.
- **Snapshot de Precios:** Los precios se congelan al momento de agregar un item, protegiendo la cotización de cambios futuros en el inventario.

### 🛡️ Seguridad y Auditoría

- **RBAC Real:** Control de acceso y renderizado condicional de la UI basado en roles y permisos granulares cargados dinámicamente.
- **Auditoría Completa:** Registro detallado de inserciones, actualizaciones y eliminaciones en tablas críticas con detalle de cambios en formato JSON.
- **Auth Seguro:** Limpieza profunda de estado en el cliente al cerrar sesión y recuperación de contraseñas robusta.
- **Gestión Segura de DB:** Administración estricta de esquemas (ej. extensiones como `pg_net` segregadas en esquemas seguros dedicados).

### 👥 CRM e Inventario

- **Gestión de Clientes:** Soporte para personas particulares y empresas/agencias con múltiples contactos.
- **Hojas de Precios:** Sistema de tarifas diferenciadas asignables por cliente.
- **Maestros e Inventario:** Administración centralizada de servicios, hoteles, categorías y ubicaciones con UX mejorada.
- **Perfil de Agencia:** Módulo para administrar los datos e identidad visual de la agencia, utilizados dinámicamente en los documentos PDF generados.

## 🛠️ Tech Stack

### Frontend

- **Framework:** Vue 3 (Composition API)
- **Lenguaje:** TypeScript (Strict Mode)
- **Estilos:** Tailwind CSS 4.0
- **Componentes UI:** Shadcn-vue + Lucide Icons
- **Estado:** Pinia
- **Validación:** Vee-validate + Zod

### Backend (BaaS)

- **Plataforma:** Supabase
- **Base de Datos:** PostgreSQL 16 (PostgREST)
- **Seguridad:** Row Level Security (RLS)
- **Lógica:** SQL Functions & Triggers

## 🏗️ Arquitectura del Proyecto

El proyecto sigue una arquitectura **Modular orientada al Dominio**:

```text
src/
├── modules/          # Funcionalidades por dominio (auth, quotes, crm...)
│   └── {dominio}/
│       ├── components/ # Componentes específicos del módulo
│       ├── views/      # Vistas/Páginas
│       ├── services/   # Lógica de comunicación con API
│       └── domain/     # Lógica de negocio pura (Pure TS)
├── components/ui/    # Componentes genéricos (Shadcn)
├── lib/              # Configuraciones globales (Supabase client)
├── stores/           # Almacenes globales (Pinia)
└── types/            # Definiciones de TypeScript generadas
```

## 🛠️ Desarrollo

### Requisitos Previos

- Node.js (v20+)
- pnpm (Recomendado)

### Instalación

```bash
# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.example .env.local

# Iniciar servidor de desarrollo
pnpm dev
```

### Comandos Útiles

```bash
# Generar tipos de Supabase
supabase gen types typescript --local > src/types/database.types.ts

# Ejecutar pruebas unitarias (Vitest)
pnpm test

# Build de producción
pnpm build
```

---

© 2026 Turismo Sucre. Todos los derechos reservados.
