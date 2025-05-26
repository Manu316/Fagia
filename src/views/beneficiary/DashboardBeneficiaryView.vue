<template>
    <div class="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <h1 class="text-3xl font-bold mb-6 text-gray-800 border-b border-gray-300 pb-3">Panel Principal</h1>
  
      <div v-if="authStore.user" class="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <p class="text-lg text-blue-800">
          ¡Bienvenido de nuevo, <span class="font-semibold">{{ authStore.user.name || authStore.user.username || 'Usuario' }}</span>!
        </p>
        <p class="text-sm text-blue-700 mt-1">
          Tu rol actual es: <span class="px-2 py-0.5 bg-blue-100 text-blue-800 font-medium rounded-full">{{ authStore.userRole || 'No definido' }}</span>
        </p>
      </div>
       <div v-else class="text-center text-gray-500 mb-8">
          Cargando información del usuario...
      </div>
  
      <h2 class="text-xl font-semibold text-gray-700 mb-4">Accesos Rápidos</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  
         <div class="bg-gray-50 p-5 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
             <h3 class="text-lg font-semibold text-gray-700 mb-2">Gestionar Alimentos</h3>
             <p class="text-sm text-gray-600 mb-3">Añade, edita o elimina alimentos del inventario.</p>
             <router-link
                  to="/aliments"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out">
                  Ir a Alimentos
                  <svg class="ml-2 -mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
              </router-link>
         </div>
  
         <div v-if="authStore.userRole === 'Donator'" class="bg-gray-50 p-5 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
             <h3 class="text-lg font-semibold text-gray-700 mb-2">Registrar Donación</h3>
             <p class="text-sm text-gray-600 mb-3">Inicia el proceso para registrar una nueva donación de alimentos.</p>
             <button disabled class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-400 bg-gray-200 cursor-not-allowed">
                  Nueva Donación (Próximamente)
               </button>
         </div>
  
          <div v-if="authStore.userRole === 'Donator' || authStore.userRole === 'Beneficiary'" class="bg-gray-50 p-5 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
             <h3 class="text-lg font-semibold text-gray-700 mb-2">Mis Donaciones</h3>
             <p class="text-sm text-gray-600 mb-3">Consulta el historial y estado de tus donaciones.</p>
             <button disabled class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-400 bg-gray-200 cursor-not-allowed">
                  Ver Historial (Próximamente)
               </button>
         </div>
  
         </div>
    </div>
  </template>
  
  <script setup>
  import { useAuthStore } from '@/stores/authStore';
  import { onMounted } from 'vue';
  
  const authStore = useAuthStore();
  
  onMounted(() => {
    console.log('Dashboard montado. Usuario:', authStore.user, 'Rol:', authStore.userRole);
  
  });
  </script>
  
  <style scoped>

  </style>
  