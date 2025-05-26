import { defineStore } from 'pinia';
import apiClient from '@/api/api';
import router from '@/router';

// Función auxiliar para obtener y parsear el usuario de forma segura desde localStorage
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
            console.log('Función authStore.login iniciada.');
            this.clearAuthData(); // Limpia datos de auth previos al inicio

            try {
                const loginResponse = await apiClient.post('/login', credentials);

                if (!loginResponse?.data?.token) {
                    console.error("Token no encontrado o respuesta de login inválida.", loginResponse?.data);
                    throw new Error("Respuesta de login inválida del servidor: token faltante.");
                }

                const { token } = loginResponse.data;
                this.token = token; // Establece el token en el estado para futuras llamadas
                localStorage.setItem('authToken', token); // Almacena el token

                let inferredRole = null;
                let fullUserData = {}; 

                // Intentar obtener los datos generales del perfil del usuario (manejo de error más laxo aquí)
                try {
                    const profileResponse = await apiClient.get('/account');
                    if (profileResponse.data) {
                        if (profileResponse.data.creds && profileResponse.data.data) {
                            fullUserData = {
                                ...profileResponse.data.creds,
                                ...profileResponse.data.data,
                            };
                        } else {
                            fullUserData = profileResponse.data;
                            console.warn("La respuesta de /account no tiene el formato esperado (creds/data).");
                        }
                    }
                } catch (profileError) {
                    console.warn("No se pudieron obtener datos del perfil general (/account). Esto podría ser normal si es un endpoint protegido o no esencial para el rol:", profileError.message);
                }

                // **Intentar ambas verificaciones de rol y registrar los resultados**
                let isBeneficiary = false;
                let isDonator = false;

                // Intento Beneficiario
                try {
                    console.debug("Intentando verificar rol de Beneficiario con GET /beneficiary/donation/filter/7...");
                    await apiClient.get(`/beneficiary/donation/filter/7`);
                    isBeneficiary = true;
                    console.info("Acceso a /beneficiary/donation/filter/7 exitoso (potencial Beneficiario).");
                } catch (beneficiaryError) {
                    if (beneficiaryError.response && (beneficiaryError.response.status === 403 || beneficiaryError.response.status === 401)) {
                        console.info("Acceso a /beneficiary/donation/filter/7 denegado (401/403). No es Beneficiario.");
                    } else {
                        console.warn("Error inesperado al probar Beneficiario:", beneficiaryError.response?.status, beneficiaryError.message);
                    }
                }

                // Intento Donador
                try {
                    console.debug("Intentando verificar rol de Donador con GET /aliments...");
                    await apiClient.get('/aliments');
                    isDonator = true;
                    console.info("Acceso a /aliments exitoso (potencial Donador).");
                } catch (donatorError) {
                    if (donatorError.response && (donatorError.response.status === 403 || donatorError.response.status === 401)) {
                        console.info("Acceso a /aliments denegado (401/403). No es Donador.");
                    } else {
                        console.warn("Error inesperado al probar Donador:", donatorError.response?.status, donatorError.message);
                    }
                }

                // **Determinar el rol basado en los resultados de ambas pruebas**
                if (isBeneficiary && !isDonator) {
                    inferredRole = 'beneficiary';
                } else if (isDonator && !isBeneficiary) {
                    inferredRole = 'donator';
                } else if (isBeneficiary && isDonator) {
                    // Este es el escenario problemático si el backend no restringe bien las rutas.
                    // Podrías necesitar una heurística aquí, por ejemplo, darle prioridad a un rol.
                    // ¡O esto indica un grave problema de seguridad en el backend!
                    console.warn("¡Advertencia! El usuario tiene acceso a rutas de Beneficiario Y Donador. Esto es un problema de autorización del backend.");
                    // En este caso, podrías elegir un rol por defecto o el que tenga mayor prioridad.
                    // Por simplicidad, si ambos dan 200, podríamos seguir con beneficiario,
                    // pero es fundamental solucionar el backend.
                    inferredRole = 'beneficiary'; // O 'donator', según tu decisión.
                } else {
                    // Ninguna de las pruebas de rol fue exitosa o ambas tuvieron errores inesperados.
                    console.error("El rol del usuario no pudo ser inferido. Posibles problemas: credenciales inválidas, usuario sin rol, o errores en el backend no relacionados con autorización (500, red).");
                    this.clearAuthData();
                    throw new Error("No se pudo inferir el rol del usuario. Verifica tus credenciales.");
                }

                // Guardar token y el usuario (con el rol inferido y otros datos)
                this.setAuthData(this.token, { ...fullUserData, role: inferredRole });
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
                const errorMessage = error.response?.data?.message || error.message || "Error desconocido durante el proceso de login.";
                console.error("Fallo final en la acción authStore.login:", errorMessage);
                throw new Error(errorMessage);
            }
        },

        // ... (el resto de tus acciones como registerDonator, registerBeneficiary, logout, initializeAuth permanecen sin cambios)
        async registerDonator(donatorData) {
            try {
                const response = await apiClient.post('/register-donator', donatorData);
                return response.data;
            } catch (error) {
                console.error("Error en authStore.registerDonator:", error.response?.data || error.message || error);
                throw error;
            }
        },

        async registerBeneficiary(beneficiaryData) {
            try {
                const response = await apiClient.post('/register-beneficiary', beneficiaryData);
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