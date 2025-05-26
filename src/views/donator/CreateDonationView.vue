<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/api/api';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
import { format } from 'date-fns'; // Necesitarás instalar date-fns: npm install date-fns

const authStore = useAuthStore();
const router = useRouter();

const beneficiaries = ref([]); // Para almacenar la lista de beneficiarios
const availableAliments = ref([]); // Para almacenar los alimentos del donador disponibles
const selectedAliments = ref([]); // Array para los IDs de alimentos seleccionados

const formData = ref({
  date: format(new Date(), 'yyyy-MM-dd'),
  id_beneficiary: null, // Será el ID del beneficiario seleccionado
  aliments: [], // Este se poblará con selectedAliments
});

const errorMessage = ref('');
const successMessage = ref('');
const loading = ref(false); // Para el estado de la solicitud de creación
const dataLoading = ref(true); // Para la carga de datos iniciales (beneficiarios, alimentos)

// Redirigir si el usuario no es donador al montar el componente
onMounted(async () => {
  if (!authStore.isAuthenticated || !authStore.isDonator) {
    router.push('/'); // O a una página de error
  } else {
    await fetchInitialData();
  }
});

// Función para obtener los datos iniciales (beneficiarios y alimentos del donador)
const fetchInitialData = async () => {
  dataLoading.value = true;
  errorMessage.value = '';
  try {
    // 1. Obtener lista de beneficiarios
    const beneficiariesResponse = await apiClient.get('/beneficiaries');
    beneficiaries.value = beneficiariesResponse.data;

    // 2. Obtener lista de alimentos propios del donador
    // El backend ya debería filtrar por el donador autenticado
    const alimentsResponse = await apiClient.get('/aliments');
    availableAliments.value = alimentsResponse.data;

  } catch (error) {
    console.error('Error al cargar datos iniciales para donación:', error);
    errorMessage.value = error.response?.data?.message || 'Error al cargar datos necesarios. Inténtalo de nuevo.';
  } finally {
    dataLoading.value = false;
  }
};

// Función para crear una nueva donación
const createDonation = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  loading.value = true;

  // Doble comprobación del rol antes de intentar la llamada API
  if (!authStore.isAuthenticated || !authStore.isDonator) {
    errorMessage.value = "No tienes permiso para crear donaciones.";
    loading.value = false;
    return;
  }
  // Validaciones del formulario
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

  // Asegúrate de que los alimentos seleccionados sean solo los IDs
  formData.value.aliments = selectedAliments.value;

  try {
    // Llama al endpoint del backend para crear una donación (POST /donation)
    // eslint-disable-next-line no-unused-vars
    const response = await apiClient.post('/donation', formData.value); // 'response' se marca como usado con el comentario ESLint
    successMessage.value = 'Donación creada exitosamente.';
    // Opcional: Limpiar el formulario o redirigir
    formData.value = {
        date: format(new Date(), 'yyyy-MM-dd'),
        id_beneficiary: null,
        aliments: [],
    };
    selectedAliments.value = []; // Limpiar selección de alimentos
    // router.push('/donator/donations'); // Redirigir a la lista de donaciones del donador
  } catch (error) {
    console.error('Error al crear donación:', error);
    // Asume que el backend devuelve { message: "..." } en caso de error
    errorMessage.value = error.response?.data?.message || error.message || 'Error al crear la donación. Inténtalo de nuevo.';
    if (error.response?.status === 403) {
      errorMessage.value = 'No tienes permiso para realizar esta acción.';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <h2>Crear Nueva Donación</h2>

    <p v-if="!authStore.isAuthenticated || !authStore.isDonator" style="color: red;">
      Debes iniciar sesión como donador para crear donaciones.
    </p>

    <p v-if="dataLoading && (authStore.isAuthenticated && authStore.isDonator)">Cargando datos necesarios...</p>
    <p v-if="errorMessage && !dataLoading" style="color: red;">{{ errorMessage }}</p>

    <form v-if="!dataLoading && !errorMessage && (authStore.isAuthenticated && authStore.isDonator)" @submit.prevent="createDonation">
      <div>
        <label for="date">Fecha de la Donación:</label>
        <input type="date" id="date" v-model="formData.date" required>
      </div>
      <div>
        <label for="beneficiary">Seleccionar Beneficiario:</label>
        <select id="beneficiary" v-model="formData.id_beneficiary" required>
          <option :value="null" disabled>Selecciona un beneficiario</option>
          <option v-for="b in beneficiaries" :key="b.id" :value="b.id">{{ b.legal_name }}</option>
        </select>
        <p v-if="!beneficiaries.length && !dataLoading && (authStore.isAuthenticated && authStore.isDonator)" style="color: orange; font-size: 0.9em;">No hay beneficiarios disponibles. Asegúrate de que existan en el sistema.</p>
      </div>
      <div>
        <label>Seleccionar Alimentos (de tus alimentos disponibles):</label>
        <div v-if="availableAliments.length">
          <div v-for="aliment in availableAliments" :key="aliment.id">
            <input
              type="checkbox"
              :id="`aliment-${aliment.id}`"
              :value="aliment.id"
              v-model="selectedAliments">
            <label :for="`aliment-${aliment.id}`">
              {{ aliment.name }} (Lotes: {{ aliment.lots }}, Caducidad: {{ aliment.caducity_date }})
            </label>
          </div>
        </div>
        <p v-else style="color: orange; font-size: 0.9em;">No tienes alimentos disponibles para donar.</p>
      </div>

      <button type="submit" :disabled="loading || !formData.id_beneficiary || selectedAliments.length === 0">
        {{ loading ? 'Creando...' : 'Crear Donación' }}
      </button>
    </form>

    <p v-if="successMessage" style="color: green;">{{ successMessage }}</p>
  </div>
</template>

<style scoped>
/* Agrega estilos específicos del componente aquí */
</style>