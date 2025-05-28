<template>
  <div class="dashboard-beneficiary">
    <h2>Donaciones Recibidas (Beneficiario)</h2>

    <div class="dashboard-actions">
      <label for="daysFilter" class="filter-label">Filtrar por últimos días:</label>
      <input
        type="number"
        id="daysFilter"
        v-model.number="daysToFilter"
        @keyup.enter="fetchBeneficiaryDonations"
        class="filter-input"
        placeholder="Ej: 7"
      />
      <button
        @click="fetchBeneficiaryDonations"
        class="action-link filter-button"
      >
        Aplicar Filtro
      </button>
    </div>

    <div v-if="loading" class="info-message loading-message">Cargando donaciones...</div>
    <div v-else-if="error" class="info-message error-message">
      Error al cargar las donaciones: {{ error }}
    </div>
    <div v-else-if="beneficiaryDonations.length === 0" class="info-message no-donations-message">
      No hay donaciones recibidas disponibles para mostrar con el filtro actual.
    </div>
    <div v-else class="donations-grid">
      <div v-for="donation in beneficiaryDonations" :key="donation.id" class="donation-card">
        <div class="card-content">
          <h3 class="card-title">Donación #{{ donation.id }}</h3>
          <p class="card-text">
            <span class="font-medium">Fecha:</span> {{ formatDate(donation.date) }}
          </p>
          <p class="card-text">
            <span class="font-medium">ID Donador:</span> {{ donation.id_donator }}
          </p>
          <p class="card-text mb-4">
            <span class="font-medium">ID Beneficiario:</span> {{ donation.id_beneficiary }}
          </p>
          <div class="aliments-section">
            <h4 class="aliments-title">Alimentos Recibidos:</h4>
            <ul v-if="donation.aliments && donation.aliments.length > 0" class="aliments-list">
              <li v-for="aliment in donation.aliments" :key="aliment.id" class="aliment-item">
                {{ aliment.name }} (Tipo: {{ aliment.r_type }}, Lotes: {{ aliment.lots }})
              </li>
            </ul>
            <p v-else class="no-aliments-text">No hay alimentos detallados para esta donación.</p>
          </div>
          <button
            @click="viewDonatorDetails(donation.id)"
            class="action-link details-button"
          >
            Ver Detalles del Donador
          </button>
        </div>
      </div>
    </div>

    <div v-if="showDonatorModal" class="modal-overlay">
      <div class="modal-content">
        <h2 class="modal-title">Detalles del Donador</h2>
        <div v-if="currentDonatorDetails">
          <p class="modal-text">
            <span class="font-medium">Nombre:</span> {{ currentDonatorDetails.name }}
            {{ currentDonatorDetails.lastname_f }}
            {{ currentDonatorDetails.lastname_m }}
          </p>
          <p class="modal-text">
            <span class="font-medium">Organización:</span> {{ currentDonatorDetails.organization_name }}
          </p>
          <p class="modal-text">
            <span class="font-medium">Teléfono:</span> {{ currentDonatorDetails.phone }}
          </p>
        </div>
        <div v-else class="modal-text">
          Cargando detalles del donador o no disponibles.
        </div>
        <button
          @click="closeDonatorModal"
          class="action-link close-modal-button"
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
.dashboard-beneficiary {
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
  padding: 10px;
  background-color: #e6ffe6; /* Light green for the title background */
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.dashboard-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 1.1em;
  color: #34495e;
  font-weight: bold;
}

.filter-input {
  padding: 10px 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1em;
  width: 120px; /* Adjust width as needed */
  text-align: center;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.08);
  transition: border-color 0.3s ease;
}

.filter-input:focus {
  border-color: #3498db;
  outline: none;
}

.action-link {
  display: inline-block;
  padding: 12px 25px;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-size: 1em;
  transition: background-color 0.3s ease;
  text-align: center;
  cursor: pointer;
  border: none; /* Remove default button border */
}

.action-link:hover {
  background-color: #2980b9;
}

.filter-button {
  background-color: #28a745; /* Green for filter button */
}

.filter-button:hover {
  background-color: #218838;
}

.info-message {
  text-align: center;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 1.1em;
}

.loading-message {
  color: #28a745; /* Green */
}

.error-message {
  color: #dc3545; /* Red */
  background-color: #f8d7da; /* Light red background */
  border: 1px solid #f5c6cb;
}

.no-donations-message {
  color: #664d03; /* Dark yellow */
  background-color: #fff3cd; /* Light yellow background */
  border: 1px solid #ffecb5;
}

.donations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.donation-card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
  overflow: hidden;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.donation-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.12);
}

.card-content {
  padding: 20px;
}

.card-title {
  color: #34495e;
  margin-top: 0;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  font-size: 1.4em;
}

.card-text {
  color: #555;
  line-height: 1.6;
  margin-bottom: 8px;
}

.card-text .font-medium {
  font-weight: bold;
  color: #2c3e50;
}

.aliments-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ecf0f1;
}

.aliments-title {
  color: #34495e;
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.1em;
}

.aliments-list {
  list-style-type: disc;
  padding-left: 20px;
  color: #666;
}

.aliment-item {
  margin-bottom: 5px;
}

.no-aliments-text {
  color: #777;
  font-style: italic;
  font-size: 0.9em;
}

.details-button {
  margin-top: 20px;
  background-color: #5cb85c; /* Success green */
}

.details-button:hover {
  background-color: #4cae4c;
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: #ffffff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 500px;
  position: relative;
}

.modal-title {
  text-align: center;
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 25px;
  font-size: 1.8em;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.modal-text {
  color: #555;
  line-height: 1.8;
  margin-bottom: 10px;
}

.modal-text .font-medium {
  font-weight: bold;
  color: #2c3e50;
}

.close-modal-button {
  margin-top: 30px;
  width: 100%;
  background-color: #dc3545; /* Red for close button */
}

.close-modal-button:hover {
  background-color: #c82333;
}
</style>