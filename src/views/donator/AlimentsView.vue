<template>
  <div>
    <div class="top-nav">
      <router-link to="/" class="home-link">Ir al Inicio</router-link>
    </div>

    <h2>Lista de Alimentos</h2>

    <div v-if="authStore.isAuthenticated && authStore.isDonator" class="action-buttons">
      <button @click="navigateToCreateAliment">Crear Nuevo Alimento</button>
      <button @click="navigateToCreateDonation">Crear Nueva Donación</button>
    </div>

    <p v-if="loading" class="info-message loading-message">Cargando alimentos...</p>
    <p v-else-if="errorMessage" class="info-message error-message">{{ errorMessage }}</p>
    <p v-else-if="aliments.length === 0" class="info-message no-aliments-message">No hay alimentos disponibles.</p>

    <ul v-else class="aliments-list">
      <li v-for="aliment in aliments" :key="aliment.id">
        <div class="aliment-details">
          <span class="aliment-name">{{ aliment.name }}</span> - Stock: <span class="aliment-stock">{{ aliment.lots }}</span>
        </div>
        
        <button
          v-if="authStore.isAuthenticated && authStore.isDonator"
          @click="navigateToEditAliment(aliment.id)"
          class="edit-button"
        >
          Editar
        </button>
      </li>
    </ul>
    
    <p class="footer-text">FAGIA © {{ new Date().getFullYear() }} - Sistema de Gestión de Alimentos.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/api/api';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const aliments = ref([]);
const loading = ref(true);
const errorMessage = ref('');

const navigateToEditAliment = (alimentId) => {
  // === LA CORRECCIÓN CLAVE ===
  // Convertimos el ID a un número entero para evitar problemas con decimales
  const cleanedAlimentId = parseInt(alimentId); 

  // Opcional: Verificación extra si el ID no es un número válido después de parseInt
  if (isNaN(cleanedAlimentId)) {
    console.error('Error: ID de alimento inválido o no numérico recibido:', alimentId);
    errorMessage.value = "Error al editar: ID de alimento inválido.";
    return; // Detener la navegación si el ID es inválido
  }

  router.push({ name: 'EditAliment', params: { id: cleanedAlimentId } });
};

const navigateToCreateAliment = () => {
  router.push({ name: 'CreateAliment' });
};

const navigateToCreateDonation = () => {
  router.push({ name: 'CreateDonation' });
};

const fetchAliments = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const response = await apiClient.get('/aliments', {
      headers: {
        Authorization: `Bearer ${authStore.token}` // Asegurar que el token se envíe
      }
    });
    aliments.value = response.data;
  } catch (error) {
    console.error('Error al obtener alimentos:', error);
    errorMessage.value = error.response?.data?.message || 'Error al cargar la lista de alimentos.';
    if (error.response?.status === 403) {
      errorMessage.value = 'No tienes permiso para ver esta lista.';
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (!authStore.isAuthenticated || !authStore.isDonator) {
    router.push('/login'); // Redirigir a login si no es donador autenticado
    return; // Detener ejecución
  } else {
    fetchAliments();
  }
});
</script>

<style scoped>
/* Contenedor principal de la vista, similar al dashboard */
div {
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  background-color: #f9f9f9; /* Fondo similar al dashboard */
}

h2 {
  text-align: center;
  color: #2c3e50; /* Color de título consistente */
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.top-nav {
  text-align: right;
  margin-bottom: 15px;
}
.home-link {
  color: #3498db; /* Color de enlace consistente */
  text-decoration: none;
  font-weight: bold;
  padding: 8px 15px;
  border-radius: 5px;
  transition: background-color 0.2s;
}
.home-link:hover {
  text-decoration: none;
  background-color: #eaf6ff; /* Fondo claro al pasar el ratón */
}

.action-buttons {
  text-align: center;
  margin-bottom: 25px;
  display: flex;
  justify-content: center;
  gap: 10px; /* Espacio entre botones */
  flex-wrap: wrap; /* Permite que los botones se envuelvan en pantallas pequeñas */
}
.action-buttons button {
  background-color: #28a745; /* Verde para acciones positivas */
  color: white;
  padding: 10px 18px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.95em;
  transition: background-color 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1); /* Sombra sutil */
}
.action-buttons button:hover {
  background-color: #218838;
}

/* Estilos para mensajes de información/estado */
.info-message {
  text-align: center;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 1.1em;
}

.loading-message {
  color: #28a745; /* Verde */
}

.error-message {
  color: #dc3545; /* Rojo */
  background-color: #f8d7da; /* Fondo rojo claro */
  border: 1px solid #f5c6cb;
}

.no-aliments-message {
  color: #664d03; /* Amarillo oscuro */
  background-color: #fff3cd; /* Fondo amarillo claro */
  border: 1px solid #ffecb5;
}


.aliments-list {
  list-style: none;
  padding: 0;
}
.aliments-list li {
  display: flex;
  align-items: center;
  justify-content: space-between; /* Alinea los elementos a los extremos */
  margin-bottom: 12px;
  border: 1px solid #ddd;
  padding: 12px 18px;
  border-radius: 6px;
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.aliments-list li:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0,0,0,0.1);
}
.aliment-details {
  flex-grow: 1; /* Permite que los detalles ocupen el espacio restante */
}
.aliment-name {
  font-weight: bold;
  color: #34495e; /* Color de texto consistente */
  margin-right: 10px;
  font-size: 1.1em;
}
.aliment-stock {
  font-weight: bold;
  color: #3498db; /* Azul para el stock, resaltado */
  font-size: 1.1em;
}

.edit-button {
  background-color: #3498db; /* Azul consistente para el botón de edición */
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background-color 0.2s;
  margin-left: 15px; /* Espacio a la izquierda del botón */
}
.edit-button:hover {
  background-color: #2980b9;
}

.footer-text {
  margin-top: 30px;
  font-size: 0.8em;
  color: #888;
  text-align: center;
  padding-top: 15px; /* Pequeño padding superior */
  border-top: 1px solid #eee; /* Línea separadora */
}
</style>