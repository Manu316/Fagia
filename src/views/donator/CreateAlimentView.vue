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
    router.push('/');
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

    // eslint-disable-next-line no-unused-vars
    const response = await apiClient.post('/aliments', dataToSend);
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

<template>
  <div>
    <h2>Crear Nuevo Alimento</h2>

    <p v-if="!authStore.isAuthenticated || !authStore.isDonator" style="color: red;">
      Debes iniciar sesión como donador para crear alimentos.
    </p>

    <form v-if="authStore.isAuthenticated && authStore.isDonator" @submit.prevent="createAliment">
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
      <button type="submit" :disabled="loading">{{ loading ? 'Creando...' : 'Crear Alimento' }}</button>
    </form>

    <p v-if="errorMessage" style="color: red;">{{ errorMessage }}</p>
    <p v-if="successMessage" style="color: green;">{{ successMessage }}</p>
  </div>
</template>

<style scoped>

</style>