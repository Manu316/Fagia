<template>
    <div class="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <div class="flex justify-between items-center mb-6 border-b border-gray-300 pb-3">
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">Gestión de Alimentos</h1>
          <button @click="openCreateModal" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out flex items-center text-sm sm:text-base">
              <svg class="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
              Añadir Alimento
          </button>
      </div>
  
      <div v-if="alimentStore.isLoading" class="text-center py-10 text-gray-500">
          <svg class="animate-spin h-8 w-8 text-blue-600 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando alimentos...
      </div>
  
      <div v-else-if="alimentStore.error && !alimentStore.aliments.length" class="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded-md text-center">
          <p class="font-semibold">Error al cargar alimentos:</p>
          <p class="text-sm">{{ alimentStore.error }}</p>
          <button @click="retryLoadAliments" class="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">Reintentar</button>
      </div>
  
      <div v-else-if="alimentStore.aliments.length > 0" class="overflow-x-auto relative shadow-md sm:rounded-lg border border-gray-200">
          <table class="w-full text-sm text-left text-gray-500">
              <thead class="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                      <th scope="col" class="px-6 py-3">Nombre</th>
                      <th scope="col" class="px-6 py-3">Descripción</th>
                      <th scope="col" class="px-6 py-3">Tipo Cantidad</th>
                      <th scope="col" class="px-6 py-3 text-right">Acciones</th>
                  </tr>
              </thead>
              <tbody>
                  <tr v-for="aliment in alimentStore.aliments" :key="aliment.id" class="bg-white border-b hover:bg-gray-50 transition duration-150 ease-in-out">
                      <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{{ aliment.name }}</th>
                      <td class="px-6 py-4">{{ aliment.description || '-' }}</td>
                      <td class="px-6 py-4">{{ aliment.quantity_type }}</td>
                      <td class="px-6 py-4 text-right whitespace-nowrap space-x-2">
                          <button @click="openEditModal(aliment)" title="Editar" class="font-medium text-indigo-600 hover:text-indigo-800 hover:underline">Editar</button>
                          <button @click="confirmDelete(aliment.id)" title="Eliminar" class="font-medium text-red-600 hover:text-red-800 hover:underline">Eliminar</button>
                      </td>
                  </tr>
              </tbody>
          </table>
      </div>
  
      <div v-else class="text-center py-16 text-gray-500 border border-dashed border-gray-300 rounded-lg">
          <svg class="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
          <p class="font-semibold">No hay alimentos registrados.</p>
          <p class="text-sm mt-1">Puedes empezar añadiendo uno nuevo.</p>
      </div>
  
      <div v-if="showModal" class="fixed inset-0 bg-gray-800 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center z-50 px-4" @click.self="closeModal">
          <div class="relative mx-auto p-6 border w-full max-w-lg shadow-xl rounded-md bg-white">
              <div class="flex justify-between items-center border-b pb-3 mb-4">
                  <h3 class="text-xl font-semibold text-gray-800">{{ isEditing ? 'Editar Alimento' : 'Añadir Nuevo Alimento' }}</h3>
                  <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
              </div>
              <form @submit.prevent="handleSubmit" class="space-y-4">
                  <div>
                      <label for="name" class="block text-sm font-medium text-gray-700">Nombre <span class="text-red-500">*</span></label>
                      <input type="text" id="name" v-model="currentAliment.name" required class="modal-input-field" placeholder="Ej: Arroz Blanco">
                  </div>
                  <div>
                      <label for="description" class="block text-sm font-medium text-gray-700">Descripción</label>
                      <textarea id="description" v-model="currentAliment.description" rows="3" class="modal-input-field" placeholder="Ej: Bolsa de 1kg, Grano Largo"></textarea>
                  </div>
                   <div>
                      <label for="quantity_type" class="block text-sm font-medium text-gray-700">Tipo de Cantidad <span class="text-red-500">*</span></label>
                      <input type="text" id="quantity_type" v-model="currentAliment.quantity_type" required class="modal-input-field" placeholder="Ej: kg, unidad, litro, paquete">
                       <p class="text-xs text-gray-500 mt-1">Indica cómo se mide este alimento (kilogramo, unidad, etc.).</p>
                  </div>
                   <div v-if="modalError" class="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                      {{ modalError }}
                   </div>
                   <div class="flex justify-end space-x-3 pt-4 border-t mt-6">
                      <button type="button" @click="closeModal" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition duration-150 ease-in-out">
                          Cancelar
                      </button>
                      <button type="submit" :disabled="isSubmitting || !currentAliment.name || !currentAliment.quantity_type" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed flex items-center transition duration-150 ease-in-out">
                           <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                             <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                             <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                          <span>{{ isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar Cambios' : 'Crear Alimento') }}</span>
                      </button>
                  </div>
              </form>
          </div>
      </div>
  
      <div v-if="showDeleteConfirm" class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 px-4">
          <div class="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
              <h4 class="text-lg font-semibold text-gray-800 mb-2">Confirmar Eliminación</h4>
              <p class="text-sm text-gray-600 mb-4">¿Estás seguro de que deseas eliminar el alimento "{{ alimentToDelete?.name }}"? Esta acción no se puede deshacer.</p>
               <div v-if="deleteError" class="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                  {{ deleteError }}
               </div>
              <div class="flex justify-end space-x-3">
                  <button @click="cancelDelete" :disabled="isDeleting" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-60">
                      Cancelar
                  </button>
                  <button @click="executeDelete" :disabled="isDeleting" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-60 flex items-center">
                       <svg v-if="isDeleting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                         <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                         <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                       </svg>
                      {{ isDeleting ? 'Eliminando...' : 'Sí, Eliminar' }}
                  </button>
              </div>
          </div>
      </div>
  
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, reactive } from 'vue';
  import { useAlimentStore } from '@/stores/authStore'; // Importa el store de alimentos
  // import { useAuthStore } from '@/store/auth'; // Importa si necesitas roles
  
  const alimentStore = useAlimentStore();
  // const authStore = useAuthStore(); // Descomenta si usas roles
  
  // Estado del Modal Principal (Crear/Editar)
  const showModal = ref(false);
  const isEditing = ref(false);
  const isSubmitting = ref(false); // Estado de carga para el formulario del modal
  const modalError = ref(null); // Errores específicos del formulario del modal
  const currentAliment = reactive({ // Usamos reactive para el objeto del formulario
    id: null,
    name: '',
    description: '',
    quantity_type: ''
  });
  
  // Estado del Diálogo de Confirmación de Eliminación
  const showDeleteConfirm = ref(false);
  const isDeleting = ref(false); // Estado de carga para la eliminación
  const deleteError = ref(null); // Errores específicos de la eliminación
  const alimentToDelete = ref(null); // Alimento seleccionado para eliminar
  
  // Carga los alimentos al montar el componente
  onMounted(() => {
    alimentStore.loadAliments();
  });
  
  // Recargar alimentos
  const retryLoadAliments = () => {
      alimentStore.loadAliments(true); // Forzar recarga
  }
  
  // --- Funciones del Modal Crear/Editar ---
  const resetForm = () => {
      currentAliment.id = null;
      currentAliment.name = '';
      currentAliment.description = '';
      currentAliment.quantity_type = '';
      isEditing.value = false;
      modalError.value = null;
      isSubmitting.value = false;
  };
  
  const openCreateModal = () => {
      resetForm();
      showModal.value = true;
  };
  
  const openEditModal = (aliment) => {
      resetForm();
      isEditing.value = true;
      // Copia profunda para evitar modificar el original directamente si se cancela
      Object.assign(currentAliment, JSON.parse(JSON.stringify(aliment)));
      showModal.value = true;
  };
  
  const closeModal = () => {
      showModal.value = false;
      // No resetear aquí si queremos mantener los datos al reabrir tras error
      // resetForm();
  };
  
  const handleSubmit = async () => {
      isSubmitting.value = true;
      modalError.value = null;
      try {
          // Prepara los datos a enviar (excluye el id si no es necesario por la API)
          const dataToSend = {
              name: currentAliment.name,
              description: currentAliment.description,
              quantity_type: currentAliment.quantity_type
          };
  
          if (isEditing.value) {
              await alimentStore.updateAliment(currentAliment.id, dataToSend);
          } else {
              await alimentStore.createAliment(dataToSend);
          }
          closeModal(); // Cierra el modal si tiene éxito
          resetForm(); // Resetea el formulario después de cerrar
      } catch (error) {
           console.error("Error al guardar alimento:", error);
           // Intenta obtener el mensaje de error de la respuesta
           modalError.value = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Error desconocido al guardar el alimento.';
      } finally {
          isSubmitting.value = false;
      }
  };
  
  // --- Funciones del Diálogo de Eliminación ---
  const confirmDelete = (id) => {
      const aliment = alimentStore.aliments.find(a => a.id === id);
      if (aliment) {
          alimentToDelete.value = aliment; // Guarda el alimento para mostrar nombre
          deleteError.value = null; // Limpia errores previos
          isDeleting.value = false; // Resetea estado de carga
          showDeleteConfirm.value = true; // Muestra el diálogo
      } else {
          console.error(`No se encontró el alimento con ID ${id} para eliminar.`);
      }
  };
  
  const cancelDelete = () => {
      showDeleteConfirm.value = false;
      alimentToDelete.value = null;
      deleteError.value = null;
      isDeleting.value = false;
  };
  
  const executeDelete = async () => {
      if (!alimentToDelete.value) return;
  
      isDeleting.value = true;
      deleteError.value = null;
      try {
          await alimentStore.deleteAliment(alimentToDelete.value.id);
          // Si tiene éxito, cierra el diálogo
          cancelDelete();
          // Opcional: Mostrar notificación de éxito (ej: usando toast)
      } catch (error) {
          console.error("Error al eliminar alimento:", error);
          deleteError.value = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Error desconocido al eliminar.';
          // No cierra el diálogo para mostrar el error
      } finally {
          isDeleting.value = false;
      }
  };
  
  // Clases comunes para inputs del modal para DRY
  //const modalInputFieldClass = computed(() =>
   // 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100'
  //);
  
  </script>
  
  <style scoped>
  /* Clases de utilidad para inputs (si no usas @apply de Tailwind) */
  .modal-input-field {
      margin-top: 0.25rem;
      display: block;
      width: 100%;
      padding-left: 0.75rem;
      padding-right: 0.75rem;
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
      border-width: 1px;
      border-color: #d1d5db; /* gray-300 */
      border-radius: 0.375rem; /* rounded-md */
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
  }
  .modal-input-field:focus {
      outline: none;
      box-shadow: 0 0 0 2px #6366f1; /* focus:ring-indigo-500 */
      border-color: #6366f1; /* focus:border-indigo-500 */
  }
  .modal-input-field:disabled {
      background-color: #f3f4f6; /* disabled:bg-gray-100 */
  }
  
  /* Asegurar que la tabla no colapse en pantallas pequeñas */
  /* table {
      table-layout: fixed;
      word-wrap: break-word;
  } */
  </style>
  