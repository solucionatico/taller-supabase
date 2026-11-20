# Bitácora General del Proyecto (`docs/log.md`)

En este archivo se registran cronológicamente todas las actividades, decisiones de diseño e hitos completados durante la construcción y mantenimiento del proyecto **taller-supabase**.

---

## [2026-11-20] Inicialización y Construcción Completa del Proyecto

### 1. Análisis de Requerimientos y Estructura Documental
- **Acción**: Lectura completa de las especificaciones del taller (`INSTRUCTIONS.md`) y diseño de la arquitectura documental para agentes de IA y desarrolladores.
- **Decisiones tomadas**:
  - Se creó `AGENTS.md` en la raíz con enlaces simbólicos `CLAUDE.md` y `GEMINI.md` apuntando a `AGENTS.md` para garantizar compatibilidad con cualquier asistente de IA.
  - Se estructuró la carpeta `docs/` con archivos separados para arquitectura (`docs/architecture.md`), reglas (`docs/rules.md`), bitácora general (`docs/log.md`) y especificaciones modulares en `docs/specs/` en formato `kebab-case`, cada una con su `spec.md` y `log.md`.
  - Se adoptó `"type": "module"` en `package.json` para utilizar ES Modules de forma nativa con extensión `.js` en todo el repositorio (incluyendo `scripts/`), evitando extensiones `.mjs` y prohibiendo estrictamente TypeScript (`.ts`).

### 2. Configuración del Monorepo y Dependencias (`project-foundation`)
- **Acción**: Creación de `package.json`, `.gitignore`, `.env.example` y `vite.config.js`.
- **Decisiones tomadas**:
  - Se definieron las dependencias de producción (`vue`, `vue-router`, `@supabase/supabase-js`) y de desarrollo (`vite`, `@vitejs/plugin-vue`, `supabase`, `vercel`).
  - Se configuró `engines.node` en `>=22.0.0` (verificado con Node.js `v22.22.0`).
  - Todos los scripts de `package.json` invocan binarios locales desde `node_modules/.bin` o mediante `npm run`, sin utilizar `npx` ni instalaciones globales.
  - Se incluyó `INSTRUCTIONS.md` en `.gitignore` tal como fue solicitado en la sección 12 de las instrucciones iniciales.

### 3. Base de Datos y Políticas RLS (`database-and-rls`)
- **Acción**: Creación de `supabase/config.toml`, `supabase/migrations/20261120000000_initial_schema.sql` y `supabase/seed.sql`.
- **Decisiones tomadas**:
  - La tabla `public.tasks` define `user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE`, asegurando que la identidad del propietario provenga directamente del token JWT validado por PostgreSQL.
  - Se habilitaron cuatro políticas RLS independientes (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) restringidas a `TO authenticated` y validadas con `auth.uid() = user_id`.

### 4. Backend Serverless con Supabase Edge Functions (`edge-function-tasks`)
- **Acción**: Implementación de `supabase/functions/tasks/index.js` y configuración en `supabase/config.toml`.
- **Decisiones tomadas**:
  - Se configuró `entrypoint = "./functions/tasks/index.js"` y `verify_jwt = true` en `supabase/config.toml` para que Supabase ejecute directamente el archivo JavaScript y exija un JWT válido.
  - La función soporta compatibilidad tanto con `SUPABASE_PUBLISHABLE_KEY` como con `SUPABASE_ANON_KEY` (variables inyectadas automáticamente por el runtime de Supabase Edge Functions).
  - La función reenvía el encabezado `Authorization` del usuario al cliente de Supabase para que PostgreSQL evalúe las políticas RLS de ese usuario específico.
  - Se implementó soporte completo de CORS (`Access-Control-Allow-Origin: *`) y manejo de las acciones `list`, `create`, `update` y `delete` con códigos HTTP semánticos (`200`, `201`, `400`, `401`, `404`, `405`, `500`).

### 5. Aplicación Frontend en Vue 3 + Vite (`frontend-vue-app`)
- **Acción**: Creación de `apps/web/index.html` y todos los módulos en `apps/web/src/`.
- **Decisiones tomadas**:
  - Se configuró Vite (`vite.config.js`) en la raíz apuntando a `root: 'apps/web'`, `envDir: process.cwd()` (para leer `.env` desde la raíz del monorepo) y `build.outDir: 'dist'` (generando `apps/web/dist`).
  - Se centralizó el cliente de Supabase en `apps/web/src/services/supabase.js` con detección amigable cuando faltan variables de entorno para guiar al estudiante.
  - Se centralizó el consumo de la Edge Function `tasks` en `apps/web/src/services/tasksApi.js`.
  - Se implementaron las vistas `LoginView.vue`, `RegisterView.vue` y `DashboardView.vue`, junto con componentes reutilizables (`AppNavbar.vue`, `TaskForm.vue`, `TaskItem.vue`, `StatusBanner.vue`), estados de carga, indicadores de progreso y mensajes de éxito/error.

### 6. Scripts Multiplataforma y Configuración de Vercel (`cli-automation-scripts` y `vercel-and-deployment`)
- **Acción**: Implementación de `scripts/check-environment.js`, `scripts/setup.js`, `scripts/deploy-functions.js`, `scripts/deploy.js` y `vercel.json`.
- **Decisiones tomadas**:
  - Se utilizó `spawnSync` con resolución multiplataforma (`process.platform === 'win32'`) e `inherit` en `stdio` para que los estudiantes vean en tiempo real la salida de las CLI y puedan interactuar cuando se les soliciten credenciales.
  - `vercel.json` configura `buildCommand: "npm run build"`, `outputDirectory: "apps/web/dist"` y `rewrites` hacia `/index.html` para soporte completo de rutas SPA.

### 7. Documentación Didáctica para Estudiantes (`student-documentation`)
- **Acción**: Redacción integral de `README.md` en español con los 17 apartados pedagógicos requeridos, diferenciando acciones en Dashboard vs. Terminal, explicando RLS, Auth y solución de problemas frecuentes.

### 8. Verificación del Entorno y Compilación
- **Acción**: Ejecución de `npm install`, `npm run check`, `npm run build` y validación de binarios locales de `supabase` y `vercel`.
- **Resultados verificados**:
  - `npm install`: 277 paquetes instalados localmente y `package-lock.json` generado sin errores.
  - `npm run check`: Verificación exitosa de Node.js `v22.22.0`, `npm v11.11.0`, binarios locales en `node_modules/.bin` y todos los archivos del monorepo.
  - `npm run build`: Compilación de producción de Vite + Vue 3 generada en `apps/web/dist` sin errores (`index.html`, CSS y bundle JS).
  - `npm run supabase -- --version`: `2.122.1` (binario local, validación de `supabase/config.toml` correcta).
  - `npm run vercel -- --version`: `41.7.8` (binario local).
  - `.gitignore`: Verificado con `git status` que `node_modules/`, `apps/web/dist/` e `INSTRUCTIONS.md` quedan excluidos de Git.

### 9. Ampliación Didáctica de la Sección 6 en `README.md`
- **Acción**: Se documentaron en `README.md` las opciones de **Data API y RLS** que aparecen al crear un proyecto en el Dashboard de Supabase (`Enable Data API`, `Grant API access to new tables automatically` y `Enable RLS on new tables automatically`).

### 10. Aclaración del Uso del `Reference ID` en la Sección 7 de `README.md`
- **Acción**: Se actualizó la sección 7 de `README.md` para explicar qué hacer inmediatamente con el `Reference ID` (usarlo en el Paso 9 al ejecutar `npm run supabase -- link --project-ref <TU_PROJECT_REF>` y para formar `VITE_SUPABASE_URL`) y cómo guardar de una vez las variables en `.env` para no perderlas del portapapeles.

### 11. Aclaración sobre Contraseña de BD en `supabase link` (Sección 9 de `README.md`)
- **Acción**: Se documentó en la sección 9 de `README.md` que en Supabase CLI v2.x es normal que `supabase link` finalice sin pedir la contraseña de la base de datos gracias al uso de la sesión activa de `supabase login`.

### 12. Explicación Pedagógica del Sistema de Migraciones (Sección 10 de `README.md`)
- **Acción**: Se añadió en la sección 10 de `README.md` la explicación sobre la tabla de control `supabase_migrations.schema_migrations`, qué aporta Supabase CLI sobre PostgreSQL y cómo crear nuevas migraciones con `npm run supabase -- migration new <nombre>`.

### 13. Actualización de Vercel CLI al Nuevo Flujo de Autenticación
- **Acción**: Se actualizó `vercel` en `package.json` y `package-lock.json` a la última versión estable para utilizar el nuevo flujo de autenticación por navegador (OAuth Device Login), ya que Vercel retiró el flujo antiguo (HTTP 410 en v41).

### 14. Anexo Opcional de Desarrollo Local con Docker y Soporte `.env.local`
- **Acción**: Se añadió la sección 18 en `README.md` explicando el flujo opcional de desarrollo 100 % local (`npm run supabase -- start` y `npm run supabase -- functions serve`) y cómo aprovechar `.env.local` para sobrescribir temporalmente `.env`. Además, se ajustaron `apps/web/src/services/supabase.js` y `scripts/check-environment.js` para admitir URLs locales `http://127.0.0.1:54321` además de `https://`.







