# Spec: `cli-automation-scripts`

- **Estado**: `done`
- **Responsable**: Agente IA
- **Última actualización**: 2026-11-20

---

## 1. Objetivo

Proporcionar scripts multiplataforma en JavaScript para Node.js (`scripts/`) que verifiquen el entorno de desarrollo, guíen interactivamente la configuración inicial y automaticen el despliegue de base de datos, Edge Functions y frontend utilizando los binarios locales de `node_modules/.bin` sin `npx`.

---

## 2. Requerimientos

1. `scripts/check-environment.js`:
   - Verificar Node.js >= 22, disponibilidad de `npm`, existencia de `node_modules`, binarios locales de `supabase` y `vercel`, y archivos críticos del repositorio.
   - Mostrar mensajes claros con instrucciones de solución en caso de error.
2. `scripts/setup.js`:
   - Asistente interactivo en consola que compruebe requisitos, explique cómo crear el proyecto en Supabase, solicite el `Project Ref`, cree/actualice `.env` con las variables públicas (`VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`), ejecute `supabase login`, vincule el proyecto remoto (`supabase link --project-ref <ref>`), ejecute `vercel login`, vincule el proyecto en Vercel (`vercel link`) y resuma los pasos finales.
   - Nunca almacenar ni imprimir contraseñas ni tokens secretos.
3. `scripts/deploy-functions.js`:
   - Escanear `supabase/functions/`, filtrar carpetas que comiencen por `_`, y desplegar cada función individualmente mediante la CLI local de Supabase. Detener la ejecución si alguna función falla.
4. `scripts/deploy.js`:
   - Ejecutar secuencialmente: comprobación del entorno, `db push`, despliegue de Edge Functions y despliegue del frontend a producción en Vercel (`vercel --prod`), heredando la entrada/salida estándar (`stdio: 'inherit'`).

---

## 3. Razonamiento detrás de las Decisiones

- **Resolución directa del binario local o vía `npm run` con `stdio: 'inherit'`**:
  - *Por qué*: Tanto `supabase` como `vercel` pueden solicitar confirmación o credenciales de forma interactiva en la terminal. Usar `spawnSync` con `stdio: 'inherit'` permite que el estudiante vea el progreso en tiempo real con colores e interactúe directamente con la CLI en Windows, Linux y macOS.
- **Compatibilidad Windows (`shell: process.platform === 'win32'`)**:
  - *Por qué*: En Windows, los binarios en `node_modules/.bin` y `npm` son wrappers `.cmd`. Configurar `shell: process.platform === 'win32'` en `spawnSync` garantiza que los scripts funcionen sin errores `EINVAL` o `ENOENT` en Windows 10/11 además de Linux y macOS.
