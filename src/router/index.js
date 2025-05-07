import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

// Vistas Públicas
import LoginView from '@/views/auth/LoginView.vue';
import RegisterDonatorView from '@/views/auth/RegisterDonatorView.vue'; // Vista de inicio por defecto
import RegisterBeneficiaryView from '@/views/auth/RegisterBeneficiaryView.vue';
import NotFoundView from '@/views/NotFoundView.vue';
// import HomeView from '@/views/HomeView.vue'; // Si tuvieras un HomeView general, lo importarías aquí

// Vistas Comunes (Autenticadas)
import UserDonationsView from '@/views/common/UserDonationsView.vue';

// Vistas de Donador
import DashboardDonatorView from '@/views/donator/DashboardDonatorView.vue';
import AlimentsView from '@/views/donator/AlimentsView.vue';

// Vistas de Beneficiario
import DashboardBeneficiaryView from '@/views/beneficiary/DashboardBeneficiaryView.vue';

const routes = [
  // --- RUTA RAÍZ: Muestra RegisterDonatorView por defecto ---
  {
    path: '/',
    name: 'DefaultRegisterDonator', // Nombre único para esta ruta raíz
    component: RegisterDonatorView,
    meta: { guestOnly: true } // Solo para usuarios no autenticados
  },
  // ----------------------------------------------------------

  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { guestOnly: true }
  },
  {
    path: '/register-donator',
    name: 'RegisterDonator', // Ruta explícita para el registro de donador
    component: RegisterDonatorView,
    meta: { guestOnly: true }
  },
  {
    path: '/register-beneficiary',
    name: 'RegisterBeneficiary',
    component: RegisterBeneficiaryView,
    meta: { guestOnly: true }
  },

  // --- Rutas Autenticadas ---
  {
    path: '/donations',
    name: 'UserDonations',
    component: UserDonationsView,
    meta: { requiresAuth: true }, // Requiere que el usuario esté autenticado
  },
  {
    path: '/donator/dashboard',
    name: 'DashboardDonator',
    component: DashboardDonatorView,
    meta: { requiresAuth: true, role: 'donator' }, // Requiere auth y rol 'donator'
  },
  {
    path: '/donator/aliments',
    name: 'DonatorAliments',
    component: AlimentsView,
    meta: { requiresAuth: true, role: 'donator' }, // Requiere auth y rol 'donator'
  },
  {
    path: '/beneficiary/dashboard',
    name: 'DashboardBeneficiary',
    component: DashboardBeneficiaryView,
    meta: { requiresAuth: true, role: 'beneficiary' }, // Requiere auth y rol 'beneficiary'
  },

  // --- Ruta Catch-all para 404 (Debe ser la última) ---
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL), // Usar process.env para Vue CLI
  routes,
});

// Navigation Guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Intenta inicializar el estado de autenticación desde localStorage si aún no está cargado en el store.
  // Esto es útil si el usuario recarga la página.
  if (!authStore.user && localStorage.getItem('authToken')) {
      authStore.initializeAuth();
  }

  const isAuthenticated = authStore.isAuthenticated;
  const userRole = authStore.userRole;

  // 1. Manejar rutas 'guestOnly' (solo para no autenticados)
  if (to.meta.guestOnly && isAuthenticated) {
    // Si el usuario está autenticado e intenta acceder a una ruta 'guestOnly'
    // (como '/', '/login', '/register-donator', '/register-beneficiary'),
    // redirigirlo a su dashboard correspondiente.
    if (userRole === 'donator') {
      return next({ name: 'DashboardDonator' });
    } else if (userRole === 'beneficiary') {
      return next({ name: 'DashboardBeneficiary' });
    } else {
      // Fallback si el usuario está autenticado pero no tiene un rol claro
      // o no hay un dashboard específico para ese "no-rol".
      // Podrías tener una vista "Home" general para usuarios autenticados o redirigir a '/donations'.
      // Evita redirigir a una ruta 'guestOnly' aquí para prevenir bucles.
      return next({ name: 'UserDonations' }); // Ejemplo de fallback
    }
  }

  // 2. Manejar rutas 'requiresAuth' (solo para autenticados)
  if (to.meta.requiresAuth && !isAuthenticated) {
    // Si la ruta requiere autenticación y el usuario no está autenticado,
    // redirigirlo a la página de Login.
    // Guardar la ruta original para redirigir después del login.
    return next({ name: 'Login', query: { redirect: to.fullPath } });
  }

  // 3. Manejar rutas con 'role' específico (solo para autenticados con el rol correcto)
  if (to.meta.role && isAuthenticated && to.meta.role !== userRole) {
    // Si el usuario está autenticado pero no tiene el rol requerido para la ruta.
    console.warn(`Acceso denegado a ${to.path}. Rol requerido: ${to.meta.role}, Rol del usuario: ${userRole}`);
    // Redirigir a su propio dashboard (si tiene uno) o a una página de "No Autorizado" o "NotFound".
    if (userRole === 'donator') {
        return next({ name: 'DashboardDonator' });
    } else if (userRole === 'beneficiary') {
        return next({ name: 'DashboardBeneficiary' });
    }
    // Si no tiene un dashboard claro o el rol es inesperado.
    return next({ name: 'NotFound' }); // O una página específica de "Acceso Denegado"
  }

  // Si ninguna de las condiciones anteriores se cumple, permite la navegación.
  next();
});

export default router;