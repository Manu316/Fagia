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
        <label for="organization_name">Nombre de la organización (opcional):</label>
        <input type="text" v-model="donator.organization_name" />
      </div>
      <div class="form-group">
        <label for="email">Email de la cuenta:</label>
        <input type="email" v-model="donator.email" required />
      </div>
      <div class="form-group">
        <label for="password">Contraseña:</label>
        <input type="password" v-model="donator.password" required />
      </div>
      <button type="submit">Registrar Donador</button>
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

<script>
// import axios from 'axios'; // Puedes cambiar esto por tu apiClient
import apiClient from '@/api/api'; // Importa tu apiClient configurado

export default {
  data() {
    return {
      donator: {
        name: '',
        lastname_f: '',
        lastname_m: '',
        phone: '',
        organization_name: '',
        email: '',
        password: '',
        r_type: 'Donator'
      },
      errorMessage: '',
      successMessage: ''
    };
  },
  methods: {
    async submitDonatorForm() {
      this.errorMessage = '';
      this.successMessage = '';
      try {
        // Usa tu apiClient en lugar de axios directamente
        // Ajusta la ruta si tu apiClient ya tiene la baseURL
        // y si el endpoint en tu authService.js es diferente
        const response = await apiClient.post('/account/register-donator', this.donator); // Asumiendo que tu servicio de signup maneja esto
        this.successMessage = response.data.message || 'Donador registrado con éxito. Por favor, inicia sesión.';
        // Limpiar formulario
        this.donator = {
            name: '', lastname_f: '', lastname_m: '', phone: '',
            organization_name: '', email: '', password: '', r_type: 'Donator'
        };
        // Opcional: Redirigir al login después de un pequeño retraso o al hacer clic en un botón
        // setTimeout(() => this.$router.push('/login'), 3000);
      } catch (error) {
        this.errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error al registrar donador.';
        console.error(error);
      }
    }
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
.form-group input {
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
}
button[type="submit"]:hover {
  background-color: #218838;
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