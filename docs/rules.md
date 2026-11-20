# Reglas y Restricciones del Proyecto (`docs/rules.md`)

Este documento consolida todas las reglas técnicas, arquitectónicas, de seguridad y pedagógicas del proyecto **taller-supabase**.

---

## 1. Reglas de Repositorio y Estructura

1. **Monorepo único**: Frontend, Edge Functions, migraciones SQL, configuración de Supabase/Vercel, scripts y documentación deben residir en un único repositorio Git.
2. **Despliegue por CLI local**: No configurar integraciones automáticas de GitHub con Vercel ni con Supabase. El estudiante despliega desde su máquina con las CLI locales.
3. **Ejecución desde la raíz**: Todos los comandos (`npm install`, `npm run dev`, `npm run build`, `npm run check`, `npm run setup`, `npm run deploy`) deben ejecutarse desde la raíz del repositorio.

---

## 2. Reglas de Tecnologías y Lenguaje

1. **Exclusivamente JavaScript (`.js`)**:
   - Prohibido el uso de TypeScript (`.ts`) en todo el proyecto (frontend, backend y scripts).
   - Se utiliza `"type": "module"` en `package.json` para habilitar ES Modules de forma nativa sin usar extensiones `.mjs`.
2. **Frontend**:
   - Vue 3 + Vite + Vue Router + `@supabase/supabase-js`.
   - HTML semántico y CSS moderno responsive, fácil de entender para estudiantes principiantes.
3. **Backend**:
   - Exclusivamente **Supabase Edge Functions** sobre Deno Runtime (`supabase/functions/tasks/index.js`).
   - Prohibido usar Express o servidores Node.js persistentes.
4. **Herramientas y CLI**:
   - Node.js 22 LTS o superior.
   - `supabase` y `vercel` instalados como `devDependencies` locales en `package.json`.
   - **Prohibido usar `npx`** en scripts o en la documentación.
   - **Prohibido exigir instalación global** (`npm i -g`) de las CLI.

---

## 3. Reglas de Base de Datos y Seguridad

1. **Migraciones SQL**:
   - El esquema se crea mediante migraciones en `supabase/migrations/`.
   - Prohibido pedir al estudiante que cree tablas manualmente en el Dashboard de Supabase.
   - Las migraciones deben ser idempotentes cuando corresponda.
2. **Row Level Security (RLS) Obligatorio**:
   - La tabla `public.tasks` debe tener RLS habilitado.
   - `user_id` debe referenciar a `auth.users(id)` y tener `DEFAULT auth.uid()`.
   - Las políticas de `SELECT`, `INSERT`, `UPDATE` y `DELETE` deben verificar siempre `auth.uid() = user_id`.
   - Nunca confiar en un `user_id` enviado desde el navegador.
3. **Autenticación en Edge Functions**:
   - `verify_jwt = true` obligatorio en `supabase/config.toml` para la función `tasks`.
   - La Edge Function debe crear el cliente de Supabase usando la clave publicable/anónima y reenviar el encabezado `Authorization` del usuario autenticado.
   - Prohibido usar `service_role` para operaciones normales de los usuarios.
4. **Protección de Secretos**:
   - `.gitignore` debe excluir `.env`, `.env.*` (excepto `!.env.example`), `node_modules/`, `.vercel/`, `supabase/.temp/`, `supabase/functions/.env` e `INSTRUCTIONS.md`.
   - Nunca incluir ni imprimir en consola contraseñas de PostgreSQL, tokens personales, ni claves `service_role`.
   - En el frontend solo se permiten `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`.

---

## 4. Reglas de Scripts Multiplataforma y Taller

1. **Multiplataforma**:
   - Los scripts en `scripts/` deben usar APIs estándar de Node.js (`child_process`, `fs`, `path`, `readline`) y funcionar en Windows 10/11, Linux y macOS sin requerir Bash ni PowerShell.
2. **Sin Docker obligatorio**:
   - El flujo del taller se ejecuta contra los proyectos remotos gratuitos de cada estudiante en Supabase y Vercel, sin exigir Docker ni ejecución local de contenedores de Supabase.
3. **Interactividad para Agentes de IA**:
   - Cualquier agente que trabaje en este repositorio debe consultar y mantener actualizados `AGENTS.md`, `docs/log.md` y `docs/specs/`, y realizar preguntas de forma interactiva cuando existan dudas.
