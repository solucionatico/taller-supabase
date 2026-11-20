# Spec: `project-foundation`

- **Estado**: `done`
- **Responsable**: Agente IA
- **Última actualización**: 2026-11-20

---

## 1. Objetivo

Establecer la base del monorepo en la raíz del proyecto para alojar el frontend (`apps/web`), el backend y la base de datos (`supabase/`), los scripts de automatización (`scripts/`) y la documentación (`docs/`), utilizando exclusivamente **JavaScript con ES Modules** y las CLI de Supabase y Vercel instaladas como dependencias locales.

---

## 2. Requerimientos

1. Un único archivo `package.json` en la raíz con `"type": "module"` y `engines.node >= 22.0.0`.
2. Dependencias de producción: `vue`, `vue-router`, `@supabase/supabase-js`.
3. Dependencias de desarrollo: `vite`, `@vitejs/plugin-vue`, `supabase`, `vercel`.
4. Scripts npm que invoquen directamente los binarios locales sin `npx` ni instalaciones globales.
5. Configuración de Vite (`vite.config.js`) que ejecute el frontend en `apps/web`, lea variables `.env` desde la raíz y genere el build en `apps/web/dist`.
6. Archivo `.gitignore` que proteja secretos, archivos locales y excluya `INSTRUCTIONS.md`.

---

## 3. Razonamiento detrás de las Decisiones

- **`"type": "module"` en `package.json` y archivos `.js` sin `.mjs`**:
  - *Por qué*: Al declarar `"type": "module"` en la raíz, Node.js y Vite interpretan todos los archivos `.js` como ES Modules estándar (`import`/`export`). Esto evita mezclar extensiones `.mjs` y `.js` y cumple la directriz de usar ES Modules directamente desde la configuración.
- **CLI locales en `devDependencies` invocadas por `npm run`**:
  - *Por qué*: Cuando se ejecuta un script definido en `package.json`, `npm` añade automáticamente `./node_modules/.bin` al `PATH` del proceso. Así, `"supabase": "supabase"` y `"vercel": "vercel"` usan la versión exacta instalada en el proyecto sin contaminar el sistema operativo del estudiante ni depender de `npx`.
- **`envDir` apuntando a la raíz en `vite.config.js`**:
  - *Por qué*: Aunque el código fuente del frontend vive en `apps/web`, los estudiantes trabajan desde la raíz del monorepo y colocan su archivo `.env` en la raíz (copiado desde `.env.example`). Configurar `envDir` en la raíz evita confusiones de ubicación del archivo `.env`.
