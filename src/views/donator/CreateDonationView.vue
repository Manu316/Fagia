<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/api/api'; // Ajusta la ruta si es necesario
import { useAuthStore } from '@/stores/authStore'; // Ajusta la ruta si es necesario
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

// Estructura del formulario para crear una donación.
// Esto dependerá del CreateDonationDto en tu backend.
// Puede incluir una lista de alimentos asociados, fecha de caducidad, etc.
const formData = ref({
  // Ejemplo básico:
  // expiration_date: '',
  // items: [], // Podría ser un array de objetos { aliment_id: '', quantity: 0 }
  // Agrega otros campos necesarios
});

const errorMessage = ref('');
const successMessage = ref('');
const loading = ref(false);

// Redirigir si el usuario no es donador al montar el componente
onMounted(() => {
  if (!authStore.isAuthenticated || !authStore.isDonator) {
    router.push('/'); // O a una página de error
  }
});

// Función para crear una nueva donación
const createDonation = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  loading.value = true;

  // Doble comprobación del rol antes de intentar la llamada API
  if (!authStore.isAuthenticated || !authStore.isDonator) {
    errorMessage.value = "No tienes permiso para crear donaciones.";
    loading.value = false;
    return;
  }

  try {
    // Llama al endpoint del backend para crear una donación (POST /donation)
    const response = await apiClient.post('/donation', formData.value);
    successMessage.value = 'Donación creada exitosamente.';
    // Opcional: Limpiar el formulario o redirigir
    // formData.value = { ...valores iniciales ... };
    // router.push('/donations'); // Redirigir a la lista de donaciones del donador
  } catch (error) {
    console.error('Error al crear donación:', error);
    errorMessage.value = error.message || 'Error al crear la donación. Inténtalo de nuevo.';
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
    <h2>Crear Nueva Donación</h2>

     <p v-if="!authStore.isAuthenticated || !authStore.isDonator" style="color: red;">
      Debes iniciar sesión como donador para crear donaciones.
    </p>

    <form v-if="authStore.isAuthenticated && authStore.isDonator" @submit.prevent="createDonation">
      <div>
          <p>Formulario de donación (implementar campos según backend DTO)</p>
          </div>

      <button type="submit" :disabled="loading">{{ loading ? 'Creando...' : 'Crear Donación' }}</button>
    </form>

    <p v-if="errorMessage" style="color: red;">{{ errorMessage }}</p>
    <p v-if="successMessage" style="color: green;">{{ successMessage }}</p>
  </div>
</template>

<style scoped>
/* Agrega estilos específicos del componente aquí */
</style>
