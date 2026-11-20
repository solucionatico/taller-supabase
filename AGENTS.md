# Guía para Agentes de IA (AGENTS.md)

Este documento define las reglas obligatorias, la arquitectura, las convenciones de trabajo y el flujo documental que cualquier agente de IA (Antigravity, Claude, Gemini, etc.) debe seguir al trabajar en el repositorio **taller-supabase**.

> **Nota sobre preguntas y dudas:** Si tienes dudas, ambigüedades o preguntas sobre requerimientos o decisiones de diseño, **hazlas de manera interactiva al usuario** (por ejemplo, utilizando la herramienta de preguntas interactivas `ask_question` o consultando directamente antes de asumir comportamientos no especificados).

---

## 1. Propósito del Proyecto

Proyecto didáctico full-stack para el taller **"Herramientas gratuitas de despliegue"**, diseñado para que estudiantes principiantes aprendan a desarrollar y desplegar una aplicación web completa de gestión de tareas personales usando **Supabase** (PostgreSQL, Auth, RLS, Edge Functions) y **Vercel** (hosting estático para SPA Vue 3 + Vite) desde un **único repositorio Git** mediante sus respectivas CLI instaladas localmente.

---

## 2. Reglas Inquebrantables del Proyecto

1. **Monorepo único**:
   - Todo el código (Frontend en `apps/web`, Backend/Edge Functions en `supabase/functions`, Migraciones SQL en `supabase/migrations`, Scripts en `scripts/` y Documentación en `docs/` y `README.md`) debe vivir en este único repositorio.
   - No separar frontend y backend en repositorios distintos.
   - No requerir integración automática con GitHub en Vercel ni en Supabase; todo el despliegue se ejecuta desde la terminal del estudiante mediante CLI locales.

2. **JavaScript Puro (Prohibido TypeScript) y ES Modules**:
   - Tanto el frontend (Vue 3 + Vite), como las Edge Functions (Deno) y los scripts de automatización (Node.js) deben escribirse exclusivamente en **JavaScript (`.js`)**.
   - Está **estrictamente prohibido** usar TypeScript (`.ts`).
   - El proyecto configura `"type": "module"` en `package.json`, por lo que se utiliza sintaxis ES Modules (`import` / `export`) directamente en archivos `.js` sin necesidad de extensiones `.mjs`.

3. **Sin `npx` y sin instalaciones globales**:
   - Las CLI oficiales de `supabase` y `vercel` se instalan como `devDependencies` locales en `package.json`.
   - Está **prohibido** usar `npx` en scripts o en la documentación.
   - Todos los comandos deben ejecutarse a través de `npm run <script>`, aprovechando la resolución automática de binarios locales en `node_modules/.bin`.

4. **Compatibilidad Multiplataforma y de Entorno**:
   - Se requiere **Node.js 22 LTS o superior**.
   - Los scripts en `scripts/` deben estar escritos en JavaScript estándar de Node.js (`fs`, `path`, `child_process`, `readline`), sin depender de Bash ni PowerShell, para funcionar idénticamente en **Windows 10/11, Linux y macOS**.
   - El flujo del taller **no debe requerir Docker**; los estudiantes trabajan contra sus proyectos remotos gratuitos en Supabase y Vercel.

5. **Seguridad, Autenticación y Row Level Security (RLS)**:
   - Nunca almacenar, solicitar para guardar en archivos versionados ni imprimir en consola claves secretas (`service_role`, tokens personales de acceso, contraseñas de base de datos).
   - El frontend únicamente utiliza variables públicas con prefijo `VITE_`: `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`.
   - La tabla `public.tasks` debe tener **RLS habilitado** con políticas basadas en `auth.uid()` para `SELECT`, `INSERT`, `UPDATE` y `DELETE`, y `user_id` con `DEFAULT auth.uid()`.
   - La Edge Function `tasks` debe tener `verify_jwt = true` activo, validar la sesión del usuario, reenviar el encabezado `Authorization` creando el cliente Supabase con la clave publicable/anónima del entorno, y respetar RLS en todo momento (nunca usar `service_role` para operaciones de usuario).

---

## 3. Estructura de Documentación y Seguimiento (`docs/`)

Para que cualquier sesión o agente comprenda de inmediato qué se ha hecho, qué falta y por qué se tomó cada decisión, siempre se debe mantener actualizada la carpeta `docs/`:

- [`docs/architecture.md`](./docs/architecture.md): Diseño arquitectónico detallado, flujo de datos, modelo de seguridad y estructura del repositorio.
- [`docs/rules.md`](./docs/rules.md): Reglas técnicas, pedagógicas y de seguridad detalladas.
- [`docs/log.md`](./docs/log.md): Bitácora general cronológica del proyecto con los avances realizados y decisiones tomadas.
- [`docs/specs/`](./docs/specs/README.md): Especificaciones modulares en formato `kebab-case`. Cada spec cuenta con:
  - `spec.md`: Estado actual (`pending`, `in-progress`, `done`), requerimientos, diseño y el razonamiento detrás de cada decisión.
  - `log.md`: Bitácora específica de la spec detallando su evolución, cambios de estado y justificación técnica.

---

## 4. Flujo de Trabajo para Agentes

1. **Antes de modificar el código**:
   - Leer `AGENTS.md`, `docs/architecture.md`, `docs/rules.md`, `docs/log.md` y las specs relevantes en `docs/specs/`.
   - Si algún requerimiento es ambiguo, formular preguntas interactivas al usuario antes de implementar.
2. **Durante la implementación**:
   - Actualizar el estado de la spec correspondiente a `in-progress` y registrar las decisiones en su `log.md`.
   - Mantener compatibilidad con Node.js >= 22, ES Modules (`.js`) y ejecución sin `npx`.
3. **Al finalizar un cambio**:
   - Ejecutar `npm run check` y `npm run build` para validar que el entorno y la compilación de producción funcionen sin errores.
   - Marcar la spec correspondiente como `done`, actualizar su `log.md` y registrar el hito en `docs/log.md`.
