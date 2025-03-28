<template>
  <div id="app">
    <!-- Mostrar el formulario de inicio de sesión si no está autenticado y no se está mostrando el registro -->
    <UserLogin 
      v-if="!isAuthenticated && !showRegister" 
      @login-success="handleLogin" 
      @show-register="showRegisterForm" 
    />
    
    <!-- Mostrar el formulario de registro si `showRegister` es true -->
    <UserRegister 
      v-if="showRegister" 
      @register-success="handleRegisterSuccess" 
      @show-login="showLoginForm" 
    />
    
    <!-- Mostrar la vista de bienvenida si el usuario está autenticado -->
    <div v-else-if="isAuthenticated" class="welcome-container">
      <h2>Bienvenido, {{ username }}!</h2>
      <button @click="logout">Cerrar sesión</button>
    </div>
  </div>
</template>

<script>
import UserLogin from './components/UserLogin.vue';
import UserRegister from './components/UserRegister.vue';

export default {
  components: {
    UserLogin,
    UserRegister
  },
  data() {
    return {
      isAuthenticated: false,
      username: '',
      showRegister: false
    };
  },
  methods: {
    // Manejar el éxito del inicio de sesión
    handleLogin(user) {
      this.isAuthenticated = true;
      this.username = user;
      localStorage.setItem('user', JSON.stringify({ isAuthenticated: true, username: user }));
    },
    // Manejar el éxito del registro
    handleRegisterSuccess() {
      this.showRegister = false;
    },
    // Mostrar el formulario de registro
    showRegisterForm() {
      this.showRegister = true;
    },
    // Mostrar el formulario de inicio de sesión
    showLoginForm() {
      this.showRegister = false;
    },
    // Cerrar sesión
    logout() {
      this.isAuthenticated = false;
      this.username = '';
      this.showRegister = false;
      localStorage.removeItem('user');
    }
  },
  created() {
    // Verificar si el usuario está autenticado desde el localStorage
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (savedUser?.isAuthenticated) {
      this.isAuthenticated = true;
      this.username = savedUser.username;
    }
  }
};
</script>

<style>
#app {
  text-align: center;
  font-family: Arial, sans-serif;
}
.welcome-container {
  max-width: 300px;
  margin: auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  background-color: #1C1C1C;
  color: white;
}
button {
  background-color: #4A6D69;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
}
</style>
