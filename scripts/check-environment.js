import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '..');

const MIN_NODE_MAJOR = 22;

function logHeader(title) {
  console.log('\n============================================================');
  console.log(`  ${title}`);
  console.log('============================================================\n');
}

function logOk(message) {
  console.log(`  [OK]   ${message}`);
}

function logWarn(message) {
  console.warn(`  [WARN] ${message}`);
}

function logError(message, fix) {
  console.error(`  [ERROR] ${message}`);
  if (fix) {
    console.error(`          -> Solución: ${fix}`);
  }
}

export function checkEnvironment({ requireEnvFile = false } = {}) {
  logHeader('Verificación del entorno de desarrollo (taller-supabase)');

  let hasErrors = false;

  // 1. Verificar Node.js y su versión
  const nodeVersion = process.versions.node;
  const majorVersion = Number(nodeVersion.split('.')[0]);

  if (Number.isNaN(majorVersion) || majorVersion < MIN_NODE_MAJOR) {
    hasErrors = true;
    logError(
      `Versión de Node.js detectada: v${nodeVersion}. Se requiere Node.js v${MIN_NODE_MAJOR} LTS o superior.`,
      'Descarga e instala Node.js 22 LTS o superior desde https://nodejs.org/'
    );
  } else {
    logOk(`Node.js v${nodeVersion} instalado y compatible (>= v${MIN_NODE_MAJOR}).`);
  }

  // 2. Verificar disponibilidad de npm
  const isWindows = process.platform === 'win32';
  const npmCmd = isWindows ? 'npm.cmd' : 'npm';
  const npmResult = spawnSync(npmCmd, ['--version'], {
    cwd: ROOT_DIR,
    encoding: 'utf-8',
    shell: isWindows
  });

  if (npmResult.error || npmResult.status !== 0) {
    hasErrors = true;
    logError(
      'No se pudo ejecutar npm en este sistema.',
      'Asegúrate de que npm esté instalado junto con Node.js y disponible en tu variable PATH.'
    );
  } else {
    logOk(`npm v${npmResult.stdout.trim()} disponible.`);
  }

  // 3. Verificar existencia de node_modules y binarios locales de CLI
  const nodeModulesPath = resolve(ROOT_DIR, 'node_modules');
  const binDir = resolve(nodeModulesPath, '.bin');
  const supabaseBin = resolve(binDir, isWindows ? 'supabase.cmd' : 'supabase');
  const vercelBin = resolve(binDir, isWindows ? 'vercel.cmd' : 'vercel');
  const viteBin = resolve(binDir, isWindows ? 'vite.cmd' : 'vite');

  if (!existsSync(nodeModulesPath)) {
    hasErrors = true;
    logError(
      'La carpeta node_modules no existe todavía.',
      'Ejecuta "npm install" en la raíz del proyecto para instalar todas las dependencias.'
    );
  } else {
    logOk('Carpeta node_modules encontrada.');

    if (!existsSync(supabaseBin)) {
      hasErrors = true;
      logError(
        'No se encontró el binario local de Supabase CLI en node_modules/.bin.',
        'Ejecuta "npm install" nuevamente para instalar la dependencia local "supabase".'
      );
    } else {
      logOk('Supabase CLI instalada localmente en node_modules/.bin.');
    }

    if (!existsSync(vercelBin)) {
      hasErrors = true;
      logError(
        'No se encontró el binario local de Vercel CLI en node_modules/.bin.',
        'Ejecuta "npm install" nuevamente para instalar la dependencia local "vercel".'
      );
    } else {
      logOk('Vercel CLI instalada localmente en node_modules/.bin.');
    }

    if (!existsSync(viteBin)) {
      hasErrors = true;
      logError(
        'No se encontró el binario local de Vite en node_modules/.bin.',
        'Ejecuta "npm install" nuevamente para instalar la dependencia local "vite".'
      );
    } else {
      logOk('Vite instalado localmente en node_modules/.bin.');
    }
  }

  // 4. Verificar archivos esenciales del repositorio
  const requiredFiles = [
    { path: 'package.json', label: 'Configuración de paquetes y scripts (package.json)' },
    { path: 'vite.config.js', label: 'Configuración de Vite (vite.config.js)' },
    { path: 'vercel.json', label: 'Configuración de despliegue en Vercel (vercel.json)' },
    { path: '.env.example', label: 'Plantilla de variables de entorno (.env.example)' },
    { path: 'apps/web/index.html', label: 'Punto de entrada HTML del frontend (apps/web/index.html)' },
    { path: 'apps/web/src/main.js', label: 'Punto de entrada JS de Vue 3 (apps/web/src/main.js)' },
    { path: 'supabase/config.toml', label: 'Configuración de Supabase (supabase/config.toml)' },
    {
      path: 'supabase/migrations/20261120000000_initial_schema.sql',
      label: 'Migración SQL inicial con RLS (supabase/migrations/20261120000000_initial_schema.sql)'
    },
    {
      path: 'supabase/functions/tasks/index.js',
      label: 'Edge Function tasks en JavaScript (supabase/functions/tasks/index.js)'
    }
  ];

  for (const file of requiredFiles) {
    const fullPath = resolve(ROOT_DIR, file.path);
    if (!existsSync(fullPath)) {
      hasErrors = true;
      logError(
        `Falta el archivo requerido: ${file.path}`,
        `Restaura el archivo "${file.path}" desde el repositorio Git.`
      );
    } else {
      logOk(`${file.label}`);
    }
  }

  // 5. Comprobar archivo .env o .env.local (informativo o requerido según modo)
  const envPath = resolve(ROOT_DIR, '.env');
  const envLocalPath = resolve(ROOT_DIR, '.env.local');
  const hasEnv = existsSync(envPath);
  const hasEnvLocal = existsSync(envLocalPath);

  if (!hasEnv && !hasEnvLocal) {
    const msg =
      'No se encontró el archivo ".env" (ni ".env.local") en la raíz. Es necesario para conectar el frontend local con tu proyecto Supabase.';
    const fix =
      'Copia ".env.example" a ".env" o ejecuta "npm run setup" para configurarlo con tu VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY.';
    if (requireEnvFile) {
      hasErrors = true;
      logError(msg, fix);
    } else {
      logWarn(`${msg}\n          -> Sugerencia: ${fix}`);
    }
  } else {
    const combinedRaw = [
      hasEnv ? readFileSync(envPath, 'utf-8') : '',
      hasEnvLocal ? readFileSync(envLocalPath, 'utf-8') : ''
    ].join('\n');

    // Ignorar líneas de comentarios (#) al analizar las variables de entorno
    const envContent = combinedRaw
      .split(/\r?\n/)
      .filter((line) => !line.trim().startsWith('#'))
      .join('\n');
    const hasUrl = /^VITE_SUPABASE_URL=https?:\/\/.+/m.test(envContent);
    const hasKey = /^VITE_SUPABASE_PUBLISHABLE_KEY=.+/m.test(envContent);
    const hasPlaceholder =
      envContent.includes('tu-project-ref.supabase.co') ||
      envContent.includes('tu-clave-publicable-o-anon-key');
    const hasForbiddenSecret =
      /SERVICE_ROLE/i.test(envContent) || /sb_secret_/i.test(envContent);

    if (hasForbiddenSecret) {
      hasErrors = true;
      logError(
        'Se detectó una posible clave secreta (service_role o sb_secret_) dentro de tu archivo .env.',
        'Elimina cualquier clave secreta del archivo .env. El frontend SOLO debe usar la clave pública (publishable / anon).'
      );
    } else if (!hasUrl || !hasKey || hasPlaceholder) {
      const warnMsg =
        'El archivo ".env" existe, pero aún contiene valores de ejemplo o incompletos.';
      if (requireEnvFile) {
        hasErrors = true;
        logError(
          warnMsg,
          'Edita ".env" y coloca tu VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY reales desde Supabase Dashboard.'
        );
      } else {
        logWarn(
          `${warnMsg}\n          -> Recuerda completarlo con los datos de tu proyecto Supabase antes de iniciar sesión en la app.`
        );
      }
    } else {
      logOk('Archivo .env configurado con VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY.');
    }
  }

  console.log('\n------------------------------------------------------------');
  if (hasErrors) {
    console.error('  Resultado: Se encontraron errores en la verificación del entorno.');
    console.error('  Por favor, aplica las soluciones indicadas arriba y vuelve a ejecutar:');
    console.error('    npm run check');
    console.log('------------------------------------------------------------\n');
    return false;
  }

  console.log('  Resultado: Entorno verificado correctamente.');
  console.log('------------------------------------------------------------\n');
  return true;
}

// Ejecutar directamente si este archivo es el punto de entrada
if (resolve(process.argv[1] || '') === __filename) {
  const ok = checkEnvironment();
  process.exit(ok ? 0 : 1);
}
