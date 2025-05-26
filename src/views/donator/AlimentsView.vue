<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/api/api';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const aliments = ref([]);
const loading = ref(true);
const errorMessage = ref('');

const navigateToEditAliment = (alimentId) => {
  router.push({ name: 'EditAliment', params: { id: alimentId } });
};

const navigateToCreateAliment = () => {
  router.push({ name: 'CreateAliment' });
};

const navigateToCreateDonation = () => {
  router.push({ name: 'CreateDonation' });
};

const fetchAliments = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const response = await apiClient.get('/aliments');
    aliments.value = response.data;
  } catch (error) {
    console.error('Error al obtener alimentos:', error);
    errorMessage.value = error.response?.data?.message || 'Error al cargar la lista de alimentos.';
    if (error.response?.status === 403) {
      errorMessage.value = 'No tienes permiso para ver esta lista.';
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (!authStore.isAuthenticated || !authStore.isDonator) {
    router.push('/');
  } else {
    fetchAliments();
  }
});
</script>

<template>
  <div>
    <div class="top-nav">
      <router-link to="/" class="home-link">Ir al Inicio</router-link>
      </div>

    <h2>Lista de Alimentos</h2>

    <div v-if="authStore.isAuthenticated && authStore.isDonator" class="action-buttons">
      <button @click="navigateToCreateAliment">Crear Nuevo Alimento</button>
      <button @click="navigateToCreateDonation">Crear Nueva Donación</button>
    </div>

    <p v-if="loading">Cargando alimentos...</p>
    <p v-else-if="errorMessage" style="color: red;">{{ errorMessage }}</p>
    <p v-else-if="aliments.length === 0">No hay alimentos disponibles.</p>

    <ul v-else class="aliments-list">
      <li v-for="aliment in aliments" :key="aliment.id">
        <span class="aliment-name">{{ aliment.name }}</span> - Stock: <span class="aliment-stock">{{ aliment.lots }}</span>
        
        <button
          v-if="authStore.isAuthenticated && authStore.isDonator"
          @click="navigateToEditAliment(aliment.id)"
          class="edit-button"
        >
          Editar
        </button>
      </li>
    </ul>
    
    <p class="footer-text">FAGIA © 2025 - Sistema de Gestión de Alimentos.</p>
  </div>
</template>

<style scoped>
div {
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  background-color: #fff;
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

.top-nav {
  text-align: right;
  margin-bottom: 15px;
}
.home-link {
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
}
.home-link:hover {
  text-decoration: underline;
}

.action-buttons {
  text-align: center;
  margin-bottom: 20px;
}
.action-buttons button {
  background-color: #28a745;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  margin: 0 5px;
  transition: background-color 0.2s;
}
.action-buttons button:hover {
  background-color: #218838;
}

p {
  text-align: center;
  margin-top: 10px;
}
p[style*="color: red"] {
  font-weight: bold;
}

.aliments-list {
  list-style: none;
  padding: 0;
}
.aliments-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  padding: 10px 15px;
  border-radius: 5px;
  background-color: #f9f9f9;
}
.aliment-name {
  font-weight: bold;
  color: #555;
  margin-right: 10px;
}
.aliment-stock {
  font-weight: bold;
  color: #007bff;
}

.edit-button {
  background-color: #007bff;
  color: white;
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85em;
  transition: background-color 0.2s;
}
.edit-button:hover {
  background-color: #0056b3;
}

.footer-text {
  margin-top: 30px;
  font-size: 0.8em;
  color: #888;
  text-align: center;
}
</style>