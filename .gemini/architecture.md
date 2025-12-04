# PROJECT ARCHITECTURE & PATTERNS

## ESTRATEGIA DE DIRECTORIOS

El proyecto sigue una arquitectura modular basada en DOMINIO (Domain-Driven), no por tipo de archivo.

- `src/modules/{dominio}/`: Contiene todo lo relativo a una funcionalidad (vistas, componentes, servicios).
- `src/components/ui/`: Solo componentes genéricos de Shadcn (botones, inputs).
- `src/lib/`: Configuraciones globales (Supabase client).
- `src/layouts/`: Layouts para rutas privadas y públicas.
- `src/stores/`: Almacenes globales (Pinia).
- `src/router/index.ts`: Configuración principal y Guards.
- `src/router/routes.ts`: Definición de rutas.
- `src/assets/`: Assets globales (logos, imágenes).

## PATRÓN DE SERVICIOS

**REGLA DE ORO:** NUNCA llamar a `supabase.from()` dentro de un componente `.vue`.

1. Crear un archivo `Service.ts` dentro del módulo (ej: `QuoteService.ts`).
2. Definir funciones asíncronas que retornen `data` o lancen `error`.
3. El componente importa el servicio y gestiona el estado de carga/error.

## PATRÓN DE RUTAS

- Usar Layouts (`AppLayout` para app privada, `AuthLayout` para login).
- Proteger rutas usando Meta fields (`meta: { requiresAuth: true }`) y Guards globales.

## TECH STACK COMPLIANCE

- Cualquier decisión técnica debe respetar estrictamente las versiones y herramientas listadas en el archivo `stack.md`.
