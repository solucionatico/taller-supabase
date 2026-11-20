<script setup>
import { ref } from 'vue';

defineProps({
  submitting: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['create']);

const title = ref('');
const description = ref('');

function handleSubmit() {
  const cleanTitle = title.value.trim();
  if (!cleanTitle) return;

  emit('create', {
    title: cleanTitle,
    description: description.value.trim()
  });

  title.value = '';
  description.value = '';
}
</script>

<template>
  <section class="card">
    <h2 style="font-size: 1.12rem; margin-bottom: 0.9rem;">Crear nueva tarea</h2>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label class="form-label" for="task-title">Título de la tarea *</label>
        <input
          id="task-title"
          v-model="title"
          type="text"
          class="form-input"
          placeholder="Ej. Configurar variables de entorno en Vercel"
          maxlength="200"
          required
          :disabled="submitting"
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="task-desc">Descripción (opcional)</label>
        <textarea
          id="task-desc"
          v-model="description"
          class="form-textarea"
          placeholder="Añade detalles, comandos o notas importantes..."
          maxlength="1000"
          :disabled="submitting"
        ></textarea>
      </div>

      <button
        type="submit"
        class="btn btn-primary"
        :disabled="submitting || !title.trim()"
      >
        <span v-if="submitting" class="spinner" aria-hidden="true"></span>
        <span>{{ submitting ? 'Guardando tarea...' : '+ Añadir tarea' }}</span>
      </button>
    </form>
  </section>
</template>
