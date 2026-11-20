# Spec: `vercel-and-deployment`

- **Estado**: `done`
- **Responsable**: Agente IA
- **Última actualización**: 2026-11-20

---

## 1. Objetivo

Configurar el despliegue del frontend estático (Vue 3 + Vite) en Vercel mediante `vercel.json` en la raíz del monorepo, de modo que el estudiante pueda publicar su aplicación a producción con un solo comando (`npm run deploy:web` o `npm run deploy`) sin configurar comandos manualmente en el Dashboard de Vercel ni conectar GitHub.

---

## 2. Requerimientos

1. Archivo `vercel.json` en la raíz del repositorio.
2. Ejecución automática del build de Vite desde la raíz (`npm run build`).
3. Publicación del directorio de salida `apps/web/dist`.
4. Regla de reescritura (`rewrites`) para servir la aplicación como Single Page Application (SPA), redirigiendo rutas del cliente (`/login`, `/register`, etc.) hacia `/index.html`.

---

## 3. Razonamiento detrás de las Decisiones

- **`outputDirectory: "apps/web/dist"` y `buildCommand: "npm run build"` en `vercel.json`**:
  - *Por qué*: Al tratarse de un monorepo donde `index.html` reside en `apps/web/`, definir explícitamente `buildCommand` y `outputDirectory` en `vercel.json` permite que Vercel CLI compile y publique el frontend sin que el estudiante tenga que modificar ajustes de "Root Directory" o "Output Directory" en la interfaz web de Vercel.
- **`rewrites` hacia `/index.html`**:
  - *Por qué*: Vue Router utiliza `createWebHistory()` para URLs limpias (`/login`, `/register`). Si un usuario recarga la página en `/login`, el servidor estático de Vercel debe devolver `/index.html` en lugar de un error 404.
