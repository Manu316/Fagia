import { defineStore } from 'pinia';
import apiClient from '@/api/api'; // Asegúrate que la ruta sea correcta
import router from '@/router';     // Asegúrate que la ruta sea correcta

// Función auxiliar para obtener y parsear el usuario de forma segura desde localStorage
const getInitialUser = () => {
  const userItem = localStorage.getItem('authUser');
  if (userItem && userItem !== "undefined" && userItem !== "null") {
    try {
      const parsedUser = JSON.parse(userItem);
      // Validamos que el usuario parseado tenga la propiedad 'role'
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
    user: getInitialUser(), // user será null o { role: '...' } u otros datos si se guardan
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
      // Opcional: Limpiar cabecera de autorización por defecto en apiClient si se estableció manualmente
      // delete apiClient.defaults.headers.common['Authorization'];
    },

    async login(credentials) {
      try {
        const loginResponse = await apiClient.post('/login', credentials);

        if (!loginResponse || !loginResponse.data || !loginResponse.data.token) {
          console.error("Token no encontrado o respuesta de login inválida.", loginResponse?.data);
          throw new Error("Respuesta de login inválida del servidor: token faltante.");
        }

        const { token } = loginResponse.data;
        this.token = token; // Establecer token en el estado
        localStorage.setItem('authToken', token); // Guardar token en localStorage

        // --- IMPORTANTE: apiClient DEBE ESTAR CONFIGURADO PARA ENVIAR ESTE TOKEN ---
        // (Usualmente mediante interceptores de Axios)

        let inferredUser = { role: null }; // Objeto base para el usuario inferido

        try {
          // 1. Intento para Donador usando GET /aliments
          console.debug("Intentando verificar rol de Donador con GET /aliments...");
          // Si /aliments devuelve datos del usuario, puedes capturarlos. Ejemplo:
          // const donatorCheckResponse = await apiClient.get('/aliments');
          await apiClient.get('/aliments'); // Solo verificamos el acceso
          inferredUser.role = 'donator';
          // Si la respuesta contiene datos del usuario, extráelos:
          // inferredUser.id = donatorCheckResponse.data.id; (ejemplo)
          // inferredUser.name = donatorCheckResponse.data.name; (ejemplo)
          console.info("Rol inferido: Donador (acceso a /aliments exitoso)");

        } catch (donatorError) {
          console.debug("Error al verificar rol de Donador con /aliments:", donatorError.response?.status, donatorError.message);
          if (donatorError.response && donatorError.response.status === 403) {
            console.info("/aliments no accesible (403). Intentando rol de Beneficiario...");
            
            // Declarar beneficiaryEndpoint aquí, fuera del try, para que esté disponible en el catch
            const daysToFilterBeneficiary = 7; // O el valor que necesites
            const beneficiaryEndpoint = `/donation/filter/${daysToFilterBeneficiary}`; // <--- DECLARADA AQUÍ

            // 2. Intento para Beneficiario
            try {
              console.debug(`Intentando verificar rol de Beneficiario con GET ${beneficiaryEndpoint}...`);
              await apiClient.get(beneficiaryEndpoint); // Solo verificamos el acceso
              inferredUser.role = 'beneficiary';
              console.info(`Rol inferido: Beneficiario (acceso a ${beneficiaryEndpoint} exitoso)`);
            } catch (beneficiaryError) {
              // Ahora 'beneficiaryEndpoint' está en el alcance y se puede usar en el log
              console.debug(`Error al verificar rol de Beneficiario con ${beneficiaryEndpoint}:`, beneficiaryError.response?.status, beneficiaryError.message);
              if (beneficiaryError.response && beneficiaryError.response.status === 403) {
                console.error("Acceso denegado (403) a rutas de prueba para ambos roles. No se puede determinar el rol.");
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

        if (!inferredUser.role) {
          // Si después de todos los intentos el rol sigue siendo null (no debería llegar aquí si la lógica es correcta)
          console.error("El rol del usuario no pudo ser inferido (inesperado).");
          this.clearAuthData();
          throw new Error("No se pudo inferir el rol del usuario.");
        }

        // Guardar token y el usuario (con el rol inferido) usando setAuthData
        this.setAuthData(this.token, inferredUser); // this.token ya fue establecido
        console.info("Autenticación y determinación de rol exitosas. Usuario:", this.user);

        // Redirección basada en el rol inferido
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
        // El mensaje de error ya debería haber sido logueado por los catch internos si es específico.
        // Este es el error final que se propaga al componente de login.
        const errorMessage = error.message || "Error desconocido durante el proceso de login.";
        console.error("Fallo final en la acción authStore.login:", errorMessage);
        throw new Error(errorMessage);
      }
    },

    async registerDonator(donatorData) {
      try {
        const response = await apiClient.post('/account/register-donator', donatorData);
        return response.data;
      } catch (error) {
        console.error("Error en authStore.registerDonator:", error.response?.data || error.message || error);
        throw error;
      }
    },

    async registerBeneficiary(beneficiaryData) {
      try {
        const response = await apiClient.post('/account/register-beneficiary', beneficiaryData);
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
            // Opcional: Configurar cabecera de apiClient si es necesario al inicio
            // apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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