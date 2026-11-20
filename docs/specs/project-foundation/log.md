# Bitácora de Spec: `project-foundation`

## [2026-11-20]
- **Cambio de estado**: `pending` -> `in-progress` -> `done`
- **Decisiones registradas**:
  - Se definió `"type": "module"` en `package.json` para que todos los scripts en `scripts/*.js` y configuraciones como `vite.config.js` utilicen `import`/`export` sin requerir extensión `.mjs`.
  - Se fijó `"engines": { "node": ">=22.0.0" }` para asegurar compatibilidad con las versiones actuales de Supabase CLI y Vercel CLI.
  - Se configuró `.gitignore` incluyendo `node_modules/`, `.env`, `.env.*`, `!.env.example`, `.vercel/`, `**/.vercel/`, `supabase/.temp/`, `supabase/functions/.env`, `apps/web/dist/` e `INSTRUCTIONS.md`.
