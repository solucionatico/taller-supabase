# Spec: `frontend-vue-app`

- **Estado**: `done`
- **Responsable**: Agente IA
- **Última actualización**: 2026-11-20

---

## 1. Objetivo

Desarrollar la aplicación web SPA en **Vue 3 + Vite + JavaScript** (`apps/web/`) que permita a los estudiantes registrar usuarios, iniciar y cerrar sesión, visualizar su perfil básico (nombre y correo) y gestionar sus tareas personales (listar, crear, marcar como completadas y eliminar) consumiendo la Edge Function `tasks`.

---

## 2. Requerimientos

1. Servicio centralizado de Supabase (`apps/web/src/services/supabase.js`) configurado exclusivamente con `import.meta.env.VITE_SUPABASE_URL` y `import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY`.
2. Servicio de consumo de la Edge Function (`apps/web/src/services/tasksApi.js`) utilizando `supabase.functions.invoke('tasks', { body })`.
3. Enrutador (`apps/web/src/router/index.js`) con rutas `/login`, `/register` y `/` (panel principal de tareas), con guardias de navegación que protejan la vista autenticada y redirijan usuarios ya autenticados.
4. Pantallas y componentes requeridos:
   - Pantalla de registro (`RegisterView.vue`) con nombre completo, correo y contraseña.
   - Pantalla de inicio de sesión (`LoginView.vue`).
   - Panel principal de tareas (`DashboardView.vue`) mostrando nombre y correo del usuario autenticado, contadores de estado (total, pendientes, completadas), filtros sencillos, formulario de creación, lista de tareas con acciones de completar y eliminar, indicadores de carga, mensajes de éxito/error y cierre de sesión.
5. Interfaz moderna, limpia, responsive y didáctica con HTML y CSS puro.

---

## 3. Razonamiento detrás de las Decisiones

- **Separación entre `services/supabase.js` y `services/tasksApi.js`**:
  - *Por qué*: Enseña a los estudiantes la separación de responsabilidades: `supabase.js` inicializa el SDK y gestiona la sesión de Auth, mientras que `tasksApi.js` encapsula todas las llamadas HTTP a la Edge Function `tasks` y centraliza el tratamiento de errores.
- **Uso de `supabase.functions.invoke('tasks', { body })`**:
  - *Por qué*: El método oficial `functions.invoke` del SDK de Supabase adjunta automáticamente el encabezado `Authorization: Bearer <access_token>` de la sesión activa del usuario autenticado, evitando errores manuales con `fetch` y mostrando la integración nativa entre Supabase Auth y Edge Functions.
- **Modo diagnóstico amigable si faltan variables `VITE_SUPABASE_*`**:
  - *Por qué*: Es muy común que un estudiante ejecute `npm run dev` antes de crear su archivo `.env`. En lugar de romper la aplicación con una pantalla en blanco, la interfaz muestra un aviso claro indicando qué variables faltan en `.env`.
