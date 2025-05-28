import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

import LoginView from '@/views/auth/LoginView.vue';
import RegisterDonatorView from '@/views/auth/RegisterDonatorView.vue';
import RegisterBeneficiaryView from '@/views/auth/RegisterBeneficiaryView.vue';
import NotFoundView from '@/views/NotFoundView.vue';

import UserDonationsView from '@/views/common/UserDonationsView.vue';

import DashboardDonatorView from '@/views/donator/DashboardDonatorView.vue';
import AlimentsView from '@/views/donator/AlimentsView.vue';
import CreateAlimentView from '@/views/donator/CreateAlimentView.vue';
import EditAlimentView from '@/views/donator/EditAlimentView.vue';
import CreateDonationView from '@/views/donator/CreateDonationView.vue';

import DashboardBeneficiaryView from '@/views/beneficiary/DashboardBeneficiaryView.vue';
import DonationsView from '@/views/beneficiary/DonationsView.vue';

const routes = [
  {
    path: '/',
    redirect: '/register-donator'
  },
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
  {
    path: '/donations',
    name: 'UserDonations',
    component: UserDonationsView,
    meta: { requiresAuth: true },
  },
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
  {
    path: '/donator/aliments/create',
    name: 'CreateAliment',
    component: CreateAlimentView,
    meta: { requiresAuth: true, role: 'donator' },
  },
  {
    path: '/donator/aliments/:id/edit',
    name: 'EditAliment',
    component: EditAlimentView,
    props: true,
    meta: { requiresAuth: true, role: 'donator' },
  },
  {
    path: '/donator/donations/create',
    name: 'CreateDonation',
    component: CreateDonationView,
    meta: { requiresAuth: true, role: 'donator' },
  },
  {
    path: '/beneficiary/dashboard',
    name: 'DashboardBeneficiary',
    component: DashboardBeneficiaryView,
    meta: { requiresAuth: true, role: 'beneficiary' },
  },
  {
    path: '/beneficiary/donations',
    name: 'BeneficiaryDonations',
    component: DonationsView,
    meta: { requiresAuth: true, role: 'beneficiary' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  const isAuthenticated = authStore.isAuthenticated;
  const userRole = authStore.userRole;

  if (to.meta.guestOnly && isAuthenticated) {
    if (userRole === 'donator') {
      return next({ name: 'DashboardDonator' });
    } else if (userRole === 'beneficiary') {
      return next({ name: 'DashboardBeneficiary' });
    } else {
      // If user is authenticated but has an unknown role, redirect to UserDonations
      return next({ name: 'UserDonations' });
    }
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Redirect to login if authentication is required but user is not authenticated
    return next({ name: 'Login', query: { redirect: to.fullPath } });
  }

  if (to.meta.role && isAuthenticated && to.meta.role !== userRole) {
    console.warn(`Acceso denegado a ${to.path}. Rol requerido: ${to.meta.role}, Rol del usuario: ${userRole}`);
    // Redirect based on user role if they try to access a forbidden route
    if (userRole === 'donator') {
      return next({ name: 'DashboardDonator' });
    } else if (userRole === 'beneficiary') {
      return next({ name: 'DashboardBeneficiary' });
    }
    // If the role is not recognized or no specific dashboard for that role, go to NotFound
    return next({ name: 'NotFound' });
  }

  next();
});

export default router;