<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/api/api';
import { useAuthStore } from '@/stores/authStore';
import { useRouter, useRoute } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute(); 

const alimentId = route.params.id; 

const formData = ref({
  name: '',
  r_type: '', 
  description: '', 
  lots: 0, 
  caducity_date: '',
});

const errorMessage = ref('');
const successMessage = ref('');
const loading = ref(true);

onMounted(() => {
  if (!authStore.isAuthenticated || !authStore.isDonator) {
    router.push('/'); 
  } else if (alimentId) { 
    fetchAlimentData();
  } else {
    errorMessage.value = "ID de alimento no proporcionado en la URL.";
    loading.value = false;
  }
});

const fetchAlimentData = async () => {
    loading.value = true;
    errorMessage.value = '';
    try {
        const response = await apiClient.get(`/aliments/${alimentId}`);
        formData.value.name = response.data.name;
        formData.value.r_type = response.data.r_type;
        formData.value.description = response.data.description;
        formData.value.lots = response.data.lots;
        formData.value.caducity_date = response.data.caducity_date;

    } catch (error) {
        console.error('Error al cargar datos del alimento para editar:', error);
        errorMessage.value = error.response?.data?.message || 'Error al cargar los datos del alimento. Inténtalo de nuevo.';
        if (error.response?.status === 404) {
            errorMessage.value = 'Alimento no encontrado.';
        } else if (error.response?.status === 403) {
            errorMessage.value = 'No tienes permiso para ver este alimento.';
        }
    } finally {
        loading.value = false;
    }
};

const updateAliment = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  loading.value = true;

  if (!authStore.isAuthenticated || !authStore.isDonator) {
    errorMessage.value = "No tienes permiso para editar alimentos.";
    loading.value = false;
    return;
  }

  try {
    const dataToSend = {
        ...formData.value,
        lots: parseInt(formData.value.lots),
    };

    // eslint-disable-next-line no-unused-vars
    const response = await apiClient.put(`/aliments/${alimentId}`, dataToSend); 
    successMessage.value = 'Alimento actualizado exitosamente.';
  } catch (error) {
    console.error('Error al actualizar alimento:', error);
    errorMessage.value = error.response?.data?.message || 'Error al actualizar el alimento. Inténtalo de nuevo.';
    if (error.response?.status === 403) {
      errorMessage.value = 'No tienes permiso para realizar esta acción.';
    } else if (error.response?.status === 404) {
      errorMessage.value = 'Alimento no encontrado para actualizar.';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <h2>Editar Alimento</h2>

    <p v-if="!authStore.isAuthenticated || !authStore.isDonator" style="color: red;">
      Debes iniciar sesión como donador para editar alimentos.
    </p>

    <p v-if="loading && (authStore.isAuthenticated && authStore.isDonator)">Cargando datos del alimento...</p>
    <p v-if="errorMessage && !loading" style="color: red;">{{ errorMessage }}</p>

    <form v-if="!loading && !errorMessage && (authStore.isAuthenticated && authStore.isDonator)" @submit.prevent="updateAliment">
      <div>
        <label for="name">Nombre del Alimento:</label>
        <input type="text" id="name" v-model="formData.name" required>
      </div>
      <div>
        <label for="r_type">Tipo de Alimento:</label>
        <input type="text" id="r_type" v-model="formData.r_type" required>
      </div>
      <div>
        <label for="description">Descripción:</label>
        <textarea id="description" v-model="formData.description" required></textarea>
      </div>
      <div>
        <label for="lots">Número de Lotes:</label>
        <input type="number" id="lots" v-model.number="formData.lots" required min="0">
      </div>
      <div>
        <label for="caducity_date">Fecha de Caducidad:</label>
        <input type="date" id="caducity_date" v-model="formData.caducity_date" required>
      </div>
      <button type="submit" :disabled="loading">{{ loading ? 'Actualizando...' : 'Guardar Cambios' }}</button>
    </form>

    <p v-if="successMessage" style="color: green;">{{ successMessage }}</p>
  </div>
</template>

<style scoped>

</style>