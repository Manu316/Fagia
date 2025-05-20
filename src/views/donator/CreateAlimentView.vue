<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/api/api'; // Ajusta la ruta si es necesario
import { useAuthStore } from '@/stores/authStore'; // Ajusta la ruta si es necesario
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const formData = ref({
  name: '',
  quantity: 0, // Asumiendo que quantity es un número
  // Agrega otros campos necesarios para crear un alimento
});

const errorMessage = ref('');
const successMessage = ref('');
const loading = ref(false);

// Redirigir si el usuario no es donador al montar el componente
onMounted(() => {
  if (!authStore.isAuthenticated || !authStore.isDonator) {
    // Podrías redirigir a una página de error o a la página principal
    router.push('/');
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
    // Llama al endpoint del backend para crear un alimento (POST /aliments)
    const response = await apiClient.post('/aliments', formData.value);
    successMessage.value = 'Alimento creado exitosamente.';
    // Opcional: Limpiar el formulario o redirigir
    // formData.value = { name: '', quantity: 0 };
    // router.push('/aliments'); // Redirigir a la lista de alimentos
  } catch (error) {
    console.error('Error al crear alimento:', error);
    errorMessage.value = error.message || 'Error al crear el alimento. Inténtalo de nuevo.';
     if (error.response?.data?.error) {
        errorMessage.value = error.response.data.error;
    } else if (error.response?.status === 403) {
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
        <label for="quantity">Cantidad:</label>
        <input type="number" id="quantity" v-model.number="formData.quantity" required min="0">
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
