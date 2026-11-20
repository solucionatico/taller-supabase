import { createClient } from '@supabase/supabase-js';

// Lectura de variables de entorno públicas mediante import.meta.env de Vite
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabasePublishableKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();

/**
 * Comprueba si las variables de entorno fueron configuradas con valores reales.
 */
export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabasePublishableKey) &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('tu-project-ref.supabase.co') &&
  !supabasePublishableKey.includes('tu-clave-publicable-o-anon-key');

// Inicializamos el cliente oficial con una URL de respaldo inocua si aún no se ha creado el .env,
// para que la interfaz pueda renderizar un aviso didáctico en lugar de fallar al arrancar.
const effectiveUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder-project.supabase.co';
const effectiveKey = isSupabaseConfigured ? supabasePublishableKey : 'public-placeholder-key';

export const supabase = createClient(effectiveUrl, effectiveKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

/**
 * Traduce los errores comunes de Supabase Auth a mensajes claros en español para los estudiantes.
 */
export function formatAuthError(error) {
  if (!error) return 'Ha ocurrido un error desconocido de autenticación.';
  const msg = (error.message || String(error)).toLowerCase();

  if (msg.includes('invalid login credentials')) {
    return 'Correo electrónico o contraseña incorrectos. Verifica tus datos e inténtalo de nuevo.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Tu correo electrónico aún no ha sido confirmado. Revisa tu bandeja de entrada o desactiva "Confirm email" en Supabase Auth para el taller.';
  }
  if (msg.includes('user already registered')) {
    return 'Ya existe una cuenta registrada con este correo electrónico. Intenta iniciar sesión.';
  }
  if (msg.includes('password should be at least')) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  if (msg.includes('failed to fetch') || msg.includes('network')) {
    return 'No se pudo conectar con Supabase. Verifica tu conexión y que VITE_SUPABASE_URL sea correcta.';
  }

  return error.message || 'Error al procesar la autenticación con Supabase.';
}
