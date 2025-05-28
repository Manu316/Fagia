<template>
  <div class="container mx-auto p-4 sm:p-6 lg:p-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center rounded-lg p-3 bg-green-100 shadow-md">
      Donaciones Recibidas (Beneficiario)
    </h1>

    <div class="mb-6 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
      <label for="daysFilter" class="text-lg font-medium text-gray-700">Filtrar por últimos días:</label>
      <input
        type="number"
        id="daysFilter"
        v-model.number="daysToFilter"
        @keyup.enter="fetchBeneficiaryDonations"
        class="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 w-full sm:w-auto"
        placeholder="Ej: 7"
      />
      <button
        @click="fetchBeneficiaryDonations"
        class="px-5 py-2 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-150 ease-in-out"
      >
        Aplicar Filtro
      </button>
    </div>

    <div v-if="loading" class="text-center text-green-600 text-lg">Cargando donaciones...</div>
    <div v-else-if="error" class="text-center text-red-600 text-lg bg-red-100 p-4 rounded-lg shadow-md">
      Error al cargar las donaciones: {{ error }}
    </div>
    <div v-else-if="beneficiaryDonations.length === 0" class="text-center text-gray-600 text-lg bg-yellow-100 p-4 rounded-lg shadow-md">
      No hay donaciones recibidas disponibles para mostrar con el filtro actual.
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="donation in beneficiaryDonations" :key="donation.id" class="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl">
        <div class="p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-3">Donación #{{ donation.id }}</h2>
          <p class="text-gray-700 mb-2">
            <span class="font-medium">Fecha:</span> {{ formatDate(donation.date) }}
          </p>
          <p class="text-gray-700 mb-2">
            <span class="font-medium">ID Donador:</span> {{ donation.id_donator }}
          </p>
          <p class="text-gray-700 mb-4">
            <span class="font-medium">ID Beneficiario:</span> {{ donation.id_beneficiary }}
          </p>
          <div class="mt-4 pt-4 border-t border-gray-200">
            <h3 class="text-lg font-medium text-gray-800 mb-2">Alimentos Recibidos:</h3>
            <ul v-if="donation.aliments && donation.aliments.length > 0" class="list-disc list-inside text-gray-600">
              <li v-for="aliment in donation.aliments" :key="aliment.id" class="mb-1">
                {{ aliment.name }} (Tipo: {{ aliment.r_type }}, Lotes: {{ aliment.lots }})
              </li>
            </ul>
            <p v-else class="text-gray-500 italic">No hay alimentos detallados para esta donación.</p>
          </div>
          <button
            @click="viewDonatorDetails(donation.id)"
            class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-150 ease-in-out"
          >
            Ver Detalles del Donador
          </button>
        </div>
      </div>
    </div>

    <div v-if="showDonatorModal" class="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Detalles del Donador</h2>
        <div v-if="currentDonatorDetails">
          <p class="text-gray-700 mb-2">
            <span class="font-medium">Nombre:</span> {{ currentDonatorDetails.name }}
            {{ currentDonatorDetails.lastname_f }}
            {{ currentDonatorDetails.lastname_m }}
          </p>
          <p class="text-gray-700 mb-2">
            <span class="font-medium">Organización:</span> {{ currentDonatorDetails.organization_name }}
          </p>
          <p class="text-gray-700 mb-4">
            <span class="font-medium">Teléfono:</span> {{ currentDonatorDetails.phone }}
          </p>
        </div>
        <div v-else class="text-gray-600">
          Cargando detalles del donador o no disponibles.
        </div>
        <button
          @click="closeDonatorModal"
          class="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-150 ease-in-out w-full"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/api/api';
import { useAuthStore } from '@/stores/authStore';

const beneficiaryDonations = ref([]);
const loading = ref(true);
const error = ref(null);
const authStore = useAuthStore();
const daysToFilter = ref(7); // Default filter for the last 7 days

// Estado para el modal de donador
const showDonatorModal = ref(false);
const currentDonatorDetails = ref(null);

const fetchBeneficiaryDonations = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await apiClient.get(`/beneficiary/donation/filter/${daysToFilter.value}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    if (response.data && response.data.message && response.data.message.includes('no hay donaciones')) {
      beneficiaryDonations.value = [];
    } else {
      beneficiaryDonations.value = response.data;
    }
  } catch (err) {
    console.error('Error fetching beneficiary donations:', err);
    error.value = err.response?.data?.message || 'Ocurrió un error al obtener las donaciones del beneficiario.';
  } finally {
    loading.value = false;
  }
};

const viewDonatorDetails = async (donationId) => {
  try {
    const response = await apiClient.get(`/beneficiary/donation/${donationId}/donator`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    currentDonatorDetails.value = response.data;
    showDonatorModal.value = true; // Mostrar el modal
  } catch (err) {
    console.error('Error fetching donator details:', err);
    // Manejo de errores para el modal, podrías mostrar un mensaje dentro del modal o un toast
    currentDonatorDetails.value = { error: err.response?.data?.message || 'Error desconocido al cargar los detalles del donador.' };
    showDonatorModal.value = true; // Mostrar el modal incluso con error para informar al usuario
  }
};

const closeDonatorModal = () => {
  showDonatorModal.value = false;
  currentDonatorDetails.value = null; // Limpiar los detalles al cerrar
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

onMounted(() => {
  if (authStore.isBeneficiary) {
    fetchBeneficiaryDonations();
  } else {
    error.value = "Acceso denegado. Esta vista es solo para beneficiarios.";
    loading.value = false;
  }
});
</script>

<style scoped>
/* Tailwind CSS is used for styling. No custom CSS needed unless for very specific cases. */
</style>
