<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/api/api';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
import { format } from 'date-fns'; // Necesitarás instalar date-fns: npm install date-fns

const authStore = useAuthStore();
const router = useRouter();

const formData = ref({
  name: '',
  r_type: '', // Corresponde a 'r_type' en el backend (e.g., "perishable", "non-perishable")
  description: '',
  lots: 0, // Corresponde a 'lots' en el backend
  caducity_date: format(new Date(), 'yyyy-MM-dd'), // Formato 'YYYY-MM-DD'
});

const errorMessage = ref('');
const successMessage = ref('');
const loading = ref(false);

// Redirigir si el usuario no es donador al montar el componente
onMounted(() => {
  if (!authStore.isAuthenticated || !authStore.isDonator) {
    router.push('/'); // O a una página de error como /unauthorized
  }
});

// Función para crear un nuevo alimento
const createAliment = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  loading.value = true;

  // Doble comprobación del rol antes de intentar la llamada API
  if (!authStore.isAuthenticated || !authStore.isDonator) {
    errorMessage.value = "No tienes permiso para crear alimentos.";
    loading.value = false;
    return;
  }

  try {
    // Asegura que 'lots' sea un número entero y la fecha esté en el formato correcto
    const dataToSend = {
        ...formData.value,
        lots: parseInt(formData.value.lots),
    };
    // Llama al endpoint del backend para crear un alimento (POST /aliments)
    // eslint-disable-next-line no-unused-vars
    const response = await apiClient.post('/aliments', dataToSend); // 'response' se marca como usado con el comentario ESLint
    successMessage.value = 'Alimento creado exitosamente.';
    // Opcional: Limpiar el formulario o redirigir
    formData.value = {
        name: '',
        r_type: '',
        description: '',
        lots: 0,
        caducity_date: format(new Date(), 'yyyy-MM-dd'),
    };
    // router.push('/donator/aliments'); // Redirigir a la lista de alimentos
  } catch (error) {
    console.error('Error al crear alimento:', error);
    // Asume que el backend devuelve { message: "..." } en caso de error
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
/* Agrega estilos específicos del componente aquí */
</style>