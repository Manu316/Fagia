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
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

const beneficiary = ref({
  representant_name: '',
  representant_lastname_f: '',
  representant_lastname_m: '',
  phone: '',
  legal_name: '',
  foundation_date: '', 
  nif: '',
  website: '',
  email: '',
  password: '',
  r_type: 'Beneficiary'
});

const errorMessage = ref('');
const successMessage = ref('');
const loading = ref(false);

const submitBeneficiaryForm = async () => {
  console.log('¡Intentando enviar el formulario de Beneficiario!');
  errorMessage.value = '';
  successMessage.value = '';
  loading.value = true;

  try {
    const response = await authStore.registerBeneficiary(beneficiary.value);

    successMessage.value = response.message || 'Beneficiario registrado con éxito. Por favor, inicia sesión.';
    beneficiary.value = {
      representant_name: '', representant_lastname_f: '', representant_lastname_m: '',
      phone: '', legal_name: '', foundation_date: '', nif: '', website: '',
      email: '', password: '', r_type: 'Beneficiary'
    };

  } catch (error) {
    errorMessage.value = error.response?.data?.message || error.message || 'Error al registrar beneficiario.';
    console.error("Error en RegisterBeneficiaryView:", error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
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
.form-group input, .form-group textarea { 
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
button[type="submit"] {
  background-color: #007bff; 
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