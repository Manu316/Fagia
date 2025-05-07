// src/stores/authStore.js
import { defineStore } from 'pinia';
import apiClient from '@/api/api'; // Asegúrate que la ruta a tu api.js es correcta
import router from '@/router';     // Importa tu instancia de Vue Router

// Función auxiliar para obtener y parsear el usuario de forma segura desde localStorage
const getInitialUser = () => {
  const userItem = localStorage.getItem('authUser');
  if (userItem && userItem !== "undefined" && userItem !== "null") { // Comprueba que no sea null, ni la cadena "undefined", ni la cadena "null"
    try {
      const parsedUser = JSON.parse(userItem);
      // Valida que el usuario parseado no sea null o un objeto vacío si eso no es deseado
      if (parsedUser && typeof parsedUser === 'object' && Object.keys(parsedUser).length > 0) {
        return parsedUser;
      }
      // Si parsedUser es null o un objeto vacío después del parseo, trátalo como inválido
      localStorage.removeItem('authUser');
      return null;
    } catch (e) {
      console.error("Failed to parse 'authUser' from localStorage:", e);
      localStorage.removeItem('authUser'); // Limpiar ítem corrupto
      return null;
    }
  }
  // Si userItem es null, "undefined", o "null", se considera inválido
  if (userItem === "undefined" || userItem === "null") {
    localStorage.removeItem('authUser'); // Limpiar si es una cadena inválida
  }
  return null;
};

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('authToken') || null,
    user: getInitialUser(), // Usa la función auxiliar para inicializar el usuario
  }),
  getters: {
    // Considera que isAuthenticated sea verdadero solo si hay token Y usuario
    isAuthenticated: (state) => !!state.token && !!state.user,
    userRole: (state) => state.user?.role || null,
    isDonator: (state) => state.user?.role === 'donator',
    isBeneficiary: (state) => state.user?.role === 'beneficiary',
  },
  actions: {
    // Acción centralizada para establecer los datos de autenticación
    setAuthData(token, userData) {
      this.token = token;
      this.user = userData;
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(userData));
    },

    // Acción centralizada para limpiar los datos de autenticación
    clearAuthData() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    },

    async login(credentials) {
      try {
        // Asegúrate que el endpoint '/account/login' es el que usa tu apiClient
        // Tu apiClient ya tiene la baseURL 'http://localhost:8080'
        const response = await apiClient.post('/login', credentials);
        const { token, user } = response.data; // Asume que el backend devuelve { token, user: { email, role, ... } }

        if (token && user) {
          this.setAuthData(token, user);

          // Redirigir al dashboard correspondiente según el rol
          if (user.role === 'donator') {
            router.push('/donator/dashboard');
          } else if (user.role === 'beneficiary') {
            router.push('/beneficiary/dashboard');
          } else {
            // Fallback si el rol no está definido o no hay dashboard específico
            router.push('/donations'); // O la ruta raíz de la app para usuarios logueados
          }
          return true; // Indicar éxito para que el componente de login pueda reaccionar
        } else {
          // Si la respuesta no contiene token o user, es un error inesperado del backend
          throw new Error("Respuesta de login inválida del servidor.");
        }
      } catch (error) {
        this.clearAuthData(); // Limpiar datos en caso de error de login
        console.error("Error en authStore.login:", error.response?.data || error.message || error);
        throw error; // Relanzar para que el componente de login lo maneje y muestre un mensaje al usuario
      }
    },

    async registerDonator(donatorData) {
      // Ajusta el endpoint si es necesario, ej: '/account/register/donator'
      // Tu apiClient ya tiene la baseURL
      await apiClient.post('/account/register-donator', donatorData);
      // Considera la respuesta. ¿Debería loguear automáticamente? ¿Mostrar un mensaje?
      // Por ahora, solo hace la petición. El componente de registro maneja el mensaje.
    },

    async registerBeneficiary(beneficiaryData) {
      // Ajusta el endpoint si es necesario, ej: '/account/register/beneficiary'
      await apiClient.post('/account/register-beneficiary', beneficiaryData);
      // Similar al registro de donador, considera el flujo post-registro.
    },

    logout() {
      this.clearAuthData();
      router.push('/login'); // Redirige a login después de cerrar sesión
                             // O a la ruta raíz si es /register-donator
    },

    initializeAuth() {
      const token = localStorage.getItem('authToken');
      const userItem = localStorage.getItem('authUser'); // Obtener el string

      if (token && userItem && userItem !== "undefined" && userItem !== "null") {
        try {
          const parsedUser = JSON.parse(userItem);
          if (parsedUser && typeof parsedUser === 'object' && Object.keys(parsedUser).length > 0) {
            this.token = token;
            this.user = parsedUser;
          } else {
            // El JSON parseado es null o un objeto vacío, considéralo inválido
            this.clearAuthData();
          }
        } catch (e) {
          console.error("Error parsing 'authUser' during initializeAuth:", e);
          this.clearAuthData(); // Limpiar si hay un error de parseo
        }
      } else {
        // Si falta el token, o userItem es la cadena "undefined" o "null", o es null
        this.clearAuthData();
      }
    }
  },
});