<template>
  <div class="dashboard-donator aliments-view-container">
    <h2>Gestión de Alimentos</h2>

    <div class="dashboard-actions action-links-container">
      <router-link to="/donator/dashboard" class="action-link">Volver al Panel</router-link>
      <router-link to="/donator/aliments/create" class="action-link create-button">Crear Nuevo Alimento</router-link>
      <router-link to="/donator/donations/create" class="action-link create-button">Crear Donación</router-link>
    </div>

    <p v-if="!authStore.isAuthenticated || !authStore.isDonator" class="info-message error-message">
      Debes iniciar sesión como donador para gestionar alimentos.
    </p>

    <p v-if="loading && (authStore.isAuthenticated && authStore.isDonator)" class="info-message loading-message">Cargando alimentos...</p>
    <p v-if="errorMessage && !loading" class="info-message error-message">{{ errorMessage }}</p>
    <p v-if="successMessage" class="info-message success-message">{{ successMessage }}</p>


    <div v-if="!loading && !errorMessage && (authStore.isAuthenticated && authStore.isDonator)" class="aliments-list">
      <div v-if="aliments.length === 0" class="info-message">No tienes alimentos registrados.</div>
      <ul v-else class="aliments-ul">
        <li v-for="aliment in aliments" :key="aliment.id" class="aliment-item">
          <div class="aliment-info">
            <span class="aliment-name">{{ aliment.name }}</span>
            <span class="aliment-type">{{ aliment.r_type }}</span>
            <span class="aliment-lots">Stock: {{ aliment.lots }}</span>
            <span class="aliment-caducity">Caducidad: {{ formatDate(aliment.caducity_date) }}</span>
          </div>
          <div class="item-actions">
            <button @click="confirmDelete(aliment.id)" class="action-link delete-button">Eliminar</button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import donatorService from '@/api/donatorService';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
import { format } from 'date-fns';

const authStore = useAuthStore();
const router = useRouter();

const aliments = ref([]);
const loading = ref(true);
const errorMessage = ref('');
const successMessage = ref('');

onMounted(() => {
  if (!authStore.isAuthenticated || !authStore.isDonator) {
    router.push('/login');
    return;
  }
  fetchAliments();
});

const fetchAliments = async () => {
  loading.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  try {
    const response = await donatorService.getAliments();
    aliments.value = response.data;
  } catch (error) {
    console.error('Error al cargar alimentos:', error);
    errorMessage.value = error.response?.data?.message || 'Error al cargar los alimentos. Inténtalo de nuevo.';
  } finally {
    loading.value = false;
  }
};

const confirmDelete = async (id) => {
  if (confirm('¿Estás seguro de que quieres eliminar este alimento?')) {
    await deleteAliment(id);
  }
};

const deleteAliment = async (id) => {
  loading.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  try {
    await donatorService.deleteAliment(id);
    successMessage.value = 'Alimento eliminado exitosamente.';
    fetchAliments(); // Recargar la lista de alimentos
  } catch (error) {
    console.error('Error al eliminar alimento:', error);
    errorMessage.value = error.response?.data?.message || 'Error al eliminar el alimento. Inténtalo de nuevo.';
    if (error.response?.status === 403) {
      errorMessage.value = 'No tienes permiso para eliminar este alimento.';
    } else if (error.response?.status === 404) {
      errorMessage.value = 'Alimento no encontrado para eliminar.';
    }
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), 'dd/MM/yyyy');
  } catch (e) {
    return dateString; // En caso de fecha inválida, devuelve el string original
  }
};
</script>

<style scoped>
/* Estilos del contenedor principal, consistentes con los ejemplos del dashboard */
.dashboard-donator {
  max-width: 900px;
  margin: 20px auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

/* Contenedor para los botones de acción (volver al panel, crear nuevo) */
.action-links-container {
  display: flex;
  justify-content: space-between; /* Alinea un botón a la izquierda y otro a la derecha */
  margin-bottom: 20px;
  gap: 10px; /* Espacio entre los botones */
  flex-wrap: wrap; /* Permite que los botones se envuelvan en pantallas pequeñas */
}

/* Reutilizando 'action-link' para la consistencia con otros botones */
.action-link {
  display: inline-block;
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-size: 0.95em;
  transition: background-color 0.3s ease;
  text-align: center;
  border: none;
  cursor: pointer;
  flex-shrink: 0; /* Evita que los botones se encojan */
}

.action-link:hover {
  background-color: #2980b9;
}

/* Estilos específicos para el botón "Crear Nuevo Alimento" y ahora "Crear Donación" */
.create-button {
  background-color: #28a745; /* Verde para la acción de crear */
}

.create-button:hover {
  background-color: #218838;
}

/* Se elimina el estilo .create-donation-button ya que no es necesario */

/* Estilos para la lista de alimentos */
.aliments-list {
  background-color: #ffffff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.aliments-ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.aliment-item {
  display: flex;
  flex-wrap: wrap; /* Permite que los elementos se envuelvan */
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
  font-size: 1em;
}

.aliment-item:last-child {
  border-bottom: none; /* Eliminar el borde inferior del último elemento */
}

.aliment-info {
  display: flex;
  flex-wrap: wrap; /* Permite que la información se envuelva */
  gap: 15px; /* Espacio entre los elementos de información */
  flex-grow: 1; /* Permite que la información ocupe el espacio disponible */
}

.aliment-name {
  font-weight: bold;
  color: #2c3e50;
  flex-basis: 100%; /* Nombre ocupa toda la línea en móvil */
  font-size: 1.1em;
}

.aliment-type,
.aliment-lots,
.aliment-caducity {
  color: #555;
  font-size: 0.95em;
}

.item-actions {
  display: flex;
  gap: 10px; /* Espacio entre los botones de acción */
  margin-top: 10px; /* Espacio superior para móvil si se envuelven */
}

/* Se elimina el estilo .edit-button ya que el botón fue removido */

.delete-button {
  background-color: #dc3545; /* Rojo para eliminar */
}

.delete-button:hover {
  background-color: #c82333;
}

/* Estilos para mensajes de información/estado (cargando, error, éxito) */
.info-message {
  text-align: center;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 1.1em;
}

.loading-message {
  color: #28a745; /* Texto verde */
}

.error-message {
  color: #dc3545; /* Texto rojo */
  background-color: #f8d7da; /* Fondo rojo claro */
  border: 1px solid #f5c6cb;
}

.success-message {
  color: #155724; /* Texto verde oscuro */
  background-color: #d4edda; /* Fondo verde claro */
  border: 1px solid #c3e6cb;
}

/* Media Queries para responsividad */
@media (min-width: 768px) {
  .aliment-info {
    flex-basis: auto; /* Restaura el comportamiento en pantallas más grandes */
    flex-grow: 0;
  }
  .aliment-name {
    flex-basis: auto; /* Restaura el comportamiento en pantallas más grandes */
  }
  .item-actions {
    margin-top: 0; /* Elimina el margen superior en pantallas grandes */
  }
}
</style>