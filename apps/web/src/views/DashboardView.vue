<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '../services/supabase.js';
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask
} from '../services/tasksApi.js';
import StatusBanner from '../components/StatusBanner.vue';
import TaskForm from '../components/TaskForm.vue';
import TaskItem from '../components/TaskItem.vue';

const user = ref(null);
const tasks = ref([]);
const loadingTasks = ref(true);
const creatingTask = ref(false);
const busyTaskIds = ref(new Set());
const activeFilter = ref('all'); // 'all' | 'pending' | 'completed'

const errorMessage = ref('');
const successMessage = ref('');

// Información básica del usuario autenticado (nombre y correo)
const userDisplayName = computed(() => {
  const metaName = user.value?.user_metadata?.full_name;
  if (typeof metaName === 'string' && metaName.trim()) {
    return metaName.trim();
  }
  const email = user.value?.email || '';
  return email.split('@')[0] || 'Estudiante';
});

const userEmail = computed(() => user.value?.email || 'Sin correo');

// Indicadores de estado de las tareas
const totalCount = computed(() => tasks.value.length);
const completedCount = computed(() => tasks.value.filter((t) => t.completed).length);
const pendingCount = computed(() => totalCount.value - completedCount.value);

const filteredTasks = computed(() => {
  if (activeFilter.value === 'pending') {
    return tasks.value.filter((t) => !t.completed);
  }
  if (activeFilter.value === 'completed') {
    return tasks.value.filter((t) => t.completed);
  }
  return tasks.value;
});

function setTaskBusy(taskId, isBusy) {
  const next = new Set(busyTaskIds.value);
  if (isBusy) {
    next.add(taskId);
  } else {
    next.delete(taskId);
  }
  busyTaskIds.value = next;
}

function showSuccess(msg) {
  successMessage.value = msg;
  errorMessage.value = '';
}

function showError(msg) {
  errorMessage.value = msg;
  successMessage.value = '';
}

async function loadUserAndTasks() {
  loadingTasks.value = true;
  errorMessage.value = '';

  try {
    const {
      data: { user: currentUser }
    } = await supabase.auth.getUser();
    user.value = currentUser;

    const list = await fetchTasks();
    tasks.value = list;
  } catch (err) {
    showError(err.message || 'Error al consultar las tareas desde la Edge Function.');
  } finally {
    loadingTasks.value = false;
  }
}

async function handleCreateTask(payload) {
  creatingTask.value = true;
  errorMessage.value = '';

  try {
    const created = await createTask(payload);
    if (created) {
      tasks.value = [created, ...tasks.value];
      showSuccess(`Tarea "${created.title}" creada correctamente.`);
    }
  } catch (err) {
    showError(err.message || 'No se pudo crear la tarea.');
  } finally {
    creatingTask.value = false;
  }
}

async function handleToggleTask(task) {
  setTaskBusy(task.id, true);
  errorMessage.value = '';

  try {
    const nextCompleted = !task.completed;
    const updated = await updateTask({
      id: task.id,
      completed: nextCompleted
    });

    if (updated) {
      tasks.value = tasks.value.map((item) => (item.id === task.id ? updated : item));
      showSuccess(
        updated.completed
          ? `¡Tarea "${updated.title}" marcada como completada!`
          : `Tarea "${updated.title}" marcada como pendiente.`
      );
    }
  } catch (err) {
    showError(err.message || 'No se pudo actualizar el estado de la tarea.');
  } finally {
    setTaskBusy(task.id, false);
  }
}

async function handleDeleteTask(task) {
  setTaskBusy(task.id, true);
  errorMessage.value = '';

  try {
    await deleteTask(task.id);
    tasks.value = tasks.value.filter((item) => item.id !== task.id);
    showSuccess(`Tarea "${task.title}" eliminada.`);
  } catch (err) {
    showError(err.message || 'No se pudo eliminar la tarea.');
  } finally {
    setTaskBusy(task.id, false);
  }
}

onMounted(() => {
  loadUserAndTasks();
});
</script>

<template>
  <div>
    <!-- Tarjeta de información del usuario autenticado -->
    <section class="card" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h1 style="font-size: 1.3rem; margin-bottom: 0.2rem;">
          Hola, {{ userDisplayName }}
        </h1>
        <p style="font-size: 0.9rem; color: var(--text-secondary);">
          Sesión iniciada como <strong>{{ userEmail }}</strong> &middot; Tus registros están
          protegidos por <code>Row Level Security (auth.uid() = user_id)</code>.
        </p>
      </div>

      <button
        type="button"
        class="btn btn-outline btn-sm"
        :disabled="loadingTasks"
        @click="loadUserAndTasks"
      >
        {{ loadingTasks ? 'Actualizando...' : 'Recargar tareas' }}
      </button>
    </section>

    <!-- Mensajes de éxito y error -->
    <StatusBanner
      type="error"
      :message="errorMessage"
      @close="errorMessage = ''"
    />

    <StatusBanner
      type="success"
      :message="successMessage"
      @close="successMessage = ''"
    />

    <!-- Indicadores de estado -->
    <section class="stats-grid" aria-label="Resumen de tareas">
      <div class="stat-card">
        <div class="stat-label">Total de tareas</div>
        <div class="stat-value">{{ totalCount }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">Pendientes</div>
        <div class="stat-value text-amber">{{ pendingCount }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-label">Completadas</div>
        <div class="stat-value text-brand">{{ completedCount }}</div>
      </div>
    </section>

    <!-- Formulario para crear tareas -->
    <TaskForm
      :submitting="creatingTask"
      @create="handleCreateTask"
    />

    <!-- Panel principal de tareas -->
    <section class="card">
      <div class="tasks-header">
        <h2 style="font-size: 1.12rem;">Mis tareas</h2>

        <div class="filter-tabs" role="tablist" aria-label="Filtrar tareas por estado">
          <button
            type="button"
            :class="['filter-tab', { active: activeFilter === 'all' }]"
            @click="activeFilter = 'all'"
          >
            Todas ({{ totalCount }})
          </button>
          <button
            type="button"
            :class="['filter-tab', { active: activeFilter === 'pending' }]"
            @click="activeFilter = 'pending'"
          >
            Pendientes ({{ pendingCount }})
          </button>
          <button
            type="button"
            :class="['filter-tab', { active: activeFilter === 'completed' }]"
            @click="activeFilter = 'completed'"
          >
            Completadas ({{ completedCount }})
          </button>
        </div>
      </div>

      <!-- Estado de carga -->
      <div v-if="loadingTasks" class="state-box">
        <div class="spinner" style="margin-bottom: 0.6rem;"></div>
        <p>Cargando tus tareas desde la Edge Function <code>tasks</code>...</p>
      </div>

      <!-- Estado vacío -->
      <div v-else-if="filteredTasks.length === 0" class="state-box">
        <p style="font-weight: 600; margin-bottom: 0.25rem;">
          {{
            totalCount === 0
              ? 'Todavía no has creado ninguna tarea.'
              : 'No hay tareas en este filtro.'
          }}
        </p>
        <p style="font-size: 0.88rem;">
          {{
            totalCount === 0
              ? 'Utiliza el formulario superior para registrar tu primera tarea en PostgreSQL.'
              : 'Cambia el filtro superior para ver tus demás tareas.'
          }}
        </p>
      </div>

      <!-- Lista de tareas -->
      <ul v-else class="task-list">
        <TaskItem
          v-for="task in filteredTasks"
          :key="task.id"
          :task="task"
          :busy="busyTaskIds.has(task.id)"
          @toggle="handleToggleTask"
          @delete="handleDeleteTask"
        />
      </ul>
    </section>
  </div>
</template>
