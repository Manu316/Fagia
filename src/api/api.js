import axios from 'axios';
import { useAuthStore } from '@/stores/authStore'; // Ajusta la ruta si es necesario

const apiClient = axios.create({
  baseURL: 'http://localhost:8080', // URL base de tu backend Rust
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token JWT a las solicitudes
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const token = authStore.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Opcional: Interceptor para manejar errores 401 (no autorizado) globalmente
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const authStore = useAuthStore();
    if (error.response && error.response.status === 401) {
      // Token inválido o expirado
      authStore.logout(); // Limpia el token y redirige al login
      // Podrías también intentar refrescar el token aquí si tuvieras esa lógica
    }
    return Promise.reject(error);
  }
);

export default apiClient;