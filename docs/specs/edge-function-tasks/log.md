# Bitácora de Spec: `edge-function-tasks`

## [2026-11-20]
- **Cambio de estado**: `pending` -> `in-progress` -> `done`
- **Decisiones registradas**:
  - Se utilizó `Deno.serve` nativo en `supabase/functions/tasks/index.js` e importación de `@supabase/supabase-js` mediante especificador `npm:@supabase/supabase-js@2` compatible con Deno en Supabase Edge Functions.
  - Se configuró `supabase/config.toml` con `[functions.tasks]`, `verify_jwt = true` y `entrypoint = "./functions/tasks/index.js"` para soportar JavaScript directamente sin TypeScript.
  - Se validó explícitamente que en la acción `create` no se tome ningún `user_id` del cuerpo de la petición, sino `user.id` verificado por `supabase.auth.getUser()` junto con el valor por defecto `auth.uid()` de la base de datos.
