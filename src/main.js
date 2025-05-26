import { createApp } from 'vue';
import { createPinia } from 'pinia'; 

import App from './App.vue';
import router from './router'; 


import './assets/main.css'; 

const app = createApp(App);

// --- Pinia Setup ---
const pinia = createPinia();
app.use(pinia);

// --- Inicialización de Autenticación ---
import { useAuthStore } from '@/stores/authStore';
const authStore = useAuthStore(); 

try {
  authStore.initializeAuth();
} catch (error) {
  console.error("Error during initial auth initialization:", error);

}


// --- Vue Router Setup ---
app.use(router);

// --- Montar la Aplicación ---
router.isReady().then(() => {
  app.mount('#app');
  console.log('Vue App Mounted');
});