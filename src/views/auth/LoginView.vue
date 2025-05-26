<template>
  <div class="container">
    <h2>Iniciar Sesión</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">Email:</label>
        <input id="email" type="email" v-model="credentials.email" required />
      </div>
      <div class="form-group">
        <label for="password">Contraseña:</label>
        <input id="password" type="password" v-model="credentials.password" required />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Iniciando...' : 'Login' }}
      </button>
      <p v-if="error" class="error-message">{{ error }}</p>
    </form>

    <div class="mt-4 text-center">
      <p>
        ¿No tienes una cuenta?
        <router-link to="/register-donator" class="text-blue-600 hover:underline">
          Regístrate Aquí
        </router-link>
        </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const credentials = ref({
  email: '',
  password: '',
});
const loading = ref(false);
const error = ref(null);

const handleLogin = async () => {
  console.log('Función handleLogin iniciada.'); 
  loading.value = true;
  error.value = null;
  try {
    await authStore.login(credentials.value);

  } catch (err) {
    if (err.response && err.response.data) {
        error.value = err.response.data.message || 'Credenciales incorrectas o error en el servidor.';
    } else {
        error.value = err.message || 'Error al iniciar sesión. Verifica tu conexión.';
    }
    console.error("Error en LoginView:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (authStore.isAuthenticated) {
    if (authStore.userRole === 'donator') {
      router.push('/donator/dashboard');
    } else if (authStore.userRole === 'beneficiary') {
      router.push('/beneficiary/dashboard');
    } else {
      router.push('/donations');
    }
  }
});
</script>

<style scoped>
.container {
  max-width: 400px; 
  margin: 40px auto; 
  padding: 20px;
  border: 1px solid #eee; 
  border-radius: 8px; 
  box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
  background-color: #fff; 
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
  font-size: 1.8em;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 10px; 
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 1em;
}

.form-group input:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
}

button[type="submit"] {
  background-color: #007bff; 
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  width: 100%; 
  transition: background-color 0.2s ease-in-out;
}

button[type="submit"]:hover {
  background-color: #0056b3; 
}

button[type="submit"]:disabled {
  background-color: #6c757d; 
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb; 
  padding: 10px;
  border-radius: 4px;
  margin-top: 15px;
  text-align: center;
}


.mt-4 {
  margin-top: 1.5rem; 
}
.text-center {
  text-align: center;
}
.text-blue-600 {
  color: #007bff; 
}
.hover\:underline:hover {
  text-decoration: underline;
}
</style>