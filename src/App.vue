<template>
  <div id="app">
    <UserLogin v-if="!isAuthenticated" @login-success="handleLogin" />
    <div v-else class="welcome-container">
      <h2>Bienvenido, {{ username }}!</h2>
      <button @click="logout">Cerrar sesión</button>
    </div>
  </div>
</template>

<script>
import UserLogin from './components/UserLogin.vue';

export default {
  components: {
    UserLogin
  },
  data() {
    return {
      isAuthenticated: false,
      username: ''
    };
  },
  methods: {
    handleLogin(user) {
      this.isAuthenticated = true;
      this.username = user;
    },
    logout() {
      this.isAuthenticated = false;
      this.username = '';
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
}
</style>
