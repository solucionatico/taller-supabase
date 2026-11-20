<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase, isSupabaseConfigured, formatAuthError } from '../services/supabase.js';
import StatusBanner from '../components/StatusBanner.vue';

const router = useRouter();

const fullName = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

async function handleRegister() {
  errorMessage.value = '';
  successMessage.value = '';

  if (!isSupabaseConfigured) {
    errorMessage.value =
      'Debes configurar tu archivo .env con VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY antes de registrarte.';
    return;
  }

  const cleanName = fullName.value.trim();
  if (!cleanName) {
    errorMessage.value = 'Por favor, introduce tu nombre para mostrarlo en tu perfil.';
    return;
  }

  loading.value = true;
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.value.trim(),
      password: password.value,
      options: {
        data: {
          full_name: cleanName
        }
      }
    });

    if (error) {
      errorMessage.value = formatAuthError(error);
      return;
    }

    // Si la confirmación de correo está desactivada (recomendado para la práctica del taller),
    // Supabase devuelve la sesión inmediatamente y redirigimos al panel.
    if (data?.session) {
      await router.push({ name: 'dashboard' });
      return;
    }

    // Si la confirmación de correo está activada en el proyecto Supabase del estudiante:
    successMessage.value =
      'Cuenta creada correctamente. Revisa tu correo electrónico para confirmar tu cuenta (o desactiva "Confirm email" en Supabase Auth -> Providers -> Email para entrar directamente durante el taller).';
    fullName.value = '';
    email.value = '';
    password.value = '';
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
        <h1>Crear cuenta</h1>
        <p>Regístrate para gestionar tus tareas personales en Supabase</p>
      </div>

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

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label class="form-label" for="register-name">Nombre completo</label>
          <input
            id="register-name"
            v-model="fullName"
            type="text"
            class="form-input"
            placeholder="Ej. Ana Pérez"
            autocomplete="name"
            required
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="register-email">Correo electrónico</label>
          <input
            id="register-email"
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
          <label class="form-label" for="register-password">Contraseña (mínimo 6 caracteres)</label>
          <input
            id="register-password"
            v-model="password"
            type="password"
            class="form-input"
            placeholder="Mínimo 6 caracteres"
            autocomplete="new-password"
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
          <span>{{ loading ? 'Creando cuenta...' : 'Registrarme' }}</span>
        </button>
      </form>

      <p style="text-align: center; margin-top: 1.35rem; font-size: 0.9rem; color: var(--text-secondary);">
        ¿Ya tienes una cuenta?
        <router-link :to="{ name: 'login' }">Inicia sesión</router-link>
      </p>
    </div>
  </div>
</template>
