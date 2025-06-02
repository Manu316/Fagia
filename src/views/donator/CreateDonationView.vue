<template>
  <div class="dashboard-donator create-donation-container">
    <h2>Crear Nueva Donación</h2>

    <div class="dashboard-actions back-link-container">
      <router-link to="/donator/dashboard" class="action-link">Volver al Panel del Donador</router-link>
    </div>

    <p v-if="!authStore.isAuthenticated || !authStore.isDonator" class="info-message error-message">
      Debes iniciar sesión como donador para crear donaciones.
    </p>

    <p v-if="dataLoading && (authStore.isAuthenticated && authStore.isDonator)" class="info-message loading-message">Cargando datos necesarios...</p>
    <p v-if="errorMessage && !dataLoading" class="info-message error-message">{{ errorMessage }}</p>

    <form v-if="!dataLoading && !errorMessage && (authStore.isAuthenticated && authStore.isDonator)" @submit.prevent="createDonation" class="donation-form">
      <div class="form-group">
        <label for="date">Fecha de la Donación:</label>
        <input type="date" id="date" v-model="formData.date" required class="form-input">
      </div>

      <div class="form-group">
        <label for="beneficiary">Seleccionar Beneficiario:</label>
        <select id="beneficiary" v-model="formData.id_beneficiary" required class="form-input">
          <option :value="null" disabled>Selecciona un beneficiario</option>
          <option v-for="b in beneficiaries" :key="b.id" :value="b.id">{{ b.legal_name }}</option>
        </select>
        <p v-if="!beneficiaries.length && !dataLoading && (authStore.isAuthenticated && authStore.isDonator)" class="info-message warning-message small-text">No hay beneficiarios disponibles. Asegúrate de que existan en el sistema.</p>
      </div>

      <div class="form-group">
        <label>Seleccionar Alimentos (de tus alimentos disponibles):</label>
        <div v-if="availableAliments.length" class="aliments-checkbox-list">
          <div v-for="aliment in availableAliments" :key="aliment.id" class="checkbox-item">
            <input
              type="checkbox"
              :id="`aliment-${aliment.id}`"
              :value="aliment.id"
              v-model="selectedAliments"
              class="checkbox-input"
            >
            <label :for="`aliment-${aliment.id}`" class="checkbox-label">
              {{ aliment.name }} (Lotes: {{ aliment.lots }}, Caducidad: {{ formatDate(aliment.caducity_date) }})
            </label>
          </div>
        </div>
        <p v-else class="info-message warning-message small-text">No tienes alimentos disponibles para donar.</p>
      </div>

      <button type="submit" :disabled="loading || !formData.id_beneficiary || selectedAliments.length === 0" class="action-link create-button">
        {{ loading ? 'Creando...' : 'Crear Donación' }}
      </button>
    </form>

    <p v-if="successMessage" class="info-message success-message">{{ successMessage }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/api/api';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
import { format } from 'date-fns'; // Asegúrate de que date-fns esté instalado (npm install date-fns)

const authStore = useAuthStore();
const router = useRouter();

const beneficiaries = ref([]);
const availableAliments = ref([]);
const selectedAliments = ref([]);

const formData = ref({
  date: format(new Date(), 'yyyy-MM-dd'),
  id_beneficiary: null,
  aliments: [],
});

const errorMessage = ref('');
const successMessage = ref('');
const loading = ref(false);
const dataLoading = ref(true);

onMounted(async () => {
  if (!authStore.isAuthenticated || !authStore.isDonator) {
    router.push('/login'); // Redirigir a login si no es donador autenticado
    return;
  } else {
    await fetchInitialData();
  }
});

const fetchInitialData = async () => {
  dataLoading.value = true;
  errorMessage.value = '';
  try {
    const beneficiariesResponse = await apiClient.get('/beneficiaries', {
      headers: {
        Authorization: `Bearer ${authStore.token}` // Asegurar token para beneficiarios
      }
    });
    beneficiaries.value = beneficiariesResponse.data;

    const alimentsResponse = await apiClient.get('/aliments', {
      headers: {
        Authorization: `Bearer ${authStore.token}` // Asegurar token para alimentos
      }
    });
    availableAliments.value = alimentsResponse.data;

  } catch (error) {
    console.error('Error al cargar datos iniciales para donación:', error);
    errorMessage.value = error.response?.data?.message || 'Error al cargar datos necesarios. Inténtalo de nuevo.';
  } finally {
    dataLoading.value = false;
  }
};

const createDonation = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  loading.value = true;

  if (!authStore.isAuthenticated || !authStore.isDonator) {
    errorMessage.value = "No tienes permiso para crear donaciones.";
    loading.value = false;
    return;
  }

  if (!formData.value.id_beneficiary) {
    errorMessage.value = "Debes seleccionar un beneficiario.";
    loading.value = false;
    return;
  }
  if (selectedAliments.value.length === 0) {
    errorMessage.value = "Debes seleccionar al menos un alimento para la donación.";
    loading.value = false;
    return;
  }

  // === INICIO DE LA CORRECCIÓN ===
  // Asume que la API de Rust espera un array de IDs de alimentos, no un array de objetos.
  formData.value.aliments = selectedAliments.value;
  // === FIN DE LA CORRECCIÓN ===

  try {
    // La ruta de la API para crear donaciones es '/donation' en donatorService.js
    await apiClient.post('/donation', formData.value, {
      headers: {
        Authorization: `Bearer ${authStore.token}` // Asegurar que el token se envíe
      }
    });
    successMessage.value = 'Donación creada exitosamente.';

    // Resetear el formulario después de una creación exitosa
    formData.value = {
      date: format(new Date(), 'yyyy-MM-dd'),
      id_beneficiary: null,
      aliments: [],
    };
    selectedAliments.value = []; // Limpiar los alimentos seleccionados
  } catch (error) {
    console.error('Error al crear donación:', error);

    errorMessage.value = error.response?.data?.message || error.message || 'Error al crear la donación. Inténtalo de nuevo.';
    if (error.response?.status === 403) {
      errorMessage.value = 'No tienes permiso para realizar esta acción.';
    }
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
  justify-content: flex-start; /* Alinea el contenido a la izquierda */
  margin-bottom: 20px;
}

/* Reutilizando 'action-link' para la consistencia con otros botones */
.action-link {
  display: inline-block;
  padding: 10px 20px; /* Padding ligeramente más pequeño para botones de navegación */
  background-color: #3498db; /* Azul consistente */
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
.donation-form {
  background-color: #ffffff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
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

/* Estilos para la lista de checkboxes de alimentos */
.aliments-checkbox-list {
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  max-height: 200px; /* Altura máxima para scroll si hay muchos alimentos */
  overflow-y: auto;
  background-color: #fefefe;
}

.checkbox-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.checkbox-input {
  margin-right: 10px;
  /* Puedes personalizar el tamaño del checkbox si lo deseas */
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-label {
  cursor: pointer;
  color: #555;
  font-size: 0.95em;
}

/* Estilos para el botón de crear donación */
.create-button {
  background-color: #28a745; /* Verde para acciones positivas */
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
  color: #28a745; /* Verde */
}

.error-message {
  color: #dc3545; /* Rojo */
  background-color: #f8d7da; /* Fondo rojo claro */
  border: 1px solid #f5c6cb;
}

.success-message {
  color: #155724; /* Verde oscuro */
  background-color: #d4edda; /* Fondo verde claro */
  border: 1px solid #c3e6cb;
}

.warning-message {
  color: #664d03; /* Amarillo oscuro */
  background-color: #fff3cd; /* Fondo amarillo claro */
  border: 1px solid #ffecb5;
}

.small-text {
  font-size: 0.9em;
  margin-top: 5px;
  padding: 8px 15px; /* Ajustar padding para mensajes más pequeños */
}
</style>