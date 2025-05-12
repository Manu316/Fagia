import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

// --- Vistas Públicas ---
import LoginView from '@/views/auth/LoginView.vue';
import RegisterDonatorView from '@/views/auth/RegisterDonatorView.vue';
import RegisterBeneficiaryView from '@/views/auth/RegisterBeneficiaryView.vue';
import NotFoundView from '@/views/NotFoundView.vue';

// --- Vistas Comunes (Autenticadas) ---
import UserDonationsView from '@/views/common/UserDonationsView.vue';

// --- Vistas de Donador (Autenticadas) ---
import DashboardDonatorView from '@/views/donator/DashboardDonatorView.vue';
import AlimentsView from '@/views/donator/AlimentsView.vue';

// --- Vistas de Beneficiario (Autenticadas) ---
import DashboardBeneficiaryView from '@/views/beneficiary/DashboardBeneficiaryView.vue';

// --- Definición de Rutas ---
const routes = [
  // Ruta Raíz: Redirige automáticamente a la página de registro de donador
  {
    path: '/',
    redirect: '/register-donator' // Redirige a la ruta con nombre 'RegisterDonator' o al path
  },

  // Rutas Públicas (solo para usuarios no autenticados)
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { guestOnly: true }
  },
  {
    path: '/register-donator',
    name: 'RegisterDonator',
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
  // Requieren que el usuario haya iniciado sesión

  // Rutas Generales Autenticadas
  {
    path: '/donations',
    name: 'UserDonations',
    component: UserDonationsView,
    meta: { requiresAuth: true },
  },

  // Rutas Específicas del Donador
  {
    path: '/donator/dashboard',
    name: 'DashboardDonator',
    component: DashboardDonatorView,
    meta: { requiresAuth: true, role: 'donator' },
  },
  {
    path: '/donator/aliments',
    name: 'DonatorAliments',
    component: AlimentsView,
    meta: { requiresAuth: true, role: 'donator' },
  },

  // Rutas Específicas del Beneficiario
  {
    path: '/beneficiary/dashboard',
    name: 'DashboardBeneficiary',
    component: DashboardBeneficiaryView,
    meta: { requiresAuth: true, role: 'beneficiary' },
  },

  // --- Ruta Catch-all para 404 (Página No Encontrada) ---
  // Debe ser la última ruta definida
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView
  },
];

// --- Creación de la Instancia del Router ---
const router = createRouter({
  // Usa el modo historial HTML5 (URLs limpias sin #)
  // y configura la base URL usando la variable de entorno de Vue CLI
  history: createWebHistory(process.env.BASE_URL),
  // Proporciona el array de rutas definido arriba
  routes,
});

// --- Guardias de Navegación Globales (Navigation Guards) ---
router.beforeEach((to, from, next) => {
  // Obtiene la instancia del store de autenticación
  const authStore = useAuthStore();

  // Intenta cargar el estado de autenticación desde localStorage al inicio
  // si el estado del store aún no está cargado (útil en recargas de página)
  if (!authStore.user && localStorage.getItem('authToken')) {
      authStore.initializeAuth();
  }

  // Obtiene el estado actual de autenticación y el rol del usuario
  const isAuthenticated = authStore.isAuthenticated;
  const userRole = authStore.userRole;

  // --- Lógica de Protección de Rutas ---

  // 1. Si la ruta es solo para invitados (guestOnly) y el usuario YA está autenticado:
  //    Redirigir al dashboard correspondiente según el rol.
  if (to.meta.guestOnly && isAuthenticated) {
    if (userRole === 'donator') {
      return next({ name: 'DashboardDonator' }); // Ir al dashboard de donador
    } else if (userRole === 'beneficiary') {
      return next({ name: 'DashboardBeneficiary' }); // Ir al dashboard de beneficiario
    } else {
      // Si está autenticado pero no tiene un rol específico o dashboard definido,
      // redirigirlo a una página segura por defecto (ej. lista de donaciones).
      // Evita redirigir a otra ruta guestOnly para prevenir bucles.
      return next({ name: 'UserDonations' });
    }
  }

  // 2. Si la ruta requiere autenticación (requiresAuth) y el usuario NO está autenticado:
  //    Redirigir a la página de Login, guardando la ruta original a la que intentaba acceder.
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'Login', query: { redirect: to.fullPath } });
  }

  // 3. Si la ruta requiere un rol específico (role) y el usuario está autenticado pero NO tiene ese rol:
  //    Redirigir al usuario a su propio dashboard (si tiene uno) o a una página de "No encontrado/No autorizado".
  if (to.meta.role && isAuthenticated && to.meta.role !== userRole) {
    console.warn(`Acceso denegado a ${to.path}. Rol requerido: ${to.meta.role}, Rol del usuario: ${userRole}`);
    if (userRole === 'donator') {
      return next({ name: 'DashboardDonator' }); // Devolver al dashboard de donador
    } else if (userRole === 'beneficiary') {
      return next({ name: 'DashboardBeneficiary' }); // Devolver al dashboard de beneficiario
    }
    // Si no tiene un rol con dashboard asociado, enviar a NotFound
    return next({ name: 'NotFound' });
  }

  // 4. Si ninguna de las condiciones anteriores se cumple, permitir la navegación.
  next();
});

// --- Exportar la instancia del router ---
export default router;