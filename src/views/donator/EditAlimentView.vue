<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/api/api'; // Ajusta la ruta si es necesario
import { useAuthStore } from '@/stores/authStore'; // Ajusta la ruta si es necesario
import { useRouter, useRoute } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute(); // Para obtener el ID del alimento de la URL

const alimentId = route.params.id; // Obtiene el ID del alimento de los parámetros de la ruta

const formData = ref({
  name: '',
  quantity: 0,
  // Agrega otros campos necesarios para editar un alimento
});

const errorMessage = ref('');
const successMessage = ref('');
const loading = ref(true); // Inicia en true porque cargaremos los datos existentes

// Redirigir si el usuario no es donador al montar el componente
onMounted(() => {
  if (!authStore.isAuthenticated || !authStore.isDonator) {
    router.push('/'); // O a una página de error
  } else {
    // Si es donador, cargar los datos del alimento existente
    fetchAlimentData();
  }
});

// Función para obtener los datos del alimento existente
const fetchAlimentData = async () => {
    loading.value = true;
    errorMessage.value = '';
    try {
        // Llama al endpoint del backend para obtener los detalles del alimento (GET /aliments/{id})
        const response = await apiClient.get(`/aliments/${alimentId}`);
        // Llena el formulario con los datos existentes
        formData.value.name = response.data.name;
        formData.value.quantity = response.data.quantity;
        // Llena otros campos del formulario si existen en la respuesta
    } catch (error) {
        console.error('Error al cargar datos del alimento para editar:', error);
        errorMessage.value = error.message || 'Error al cargar los datos del alimento. Inténtalo de nuevo.';
         if (error.response?.data?.error) {
            errorMessage.value = error.response.data.error;
        } else if (error.response?.status === 404) {
            errorMessage.value = 'Alimento no encontrado.';
        } else if (error.response?.status === 403) {
            errorMessage.value = 'No tienes permiso para ver este alimento.';
        }
    } finally {
        loading.value = false;
    }
};


// Función para actualizar el alimento
const updateAliment = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  loading.value = true;

  // Doble comprobación del rol antes de intentar la llamada API
  if (!authStore.isAuthenticated || !authStore.isDonator) {
    errorMessage.value = "No tienes permiso para editar alimentos.";
    loading.value = false;
    return;
  }

  try {
    // Llama al endpoint del backend para actualizar un alimento (PUT /aliments/{id})
    const response = await apiClient.put(`/aliments/${alimentId}`, formData.value);
    successMessage.value = 'Alimento actualizado exitosamente.';
    // Opcional: Redirigir después de la actualización
    // router.push('/aliments'); // Redirigir a la lista de alimentos
  } catch (error) {
    console.error('Error al actualizar alimento:', error);
    errorMessage.value = error.message || 'Error al actualizar el alimento. Inténtalo de nuevo.';
     if (error.response?.data?.error) {
        errorMessage.value = error.response.data.error;
    } else if (error.response?.status === 403) {
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
        <label for="quantity">Cantidad:</label>
        <input type="number" id="quantity" v-model.number="formData.quantity" required min="0">
      </div>
      <button type="submit" :disabled="loading">{{ loading ? 'Actualizando...' : 'Guardar Cambios' }}</button>
    </form>

    <p v-if="successMessage" style="color: green;">{{ successMessage }}</p>
  </div>
</template>

<style scoped>
/* Agrega estilos específicos del componente aquí */
</style>
