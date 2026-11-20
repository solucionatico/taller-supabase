<script setup>
import { computed } from 'vue';

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  busy: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['toggle', 'delete']);

const formattedDate = computed(() => {
  if (!props.task.created_at) return '';
  try {
    return new Intl.DateTimeFormat('es', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(props.task.created_at));
  } catch {
    return props.task.created_at;
  }
});
</script>

<template>
  <li :class="['task-item', { 'is-completed': task.completed }]">
    <div class="task-main">
      <input
        :id="`task-check-${task.id}`"
        type="checkbox"
        class="task-checkbox"
        :checked="task.completed"
        :disabled="busy"
        :aria-label="`Marcar tarea ${task.title} como ${task.completed ? 'pendiente' : 'completada'}`"
        @change="emit('toggle', task)"
      />

      <div class="task-content">
        <div class="task-title-row">
          <label
            :for="`task-check-${task.id}`"
            class="task-title"
            style="cursor: pointer;"
          >
            {{ task.title }}
          </label>
          <span :class="['status-badge', task.completed ? 'completed' : 'pending']">
            {{ task.completed ? 'Completada' : 'Pendiente' }}
          </span>
        </div>

        <p v-if="task.description" class="task-desc">
          {{ task.description }}
        </p>

        <div class="task-meta">
          Creada el {{ formattedDate }}
        </div>
      </div>
    </div>

    <div style="display: flex; align-items: center; gap: 0.4rem;">
      <button
        type="button"
        class="btn btn-outline btn-sm"
        :disabled="busy"
        @click="emit('toggle', task)"
      >
        {{ task.completed ? 'Reabrir' : 'Completar' }}
      </button>

      <button
        type="button"
        class="btn btn-danger-ghost"
        :disabled="busy"
        title="Eliminar tarea"
        @click="emit('delete', task)"
      >
        {{ busy ? '...' : 'Eliminar' }}
      </button>
    </div>
  </li>
</template>
