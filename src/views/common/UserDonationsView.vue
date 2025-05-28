<template>
  <div class="dashboard-common donations-container">
    <h2>Mis Donaciones</h2>

    <div class="dashboard-actions back-link-container">
      <router-link
        v-if="authStore.isDonator"
        to="/donator/dashboard"
        class="action-link"
      >
        Volver al Panel del Donador
      </router-link>
      <router-link
        v-else-if="authStore.isBeneficiary"
        to="/beneficiary/dashboard"
        class="action-link"
      >
        Volver al Panel del Beneficiario
      </router-link>
    </div>

    <p v-if="loading" class="info-message loading-message">Cargando donaciones...</p>
    <p v-else-if="error" class="info-message error-message">
      Error al cargar las donaciones: {{ error }}
    </p>
    <p v-else-if="donations.length === 0" class="info-message no-donations-message">
      No hay donaciones disponibles para mostrar.
    </p>
    <div v-else class="donations-grid">
      <div v-for="donation in donations" :key="donation.id" class="donation-card">
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
            <h4 class="aliments-title">Alimentos Donados:</h4>
            <ul v-if="donation.aliments && donation.aliments.length > 0" class="aliments-list">
              <li v-for="aliment in donation.aliments" :key="aliment.id" class="aliment-item">
                {{ aliment.name }} (Tipo: {{ aliment.r_type }}, Lotes: {{ aliment.lots }})
              </li>
            </ul>
            <p v-else class="no-aliments-text">No hay alimentos detallados para esta donación.</p>
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
import { useRouter } from 'vue-router'; // Importar useRouter

const donations = ref([]);
const loading = ref(true);
const error = ref(null);
const authStore = useAuthStore();
const router = useRouter(); // Inicializar router

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
  if (!authStore.isAuthenticated) {
    router.push('/login'); // Redirigir a login si no está autenticado
    return;
  }
  fetchDonations();
});
</script>

<style scoped>
/* Contenedor principal, similar al de los dashboards */
.dashboard-common {
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
  background-color: #e6f7ff; /* Un azul claro para el título, diferente de los verdes */
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
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

/* Estilos para mensajes de información/estado */
.info-message {
  text-align: center;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 1.1em;
}

.loading-message {
  color: #3498db; /* Azul para cargar */
}

.error-message {
  color: #dc3545; /* Rojo */
  background-color: #f8d7da; /* Fondo rojo claro */
  border: 1px solid #f5c6cb;
}

.no-donations-message {
  color: #664d03; /* Amarillo oscuro */
  background-color: #fff3cd; /* Fondo amarillo claro */
  border: 1px solid #ffecb5;
}

/* Cuadrícula para las tarjetas de donaciones */
.donations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

/* Estilos de la tarjeta de donación */
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
</style>