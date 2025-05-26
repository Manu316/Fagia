<template>
  <div id="app" class="font-sans antialiased text-gray-900 bg-gray-50 min-h-screen flex flex-col">

    <header v-if="authStore.isAuthenticated" class="bg-gradient-to-r from-gray-800 to-gray-700 text-white shadow-lg sticky top-0 z-40">
        <nav class="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
            <router-link to="/dashboard" class="text-xl font-bold hover:text-gray-300 transition duration-150 ease-in-out">
                FAGIA
            </router-link>

            <div class="flex items-center space-x-2 sm:space-x-4">
                <router-link
                    to="/dashboard"
                    class="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition duration-150 ease-in-out"
                    active-class="bg-gray-900" exact-active-class="bg-gray-900">
                    Dashboard
                </router-link>
                <router-link
                    to="/aliments"
                    class="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition duration-150 ease-in-out"
                    active-class="bg-gray-900">
                    Alimentos
                </router-link>
                 <button @click="handleLogout" class="ml-3 px-3 py-2 bg-red-600 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 transition duration-150 ease-in-out">
                    Cerrar Sesión
                </button>
                 </div>
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
 const authStore = useAuthStore();

 const handleLogout = () => {
     authStore.logout();
 }

</script>

<style>

body {
  margin: 0;
  font-family: 'Inter', sans-serif; 
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
