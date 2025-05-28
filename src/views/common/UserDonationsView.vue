<template>
  <div class="container mx-auto p-4 sm:p-6 lg:p-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center rounded-lg p-3 bg-blue-100 shadow-md">
      Mis Donaciones
    </h1>

    <div v-if="loading" class="text-center text-blue-600 text-lg">Cargando donaciones...</div>
    <div v-else-if="error" class="text-center text-red-600 text-lg bg-red-100 p-4 rounded-lg shadow-md">
      Error al cargar las donaciones: {{ error }}
    </div>
    <div v-else-if="donations.length === 0" class="text-center text-gray-600 text-lg bg-yellow-100 p-4 rounded-lg shadow-md">
      No hay donaciones disponibles para mostrar.
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="donation in donations" :key="donation.id" class="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl">
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
            <h3 class="text-lg font-medium text-gray-800 mb-2">Alimentos Donados:</h3>
            <ul v-if="donation.aliments && donation.aliments.length > 0" class="list-disc list-inside text-gray-600">
              <li v-for="aliment in donation.aliments" :key="aliment.id" class="mb-1">
                {{ aliment.name }} (Tipo: {{ aliment.r_type }}, Lotes: {{ aliment.lots }})
              </li>
            </ul>
            <p v-else class="text-gray-500 italic">No hay alimentos detallados para esta donación.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/api/api';
import { useAuthStore } from '@/stores/authStore';

const donations = ref([]);
const loading = ref(true);
const error = ref(null);
const authStore = useAuthStore();

const fetchDonations = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await apiClient.get('/donation', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    donations.value = response.data;
  } catch (err) {
    console.error('Error fetching user donations:', err);
    error.value = err.response?.data?.message || 'Ocurrió un error al obtener las donaciones.';
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

onMounted(() => {
  fetchDonations();
});
</script>

<style scoped>
/* Tailwind CSS is used for styling. No custom CSS needed unless for very specific cases. */
</style>