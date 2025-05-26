// src/main.js
// Punto de entrada principal de la aplicación Vue
import { createApp } from 'vue';
import { createPinia } from 'pinia'; // Importa Pinia

import App from './App.vue';
import router from './router'; // Importa tu router configurado

// Importa CSS global o frameworks como Tailwind aquí si es necesario
import './assets/main.css'; // Asumiendo que tienes un archivo CSS principal en assets

const app = createApp(App);

// --- Pinia Setup ---
const pinia = createPinia();
app.use(pinia);

// --- Inicialización de Autenticación ---
// Importa el store DESPUÉS de crear Pinia y ANTES de montar la app
// Esto asegura que el store esté disponible para el guardia de ruta inicial
import { useAuthStore } from '@/stores/authStore';
const authStore = useAuthStore(); // Obtiene la instancia del store

// Intenta restaurar el estado de autenticación desde localStorage al iniciar
// Es crucial hacerlo antes de que el router intente proteger rutas
try {
  authStore.initializeAuth();
} catch (error) {
  console.error("Error during initial auth initialization:", error);
  // Podrías querer limpiar el localStorage aquí si la inicialización falla catastróficamente
  // localStorage.clear();
}


// --- Vue Router Setup ---
// El router ya tiene el guardia beforeEach que usará el store (que ahora está inicializado)
app.use(router);

// --- Montar la Aplicación ---
// Asegúrate de que el router esté listo antes de montar
router.isReady().then(() => {
  app.mount('#app');
  console.log('Vue App Mounted');
});