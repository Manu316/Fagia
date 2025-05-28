<template>
  <div>
    <h2>Eliminar Cuenta</h2>
    <p>Esta acción eliminará permanentemente tu cuenta y todos los datos asociados.</p>
    <button @click="confirmDelete" class="delete-button">Eliminar Cuenta</button>

    <div v-if="showConfirmModal" class="modal">
      <div class="modal-content">
        <p>¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.</p>
        <button @click="deleteUserAccount">Sí, eliminar</button>
        <button @click="cancelDelete">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script>
import authService from '@/api/authService';
import { useAuthStore } from '@/stores/authStore'; // Asumiendo que usas Pinia para el estado de autenticación
import { useRouter } from 'vue-router';

export default {
  data() {
    return {
      showConfirmModal: false,
    };
  },
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    return { authStore, router };
  },
  methods: {
    confirmDelete() {
      this.showConfirmModal = true;
    },
    cancelDelete() {
      this.showConfirmModal = false;
    },
    async deleteUserAccount() {
      try {
        const userId = this.authStore.user.id; // Asumiendo que el ID del usuario está en el store
        await authService.deleteAccount(userId);
        alert('Tu cuenta ha sido eliminada exitosamente.');
        this.authStore.logout(); // Cerrar sesión después de eliminar la cuenta
        this.router.push('/login'); // Redirigir a la página de inicio de sesión
      } catch (error) {
        console.error('Error al eliminar la cuenta:', error);
        alert('Error al eliminar la cuenta. Por favor, inténtalo de nuevo.');
      } finally {
        this.showConfirmModal = false;
      }
    },
  },
};
</script>

<style scoped>
/* Estilos básicos para el botón y el modal */
.delete-button {
  background-color: red;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}
</style>