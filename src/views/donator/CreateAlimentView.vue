<template>
  <div class="dashboard-donator create-aliment-container">
    <h2>Crear Nuevo Alimento</h2>

    <div class="dashboard-actions back-link-container">
      <router-link to="/donator/dashboard" class="action-link">Volver al Panel del Donador</router-link>
    </div>

    <p v-if="!authStore.isAuthenticated || !authStore.isDonator" class="info-message error-message">
      Debes iniciar sesión como donador para crear alimentos.
    </p>

    <form v-if="authStore.isAuthenticated && authStore.isDonator" @submit.prevent="createAliment" class="aliment-form">
      <div class="form-group">
        <label for="name">Nombre del Alimento:</label>
        <input type="text" id="name" v-model="formData.name" required class="form-input">
      </div>
      <div class="form-group">
        <label for="r_type">Tipo de Alimento:</label>
        <input type="text" id="r_type" v-model="formData.r_type" required class="form-input">
      </div>
      <div class="form-group">
        <label for="description">Descripción:</label>
        <textarea id="description" v-model="formData.description" required class="form-input"></textarea>
      </div>
      <div class="form-group">
        <label for="lots">Número de Lotes:</label>
        <input type="number" id="lots" v-model.number="formData.lots" required min="0" class="form-input">
      </div>
      <div class="form-group">
        <label for="caducity_date">Fecha de Caducidad:</label>
        <input type="date" id="caducity_date" v-model="formData.caducity_date" required class="form-input">
      </div>
      <button type="submit" :disabled="loading" class="action-link create-button">
        {{ loading ? 'Creando...' : 'Crear Alimento' }}
      </button>
    </form>

    <p v-if="errorMessage" class="info-message error-message">{{ errorMessage }}</p>
    <p v-if="successMessage" class="info-message success-message">{{ successMessage }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/api/api';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
import { format } from 'date-fns';

const authStore = useAuthStore();
const router = useRouter();

const formData = ref({
  name: '',
  r_type: '',
  description: '',
  lots: 0,
  caducity_date: format(new Date(), 'yyyy-MM-dd'),
});

const errorMessage = ref('');
const successMessage = ref('');
const loading = ref(false);

onMounted(() => {
  if (!authStore.isAuthenticated || !authStore.isDonator) {
    router.push('/login');
  }
});

const createAliment = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  loading.value = true;

  if (!authStore.isAuthenticated || !authStore.isDonator) {
    errorMessage.value = "No tienes permiso para crear alimentos.";
    loading.value = false;
    return;
  }

  try {
    const dataToSend = {
      ...formData.value,
      lots: parseInt(formData.value.lots),
    };

    await apiClient.post('/aliments', dataToSend, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    successMessage.value = 'Alimento creado exitosamente.';
    formData.value = {
      name: '',
      r_type: '',
      description: '',
      lots: 0,
      caducity_date: format(new Date(), 'yyyy-MM-dd'),
    };
  } catch (error) {
    console.error('Error al crear alimento:', error);
    errorMessage.value = error.response?.data?.message || error.message || 'Error al crear el alimento. Inténtalo de nuevo.';
    if (error.response?.status === 403) {
      errorMessage.value = 'No tienes permiso para realizar esta acción.';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Contenedor principal, consistente con los dashboards */
.dashboard-donator {
  max-width: 900px;
  margin: 20px auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

/* Contenedor para el botón de "Volver al Dashboard" */
.back-link-container {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
}

/* Reutilizando 'action-link' para la consistencia con otros botones */
.action-link {
  display: inline-block;
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-size: 0.95em;
  transition: background-color 0.3s ease;
  text-align: center;
  border: none;
  cursor: pointer;
}

.action-link:hover {
  background-color: #2980b9;
}

/* Estilos del formulario */
.aliment-form {
  background-color: #ffffff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #34495e;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1em;
  box-sizing: border-box;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-input:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  outline: none;
}

/* Estilos para el botón de crear alimento */
.create-button {
  background-color: #28a745;
  padding: 12px 25px;
  font-size: 1em;
  width: 100%;
  margin-top: 20px;
}

.create-button:hover {
  background-color: #218838;
}

.create-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* Estilos para mensajes de información/estado */
.info-message {
  text-align: center;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 1.1em;
}

.loading-message {
  color: #28a745;
}

.error-message {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
}

.success-message {
  color: #155724;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
}

.warning-message {
  color: #664d03;
  background-color: #fff3cd;
  border: 1px solid #ffecb5;
}

.small-text {
  font-size: 0.9em;
  margin-top: 5px;
  padding: 8px 15px;
}
</style>