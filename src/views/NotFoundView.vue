<template>
  <div class="flex flex-col items-center justify-center min-h-[70vh] text-center px-6 bg-white py-12 rounded-lg shadow-lg border border-gray-200">
    <h1 class="text-5xl sm:text-6xl font-extrabold text-gray-800 mb-4 tracking-tight">404</h1>
    <h2 class="text-xl sm:text-2xl font-semibold text-gray-700 mb-4">Página No Encontrada</h2>
    <p class="text-gray-500 max-w-md mx-auto mb-8">Ups... Parece que te has perdido. La página que buscas no existe o ha sido movida.</p>
    <router-link
      :to="authStore.isAuthenticated ? getDashboardPath() : '/login'"
      class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out shadow-md"
    >
      {{ authStore.isAuthenticated ? 'Volver al Panel Principal' : 'Ir a Iniciar Sesión' }}
    </router-link>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore';
const authStore = useAuthStore();

// Función para determinar la ruta del dashboard dinámicamente
const getDashboardPath = () => {
  if (authStore.userRole === 'donator') {
    return '/donator/dashboard';
  } else if (authStore.userRole === 'beneficiary') {
    return '/beneficiary/dashboard';
  }
  return '/'; // Ruta por defecto si no hay rol o es desconocido
};
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>