import { existsSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '..');
const FUNCTIONS_DIR = resolve(ROOT_DIR, 'supabase', 'functions');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

export function deployFunctions() {
  console.log('\n============================================================');
  console.log('  Despliegue de Supabase Edge Functions');
  console.log('============================================================\n');

  if (!existsSync(FUNCTIONS_DIR)) {
    console.error(`[ERROR] No existe el directorio de funciones: ${FUNCTIONS_DIR}`);
    return false;
  }

  // Detectar carpetas de funciones, ignorando carpetas auxiliares que comiencen por "_"
  const entries = readdirSync(FUNCTIONS_DIR, { withFileTypes: true });
  const functionNames = entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_') && !entry.name.startsWith('.'))
    .map((entry) => entry.name);

  if (functionNames.length === 0) {
    console.warn('  [WARN] No se encontraron Edge Functions para desplegar en supabase/functions/.');
    return true;
  }

  console.log(`  Funciones detectadas (${functionNames.length}): ${functionNames.join(', ')}\n`);

  for (const fnName of functionNames) {
    console.log(`--> Desplegando Edge Function: "${fnName}"...`);

    const result = spawnSync(
      npmCmd,
      ['run', 'supabase', '--', 'functions', 'deploy', fnName],
      {
        cwd: ROOT_DIR,
        stdio: 'inherit',
        shell: isWindows
      }
    );

    if (result.error || result.status !== 0) {
      console.error(
        `\n[ERROR] Falló el despliegue de la Edge Function "${fnName}". Se detiene el proceso.`
      );
      return false;
    }

    console.log(`  [OK] Edge Function "${fnName}" desplegada correctamente.\n`);
  }

  console.log('  Todas las Edge Functions se desplegaron con éxito.\n');
  return true;
}

if (resolve(process.argv[1] || '') === __filename) {
  const ok = deployFunctions();
  process.exit(ok ? 0 : 1);
}
