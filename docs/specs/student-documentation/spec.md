# Spec: `student-documentation`

- **Estado**: `done`
- **Responsable**: Agente IA
- **Última actualización**: 2026-11-20

---

## 1. Objetivo

Crear una guía didáctica integral en español (`README.md`) diseñada para estudiantes principiantes que participan en el taller **"Herramientas gratuitas de despliegue"**, cubriendo desde la instalación de herramientas hasta el despliegue completo en Supabase y Vercel, verificación y resolución de problemas.

---

## 2. Requerimientos

Incluir los 17 apartados obligatorios:
1. Introducción y arquitectura.
2. Requisitos previos.
3. Instalación de Node.js y Git.
4. Clonación del repositorio.
5. Instalación de dependencias.
6. Creación del proyecto Supabase.
7. Obtención de Project Ref y URL.
8. Autenticación de Supabase CLI.
9. Vinculación del proyecto.
10. Cómo se crea la base de datos mediante migraciones.
11. Configuración de Auth (incluyendo nota pedagógica sobre confirmación de correo durante el taller).
12. Creación del proyecto Vercel.
13. Configuración de variables de entorno (locales en `.env` y remotas en Vercel).
14. Despliegue completo (`npm run deploy` y comandos individuales).
15. Verificación del funcionamiento.
16. Solución de errores frecuentes.
17. Explicación de seguridad y credenciales (Publishable Key vs Secret/Service Role y el papel indispensable de RLS).

---

## 3. Razonamiento detrás de las Decisiones

- **Distinción visual clara entre acciones `[En el Navegador / Dashboard]` y `[En tu Terminal]`**:
  - *Por qué*: Uno de los mayores puntos de confusión para estudiantes principiantes es distinguir qué pasos se hacen en la página web de Supabase/Vercel y cuáles en la consola de comandos.
- **Explicación de por qué no se usa Docker ni creación manual de tablas**:
  - *Por qué*: Reduce la barrera de entrada en equipos de laboratorio o portátiles estudiantiles con recursos limitados, enseñando a la vez buenas prácticas de Infraestructura/Base de datos como código mediante migraciones SQL (`deploy:db`).
