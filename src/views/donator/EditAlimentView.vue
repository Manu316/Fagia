<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/api/api';
import { useAuthStore } from '@/stores/authStore';
import { useRouter, useRoute } from 'vue-router';
// import { format } from 'date-fns'; // 'format' no es necesario si solo se usa en `caducity_date` y viene del backend en formato correcto.

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute(); // Para obtener el ID del alimento de la URL

const alimentId = route.params.id; // Obtiene el ID del alimento de los parámetros de la ruta

const formData = ref({
  name: '',
  r_type: '', // Corresponde a 'r_type'
  description: '', // Corresponde a 'description'
  lots: 0, // Corresponde a 'lots'
  caducity_date: '', // Se llenará con la fecha del alimento existente en formato 'YYYY-MM-DD'
});

const errorMessage = ref('');
const successMessage = ref('');
const loading = ref(true); // Inicia en true porque cargaremos los datos existentes

// Redirigir si el usuario no es donador al montar el componente
onMounted(() => {
  if (!authStore.isAuthenticated || !authStore.isDonator) {
    router.push('/'); // O a una página de error
  } else if (alimentId) { // Asegúrate de que el ID exista
    fetchAlimentData();
  } else {
    errorMessage.value = "ID de alimento no proporcionado en la URL.";
    loading.value = false;
  }
});

// Función para obtener los datos del alimento existente
const fetchAlimentData = async () => {
    loading.value = true;
    errorMessage.value = '';
    try {
        // Llama al endpoint del backend para obtener los detalles del alimento (GET /aliments/{id})
        const response = await apiClient.get(`/aliments/${alimentId}`);
        // Llena el formulario con todos los datos existentes del alimento
        formData.value.name = response.data.name;
        formData.value.r_type = response.data.r_type;
        formData.value.description = response.data.description;
        formData.value.lots = response.data.lots;
        formData.value.caducity_date = response.data.caducity_date; // Ya debería venir en formato 'YYYY-MM-DD'

    } catch (error) {
        console.error('Error al cargar datos del alimento para editar:', error);
        // Asume que el backend devuelve { message: "..." } en caso de error
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
    // Asegura que 'lots' sea un número entero
    const dataToSend = {
        ...formData.value,
        lots: parseInt(formData.value.lots),
    };
    // Llama al endpoint del backend para actualizar un alimento (PUT /aliments/{id})
    // Nota: El backend tiene un POST /aliments/{id} que asume mostrar.
    // Para PUT/PATCH, necesitarías que tu backend implementara ese método.
    // Si tu backend solo tiene POST para crear y DELETE, tendrías que reconsiderar la edición.
    // Asumo que el POST /aliments/{id} en tu router es para mostrar, pero en tu handler es PUT/PATCH.
    // Si tu handler para `/aliments/{id}` es POST para mostrar, necesitarías un nuevo endpoint PUT/PATCH.
    // En este código, asumo que PUT a `/aliments/{id}` será el endpoint de actualización.
    // eslint-disable-next-line no-unused-vars
    const response = await apiClient.put(`/aliments/${alimentId}`, dataToSend); // 'response' se marca como usado con el comentario ESLint
    successMessage.value = 'Alimento actualizado exitosamente.';
    // Opcional: Redirigir después de la actualización
    // router.push('/donator/aliments'); // Redirigir a la lista de alimentos
  } catch (error) {
    console.error('Error al actualizar alimento:', error);
    // Asume que el backend devuelve { message: "..." } en caso de error
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
/* Agrega estilos específicos del componente aquí */
</style>