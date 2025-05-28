<template>
  <div class="dashboard-donator edit-aliment-container">
    <h2>Editar Alimento</h2>

    <div class="dashboard-actions back-link-container">
      <router-link to="/donator/dashboard" class="action-link">Volver al Panel</router-link>
    </div>

    <p v-if="!authStore.isAuthenticated || !authStore.isDonator" class="info-message error-message">
      Debes iniciar sesión como donador para editar alimentos.
    </p>

    <p v-if="loading && (authStore.isAuthenticated && authStore.isDonator)" class="info-message loading-message">Cargando datos del alimento...</p>
    <p v-if="errorMessage && !loading" class="info-message error-message">{{ errorMessage }}</p>

    <form v-if="!loading && !errorMessage && (authStore.isAuthenticated && authStore.isDonator)" @submit.prevent="updateAliment" class="aliment-form">
      <div class="form-group">
        <label for="name">Nombre del Alimento:</label>
        <input type="text" id="name" v-model="formData.name" readonly class="form-input read-only-input">
      </div>
      <div class="form-group">
        <label for="r_type">Tipo de Alimento:</label>
        <input type="text" id="r_type" v-model="formData.r_type" readonly class="form-input read-only-input">
      </div>
      <div class="form-group">
        <label for="description">Descripción:</label>
        <textarea id="description" v-model="formData.description" readonly class="form-input read-only-input"></textarea>
      </div>
      <div class="form-group">
        <label for="caducity_date">Fecha de Caducidad:</label>
        <input type="date" id="caducity_date" v-model="formData.caducity_date" readonly class="form-input read-only-input">
      </div>

      <div class="form-group">
        <label for="lots">Número de Lotes (Stock):</label>
        <input type="number" id="lots" v-model.number="formData.lots" required min="0" class="form-input editable-input">
      </div>

      <button type="submit" :disabled="loading" class="action-link save-button">
        {{ loading ? 'Actualizando...' : 'Guardar Cambios de Stock' }}
      </button>
    </form>

    <p v-if="successMessage" class="info-message success-message">{{ successMessage }}</p>
  </div>
</template>

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
    router.push('/login'); // Redirigir a la página de inicio de sesión si no está autenticado o no es un donador
    return; // Detener la ejecución
  }

  if (alimentId) {
    fetchAlimentData();
  } else {
    errorMessage.value = "ID de alimento no proporcionado en la URL. No se puede cargar el alimento.";
    loading.value = false;
  }
});

const fetchAlimentData = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const response = await apiClient.get(`/aliments/${alimentId}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}` // Asegurar que el token se envíe
      }
    });
    formData.value.name = response.data.name;
    formData.value.r_type = response.data.r_type;
    formData.value.description = response.data.description;
    formData.value.lots = response.data.lots;
    // Formatear la fecha para input type="date" (YYYY-MM-DD)
    formData.value.caducity_date = response.data.caducity_date ? new Date(response.data.caducity_date).toISOString().split('T')[0] : '';

  } catch (error) {
    console.error('Error al cargar datos del alimento para editar:', error);
    errorMessage.value = error.response?.data?.message || 'Error al cargar los datos del alimento. Inténtalo de nuevo.';
    if (error.response?.status === 404) {
      errorMessage.value = 'Alimento no encontrado o no pertenece a tu cuenta.';
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
  loading.value = true; // Solo establecer loading en true para la operación de actualización

  if (!authStore.isAuthenticated || !authStore.isDonator) {
    errorMessage.value = "No tienes permiso para editar alimentos.";
    loading.value = false;
    return;
  }

  // Validación del lado del cliente para lotes
  if (formData.value.lots < 0) {
    errorMessage.value = "El número de lotes no puede ser negativo.";
    loading.value = false;
    return;
  }

  try {
    const dataToSend = {
      lots: parseInt(formData.value.lots),
    };

    // La variable 'response' ya no se asigna si no se usa, lo que resuelve el error de ESLint
    await apiClient.put(`/aliments/${alimentId}`, dataToSend, {
      headers: {
        Authorization: `Bearer ${authStore.token}` // Asegurar que el token se envíe
      }
    });
    successMessage.value = 'Stock del alimento actualizado exitosamente.';
    // Podrías querer volver a cargar los datos aquí o redirigir si es necesario
    // fetchAlimentData(); // Opcionalmente, volver a obtener los datos para confirmar la actualización
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

/* Contenedor para el botón "Volver al Panel" */
.back-link-container {
  display: flex;
  justify-content: flex-start; /* Alinea el contenido a la izquierda */
  margin-bottom: 20px;
}

/* Reutilizando 'action-link' para la consistencia con otros botones */
.action-link {
  display: inline-block;
  padding: 10px 20px; /* Padding ligeramente más pequeño para botones de navegación */
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-size: 0.95em;
  transition: background-color 0.3s ease;
  text-align: center;
  border: none;
  cursor: pointer;
}

.action-link:hover {
  background-color: #2980b9;
}

/* Estilos para el botón "Guardar Cambios de Stock" */
.save-button {
  background-color: #28a745; /* Verde para el botón de guardar */
  padding: 12px 25px; /* Padding más grande para el botón de acción principal */
  font-size: 1em;
  width: 100%; /* Hace que el botón ocupe todo el ancho de su contenedor */
  margin-top: 20px; /* Espacio encima del botón */
}

.save-button:hover {
  background-color: #218838;
}

.save-button:disabled {
  background-color: #cccccc; /* Gris cuando está deshabilitado */
  cursor: not-allowed;
}

/* Estilos del contenedor del formulario */
.aliment-form {
  background-color: #ffffff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

/* Estilos para cada grupo de formulario (etiqueta + input) */
.form-group {
  margin-bottom: 18px; /* Espacio entre campos del formulario */
}

.form-group label {
  display: block; /* Hace que la etiqueta ocupe su propia línea */
  margin-bottom: 8px; /* Espacio entre la etiqueta y el input */
  font-weight: bold;
  color: #34495e;
}

/* Estilos para todos los campos de entrada y áreas de texto */
.form-input {
  width: 100%; /* Hace que los inputs ocupen todo el ancho de su contenedor */
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1em;
  box-sizing: border-box; /* Asegura que el padding y el borde se incluyan en el ancho/alto total */
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-input:focus {
  border-color: #3498db; /* Borde azul al enfocar */
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2); /* Sombra suave al enfocar */
  outline: none; /* Elimina el contorno predeterminado del navegador */
}

/* Estilos específicos para inputs de solo lectura */
.read-only-input {
  background-color: #e9ecef; /* Fondo más claro para indicar solo lectura */
  color: #6c757d; /* Color de texto ligeramente apagado */
  cursor: default; /* Cambia el cursor a predeterminado, no de selección de texto */
  border-style: dashed; /* Pista visual: borde discontinuo */
}

/* Estilos específicos para inputs editables */
.editable-input {
  background-color: #fff;
  color: #2c3e50;
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
</style>