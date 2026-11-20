# Bitácora de Spec: `cli-automation-scripts`

## [2026-11-20]
- **Cambio de estado**: `pending` -> `in-progress` -> `done`
- **Decisiones registradas**:
  - Se implementaron `scripts/check-environment.js`, `scripts/setup.js`, `scripts/deploy-functions.js` y `scripts/deploy.js` utilizando exclusivamente módulos nativos de Node.js (`node:fs`, `node:path`, `node:child_process`, `node:readline/promises`, `node:url`).
  - En `scripts/check-environment.js` la ausencia de `.env` se reporta como advertencia informativa (no bloqueante para `npm run check` tras clonar), mientras que se valida si está presente que contenga las claves públicas esperadas y ninguna clave privada (`service_role`).
