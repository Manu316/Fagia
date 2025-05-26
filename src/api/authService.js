// src/api/authService.js
// Servicio para la autenticación
import apiClient from './api';

/**
 * Realiza la petición de login al backend.
 * @param {object} credentials - Objeto con { username, password }. Ajusta 'username' si usas email.
 * @returns {Promise<object>} - Promesa que resuelve con los datos de la respuesta (ej: { token, user }).
 */
export const login = async (credentials) => {
  try {
    console.log('Intentando login con credenciales:', credentials.username);
    // Asegúrate que la ruta '/account/login' es correcta según tu backend Rust
    const response = await apiClient.post('/account/login', credentials);
    console.log('Respuesta de login exitosa:', response.data);
    return response.data; // Devuelve los datos (ej: { token, user })
  } catch (error) {
    // El interceptor de respuesta ya debería haber logueado el error
    // console.error("Error específico en authService.login:", error.response?.data || error.message);
    // Relanza el error para que el store lo maneje (ej: mostrar mensaje al usuario)
    throw error;
  }
};

/**
 * Realiza la petición de registro al backend.
 * @param {object} userData - Datos del usuario para el registro.
 * @param {string} userType - 'donator' o 'beneficiary'.
 * @returns {Promise<object>} - Promesa que resuelve con los datos de la respuesta.
 */
export const signup = async (userData, userType) => {
    try {
      // Construye la ruta dinámicamente
      const endpoint = `/account/register/${userType}`; // donator o beneficiary
      // Asume que el email se usa como username único para el log
      console.log(`Intentando registro en ${endpoint} para:`, userData.email);
      const response = await apiClient.post(endpoint, userData);
      console.log('Respuesta de registro exitosa:', response.data);
      return response.data;
    } catch (error) {
      // El interceptor ya loguea
      // console.error(`Error específico en authService.signup (${userType}):`, error.response?.data || error.message);
      throw error;
    }
  };

// Podrías añadir una función para obtener el perfil del usuario actual si tu API lo permite
// export const getProfile = async () => {
//   try {
//     const response = await apiClient.get('/account/profile'); // Endpoint de ejemplo
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// }
