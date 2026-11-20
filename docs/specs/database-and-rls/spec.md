# Spec: `database-and-rls`

- **Estado**: `done`
- **Responsable**: Agente IA
- **Última actualización**: 2026-11-20

---

## 1. Objetivo

Definir el esquema de base de datos PostgreSQL para la gestión de tareas personales mediante migraciones SQL versionadas e idempotentes en `supabase/migrations/`, aplicando **Row Level Security (RLS)** para aislar completamente los datos de cada usuario autenticado.

---

## 2. Requerimientos

1. Tabla `public.tasks` con columnas:
   - `id`: `BIGINT`, identidad autoincremental, Primary Key.
   - `title`: `TEXT`, obligatorio (`NOT NULL`).
   - `description`: `TEXT`, opcional.
   - `completed`: `BOOLEAN`, predeterminado `FALSE`.
   - `user_id`: `UUID`, referencia a `auth.users(id)`, obligatorio, predeterminado `auth.uid()`.
   - `created_at`: `TIMESTAMPTZ`, predeterminado `NOW()`.
2. Índice sobre `user_id` para optimizar las consultas filtradas por usuario.
3. Row Level Security (RLS) habilitado en `public.tasks`.
4. Políticas RLS para `SELECT`, `INSERT`, `UPDATE` y `DELETE` basadas estrictamente en `auth.uid() = user_id`.

---

## 3. Razonamiento detrás de las Decisiones

- **`user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE`**:
  - *Por qué*: Al asignar `DEFAULT auth.uid()`, PostgreSQL extrae directamente el UUID del usuario desde el token JWT verificado en la sesión actual, evitando que el cliente tenga que enviar su `user_id` o pueda suplantar a otro usuario. Además, `ON DELETE CASCADE` mantiene la integridad referencial si se elimina un usuario en Supabase Auth.
- **Cuatro políticas RLS granulares (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) para el rol `authenticated`**:
  - *Por qué*: Separar las políticas por operación (`FOR SELECT USING`, `FOR INSERT WITH CHECK`, `FOR UPDATE USING ... WITH CHECK`, `FOR DELETE USING`) es una buena práctica de seguridad en PostgreSQL y resulta mucho más didáctico para que los estudiantes comprendan cómo funciona cada permiso en RLS.
- **Idempotencia en la migración (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `DROP POLICY IF EXISTS`)**:
  - *Por qué*: Garantiza que si un estudiante reejecuta o inspecciona el script SQL durante el taller, no se produzcan fallos por objetos duplicados.
