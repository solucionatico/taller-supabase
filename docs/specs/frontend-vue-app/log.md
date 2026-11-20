# Bitácora de Spec: `frontend-vue-app`

## [2026-11-20]
- **Cambio de estado**: `pending` -> `in-progress` -> `done`
- **Decisiones registradas**:
  - Se estructuró `apps/web/src/` en `assets/`, `components/`, `router/`, `services/` y `views/`.
  - En el registro (`RegisterView.vue`) se envía `options: { data: { full_name: fullName } }` a `supabase.auth.signUp`, permitiendo almacenar y recuperar el nombre del estudiante en `user.user_metadata.full_name` sin necesidad de una tabla de perfiles adicional.
  - Se manejó tanto el flujo con confirmación de correo deshabilitada (inicio de sesión inmediato para el taller) como el flujo con confirmación de correo habilitada (mostrando un mensaje informativo claro al estudiante).
