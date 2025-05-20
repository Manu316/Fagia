<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/api/api'; // Ajusta la ruta si es necesario
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore'; // Importa la tienda de autenticación

const router = useRouter();
const authStore = useAuthStore(); // Usa la tienda de autenticación

const aliments = ref([]);
const loading = ref(true);
const errorMessage = ref('');

// Función para obtener la lista de todos los alimentos
const fetchAliments = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    // Llama al endpoint del backend para listar todos los alimentos (GET /aliments)
    // Este endpoint generalmente es accesible para ver los elementos disponibles.
    const response = await apiClient.get('/aliments');
    aliments.value = response.data;
  } catch (error) {
    console.error('Error al obtener alimentos:', error);
    errorMessage.value = error.message || 'Error al cargar la lista de alimentos.';
     if (error.response?.data?.error) {
        errorMessage.value = error.response.data.error;
    }
    // Nota: Un error 403 aquí podría indicar que el endpoint está protegido inesperadamente.
  } finally {
    loading.value = false;
  }
};

// Navega a la vista de detalles de un alimento específico
const viewAlimentDetails = (alimentId) => {
    // Asumiendo que tienes una ruta llamada 'AlimentDetailView' configurada en tu router
    router.push({ name: 'AlimentDetailView', params: { id: alimentId } });
};

// Navega a la vista para crear un nuevo alimento
const navigateToCreateAliment = () => {
    // Asumiendo que tienes una ruta llamada 'CreateAlimentView'
    router.push({ name: 'CreateAlimentView' });
};

// Navega a la vista para crear una nueva donación
const navigateToCreateDonation = () => {
    // Asumiendo que tienes una ruta llamada 'CreateDonationView'
    router.push({ name: 'CreateDonationView' });
};

// Navega a la vista para editar un alimento específico
const navigateToEditAliment = (alimentId) => {
    // Asumiendo que tienes una ruta llamada 'EditAlimentView'
    router.push({ name: 'EditAlimentView', params: { id: alimentId } });
};


// Obtiene los alimentos cuando el componente se monta
onMounted(() => {
  fetchAliments();
});
</script>

<template>
  <div>
    <h2>Lista de Alimentos</h2>

    <div v-if="authStore.isAuthenticated && authStore.isDonator">
        <button @click="navigateToCreateAliment">Crear Nuevo Alimento</button>
        <button @click="navigateToCreateDonation">Crear Nueva Donación</button>
    </div>


    <p v-if="loading">Cargando alimentos...</p>
    <p v-if="errorMessage" style="color: red;">{{ errorMessage }}</p>

    <ul v-if="aliments.length">
      <li v-for="aliment in aliments" :key="aliment.id">
        {{ aliment.name }} - Cantidad: {{ aliment.quantity }}
        <button @click="viewAlimentDetails(aliment.id)">Ver Detalles</button>

        <button
            v-if="authStore.isAuthenticated && authStore.isDonator"
            @click="navigateToEditAliment(aliment.id)"
        >
            Editar
        </button>
      </li>
    </ul>
    <p v-else-if="!loading && !errorMessage">No hay alimentos disponibles.</p>
  </div>
</template>

<style scoped>
/* Agrega estilos específicos del componente aquí */
div button {
    margin-right: 10px; /* Espacio entre botones */
}

li button {
    margin-left: 10px; /* Espacio entre el texto del alimento y los botones */
}
</style>
