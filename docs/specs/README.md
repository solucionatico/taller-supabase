# Índice de Especificaciones (`docs/specs/`)

Cada especificación del proyecto está organizada en formato `kebab-case`, con su propio documento de diseño (`spec.md`) que incluye el estado actual (`pending`, `in-progress`, `done`) y el razonamiento detrás de cada decisión, acompañado de su bitácora individual (`log.md`).

| Spec | Estado | Descripción | Bitácora |
| :--- | :---: | :--- | :--- |
| [`project-foundation`](./project-foundation/spec.md) | `done` | Monorepo, `package.json`, ES Modules (`.js`), `.gitignore`, `.env.example` y configuración de Vite | [`log.md`](./project-foundation/log.md) |
| [`database-and-rls`](./database-and-rls/spec.md) | `done` | Esquema PostgreSQL `public.tasks`, migraciones SQL versionadas, índices y políticas RLS con `auth.uid()` | [`log.md`](./database-and-rls/log.md) |
| [`edge-function-tasks`](./edge-function-tasks/spec.md) | `done` | Supabase Edge Function `tasks` en Deno + JavaScript, validación JWT, respeto de RLS y CORS | [`log.md`](./edge-function-tasks/log.md) |
| [`frontend-vue-app`](./frontend-vue-app/spec.md) | `done` | SPA en Vue 3 + Vite + JavaScript, autenticación Supabase Auth, rutas protegidas y CRUD de tareas | [`log.md`](./frontend-vue-app/log.md) |
| [`cli-automation-scripts`](./cli-automation-scripts/spec.md) | `done` | Scripts multiplataforma (`check-environment.js`, `setup.js`, `deploy-functions.js`, `deploy.js`) sin `npx` | [`log.md`](./cli-automation-scripts/log.md) |
| [`vercel-and-deployment`](./vercel-and-deployment/spec.md) | `done` | Configuración `vercel.json` para SPA, compilación desde la raíz y despliegue con Vercel CLI | [`log.md`](./vercel-and-deployment/log.md) |
| [`student-documentation`](./student-documentation/spec.md) | `done` | Guía didáctica paso a paso en `README.md` para estudiantes principiantes (17 secciones) | [`log.md`](./student-documentation/log.md) |
