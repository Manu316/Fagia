<template>
  <div id="app" class="font-sans antialiased text-gray-900 bg-gray-50 min-h-screen flex flex-col">

    <header v-if="authStore.isAuthenticated" class="bg-gradient-to-r from-gray-800 to-gray-700 text-white shadow-lg sticky top-0 z-40">
      <nav class="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-end items-center">
        <button @click="handleLogout"
          class="ml-auto px-6 py-3 bg-red-600 text-white font-bold rounded-lg shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-300 ease-in-out">
          Cerrar Sesión
        </button>
      </nav>
    </header>

    <main class="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
      <router-view v-slot="{ Component, route }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </router-view>
    </main>

    <footer class="bg-gray-200 text-center p-4 text-gray-600 text-xs border-t border-gray-300 mt-auto">
      FAGIA &copy; {{ new Date().getFullYear() }} - Sistema de Gestión de Alimentos.
    </footer>

  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
}
</script>

<style>
/* Basic body styles */
body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  height: 100%;
}

/* Ensure the root HTML element also takes full height */
html {
  height: 100%;
}

/* Vue Transition styles */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>