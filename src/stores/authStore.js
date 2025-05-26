import { defineStore } from 'pinia';
import apiClient from '@/api/api';
import router from '@/router';

const getInitialUser = () => {
  const userItem = localStorage.getItem('authUser');
  if (userItem && userItem !== "undefined" && userItem !== "null") {
    try {
      const parsedUser = JSON.parse(userItem);
      if (parsedUser && typeof parsedUser === 'object' && Object.keys(parsedUser).length > 0 && parsedUser.role) {
        return parsedUser;
      }
      localStorage.removeItem('authUser');
      return null;
    } catch (e) {
      console.error("Failed to parse 'authUser' from localStorage:", e);
      localStorage.removeItem('authUser');
      return null;
    }
  }
  if (userItem === "undefined" || userItem === "null" || userItem === null) {
    localStorage.removeItem('authUser');
  }
  return null;
};

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('authToken') || null,
    user: getInitialUser(),
  }),
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user && !!state.user.role,
    userRole: (state) => state.user?.role || null,
    isDonator: (state) => state.user?.role === 'donator',
    isBeneficiary: (state) => state.user?.role === 'beneficiary',
  },
  actions: {
    setAuthData(token, userDataWithRole) {
      this.token = token;
      this.user = userDataWithRole;
      localStorage.setItem('authToken', token);
      if (userDataWithRole && userDataWithRole.role) {
        localStorage.setItem('authUser', JSON.stringify(userDataWithRole));
      } else {
        localStorage.removeItem('authUser');
      }
    },

    clearAuthData() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    },

    async login(credentials) {
      try {
        const loginResponse = await apiClient.post('/login', credentials);

        if (!loginResponse || !loginResponse.data || !loginResponse.data.token) {
          console.error("Token no encontrado o respuesta de login inválida.", loginResponse?.data);
          throw new Error("Respuesta de login inválida del servidor: token faltante.");
        }

        const { token } = loginResponse.data;
        this.token = token;
        localStorage.setItem('authToken', token);

        let inferredRole = null;
        let userData = {};

        try {
          console.debug("Intentando verificar rol de Donador con GET /aliments...");
          await apiClient.get('/aliments');
          inferredRole = 'donator';
          console.info("Rol inferido: Donador (acceso a /aliments exitoso)");
        } catch (donatorError) {
          console.debug("Error al verificar rol de Donador con /aliments:", donatorError.response?.status, donatorError.message);
          if (donatorError.response && (donatorError.response.status === 403 || donatorError.response.status === 401)) {
            console.info(`/aliments no accesible (${donatorError.response.status}). Intentando rol de Beneficiario...`);

            const daysToFilterBeneficiary = 7;
            const beneficiaryEndpoint = `/beneficiary/donation/filter/${daysToFilterBeneficiary}`;

            try {
              console.debug(`Intentando verificar rol de Beneficiario con GET ${beneficiaryEndpoint}...`);
              await apiClient.get(beneficiaryEndpoint);
              inferredRole = 'beneficiary';
              console.info(`Rol inferido: Beneficiario (acceso a ${beneficiaryEndpoint} exitoso)`);
            } catch (beneficiaryError) {
              console.debug(`Error al verificar rol de Beneficiario con ${beneficiaryEndpoint}:`, beneficiaryError.response?.status, beneficiaryError.message);
              if (beneficiaryError.response && (beneficiaryError.response.status === 403 || beneficiaryError.response.status === 401)) {
                console.error(`Acceso denegado (${beneficiaryError.response.status}) a rutas de prueba para ambos roles. No se puede determinar el rol.`);
                this.clearAuthData();
                throw new Error("No se pudo determinar el rol del usuario (acceso denegado a rutas de rol).");
              }
              this.clearAuthData();
              throw new Error(`Fallo crítico al verificar el rol de beneficiario: ${beneficiaryError.message}`);
            }
          } else {
            this.clearAuthData();
            throw new Error(`Fallo crítico al verificar el rol de donador: ${donatorError.message}`);
          }
        }

        if (!inferredRole) {
          console.error("El rol del usuario no pudo ser inferido (inesperado).");
          this.clearAuthData();
          throw new Error("No se pudo inferir el rol del usuario.");
        }

        try {
          const profileResponse = await apiClient.get('/account');
          if (profileResponse.data) {
            if (profileResponse.data.creds && profileResponse.data.data) {
              userData = {
                ...profileResponse.data.creds,
                ...profileResponse.data.data,
                role: inferredRole, 
              };
            } else {
              console.warn("La respuesta de /account no tiene el formato esperado (creds/data). Guardando rol inferido.");
              userData = { role: inferredRole };
            }
          } else {
            console.warn("Respuesta vacía de /account. Guardando solo rol inferido.");
            userData = { role: inferredRole };
          }
        } catch (profileError) {
          console.error("Error al obtener datos del perfil después del login:", profileError.message);
          userData = { role: inferredRole };
        }

        this.setAuthData(this.token, userData);
        console.info("Autenticación y determinación de rol exitosas. Usuario:", this.user);

        if (this.user.role === 'donator') {
          router.push('/donator/dashboard');
        } else if (this.user.role === 'beneficiary') {
          router.push('/beneficiary/dashboard');
        } else {
          console.warn("Rol de usuario desconocido para redirección (inesperado), usando fallback.");
          router.push('/donations');
        }
        return true;

      } catch (error) {
        this.clearAuthData();
        const errorMessage = error.message || "Error desconocido durante el proceso de login.";
        console.error("Fallo final en la acción authStore.login:", errorMessage);
        throw new Error(errorMessage);
      }
    },

    async registerDonator(donatorData) {
      try {
        const response = await apiClient.post('/register-donator', donatorData); //
        return response.data;
      } catch (error) {
        console.error("Error en authStore.registerDonator:", error.response?.data || error.message || error);
        throw error;
      }
    },

    async registerBeneficiary(beneficiaryData) {
      try {
        const response = await apiClient.post('/register-beneficiary', beneficiaryData); //
        return response.data;
      } catch (error) {
        console.error("Error en authStore.registerBeneficiary:", error.response?.data || error.message || error);
        throw error;
      }
    },

    logout() {
      this.clearAuthData();
      router.push('/login');
    },

    initializeAuth() {
      const token = localStorage.getItem('authToken');
      const userItem = localStorage.getItem('authUser');

      if (token && userItem && userItem !== "undefined" && userItem !== "null") {
        try {
          const parsedUser = JSON.parse(userItem);
          if (parsedUser && typeof parsedUser === 'object' && parsedUser.role) {
            this.token = token;
            this.user = parsedUser;
          } else {
            console.warn("Datos de usuario en localStorage inválidos o sin rol durante initializeAuth. Limpiando.");
            this.clearAuthData();
          }
        } catch (e) {
          console.error("Error al parsear 'authUser' durante initializeAuth:", e);
          this.clearAuthData();
        }
      } else {
        if (token && (!userItem || userItem === "undefined" || userItem === "null")) {
          console.warn("Token presente pero 'authUser' faltante o inválido en localStorage durante initializeAuth. Limpiando.");
        }
        this.clearAuthData();
      }
    }
  },
});