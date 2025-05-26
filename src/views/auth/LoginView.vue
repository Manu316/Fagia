<template>
  <div class="container">
    <h2>Iniciar Sesión</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">Email:</label>
        <input id="email" type="email" v-model="credentials.email" required />
      </div>
      <div class="form-group">
        <label for="password">Contraseña:</label>
        <input id="password" type="password" v-model="credentials.password" required />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Iniciando...' : 'Login' }}
      </button>
      <p v-if="error" class="error-message">{{ error }}</p>
    </form>

    <div class="mt-4 text-center">
      <p>
        ¿No tienes una cuenta?
        <router-link to="/register-donator" class="text-blue-600 hover:underline">
          Regístrate Aquí
        </router-link>
        </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const credentials = ref({
  email: '',
  password: '',
});
const loading = ref(false);
const error = ref(null);

const handleLogin = async () => {
  console.log('Función handleLogin iniciada.'); // Para depuración
  loading.value = true;
  error.value = null;
  try {
    await authStore.login(credentials.value);
    // La redirección se maneja dentro de la acción de login en authStore
  } catch (err) {
    // Asegúrate que el error que viene del store (o Axios) sea útil para el usuario
    if (err.response && err.response.data) {
        // Intenta obtener un mensaje más específico del backend, asumiendo 'message'
        error.value = err.response.data.message || 'Credenciales incorrectas o error en el servidor.';
    } else {
        error.value = err.message || 'Error al iniciar sesión. Verifica tu conexión.';
    }
    console.error("Error en LoginView:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (authStore.isAuthenticated) {
    // Redirigir al dashboard apropiado si ya está autenticado
    if (authStore.userRole === 'donator') {
      router.push('/donator/dashboard');
    } else if (authStore.userRole === 'beneficiary') {
      router.push('/beneficiary/dashboard');
    } else {
      // Fallback si está autenticado pero sin un rol claro o dashboard asignado
      router.push('/donations');
    }
  }
});
</script>

<style scoped>
/* Estilos proporcionados previamente por el usuario, sin cambios */
.container {
  max-width: 400px; /* Ajusta el ancho máximo si es necesario */
  margin: 40px auto; /* Centra y añade margen superior/inferior */
  padding: 20px;
  border: 1px solid #eee; /* Borde ligero */
  border-radius: 8px; /* Bordes redondeados */
  box-shadow: 0 2px 10px rgba(0,0,0,0.1); /* Sombra sutil */
  background-color: #fff; /* Fondo blanco */
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
  font-size: 1.8em;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 10px; /* Padding un poco más grande */
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box; /* Importante para que el padding no aumente el ancho total */
  font-size: 1em;
}

.form-group input:focus {
  border-color: #007bff; /* Color de borde al enfocar (azul) */
  outline: none; /* Quita el outline por defecto del navegador */
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25); /* Sombra similar a Bootstrap al enfocar */
}

button[type="submit"] {
  background-color: #007bff; /* Azul principal para login */
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  width: 100%; /* Botón de ancho completo */
  transition: background-color 0.2s ease-in-out;
}

button[type="submit"]:hover {
  background-color: #0056b3; /* Azul más oscuro al pasar el mouse */
}

button[type="submit"]:disabled {
  background-color: #6c757d; /* Color gris cuando está deshabilitado */
  cursor: not-allowed;
}

.error-message {
  color: #dc3545; /* Rojo para errores */
  background-color: #f8d7da; /* Fondo rojo claro */
  border: 1px solid #f5c6cb; /* Borde rojo */
  padding: 10px;
  border-radius: 4px;
  margin-top: 15px;
  text-align: center;
}

/* Estilos para el enlace de "¿No tienes cuenta?" */
.mt-4 {
  margin-top: 1.5rem; /* 24px, un poco más de espacio */
}
.text-center {
  text-align: center;
}
.text-blue-600 {
  color: #007bff; /* Azul para el enlace */
}
.hover\:underline:hover { /* Comportamiento de subrayado al pasar el mouse */
  text-decoration: underline;
}
</style>