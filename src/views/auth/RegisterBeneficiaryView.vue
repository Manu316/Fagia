<template>
  <div class="container">
    <h2>Registrar Nuevo Beneficiario</h2>
    <form @submit.prevent="submitBeneficiaryForm">
      <div class="form-group">
        <label for="representant_name">Nombre del representante:</label>
        <input type="text" v-model="beneficiary.representant_name" required />
      </div>
      <div class="form-group">
        <label for="representant_lastname_f">Apellido paterno del representante:</label>
        <input type="text" v-model="beneficiary.representant_lastname_f" required />
      </div>
      <div class="form-group">
        <label for="representant_lastname_m">Apellido materno del representante:</label>
        <input type="text" v-model="beneficiary.representant_lastname_m" />
      </div>
      <div class="form-group">
        <label for="phone">Teléfono de contacto:</label>
        <input type="tel" v-model="beneficiary.phone" required />
      </div>
      <div class="form-group">
        <label for="legal_name">Nombre legal de la organización:</label>
        <input type="text" v-model="beneficiary.legal_name" required />
      </div>
      <div class="form-group">
        <label for="foundation_date">Fecha de fundación:</label>
        <input type="date" v-model="beneficiary.foundation_date" required />
      </div>
      <div class="form-group">
        <label for="nif">NIF/RFC de la organización:</label>
        <input type="text" v-model="beneficiary.nif" required />
      </div>
      <div class="form-group">
        <label for="website">Sitio web:</label>
        <input type="url" v-model="beneficiary.website" required />
      </div>
      <div class="form-group">
        <label for="email">Email de la cuenta:</label>
        <input type="email" v-model="beneficiary.email" required />
      </div>
      <div class="form-group">
        <label for="password">Contraseña:</label>
        <input type="password" v-model="beneficiary.password" required />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Registrando...' : 'Registrar Beneficiario' }}
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
        ¿Quieres registrarte como Donador?
        <router-link to="/register-donator" class="text-green-600 hover:underline">
          Regístrate como Donador
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore'; // Importa el store de autenticación

const authStore = useAuthStore(); // Obtén la instancia del store

const beneficiary = ref({
  representant_name: '',
  representant_lastname_f: '',
  representant_lastname_m: '',
  phone: '',
  legal_name: '',
  foundation_date: '', // Formato YYYY-MM-DD
  nif: '',
  website: '', // Ahora requerido
  email: '',
  password: '',
  r_type: 'Beneficiary' // Fijo para el registro de beneficiario
});

const errorMessage = ref('');
const successMessage = ref('');
const loading = ref(false); // Estado de carga del botón

const submitBeneficiaryForm = async () => {
  console.log('¡Intentando enviar el formulario de Beneficiario!'); // Para depuración
  errorMessage.value = '';
  successMessage.value = '';
  loading.value = true; // Habilita el estado de carga

  try {
    // Llama a la acción registerBeneficiary de tu store Pinia
    // El store ya usa apiClient internamente
    const response = await authStore.registerBeneficiary(beneficiary.value);

    successMessage.value = response.message || 'Beneficiario registrado con éxito. Por favor, inicia sesión.';
    // Limpiar formulario después del éxito
    beneficiary.value = {
      representant_name: '', representant_lastname_f: '', representant_lastname_m: '',
      phone: '', legal_name: '', foundation_date: '', nif: '', website: '',
      email: '', password: '', r_type: 'Beneficiary'
    };
    // Opcional: Redirigir al login después de un pequeño retraso
    // setTimeout(() => router.push('/login'), 3000);

  } catch (error) {
    // Captura errores de la red o del backend
    // Asume que el backend devuelve { message: "..." } en caso de error
    errorMessage.value = error.response?.data?.message || error.message || 'Error al registrar beneficiario.';
    console.error("Error en RegisterBeneficiaryView:", error);
  } finally {
    loading.value = false; // Deshabilita el estado de carga
  }
};
</script>

<style scoped>
/* Estilos son idénticos a RegisterDonatorView, puedes centralizarlos si quieres */
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
  background-color: #007bff; /* Azul principal para login */
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
}
button[type="submit"]:hover {
  background-color: #0056b3;
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
.mt-4 { /* Utilidad simple de margen si no usas Tailwind aquí */
  margin-top: 1rem; /* 16px */
}
.mt-2 {
  margin-top: 0.5rem; /* 8px */
}
.text-center {
  text-align: center;
}
.text-blue-600 { /* Si no usas Tailwind, define este color */
  color: #007bff;
}
.text-green-600 {
  color: #28a745;
}
.hover\:underline:hover { /* Si no usas Tailwind, define este comportamiento */
  text-decoration: underline;
}
</style>