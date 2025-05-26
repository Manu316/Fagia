<template>
  <div>
    <h1>Vista de Donaciones del Beneficiario</h1>
    <p>Este componente mostrará las donaciones recibidas por el beneficiario.</p>
    </div>
</template>

<script setup>
// import { ref, onMounted } from 'vue';
// import apiClient from '@/api/api';
// import { useAuthStore } from '@/stores/authStore';
// import { useRouter } from 'vue-router';

// const authStore = useAuthStore();
// const router = useRouter();
// const donations = ref([]);
// const loading = ref(true);
// const errorMessage = ref('');

// onMounted(async () => {
//   if (!authStore.isAuthenticated || !authStore.isBeneficiary) {
//     router.push('/');
//     return;
//   }
//   try {
//     // Asumo que tienes un endpoint para que el beneficiario vea sus donaciones
//     // Tu backend ya tiene /donation (GET) y /beneficiary/donation/filter/{days}
//     // Puedes usar /donation directamente para ver todas las donaciones del usuario autenticado
//     const response = await apiClient.get('/donation'); // O '/beneficiary/donation/filter/365'
//     donations.value = response.data;
//   } catch (error) {
//     console.error("Error al cargar donaciones del beneficiario:", error);
//     errorMessage.value = error.response?.data?.message || "Error al cargar donaciones.";
//   } finally {
//     loading.value = false;
//   }
// });
</script>

<style scoped>
h1 {
  color: #007bff;
}
div {
  padding: 20px;
  max-width: 800px;
  margin: 20px auto;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>