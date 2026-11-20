<script setup>
import { computed } from 'vue';

const props = defineProps({
  user: {
    type: Object,
    default: null
  },
  signingOut: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['sign-out']);

const displayName = computed(() => {
  if (!props.user) return '';
  const metaName = props.user.user_metadata?.full_name;
  if (typeof metaName === 'string' && metaName.trim()) {
    return metaName.trim();
  }
  const email = props.user.email || '';
  return email.split('@')[0] || 'Estudiante';
});
</script>

<template>
  <header class="navbar">
    <div class="navbar-inner">
      <div class="brand">
        <span class="brand-badge">SUPABASE + VERCEL</span>
        <span>Gestor de Tareas Personales</span>
      </div>

      <div v-if="user" class="navbar-user">
        <div class="user-pill">
          <span class="user-pill-name">{{ displayName }}</span>
          <span class="user-pill-email">{{ user.email }}</span>
        </div>

        <button
          type="button"
          class="btn btn-outline btn-sm"
          :disabled="signingOut"
          @click="emit('sign-out')"
        >
          {{ signingOut ? 'Cerrando...' : 'Cerrar sesión' }}
        </button>
      </div>
    </div>
  </header>
</template>
