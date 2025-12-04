# TECH STACK

## FRONTEND

- **Framework:** Vue 3.x (Composition API)
- **Language:** TypeScript 5.x (Strict Mode)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS 4.0 (Oxide engine). _Nota: No usa tailwind.config.js tradicional, usa CSS imports._
- **UI Components:** Shadcn-vue (Radix Vue headless).
- **Icons:** Lucide-vue-next.
- **Forms:** Vee-validate + Zod.
- **State:** Pinia.
- **Router:** Vue Router 4.
- **Testing:** Vitest + @vue/test-utils (Para cumplir con TDD).

## BACKEND (BaaS)

- **Platform:** Supabase.
- **Auth:** Supabase Auth (Email/Password + OAuth).
- **Database:** PostgreSQL 16.
- **Client:** `@supabase/supabase-js` (Singleton en `src/lib/supabase.ts`).
- **Server Logic:** Supabase Edge Functions (Deno/TS).
