<template>
  <div class="container">
    <h2>Registrar Nuevo Donador</h2>
    <form @submit.prevent="submitDonatorForm">
      <div class="form-group">
        <label for="name">Nombre:</label>
        <input type="text" v-model="donator.name" required />
      </div>
      <div class="form-group">
        <label for="lastname_f">Apellido paterno:</label>
        <input type="text" v-model="donator.lastname_f" required />
      </div>
      <div class="form-group">
        <label for="lastname_m">Apellido materno:</label>
        <input type="text" v-model="donator.lastname_m" />
      </div>
      <div class="form-group">
        <label for="phone">Teléfono:</label>
        <input type="tel" v-model="donator.phone" required />
      </div>
      <div class="form-group">
        <label for="organization_name">Nombre de la organización:</label>
        <input type="text" v-model="donator.organization_name" required />
      </div>
      <div class="form-group">
        <label for="email">Email de la cuenta:</label>
        <input type="email" v-model="donator.email" required />
      </div>
      <div class="form-group">
        <label for="password">Contraseña:</label>
        <input type="password" v-model="donator.password" required />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Registrando...' : 'Registrar Donador' }}
      </button>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
    </form>

    <div class="mt-4 text-center">
      <p>
        ¿Ya tienes una cuenta?
        <router-link to="/login" class="text-blue-600 hover:underline">
          Inicia Sesión Aquí
        </router-link>
      </p>
      <p class="mt-2">
        ¿Quieres registrarte como Beneficiario?
        <router-link to="/register-beneficiary" class="text-green-600 hover:underline">
          Regístrate como Beneficiario
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore'; // Importa el store de autenticación

const authStore = useAuthStore(); // Obtén la instancia del store

const donator = ref({
  name: '',
  lastname_f: '',
  lastname_m: '',
  phone: '',
  organization_name: '', // Ahora requerido
  email: '',
  password: '',
  r_type: 'Donator' // Fijo para el registro de donador
});

const errorMessage = ref('');
const successMessage = ref('');
const loading = ref(false); // Estado de carga del botón

const submitDonatorForm = async () => {
  console.log('¡Intentando enviar el formulario de Donador!'); // Para depuración
  errorMessage.value = '';
  successMessage.value = '';
  loading.value = true; // Habilita el estado de carga

  try {
    // Llama a la acción registerDonator de tu store Pinia
    // El store ya usa apiClient internamente
    const response = await authStore.registerDonator(donator.value);

    successMessage.value = response.message || 'Donador registrado con éxito. Por favor, inicia sesión.';
    // Limpiar formulario después del éxito
    donator.value = {
      name: '', lastname_f: '', lastname_m: '', phone: '',
      organization_name: '', email: '', password: '', r_type: 'Donator'
    };
    // Opcional: Redirigir al login después de un pequeño retraso
    // setTimeout(() => router.push('/login'), 3000);

  } catch (error) {
    // Captura errores de la red o del backend
    // Asume que el backend devuelve { message: "..." } en caso de error
    errorMessage.value = error.response?.data?.message || error.message || 'Error al registrar donador.';
    console.error("Error en RegisterDonatorView:", error);
  } finally {
    loading.value = false; // Deshabilita el estado de carga
  }
};
</script>

<style scoped>
/* Estilos proporcionados previamente por el usuario, sin cambios */
.container {
  max-width: 500px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
.form-group input, .form-group textarea { /* Añade textarea si usas */
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
button[type="submit"] {
  background-color: #28a745;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
}
button[type="submit"]:hover {
  background-color: #218838;
}
button[type="submit"]:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}
.error-message {
  color: red;
  margin-top: 10px;
}
.success-message {
  color: green;
  margin-top: 10px;
}
.mt-4 {
  margin-top: 1rem;
}
.mt-2 {
  margin-top: 0.5rem;
}
.text-center {
  text-align: center;
}
.text-blue-600 {
  color: #007bff;
}
.text-green-600 {
  color: #28a745;
}
.hover\:underline:hover {
  text-decoration: underline;
}
</style>