<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase, isSupabaseConfigured } from './services/supabase.js';
import AppNavbar from './components/AppNavbar.vue';

const router = useRouter();
const currentUser = ref(null);
const signingOut = ref(false);
let authSubscription = null;

onMounted(async () => {
  if (!isSupabaseConfigured) return;

  const {
    data: { session }
  } = await supabase.auth.getSession();
  currentUser.value = session?.user ?? null;

  const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
    currentUser.value = newSession?.user ?? null;
  });

  authSubscription = data?.subscription;
});

onUnmounted(() => {
  if (authSubscription) {
    authSubscription.unsubscribe();
  }
});

async function handleSignOut() {
  signingOut.value = true;
  try {
    await supabase.auth.signOut();
    currentUser.value = null;
    await router.push({ name: 'login' });
  } finally {
    signingOut.value = false;
  }
}
</script>

<template>
  <div class="app-shell">
    <AppNavbar
      :user="currentUser"
      :signing-out="signingOut"
      @sign-out="handleSignOut"
    />

    <main class="main-container">
      <!-- Aviso didáctico si el estudiante aún no ha creado su archivo .env -->
      <div v-if="!isSupabaseConfigured" class="banner banner-warning">
        <div>
          <strong>Configuración pendiente (.env):</strong>
          No se detectaron valores reales en <code>VITE_SUPABASE_URL</code> y
          <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>. Copia <code>.env.example</code> a
          <code>.env</code> en la raíz del proyecto o ejecuta <code>npm run setup</code> y
          reinicia el servidor.
        </div>
      </div>

      <router-view />
    </main>

    <footer class="app-footer">
      Taller de Herramientas Gratuitas de Despliegue &mdash; Vue 3 + Vite + Supabase (PostgreSQL,
      Auth, RLS, Edge Functions) + Vercel
    </footer>
  </div>
</template>
