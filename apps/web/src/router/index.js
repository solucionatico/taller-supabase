import { createRouter, createWebHistory } from 'vue-router';
import { supabase, isSupabaseConfigured } from '../services/supabase.js';
import DashboardView from '../views/DashboardView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { guestOnly: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Guardia de navegación para proteger vistas autenticadas y recuperar la sesión activa
router.beforeEach(async (to) => {
  if (!isSupabaseConfigured) {
    // Si aún no se configuró el archivo .env, permitimos ver la pantalla de login con el aviso de configuración
    if (to.meta.requiresAuth) {
      return { name: 'login' };
    }
    return true;
  }

  try {
    const {
      data: { session }
    } = await supabase.auth.getSession();

    const isAuthenticated = Boolean(session?.user);

    if (to.meta.requiresAuth && !isAuthenticated) {
      return { name: 'login' };
    }

    if (to.meta.guestOnly && isAuthenticated) {
      return { name: 'dashboard' };
    }
  } catch {
    if (to.meta.requiresAuth) {
      return { name: 'login' };
    }
  }

  return true;
});

export default router;
