# Bitácora de Spec: `student-documentation`

## [2026-11-20]
- **Cambio de estado**: `pending` -> `in-progress` -> `done`
- **Decisiones registradas**:
  - Se redactó `README.md` con los 17 apartados exigidos, diagramas de arquitectura, tablas de referencia de comandos npm (todos sin `npx`), guía tanto con el asistente `npm run setup` como paso a paso manual, y enlaces a la documentación oficial de Supabase, Vercel, Vue 3 y Vite.
  - Se amplió la sección 6 (`Creación del proyecto Supabase`) de `README.md` detallando las 3 casillas de configuración de seguridad/Data API que presenta el asistente de creación de proyectos de Supabase (`Enable Data API`, `Grant API access to new tables automatically` y `Enable RLS on new tables automatically`) y qué significa RLS para los estudiantes.
  - Se mejoró la sección 7 (`Obtención de Project Ref y URL`) de `README.md` explicando explícitamente dónde se usa el `Reference ID` (Paso 9 `supabase link` y como parte de `VITE_SUPABASE_URL`) y sugiriendo crear el archivo `.env` en ese momento para ir pegando la URL y la Publishable Key sin sobrescribir el portapapeles.
  - Se actualizó la sección 9 (`Vinculación del proyecto Supabase`) de `README.md` aclarando que en Supabase CLI v2.x es normal que `supabase link` no solicite la contraseña de la base de datos porque utiliza directamente la sesión autenticada de `supabase login`.
  - Se enriqueció la sección 10 (`Cómo se crea la base de datos mediante migraciones`) de `README.md` explicando dónde se guarda el historial de migraciones (`supabase_migrations.schema_migrations` / `Database -> Migrations`), la diferencia entre PostgreSQL nativo y el gestor de migraciones de Supabase CLI, y el comando `npm run supabase -- migration new <nombre>` para crear nuevas migraciones.
  - Se agregó la sección 18 (`Anexo opcional: Ejecutar Supabase y las Edge Functions en local con Docker`) en `README.md` documentando el uso de `npm run supabase -- start` y `npm run supabase -- functions serve`, junto con la prioridad de `.env.local` sobre `.env` en Vite y soporte de URLs `http://` locales en `supabase.js` y `check-environment.js`.





