<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase, isSupabaseConfigured, formatAuthError } from '../services/supabase.js';
import StatusBanner from '../components/StatusBanner.vue';

const router = useRouter();

const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');

async function handleLogin() {
  errorMessage.value = '';

  if (!isSupabaseConfigured) {
    errorMessage.value =
      'Debes configurar tu archivo .env con VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY antes de iniciar sesión.';
    return;
  }

  loading.value = true;
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value.trim(),
      password: password.value
    });

    if (error) {
      errorMessage.value = formatAuthError(error);
      return;
    }

    await router.push({ name: 'dashboard' });
  } catch (err) {
    errorMessage.value = formatAuthError(err);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <div class="auth-header">
        <h1>Iniciar sesión</h1>
        <p>Accede a tu panel personal de tareas protegido con Supabase Auth y RLS</p>
      </div>

      <StatusBanner
        type="error"
        :message="errorMessage"
        @close="errorMessage = ''"
      />

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label" for="login-email">Correo electrónico</label>
          <input
            id="login-email"
            v-model="email"
            type="email"
            class="form-input"
            placeholder="estudiante@ejemplo.com"
            autocomplete="email"
            required
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="login-password">Contraseña</label>
          <input
            id="login-password"
            v-model="password"
            type="password"
            class="form-input"
            placeholder="Tu contraseña"
            autocomplete="current-password"
            minlength="6"
            required
            :disabled="loading"
          />
        </div>

        <button
          type="submit"
          class="btn btn-primary btn-block"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner" aria-hidden="true"></span>
          <span>{{ loading ? 'Iniciando sesión...' : 'Entrar a mis tareas' }}</span>
        </button>
      </form>

      <p style="text-align: center; margin-top: 1.35rem; font-size: 0.9rem; color: var(--text-secondary);">
        ¿Aún no tienes una cuenta?
        <router-link :to="{ name: 'register' }">Regístrate aquí</router-link>
      </p>
    </div>
  </div>
</template>
