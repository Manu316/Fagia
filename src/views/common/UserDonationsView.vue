<template>
    <div class="user-donations-view">
      <h2>Mis Donaciones</h2>
      <div v-if="loading" class="loading">Cargando donaciones...</div>
      <div v-if="error" class="error-message">
        <p>Error al cargar las donaciones: {{ error }}</p>
      </div>
      <div v-if="!loading && !error && donations.length === 0" class="no-donations">
        <p>Aún no has realizado ni recibido donaciones.</p>
      </div>
      <div v-if="!loading && !error && donations.length > 0" class="donations-list">
        <ul>
          <li v-for="donation in donations" :key="donation.id" class="donation-item">
            <div class="donation-details">
              <p><strong>ID de Donación:</strong> {{ donation.id }}</p>
              <p><strong>Fecha:</strong> {{ formatDate(donation.creation_date) }}</p>
              <p><strong>Estado:</strong> {{ donation.status }}</p>
              <div v-if="donation.aliments && donation.aliments.length > 0">
                <strong>Alimentos:</strong>
                <ul>
                  <li v-for="aliment in donation.aliments" :key="aliment.id_aliment">
                    {{ aliment.name }} ({{ aliment.quantity }})
                  </li>
                </ul>
              </div>
              <p v-if="donation.collection_location"><strong>Lugar de Recogida:</strong> {{ donation.collection_location }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import commonService from '@/api/commonService'; // Asegúrate que la ruta es correcta
  
  const donations = ref([]);
  const loading = ref(true);
  const error = ref(null);
  
  // Función para formatear la fecha (puedes mejorarla o usar una librería)
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  onMounted(async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await commonService.getUserDonations();
      // Asumiendo que response.data es un array de donaciones
      // y que cada donación tiene una estructura como { id, creation_date, status, aliments, collection_location, ... }
      donations.value = response.data || []; // Asigna un array vacío si response.data es undefined
    } catch (err) {
      console.error("Error fetching user donations:", err);
      error.value = err.response?.data?.message || err.message || "Ocurrió un error desconocido.";
      donations.value = []; // Asegúrate de que donations sea un array en caso de error
    } finally {
      loading.value = false;
    }
  });
  </script>
  
  <style scoped>
  .user-donations-view {
    max-width: 800px;
    margin: 20px auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  h2 {
    text-align: center;
    color: #333;
    margin-bottom: 20px;
  }
  
  .loading, .no-donations {
    text-align: center;
    padding: 20px;
    color: #666;
  }
  
  .error-message {
    background-color: #ffebee;
    color: #c62828;
    border: 1px solid #ef9a9a;
    padding: 15px;
    border-radius: 4px;
    margin-bottom: 20px;
    text-align: center;
  }
  
  .donations-list ul {
    list-style-type: none;
    padding: 0;
  }
  
  .donation-item {
    background-color: #fff;
    border: 1px solid #ddd;
    padding: 15px;
    margin-bottom: 10px;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }
  
  .donation-item p {
    margin: 5px 0;
    color: #555;
  }
  
  .donation-item strong {
    color: #333;
  }
  
  .donation-details ul {
    list-style-type: disc;
    margin-left: 20px;
  }
  </style>