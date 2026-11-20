import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { checkEnvironment } from './check-environment.js';
import { deployFunctions } from './deploy-functions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '..');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

function runStep(stepNumber, title, actionFn) {
  console.log(`\n============================================================`);
  console.log(`  ETAPA ${stepNumber}/4: ${title}`);
  console.log(`============================================================\n`);

  const success = actionFn();
  if (!success) {
    console.error(`\n[ERROR] El despliegue se detuvo en la Etapa ${stepNumber}: ${title}.`);
    process.exit(1);
  }
}

function main() {
  console.log('\n************************************************************');
  console.log('  DESPLIEGUE COMPLETO FULL-STACK (Supabase + Vercel)');
  console.log('************************************************************');

  // Etapa 1: Comprobar el entorno
  runStep(1, 'Comprobación del entorno de desarrollo', () => {
    return checkEnvironment({ requireEnvFile: false });
  });

  // Etapa 2: Aplicar migraciones de base de datos en Supabase
  runStep(2, 'Aplicación de migraciones SQL en PostgreSQL (Supabase)', () => {
    const res = spawnSync(npmCmd, ['run', 'deploy:db'], {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      shell: isWindows
    });
    return !res.error && res.status === 0;
  });

  // Etapa 3: Desplegar Edge Functions en Supabase
  runStep(3, 'Despliegue de Supabase Edge Functions (API)', () => {
    return deployFunctions();
  });

  // Etapa 4: Desplegar el frontend en Vercel (modo producción)
  runStep(4, 'Despliegue del Frontend estático en Vercel (Producción)', () => {
    const res = spawnSync(npmCmd, ['run', 'deploy:web'], {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      shell: isWindows
    });
    return !res.error && res.status === 0;
  });

  console.log('\n************************************************************');
  console.log('  [ÉXITO] ¡Despliegue completo finalizado correctamente!');
  console.log('  - Base de datos y políticas RLS actualizadas en Supabase');
  console.log('  - Edge Function "tasks" publicada en Supabase');
  console.log('  - Frontend Vue 3 publicado en Vercel');
  console.log('************************************************************\n');
}

main();
