# Spec: `edge-function-tasks`

- **Estado**: `done`
- **Responsable**: Agente IA
- **Última actualización**: 2026-11-20

---

## 1. Objetivo

Implementar la API serverless del proyecto mediante una **Supabase Edge Function** llamada `tasks`, escrita en **JavaScript puro (`supabase/functions/tasks/index.js`)** sobre Deno Runtime, que gestione las operaciones CRUD (`list`, `create`, `update`, `delete`) exigiendo autenticación JWT y respetando las políticas RLS de PostgreSQL.

---

## 2. Requerimientos

1. Archivo `supabase/functions/tasks/index.js` escrito en JavaScript puro (sin TypeScript).
2. Configuración en `supabase/config.toml` con `verify_jwt = true` y `entrypoint = "./functions/tasks/index.js"`.
3. Soporte de CORS para solicitudes desde entorno local (`localhost`) y desde dominios de producción en Vercel.
4. Creación del cliente de Supabase con la clave publicable/anónima del entorno y reenvío del encabezado `Authorization` del usuario autenticado (nunca `service_role`).
5. Validación explícita del usuario autenticado y de los parámetros de cada `action` (`list`, `create`, `update`, `delete`).
6. Respuestas en formato JSON con códigos de estado HTTP apropiados (`200`, `201`, `400`, `401`, `404`, `405`, `500`).

---

## 3. Razonamiento detrás de las Decisiones

- **Un único endpoint con despacho por campo `action` en el cuerpo JSON**:
  - *Por qué*: Simplifica el despliegue y la comprensión para estudiantes principiantes (una sola función `tasks` que se despliega con `npm run supabase -- functions deploy tasks`), a la vez que enseña validación de payloads JSON, manejo de errores y códigos de estado HTTP.
- **Cliente de Supabase instanciado por petición con el header `Authorization` del usuario**:
  - *Por qué*: En una función serverless, compartir un cliente global con credenciales administrativas rompería el aislamiento por usuario. Al instanciar `createClient(supabaseUrl, supabaseKey, { global: { headers: { Authorization: authHeader } } })` dentro del handler usando la clave publicable, PostgreSQL recibe el JWT del usuario y aplica RLS automáticamente.
- **Compatibilidad dual de variable de entorno (`SUPABASE_PUBLISHABLE_KEY || SUPABASE_ANON_KEY`)**:
  - *Por qué*: Supabase inyecta variables de entorno predeterminadas en el runtime de Edge Functions. Soportar tanto `SUPABASE_PUBLISHABLE_KEY` como `SUPABASE_ANON_KEY` asegura que la función opere sin configuración manual adicional en cualquier proyecto Supabase nuevo o existente.
