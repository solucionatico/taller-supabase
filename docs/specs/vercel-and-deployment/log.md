# Bitácora de Spec: `vercel-and-deployment`

## [2026-11-20]
- **Cambio de estado**: `pending` -> `in-progress` -> `done`
- **Decisiones registradas**:
  - Se creó `vercel.json` en la raíz con `framework: "vite"`, `installCommand: "npm install"`, `buildCommand: "npm run build"`, `outputDirectory: "apps/web/dist"` y regla `rewrites` de `/(.*)` a `/index.html`.
  - Se vinculó el script `"deploy:web": "npm run vercel -- --prod"` en `package.json`.
