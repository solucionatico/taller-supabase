# Bitácora de Spec: `database-and-rls`

## [2026-11-20]
- **Cambio de estado**: `pending` -> `in-progress` -> `done`
- **Decisiones registradas**:
  - Se creó la migración `supabase/migrations/20261120000000_initial_schema.sql` con la definición de `public.tasks`, restricción `CHECK (char_length(trim(title)) > 0)` para evitar títulos vacíos, clave foránea hacia `auth.users(id)` e índice `idx_tasks_user_id`.
  - Se activó `ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY` y se definieron las 4 políticas para `authenticated` verificando `auth.uid() = user_id`.
  - Se creó `supabase/seed.sql` con comentarios didácticos explicando que las tareas reales dependen de usuarios registrados en `auth.users`.
