// ============================================================================
// Supabase Edge Function: tasks
// Runtime: Deno (JavaScript puro - ES Modules)
//
// Implementa el CRUD de tareas personales respetando Row Level Security (RLS).
// Acciones soportadas en el cuerpo JSON (POST):
//   - { "action": "list" }
//   - { "action": "create", "title": "...", "description": "..." }
//   - { "action": "update", "id": 1, "completed": true, "title": "...", "description": "..." }
//   - { "action": "delete", "id": 1 }
// ============================================================================

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

/**
 * Construye una respuesta HTTP en formato JSON incluyendo encabezados CORS.
 */
function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}

/**
 * Valida y convierte el identificador numérico de una tarea.
 */
function parseTaskId(rawId) {
  const numericId = Number(rawId);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return null;
  }
  return numericId;
}

Deno.serve(async (req) => {
  // 1. Responder solicitudes preflight de CORS (desde localhost o Vercel)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  // 2. Validar método HTTP
  if (req.method !== 'POST') {
    return jsonResponse(
      {
        error: 'Método HTTP no permitido. Utiliza POST con un campo "action" en el cuerpo JSON.'
      },
      405
    );
  }

  try {
    // 3. Verificar presencia del encabezado Authorization con el JWT del usuario
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
      return jsonResponse(
        {
          error: 'No autorizado. Debes iniciar sesión y enviar un token Bearer JWT válido.'
        },
        401
      );
    }

    // 4. Obtener configuración del entorno de Supabase Edge Functions
    // IMPORTANTE: Se utiliza la clave publicable/anónima (NUNCA service_role)
    // para que todas las consultas respeten las políticas RLS de PostgreSQL.
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabasePublishableKey =
      Deno.env.get('SUPABASE_PUBLISHABLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabasePublishableKey) {
      return jsonResponse(
        {
          error: 'Error de configuración en el entorno de la Edge Function.'
        },
        500
      );
    }

    // 5. Inicializar el cliente de Supabase reenviando el JWT del usuario autenticado
    const supabase = createClient(supabaseUrl, supabasePublishableKey, {
      global: {
        headers: {
          Authorization: authHeader
        }
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });

    // 6. Validar la identidad del usuario autenticado mediante Supabase Auth
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return jsonResponse(
        {
          error: 'Sesión inválida o expirada. Por favor, vuelve a iniciar sesión.'
        },
        401
      );
    }

    // 7. Leer y validar el cuerpo JSON de la petición
    let body;
    try {
      body = await req.json();
    } catch {
      return jsonResponse(
        {
          error: 'El cuerpo de la solicitud debe ser un objeto JSON válido.'
        },
        400
      );
    }

    const action = typeof body?.action === 'string' ? body.action.trim().toLowerCase() : '';

    if (!action) {
      return jsonResponse(
        {
          error: 'Falta el campo obligatorio "action" (list, create, update, delete).'
        },
        400
      );
    }

    // ========================================================================
    // ACCIÓN: list -> Consultar las tareas del usuario autenticado
    // ========================================================================
    if (action === 'list') {
      const { data: tasks, error: listError } = await supabase
        .from('tasks')
        .select('id, title, description, completed, user_id, created_at')
        .order('created_at', { ascending: false });

      if (listError) {
        return jsonResponse({ error: listError.message }, 400);
      }

      return jsonResponse({ data: tasks ?? [] }, 200);
    }

    // ========================================================================
    // ACCIÓN: create -> Crear una nueva tarea para el usuario autenticado
    // ========================================================================
    if (action === 'create') {
      const rawTitle = typeof body.title === 'string' ? body.title.trim() : '';
      const rawDescription =
        typeof body.description === 'string' ? body.description.trim() : '';

      if (!rawTitle) {
        return jsonResponse(
          { error: 'El título de la tarea ("title") es obligatorio.' },
          400
        );
      }

      if (rawTitle.length > 200) {
        return jsonResponse(
          { error: 'El título de la tarea no puede superar los 200 caracteres.' },
          400
        );
      }

      if (rawDescription.length > 1000) {
        return jsonResponse(
          { error: 'La descripción no puede superar los 1000 caracteres.' },
          400
        );
      }

      // Nota de seguridad: No confiamos en ningún user_id enviado por el navegador.
      // El user_id se asigna con user.id (verificado por JWT) y es validado por RLS con auth.uid().
      const { data: createdTask, error: createError } = await supabase
        .from('tasks')
        .insert({
          title: rawTitle,
          description: rawDescription || null,
          completed: false,
          user_id: user.id
        })
        .select('id, title, description, completed, user_id, created_at')
        .single();

      if (createError) {
        return jsonResponse({ error: createError.message }, 400);
      }

      return jsonResponse({ data: createdTask }, 201);
    }

    // ========================================================================
    // ACCIÓN: update -> Actualizar estado o datos de una tarea propia
    // ========================================================================
    if (action === 'update') {
      const taskId = parseTaskId(body.id);
      if (!taskId) {
        return jsonResponse(
          { error: 'Debes proporcionar un identificador de tarea ("id") numérico válido.' },
          400
        );
      }

      const updates = {};

      if (typeof body.completed === 'boolean') {
        updates.completed = body.completed;
      }

      if (typeof body.title === 'string') {
        const trimmedTitle = body.title.trim();
        if (!trimmedTitle) {
          return jsonResponse(
            { error: 'El título de la tarea no puede estar vacío.' },
            400
          );
        }
        if (trimmedTitle.length > 200) {
          return jsonResponse(
            { error: 'El título de la tarea no puede superar los 200 caracteres.' },
            400
          );
        }
        updates.title = trimmedTitle;
      }

      if (body.description !== undefined) {
        const trimmedDesc =
          typeof body.description === 'string' ? body.description.trim() : '';
        if (trimmedDesc.length > 1000) {
          return jsonResponse(
            { error: 'La descripción no puede superar los 1000 caracteres.' },
            400
          );
        }
        updates.description = trimmedDesc || null;
      }

      if (Object.keys(updates).length === 0) {
        return jsonResponse(
          {
            error:
              'Debes enviar al menos un campo para actualizar ("completed", "title" o "description").'
          },
          400
        );
      }

      const { data: updatedTask, error: updateError } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select('id, title, description, completed, user_id, created_at')
        .maybeSingle();

      if (updateError) {
        return jsonResponse({ error: updateError.message }, 400);
      }

      if (!updatedTask) {
        return jsonResponse(
          {
            error:
              'Tarea no encontrada o no tienes permisos para modificarla (protegida por RLS).'
          },
          404
        );
      }

      return jsonResponse({ data: updatedTask }, 200);
    }

    // ========================================================================
    // ACCIÓN: delete -> Eliminar una tarea propia
    // ========================================================================
    if (action === 'delete') {
      const taskId = parseTaskId(body.id);
      if (!taskId) {
        return jsonResponse(
          { error: 'Debes proporcionar un identificador de tarea ("id") numérico válido.' },
          400
        );
      }

      const { data: deletedTask, error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .select('id, title, description, completed, user_id, created_at')
        .maybeSingle();

      if (deleteError) {
        return jsonResponse({ error: deleteError.message }, 400);
      }

      if (!deletedTask) {
        return jsonResponse(
          {
            error:
              'Tarea no encontrada o no tienes permisos para eliminarla (protegida por RLS).'
          },
          404
        );
      }

      return jsonResponse(
        {
          data: deletedTask,
          message: 'Tarea eliminada correctamente.'
        },
        200
      );
    }

    // Acción no reconocida
    return jsonResponse(
      {
        error: `La acción "${action}" no es válida. Acciones permitidas: list, create, update, delete.`
      },
      400
    );
  } catch (err) {
    return jsonResponse(
      {
        error: 'Error interno al procesar la solicitud en la Edge Function.',
        details: err instanceof Error ? err.message : String(err)
      },
      500
    );
  }
});
