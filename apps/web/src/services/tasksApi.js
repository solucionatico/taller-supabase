import { supabase } from './supabase.js';

/**
 * Extrae un mensaje de error claro cuando falla la invocación a la Edge Function `tasks`.
 */
async function extractFunctionError(error, fallbackMessage) {
  if (!error) return fallbackMessage;

  // FunctionsHttpError en @supabase/supabase-js expone el objeto Response en `error.context`
  if (error.context && typeof error.context.json === 'function') {
    try {
      const payload = await error.context.json();
      if (payload?.error) {
        return payload.error;
      }
    } catch {
      // Si el cuerpo no es JSON, continuamos con el mensaje estándar
    }
  }

  const msg = error.message || String(error);
  if (msg.toLowerCase().includes('failed to send a request to the edge function')) {
    return 'No se pudo contactar con la Edge Function "tasks". Asegúrate de haberla desplegado con "npm run deploy:api".';
  }

  return msg || fallbackMessage;
}

/**
 * Invoca la Supabase Edge Function `tasks` enviando el JWT de la sesión activa.
 */
async function invokeTasksAction(payload, fallbackErrorMessage) {
  const { data, error } = await supabase.functions.invoke('tasks', {
    body: payload
  });

  if (error) {
    const detailedMessage = await extractFunctionError(error, fallbackErrorMessage);
    throw new Error(detailedMessage);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data?.data;
}

/**
 * Consulta todas las tareas del usuario autenticado (action: "list").
 */
export async function fetchTasks() {
  const tasks = await invokeTasksAction(
    { action: 'list' },
    'No se pudieron cargar tus tareas.'
  );
  return Array.isArray(tasks) ? tasks : [];
}

/**
 * Crea una nueva tarea para el usuario autenticado (action: "create").
 */
export async function createTask({ title, description = '' }) {
  return invokeTasksAction(
    {
      action: 'create',
      title,
      description
    },
    'No se pudo crear la tarea.'
  );
}

/**
 * Actualiza el estado o contenido de una tarea del usuario (action: "update").
 */
export async function updateTask({ id, completed, title, description }) {
  return invokeTasksAction(
    {
      action: 'update',
      id,
      completed,
      title,
      description
    },
    'No se pudo actualizar la tarea.'
  );
}

/**
 * Elimina una tarea perteneciente al usuario autenticado (action: "delete").
 */
export async function deleteTask(id) {
  return invokeTasksAction(
    {
      action: 'delete',
      id
    },
    'No se pudo eliminar la tarea.'
  );
}
