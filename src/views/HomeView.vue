<template>
    <div class="home-view bg-gray-50 min-h-screen flex flex-col">
      <header class="bg-white shadow-sm">
        <nav class="container mx-auto px-6 py-3 flex justify-between items-center">
          <router-link to="/" class="text-2xl font-bold text-blue-600">
            FagiaApp
          </router-link>
          <div>
            <router-link
              v-if="!authStore.isAuthenticated"
              to="/login"
              class="px-4 py-2 text-blue-600 hover:text-blue-700 transition"
            >
              Iniciar Sesión
            </router-link>
            <router-link
              v-if="!authStore.isAuthenticated"
              to="/register-donator"
              class="ml-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Registrarse como Donador
            </router-link>
            <router-link
              v-if="authStore.isAuthenticated"
              :to="dashboardPath"
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Ir al Panel
            </router-link>
            <button
              v-if="authStore.isAuthenticated"
              @click="handleLogout"
              class="ml-2 px-4 py-2 text-red-500 hover:text-red-700 transition"
            >
              Cerrar Sesión
            </button>
          </div>
        </nav>
      </header>
  
      <section class="flex-grow flex items-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div class="container mx-auto px-6 text-center py-20">
          <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Conectando Corazones, <br class="hidden sm:block" /> Compartiendo Alimentos
          </h1>
          <p class="text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Nuestra plataforma facilita la donación de alimentos de quienes tienen de más,
            a quienes más lo necesitan en nuestra comunidad.
          </p>
          <div class="space-y-4 sm:space-y-0 sm:space-x-4">
            <router-link
              to="/register-donator"
              class="inline-block px-8 py-3 bg-green-500 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-green-600 transition duration-300 transform hover:scale-105"
            >
              Quiero Donar
            </router-link>
            <router-link
              to="/register-beneficiary"
              class="inline-block px-8 py-3 bg-yellow-400 text-gray-800 text-lg font-semibold rounded-lg shadow-md hover:bg-yellow-500 transition duration-300 transform hover:scale-105"
            >
              Necesito Ayuda
            </router-link>
          </div>
        </div>
      </section>
  
      <section class="py-16 bg-white">
        <div class="container mx-auto px-6">
          <h2 class="text-3xl font-bold text-center text-gray-800 mb-12">¿Cómo Funciona?</h2>
          <div class="grid md:grid-cols-3 gap-8 text-center">
            <div class="p-6 bg-gray-50 rounded-lg shadow-lg border border-gray-200">
              <div class="text-blue-500 mb-4 inline-block p-3 bg-blue-100 rounded-full">
                <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-700 mb-2">1. Regístrate</h3>
              <p class="text-gray-600">Crea una cuenta como donador o beneficiario en simples pasos.</p>
            </div>
            <div class="p-6 bg-gray-50 rounded-lg shadow-lg border border-gray-200">
              <div class="text-green-500 mb-4 inline-block p-3 bg-green-100 rounded-full">
                <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-700 mb-2">2. Publica o Encuentra</h3>
              <p class="text-gray-600">Los donadores publican alimentos disponibles. Los beneficiarios buscan lo que necesitan.</p>
            </div>
            <div class="p-6 bg-gray-50 rounded-lg shadow-lg border border-gray-200">
              <div class="text-yellow-500 mb-4 inline-block p-3 bg-yellow-100 rounded-full">
                <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path></svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-700 mb-2">3. Conecta y Comparte</h3>
              <p class="text-gray-600">Coordina la entrega y ayuda a reducir el desperdicio de alimentos.</p>
            </div>
          </div>
        </div>
      </section>
  
      <footer class="bg-gray-800 text-white text-center p-6 mt-auto">
        <p>&copy; {{ new Date().getFullYear() }} FagiaApp. Todos los derechos reservados.</p>
        <p class="text-sm text-gray-400">Conectando para un futuro sin hambre.</p>
      </footer>
  
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  import { useAuthStore } from '@/stores/authStore';
  import { useRouter } from 'vue-router';
  
  const authStore = useAuthStore();
  const router = useRouter();
  
  const dashboardPath = computed(() => {
    if (!authStore.isAuthenticated) return '/'; 
    if (authStore.userRole === 'donator') {
      return '/donator/dashboard';
    } else if (authStore.userRole === 'beneficiary') {
      return '/beneficiary/dashboard';
    }
    return '/';
  });
  
  const handleLogout = async () => {
    await authStore.logout();
    router.push('/login');
  };
  </script>
  
  <style scoped>

  </style>