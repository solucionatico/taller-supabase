<script setup>
defineProps({
  type: {
    type: String,
    default: 'info'
  },
  message: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close']);
</script>

<template>
  <div v-if="message" :class="['banner', `banner-${type}`]" role="alert">
    <div>{{ message }}</div>
    <button
      type="button"
      class="banner-close"
      aria-label="Cerrar mensaje"
      @click="emit('close')"
    >
      &times;
    </button>
  </div>
</template>
