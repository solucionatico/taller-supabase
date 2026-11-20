import { existsSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { checkEnvironment } from './check-environment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '..');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

function runNpmScript(args) {
  return spawnSync(npmCmd, args, {
    cwd: ROOT_DIR,
    stdio: 'inherit',
    shell: isWindows
  });
}

async function askYesNo(rl, question, defaultYes = true) {
  const suffix = defaultYes ? '[S/n]' : '[s/N]';
  const answer = (await rl.question(`${question} ${suffix}: `)).trim().toLowerCase();
  if (!answer) return defaultYes;
  return answer === 's' || answer === 'si' || answer === 'sí' || answer === 'y' || answer === 'yes';
}

async function main() {
  console.log('\n============================================================');
  console.log('  Asistente de Configuración Inicial - Taller Supabase + Vercel');
  console.log('============================================================\n');

  // 1. Comprobar requisitos del entorno
  const envOk = checkEnvironment({ requireEnvFile: false });
  if (!envOk) {
    console.error('Corrige los errores del entorno antes de continuar con el asistente.');
    process.exit(1);
  }

  const rl = createInterface({ input, output });

  try {
    // 2. Indicar cómo crear una cuenta y proyecto en Supabase
    console.log('PASO 1: Cuenta y Proyecto en Supabase');
    console.log('------------------------------------------------------------');
    console.log('1. Abre https://supabase.com/ en tu navegador e inicia sesión.');
    console.log('2. Crea un nuevo proyecto gratuito ("New project").');
    console.log('3. Guarda en un lugar seguro la contraseña de base de datos que elijas');
    console.log('   (la CLI de Supabase te la pedirá al vincular el proyecto).');
    console.log('4. Espera 1-2 minutos a que el proyecto termine de aprovisionarse.\n');

    // 3. Solicitar el Project Ref y clave publicable para el archivo .env local
    const projectRef = (
      await rl.question(
        'Introduce tu Project Reference ID de Supabase (ej. abcdefghijklmnopqrst) [Enter para omitir]: '
      )
    ).trim();

    if (projectRef) {
      const defaultUrl = `https://${projectRef}.supabase.co`;
      const customUrl = (
        await rl.question(`URL del proyecto Supabase [${defaultUrl}]: `)
      ).trim();
      const supabaseUrl = customUrl || defaultUrl;

      console.log(
        '\nNota de seguridad: Introduce ÚNICAMENTE tu clave pública (Publishable key / anon public).'
      );
      console.log('NUNCA introduzcas tu clave secreta (service_role) ni contraseñas aquí.');
      const publishableKey = (
        await rl.question('Introduce tu VITE_SUPABASE_PUBLISHABLE_KEY [Enter para configurar luego]: ')
      ).trim();

      if (publishableKey) {
        const envPath = resolve(ROOT_DIR, '.env');
        let shouldWrite = true;
        if (existsSync(envPath)) {
          shouldWrite = await askYesNo(
            rl,
            'El archivo .env ya existe. ¿Deseas actualizarlo con estos valores públicos?',
            true
          );
        }

        if (shouldWrite) {
          const envContent = [
            '# Configuración pública del Frontend generada por npm run setup',
            `VITE_SUPABASE_URL=${supabaseUrl}`,
            `VITE_SUPABASE_PUBLISHABLE_KEY=${publishableKey}`,
            ''
          ].join('\n');
          writeFileSync(envPath, envContent, 'utf-8');
          console.log('  [OK] Archivo .env actualizado en la raíz del proyecto.\n');
        }
      }
    }

    // 4. Ejecutar el inicio de sesión de Supabase CLI
    console.log('\nPASO 2: Inicio de sesión en Supabase CLI');
    console.log('------------------------------------------------------------');
    const doSupabaseLogin = await askYesNo(
      rl,
      '¿Deseas iniciar sesión en Supabase CLI ahora ("npm run supabase -- login")?',
      true
    );

    if (doSupabaseLogin) {
      const loginRes = runNpmScript(['run', 'supabase', '--', 'login']);
      if (loginRes.status !== 0) {
        console.warn(
          '  [WARN] El inicio de sesión en Supabase CLI no finalizó con código 0. Puedes reintentarlo con: npm run supabase -- login'
        );
      }
    }

    // 5 y 6. Vincular el proyecto remoto (la CLI solicitará credenciales cuando las requiera)
    console.log('\nPASO 3: Vinculación con tu proyecto remoto de Supabase');
    console.log('------------------------------------------------------------');
    if (projectRef) {
      const doSupabaseLink = await askYesNo(
        rl,
        `¿Deseas vincular este repositorio con el proyecto Supabase "${projectRef}" ahora?`,
        true
      );

      if (doSupabaseLink) {
        console.log(
          'Ejecutando vinculación... Si la CLI solicita la contraseña de la base de datos, introdúcela directamente:'
        );
        const linkRes = runNpmScript([
          'run',
          'supabase',
          '--',
          'link',
          '--project-ref',
          projectRef
        ]);
        if (linkRes.status !== 0) {
          console.warn(
            `  [WARN] No se pudo completar la vinculación. Puedes ejecutarla manualmente con:\n         npm run supabase -- link --project-ref ${projectRef}`
          );
        }
      }
    } else {
      console.log(
        'Omitido porque no se ingresó Project Ref. Cuando lo tengas, ejecuta:'
      );
      console.log('  npm run supabase -- link --project-ref <TU_PROJECT_REF>');
    }

    // 7. Ejecutar el inicio de sesión de Vercel CLI
    console.log('\nPASO 4: Inicio de sesión en Vercel CLI');
    console.log('------------------------------------------------------------');
    const doVercelLogin = await askYesNo(
      rl,
      '¿Deseas iniciar sesión en Vercel CLI ahora ("npm run vercel -- login")?',
      true
    );

    if (doVercelLogin) {
      const vercelLoginRes = runNpmScript(['run', 'vercel', '--', 'login']);
      if (vercelLoginRes.status !== 0) {
        console.warn(
          '  [WARN] El inicio de sesión en Vercel CLI no finalizó con código 0. Puedes reintentarlo con: npm run vercel -- login'
        );
      }
    }

    // 8. Vincular o crear el proyecto Vercel
    console.log('\nPASO 5: Vinculación o creación del proyecto en Vercel');
    console.log('------------------------------------------------------------');
    const doVercelLink = await askYesNo(
      rl,
      '¿Deseas vincular o crear el proyecto en Vercel ahora ("npm run vercel -- link")?',
      true
    );

    if (doVercelLink) {
      const vercelLinkRes = runNpmScript(['run', 'vercel', '--', 'link']);
      if (vercelLinkRes.status !== 0) {
        console.warn(
          '  [WARN] La vinculación con Vercel no finalizó con código 0. Puedes reintentarla con: npm run vercel -- link'
        );
      }
    }

    // 9. Informar al estudiante de los pasos pendientes
    console.log('\n============================================================');
    console.log('  Resumen y Pasos Pendientes para Completar tu Taller');
    console.log('============================================================');
    console.log('1. Variables de entorno locales (.env):');
    console.log('   Verifica que tu archivo ".env" en la raíz tenga definidos:');
    console.log('     VITE_SUPABASE_URL=https://<tu-project-ref>.supabase.co');
    console.log('     VITE_SUPABASE_PUBLISHABLE_KEY=<tu-clave-publicable>');
    console.log('');
    console.log('2. Configuración de Supabase Auth (en Supabase Dashboard):');
    console.log('   - Ve a Authentication -> Providers -> Email.');
    console.log('   - Para agilizar la práctica en el taller, puedes desactivar temporalmente');
    console.log('     "Confirm email" (en producción real debe permanecer activo).');
    console.log('');
    console.log('3. Variables de entorno en Vercel (para el sitio en producción):');
    console.log('   En Vercel Dashboard (Settings -> Environment Variables) o mediante CLI:');
    console.log('     npm run vercel -- env add VITE_SUPABASE_URL production');
    console.log('     npm run vercel -- env add VITE_SUPABASE_PUBLISHABLE_KEY production');
    console.log('');
    console.log('4. Probar localmente y desplegar:');
    console.log('   - Desarrollo local:   npm run dev');
    console.log('   - Despliegue total:   npm run deploy');
    console.log('============================================================\n');
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error('\n[ERROR] Fallo inesperado durante la configuración:', err.message);
  process.exit(1);
});
