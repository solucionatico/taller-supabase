# Taller: Herramientas Gratuitas de Despliegue (Supabase + Vercel)

Bienvenido al proyecto práctico del taller **Herramientas gratuitas de despliegue**. En este taller desarrollarás, configurarás y desplegarás una aplicación web **Full-Stack** de gestión de tareas personales utilizando servicios gratuitos en la nube (**Supabase** y **Vercel**) desde un **único repositorio Git** (Monorepo) y mediante sus herramientas de línea de comandos (CLI) oficiales instaladas localmente.

---

## Tabla de Contenidos

1. [Introducción y arquitectura](#1-introducción-y-arquitectura)
2. [Requisitos previos](#2-requisitos-previos)
3. [Instalación de Node.js y Git](#3-instalación-de-nodejs-y-git)
4. [Clonación del repositorio](#4-clonación-del-repositorio)
5. [Instalación de dependencias](#5-instalación-de-dependencias)
6. [Creación del proyecto Supabase](#6-creación-del-proyecto-supabase)
7. [Obtención de Project Ref y URL](#7-obtención-de-project-ref-y-url)
8. [Autenticación de Supabase CLI](#8-autenticación-de-supabase-cli)
9. [Vinculación del proyecto Supabase](#9-vinculación-del-proyecto-supabase)
10. [Cómo se crea la base de datos mediante migraciones](#10-cómo-se-crea-la-base-datos-mediante-migraciones)
11. [Configuración de Auth en Supabase](#11-configuración-de-auth-en-supabase)
12. [Creación y vinculación del proyecto Vercel](#12-creación-y-vinculación-del-proyecto-vercel)
13. [Configuración de variables de entorno](#13-configuración-de-variables-de-entorno)
14. [Despliegue completo](#14-despliegue-completo)
15. [Verificación del funcionamiento](#15-verificación-del-funcionamiento)
16. [Solución de errores frecuentes](#16-solución-de-errores-frecuentes)
17. [Explicación de seguridad y credenciales](#17-explicación-de-seguridad-y-credenciales)

---

## 1. Introducción y arquitectura

Esta aplicación permite que múltiples usuarios se registren, inicien sesión y gestionen sus propias tareas personales (consultar, crear, marcar como completadas y eliminar) con aislamiento total de datos entre usuarios.

### Arquitectura de la solución

```mermaid
flowchart LR
    subgraph Navegador ["Navegador del Estudiante / Usuario"]
        VueApp["SPA Vue 3 + Vite (JavaScript)"]
    end

    subgraph Vercel ["Vercel (Hosting Estático HTTPS)"]
        VercelCDN["Archivos HTML, CSS y JS compilados"]
    end

    subgraph Supabase ["Supabase (Backend Administrado)"]
        SupaAuth["Supabase Auth (Usuarios y JWT)"]
        EdgeFn["Edge Function: tasks (Deno JS)"]
        Postgres[("PostgreSQL + Row Level Security (public.tasks)")]
    end

    VercelCDN -->|Publica la SPA| VueApp
    VueApp -->|1. Registro / Login / Sesión| SupaAuth
    VueApp -->|2. Peticiones CRUD con Bearer JWT| EdgeFn
    EdgeFn -->|3. Consulta reenviando el JWT| Postgres
    Postgres -->|4. Verifica auth.uid() = user_id| EdgeFn
```

### ¿Qué papel cumple cada servicio?

- **Vercel**:
  - Aloja el frontend estático compilado de **Vue 3 + Vite** (`apps/web/dist`).
  - Publica los archivos HTML, CSS y JavaScript en una red global con una URL **HTTPS** gratuita.
- **Supabase**:
  - **Supabase Auth**: Gestiona el registro de usuarios, inicio de sesión y emisión de tokens **JWT**.
  - **Supabase Edge Functions (`supabase/functions/tasks/index.js`)**: Nuestra API serverless en **JavaScript** sobre **Deno Runtime**. Recibe las acciones (`list`, `create`, `update`, `delete`), valida el JWT del usuario y ejecuta las consultas en su nombre.
  - **PostgreSQL + Row Level Security (RLS)**: Almacena la tabla `public.tasks` y garantiza en el propio motor de base de datos que cada usuario solo pueda leer, crear, modificar o borrar sus propias tareas (`auth.uid() = user_id`).

### Características clave de este repositorio

- **Un único repositorio Git (Monorepo)**: Contiene el frontend (`apps/web`), la API (`supabase/functions`), las migraciones SQL (`supabase/migrations`) y los scripts de despliegue (`scripts/`).
- **100 % JavaScript con ES Modules**: Sin TypeScript ni servidores Node/Express persistentes.
- **Sin Docker**: No necesitas instalar ni ejecutar Docker en tu computador; trabajaremos directamente contra tus proyectos gratuitos en la nube de Supabase y Vercel.
- **Sin `npx` ni instalaciones globales**: Las CLI de Supabase y Vercel se instalan localmente dentro de `node_modules/.bin` y se ejecutan siempre mediante comandos `npm run`.

---

## 2. Requisitos previos

Antes de comenzar, asegúrate de contar con:

1. Un computador con **Windows 10/11**, **Linux** o **macOS**.
2. **Node.js 22 LTS** o superior (incluye `npm`).
3. **Git** instalado.
4. Una cuenta gratuita en **[Supabase](https://supabase.com/)**.
5. Una cuenta gratuita en **[Vercel](https://vercel.com/)**.

---

## 3. Instalación de Node.js y Git

> **[En tu Computador / Terminal]**

1. **Instalar Node.js (versión 22 LTS o superior)**:
   - Descarga el instalador oficial LTS desde [https://nodejs.org/](https://nodejs.org/).
   - Verifica la instalación en tu terminal:
     ```bash
     node -v
     npm -v
     ```
     *(La versión de `node -v` debe ser `v22.x.x` o superior).*

2. **Instalar Git**:
   - Descarga Git desde [https://git-scm.com/](https://git-scm.com/) si aún no lo tienes.
   - Verifica la instalación:
     ```bash
     git --version
     ```

---

## 4. Clonación del repositorio

> **[En tu Terminal]**

Clona el repositorio del taller y entra en la carpeta raíz del proyecto:

```bash
git clone <URL_DEL_REPOSITORIO> taller-supabase
cd taller-supabase
```

> **Importante**: Todos los comandos de este taller se ejecutan siempre desde la **raíz** de la carpeta `taller-supabase`.

---

## 5. Instalación de dependencias

> **[En tu Terminal]**

Instala todas las dependencias del frontend (Vue 3, Vite, `@supabase/supabase-js`) y las herramientas de línea de comandos locales (`supabase` y `vercel`):

```bash
npm install
```

Una vez finalizada la instalación, comprueba que tu entorno cumple todos los requisitos ejecutando:

```bash
npm run check
```

Verás un informe detallado confirmando que Node.js, `npm`, `node_modules`, los binarios locales de `supabase` y `vercel`, y los archivos del proyecto están listos.

---

## 6. Creación del proyecto Supabase

> **[En el Navegador — Supabase Dashboard]**

1. Inicia sesión en [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Haz clic en **"New project"** (Nuevo proyecto).
3. Selecciona tu organización y completa los datos:
   - **Name**: `taller-supabase` (o el nombre que prefieras).
   - **Database Password**: Escribe una contraseña segura y **guárdala en un lugar seguro** (la necesitarás en la terminal cuando vincules la CLI en el paso 9).
   - **Region**: Elige la región más cercana a tu ubicación.
4. Haz clic en **"Create new project"** y espera entre 1 y 2 minutos mientras Supabase aprovisiona tu base de datos PostgreSQL.

> **Nota importante**: **NO** necesitas crear ninguna base de datos ni tabla manualmente desde el Dashboard de Supabase. Supabase ya crea la base de datos PostgreSQL automáticamente y nosotros crearemos la tabla `public.tasks` y sus políticas de seguridad mediante migraciones SQL desde la terminal.

---

## 7. Obtención de Project Ref y URL

> **[En el Navegador — Supabase Dashboard]**

Una vez que tu proyecto esté activo en Supabase Dashboard:

1. **Obtener el `Project Ref` (Reference ID)**:
   - Ve a **Project Settings** (icono de engranaje en la barra lateral izquierda) -> **General**.
   - Copia el valor de **Reference ID** (es un código de 20 letras minúsculas, por ejemplo: `abcdefghijklmnopqrst`).
   - También puedes verlo en la URL del navegador: `https://supabase.com/dashboard/project/<TU_PROJECT_REF>`.

2. **Obtener la URL del proyecto (`VITE_SUPABASE_URL`) y la clave pública (`VITE_SUPABASE_PUBLISHABLE_KEY`)**:
   - En **Project Settings**, entra a **API Keys** (o **Data API**).
   - Copia la **Project URL**: tiene la forma `https://<tu-project-ref>.supabase.co`.
   - Copia la clave pública:
     - **Publishable key** (`sb_publishable_...`) o la clave **`anon` `public`** (`eyJ...`).
   - **ADVERTENCIA DE SEGURIDAD**: **Nunca** copies ni uses la clave `service_role` ni la `secret key` en el frontend.

---

## 8. Autenticación de Supabase CLI

> **[En tu Terminal]**

> **Tip**: Puedes ejecutar el asistente interactivo `npm run setup` para que te guíe automáticamente por los pasos 8, 9, 12 y 13, o ejecutar los comandos paso a paso como se muestra a continuación.

Para autenticar la CLI local de Supabase con tu cuenta:

```bash
npm run supabase -- login
```

1. La terminal mostrará un enlace o abrirá tu navegador automáticamente.
2. Autoriza el acceso en el navegador y, si te muestra un código de verificación o token, pégalo en la terminal y presiona `Enter`.

---

## 9. Vinculación del proyecto Supabase

> **[En tu Terminal]**

Vincula tu repositorio local con el proyecto remoto que creaste en Supabase reemplazando `<TU_PROJECT_REF>` por tu Reference ID real:

```bash
npm run supabase -- link --project-ref <TU_PROJECT_REF>
```

Cuando la CLI te solicite la contraseña de la base de datos (`Enter your database password`), escribe la **Database Password** que definiste en el paso 6 y presiona `Enter`.

---

## 10. Cómo se crea la base de datos mediante migraciones

En el desarrollo profesional no creamos tablas haciendo clic manualmente en una interfaz gráfica, porque eso dificulta repetir el despliegue o trabajar en equipo. En su lugar, usamos **Migraciones SQL versionadas**.

El archivo [`supabase/migrations/20261120000000_initial_schema.sql`](./supabase/migrations/20261120000000_initial_schema.sql) contiene todas las instrucciones SQL para:

1. Crear la tabla `public.tasks` con los campos `id`, `title`, `description`, `completed`, `user_id` (vinculado a `auth.users(id)` con valor por defecto `auth.uid()`) y `created_at`.
2. Crear los índices para acelerar las búsquedas por `user_id`.
3. Habilitar **Row Level Security (RLS)** en `public.tasks`.
4. Crear las 4 políticas de seguridad (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) que obligan a que `auth.uid() = user_id`.

> **[En tu Terminal]**

Para aplicar esta migración en tu base de datos remota de Supabase, ejecuta:

```bash
npm run deploy:db
```

Si la CLI te pregunta si deseas aplicar la migración pendiente (`Do you want to push these migrations to the remote database?`), responde `Y` y presiona `Enter`.

---

## 11. Configuración de Auth en Supabase

> **[En el Navegador — Supabase Dashboard]**

1. En tu proyecto de Supabase, ve al menú lateral **Authentication** -> **Providers**.
2. Asegúrate de que el proveedor **Email** esté habilitado (`Enabled`).
3. **Configuración recomendada para la práctica del taller**:
   - Dentro de **Authentication** -> **Providers** -> **Email**, verás la opción **"Confirm email"**.
   - Para agilizar la práctica durante el taller (y evitar límites de envío de correos de prueba), puedes **desactivar temporalmente "Confirm email"** y hacer clic en **Save**. Así los estudiantes podrán registrarse e iniciar sesión inmediatamente.
   - *(Nota para producción: En una aplicación real en producción, "Confirm email" debe mantenerse activo junto con un proveedor SMTP personalizado).*

---

## 12. Creación y vinculación del proyecto Vercel

No es necesario conectar tu cuenta de GitHub con Vercel ni configurar comandos de compilación en el Dashboard de Vercel. El archivo [`vercel.json`](./vercel.json) en la raíz ya le indica a Vercel cómo compilar Vite (`npm run build`), qué carpeta publicar (`apps/web/dist`) y cómo servir las rutas de la SPA.

> **[En tu Terminal]**

1. **Iniciar sesión en Vercel CLI**:
   ```bash
   npm run vercel -- login
   ```
   Sigue las instrucciones en pantalla para autorizar la sesión en tu navegador.

2. **Vincular y crear el proyecto en Vercel**:
   ```bash
   npm run vercel -- link
   ```
   Responde a las preguntas interactivas de la terminal:
   - `Set up "<ruta>/taller-supabase"?` -> **`Y`**
   - `Which scope should contain your project?` -> Selecciona tu cuenta personal de Vercel.
   - `Link to existing project?` -> **`N`** (para crear un proyecto nuevo).
   - `What’s your project’s name?` -> Presiona `Enter` para aceptar `taller-supabase` (o escribe un nombre).
   - `In which directory is your code located?` -> Presiona `Enter` para dejar `./` (la raíz).
   - Si pregunta si deseas modificar ajustes de compilación (`Want to modify these settings?`), responde **`N`** (ya están definidos en `vercel.json`).

---

## 13. Configuración de variables de entorno

Nuestra aplicación Vue 3 necesita dos variables públicas para saber a qué proyecto de Supabase conectarse:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

### 13.1. Variables para desarrollo local (archivo `.env`)

> **[En tu Computador / Terminal]**

1. Si usaste `npm run setup`, el archivo `.env` ya habrá sido creado. Si no, copia la plantilla `.env.example` a `.env`:
   - En Linux / macOS:
     ```bash
     cp .env.example .env
     ```
   - En Windows (CMD):
     ```cmd
     copy .env.example .env
     ```
2. Abre el archivo `.env` en tu editor y coloca tus valores reales obtenidos en el paso 7:
   ```env
   VITE_SUPABASE_URL=https://tu-project-ref.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=tu-clave-publicable-o-anon-key
   ```

Ahora puedes probar la aplicación localmente en tu computador con:

```bash
npm run dev
```

Abre `http://localhost:5173` en tu navegador.

### 13.2. Variables para producción en Vercel

Para que el frontend desplegado en Vercel también conozca estas dos variables al compilarse, puedes añadirlas desde el Dashboard de Vercel o directamente desde la terminal:

- **Opción A — Desde la Terminal (con Vercel CLI)**:
  ```bash
  npm run vercel -- env add VITE_SUPABASE_URL production
  npm run vercel -- env add VITE_SUPABASE_PUBLISHABLE_KEY production
  ```
  *(Pega el valor correspondiente cuando la terminal lo solicite y presiona `Enter`).*

- **Opción B — Desde el Navegador (Vercel Dashboard)**:
  1. Abre tu proyecto en [https://vercel.com/dashboard](https://vercel.com/dashboard).
  2. Ve a **Settings** -> **Environment Variables**.
  3. Añade `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` marcando los entornos (`Production`, `Preview`, `Development`) y haz clic en **Save**.

---

## 14. Despliegue completo

> **[En tu Terminal]**

Una vez vinculado tu proyecto con Supabase y Vercel y configuradas las variables de entorno, puedes desplegar **toda la arquitectura** (verificación de entorno + migraciones SQL + Edge Functions + Frontend en Vercel) con un solo comando:

```bash
npm run deploy
```

### ¿Qué hace internamente `npm run deploy`?

Ejecuta secuencialmente 4 etapas y se detiene si alguna falla:
1. **`npm run check`**: Verifica tu entorno Node.js, dependencias y archivos de configuración.
2. **`npm run deploy:db`**: Aplica las migraciones SQL pendientes en PostgreSQL (`supabase db push`).
3. **`npm run deploy:api`**: Despliega automáticamente las Edge Functions en `supabase/functions/` (`supabase functions deploy tasks`).
4. **`npm run deploy:web`**: Compila y publica el frontend Vue/Vite en modo producción en Vercel (`vercel --prod`).

### Comandos individuales disponibles

También puedes ejecutar cada etapa por separado cuando lo necesites:

| Comando | Descripción |
| :--- | :--- |
| `npm run check` | Comprueba versiones de Node/npm, dependencias locales y archivos del proyecto |
| `npm run setup` | Asistente interactivo de configuración e inicio de sesión en las CLI |
| `npm run dev` | Inicia el servidor de desarrollo local de Vite (`http://localhost:5173`) |
| `npm run build` | Genera el compilado estático de producción en `apps/web/dist` |
| `npm run deploy:db` | Aplica las migraciones SQL en la base de datos remota de Supabase |
| `npm run deploy:api` | Despliega todas las Edge Functions (`tasks`) en Supabase |
| `npm run supabase -- functions deploy tasks` | Despliega específicamente la Edge Function `tasks` |
| `npm run deploy:web` | Despliega el frontend en Vercel en modo producción (`--prod`) |
| `npm run deploy` | Ejecuta el flujo completo de despliegue (entorno + BD + API + Web) |

---

## 15. Verificación del funcionamiento

Cuando termine `npm run deploy`, Vercel mostrará en la terminal tu URL pública de producción (por ejemplo, `https://taller-supabase-tuusuario.vercel.app`).

Realiza las siguientes pruebas tanto en local (`npm run dev`) como en la URL de producción de Vercel:

1. **Registro de usuario**:
   - Entra a **"Regístrate aquí"** (`/register`).
   - Crea un Usuario A con tu nombre, correo y contraseña (mínimo 6 caracteres).
2. **Visualización de perfil**:
   - Comprueba que en la barra superior y en la tarjeta de bienvenida aparecen tu **nombre** y **correo electrónico**.
3. **Creación y listado de tareas**:
   - Crea 2 o 3 tareas usando el formulario **"Crear nueva tarea"**.
   - Verifica que aparecen inmediatamente en la lista y que los contadores (**Total**, **Pendientes**, **Completadas**) se actualizan.
4. **Actualización y eliminación**:
   - Marca una tarea como completada y verifica que cambia su estado a **"Completada"**.
   - Elimina una tarea con el botón **"Eliminar"** y comprueba que desaparece.
5. **Verificación de aislamiento con Row Level Security (RLS)**:
   - Haz clic en **"Cerrar sesión"**.
   - Registra un **Usuario B** con otro correo electrónico.
   - Comprueba que la lista de tareas del Usuario B aparece **completamente vacía** y no puede ver ni modificar las tareas del Usuario A.
   - Si abres **Table Editor** -> `tasks` en Supabase Dashboard, verás las tareas de ambos usuarios cada una con su respectivo `user_id`.

---

## 16. Solución de errores frecuentes

### 1. Aviso amarillo `"Configuración pendiente (.env)"` al abrir la app
- **Causa**: No existe el archivo `.env` en la raíz o aún tiene los textos de ejemplo (`tu-project-ref.supabase.co`).
- **Solución**: Edita `.env` con tu `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` reales y reinicia `npm run dev`. Si te ocurre en Vercel, añade las variables en Vercel (`Settings -> Environment Variables`) y vuelve a ejecutar `npm run deploy:web`.

### 2. Error `"Tu correo electrónico aún no ha sido confirmado"` al iniciar sesión
- **Causa**: En Supabase Auth está activada la opción `"Confirm email"` y no has hecho clic en el enlace enviado por correo.
- **Solución**: Revisa tu correo electrónico o ve a Supabase Dashboard -> **Authentication** -> **Providers** -> **Email**, desactiva **"Confirm email"**, guarda los cambios y registra un nuevo usuario de prueba.

### 3. Error `"No se pudo contactar con la Edge Function tasks"`
- **Causa**: Aún no se ha desplegado la Edge Function en tu proyecto de Supabase.
- **Solución**: Ejecuta en la terminal:
  ```bash
  npm run deploy:api
  ```

### 4. Error `"relation public.tasks does not exist"` al listar o crear tareas
- **Causa**: La migración SQL aún no se ha aplicado en la base de datos remota.
- **Solución**: Ejecuta en la terminal:
  ```bash
  npm run deploy:db
  ```

### 5. Error de versión de Node.js en `npm run check`
- **Causa**: Tienes instalada una versión de Node.js anterior a la 22.
- **Solución**: Instala Node.js 22 LTS o superior desde [https://nodejs.org/](https://nodejs.org/) y vuelve a abrir la terminal.

---

## 17. Explicación de seguridad y credenciales

Comprender cómo funcionan las credenciales en una arquitectura moderna con Supabase y Vercel es uno de los aprendizajes más importantes de este taller:

### 1. Clave Publicable (`VITE_SUPABASE_PUBLISHABLE_KEY` / `anon public`) vs. Clave Secreta (`service_role` / `secret`)
- **Clave Publicable (`publishable` / `anon`)**:
  - Está diseñada para incluirse en aplicaciones frontend (navegador, móvil).
  - Por sí sola solo tiene permisos de rol anónimo (`anon`) o autenticado (`authenticated` cuando va acompañada del JWT del usuario).
  - **Está siempre sujeta a las políticas Row Level Security (RLS)** de PostgreSQL.
- **Clave Secreta (`service_role` / `sb_secret_...`)**:
  - Tiene privilegios administrativos totales y **se salta todas las políticas RLS**.
  - **NUNCA** debe colocarse en el archivo `.env` del frontend, ni en variables `VITE_`, ni subirse a Git.

### 2. ¿Por qué Row Level Security (RLS) es indispensable?
Como la URL de Supabase y la clave publicable viajan al navegador del usuario, cualquier persona podría abrir las herramientas de desarrollador del navegador e intentar hacer consultas directas a la API.
- Gracias a que activamos `ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;` y creamos políticas que exigen `auth.uid() = user_id`, **es el propio motor PostgreSQL quien verifica criptográficamente el token JWT** en cada operación.
- Incluso en nuestra Edge Function (`supabase/functions/tasks/index.js`), creamos el cliente de Supabase usando la clave publicable y reenviando el encabezado `Authorization` del usuario, de modo que ni siquiera la Edge Function usa permisos administrativos para las operaciones normales.

### 3. Archivos protegidos con `.gitignore`
El archivo [`.gitignore`](./.gitignore) está configurado para impedir que se suban por accidente al repositorio:
- Archivos de variables de entorno (`.env`, `.env.*`, `supabase/functions/.env`).
- Sesiones y metadatos locales de vinculación (`.vercel/`, `supabase/.temp/`).
- Dependencias locales (`node_modules/`).

---

## Enlaces a Documentación Oficial

- [Documentación oficial de Supabase](https://supabase.com/docs)
- [Supabase Auth — Guía de Autenticación](https://supabase.com/docs/guides/auth)
- [Supabase Row Level Security (RLS)](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Documentación oficial de Vercel CLI](https://vercel.com/docs/cli)
- [Documentación oficial de Vue 3](https://vuejs.org/)
- [Documentación oficial de Vite](https://vite.dev/)
